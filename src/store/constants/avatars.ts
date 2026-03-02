/**
 * Avatar constants for child profile selection.
 * 8 animal avatars designed to appeal to ages 6-9.
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
] as const;

/** Union type of valid avatar ID strings. */
export type AvatarId = (typeof AVATARS)[number]['id'];

/** Default avatar selection (first entry). */
export const DEFAULT_AVATAR_ID: AvatarId = 'fox';
