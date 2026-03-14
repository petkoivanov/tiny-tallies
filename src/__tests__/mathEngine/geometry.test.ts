import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Geometry Handler', () => {
  describe('Grade 7: complementary angles', () => {
    it('answer + given angle = 90', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_complementary', seed);
        expect(p.operation).toBe('geometry');
        const answer = answerNumericValue(p.correctAnswer);
        const givenAngle = p.operands[0];
        expect(answer + givenAngle).toBe(90);
      }
    });

    it('given angle is a multiple of 5 between 10 and 80', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_complementary', seed);
        const givenAngle = p.operands[0];
        expect(givenAngle % 5).toBe(0);
        expect(givenAngle).toBeGreaterThanOrEqual(10);
        expect(givenAngle).toBeLessThanOrEqual(80);
      }
    });
  });

  describe('Grade 7: supplementary angles', () => {
    it('answer + given angle = 180', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_supplementary', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const givenAngle = p.operands[0];
        expect(answer + givenAngle).toBe(180);
      }
    });

    it('given angle is a multiple of 5 between 10 and 170', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_supplementary', seed);
        const givenAngle = p.operands[0];
        expect(givenAngle % 5).toBe(0);
        expect(givenAngle).toBeGreaterThanOrEqual(10);
        expect(givenAngle).toBeLessThanOrEqual(170);
      }
    });
  });

  describe('Grade 7: circle area', () => {
    it('answer = round(π × r²) with π ≈ 3.14', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_circle_area', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const r = p.operands[0];
        expect(answer).toBe(Math.round(3.14 * r * r));
      }
    });

    it('radius is from the allowed set', () => {
      const allowedRadii = [2, 3, 4, 5, 6, 7, 10];
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_circle_area', seed);
        expect(allowedRadii).toContain(p.operands[0]);
      }
    });
  });

  describe('Grade 7: circle circumference', () => {
    it('answer = round(π × d) with π ≈ 3.14', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_circle_circumference', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const d = p.operands[0];
        expect(answer).toBe(Math.round(3.14 * d));
      }
    });

    it('diameter is from the allowed set', () => {
      const allowedDiameters = [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 20];
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_circle_circumference', seed);
        expect(allowedDiameters).toContain(p.operands[0]);
      }
    });
  });

  describe('Grade 8: Pythagorean theorem', () => {
    it('answer satisfies a² + b² = c²', () => {
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('geom_pythagorean', seed);
        const ops = p.operands;
        // Sort all three operands; largest is hypotenuse
        const sorted = [...ops].sort((a, b) => a - b);
        expect(sorted[0] * sorted[0] + sorted[1] * sorted[1]).toBe(
          sorted[2] * sorted[2],
        );
      }
    });

    it('uses known Pythagorean triples', () => {
      const validTriples = [
        [3, 4, 5],
        [5, 12, 13],
        [6, 8, 10],
        [8, 15, 17],
        [7, 24, 25],
      ];
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_pythagorean', seed);
        const ops = p.operands;
        const sorted = [...ops].sort((a, b) => a - b);
        const match = validTriples.some(
          (t) => t[0] === sorted[0] && t[1] === sorted[1] && t[2] === sorted[2],
        );
        expect(match).toBe(true);
      }
    });
  });

  describe('Grade 8: slope', () => {
    it('answer = (y2 - y1) / (x2 - x1)', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_slope', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const [x1, y1, x2, y2] = p.operands;
        expect(answer).toBe((y2 - y1) / (x2 - x1));
      }
    });

    it('slope is an integer from allowed set', () => {
      const allowedSlopes = [-3, -2, -1, 1, 2, 3];
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('geom_slope', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(allowedSlopes).toContain(answer);
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'geom_complementary',
        'geom_supplementary',
        'geom_circle_area',
        'geom_circle_circumference',
        'geom_pythagorean',
        'geom_slope',
      ];
      for (const templateId of templates) {
        const a = gen(templateId, 42);
        const b = gen(templateId, 42);
        expect(a.questionText).toBe(b.questionText);
        expect(answerNumericValue(a.correctAnswer)).toBe(
          answerNumericValue(b.correctAnswer),
        );
      }
    });
  });

  describe('answer type', () => {
    it('all geometry problems return NumericAnswer', () => {
      const templates = [
        'geom_complementary',
        'geom_supplementary',
        'geom_circle_area',
        'geom_circle_circumference',
        'geom_pythagorean',
        'geom_slope',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
