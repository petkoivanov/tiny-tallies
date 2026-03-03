/**
 * Spring animation configurations for drag-and-drop interactions.
 * All configs use `as const` for type safety and immutability.
 */

/** Fast snap with no bounce -- precision placement for snap-to-target. */
export const SNAP_SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
  overshootClamping: true,
} as const;

/** Slightly bouncy return -- playful feel when item returns to origin. */
export const RETURN_SPRING_CONFIG = {
  damping: 15,
  stiffness: 200,
  mass: 1,
  overshootClamping: false,
} as const;

/** Gentle cascade -- smooth reset animation for clearing items. */
export const RESET_SPRING_CONFIG = {
  damping: 18,
  stiffness: 180,
  mass: 1,
  overshootClamping: true,
} as const;

/** Pop-in effect -- lively counter value change animation. */
export const COUNTER_POP_CONFIG = {
  damping: 8,
  stiffness: 400,
  mass: 0.5,
} as const;

/** Maximum distance in pixels for snap detection. */
export const SNAP_THRESHOLD = 50;

/** Maximum number of draggable objects allowed on screen. */
export const MAX_OBJECTS = 30;

/** Scale factor applied to item during active drag. */
export const DRAG_SCALE = 1.08;

/** Opacity applied to item during active drag. */
export const DRAG_OPACITY = 0.85;

/** Stagger delay in milliseconds per item during reset animation. */
export const RESET_STAGGER_MS = 30;

/** Undo reverse animation -- same as RETURN_SPRING_CONFIG for smooth undo. */
export const UNDO_SPRING_CONFIG = {
  damping: 15,
  stiffness: 200,
  mass: 1,
  overshootClamping: false,
} as const;

/** Pulse timing for guided mode glow animation. */
export const PULSE_GLOW_CONFIG = {
  duration: 800,
} as const;

/** Soft green glow color for guided mode highlights. */
export const GUIDED_GLOW_COLOR = 'rgba(74, 222, 128, 0.4)';
