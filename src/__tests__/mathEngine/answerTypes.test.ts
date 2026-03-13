// Wave 0 stubs for FOUND-06 (multi_select answer type) — PLAN 080-01
// These tests FAIL in RED state because setsEqual, multiSelectAnswer, and
// the multi_select case in answerNumericValue do not yet exist.

// No mocks needed — pure function tests
import {
  setsEqual,
  multiSelectAnswer,
  answerNumericValue,
} from '@/services/mathEngine/types';

describe('setsEqual', () => {
  it('returns true when arrays contain same values in different order', () => {
    expect(setsEqual([1, 2], [2, 1])).toBe(true);
  });

  it('returns false when arrays differ in at least one value', () => {
    expect(setsEqual([1, 2], [1, 3])).toBe(false);
  });

  it('returns false when arrays have different lengths', () => {
    expect(setsEqual([1], [1, 2])).toBe(false);
  });
});

describe('multiSelectAnswer', () => {
  it('returns an object with type "multi_select" and the provided values', () => {
    const result = multiSelectAnswer([1, -3]);
    expect(result).toEqual({ type: 'multi_select', values: [1, -3] });
  });
});

describe('answerNumericValue multi_select', () => {
  it('returns the first value as Elo proxy for a multi_select answer', () => {
    // multiSelectAnswer does not exist yet — this import will fail until Plan 02
    const answer = multiSelectAnswer([3, -3]);
    expect(answerNumericValue(answer)).toBe(3);
  });
});
