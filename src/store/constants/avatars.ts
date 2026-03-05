/**
 * Avatar constants for child profile selection.
 * 14 animal avatars (regular) + 5 special avatars (badge-unlocked) + 6 frames.
 */
export const AVATARS = [
  { id: 'fox', label: 'Fox', emoji: '\uD83E\uDD8A' },
  { id: 'owl', label: 'Owl', emoji: '\uD83E\uDD89' },
  { id: 'bear', label: 'Bear', emoji: '\uD83D\uDC3B' },
  { id: 'rabbit', label: 'Rabbit', emoji: '\uD83D\uDC30' },
  { id: 'cat', label: 'Cat', emoji: '\uD83D\uDC31' },
  { id: 'dog', label: 'Dog', emoji: '\uD83D\uDC36' },
  { id: 'panda', label: 'Panda', emoji: '\uD83D\uDC3C' },
  { id: 'koala', label: 'Koala', emoji: '\uD83D\uDC28' },
  { id: 'penguin', label: 'Penguin', emoji: '\uD83D\uDC27' },
  { id: 'lion', label: 'Lion', emoji: '\uD83E\uDD81' },
  { id: 'monkey', label: 'Monkey', emoji: '\uD83D\uDC35' },
  { id: 'dolphin', label: 'Dolphin', emoji: '\uD83D\uDC2C' },
  { id: 'tiger', label: 'Tiger', emoji: '\uD83D\uDC2F' },
  { id: 'hamster', label: 'Hamster', emoji: '\uD83D\uDC39' },
] as const;

/** Union type of valid regular avatar ID strings. */
export type AvatarId = (typeof AVATARS)[number]['id'];

/** Default avatar selection (first entry). */
export const DEFAULT_AVATAR_ID: AvatarId = 'fox';

/**
 * Special avatars unlocked via badge achievements.
 * Each maps to a specific badge ID that must be earned to equip.
 */
export const SPECIAL_AVATARS = [
  { id: 'unicorn', label: 'Unicorn', emoji: '\uD83E\uDD84', badgeId: 'behavior.sessions.bronze' },
  { id: 'dragon', label: 'Dragon', emoji: '\uD83D\uDC09', badgeId: 'mastery.category.addition' },
  { id: 'eagle', label: 'Eagle', emoji: '\uD83E\uDD85', badgeId: 'behavior.streak.silver' },
  { id: 'phoenix', label: 'Phoenix', emoji: '\uD83D\uDC26', badgeId: 'mastery.grade.2' },
  { id: 'octopus', label: 'Octopus', emoji: '\uD83D\uDC19', badgeId: 'behavior.challenge.master' },
] as const;

/** Union type of valid special avatar ID strings. */
export type SpecialAvatarId = (typeof SPECIAL_AVATARS)[number]['id'];

/** Combined avatar type: regular or special. */
export type AllAvatarId = AvatarId | SpecialAvatarId;

/**
 * Decorative frames unlocked via badge achievements.
 * Each maps to a specific badge ID and renders as a colored border.
 */
export const FRAMES = [
  { id: 'gold', label: 'Gold Ring', color: '#ffd700', badgeId: 'mastery.grade.3' },
  { id: 'silver', label: 'Silver Ring', color: '#c0c0c0', badgeId: 'behavior.sessions.silver' },
  { id: 'emerald', label: 'Emerald Ring', color: '#50c878', badgeId: 'mastery.category.subtraction' },
  { id: 'ice', label: 'Ice Ring', color: '#87ceeb', badgeId: 'behavior.streak.bronze' },
  { id: 'fire', label: 'Fire Ring', color: '#ff6347', badgeId: 'behavior.remediation.silver' },
  { id: 'royal', label: 'Royal Purple', color: '#9b59b6', badgeId: 'behavior.challenge.streak' },
] as const;

/** Union type of valid frame ID strings. */
export type FrameId = (typeof FRAMES)[number]['id'];

/**
 * Resolve an avatar by ID, searching both regular and special arrays.
 * Returns undefined if no match found.
 */
export function resolveAvatar(
  id: string,
): { id: string; label: string; emoji: string } | undefined {
  return (
    AVATARS.find((a) => a.id === id) as
      | { id: string; label: string; emoji: string }
      | undefined
  ) ?? (
    SPECIAL_AVATARS.find((a) => a.id === id) as
      | { id: string; label: string; emoji: string }
      | undefined
  );
}

/**
 * Get cosmetic unlock text for a badge ID.
 * Returns a description if the badge unlocks a special avatar or frame, null otherwise.
 */
export function getCosmeticUnlockText(badgeId: string): string | null {
  const specialAvatar = SPECIAL_AVATARS.find((a) => a.badgeId === badgeId);
  if (specialAvatar) {
    return `Unlocks ${specialAvatar.label} ${specialAvatar.emoji} avatar`;
  }

  const frame = FRAMES.find((f) => f.badgeId === badgeId);
  if (frame) {
    return `Unlocks ${frame.label} frame`;
  }

  return null;
}

/**
 * Check if a cosmetic item is unlocked based on earned badges.
 */
export function isCosmeticUnlocked(
  badgeId: string,
  earnedBadges: Record<string, unknown>,
): boolean {
  return badgeId in earnedBadges;
}
