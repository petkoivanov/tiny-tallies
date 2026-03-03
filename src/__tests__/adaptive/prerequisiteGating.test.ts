import {
  isSkillUnlocked,
  getUnlockedSkills,
  UNLOCK_THRESHOLD,
} from '@/services/adaptive/prerequisiteGating';
import { SKILLS } from '@/services/mathEngine/skills';
import type { SkillState } from '@/store/slices/skillStatesSlice';

function makeSkillState(eloRating: number): SkillState {
  return { eloRating, attempts: 10, correct: 8, masteryProbability: 0.1, consecutiveWrong: 0, masteryLocked: false, leitnerBox: 1, nextReviewDue: null, consecutiveCorrectInBox6: 0 };
}

describe('DAG validation', () => {
  it('has exactly 14 skills', () => {
    expect(SKILLS).toHaveLength(14);
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

describe('prerequisiteGating', () => {
  it('root skills are always unlocked', () => {
    expect(
      isSkillUnlocked('addition.single-digit.no-carry', {}),
    ).toBe(true);
    expect(
      isSkillUnlocked('subtraction.single-digit.no-borrow', {}),
    ).toBe(true);
  });

  it('skill with met prerequisite is unlocked', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState(950),
    };
    expect(
      isSkillUnlocked('addition.within-20.no-carry', skillStates),
    ).toBe(true);
  });

  it('skill with unmet prerequisite is locked', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState(900),
    };
    expect(
      isSkillUnlocked('addition.within-20.no-carry', skillStates),
    ).toBe(false);
  });

  it('uses defaultElo when skill not in skillStates', () => {
    // Default Elo is 1000, which >= 950 threshold, so prereq is met
    expect(
      isSkillUnlocked('addition.within-20.no-carry', {}),
    ).toBe(true);
  });

  it('unknown skillId returns false', () => {
    expect(isSkillUnlocked('nonexistent.skill', {})).toBe(false);
  });

  it('getUnlockedSkills returns all root skills with empty state', () => {
    const unlocked = getUnlockedSkills({});
    expect(unlocked).toContain('addition.single-digit.no-carry');
    expect(unlocked).toContain('subtraction.single-digit.no-borrow');
    expect(unlocked.length).toBeGreaterThanOrEqual(2);
  });

  it('getUnlockedSkills includes chain of unlocked skills', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState(1000),
      'addition.within-20.no-carry': makeSkillState(960),
      'addition.within-20.with-carry': makeSkillState(800), // below threshold
    };
    const unlocked = getUnlockedSkills(skillStates);
    // Root always included
    expect(unlocked).toContain('addition.single-digit.no-carry');
    // within-20.no-carry: prereq (single-digit) has 1000 >= 950 -> unlocked
    expect(unlocked).toContain('addition.within-20.no-carry');
    // within-20.with-carry: prereq (within-20.no-carry) has 960 >= 950 -> unlocked
    expect(unlocked).toContain('addition.within-20.with-carry');
    // two-digit.no-carry: prereq (within-20.with-carry) has 800 < 950 -> LOCKED
    expect(unlocked).not.toContain('addition.two-digit.no-carry');
  });

  it('deeply chained skill requires all ancestors to meet threshold', () => {
    // Build a full addition chain with all ancestors at or above threshold
    const fullChain: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState(1000),
      'addition.within-20.no-carry': makeSkillState(980),
      'addition.within-20.with-carry': makeSkillState(960),
      'addition.two-digit.no-carry': makeSkillState(970),
      'addition.two-digit.with-carry': makeSkillState(955),
      'addition.three-digit.no-carry': makeSkillState(950),
    };
    // three-digit.with-carry requires three-digit.no-carry >= 950 -> yes
    expect(
      isSkillUnlocked('addition.three-digit.with-carry', fullChain),
    ).toBe(true);

    // Set one ancestor below threshold
    const brokenChain = {
      ...fullChain,
      'addition.three-digit.no-carry': makeSkillState(940),
    };
    expect(
      isSkillUnlocked('addition.three-digit.with-carry', brokenChain),
    ).toBe(false);

    // Confirm threshold constant
    expect(UNLOCK_THRESHOLD).toBe(950);
  });
});
