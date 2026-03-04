import { getBugDescription } from '../bugLookup';

describe('getBugDescription', () => {
  it('returns description for addition bug "add_no_carry"', () => {
    const desc = getBugDescription('add_no_carry');
    expect(typeof desc).toBe('string');
    expect(desc!.length).toBeGreaterThan(0);
    expect(desc).toContain('carry');
  });

  it('returns description for addition bug "add_concat"', () => {
    const desc = getBugDescription('add_concat');
    expect(typeof desc).toBe('string');
    expect(desc!.length).toBeGreaterThan(0);
  });

  it('returns description for subtraction bug "sub_smaller_from_larger"', () => {
    const desc = getBugDescription('sub_smaller_from_larger');
    expect(typeof desc).toBe('string');
    expect(desc!.length).toBeGreaterThan(0);
    expect(desc).toContain('smaller');
  });

  it('returns description for subtraction bug "sub_zero_confusion"', () => {
    const desc = getBugDescription('sub_zero_confusion');
    expect(typeof desc).toBe('string');
    expect(desc!.length).toBeGreaterThan(0);
  });

  it('returns undefined for undefined bugId', () => {
    const desc = getBugDescription(undefined);
    expect(desc).toBeUndefined();
  });

  it('returns undefined for nonexistent bugId', () => {
    const desc = getBugDescription('nonexistent_id');
    expect(desc).toBeUndefined();
  });

  it('returns undefined for empty string bugId', () => {
    const desc = getBugDescription('');
    expect(desc).toBeUndefined();
  });
});
