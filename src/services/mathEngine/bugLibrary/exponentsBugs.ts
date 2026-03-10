import type { BugPattern } from './types';

export const EXPONENTS_BUGS: readonly BugPattern[] = [
  {
    id: 'exp_multiply_instead',
    operations: ['exponents'],
    description: 'Multiplies base × exponent instead of raising to power (e.g., 3² = 6 instead of 9)',
    minDigits: 1,
    compute(a, b, _op) {
      // a = base, b = exponent
      const correct = Math.pow(a, b);
      const wrong = a * b;
      return wrong !== correct && wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'exp_add_instead',
    operations: ['exponents'],
    description: 'Adds base + exponent instead of raising to power (e.g., 3² = 5 instead of 9)',
    minDigits: 1,
    compute(a, b, _op) {
      const correct = Math.pow(a, b);
      const wrong = a + b;
      return wrong !== correct && wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'exp_wrong_exponent',
    operations: ['exponents'],
    description: 'Uses exponent ± 1 (e.g., 2³ = 4 instead of 8)',
    minDigits: 1,
    compute(a, b, _op) {
      if (b <= 1) return null;
      const correct = Math.pow(a, b);
      const wrong = Math.pow(a, b - 1);
      return wrong !== correct && wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'exp_swap_base_exp',
    operations: ['exponents'],
    description: 'Swaps base and exponent (e.g., 2⁵ → 5² = 25 instead of 32)',
    minDigits: 1,
    compute(a, b, _op) {
      if (a === b) return null;
      const correct = Math.pow(a, b);
      const wrong = Math.pow(b, a);
      return wrong !== correct && wrong > 0 && Number.isFinite(wrong) ? wrong : null;
    },
  },
  {
    id: 'exp_off_by_one_base',
    operations: ['exponents'],
    description: 'Uses adjacent base (e.g., 4² = 25 instead of 16)',
    minDigits: 1,
    compute(a, b, _op) {
      const correct = Math.pow(a, b);
      const wrong = Math.pow(a + 1, b);
      return wrong !== correct && wrong > 0 && Number.isFinite(wrong) ? wrong : null;
    },
  },
];
