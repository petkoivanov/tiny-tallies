import { videoMap } from '@/services/video/videoMap';
import type { MathDomain } from '@/services/mathEngine/types';

const ALL_18_DOMAINS: MathDomain[] = [
  'addition', 'subtraction', 'multiplication', 'division',
  'fractions', 'place_value', 'time', 'money',
  'patterns', 'measurement', 'ratios', 'exponents',
  'expressions', 'geometry', 'probability', 'number_theory',
  'basic_graphs', 'data_analysis',
];

describe('videoMap', () => {
  it('covers all 18 existing MathDomain values with non-empty string IDs', () => {
    for (const domain of ALL_18_DOMAINS) {
      const id = videoMap[domain];
      expect(typeof id).toBe('string');
      expect((id as string).length).toBeGreaterThan(0);
    }
  });

  it('does not contain undefined values for existing domains', () => {
    for (const domain of ALL_18_DOMAINS) {
      expect(videoMap[domain]).toBeDefined();
    }
  });
});
