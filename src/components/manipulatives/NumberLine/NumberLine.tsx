/**
 * NumberLine -- Interactive number line with snap-to-tick marker and hop arrows.
 *
 * Teaches counting-on strategy: dragging the marker generates a cumulative
 * hop arrow trail showing each unit step from start to current position.
 *
 * Supports ranges:
 * - 0-10 (default): every integer tick
 * - 0-20: every integer tick
 * - 0-100: decade ticks with tap-to-expand individual decade
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { ManipulativeShell } from '../ManipulativeShell';
import { triggerSnapHaptic } from '../shared/haptics';
import { SNAP_SPRING_CONFIG } from '../shared/animationConfig';
import { useActionHistory } from '../shared/useActionHistory';
import { GuidedHighlight } from '../shared/GuidedHighlight';
import { NumberLineSvg, valueToX, xToValue } from './NumberLineSvg';
import {
  SVG_HEIGHT,
  SVG_PADDING,
  MARKER_RADIUS,
  NUMBER_LINE_ACCENT,
  type NumberLineProps,
  type HopArrow,
} from './NumberLineTypes';

const LINE_Y = SVG_HEIGHT * 0.55;

/**
 * Build cumulative hop arrows from startValue to endValue.
 * Each hop represents a single unit step for counting-on visualization.
 */
function buildHops(startValue: number, endValue: number): HopArrow[] {
  if (startValue === endValue) return [];
  const direction = endValue > startValue ? 1 : -1;
  const hops: HopArrow[] = [];
  let current = startValue;
  while (current !== endValue) {
    const next = current + direction;
    hops.push({ fromValue: current, toValue: next });
    current = next;
  }
  return hops;
}

/**
 * Clamp a value to the nearest integer within the range.
 */
function clampAndRound(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function NumberLine({
  range: rangeProp,
  startPosition,
  guidedTargetId,
  testID,
}: NumberLineProps) {
  const range: [number, number] = rangeProp ?? [0, 10];
  const initialPosition = startPosition ?? range[0];
  const isLargeRange = range[1] - range[0] > 20;

  // ---------- State ----------
  const [containerWidth, setContainerWidth] = useState(0);
  const { state: markerValue, canUndo, pushState: pushMarkerState, undo: undoMarker, reset: resetMarker } = useActionHistory<number>(initialPosition);
  const [startValue] = useState(initialPosition);
  const [hops, setHops] = useState<HopArrow[]>([]);
  const [expandedDecade, setExpandedDecade] = useState<number | null>(null);

  // Animated marker position (in pixels)
  const markerX = useSharedValue(0);

  // Live update during drag (not pushed to history -- intermediate ticks)
  const [liveMarkerValue, setLiveMarkerValue] = useState(initialPosition);

  // Display value: use liveMarkerValue during drag
  const displayValue = liveMarkerValue;

  // Effective range for coordinate mapping when a decade is expanded
  const effectiveRange: [number, number] = useMemo(() => {
    if (isLargeRange && expandedDecade !== null) {
      return [expandedDecade, Math.min(expandedDecade + 10, range[1])];
    }
    return range;
  }, [isLargeRange, expandedDecade, range]);

  // ---------- Layout ----------
  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const w = event.nativeEvent.layout.width;
      setContainerWidth(w);
      // Position marker at current value
      const x = valueToX(displayValue, effectiveRange, w);
      markerX.value = x;
    },
    [displayValue, effectiveRange, markerX],
  );

  // ---------- Marker drag ----------
  const updateMarkerLive = useCallback(
    (newValue: number) => {
      setLiveMarkerValue(newValue);
      setHops(buildHops(startValue, newValue));
      triggerSnapHaptic();
    },
    [startValue],
  );

  // Push to undo history on drag end
  const commitMarkerValue = useCallback(
    (finalValue: number) => {
      pushMarkerState(finalValue);
    },
    [pushMarkerState],
  );

  const lastSnappedValue = useSharedValue(initialPosition);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(4)
        .onStart(() => {
          'worklet';
          // Record the starting pixel position
        })
        .onChange((event) => {
          'worklet';
          const newX = markerX.value + event.changeX;
          markerX.value = newX;

          // Compute nearest tick value
          const rawValue = xToValue(newX, effectiveRange, containerWidth);
          const snapped = clampAndRound(
            rawValue,
            effectiveRange[0],
            effectiveRange[1],
          );

          if (snapped !== lastSnappedValue.value) {
            lastSnappedValue.value = snapped;
            runOnJS(updateMarkerLive)(snapped);
          }
        })
        .onEnd(() => {
          'worklet';
          // Snap marker to exact tick position
          const snapX = valueToX(
            lastSnappedValue.value,
            effectiveRange,
            containerWidth,
          );
          markerX.value = withSpring(snapX, SNAP_SPRING_CONFIG);
          runOnJS(commitMarkerValue)(lastSnappedValue.value);
        }),
    [
      containerWidth,
      effectiveRange,
      lastSnappedValue,
      markerX,
      updateMarkerLive,
      commitMarkerValue,
    ],
  );

  // ---------- Animated marker style ----------
  const markerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: markerX.value - MARKER_RADIUS },
      { translateY: LINE_Y - MARKER_RADIUS },
    ],
  }));

  // ---------- Decade expansion (0-100 range) ----------
  const handleDecadeTap = useCallback(
    (decadeStart: number) => {
      if (!isLargeRange) return;
      if (expandedDecade === decadeStart) {
        // Collapse
        setExpandedDecade(null);
        // Reposition marker for overview range
        if (containerWidth > 0) {
          const x = valueToX(displayValue, range, containerWidth);
          markerX.value = x;
        }
      } else {
        // Expand this decade
        setExpandedDecade(decadeStart);
        // Reposition marker for expanded range
        const newRange: [number, number] = [
          decadeStart,
          Math.min(decadeStart + 10, range[1]),
        ];
        if (containerWidth > 0) {
          // Clamp marker to the expanded decade
          const clampedValue = clampAndRound(
            displayValue,
            newRange[0],
            newRange[1],
          );
          pushMarkerState(clampedValue);
          setLiveMarkerValue(clampedValue);
          setHops(buildHops(startValue, clampedValue));
          const x = valueToX(clampedValue, newRange, containerWidth);
          markerX.value = x;
          lastSnappedValue.value = clampedValue;
        }
      }
    },
    [
      isLargeRange,
      expandedDecade,
      containerWidth,
      displayValue,
      range,
      startValue,
      markerX,
      lastSnappedValue,
      pushMarkerState,
    ],
  );

  // Decade tap zones for 0-100 range
  const decadeTapZones = useMemo(() => {
    if (!isLargeRange || expandedDecade !== null || containerWidth <= 0)
      return null;

    const zones: { decadeStart: number; x: number; width: number }[] = [];
    const step = 10;
    for (let d = range[0]; d < range[1]; d += step) {
      const x1 = valueToX(d, range, containerWidth);
      const x2 = valueToX(d + step, range, containerWidth);
      zones.push({ decadeStart: d, x: x1, width: x2 - x1 });
    }
    return zones;
  }, [isLargeRange, expandedDecade, containerWidth, range]);

  // ---------- Reset ----------
  const handleReset = useCallback(() => {
    const resetValue = startPosition ?? range[0];
    resetMarker(resetValue);
    setLiveMarkerValue(resetValue);
    setHops([]);
    setExpandedDecade(null);
    lastSnappedValue.value = resetValue;
    if (containerWidth > 0) {
      const x = valueToX(resetValue, range, containerWidth);
      markerX.value = withSpring(x, SNAP_SPRING_CONFIG);
    }
  }, [startPosition, range, containerWidth, markerX, lastSnappedValue, resetMarker]);

  // ---------- Undo ----------
  const handleUndo = useCallback(() => {
    const prev = undoMarker();
    if (prev !== null) {
      setLiveMarkerValue(prev);
      setHops(buildHops(startValue, prev));
      lastSnappedValue.value = prev;
      if (containerWidth > 0) {
        const x = valueToX(prev, effectiveRange, containerWidth);
        markerX.value = withSpring(x, SNAP_SPRING_CONFIG);
      }
    }
  }, [undoMarker, startValue, lastSnappedValue, containerWidth, effectiveRange, markerX]);

  // ---------- Render ----------
  return (
    <ManipulativeShell
      count={displayValue}
      countLabel={`Position: ${displayValue}`}
      onReset={handleReset}
      onUndo={handleUndo}
      canUndo={canUndo}
      testID={testID}
    >
      <View style={styles.container} onLayout={onLayout}>
        {containerWidth > 0 && (
          <View style={styles.svgContainer}>
            <Svg width={containerWidth} height={SVG_HEIGHT}>
              <NumberLineSvg
                range={effectiveRange}
                width={containerWidth}
                lineY={LINE_Y}
                hops={hops}
                expandedDecade={expandedDecade}
              />
              {/* Marker circle rendered in SVG for visual alignment */}
              <Circle
                cx={0}
                cy={0}
                r={MARKER_RADIUS}
                fill={NUMBER_LINE_ACCENT}
                opacity={0}
              />
            </Svg>

            {/* Animated marker overlay -- positioned over the SVG */}
            <GuidedHighlight active={guidedTargetId === 'marker'}>
              <GestureDetector gesture={panGesture}>
                <Animated.View
                  style={[styles.marker, markerAnimatedStyle]}
                  accessible
                  accessibilityLabel={`Number line marker at ${displayValue}`}
                  accessibilityRole="adjustable"
                >
                  <View style={styles.markerInner} />
                </Animated.View>
              </GestureDetector>
            </GuidedHighlight>

            {/* Decade tap zones for 0-100 overview */}
            {decadeTapZones?.map((zone) => (
              <Pressable
                key={`decade-${zone.decadeStart}`}
                style={[
                  styles.decadeTapZone,
                  { left: zone.x, width: zone.width, height: SVG_HEIGHT },
                ]}
                onPress={() => handleDecadeTap(zone.decadeStart)}
                accessibilityLabel={`Expand decade ${zone.decadeStart} to ${zone.decadeStart + 10}`}
                accessibilityRole="button"
              />
            ))}

            {/* Back button when decade is expanded */}
            {expandedDecade !== null && (
              <Pressable
                style={styles.backButton}
                onPress={() => handleDecadeTap(expandedDecade)}
                accessibilityLabel="Collapse decade view"
                accessibilityRole="button"
              >
                <View style={styles.backButtonInner}>
                  <Animated.Text style={styles.backButtonText}>
                    Back
                  </Animated.Text>
                </View>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </ManipulativeShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  svgContainer: {
    position: 'relative',
  },
  marker: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MARKER_RADIUS * 2,
    height: MARKER_RADIUS * 2,
    borderRadius: MARKER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  markerInner: {
    width: MARKER_RADIUS * 2,
    height: MARKER_RADIUS * 2,
    borderRadius: MARKER_RADIUS,
    backgroundColor: NUMBER_LINE_ACCENT,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  decadeTapZone: {
    position: 'absolute',
    top: 0,
  },
  backButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 20,
  },
  backButtonInner: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
