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
    it('calls updateSkillState for each pending update', () => {
      const updateSkillState = jest.fn();
      const addXp = jest.fn();

      const pendingUpdates = new Map<string, PendingSkillUpdate>([
        ['skill-a', { skillId: 'skill-a', newElo: 1050, attempts: 5, correct: 4 }],
        ['skill-b', { skillId: 'skill-b', newElo: 980, attempts: 3, correct: 1 }],
      ]);

      commitSessionResults(pendingUpdates, 120, updateSkillState, addXp);

      expect(updateSkillState).toHaveBeenCalledTimes(2);
      expect(updateSkillState).toHaveBeenCalledWith('skill-a', expect.objectContaining({
        eloRating: 1050,
        attempts: 5,
        correct: 4,
      }));
      expect(updateSkillState).toHaveBeenCalledWith('skill-b', expect.objectContaining({
        eloRating: 980,
        attempts: 3,
        correct: 1,
      }));
    });

    it('calls addXp with total XP', () => {
      const updateSkillState = jest.fn();
      const addXp = jest.fn();

      const pendingUpdates = new Map<string, PendingSkillUpdate>();
      commitSessionResults(pendingUpdates, 150, updateSkillState, addXp);

      expect(addXp).toHaveBeenCalledTimes(1);
      expect(addXp).toHaveBeenCalledWith(150);
    });

    it('handles empty pending updates', () => {
      const updateSkillState = jest.fn();
      const addXp = jest.fn();

      commitSessionResults(new Map(), 0, updateSkillState, addXp);

      expect(updateSkillState).not.toHaveBeenCalled();
      expect(addXp).toHaveBeenCalledWith(0);
    });
  });
});
