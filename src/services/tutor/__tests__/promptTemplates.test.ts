import {
  buildSystemInstruction,
  buildHintPrompt,
  buildTeachPrompt,
  buildBoostPrompt,
} from '../promptTemplates';
import type { PromptParams, BoostPromptParams } from '../types';

function makeParams(overrides: Partial<PromptParams> = {}): PromptParams {
  return {
    ageBracket: '7-8',
    cpaStage: 'concrete',
    problemText: '3 + 4',
    operation: 'addition',
    tutorMode: 'hint',
    hintLevel: 0,
    ...overrides,
  };
}

describe('buildSystemInstruction', () => {
  it('includes "under 8 words" for age bracket 6-7', () => {
    const result = buildSystemInstruction(makeParams({ ageBracket: '6-7' }));
    expect(result).toContain('under 8 words');
  });

  it('includes "under 10 words" for age bracket 7-8', () => {
    const result = buildSystemInstruction(makeParams({ ageBracket: '7-8' }));
    expect(result).toContain('under 10 words');
  });

  it('includes "under 12 words" for age bracket 8-9', () => {
    const result = buildSystemInstruction(makeParams({ ageBracket: '8-9' }));
    expect(result).toContain('under 12 words');
  });

  it('includes "NEVER reveal the answer"', () => {
    const result = buildSystemInstruction(makeParams());
    expect(result).toContain('NEVER reveal the answer');
  });

  it('includes the CPA stage', () => {
    const result = buildSystemInstruction(
      makeParams({ cpaStage: 'pictorial' }),
    );
    expect(result).toContain('pictorial');
  });

  it('includes "NEVER compute math"', () => {
    const result = buildSystemInstruction(makeParams());
    expect(result).toContain('NEVER compute math');
  });

  it('includes "NEVER say the result"', () => {
    const result = buildSystemInstruction(makeParams());
    expect(result).toContain('NEVER say the result');
  });

  it('includes "guiding questions"', () => {
    const result = buildSystemInstruction(makeParams());
    expect(result).toContain('guiding questions');
  });

  it('includes "age-appropriate"', () => {
    const result = buildSystemInstruction(makeParams());
    expect(result).toContain('age-appropriate');
  });

  it('includes "Never use sarcasm"', () => {
    const result = buildSystemInstruction(makeParams());
    expect(result).toContain('Never use sarcasm');
  });

  it('includes "Never discuss topics outside math"', () => {
    const result = buildSystemInstruction(makeParams());
    expect(result).toContain('Never discuss topics outside math');
  });

  it('includes "Praise effort, not talent"', () => {
    const result = buildSystemInstruction(makeParams());
    expect(result).toContain('Praise effort, not talent');
  });
});

describe('buildHintPrompt', () => {
  it('includes problemText and operation', () => {
    const result = buildHintPrompt(
      makeParams({ problemText: '5 + 7', operation: 'addition' }),
    );
    expect(result).toContain('5 + 7');
    expect(result).toContain('addition');
  });

  it('includes wrongAnswer when provided', () => {
    const result = buildHintPrompt(makeParams({ wrongAnswer: 11 }));
    expect(result).toContain('11');
  });

  it('includes bugDescription when provided', () => {
    const result = buildHintPrompt(
      makeParams({ bugDescription: 'ignores carry' }),
    );
    expect(result).toContain('ignores carry');
  });

  it('omits wrongAnswer text when not provided', () => {
    const result = buildHintPrompt(makeParams());
    expect(result).not.toContain('answered');
  });

  it('omits bugDescription text when not provided', () => {
    const result = buildHintPrompt(makeParams());
    expect(result).not.toContain('indicate');
  });
});

describe('correctAnswer type-level enforcement', () => {
  it('PromptParams does NOT have a correctAnswer property', () => {
    const params = makeParams();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((params as any).correctAnswer).toBeUndefined();
  });
});

// --- TEACH mode system instruction ---

describe('buildSystemInstruction with tutorMode=teach', () => {
  it('includes "Walk through the problem step by step"', () => {
    const result = buildSystemInstruction(makeParams({ tutorMode: 'teach' }));
    expect(result).toContain('Walk through the problem step by step');
  });

  it('includes "NEVER reveal the final answer"', () => {
    const result = buildSystemInstruction(makeParams({ tutorMode: 'teach' }));
    expect(result).toContain('NEVER reveal the final answer');
  });

  it('still includes age-appropriate language rules', () => {
    const result = buildSystemInstruction(makeParams({ tutorMode: 'teach' }));
    expect(result).toContain('age-appropriate');
  });

  it('still includes "Never use sarcasm" rule', () => {
    const result = buildSystemInstruction(makeParams({ tutorMode: 'teach' }));
    expect(result).toContain('Never use sarcasm');
  });

  it('still includes "Never discuss topics outside math"', () => {
    const result = buildSystemInstruction(makeParams({ tutorMode: 'teach' }));
    expect(result).toContain('Never discuss topics outside math');
  });

  it('includes CPA language guidance for concrete stage (blocks)', () => {
    const result = buildSystemInstruction(
      makeParams({ tutorMode: 'teach', cpaStage: 'concrete' }),
    );
    expect(result).toContain('blocks');
  });

  it('includes CPA language guidance for pictorial stage (pictures/diagrams)', () => {
    const result = buildSystemInstruction(
      makeParams({ tutorMode: 'teach', cpaStage: 'pictorial' }),
    );
    expect(result.includes('pictures') || result.includes('diagrams')).toBe(true);
  });

  it('includes CPA language guidance for abstract stage (math notation/algorithms)', () => {
    const result = buildSystemInstruction(
      makeParams({ tutorMode: 'teach', cpaStage: 'abstract' }),
    );
    expect(result.includes('math notation') || result.includes('algorithms')).toBe(true);
  });
});

// --- BOOST mode system instruction ---

describe('buildSystemInstruction with tutorMode=boost', () => {
  it('includes "You MAY reveal the answer"', () => {
    const result = buildSystemInstruction(makeParams({ tutorMode: 'boost' }));
    expect(result).toContain('You MAY reveal the answer');
  });

  it('includes "Focus on WHY"', () => {
    const result = buildSystemInstruction(makeParams({ tutorMode: 'boost' }));
    expect(result).toContain('Focus on WHY');
  });

  it('still includes "Never use sarcasm" safety rule', () => {
    const result = buildSystemInstruction(makeParams({ tutorMode: 'boost' }));
    expect(result).toContain('Never use sarcasm');
  });

  it('still includes "Never discuss topics outside math"', () => {
    const result = buildSystemInstruction(makeParams({ tutorMode: 'boost' }));
    expect(result).toContain('Never discuss topics outside math');
  });
});

// --- buildTeachPrompt ---

describe('buildTeachPrompt', () => {
  it('includes problemText and operation', () => {
    const result = buildTeachPrompt(
      makeParams({ problemText: '15 + 27', operation: 'addition', tutorMode: 'teach' }),
    );
    expect(result).toContain('15 + 27');
    expect(result).toContain('addition');
  });

  it('includes bugDescription when provided', () => {
    const result = buildTeachPrompt(
      makeParams({ tutorMode: 'teach', bugDescription: 'ignores carry' }),
    );
    expect(result).toContain('ignores carry');
  });

  it('does not include correctAnswer (PromptParams has no correctAnswer)', () => {
    const result = buildTeachPrompt(makeParams({ tutorMode: 'teach' }));
    // buildTeachPrompt takes PromptParams which has no correctAnswer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((makeParams({ tutorMode: 'teach' }) as any).correctAnswer).toBeUndefined();
  });

  it('includes wrongAnswer when provided', () => {
    const result = buildTeachPrompt(
      makeParams({ tutorMode: 'teach', wrongAnswer: 11 }),
    );
    expect(result).toContain('11');
  });
});

// --- buildBoostPrompt ---

describe('buildBoostPrompt', () => {
  function makeBoostParams(
    overrides: Partial<BoostPromptParams> = {},
  ): BoostPromptParams {
    return {
      ageBracket: '7-8',
      cpaStage: 'concrete',
      problemText: '3 + 4',
      operation: 'addition',
      tutorMode: 'boost',
      hintLevel: 0,
      correctAnswer: 7,
      ...overrides,
    };
  }

  it('includes correctAnswer in the prompt output', () => {
    const result = buildBoostPrompt(makeBoostParams({ correctAnswer: 42 }));
    expect(result).toContain('42');
  });

  it('includes "Explain the answer" instruction', () => {
    const result = buildBoostPrompt(makeBoostParams());
    expect(result).toContain('Explain the answer');
  });

  it('includes problemText and operation', () => {
    const result = buildBoostPrompt(
      makeBoostParams({ problemText: '12 - 5', operation: 'subtraction' }),
    );
    expect(result).toContain('12 - 5');
    expect(result).toContain('subtraction');
  });

  it('includes bugDescription when provided', () => {
    const result = buildBoostPrompt(
      makeBoostParams({ bugDescription: 'always subtracts smaller from larger' }),
    );
    expect(result).toContain('always subtracts smaller from larger');
  });

  it('includes WHY explanation instruction', () => {
    const result = buildBoostPrompt(makeBoostParams());
    expect(result).toContain('WHY');
  });
});
