/**
 * Theme cosmetic constants for badge-gated theme unlocking.
 * Follows the same pattern as SPECIAL_AVATARS and FRAMES in avatars.ts.
 *
 * The 'dark' theme is always available (default). These 4 themes require
 * earning the mapped badge to equip.
 */
export const THEME_COSMETICS = [
  { id: 'ocean' as const, label: 'Ocean', emoji: '\u{1F30A}', badgeId: 'mastery.grade.1' },
  { id: 'forest' as const, label: 'Forest', emoji: '\u{1F332}', badgeId: 'behavior.streak.gold' },
  { id: 'sunset' as const, label: 'Sunset', emoji: '\u{1F305}', badgeId: 'behavior.sessions.gold' },
  { id: 'space' as const, label: 'Space', emoji: '\u{1F680}', badgeId: 'behavior.challenge.perfect' },
] as const;
