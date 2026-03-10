import { createRng } from '../../services/mathEngine/seededRng';
import { dataAnalysisHandler } from '../../services/mathEngine/domains/dataAnalysis';
import { DATA_ANALYSIS_TEMPLATES } from '../../services/mathEngine/templates/dataAnalysis';
import { DATA_ANALYSIS_SKILLS } from '../../services/mathEngine/skills/dataAnalysis';
import { DATA_ANALYSIS_BUGS } from '../../services/mathEngine/bugLibrary/dataAnalysisBugs';
import { generateProblem } from '../../services/mathEngine/generator';

describe('Data Analysis Domain', () => {
  describe('skills', () => {
    it('has 11 skills', () => {
      expect(DATA_ANALYSIS_SKILLS).toHaveLength(11);
    });

    it('all skills have unique IDs', () => {
      const ids = DATA_ANALYSIS_SKILLS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all skills are data_analysis operation', () => {
      for (const s of DATA_ANALYSIS_SKILLS) {
        expect(s.operation).toBe('data_analysis');
      }
    });

    it('covers grades 4-8', () => {
      const grades = new Set(DATA_ANALYSIS_SKILLS.map((s) => s.grade));
      expect(grades).toEqual(new Set([4, 5, 6, 7, 8]));
    });
  });

  describe('templates', () => {
    it('has 11 templates', () => {
      expect(DATA_ANALYSIS_TEMPLATES).toHaveLength(11);
    });

    it('all templates have unique IDs', () => {
      const ids = DATA_ANALYSIS_TEMPLATES.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every template references a valid skill', () => {
      const skillIds = new Set(DATA_ANALYSIS_SKILLS.map((s) => s.id));
      for (const t of DATA_ANALYSIS_TEMPLATES) {
        expect(skillIds.has(t.skillId)).toBe(true);
      }
    });

    it('every skill has at least one template', () => {
      for (const skill of DATA_ANALYSIS_SKILLS) {
        const templates = DATA_ANALYSIS_TEMPLATES.filter(
          (t) => t.skillId === skill.id,
        );
        expect(templates.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('handler - dot plot', () => {
    const dotTemplate = DATA_ANALYSIS_TEMPLATES.find(
      (t) => t.id === 'da_dot_plot_read',
    )!;

    it('generates a problem with dot plot data', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(dotTemplate, rng);
      expect(result.correctAnswer).toBeDefined();
      expect(result.questionText).toBeTruthy();
      expect(result.metadata.graphData).toBeDefined();
      expect(result.metadata.graphData!.type).toBe('dot_plot');
    });

    it('dot plot has values array', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(dotTemplate, rng);
      const gd = result.metadata.graphData!;
      if (gd.type === 'dot_plot') {
        expect(gd.values.length).toBeGreaterThanOrEqual(10);
        expect(gd.values.length).toBeLessThanOrEqual(18);
      }
    });

    it('is deterministic with same seed', () => {
      const r1 = dataAnalysisHandler.generate(dotTemplate, createRng(99));
      const r2 = dataAnalysisHandler.generate(dotTemplate, createRng(99));
      expect(r1.questionText).toBe(r2.questionText);
      expect(r1.correctAnswer).toEqual(r2.correctAnswer);
    });
  });

  describe('handler - histogram', () => {
    const histTemplate = DATA_ANALYSIS_TEMPLATES.find(
      (t) => t.id === 'da_histogram_read',
    )!;

    it('generates a problem with histogram data', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(histTemplate, rng);
      expect(result.metadata.graphData).toBeDefined();
      expect(result.metadata.graphData!.type).toBe('histogram');
    });

    it('histogram has 4-6 bins', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(histTemplate, rng);
      const gd = result.metadata.graphData!;
      if (gd.type === 'histogram') {
        expect(gd.bins.length).toBeGreaterThanOrEqual(4);
        expect(gd.bins.length).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('handler - box plot', () => {
    const boxTemplate = DATA_ANALYSIS_TEMPLATES.find(
      (t) => t.id === 'da_box_plot_read',
    )!;

    it('generates a problem with box plot data', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(boxTemplate, rng);
      expect(result.metadata.graphData).toBeDefined();
      expect(result.metadata.graphData!.type).toBe('box_plot');
    });

    it('box plot has valid quartile structure', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(boxTemplate, rng);
      const gd = result.metadata.graphData!;
      if (gd.type === 'box_plot') {
        expect(gd.min).toBeLessThanOrEqual(gd.q1);
        expect(gd.q1).toBeLessThanOrEqual(gd.median);
        expect(gd.median).toBeLessThanOrEqual(gd.q3);
        expect(gd.q3).toBeLessThanOrEqual(gd.max);
      }
    });

    it('generates question about median, range, or IQR', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(boxTemplate, rng);
      expect(result.questionText).toMatch(
        /median|range|interquartile|Q1|Q3/i,
      );
    });
  });

  describe('handler - scatter plot', () => {
    const scatterTemplate = DATA_ANALYSIS_TEMPLATES.find(
      (t) => t.id === 'da_scatter_read',
    )!;

    it('generates a problem with scatter plot data', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(scatterTemplate, rng);
      expect(result.metadata.graphData).toBeDefined();
      expect(result.metadata.graphData!.type).toBe('scatter_plot');
    });

    it('scatter plot has 8-14 points', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(scatterTemplate, rng);
      const gd = result.metadata.graphData!;
      if (gd.type === 'scatter_plot') {
        expect(gd.points.length).toBeGreaterThanOrEqual(8);
        expect(gd.points.length).toBeLessThanOrEqual(14);
      }
    });

    it('scatter plot has trend line', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(scatterTemplate, rng);
      const gd = result.metadata.graphData!;
      if (gd.type === 'scatter_plot') {
        expect(gd.trendLine).toBeDefined();
        expect(typeof gd.trendLine!.slope).toBe('number');
        expect(typeof gd.trendLine!.intercept).toBe('number');
      }
    });
  });

  describe('handler - central tendency', () => {
    const meanTemplate = DATA_ANALYSIS_TEMPLATES.find(
      (t) => t.id === 'da_mean',
    )!;

    it('generates a problem with data set', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(meanTemplate, rng);
      expect(result.correctAnswer).toBeDefined();
      expect(result.questionText).toMatch(/mean|range|median|mode/i);
    });

    it('shows data as dot plot for visual context', () => {
      const rng = createRng(42);
      const result = dataAnalysisHandler.generate(meanTemplate, rng);
      expect(result.metadata.graphData).toBeDefined();
      expect(result.metadata.graphData!.type).toBe('dot_plot');
    });
  });

  describe('full problem generation', () => {
    it('generates via generateProblem for all templates', () => {
      for (const template of DATA_ANALYSIS_TEMPLATES) {
        const problem = generateProblem({
          templateId: template.id,
          seed: 42,
        });
        expect(problem.operation).toBe('data_analysis');
        expect(problem.metadata.graphData).toBeDefined();
        expect(problem.correctAnswer).toBeDefined();
      }
    });

    it('numeric answer is always a non-negative integer', () => {
      for (const template of DATA_ANALYSIS_TEMPLATES) {
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
      expect(DATA_ANALYSIS_BUGS).toHaveLength(6);
    });

    it('all patterns have unique IDs', () => {
      const ids = DATA_ANALYSIS_BUGS.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all patterns target data_analysis', () => {
      for (const bug of DATA_ANALYSIS_BUGS) {
        expect(bug.operations).toContain('data_analysis');
      }
    });

    it('bug compute functions return numbers or null', () => {
      for (const bug of DATA_ANALYSIS_BUGS) {
        const result = bug.compute(5, 3, 'data_analysis');
        expect(result === null || typeof result === 'number').toBe(true);
      }
    });
  });
});
