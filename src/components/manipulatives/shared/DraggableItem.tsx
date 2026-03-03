import React, { useCallback } from 'react';
import { StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { findNearestSnap } from './snapMath';
import { triggerSnapHaptic } from './haptics';
import {
  SNAP_SPRING_CONFIG,
  RETURN_SPRING_CONFIG,
  SNAP_THRESHOLD,
  DRAG_SCALE,
  DRAG_OPACITY,
} from './animationConfig';
import type { SnapTarget, DraggableItemProps } from './types';

/**
 * A draggable item that supports pan and tap gestures with snap-to-zone behavior.
 *
 * - Pan gesture: Drag the item, snap to nearest zone on release or return to start.
 * - Tap gesture: Alternative interaction for tap-to-add/remove.
 * - Haptic feedback on successful snap.
 * - Visual feedback (scale, opacity, zIndex) during drag.
 * - Reset support via onRegister callback exposing shared values.
 */
export function DraggableItem({
  id,
  snapTargets,
  snapThreshold = SNAP_THRESHOLD,
  onSnap,
  onTap,
  onDragStart,
  enabled = true,
  style,
  accessibilityLabel,
  children,
  onRegister,
}: DraggableItemProps & {
  onRegister?: (
    id: string,
    offsets: { offsetX: SharedValue<number>; offsetY: SharedValue<number> },
  ) => void;
}) {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Register offsets with parent for reset support (MANIP-09)
  const registered = useSharedValue(false);
  const doRegister = useCallback(() => {
    if (onRegister && !registered.value) {
      registered.value = true;
      onRegister(id, { offsetX, offsetY });
    }
  }, [id, offsetX, offsetY, onRegister, registered]);

  // Call register on first render
  React.useEffect(() => {
    doRegister();
  }, [doRegister]);

  // Bridge enabled prop to SharedValue for worklet access
  const enabledValue = useSharedValue(enabled);
  React.useEffect(() => {
    enabledValue.value = enabled;
  }, [enabled, enabledValue]);

  // Tap gesture: tap-to-add/remove alternative (MANIP-08)
  const tap = Gesture.Tap()
    .enabled(enabled)
    .onEnd(() => {
      'worklet';
      if (onTap) {
        scheduleOnRN(onTap, id);
      }
    });

  // Pan gesture: drag with snap-to-zone
  const pan = Gesture.Pan()
    .enabled(enabled)
    .minDistance(8)
    .onStart(() => {
      'worklet';
      startX.value = offsetX.value;
      startY.value = offsetY.value;
      isDragging.value = true;
      if (onDragStart) {
        scheduleOnRN(onDragStart, id);
      }
    })
    .onChange((event) => {
      'worklet';
      offsetX.value = startX.value + event.translationX;
      offsetY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;

      const targets = snapTargets.value;
      const target: SnapTarget | null = findNearestSnap(
        offsetX.value,
        offsetY.value,
        targets,
        snapThreshold,
      );

      if (target) {
        // Snap to target center
        offsetX.value = withSpring(target.cx, SNAP_SPRING_CONFIG);
        offsetY.value = withSpring(target.cy, SNAP_SPRING_CONFIG);
        if (onSnap) {
          scheduleOnRN(onSnap, id, target.id);
        }
        scheduleOnRN(triggerSnapHaptic);
      } else {
        // Return to start position
        offsetX.value = withSpring(startX.value, RETURN_SPRING_CONFIG);
        offsetY.value = withSpring(startY.value, RETURN_SPRING_CONFIG);
      }
    });

  // Compose gestures: Race(tap, pan) -- tap completes before pan activates
  const composed = Gesture.Race(tap, pan);

  // Animated style with visual feedback during drag
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      {
        scale: withTiming(isDragging.value ? DRAG_SCALE : 1, {
          duration: 100,
        }),
      },
    ],
    opacity: withTiming(isDragging.value ? DRAG_OPACITY : 1, {
      duration: 100,
    }),
    zIndex: isDragging.value ? 999 : 0,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        testID={id}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[styles.container, style, animatedStyle]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
