import { parseQuestionText, hasFractionNotation } from './MathQuestionDisplay';

describe('parseQuestionText', () => {
  it('parses simple fraction addition', () => {
    const segments = parseQuestionText('3/5 + 1/5 = ?/5');
    expect(segments).toEqual([
      { type: 'fraction', numerator: '3', denominator: '5' },
      { type: 'text', value: ' + ' },
      { type: 'fraction', numerator: '1', denominator: '5' },
      { type: 'text', value: ' = ' },
      { type: 'fraction', numerator: '?', denominator: '5' },
    ]);
  });

  it('parses unlike denominator addition', () => {
    const segments = parseQuestionText('1/3 + 1/4 = ?/12');
    expect(segments).toEqual([
      { type: 'fraction', numerator: '1', denominator: '3' },
      { type: 'text', value: ' + ' },
      { type: 'fraction', numerator: '1', denominator: '4' },
      { type: 'text', value: ' = ' },
      { type: 'fraction', numerator: '?', denominator: '12' },
    ]);
  });

  it('parses mixed number conversion', () => {
    const segments = parseQuestionText('2 3/5 = ?/5');
    expect(segments).toEqual([
      { type: 'text', value: '2 ' },
      { type: 'fraction', numerator: '3', denominator: '5' },
      { type: 'text', value: ' = ' },
      { type: 'fraction', numerator: '?', denominator: '5' },
    ]);
  });

  it('parses whole × fraction', () => {
    const segments = parseQuestionText('3 \u00d7 2/5 = ?/5');
    expect(segments).toEqual([
      { type: 'text', value: '3 \u00d7 ' },
      { type: 'fraction', numerator: '2', denominator: '5' },
      { type: 'text', value: ' = ' },
      { type: 'fraction', numerator: '?', denominator: '5' },
    ]);
  });

  it('parses fraction × fraction', () => {
    const segments = parseQuestionText('2/3 \u00d7 4/5 = ?/15');
    expect(segments).toEqual([
      { type: 'fraction', numerator: '2', denominator: '3' },
      { type: 'text', value: ' \u00d7 ' },
      { type: 'fraction', numerator: '4', denominator: '5' },
      { type: 'text', value: ' = ' },
      { type: 'fraction', numerator: '?', denominator: '15' },
    ]);
  });

  it('parses division with unit fraction', () => {
    const segments = parseQuestionText('3 \u00f7 1/4 = ?');
    expect(segments).toEqual([
      { type: 'text', value: '3 \u00f7 ' },
      { type: 'fraction', numerator: '1', denominator: '4' },
      { type: 'text', value: ' = ?' },
    ]);
  });

  it('parses equivalent fractions', () => {
    const segments = parseQuestionText('2/3 = ?/9');
    expect(segments).toEqual([
      { type: 'fraction', numerator: '2', denominator: '3' },
      { type: 'text', value: ' = ' },
      { type: 'fraction', numerator: '?', denominator: '9' },
    ]);
  });

  it('returns plain text for non-fraction questions', () => {
    const segments = parseQuestionText('5 + 3 = ?');
    expect(segments).toEqual([
      { type: 'text', value: '5 + 3 = ?' },
    ]);
  });
});

describe('hasFractionNotation', () => {
  it('returns true for fraction questions', () => {
    expect(hasFractionNotation('3/5 + 1/5 = ?/5')).toBe(true);
    expect(hasFractionNotation('2/3 = ?/9')).toBe(true);
    expect(hasFractionNotation('1/4')).toBe(true);
  });

  it('returns false for non-fraction questions', () => {
    expect(hasFractionNotation('5 + 3 = ?')).toBe(false);
    expect(hasFractionNotation('What is 12 times 3?')).toBe(false);
  });
});
