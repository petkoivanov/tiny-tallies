import {
  SKILLS,
  getSkillById,
  getSkillsByOperation,
  getSkillsByGrade,
} from '../../services/mathEngine/skills';

describe('Skills registry', () => {
  it('has 151 skills total', () => {
    expect(SKILLS).toHaveLength(151);
  });

  it('all skill IDs are unique', () => {
    const ids = SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers all 18 operations', () => {
    const ops = new Set(SKILLS.map((s) => s.operation));
    expect(ops).toEqual(
      new Set([
        'addition',
        'subtraction',
        'multiplication',
        'division',
        'fractions',
        'place_value',
        'time',
        'money',
        'patterns',
        'measurement',
        'ratios',
        'exponents',
        'expressions',
        'geometry',
        'probability',
        'number_theory',
        'basic_graphs',
        'data_analysis',
      ]),
    );
  });

  it('covers grades 1-8', () => {
    const grades = new Set(SKILLS.map((s) => s.grade));
    expect(grades).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8]));
  });

  it('skill count by domain matches plan', () => {
    expect(getSkillsByOperation('addition')).toHaveLength(12);
    expect(getSkillsByOperation('subtraction')).toHaveLength(11);
    expect(getSkillsByOperation('multiplication')).toHaveLength(14);
    expect(getSkillsByOperation('division')).toHaveLength(12);
    expect(getSkillsByOperation('fractions')).toHaveLength(14);
    expect(getSkillsByOperation('place_value')).toHaveLength(12);
    expect(getSkillsByOperation('time')).toHaveLength(7);
    expect(getSkillsByOperation('money')).toHaveLength(7);
    expect(getSkillsByOperation('patterns')).toHaveLength(5);
    expect(getSkillsByOperation('measurement')).toHaveLength(5);
    expect(getSkillsByOperation('ratios')).toHaveLength(9);
    expect(getSkillsByOperation('exponents')).toHaveLength(6);
    expect(getSkillsByOperation('expressions')).toHaveLength(7);
    expect(getSkillsByOperation('geometry')).toHaveLength(6);
    expect(getSkillsByOperation('probability')).toHaveLength(2);
    expect(getSkillsByOperation('number_theory')).toHaveLength(3);
    expect(getSkillsByOperation('basic_graphs')).toHaveLength(8);
    expect(getSkillsByOperation('data_analysis')).toHaveLength(11);
  });

  it('all prerequisites reference existing skill IDs', () => {
    const allIds = new Set(SKILLS.map((s) => s.id));
    for (const skill of SKILLS) {
      for (const prereq of skill.prerequisites) {
        expect(allIds.has(prereq)).toBe(true);
      }
    }
  });

  it('prerequisite graph has no cycles', () => {
    const visited = new Set<string>();
    const inStack = new Set<string>();

    function hasCycle(id: string): boolean {
      if (inStack.has(id)) return true;
      if (visited.has(id)) return false;

      visited.add(id);
      inStack.add(id);

      const skill = getSkillById(id);
      if (skill) {
        for (const prereq of skill.prerequisites) {
          if (hasCycle(prereq)) return true;
        }
      }

      inStack.delete(id);
      return false;
    }

    for (const skill of SKILLS) {
      expect(hasCycle(skill.id)).toBe(false);
    }
  });

  it('has entry points (skills with no prerequisites) for each grade', () => {
    const rootSkills = SKILLS.filter((s) => s.prerequisites.length === 0);
    expect(rootSkills.length).toBeGreaterThanOrEqual(5);

    const rootGrades = new Set(rootSkills.map((s) => s.grade));
    expect(rootGrades.has(1)).toBe(true);
  });

  it('getSkillById returns correct skill', () => {
    const skill = getSkillById('addition.single-digit.no-carry');
    expect(skill).toBeDefined();
    expect(skill!.name).toBe('Add within 10');
    expect(skill!.grade).toBe(1);
  });

  it('getSkillById returns undefined for unknown ID', () => {
    expect(getSkillById('nonexistent.skill')).toBeUndefined();
  });

  it('getSkillsByGrade returns correct count per grade', () => {
    const g1 = getSkillsByGrade(1);
    const g2 = getSkillsByGrade(2);
    const g3 = getSkillsByGrade(3);
    const g4 = getSkillsByGrade(4);

    expect(g1.length + g2.length + g3.length + g4.length).toBe(84);
    expect(g1.length).toBeGreaterThanOrEqual(10);
    expect(g4.length).toBeGreaterThanOrEqual(10);
  });

  it('all skills have non-empty standards arrays', () => {
    for (const skill of SKILLS) {
      expect(skill.standards.length).toBeGreaterThan(0);
    }
  });
});
