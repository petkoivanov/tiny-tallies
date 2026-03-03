import type { SharedValue } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

/**
 * Center-based coordinates for a snap target zone.
 * cx/cy are the center point; width/height define the bounding box.
 */
export interface SnapTarget {
  id: string;
  cx: number;
  cy: number;
  width: number;
  height: number;
}

/**
 * Props for a draggable item that can snap to target zones.
 */
export interface DraggableItemProps {
  id: string;
  snapTargets: SharedValue<SnapTarget[]>;
  snapThreshold?: number;
  onSnap?: (itemId: string, targetId: string) => void;
  onTap?: (itemId: string) => void;
  onDragStart?: (itemId: string) => void;
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  children: ReactNode;
}

/**
 * Props for a snap zone that items can be dragged into.
 */
export interface SnapZoneProps {
  id: string;
  onMeasured: (target: SnapTarget) => void;
  isActive?: boolean;
  isOccupied?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  children?: ReactNode;
}

/**
 * Props for an animated counter display.
 */
export interface AnimatedCounterProps {
  value: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Configuration for reset animations.
 */
export interface ResetConfig {
  animate?: boolean;
  staggerMs?: number;
}
