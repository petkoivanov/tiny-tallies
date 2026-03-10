import { SKILLS, getSkillsByOperation } from '@/services/mathEngine/skills';
import { getTemplatesBySkill } from '@/services/mathEngine/templates';
import { generateProblem } from '@/services/mathEngine/generator';
import {
  selectAndFormatAnswer,
  freeTextProbability,
  mcOptionCount,
} from '@/services/mathEngine/answerFormats';
import { answerNumericValue, type Operation } from '@/services/mathEngine/types';

const ALL_OPERATIONS: Operation[] = [
  'addition', 'subtraction', 'multiplication', 'division',
  'fractions', 'place_value', 'time', 'money', 'patterns',
  'measurement', 'ratios', 'exponents', 'expressions',
  'geometry', 'probability', 'number_theory',
];

describe('Answer format integration', () => {
  it('every domain produces valid MC format at low Elo', () => {
    for (const op of ALL_OPERATIONS) {
      const skills = getSkillsByOperation(op);
      const templates = getTemplatesBySkill(skills[0].id);
      const problem = generateProblem({ templateId: templates[0].id, seed: 42 });

      // Low Elo should heavily favor MC
      const formatted = selectAndFormatAnswer(problem, 700, 42);
      // Both formats are valid, but MC should have options
      if (formatted.format === 'multiple_choice') {
        expect(formatted.options.length).toBeGreaterThanOrEqual(3);
        // Correct answer must be among options
        const correctValue = answerNumericValue(problem.correctAnswer);
        const optionValues = formatted.options.map((o) => o.value);
        expect(optionValues).toContain(correctValue);
      }
    }
  });

  it('every domain produces valid free-text format at high Elo', () => {
    // At Elo 1400, P(free_text) ≈ 0.94 — almost always free text
    // Run multiple seeds to get at least one free-text per domain
    for (const op of ALL_OPERATIONS) {
      const skills = getSkillsByOperation(op);
      const templates = getTemplatesBySkill(skills[0].id);
      const problem = generateProblem({ templateId: templates[0].id, seed: 42 });

      let gotFreeText = false;
      for (let seed = 0; seed < 50; seed++) {
        const formatted = selectAndFormatAnswer(problem, 1400, seed);
        if (formatted.format === 'free_text') {
          gotFreeText = true;
          // Free text has maxDigits, not options
          expect(formatted.maxDigits).toBeDefined();
          break;
        }
      }
      expect(gotFreeText).toBe(true);
    }
  });

  it('MC options are all distinct from each other', () => {
    for (const op of ALL_OPERATIONS) {
      const skills = getSkillsByOperation(op);
      const templates = getTemplatesBySkill(skills[0].id);
      const problem = generateProblem({ templateId: templates[0].id, seed: 42 });
      const formatted = selectAndFormatAnswer(problem, 800, 100);

      if (formatted.format === 'multiple_choice') {
        const values = formatted.options.map((o) => o.value);
        const uniqueValues = new Set(values);
        expect(uniqueValues.size).toBe(values.length);
      }
    }
  });

  it('MC option count matches Elo thresholds', () => {
    // Pick a simple arithmetic problem
    const problem = generateProblem({
      templateId: getTemplatesBySkill('addition.single-digit.no-carry')[0].id,
      seed: 42,
    });

    // Force MC by using low seeds that should produce MC at various Elo levels
    const eloThresholds = [
      { elo: 800, expectedCount: 4 },
      { elo: 1000, expectedCount: 5 },
      { elo: 1200, expectedCount: 6 },
    ];

    for (const { elo, expectedCount } of eloThresholds) {
      // Try many seeds to find MC format
      for (let seed = 0; seed < 100; seed++) {
        const formatted = selectAndFormatAnswer(problem, elo, seed);
        if (formatted.format === 'multiple_choice') {
          expect(formatted.options.length).toBe(expectedCount);
          break;
        }
      }
    }
  });

  it('answer types are preserved in formatted output', () => {
    // Test that non-numeric answer types still format correctly
    const nonArithOps: Operation[] = [
      'fractions', 'geometry', 'expressions', 'probability',
    ];

    for (const op of nonArithOps) {
      const skills = getSkillsByOperation(op);
      for (const skill of skills.slice(0, 3)) {
        const templates = getTemplatesBySkill(skill.id);
        if (templates.length === 0) continue;

        const problem = generateProblem({ templateId: templates[0].id, seed: 42 });
        const formatted = selectAndFormatAnswer(problem, 900, 42);

        // Should always produce a valid format
        expect(['multiple_choice', 'free_text']).toContain(formatted.format);
        // Problem data should be preserved
        expect(formatted.problem).toBeDefined();
        expect(formatted.problem.correctAnswer).toBeDefined();
      }
    }
  });

  it('free text probability is monotonically increasing with Elo', () => {
    let prevP = 0;
    for (let elo = 600; elo <= 1400; elo += 50) {
      const p = freeTextProbability(elo);
      expect(p).toBeGreaterThanOrEqual(prevP);
      prevP = p;
    }
  });

  it('MC option count is non-decreasing with Elo', () => {
    let prevCount = 0;
    for (let elo = 600; elo <= 1400; elo += 50) {
      const count = mcOptionCount(elo);
      expect(count).toBeGreaterThanOrEqual(prevCount);
      prevCount = count;
    }
  });
});
