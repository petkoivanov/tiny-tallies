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
  UNDO_SPRING_CONFIG,
  PULSE_GLOW_CONFIG,
  GUIDED_GLOW_COLOR,
} from './animationConfig';

export { triggerSnapHaptic, triggerGroupHaptic } from './haptics';

export { DraggableItem } from './DraggableItem';
export { SnapZone } from './SnapZone';
export { AnimatedCounter } from './AnimatedCounter';
export { useActionHistory } from './useActionHistory';
export type { UseActionHistoryResult } from './useActionHistory';
export { GuidedHighlight } from './GuidedHighlight';
