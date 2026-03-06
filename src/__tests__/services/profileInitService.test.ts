import { createGradeAppropriateSkillStates } from '../../services/profile/profileInitService';
import { SKILLS } from '../../services/mathEngine/skills';

describe('createGradeAppropriateSkillStates', () => {
  it('returns empty skillStates for Grade 1 (no skills below grade 1)', () => {
    const result = createGradeAppropriateSkillStates(1);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('returns pre-mastered skillStates for all Grade 1 skills when grade is 2', () => {
    const grade1Skills = SKILLS.filter((s) => s.grade < 2);
    const result = createGradeAppropriateSkillStates(2);

    expect(Object.keys(result)).toHaveLength(grade1Skills.length);
    for (const skill of grade1Skills) {
      expect(result[skill.id]).toBeDefined();
    }
  });

  it('returns pre-mastered skillStates for Grade 1 AND Grade 2 skills when grade is 3', () => {
    const belowGrade3 = SKILLS.filter((s) => s.grade < 3);
    const result = createGradeAppropriateSkillStates(3);

    expect(Object.keys(result)).toHaveLength(belowGrade3.length);
    for (const skill of belowGrade3) {
      expect(result[skill.id]).toBeDefined();
    }
  });

  it('pre-mastered skills have correct field values', () => {
    const result = createGradeAppropriateSkillStates(2);
    const firstKey = Object.keys(result)[0];
    const state = result[firstKey];

    expect(state.eloRating).toBe(1100);
    expect(state.attempts).toBe(5);
    expect(state.correct).toBe(5);
    expect(state.masteryProbability).toBe(0.95);
    expect(state.consecutiveWrong).toBe(0);
    expect(state.masteryLocked).toBe(true);
    expect(state.leitnerBox).toBe(5);
    expect(state.nextReviewDue).toBeNull();
    expect(state.consecutiveCorrectInBox6).toBe(0);
    expect(state.cpaLevel).toBe('abstract');
  });

  it('does NOT include skills at the child own grade', () => {
    const result = createGradeAppropriateSkillStates(2);
    const grade2Skills = SKILLS.filter((s) => s.grade === 2);

    for (const skill of grade2Skills) {
      expect(result[skill.id]).toBeUndefined();
    }
  });

  it('does NOT include skills above the child grade', () => {
    const result = createGradeAppropriateSkillStates(2);
    const grade3Skills = SKILLS.filter((s) => s.grade === 3);

    for (const skill of grade3Skills) {
      expect(result[skill.id]).toBeUndefined();
    }
  });

  it('returned Record keys match skill IDs from SKILLS filtered by grade', () => {
    for (const grade of [1, 2, 3]) {
      const expected = SKILLS.filter((s) => s.grade < grade).map((s) => s.id);
      const result = createGradeAppropriateSkillStates(grade);
      expect(Object.keys(result).sort()).toEqual(expected.sort());
    }
  });
});
