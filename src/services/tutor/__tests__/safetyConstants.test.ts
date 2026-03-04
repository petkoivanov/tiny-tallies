import {
  GEMINI_SAFETY_SETTINGS,
  NUMBER_WORDS,
  CANNED_FALLBACKS,
  getCannedFallback,
  numberToWord,
  CONTENT_WORD_LIMITS,
  MAX_SENTENCES,
  MAX_WORD_LENGTH,
} from '../safetyConstants';
import type { FallbackCategory } from '../safetyTypes';

// --- GEMINI_SAFETY_SETTINGS ---

describe('GEMINI_SAFETY_SETTINGS', () => {
  it('has exactly 4 entries', () => {
    expect(GEMINI_SAFETY_SETTINGS).toHaveLength(4);
  });

  it('covers all 4 harm categories', () => {
    const categories = GEMINI_SAFETY_SETTINGS.map((s) => s.category);
    expect(categories).toContain('HARM_CATEGORY_HARASSMENT');
    expect(categories).toContain('HARM_CATEGORY_HATE_SPEECH');
    expect(categories).toContain('HARM_CATEGORY_SEXUALLY_EXPLICIT');
    expect(categories).toContain('HARM_CATEGORY_DANGEROUS_CONTENT');
  });

  it('sets all thresholds to BLOCK_LOW_AND_ABOVE', () => {
    for (const setting of GEMINI_SAFETY_SETTINGS) {
      expect(setting.threshold).toBe('BLOCK_LOW_AND_ABOVE');
    }
  });
});

// --- numberToWord ---

describe('numberToWord', () => {
  it('returns "zero" for 0', () => {
    expect(numberToWord(0)).toBe('zero');
  });

  it('returns "seven" for 7', () => {
    expect(numberToWord(7)).toBe('seven');
  });

  it('returns "twenty" for 20', () => {
    expect(numberToWord(20)).toBe('twenty');
  });

  it('returns "twenty-one" for 21', () => {
    expect(numberToWord(21)).toBe('twenty-one');
  });

  it('returns "ninety-nine" for 99', () => {
    expect(numberToWord(99)).toBe('ninety-nine');
  });

  it('returns "one hundred" for 100', () => {
    expect(numberToWord(100)).toBe('one hundred');
  });

  it('returns compound for 101-199 (e.g. "one hundred one" for 101)', () => {
    expect(numberToWord(101)).toBe('one hundred one');
  });

  it('returns compound for 155 ("one hundred fifty-five")', () => {
    expect(numberToWord(155)).toBe('one hundred fifty-five');
  });

  it('returns "two hundred" for 200', () => {
    expect(numberToWord(200)).toBe('two hundred');
  });

  it('returns null for -1 (below range)', () => {
    expect(numberToWord(-1)).toBeNull();
  });

  it('returns null for 201 (above range)', () => {
    expect(numberToWord(201)).toBeNull();
  });

  it('returns null for 1.5 (non-integer)', () => {
    expect(numberToWord(1.5)).toBeNull();
  });

  it('handles all single digits 0-9', () => {
    const expected = [
      'zero', 'one', 'two', 'three', 'four',
      'five', 'six', 'seven', 'eight', 'nine',
    ];
    for (let i = 0; i <= 9; i++) {
      expect(numberToWord(i)).toBe(expected[i]);
    }
  });

  it('handles teens 10-19', () => {
    const expected = [
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
      'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
    ];
    for (let i = 10; i <= 19; i++) {
      expect(numberToWord(i)).toBe(expected[i - 10]);
    }
  });

  it('handles round tens (30, 40, ..., 90)', () => {
    const expected: Record<number, string> = {
      30: 'thirty', 40: 'forty', 50: 'fifty',
      60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety',
    };
    for (const [num, word] of Object.entries(expected)) {
      expect(numberToWord(Number(num))).toBe(word);
    }
  });
});

// --- NUMBER_WORDS ---

describe('NUMBER_WORDS', () => {
  it('has entries for 0-20 and round tens', () => {
    expect(NUMBER_WORDS[0]).toBe('zero');
    expect(NUMBER_WORDS[20]).toBe('twenty');
    expect(NUMBER_WORDS[100]).toBe('one hundred');
  });
});

// --- CANNED_FALLBACKS ---

describe('CANNED_FALLBACKS', () => {
  const ALL_CATEGORIES: FallbackCategory[] = [
    'safety_blocked',
    'answer_leaked',
    'content_invalid',
    'timeout',
    'error',
    'rate_limited',
  ];

  it('has entries for all 6 categories', () => {
    for (const category of ALL_CATEGORIES) {
      expect(CANNED_FALLBACKS[category]).toBeDefined();
      expect(Array.isArray(CANNED_FALLBACKS[category])).toBe(true);
      expect(CANNED_FALLBACKS[category].length).toBeGreaterThan(0);
    }
  });

  it('no fallback message contains template syntax', () => {
    for (const category of ALL_CATEGORIES) {
      for (const message of CANNED_FALLBACKS[category]) {
        expect(message).not.toMatch(/\$\{/);
        expect(message).not.toMatch(/\{\{/);
        expect(message).not.toMatch(/\[name\]/i);
        expect(message).not.toMatch(/\[age\]/i);
      }
    }
  });

  it('all fallback messages are non-empty strings', () => {
    for (const category of ALL_CATEGORIES) {
      for (const message of CANNED_FALLBACKS[category]) {
        expect(typeof message).toBe('string');
        expect(message.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

// --- getCannedFallback ---

describe('getCannedFallback', () => {
  const ALL_CATEGORIES: FallbackCategory[] = [
    'safety_blocked',
    'answer_leaked',
    'content_invalid',
    'timeout',
    'error',
    'rate_limited',
  ];

  it('returns a non-empty string for every FallbackCategory', () => {
    for (const category of ALL_CATEGORIES) {
      const result = getCannedFallback(category);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it('returns a message from the correct category array', () => {
    for (const category of ALL_CATEGORIES) {
      const result = getCannedFallback(category);
      expect(CANNED_FALLBACKS[category]).toContain(result);
    }
  });
});

// --- Content limit constants ---

describe('content limit constants', () => {
  it('CONTENT_WORD_LIMITS has correct values per age bracket', () => {
    expect(CONTENT_WORD_LIMITS['6-7']).toBe(8);
    expect(CONTENT_WORD_LIMITS['7-8']).toBe(10);
    expect(CONTENT_WORD_LIMITS['8-9']).toBe(12);
  });

  it('MAX_SENTENCES is 4', () => {
    expect(MAX_SENTENCES).toBe(4);
  });

  it('MAX_WORD_LENGTH has correct values per age bracket', () => {
    expect(MAX_WORD_LENGTH['6-7']).toBe(7);
    expect(MAX_WORD_LENGTH['7-8']).toBe(8);
    expect(MAX_WORD_LENGTH['8-9']).toBe(9);
  });
});
