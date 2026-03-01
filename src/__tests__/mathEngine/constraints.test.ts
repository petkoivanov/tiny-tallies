import {
  requiresCarry,
  requiresBorrow,
  validateOperands,
} from '../../services/mathEngine/constraints';

describe('requiresCarry', () => {
  it('returns false for 2 + 3 (no carry)', () => {
    expect(requiresCarry(2, 3)).toBe(false);
  });

  it('returns true for 7 + 5 (ones carry)', () => {
    expect(requiresCarry(7, 5)).toBe(true);
  });

  it('returns false for 11 + 22 (no carry in any column)', () => {
    expect(requiresCarry(11, 22)).toBe(false);
  });

  it('returns true for 15 + 16 (ones carry)', () => {
    expect(requiresCarry(15, 16)).toBe(true);
  });

  it('returns true for 50 + 60 (tens carry)', () => {
    expect(requiresCarry(50, 60)).toBe(true);
  });

  it('returns true for 199 + 801 (carries in multiple columns)', () => {
    expect(requiresCarry(199, 801)).toBe(true);
  });

  it('returns false for 100 + 200 (no carry)', () => {
    expect(requiresCarry(100, 200)).toBe(false);
  });
});

describe('requiresBorrow', () => {
  it('returns false for 8 - 3 (no borrow)', () => {
    expect(requiresBorrow(8, 3)).toBe(false);
  });

  it('returns true for 12 - 5 (ones borrow)', () => {
    expect(requiresBorrow(12, 5)).toBe(true);
  });

  it('returns false for 45 - 23 (no borrow in any column)', () => {
    expect(requiresBorrow(45, 23)).toBe(false);
  });

  it('returns true for 42 - 17 (ones borrow)', () => {
    expect(requiresBorrow(42, 17)).toBe(true);
  });

  it('returns true for 302 - 150 (tens borrow)', () => {
    expect(requiresBorrow(302, 150)).toBe(true);
  });

  it('returns true for 500 - 301 (hundreds borrow via tens)', () => {
    expect(requiresBorrow(500, 301)).toBe(true);
  });
});

describe('validateOperands', () => {
  it('accepts valid non-negative integers', () => {
    expect(() => validateOperands(5, 10)).not.toThrow();
  });

  it('throws for negative operands', () => {
    expect(() => validateOperands(-1, 5)).toThrow(
      'Operands must be non-negative',
    );
  });

  it('throws for non-integer operands', () => {
    expect(() => validateOperands(3.5, 2)).toThrow(
      'Operands must be integers',
    );
  });
});
