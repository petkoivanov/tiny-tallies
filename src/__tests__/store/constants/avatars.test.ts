import {
  AVATARS,
  SPECIAL_AVATARS,
  FRAMES,
  resolveAvatar,
  getCosmeticUnlockText,
  isCosmeticUnlocked,
} from '@/store/constants/avatars';
import type { AvatarId, SpecialAvatarId, FrameId, AllAvatarId } from '@/store/constants/avatars';

describe('avatar constants', () => {
  describe('AVATARS', () => {
    it('has exactly 14 entries', () => {
      expect(AVATARS).toHaveLength(14);
    });

    it('has unique IDs', () => {
      const ids = AVATARS.map((a) => a.id);
      expect(new Set(ids).size).toBe(14);
    });

    it('includes original 8 avatars', () => {
      const ids = AVATARS.map((a) => a.id);
      expect(ids).toContain('fox');
      expect(ids).toContain('owl');
      expect(ids).toContain('bear');
      expect(ids).toContain('rabbit');
      expect(ids).toContain('cat');
      expect(ids).toContain('dog');
      expect(ids).toContain('panda');
      expect(ids).toContain('koala');
    });

    it('includes 6 new avatars', () => {
      const ids = AVATARS.map((a) => a.id);
      expect(ids).toContain('penguin');
      expect(ids).toContain('lion');
      expect(ids).toContain('monkey');
      expect(ids).toContain('dolphin');
      expect(ids).toContain('tiger');
      expect(ids).toContain('hamster');
    });
  });

  describe('SPECIAL_AVATARS', () => {
    it('has exactly 5 entries', () => {
      expect(SPECIAL_AVATARS).toHaveLength(5);
    });

    it('each entry has id, label, emoji, badgeId', () => {
      for (const avatar of SPECIAL_AVATARS) {
        expect(avatar).toHaveProperty('id');
        expect(avatar).toHaveProperty('label');
        expect(avatar).toHaveProperty('emoji');
        expect(avatar).toHaveProperty('badgeId');
        expect(typeof avatar.id).toBe('string');
        expect(typeof avatar.label).toBe('string');
        expect(typeof avatar.emoji).toBe('string');
        expect(typeof avatar.badgeId).toBe('string');
      }
    });

    it('has unique IDs', () => {
      const ids = SPECIAL_AVATARS.map((a) => a.id);
      expect(new Set(ids).size).toBe(5);
    });

    it('contains expected special avatars', () => {
      const ids = SPECIAL_AVATARS.map((a) => a.id);
      expect(ids).toContain('unicorn');
      expect(ids).toContain('dragon');
      expect(ids).toContain('eagle');
      expect(ids).toContain('phoenix');
      expect(ids).toContain('octopus');
    });
  });

  describe('FRAMES', () => {
    it('has exactly 6 entries', () => {
      expect(FRAMES).toHaveLength(6);
    });

    it('each entry has id, label, color, badgeId', () => {
      for (const frame of FRAMES) {
        expect(frame).toHaveProperty('id');
        expect(frame).toHaveProperty('label');
        expect(frame).toHaveProperty('color');
        expect(frame).toHaveProperty('badgeId');
        expect(typeof frame.color).toBe('string');
        expect(frame.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    it('has unique IDs', () => {
      const ids = FRAMES.map((f) => f.id);
      expect(new Set(ids).size).toBe(6);
    });

    it('contains expected frames', () => {
      const ids = FRAMES.map((f) => f.id);
      expect(ids).toContain('gold');
      expect(ids).toContain('silver');
      expect(ids).toContain('emerald');
      expect(ids).toContain('ice');
      expect(ids).toContain('fire');
      expect(ids).toContain('royal');
    });
  });

  describe('resolveAvatar', () => {
    it('returns regular avatar by id', () => {
      const avatar = resolveAvatar('fox');
      expect(avatar).toBeDefined();
      expect(avatar!.id).toBe('fox');
      expect(avatar!.emoji).toBeTruthy();
    });

    it('returns special avatar by id', () => {
      const avatar = resolveAvatar('unicorn');
      expect(avatar).toBeDefined();
      expect(avatar!.id).toBe('unicorn');
      expect(avatar!.emoji).toBeTruthy();
    });

    it('returns undefined for invalid id', () => {
      expect(resolveAvatar('nonexistent')).toBeUndefined();
    });
  });

  describe('getCosmeticUnlockText', () => {
    it('returns unlock text for badge that unlocks a special avatar', () => {
      const text = getCosmeticUnlockText('behavior.sessions.bronze');
      expect(text).toBeTruthy();
      expect(typeof text).toBe('string');
    });

    it('returns unlock text for badge that unlocks a frame', () => {
      const text = getCosmeticUnlockText('mastery.grade.3');
      expect(text).toBeTruthy();
      expect(typeof text).toBe('string');
    });

    it('returns null for badge with no cosmetic unlock', () => {
      expect(getCosmeticUnlockText('some.random.badge')).toBeNull();
    });
  });

  describe('isCosmeticUnlocked', () => {
    it('returns true when badge is in earnedBadges', () => {
      const earned = { 'behavior.sessions.bronze': { earnedAt: '2026-01-01' } };
      expect(isCosmeticUnlocked('behavior.sessions.bronze', earned)).toBe(true);
    });

    it('returns false when badge is not in earnedBadges', () => {
      const earned = {};
      expect(isCosmeticUnlocked('behavior.sessions.bronze', earned)).toBe(false);
    });
  });

  describe('type safety', () => {
    it('AvatarId type includes regular IDs', () => {
      const id: AvatarId = 'fox';
      expect(id).toBe('fox');
    });

    it('SpecialAvatarId type includes special IDs', () => {
      const id: SpecialAvatarId = 'unicorn';
      expect(id).toBe('unicorn');
    });

    it('FrameId type includes frame IDs', () => {
      const id: FrameId = 'gold';
      expect(id).toBe('gold');
    });

    it('AllAvatarId accepts both regular and special IDs', () => {
      const regular: AllAvatarId = 'fox';
      const special: AllAvatarId = 'unicorn';
      expect(regular).toBe('fox');
      expect(special).toBe('unicorn');
    });
  });
});
