import { migrateStore } from '@/store/migrations';

describe('Store migration v12: themeId', () => {
  it('sets themeId to dark when migrating from version 11', () => {
    const state = { childName: 'Test', frameId: null };
    const result = migrateStore(state, 11);
    expect(result.themeId).toBe('dark');
  });

  it('preserves existing themeId if already present', () => {
    const state = { childName: 'Test', themeId: 'ocean' };
    const result = migrateStore(state, 11);
    expect(result.themeId).toBe('ocean');
  });

  it('chains correctly from older versions (e.g., version 10 applies v11 and v12)', () => {
    const state = { childName: 'Test' };
    const result = migrateStore(state, 10);
    // v11 migration adds frameId
    expect(result.frameId).toBeNull();
    // v12 migration adds themeId
    expect(result.themeId).toBe('dark');
  });

  it('does not add themeId when version is already 12 or higher', () => {
    const state = { childName: 'Test' };
    const result = migrateStore(state, 12);
    expect(result.themeId).toBeUndefined();
  });
});
