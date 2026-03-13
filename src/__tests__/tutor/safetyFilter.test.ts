import {
  checkAnswerLeak,
  runSafetyPipeline,
} from '@/services/tutor/safetyFilter';

describe('checkAnswerLeak - negative number fix', () => {
  it('detects exact negative number as standalone: -3', () => {
    const result = checkAnswerLeak('the answer is -3', -3);
    expect(result).toEqual({ safe: false, reason: 'answer_digit_leak' });
  });

  it('detects negative number at start of response', () => {
    const result = checkAnswerLeak('-3 is correct', -3);
    expect(result).toEqual({ safe: false, reason: 'answer_digit_leak' });
  });

  it('does NOT match -3 as substring of -13', () => {
    const result = checkAnswerLeak('try -13 or -30', -3);
    expect(result).toEqual({ safe: true, reason: null });
  });

  it('does NOT match -3 as substring of -30', () => {
    const result = checkAnswerLeak('the number -30 is not the answer', -3);
    expect(result).toEqual({ safe: true, reason: null });
  });

  it('still detects positive number (regression: existing behavior preserved)', () => {
    const result = checkAnswerLeak('the answer is 3', 3);
    expect(result).toEqual({ safe: false, reason: 'answer_digit_leak' });
  });

  it('detects negative answer in indirect phrase: "equals -5" (caught as digit leak)', () => {
    // Pattern 1 (digit match) fires before Pattern 3 (indirect phrase)
    // Both patterns correctly identify the leak; digit match is the first check
    const result = checkAnswerLeak('two plus three equals -5', -5);
    expect(result.safe).toBe(false);
    expect(result.reason).toMatch(/answer_digit_leak|answer_indirect_leak/);
  });
});

describe('runSafetyPipeline - ageBracket 14-18 does not throw', () => {
  it('runs without error for ageBracket 14-18 in hint mode', () => {
    expect(() =>
      runSafetyPipeline('Think about what happens when you subtract.', 42, '14-18', 'hint')
    ).not.toThrow();
  });

  it('runs without error for ageBracket 14-18 in teach mode', () => {
    expect(() =>
      runSafetyPipeline('Let me show you a strategy.', 42, '14-18', 'teach')
    ).not.toThrow();
  });
});
