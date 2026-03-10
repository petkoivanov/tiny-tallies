/**
 * Shared animation configurations for consistent motion across the app.
 *
 * Spring configs follow a light→heavy energy scale:
 *   - bounce: High energy, low damping (celebrations, correct answers)
 *   - medium: Moderate energy (badges, callouts)
 *   - settle: Low energy, high damping (resets, slide-ins)
 *   - heavy: Weighted, clamped (panels, banners — no overshoot)
 */
/** Spring configs for react-native-reanimated withSpring() */
export const springConfigs = {
  /** High-energy bounce for celebrations (damping: 4, stiffness: 300) */
  bounce: { damping: 4, stiffness: 300 },
  /** Medium-energy spring for callouts and badges (damping: 6, stiffness: 200) */
  medium: { damping: 6, stiffness: 200 },
  /** Gentle settle for returning to rest (damping: 8, stiffness: 100) */
  settle: { damping: 8 },
  /** Weighted panel slide — no overshoot (damping: 18, stiffness: 180, mass: 0.8) */
  heavy: { damping: 18, stiffness: 180, mass: 0.8, overshootClamping: true },
} as const;

/** Standard timing durations in milliseconds */
export const durations = {
  /** Quick feedback (shake, tap) */
  quick: 50,
  /** Standard transition */
  normal: 200,
  /** Entrance delay for staggered items */
  entranceDelay: 300,
  /** Longer entrance delay for secondary items */
  secondaryDelay: 400,
} as const;

