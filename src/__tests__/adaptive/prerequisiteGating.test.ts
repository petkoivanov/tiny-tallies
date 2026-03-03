import {
  isSkillUnlocked,
  getUnlockedSkills,
  UNLOCK_THRESHOLD,
} from '@/services/adaptive/prerequisiteGating';
import type { SkillState } from '@/store/slices/skillStatesSlice';

function makeSkillState(eloRating: number): SkillState {
  return { eloRating, attempts: 10, correct: 8, masteryProbability: 0.1, consecutiveWrong: 0, masteryLocked: false };
}

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
