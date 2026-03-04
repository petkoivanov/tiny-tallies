import {
  buildSystemInstruction,
  buildHintPrompt,
} from '../promptTemplates';
import type { PromptParams } from '../types';

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
