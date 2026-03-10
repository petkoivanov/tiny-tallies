/**
 * Sound effect identifiers for the app.
 *
 * Each maps to an audio asset in assets/sounds/.
 * The soundService loads and caches these on first use.
 */
export type SoundEffect =
  | 'correct'
  | 'incorrect'
  | 'levelUp'
  | 'celebration'
  | 'buttonTap'
  | 'sessionComplete';
