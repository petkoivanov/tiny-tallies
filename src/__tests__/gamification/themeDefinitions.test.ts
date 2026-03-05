import { THEMES, ThemeColors } from '@/theme/colors';
import { THEME_COSMETICS } from '@/store/constants/themes';
import { getCosmeticUnlockText } from '@/store/constants/avatars';

const ALL_THEME_IDS = ['dark', 'ocean', 'forest', 'sunset', 'space'] as const;

const COLOR_TOKENS: (keyof ThemeColors)[] = [
  'background',
  'backgroundLight',
  'surface',
  'surfaceLight',
  'primary',
  'primaryLight',
  'primaryDark',
  'correct',
  'incorrect',
  'textPrimary',
  'textSecondary',
  'textMuted',
];

describe('Theme Definitions', () => {
  describe('THEMES constant', () => {
    it('has exactly 5 theme entries', () => {
      expect(Object.keys(THEMES)).toHaveLength(5);
    });

    it('has all expected theme IDs', () => {
      for (const id of ALL_THEME_IDS) {
        expect(THEMES).toHaveProperty(id);
      }
    });

    it.each(ALL_THEME_IDS)('%s has all 12 color tokens as strings', (themeId) => {
      const theme = THEMES[themeId];
      for (const token of COLOR_TOKENS) {
        expect(typeof theme[token]).toBe('string');
      }
    });

    it('has universal correct and incorrect colors across all themes', () => {
      for (const id of ALL_THEME_IDS) {
        expect(THEMES[id].correct).toBe('#84cc16');
        expect(THEMES[id].incorrect).toBe('#f87171');
      }
    });
  });

  describe('THEME_COSMETICS', () => {
    it('has exactly 4 entries (non-default themes)', () => {
      expect(THEME_COSMETICS).toHaveLength(4);
    });

    it('each entry has id, label, emoji, and badgeId', () => {
      for (const cosmetic of THEME_COSMETICS) {
        expect(typeof cosmetic.id).toBe('string');
        expect(typeof cosmetic.label).toBe('string');
        expect(typeof cosmetic.emoji).toBe('string');
        expect(typeof cosmetic.badgeId).toBe('string');
      }
    });

    it('contains ocean, forest, sunset, space theme IDs', () => {
      const ids = THEME_COSMETICS.map((c) => c.id);
      expect(ids).toContain('ocean');
      expect(ids).toContain('forest');
      expect(ids).toContain('sunset');
      expect(ids).toContain('space');
    });
  });

  describe('getCosmeticUnlockText for themes', () => {
    it('returns theme unlock text for theme-linked badges', () => {
      for (const cosmetic of THEME_COSMETICS) {
        const text = getCosmeticUnlockText(cosmetic.badgeId);
        expect(text).toContain(cosmetic.label);
        expect(text).toContain('theme');
      }
    });

    it('still returns avatar text for avatar-linked badges (no regression)', () => {
      // behavior.sessions.bronze -> Unicorn avatar
      const text = getCosmeticUnlockText('behavior.sessions.bronze');
      expect(text).toContain('Unicorn');
      expect(text).toContain('avatar');
    });

    it('still returns frame text for frame-linked badges (no regression)', () => {
      // mastery.grade.3 -> Gold Ring frame
      const text = getCosmeticUnlockText('mastery.grade.3');
      expect(text).toContain('Gold Ring');
      expect(text).toContain('frame');
    });

    it('returns null for badges with no cosmetic', () => {
      expect(getCosmeticUnlockText('nonexistent.badge')).toBeNull();
    });
  });
});
