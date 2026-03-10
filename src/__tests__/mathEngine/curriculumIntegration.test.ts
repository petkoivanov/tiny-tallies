import { SKILLS, getSkillById, getSkillsByOperation } from '../../services/mathEngine/skills';
import { ALL_TEMPLATES, getTemplatesBySkill } from '../../services/mathEngine/templates';
import { generateProblem } from '../../services/mathEngine/generator';
import { generateDistractors } from '../../services/mathEngine/bugLibrary/distractorGenerator';
import { createRng } from '../../services/mathEngine/seededRng';
import {
  selectAndFormatAnswer,
  freeTextProbability,
  mcOptionCount,
} from '../../services/mathEngine/answerFormats';
import { eloToLevel, levelProgress } from '../../services/adaptive/levelMapping';
import {
  shouldGenerateWordProblem,
  generateWordProblem,
} from '../../services/mathEngine/wordProblems';
import { answerNumericValue, type Operation } from '../../services/mathEngine/types';

describe('Curriculum Integration', () => {
  it('every skill has at least one template', () => {
    for (const skill of SKILLS) {
      const templates = getTemplatesBySkill(skill.id);
      expect(templates.length).toBeGreaterThanOrEqual(
        1,
      );
    }
  });

  it('every template references a valid skill', () => {
    for (const template of ALL_TEMPLATES) {
      const skill = getSkillById(template.skillId);
      expect(skill).toBeDefined();
    }
  });

  it('every template can generate a problem', () => {
    for (const template of ALL_TEMPLATES) {
      expect(() =>
        generateProblem({ templateId: template.id, seed: 42 }),
      ).not.toThrow();
    }
  });

  it('every template generates valid distractors', () => {
    const rng = createRng(42);
    for (const template of ALL_TEMPLATES) {
      const problem = generateProblem({ templateId: template.id, seed: 42 });
      const distractors = generateDistractors(problem, createRng(42));
      expect(distractors.length).toBeGreaterThanOrEqual(3);
      for (const d of distractors) {
        expect(d.value).not.toBe(answerNumericValue(problem.correctAnswer));
      }
    }
  });

  it('answer format selection works for all templates', () => {
    for (const template of ALL_TEMPLATES) {
      const problem = generateProblem({ templateId: template.id, seed: 42 });
      const formatted = selectAndFormatAnswer(problem, 900, 42);
      expect(['multiple_choice', 'free_text']).toContain(formatted.format);
    }
  });

  it('level mapping works across full Elo range', () => {
    for (let elo = 600; elo <= 1400; elo += 50) {
      const level = eloToLevel(elo);
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(10);
      const progress = levelProgress(elo);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    }
  });

  it('word problems generate for applicable domains', () => {
    const applicable: Operation[] = [
      'addition', 'subtraction', 'multiplication', 'division', 'money',
    ];
    const rng = createRng(42);
    for (const op of applicable) {
      const result = generateWordProblem(op, 10, 5, 3, createRng(42));
      expect(result).not.toBeNull();
    }
  });

  it('word problem frequency scales with Elo', () => {
    let lowEloCount = 0;
    let highEloCount = 0;
    for (let i = 0; i < 100; i++) {
      if (shouldGenerateWordProblem(750, createRng(i))) lowEloCount++;
      if (shouldGenerateWordProblem(1300, createRng(i))) highEloCount++;
    }

    expect(highEloCount).toBeGreaterThan(lowEloCount);
  });

  it('MC option count scales with Elo', () => {
    expect(mcOptionCount(800)).toBe(4);
    expect(mcOptionCount(1000)).toBe(5);
    expect(mcOptionCount(1200)).toBe(6);
  });

  it('free text probability scales with Elo', () => {
    expect(freeTextProbability(700)).toBeLessThan(0.2);
    expect(freeTextProbability(1000)).toBeCloseTo(0.5, 1);
    expect(freeTextProbability(1300)).toBeGreaterThan(0.8);
  });

  it('skill counts by domain are correct', () => {
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
  });

  it('total template count matches skill coverage', () => {
    expect(ALL_TEMPLATES.length).toBeGreaterThanOrEqual(SKILLS.length);
  });
});
