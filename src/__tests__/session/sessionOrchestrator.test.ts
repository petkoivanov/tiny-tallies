import {
  generateSessionQueue,
  getSessionPhase,
  selectStrongestSkill,
  selectEasiestTemplate,
  commitSessionResults,
  DEFAULT_SESSION_CONFIG,
  STRENGTH_BASELINE,
} from '@/services/session';
import type { PendingSkillUpdate } from '@/services/session';
import { createRng } from '@/services/mathEngine/seededRng';
import { getTemplatesBySkill } from '@/services/mathEngine/templates';
import { getUnlockedSkills } from '@/services/adaptive/prerequisiteGating';
import type { SkillState } from '@/store/slices/skillStatesSlice';

describe('sessionOrchestrator', () => {
  describe('getSessionPhase', () => {
    it('returns warmup for indices 0-2', () => {
      expect(getSessionPhase(0)).toBe('warmup');
      expect(getSessionPhase(1)).toBe('warmup');
      expect(getSessionPhase(2)).toBe('warmup');
    });

    it('returns practice for indices 3-11', () => {
      expect(getSessionPhase(3)).toBe('practice');
      expect(getSessionPhase(7)).toBe('practice');
      expect(getSessionPhase(11)).toBe('practice');
    });

    it('returns cooldown for indices 12-14', () => {
      expect(getSessionPhase(12)).toBe('cooldown');
      expect(getSessionPhase(13)).toBe('cooldown');
      expect(getSessionPhase(14)).toBe('cooldown');
    });

    it('returns complete for index 15 and beyond', () => {
      expect(getSessionPhase(15)).toBe('complete');
      expect(getSessionPhase(100)).toBe('complete');
    });

    it('handles custom config', () => {
      const config = { warmupCount: 2, practiceCount: 5, cooldownCount: 2 };
      expect(getSessionPhase(0, config)).toBe('warmup');
      expect(getSessionPhase(1, config)).toBe('warmup');
      expect(getSessionPhase(2, config)).toBe('practice');
      expect(getSessionPhase(6, config)).toBe('practice');
      expect(getSessionPhase(7, config)).toBe('cooldown');
      expect(getSessionPhase(8, config)).toBe('cooldown');
      expect(getSessionPhase(9, config)).toBe('complete');
    });
  });

  describe('selectStrongestSkill', () => {
    it('favors highest-Elo skills over 100 iterations', () => {
      const skillStates: Record<string, SkillState> = {
        'addition.single-digit.no-carry': { eloRating: 1200, attempts: 50, correct: 40 },
        'subtraction.single-digit.no-borrow': { eloRating: 800, attempts: 50, correct: 20 },
      };
      const skillIds = Object.keys(skillStates);

      const counts: Record<string, number> = {};
      for (const id of skillIds) counts[id] = 0;

      for (let i = 0; i < 100; i++) {
        const rng = createRng(i * 37);
        const selected = selectStrongestSkill(skillIds, skillStates, rng);
        counts[selected]++;
      }

      // The stronger skill (1200 Elo) should be selected significantly more often
      expect(counts['addition.single-digit.no-carry']).toBeGreaterThan(
        counts['subtraction.single-digit.no-borrow'],
      );
    });

    it('returns a valid skill ID', () => {
      const rng = createRng(42);
      const unlocked = getUnlockedSkills({});
      const result = selectStrongestSkill(unlocked, {}, rng);
      expect(unlocked).toContain(result);
    });

    it('with equal Elos all skills get roughly equal selection', () => {
      const skillIds = ['a', 'b', 'c'];
      const skillStates: Record<string, SkillState> = {
        a: { eloRating: 1000, attempts: 10, correct: 8 },
        b: { eloRating: 1000, attempts: 10, correct: 8 },
        c: { eloRating: 1000, attempts: 10, correct: 8 },
      };

      const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
      for (let i = 0; i < 300; i++) {
        const rng = createRng(i * 17);
        counts[selectStrongestSkill(skillIds, skillStates, rng)]++;
      }

      // Each skill should get at least 50 out of 300 (roughly 1/3)
      // With STRENGTH_BASELINE=50 and equal Elos, each weight = 0 + 50 = 50
      for (const id of skillIds) {
        expect(counts[id]).toBeGreaterThan(50);
      }
    });
  });

  describe('selectEasiestTemplate', () => {
    it('returns the lowest-baseElo template for a skill', () => {
      const skillId = 'addition.single-digit.no-carry';
      const templates = getTemplatesBySkill(skillId);
      const easiest = selectEasiestTemplate(skillId);

      const minBaseElo = Math.min(...templates.map((t) => t.baseElo));
      expect(easiest.baseElo).toBe(minBaseElo);
    });

    it('throws if no templates found for skill', () => {
      expect(() => selectEasiestTemplate('nonexistent.skill')).toThrow(
        'No templates found for skill: nonexistent.skill',
      );
    });
  });

  describe('generateSessionQueue', () => {
    it('returns exactly 15 problems', () => {
      const queue = generateSessionQueue({}, DEFAULT_SESSION_CONFIG, 42);
      expect(queue).toHaveLength(15);
    });

    it('assigns correct phases: 3 warmup, 9 practice, 3 cooldown', () => {
      const queue = generateSessionQueue({}, DEFAULT_SESSION_CONFIG, 42);

      const warmup = queue.filter((p) => p.phase === 'warmup');
      const practice = queue.filter((p) => p.phase === 'practice');
      const cooldown = queue.filter((p) => p.phase === 'cooldown');

      expect(warmup).toHaveLength(3);
      expect(practice).toHaveLength(9);
      expect(cooldown).toHaveLength(3);
    });

    it('warmup problems use easiest templates for their skill', () => {
      const queue = generateSessionQueue({}, DEFAULT_SESSION_CONFIG, 42);
      const warmupProblems = queue.slice(0, 3);

      for (const wp of warmupProblems) {
        const templates = getTemplatesBySkill(wp.skillId);
        const minBaseElo = Math.min(...templates.map((t) => t.baseElo));
        expect(wp.templateBaseElo).toBe(minBaseElo);
      }
    });

    it('cooldown problems use easiest templates for their skill', () => {
      const queue = generateSessionQueue({}, DEFAULT_SESSION_CONFIG, 42);
      const cooldownProblems = queue.slice(12, 15);

      for (const cp of cooldownProblems) {
        const templates = getTemplatesBySkill(cp.skillId);
        const minBaseElo = Math.min(...templates.map((t) => t.baseElo));
        expect(cp.templateBaseElo).toBe(minBaseElo);
      }
    });

    it('practice problems use weakness-weighted skills (statistical)', () => {
      // Create skill states where one skill is weak (low Elo)
      const skillStates: Record<string, SkillState> = {
        'addition.single-digit.no-carry': { eloRating: 700, attempts: 30, correct: 10 },
        'subtraction.single-digit.no-borrow': { eloRating: 1200, attempts: 30, correct: 25 },
      };

      // Run many sessions and count practice skill selections
      const counts: Record<string, number> = {};
      for (let trial = 0; trial < 20; trial++) {
        const queue = generateSessionQueue(skillStates, DEFAULT_SESSION_CONFIG, trial * 71);
        const practice = queue.filter((p) => p.phase === 'practice');
        for (const p of practice) {
          counts[p.skillId] = (counts[p.skillId] ?? 0) + 1;
        }
      }

      // The weaker skill (700 Elo) should appear more often in practice
      expect(counts['addition.single-digit.no-carry']).toBeGreaterThan(
        counts['subtraction.single-digit.no-borrow'] ?? 0,
      );
    });

    it('is deterministic given the same seed', () => {
      const queue1 = generateSessionQueue({}, DEFAULT_SESSION_CONFIG, 12345);
      const queue2 = generateSessionQueue({}, DEFAULT_SESSION_CONFIG, 12345);

      expect(queue1).toHaveLength(queue2.length);
      for (let i = 0; i < queue1.length; i++) {
        expect(queue1[i].problem.id).toBe(queue2[i].problem.id);
        expect(queue1[i].skillId).toBe(queue2[i].skillId);
        expect(queue1[i].phase).toBe(queue2[i].phase);
      }
    });

    it('produces valid queue for empty skillStates (new user)', () => {
      const queue = generateSessionQueue({}, DEFAULT_SESSION_CONFIG, 99);

      expect(queue).toHaveLength(15);
      for (const item of queue) {
        expect(item.problem).toBeDefined();
        expect(item.presentation).toBeDefined();
        expect(item.presentation.options.length).toBe(4);
        expect(typeof item.problem.correctAnswer).toBe('number');
        expect(typeof item.skillId).toBe('string');
        expect(typeof item.templateBaseElo).toBe('number');
      }
    });

    it('each problem has a valid multiple choice presentation', () => {
      const queue = generateSessionQueue({}, DEFAULT_SESSION_CONFIG, 42);

      for (const item of queue) {
        expect(item.presentation.format).toBe('multiple_choice');
        expect(item.presentation.options).toHaveLength(4);
        // Correct answer should be among the options
        const values = item.presentation.options.map((o) => o.value);
        expect(values).toContain(item.problem.correctAnswer);
      }
    });
  });

  describe('commitSessionResults', () => {
    const createMocks = () => ({
      updateSkillState: jest.fn(),
      addXp: jest.fn(),
      setLevel: jest.fn(),
      setLastSessionDate: jest.fn(),
      setWeeklyStreak: jest.fn(),
    });

    it('calls updateSkillState for each pending update', () => {
      const mocks = createMocks();

      const pendingUpdates = new Map<string, PendingSkillUpdate>([
        ['skill-a', { skillId: 'skill-a', newElo: 1050, attempts: 5, correct: 4 }],
        ['skill-b', { skillId: 'skill-b', newElo: 980, attempts: 3, correct: 1 }],
      ]);

      commitSessionResults(
        pendingUpdates, 120, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(mocks.updateSkillState).toHaveBeenCalledTimes(2);
      expect(mocks.updateSkillState).toHaveBeenCalledWith('skill-a', expect.objectContaining({
        eloRating: 1050,
        attempts: 5,
        correct: 4,
      }));
      expect(mocks.updateSkillState).toHaveBeenCalledWith('skill-b', expect.objectContaining({
        eloRating: 980,
        attempts: 3,
        correct: 1,
      }));
    });

    it('calls addXp with total XP', () => {
      const mocks = createMocks();

      const pendingUpdates = new Map<string, PendingSkillUpdate>();
      commitSessionResults(
        pendingUpdates, 150, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(mocks.addXp).toHaveBeenCalledTimes(1);
      expect(mocks.addXp).toHaveBeenCalledWith(150);
    });

    it('handles empty pending updates', () => {
      const mocks = createMocks();

      commitSessionResults(
        new Map(), 0, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(mocks.updateSkillState).not.toHaveBeenCalled();
      expect(mocks.addXp).toHaveBeenCalledWith(0);
    });

    it('returns a SessionFeedback object with level and streak data', () => {
      const mocks = createMocks();

      const feedback = commitSessionResults(
        new Map(), 50, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(feedback).toEqual(expect.objectContaining({
        xpEarned: 50,
        previousLevel: 1,
        newLevel: 1,
        leveledUp: false,
        levelsGained: 0,
        streakCount: 1,
        practicedThisWeek: true,
      }));
    });

    it('calls setLevel when enough XP for level-up', () => {
      const mocks = createMocks();

      // Level 2 requires 120 cumulative XP. Start at 100, earn 50 -> 150 total (level 2)
      const feedback = commitSessionResults(
        new Map(), 50, mocks.updateSkillState, mocks.addXp,
        100, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(feedback.leveledUp).toBe(true);
      expect(feedback.previousLevel).toBe(1);
      expect(feedback.newLevel).toBe(2);
      expect(feedback.levelsGained).toBe(1);
      expect(mocks.setLevel).toHaveBeenCalledWith(2);
    });

    it('does not call setLevel when no level-up occurs', () => {
      const mocks = createMocks();

      // Stay within level 1 (0 + 50 = 50, still level 1)
      const feedback = commitSessionResults(
        new Map(), 50, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(feedback.leveledUp).toBe(false);
      expect(mocks.setLevel).not.toHaveBeenCalled();
    });

    it('calls setLastSessionDate with an ISO date string', () => {
      const mocks = createMocks();

      commitSessionResults(
        new Map(), 50, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(mocks.setLastSessionDate).toHaveBeenCalledTimes(1);
      const dateArg = mocks.setLastSessionDate.mock.calls[0][0];
      // Verify it's a valid ISO date string
      expect(new Date(dateArg).toISOString()).toBe(dateArg);
    });

    it('detects multi-level jumps', () => {
      const mocks = createMocks();

      // Level 3 requires 260 cumulative XP. Start at 0, earn 300 -> level 3
      const feedback = commitSessionResults(
        new Map(), 300, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(feedback.leveledUp).toBe(true);
      expect(feedback.newLevel).toBe(3);
      expect(feedback.levelsGained).toBe(2);
      expect(mocks.setLevel).toHaveBeenCalledWith(3);
    });

    // Streak integration tests
    it('with null lastSessionDate returns streakCount: 1', () => {
      const mocks = createMocks();

      const feedback = commitSessionResults(
        new Map(), 50, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(feedback.streakCount).toBe(1);
      expect(feedback.practicedThisWeek).toBe(true);
    });

    it('in same week returns current streak unchanged', () => {
      const mocks = createMocks();

      // Last session was earlier today (same week)
      const lastSessionDate = new Date().toISOString();

      const feedback = commitSessionResults(
        new Map(), 50, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        3, lastSessionDate, mocks.setWeeklyStreak,
      );

      expect(feedback.streakCount).toBe(3);
      expect(feedback.practicedThisWeek).toBe(true);
    });

    it('in consecutive week returns streak + 1', () => {
      const mocks = createMocks();

      // Create a date from last week (7 days ago, but same day-of-week pattern)
      const now = new Date();
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastSessionDate = lastWeek.toISOString();

      const feedback = commitSessionResults(
        new Map(), 50, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        3, lastSessionDate, mocks.setWeeklyStreak,
      );

      expect(feedback.streakCount).toBe(4);
      expect(feedback.practicedThisWeek).toBe(true);
    });

    it('after gap returns streakCount: 1', () => {
      const mocks = createMocks();

      // Last session was 3 weeks ago
      const threeWeeksAgo = new Date();
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
      const lastSessionDate = threeWeeksAgo.toISOString();

      const feedback = commitSessionResults(
        new Map(), 50, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        5, lastSessionDate, mocks.setWeeklyStreak,
      );

      expect(feedback.streakCount).toBe(1);
      expect(feedback.practicedThisWeek).toBe(true);
    });

    it('setWeeklyStreak is called with computed value', () => {
      const mocks = createMocks();

      commitSessionResults(
        new Map(), 50, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(mocks.setWeeklyStreak).toHaveBeenCalledTimes(1);
      expect(mocks.setWeeklyStreak).toHaveBeenCalledWith(1);
    });

    it('setLastSessionDate is still called after streak update', () => {
      const mocks = createMocks();

      commitSessionResults(
        new Map(), 50, mocks.updateSkillState, mocks.addXp,
        0, 1, mocks.setLevel, mocks.setLastSessionDate,
        0, null, mocks.setWeeklyStreak,
      );

      expect(mocks.setLastSessionDate).toHaveBeenCalledTimes(1);
      const dateArg = mocks.setLastSessionDate.mock.calls[0][0];
      expect(new Date(dateArg).toISOString()).toBe(dateArg);
    });
  });
});
