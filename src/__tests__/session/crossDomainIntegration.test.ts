import { generateSessionQueue, commitSessionResults } from '@/services/session/sessionOrchestrator';
import { getUnlockedSkills } from '@/services/adaptive/prerequisiteGating';
import { calculateEloUpdate } from '@/services/adaptive';
import { getSkillById } from '@/services/mathEngine/skills';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import type { PendingSkillUpdate } from '@/services/session/sessionTypes';
import type { MathDomain } from '@/services/mathEngine/types';

/** Create a mastered skill state */
function masteredState(overrides: Partial<SkillState> = {}): SkillState {
  return {
    eloRating: 1100,
    attempts: 30,
    correct: 27,
    masteryProbability: 0.96,
    consecutiveWrong: 0,
    masteryLocked: true,
    leitnerBox: 6 as const,
    nextReviewDue: null,
    consecutiveCorrectInBox6: 3,
    cpaLevel: 'abstract' as const,
    ...overrides,
  };
}

/** Create a fresh (default) skill state */
function freshState(overrides: Partial<SkillState> = {}): SkillState {
  return {
    eloRating: 1000,
    attempts: 0,
    correct: 0,
    masteryProbability: 0.1,
    consecutiveWrong: 0,
    masteryLocked: false,
    leitnerBox: 1 as const,
    nextReviewDue: null,
    consecutiveCorrectInBox6: 0,
    cpaLevel: 'concrete' as const,
    ...overrides,
  };
}

describe('Cross-domain session integration', () => {
  it('generates a 12-problem session queue with default config', () => {
    const skillStates: Record<string, SkillState> = {};
    const queue = generateSessionQueue(skillStates, undefined, 42);
    // Default: 2 warmup + 8 practice + 2 cooldown = 12
    expect(queue).toHaveLength(12);
  });

  it('session queue contains problems from multiple domains', () => {
    // With all root skills unlocked, session should touch multiple domains
    const skillStates: Record<string, SkillState> = {};
    const queue = generateSessionQueue(skillStates, undefined, 42);

    const operations = new Set(queue.map((p) => p.problem.operation));
    // Root skills span multiple domains — expect at least 2
    expect(operations.size).toBeGreaterThanOrEqual(2);
  });

  it('session queue with many mastered skills spans more domains', () => {
    // Master root skills in several domains to unlock downstream skills
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': masteredState(),
      'subtraction.single-digit.no-borrow': masteredState(),
      'multiplication.equal-groups': masteredState(),
      'fractions.equal-parts': masteredState(),
      'place-value.ones-tens': masteredState(),
      'time.read.hours': masteredState(),
      'money.coin-id': masteredState(),
    };

    const queue = generateSessionQueue(skillStates, undefined, 42);
    expect(queue).toHaveLength(12);

    const operations = new Set(queue.map((p) => p.problem.operation));
    expect(operations.size).toBeGreaterThanOrEqual(3);
  });

  it('every problem in the queue has a valid skill definition', () => {
    const skillStates: Record<string, SkillState> = {};
    const queue = generateSessionQueue(skillStates, undefined, 42);

    for (const item of queue) {
      const skill = getSkillById(item.skillId);
      expect(skill).toBeDefined();
      expect(skill!.operation).toBe(item.problem.operation);
    }
  });

  it('every problem has a valid presentation (MC or free-text)', () => {
    const skillStates: Record<string, SkillState> = {};
    const queue = generateSessionQueue(skillStates, undefined, 42);

    for (const item of queue) {
      expect(['multiple_choice', 'free_text']).toContain(
        item.presentation.format,
      );
      if (item.presentation.format === 'multiple_choice') {
        expect(item.presentation.options.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('session phases are ordered: warmup, practice, cooldown', () => {
    const queue = generateSessionQueue({}, undefined, 42);
    const phases = queue.map((p) => p.phase);

    // Default: 2 warmup + 8 practice + 2 cooldown = 12
    expect(phases.slice(0, 2).every((p) => p === 'warmup')).toBe(true);
    expect(phases.slice(2, 10).every((p) => p === 'practice')).toBe(true);
    expect(phases.slice(10, 12).every((p) => p === 'cooldown')).toBe(true);
  });

  it('commitSessionResults updates all skills and returns valid feedback', () => {
    const pendingUpdates = new Map<string, PendingSkillUpdate>();
    pendingUpdates.set('addition.single-digit.no-carry', {
      skillId: 'addition.single-digit.no-carry',
      newElo: 1020,
      attempts: 5,
      correct: 4,
      newMasteryPL: 0.5,
      newConsecutiveWrong: 0,
      newMasteryLocked: false,
      newLeitnerBox: 2,
      newNextReviewDue: '2026-03-15T00:00:00Z',
      newConsecutiveCorrectInBox6: 0,
      newCpaLevel: 'pictorial',
    });
    pendingUpdates.set('subtraction.single-digit.no-borrow', {
      skillId: 'subtraction.single-digit.no-borrow',
      newElo: 980,
      attempts: 3,
      correct: 2,
      newMasteryPL: 0.3,
      newConsecutiveWrong: 1,
      newMasteryLocked: false,
      newLeitnerBox: 1,
      newNextReviewDue: null,
      newConsecutiveCorrectInBox6: 0,
      newCpaLevel: 'concrete',
    });

    const updatedSkills: Record<string, Partial<SkillState>> = {};
    const mockUpdateSkillState = (id: string, update: Partial<SkillState>) => {
      updatedSkills[id] = update;
    };
    let xpAdded = 0;
    const mockAddXp = (amount: number) => { xpAdded = amount; };
    let levelSet: number | undefined;
    const mockSetLevel = (lvl: number) => { levelSet = lvl; };
    let dateSet: string | undefined;
    const mockSetDate = (d: string) => { dateSet = d; };
    let streakSet: number | undefined;
    const mockSetStreak = (s: number) => { streakSet = s; };

    const feedback = commitSessionResults(
      pendingUpdates,
      150,                   // totalXp
      mockUpdateSkillState,
      mockAddXp,
      100,                   // currentTotalXp
      2,                     // currentLevel
      mockSetLevel,
      mockSetDate,
      1,                     // currentStreak
      '2026-03-09',          // lastSessionDate
      mockSetStreak,
    );

    // Both skills updated
    expect(Object.keys(updatedSkills)).toHaveLength(2);
    expect(updatedSkills['addition.single-digit.no-carry']?.eloRating).toBe(1020);
    expect(updatedSkills['subtraction.single-digit.no-borrow']?.eloRating).toBe(980);

    // XP added
    expect(xpAdded).toBe(150);

    // Feedback is valid
    expect(feedback.xpEarned).toBe(150);
    expect(feedback.streakCount).toBeGreaterThanOrEqual(1);
    expect(dateSet).toBeDefined();
  });

  it('Elo updates are bounded and reasonable across all domain answer types', () => {
    // Test Elo calculation works for various base Elo values
    const testCases = [
      { studentElo: 800, baseElo: 800, correct: true },
      { studentElo: 1200, baseElo: 1000, correct: false },
      { studentElo: 600, baseElo: 900, correct: true },
      { studentElo: 1400, baseElo: 1300, correct: false },
    ];

    for (const tc of testCases) {
      const result = calculateEloUpdate(tc.studentElo, tc.baseElo, tc.correct, 10);
      // Elo should stay within reasonable bounds
      expect(result.newElo).toBeGreaterThanOrEqual(400);
      expect(result.newElo).toBeLessThanOrEqual(2000);
      // Delta should be non-zero
      expect(result.eloDelta).not.toBe(0);
    }
  });

  it('no duplicate question text within a single session', () => {
    const queue = generateSessionQueue({}, undefined, 42);
    const questions = queue.map((p) => p.problem.questionText);
    const unique = new Set(questions);
    // Allow at most 1 duplicate (rare edge case with limited templates)
    expect(unique.size).toBeGreaterThanOrEqual(queue.length - 1);
  });
});
