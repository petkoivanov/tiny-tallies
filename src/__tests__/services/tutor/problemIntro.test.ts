import { getProblemIntro } from '@/services/tutor/problemIntro';
import { SKILLS } from '@/services/mathEngine/skills';
import type { MathDomain } from '@/services/mathEngine/types';

describe('problemIntro domain coverage', () => {
  const uniqueDomains = [...new Set(SKILLS.map((s) => s.operation))];

  const HS_DOMAINS: MathDomain[] = [
    'linear_equations',
    'coordinate_geometry',
    'sequences_series',
    'statistics_hs',
    'systems_equations',
    'quadratic_equations',
    'polynomials',
    'exponential_functions',
    'logarithms',
  ];

  it('has exactly 27 unique domains registered in SKILLS', () => {
    expect(uniqueDomains.length).toBe(27);
  });

  it('every domain has a non-empty intro string', () => {
    const defaultIntro = "Think about what numbers are given and the relationship between them.";
    for (const domain of uniqueDomains) {
      const intro = getProblemIntro(domain);
      expect(intro).toBeTruthy();
      expect(intro).not.toBe('');
      expect(intro).not.toBe(defaultIntro);
    }
  });

  it.each(HS_DOMAINS)('HS domain "%s" has a custom intro string', (domain) => {
    const defaultIntro = "Think about what numbers are given and the relationship between them.";
    const intro = getProblemIntro(domain);
    expect(intro).toBeTruthy();
    expect(intro).not.toBe(defaultIntro);
  });
});
