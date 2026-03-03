import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, type LayoutChangeEvent } from 'react-native';

import type { SnapZoneProps, SnapTarget } from './types';

/**
 * A drop target zone that measures its absolute screen position and reports
 * it as a SnapTarget to the parent orchestrator.
 *
 * Uses measureInWindow for absolute coordinates that align with DraggableItem's
 * translateX/Y (which are screen-relative, not parent-relative).
 *
 * Visual states:
 * - Default: dashed border, subtle background
 * - Active: brighter border when isActive
 * - Occupied: filled background when isOccupied
 */
export function SnapZone({
  id,
  onMeasured,
  isActive = false,
  isOccupied = false,
  style,
  accessibilityLabel,
  children,
}: SnapZoneProps) {
  const viewRef = useRef<View>(null);

  const handleLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      // measureInWindow gives absolute screen coordinates
      viewRef.current?.measureInWindow((pageX, pageY, w, h) => {
        if (w > 0 && h > 0) {
          const target: SnapTarget = {
            id,
            cx: pageX + w / 2,
            cy: pageY + h / 2,
            width: w,
            height: h,
          };
          onMeasured(target);
        }
      });
    },
    [id, onMeasured],
  );

  return (
    <View
      ref={viewRef}
      testID={`snap-zone-${id}`}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onLayout={handleLayout}
      style={[
        styles.zone,
        isActive && styles.active,
        isOccupied && styles.occupied,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    minWidth: 48,
    minHeight: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#555555',
    borderRadius: 8,
    backgroundColor: 'rgba(100, 100, 100, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    borderColor: '#7C9CFF',
    backgroundColor: 'rgba(124, 156, 255, 0.12)',
  },
  occupied: {
    borderStyle: 'solid',
    borderColor: '#5A7FFF',
    backgroundColor: 'rgba(90, 127, 255, 0.18)',
  },
});
