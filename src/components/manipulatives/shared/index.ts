export type {
  SnapTarget,
  DraggableItemProps,
  SnapZoneProps,
  AnimatedCounterProps,
  ResetConfig,
} from './types';

export { findNearestSnap, isInsideZone } from './snapMath';

export {
  SNAP_SPRING_CONFIG,
  RETURN_SPRING_CONFIG,
  RESET_SPRING_CONFIG,
  COUNTER_POP_CONFIG,
  SNAP_THRESHOLD,
  MAX_OBJECTS,
  DRAG_SCALE,
  DRAG_OPACITY,
  RESET_STAGGER_MS,
} from './animationConfig';

export { triggerSnapHaptic, triggerGroupHaptic } from './haptics';

export { DraggableItem } from './DraggableItem';
export { SnapZone } from './SnapZone';
export { AnimatedCounter } from './AnimatedCounter';
