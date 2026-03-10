import { createRng } from '../../services/mathEngine/seededRng';
import { basicGraphsHandler } from '../../services/mathEngine/domains/basicGraphs';
import { BASIC_GRAPHS_TEMPLATES } from '../../services/mathEngine/templates/basicGraphs';
import { BASIC_GRAPHS_SKILLS } from '../../services/mathEngine/skills/basicGraphs';
import { BASIC_GRAPHS_BUGS } from '../../services/mathEngine/bugLibrary/basicGraphsBugs';
import { generateProblem } from '../../services/mathEngine/generator';

describe('Basic Graphs Domain', () => {
  describe('skills', () => {
    it('has 8 skills', () => {
      expect(BASIC_GRAPHS_SKILLS).toHaveLength(8);
    });

    it('all skills have unique IDs', () => {
      const ids = BASIC_GRAPHS_SKILLS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all skills are basic_graphs operation', () => {
      for (const s of BASIC_GRAPHS_SKILLS) {
        expect(s.operation).toBe('basic_graphs');
      }
    });

    it('covers grades 1-4', () => {
      const grades = new Set(BASIC_GRAPHS_SKILLS.map((s) => s.grade));
      expect(grades).toEqual(new Set([1, 2, 3, 4]));
    });
  });

  describe('templates', () => {
    it('has 8 templates', () => {
      expect(BASIC_GRAPHS_TEMPLATES).toHaveLength(8);
    });

    it('all templates have unique IDs', () => {
      const ids = BASIC_GRAPHS_TEMPLATES.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every template references a valid skill', () => {
      const skillIds = new Set(BASIC_GRAPHS_SKILLS.map((s) => s.id));
      for (const t of BASIC_GRAPHS_TEMPLATES) {
        expect(skillIds.has(t.skillId)).toBe(true);
      }
    });

    it('every skill has at least one template', () => {
      for (const skill of BASIC_GRAPHS_SKILLS) {
        const templates = BASIC_GRAPHS_TEMPLATES.filter(
          (t) => t.skillId === skill.id,
        );
        expect(templates.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('handler - picture graph', () => {
    const pictureTemplate = BASIC_GRAPHS_TEMPLATES.find(
      (t) => t.id === 'bg_picture_read',
    )!;

    it('generates a problem with graphData', () => {
      const rng = createRng(42);
      const result = basicGraphsHandler.generate(pictureTemplate, rng);
      expect(result.correctAnswer).toBeDefined();
      expect(result.questionText).toBeTruthy();
      expect(result.metadata.graphData).toBeDefined();
      expect(result.metadata.graphData!.type).toBe('picture_graph');
    });

    it('graph has 3-4 categories', () => {
      const rng = createRng(42);
      const result = basicGraphsHandler.generate(pictureTemplate, rng);
      const gd = result.metadata.graphData!;
      if (gd.type === 'picture_graph') {
        expect(gd.categories.length).toBeGreaterThanOrEqual(3);
        expect(gd.categories.length).toBeLessThanOrEqual(4);
      }
    });

    it('has an icon', () => {
      const rng = createRng(42);
      const result = basicGraphsHandler.generate(pictureTemplate, rng);
      const gd = result.metadata.graphData!;
      if (gd.type === 'picture_graph') {
        expect(gd.icon.length).toBeGreaterThan(0);
      }
    });

    it('is deterministic with same seed', () => {
      const r1 = basicGraphsHandler.generate(pictureTemplate, createRng(99));
      const r2 = basicGraphsHandler.generate(pictureTemplate, createRng(99));
      expect(r1.questionText).toBe(r2.questionText);
      expect(r1.correctAnswer).toEqual(r2.correctAnswer);
    });
  });

  describe('handler - bar graph', () => {
    const barTemplate = BASIC_GRAPHS_TEMPLATES.find(
      (t) => t.id === 'bg_bar_read',
    )!;

    it('generates a problem with bar graph data', () => {
      const rng = createRng(42);
      const result = basicGraphsHandler.generate(barTemplate, rng);
      expect(result.metadata.graphData).toBeDefined();
      expect(result.metadata.graphData!.type).toBe('bar_graph');
    });

    it('graph has 3-5 categories', () => {
      const rng = createRng(42);
      const result = basicGraphsHandler.generate(barTemplate, rng);
      const gd = result.metadata.graphData!;
      if (gd.type === 'bar_graph') {
        expect(gd.categories.length).toBeGreaterThanOrEqual(3);
        expect(gd.categories.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('handler - tally chart', () => {
    const tallyTemplate = BASIC_GRAPHS_TEMPLATES.find(
      (t) => t.id === 'bg_tally_read',
    )!;

    it('generates a problem with tally chart data', () => {
      const rng = createRng(42);
      const result = basicGraphsHandler.generate(tallyTemplate, rng);
      expect(result.metadata.graphData).toBeDefined();
      expect(result.metadata.graphData!.type).toBe('tally_chart');
    });

    it('generates a question about the data', () => {
      const rng = createRng(42);
      const result = basicGraphsHandler.generate(tallyTemplate, rng);
      expect(result.questionText).toMatch(
        /How many|Which has|difference|total/i,
      );
    });
  });

  describe('handler - scaled picture graph', () => {
    const scaledTemplate = BASIC_GRAPHS_TEMPLATES.find(
      (t) => t.id === 'bg_picture_scaled',
    )!;

    it('generates with scale > 1', () => {
      // Run multiple seeds to find one with scale > 1
      let foundScaled = false;
      for (let seed = 0; seed < 50; seed++) {
        const rng = createRng(seed);
        const result = basicGraphsHandler.generate(scaledTemplate, rng);
        const gd = result.metadata.graphData!;
        if (gd.type === 'picture_graph' && gd.scale > 1) {
          foundScaled = true;
          break;
        }
      }
      expect(foundScaled).toBe(true);
    });
  });

  describe('full problem generation', () => {
    it('generates via generateProblem for all templates', () => {
      for (const template of BASIC_GRAPHS_TEMPLATES) {
        const problem = generateProblem({
          templateId: template.id,
          seed: 42,
        });
        expect(problem.operation).toBe('basic_graphs');
        expect(problem.metadata.graphData).toBeDefined();
        expect(problem.correctAnswer).toBeDefined();
      }
    });

    it('numeric answer is always a non-negative integer', () => {
      for (const template of BASIC_GRAPHS_TEMPLATES) {
        for (let seed = 0; seed < 10; seed++) {
          const problem = generateProblem({
            templateId: template.id,
            seed,
          });
          expect(problem.correctAnswer.type).toBe('numeric');
          if (problem.correctAnswer.type === 'numeric') {
            expect(problem.correctAnswer.value).toBeGreaterThanOrEqual(0);
            expect(Number.isInteger(problem.correctAnswer.value)).toBe(true);
          }
        }
      }
    });
  });

  describe('bug patterns', () => {
    it('has 6 bug patterns', () => {
      expect(BASIC_GRAPHS_BUGS).toHaveLength(6);
    });

    it('all patterns have unique IDs', () => {
      const ids = BASIC_GRAPHS_BUGS.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all patterns target basic_graphs', () => {
      for (const bug of BASIC_GRAPHS_BUGS) {
        expect(bug.operations).toContain('basic_graphs');
      }
    });

    it('bug compute functions return numbers or null', () => {
      for (const bug of BASIC_GRAPHS_BUGS) {
        const result = bug.compute(5, 3, 'basic_graphs');
        expect(result === null || typeof result === 'number').toBe(true);
      }
    });
  });
});
