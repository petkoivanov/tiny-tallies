import {
  checkAnswerLeak,
  validateContent,
  scrubOutboundPii,
  runSafetyPipeline,
} from '../safetyFilter';

// --- checkAnswerLeak ---

describe('checkAnswerLeak', () => {
  describe('digit leak detection', () => {
    it('detects "the answer is 7" when answer is 7', () => {
      const result = checkAnswerLeak('the answer is 7', 7);
      expect(result).toEqual({ safe: false, reason: 'answer_digit_leak' });
    });

    it('does NOT flag "the answer is 17" when answer is 7 (word boundary)', () => {
      const result = checkAnswerLeak('the answer is 17', 7);
      expect(result).toEqual({ safe: true, reason: null });
    });

    it('detects standalone digit in various positions', () => {
      expect(checkAnswerLeak('7 is the number', 7).safe).toBe(false);
      expect(checkAnswerLeak('you get 7', 7).safe).toBe(false);
    });

    it('handles large numbers like 100', () => {
      const result = checkAnswerLeak('the result is 100', 100);
      expect(result).toEqual({ safe: false, reason: 'answer_digit_leak' });
    });

    it('does NOT flag 100 when answer is 10 (word boundary)', () => {
      const result = checkAnswerLeak('there are 100 apples', 10);
      expect(result).toEqual({ safe: true, reason: null });
    });
  });

  describe('word leak detection', () => {
    it('detects "you need seven more" when answer is 7', () => {
      const result = checkAnswerLeak('you need seven more', 7);
      expect(result).toEqual({ safe: false, reason: 'answer_word_leak' });
    });

    it('does NOT flag "seventy" when answer is 7', () => {
      const result = checkAnswerLeak('you got seventy', 7);
      expect(result).toEqual({ safe: true, reason: null });
    });

    it('detects spelled-out number in any case', () => {
      const result = checkAnswerLeak('The answer is Seven!', 7);
      expect(result.safe).toBe(false);
    });

    it('detects "twenty-one" when answer is 21', () => {
      const result = checkAnswerLeak('you need twenty-one', 21);
      expect(result).toEqual({ safe: false, reason: 'answer_word_leak' });
    });
  });

  describe('indirect leak detection', () => {
    it('detects "it equals 7" when answer is 7 (caught as digit leak since digit check runs first)', () => {
      const result = checkAnswerLeak('it equals 7', 7);
      // "7" as standalone digit is caught by Pattern 1 (digit leak) before Pattern 3 (indirect)
      expect(result).toEqual({ safe: false, reason: 'answer_digit_leak' });
    });

    it('detects indirect pattern "gives 42" for multi-digit answer', () => {
      // Use a number where only the indirect pattern matches (not standalone digit in other context)
      const result = checkAnswerLeak('that gives 42 total', 42);
      // Pattern 1 catches the standalone "42" first
      expect(result.safe).toBe(false);
    });

    it('detects "it equals seven" when answer is 7 (caught as word leak since word check runs first)', () => {
      const result = checkAnswerLeak('it equals seven', 7);
      // "seven" as standalone word is caught by Pattern 2 (word leak) before Pattern 3 (indirect)
      expect(result).toEqual({ safe: false, reason: 'answer_word_leak' });
    });

    it('detects "you get 7" with indirect pattern', () => {
      const result = checkAnswerLeak('you get 7 when you add them', 7);
      // This matches digit leak first (word boundary match on "7")
      expect(result.safe).toBe(false);
    });

    it('detects "makes seven" pattern', () => {
      const result = checkAnswerLeak('adding them makes seven', 7);
      expect(result.safe).toBe(false);
    });
  });

  describe('safe responses (no leak)', () => {
    it('allows "try counting on your fingers" (no answer mention)', () => {
      const result = checkAnswerLeak('try counting on your fingers', 7);
      expect(result).toEqual({ safe: true, reason: null });
    });

    it('allows "think about what comes after 6" (6 is not the answer)', () => {
      const result = checkAnswerLeak('think about what comes after 6', 7);
      // 6 != 7, so safe
      expect(result).toEqual({ safe: true, reason: null });
    });

    it('allows "try adding 3 and 4" (operands, not answer)', () => {
      const result = checkAnswerLeak('try adding 3 and 4', 7);
      expect(result).toEqual({ safe: true, reason: null });
    });

    it('allows generic encouragement', () => {
      const result = checkAnswerLeak("Great thinking! You're almost there!", 12);
      expect(result).toEqual({ safe: true, reason: null });
    });

    it('handles empty response', () => {
      const result = checkAnswerLeak('', 5);
      expect(result).toEqual({ safe: true, reason: null });
    });
  });

  describe('case insensitivity', () => {
    it('detects answer in uppercase text', () => {
      const result = checkAnswerLeak('THE ANSWER IS SEVEN', 7);
      expect(result.safe).toBe(false);
    });

    it('detects answer in mixed case', () => {
      const result = checkAnswerLeak('It Is Seven!', 7);
      expect(result.safe).toBe(false);
    });
  });
});

// --- validateContent ---

describe('validateContent', () => {
  describe('valid content', () => {
    it('accepts a short sentence for 6-7 bracket', () => {
      const result = validateContent('Good job here.', '6-7');
      expect(result).toEqual({ valid: true, reason: null });
    });

    it('accepts multiple short sentences', () => {
      const result = validateContent('Good job! Keep going! Try again.', '6-7');
      expect(result).toEqual({ valid: true, reason: null });
    });

    it('accepts longer sentences for older bracket', () => {
      const result = validateContent(
        'You are doing great with this math problem today.',
        '8-9',
      );
      expect(result).toEqual({ valid: true, reason: null });
    });
  });

  describe('too many sentences', () => {
    it('rejects 5 sentences (max is 4)', () => {
      const result = validateContent(
        'One. Two. Three. Four. Five.',
        '6-7',
      );
      expect(result).toEqual({ valid: false, reason: 'too_many_sentences' });
    });

    it('accepts exactly 4 sentences', () => {
      const result = validateContent(
        'One. Two. Three. Four.',
        '6-7',
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('sentence too long', () => {
    it('rejects a 12-word sentence for 6-7 bracket (max 8)', () => {
      const result = validateContent(
        'This is a very long sentence with many many many more words.',
        '6-7',
      );
      expect(result).toEqual({ valid: false, reason: 'sentence_too_long' });
    });

    it('accepts an 8-word sentence for 6-7 bracket', () => {
      const result = validateContent(
        'Try to count on your hands now.',
        '6-7',
      );
      expect(result).toEqual({ valid: true, reason: null });
    });

    it('rejects 11-word sentence for 7-8 bracket (max 10)', () => {
      const result = validateContent(
        'This is a sentence that has way too many words here.',
        '7-8',
      );
      expect(result).toEqual({ valid: false, reason: 'sentence_too_long' });
    });
  });

  describe('vocabulary too complex', () => {
    it('rejects "understanding" (13 chars) for 6-7 bracket (max 7)', () => {
      const result = validateContent('Try understanding it.', '6-7');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('vocabulary_too_complex');
      expect(result.complexWords).toContain('understanding');
    });

    it('accepts simple words for 6-7 bracket', () => {
      const result = validateContent('Try to count.', '6-7');
      expect(result).toEqual({ valid: true, reason: null });
    });

    it('accepts longer words for 8-9 bracket', () => {
      // "carefully" = 9 chars, within limit for 8-9 (max 9)
      const result = validateContent('Look carefully.', '8-9');
      expect(result).toEqual({ valid: true, reason: null });
    });

    it('rejects "calculating" (11 chars) for 8-9 bracket (max 9)', () => {
      const result = validateContent('Try calculating.', '8-9');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('vocabulary_too_complex');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      const result = validateContent('', '6-7');
      expect(result).toEqual({ valid: true, reason: null });
    });

    it('handles trailing punctuation with no content', () => {
      const result = validateContent('Hello!', '6-7');
      expect(result).toEqual({ valid: true, reason: null });
    });
  });
});

// --- scrubOutboundPii ---

describe('scrubOutboundPii', () => {
  it('removes child name "Emma" from prompts, replacing with "the child"', () => {
    const result = scrubOutboundPii(
      'Help Emma learn math.',
      'Emma is stuck on this problem.',
      'Emma',
      null,
    );
    expect(result.systemInstruction).toBe('Help the child learn math.');
    expect(result.userMessage).toBe('the child is stuck on this problem.');
    expect(result.piiFound).toBe(true);
  });

  it('removes "7 years old" pattern, replacing with "the child"', () => {
    const result = scrubOutboundPii(
      'The student is 7 years old.',
      'A 7 year old child.',
      null,
      7,
    );
    expect(result.systemInstruction).toBe('The student is the child.');
    expect(result.userMessage).toBe('A the child child.');
    expect(result.piiFound).toBe(true);
  });

  it('removes "age: 7" pattern', () => {
    const result = scrubOutboundPii(
      'age: 7 student',
      'learning math',
      null,
      7,
    );
    expect(result.systemInstruction).toContain('the child');
    expect(result.systemInstruction).not.toMatch(/age:\s*7/);
    expect(result.piiFound).toBe(true);
  });

  it('removes "7-year" pattern', () => {
    const result = scrubOutboundPii(
      'A 7-year old student.',
      'help them',
      null,
      7,
    );
    expect(result.systemInstruction).toContain('the child');
    expect(result.piiFound).toBe(true);
  });

  it('returns unchanged strings with piiFound=false when no PII present', () => {
    const result = scrubOutboundPii(
      'Help the student learn math.',
      'The student is working on addition.',
      null,
      null,
    );
    expect(result.systemInstruction).toBe('Help the student learn math.');
    expect(result.userMessage).toBe('The student is working on addition.');
    expect(result.piiFound).toBe(false);
  });

  it('handles null name and null age', () => {
    const result = scrubOutboundPii(
      'system instruction',
      'user message',
      null,
      null,
    );
    expect(result.piiFound).toBe(false);
    expect(result.systemInstruction).toBe('system instruction');
    expect(result.userMessage).toBe('user message');
  });

  it('handles case-insensitive name matching', () => {
    const result = scrubOutboundPii(
      'EMMA needs help.',
      'emma is learning.',
      'Emma',
      null,
    );
    expect(result.systemInstruction).toBe('the child needs help.');
    expect(result.userMessage).toBe('the child is learning.');
    expect(result.piiFound).toBe(true);
  });

  it('handles empty name string (treated as no name)', () => {
    const result = scrubOutboundPii(
      'system instruction',
      'user message',
      '',
      null,
    );
    expect(result.piiFound).toBe(false);
  });
});

// --- runSafetyPipeline ---

describe('runSafetyPipeline', () => {
  it('returns { passed: true, text } when all checks pass', () => {
    const result = runSafetyPipeline('Good job! Try again.', 7, '6-7');
    expect(result).toEqual({ passed: true, text: 'Good job! Try again.' });
  });

  it('returns { passed: false, fallbackCategory: "answer_leaked" } when answer leaks', () => {
    const result = runSafetyPipeline('The answer is 7!', 7, '6-7');
    expect(result.passed).toBe(false);
    if (!result.passed) {
      expect(result.fallbackCategory).toBe('answer_leaked');
      expect(result.reason).toBeTruthy();
    }
  });

  it('returns { passed: false, fallbackCategory: "content_invalid" } when content validation fails', () => {
    // 5 sentences exceeds MAX_SENTENCES of 4
    const result = runSafetyPipeline(
      'One. Two. Three. Four. Five.',
      99,
      '6-7',
    );
    expect(result.passed).toBe(false);
    if (!result.passed) {
      expect(result.fallbackCategory).toBe('content_invalid');
      expect(result.reason).toBeTruthy();
    }
  });

  it('checks answer leak before content validation', () => {
    // This response both leaks the answer AND has too many sentences
    const result = runSafetyPipeline(
      'The answer is 5. Really. It is. Five. Yes.',
      5,
      '6-7',
    );
    expect(result.passed).toBe(false);
    if (!result.passed) {
      // Should catch answer leak first
      expect(result.fallbackCategory).toBe('answer_leaked');
    }
  });

  it('handles word-form answer leak', () => {
    const result = runSafetyPipeline('You need twelve more.', 12, '6-7');
    expect(result.passed).toBe(false);
    if (!result.passed) {
      expect(result.fallbackCategory).toBe('answer_leaked');
    }
  });
});
