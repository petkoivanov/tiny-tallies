import type { BugPattern } from './types';

export const MEASUREMENT_BUGS: readonly BugPattern[] = [
  {
    id: 'meas_wrong_direction',
    operations: ['measurement'],
    description: 'Multiplies instead of dividing (or vice versa) when converting units',
    minDigits: 1,
    compute(a, b, _op) {
      // a = value, b = conversion factor
      // Child multiplies when should divide (e.g., 36 inches → 36×12 instead of 36÷12)
      if (b === 0) return null;
      const correct = a / b;
      if (!Number.isInteger(correct)) return null;
      const wrong = a * b;
      return wrong !== correct ? wrong : null;
    },
  },
  {
    id: 'meas_off_by_one_unit',
    operations: ['measurement'],
    description: 'Off by one in the converted value',
    minDigits: 1,
    compute(a, b, _op) {
      if (b === 0) return null;
      const correct = a / b;
      if (!Number.isInteger(correct)) return null;
      return correct + 1;
    },
  },
  {
    id: 'meas_uses_operand',
    operations: ['measurement'],
    description: 'Returns the original value unchanged',
    minDigits: 1,
    compute(a, b, _op) {
      if (b === 0) return null;
      const correct = a / b;
      return a !== correct ? a : null;
    },
  },
  {
    id: 'meas_wrong_factor',
    operations: ['measurement'],
    description: 'Uses a nearby conversion factor (e.g., 10 instead of 12 for inches/feet)',
    minDigits: 1,
    compute(a, b, _op) {
      if (b === 0) return null;
      const correct = a / b;
      // Try a nearby factor
      const nearbyFactor = b === 12 ? 10 : b === 100 ? 10 : b + 1;
      if (nearbyFactor === 0) return null;
      const wrong = Math.round(a / nearbyFactor);
      return wrong !== correct && wrong > 0 ? wrong : null;
    },
  },
];
