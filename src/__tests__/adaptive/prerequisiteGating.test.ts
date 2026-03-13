import {
  isSkillUnlocked,
  getUnlockedSkills,
  getOuterFringe,
} from '@/services/adaptive/prerequisiteGating';
import { SKILLS } from '@/services/mathEngine/skills';
import type { SkillState } from '@/store/slices/skillStatesSlice';

/** Skills that have zero prerequisites (unlocked from the start). */
const ROOT_SKILL_IDS = SKILLS.filter((s) => s.prerequisites.length === 0).map(
  (s) => s.id,
);

function makeSkillState(overrides?: Partial<SkillState>): SkillState {
  return {
    eloRating: 1000,
    attempts: 0,
    correct: 0,
    masteryProbability: 0.1,
    consecutiveWrong: 0,
    masteryLocked: false,
    leitnerBox: 1,
    nextReviewDue: null,
    consecutiveCorrectInBox6: 0,
    cpaLevel: 'concrete' as const,
    ...overrides,
  };
}

function mastered(overrides?: Partial<SkillState>): SkillState {
  return makeSkillState({
    attempts: 20,
    correct: 18,
    masteryProbability: 0.97,
    masteryLocked: true,
    ...overrides,
  });
}

describe('DAG validation', () => {
  it('has the expected number of skills', () => {
    expect(SKILLS.length).toBe(180);
  });

  it('has no cycles in the prerequisite graph', () => {
    const skillMap = new Map(SKILLS.map((s) => [s.id, s]));
    const visited = new Set<string>();
    const inStack = new Set<string>();

    function hasCycle(id: string): boolean {
      if (inStack.has(id)) return true;
      if (visited.has(id)) return false;
      visited.add(id);
      inStack.add(id);
      const skill = skillMap.get(id);
      if (skill) {
        for (const prereqId of skill.prerequisites) {
          if (hasCycle(prereqId)) return true;
        }
      }
      inStack.delete(id);
      return false;
    }

    for (const skill of SKILLS) {
      expect(hasCycle(skill.id)).toBe(false);
    }
  });

  it('all prerequisite IDs reference valid skills', () => {
    const validIds = new Set(SKILLS.map((s) => s.id));
    for (const skill of SKILLS) {
      for (const prereqId of skill.prerequisites) {
        expect(validIds.has(prereqId)).toBe(true);
      }
    }
  });

  it('root skills have no prerequisites', () => {
    const addRoot = SKILLS.find((s) => s.id === 'addition.single-digit.no-carry');
    const subRoot = SKILLS.find((s) => s.id === 'subtraction.single-digit.no-borrow');
    expect(addRoot?.prerequisites).toHaveLength(0);
    expect(subRoot?.prerequisites).toHaveLength(0);
  });

  it('subtraction.within-20.no-borrow requires both subtraction and addition prereqs', () => {
    const skill = SKILLS.find((s) => s.id === 'subtraction.within-20.no-borrow');
    expect(skill?.prerequisites).toContain('subtraction.single-digit.no-borrow');
    expect(skill?.prerequisites).toContain('addition.within-20.no-carry');
  });

  it('subtraction.within-20.with-borrow requires both subtraction and addition prereqs', () => {
    const skill = SKILLS.find((s) => s.id === 'subtraction.within-20.with-borrow');
    expect(skill?.prerequisites).toContain('subtraction.within-20.no-borrow');
    expect(skill?.prerequisites).toContain('addition.within-20.with-carry');
  });

  it('subtraction.two-digit.no-borrow requires both subtraction and addition prereqs', () => {
    const skill = SKILLS.find((s) => s.id === 'subtraction.two-digit.no-borrow');
    expect(skill?.prerequisites).toContain('subtraction.within-20.with-borrow');
    expect(skill?.prerequisites).toContain('addition.two-digit.no-carry');
  });

  it('subtraction.two-digit.with-borrow requires both subtraction and addition prereqs', () => {
    const skill = SKILLS.find((s) => s.id === 'subtraction.two-digit.with-borrow');
    expect(skill?.prerequisites).toContain('subtraction.two-digit.no-borrow');
    expect(skill?.prerequisites).toContain('addition.two-digit.with-carry');
  });

  it('subtraction.three-digit.no-borrow requires both subtraction and addition prereqs', () => {
    const skill = SKILLS.find((s) => s.id === 'subtraction.three-digit.no-borrow');
    expect(skill?.prerequisites).toContain('subtraction.two-digit.with-borrow');
    expect(skill?.prerequisites).toContain('addition.three-digit.no-carry');
  });

  it('subtraction.three-digit.with-borrow requires both subtraction and addition prereqs', () => {
    const skill = SKILLS.find((s) => s.id === 'subtraction.three-digit.with-borrow');
    expect(skill?.prerequisites).toContain('subtraction.three-digit.no-borrow');
    expect(skill?.prerequisites).toContain('addition.three-digit.with-carry');
  });
});

describe('isSkillUnlocked (BKT mastery)', () => {
  it('root skills are always unlocked with empty skillStates', () => {
    expect(isSkillUnlocked('addition.single-digit.no-carry', {})).toBe(true);
    expect(isSkillUnlocked('subtraction.single-digit.no-borrow', {})).toBe(true);
  });

  it('skill with all prereqs having masteryLocked=true is unlocked', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': mastered(),
    };
    expect(isSkillUnlocked('addition.within-20.no-carry', skillStates)).toBe(true);
  });

  it('skill with any prereq having masteryLocked=false is locked', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({ masteryLocked: false, attempts: 5 }),
    };
    expect(isSkillUnlocked('addition.within-20.no-carry', skillStates)).toBe(false);
  });

  it('no-re-locking: skill with attempts > 0 stays unlocked even if prereq mastery lost', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({ masteryLocked: false, attempts: 10 }),
      // The child has practiced within-20 (attempts > 0), so it stays unlocked
      'addition.within-20.no-carry': makeSkillState({ attempts: 5, correct: 3 }),
    };
    expect(isSkillUnlocked('addition.within-20.no-carry', skillStates)).toBe(true);
  });

  it('unknown skillId returns false', () => {
    expect(isSkillUnlocked('nonexistent.skill', {})).toBe(false);
  });

  it('prerequisite not in skillStates means not mastered (locked)', () => {
    // addition.within-20.no-carry prereq is addition.single-digit.no-carry
    // which is not in skillStates, so masteryLocked is not true -> locked
    expect(isSkillUnlocked('addition.within-20.no-carry', {})).toBe(false);
  });
});

describe('getUnlockedSkills (BKT mastery)', () => {
  it('returns all root skills with empty state', () => {
    const unlocked = getUnlockedSkills({});
    for (const rootId of ROOT_SKILL_IDS) {
      expect(unlocked).toContain(rootId);
    }
    expect(unlocked).toHaveLength(ROOT_SKILL_IDS.length);
  });

  it('returns chain of unlocked skills when prereqs mastered', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': mastered(),
      'addition.within-20.no-carry': mastered(),
    };
    const unlocked = getUnlockedSkills(skillStates);
    expect(unlocked).toContain('addition.single-digit.no-carry');
    expect(unlocked).toContain('addition.within-20.no-carry');
    expect(unlocked).toContain('addition.within-20.with-carry');
    // two-digit.no-carry requires within-20.with-carry to be mastered
    expect(unlocked).not.toContain('addition.two-digit.no-carry');
  });
});

describe('getOuterFringe', () => {
  it('empty skillStates: returns all root skills', () => {
    const fringe = getOuterFringe({});
    for (const rootId of ROOT_SKILL_IDS) {
      expect(fringe).toContain(rootId);
    }
    expect(fringe).toHaveLength(ROOT_SKILL_IDS.length);
  });

  it('one root mastered: fringe includes other roots + first next-in-chain skill', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': mastered(),
    };
    const fringe = getOuterFringe(skillStates);
    // Root mastered -> excluded from fringe
    expect(fringe).not.toContain('addition.single-digit.no-carry');
    // Next in addition chain is unlocked and not mastered -> in fringe
    expect(fringe).toContain('addition.within-20.no-carry');
    // Subtraction root still not mastered -> in fringe
    expect(fringe).toContain('subtraction.single-digit.no-borrow');
  });

  it('all skills mastered: returns empty array', () => {
    const skillStates: Record<string, SkillState> = {};
    for (const skill of SKILLS) {
      skillStates[skill.id] = mastered();
    }
    const fringe = getOuterFringe(skillStates);
    expect(fringe).toHaveLength(0);
  });

  it('skill with attempts > 0 but not mastered: excluded from fringe (Leitner handles)', () => {
    const skillStates: Record<string, SkillState> = {
      // Root practiced but not mastered
      'addition.single-digit.no-carry': makeSkillState({ attempts: 5, correct: 2, masteryLocked: false }),
    };
    const fringe = getOuterFringe(skillStates);
    // Practiced but not mastered -> Leitner review, not fringe
    expect(fringe).not.toContain('addition.single-digit.no-carry');
    // Subtraction root still fresh -> in fringe
    expect(fringe).toContain('subtraction.single-digit.no-borrow');
  });

  it('cross-link: subtraction skill only in fringe when BOTH prereqs mastered', () => {
    // subtraction.within-20.no-borrow requires subtraction.single-digit.no-borrow AND addition.within-20.no-carry
    const onlySubMastered: Record<string, SkillState> = {
      'subtraction.single-digit.no-borrow': mastered(),
    };
    let fringe = getOuterFringe(onlySubMastered);
    // Only subtraction prereq mastered, addition prereq not -> not in fringe
    expect(fringe).not.toContain('subtraction.within-20.no-borrow');

    const bothMastered: Record<string, SkillState> = {
      'subtraction.single-digit.no-borrow': mastered(),
      'addition.within-20.no-carry': mastered(),
      // also need addition root mastered for the chain
      'addition.single-digit.no-carry': mastered(),
    };
    fringe = getOuterFringe(bothMastered);
    // Both prereqs mastered -> in fringe
    expect(fringe).toContain('subtraction.within-20.no-borrow');
  });

  it('mastered skills are excluded from fringe', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': mastered(),
      'subtraction.single-digit.no-borrow': mastered(),
    };
    const fringe = getOuterFringe(skillStates);
    expect(fringe).not.toContain('addition.single-digit.no-carry');
    expect(fringe).not.toContain('subtraction.single-digit.no-borrow');
  });

  it('skill whose prereq lost mastery is not re-entered into fringe if it has attempts > 0', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({ masteryLocked: false, attempts: 20 }),
      // Child practiced within-20 but prereq lost mastery
      'addition.within-20.no-carry': makeSkillState({ attempts: 5, correct: 2, masteryLocked: false }),
    };
    const fringe = getOuterFringe(skillStates);
    // Both practiced -> neither in fringe (Leitner handles)
    expect(fringe).not.toContain('addition.single-digit.no-carry');
    expect(fringe).not.toContain('addition.within-20.no-carry');
  });
});
