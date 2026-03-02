import { createRng } from '@/services/mathEngine/seededRng';
import { getTemplatesBySkill } from '@/services/mathEngine/templates';
import { expectedScore } from '@/services/adaptive/eloCalculator';
import {
  weightBySuccessProbability,
  weightedRandomSelect,
  selectTemplateForSkill,
  TARGET_SUCCESS,
  SIGMA,
} from '@/services/adaptive/problemSelector';

describe('problemSelector', () => {
  describe('weightBySuccessProbability', () => {
    it('templates near 85% get highest weight', () => {
      // Student at Elo 1000
      // Template at baseElo 1000 -> expected ~50% success -> far from 85%
      // Template at baseElo 800 -> expected ~76% success -> closer to 85%
      // Template at baseElo ~700 -> expected ~85% success -> near target
      const templates = getTemplatesBySkill('addition.single-digit.no-carry');
      // This skill has template at baseElo 800
      expect(templates.length).toBeGreaterThan(0);

      // Use a broader set to demonstrate weighting
      const allTemplates = [
        ...getTemplatesBySkill('addition.single-digit.no-carry'), // baseElo 800
        ...getTemplatesBySkill('addition.two-digit.no-carry'), // baseElo 1000
      ];
      expect(allTemplates.length).toBeGreaterThanOrEqual(2);

      const weighted = weightBySuccessProbability(1000, allTemplates);

      // The template at baseElo 1000 has ~50% expected success (far from 85%)
      // The template at baseElo 800 has ~76% expected success (closer to 85%)
      const weight800 = weighted.find(
        (w) => w.template.baseElo === 800,
      )!.weight;
      const weight1000 = weighted.find(
        (w) => w.template.baseElo === 1000,
      )!.weight;

      expect(weight800).toBeGreaterThan(weight1000);
    });

    it('templates far from target get near-zero weight', () => {
      // Student at Elo 1400 with template at baseElo 800
      // Expected success is very high (~99%), way above 85%
      const templates = getTemplatesBySkill('addition.single-digit.no-carry');
      const weighted = weightBySuccessProbability(1400, templates);

      // Very high expected success -> very far from 85% -> near-zero weight
      for (const w of weighted) {
        expect(w.weight).toBeLessThan(0.01);
      }
    });

    it('all weights are positive', () => {
      const templates = getTemplatesBySkill('addition.single-digit.no-carry');
      const weighted = weightBySuccessProbability(1000, templates);

      for (const w of weighted) {
        expect(w.weight).toBeGreaterThan(0);
      }
    });
  });

  describe('weightedRandomSelect', () => {
    it('returns a valid template', () => {
      const templates = getTemplatesBySkill('addition.single-digit.no-carry');
      const weighted = weightBySuccessProbability(1000, templates);
      const rng = createRng(42);

      const result = weightedRandomSelect(weighted, rng);
      expect(templates).toContainEqual(result);
    });

    it('is deterministic with same seed', () => {
      const templates = getTemplatesBySkill('addition.two-digit.no-carry');
      const weighted = weightBySuccessProbability(1000, templates);

      const rng1 = createRng(42);
      const result1 = weightedRandomSelect(weighted, rng1);

      const rng2 = createRng(42);
      const result2 = weightedRandomSelect(weighted, rng2);

      expect(result1.id).toBe(result2.id);
    });
  });

  describe('selectTemplateForSkill', () => {
    it('returns template for valid skill', () => {
      const rng = createRng(42);
      const result = selectTemplateForSkill(
        'addition.single-digit.no-carry',
        1000,
        rng,
      );

      expect(result).toBeDefined();
      expect(result.skillId).toBe('addition.single-digit.no-carry');
    });

    it('with frustration filters to easier templates', () => {
      // Student at Elo 1000, frustration active
      // Template for 'addition.single-digit.no-carry' has baseElo 800 (< 1000)
      const rng = createRng(42);
      const result = selectTemplateForSkill(
        'addition.single-digit.no-carry',
        1000,
        rng,
        true,
      );

      // Should pick a template with baseElo <= studentElo
      expect(result.baseElo).toBeLessThanOrEqual(1000);
    });

    it('throws for unknown skill', () => {
      const rng = createRng(42);
      expect(() =>
        selectTemplateForSkill('nonexistent.skill', 1000, rng),
      ).toThrow('No templates found for skill');
    });

    it('statistical distribution: templates near 85% are selected more often', () => {
      // Use a skill set that has templates at different baseElo values
      // We'll use student Elo 950 and mixed templates
      const allTemplates = [
        ...getTemplatesBySkill('addition.single-digit.no-carry'), // baseElo 800
        ...getTemplatesBySkill('addition.within-20.no-carry'), // baseElo 850
        ...getTemplatesBySkill('addition.two-digit.no-carry'), // baseElo 1000
        ...getTemplatesBySkill('addition.three-digit.no-carry'), // baseElo 1150
      ];

      // Compute which template is closest to 85% for student Elo 950
      const weighted = weightBySuccessProbability(950, allTemplates);
      const sorted = [...weighted].sort((a, b) => b.weight - a.weight);
      const bestTemplateId = sorted[0].template.id;

      // Run 1000 iterations and count selections
      const counts: Record<string, number> = {};
      const rng = createRng(12345);
      for (let i = 0; i < 1000; i++) {
        const selected = weightedRandomSelect(weighted, rng);
        counts[selected.id] = (counts[selected.id] ?? 0) + 1;
      }

      // The template with highest weight should be selected most often
      let maxCount = 0;
      let mostFrequentId = '';
      for (const [id, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentId = id;
        }
      }

      expect(mostFrequentId).toBe(bestTemplateId);
    });
  });
});
