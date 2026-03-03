import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { ManipulativeShell } from '../ManipulativeShell';
import { triggerSnapHaptic, MAX_OBJECTS, DRAG_SCALE } from '../shared';
import { colors, spacing } from '@/theme';

import {
  COUNTER_COLORS,
  COUNTER_BORDER_COLORS,
  COUNTER_SIZE,
  STAGGER_OFFSET,
  type CounterState,
  type CounterColor,
  type CountersProps,
} from './CountersTypes';

// ---- Individual draggable counter ----

interface DraggableCounterProps {
  counter: CounterState;
  onFlip: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

/**
 * A single draggable, tappable counter rendered at an absolute position.
 *
 * - Pan: free-placement drag, commits final position to parent state
 * - Tap: flips counter color between red and yellow
 */
function DraggableCounter({ counter, onFlip, onMove }: DraggableCounterProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const tap = Gesture.Tap().onEnd(() => {
    'worklet';
    scheduleOnRN(onFlip, counter.id);
  });

  const pan = Gesture.Pan()
    .minDistance(8)
    .onStart(() => {
      'worklet';
      startX.value = translateX.value;
      startY.value = translateY.value;
      isDragging.value = true;
    })
    .onChange((event) => {
      'worklet';
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;
      const finalX = counter.x + translateX.value;
      const finalY = counter.y + translateY.value;
      // Reset translate to 0 -- position is now in React state
      translateX.value = 0;
      translateY.value = 0;
      scheduleOnRN(onMove, counter.id, finalX, finalY);
    });

  const composed = Gesture.Race(tap, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: isDragging.value ? DRAG_SCALE : 1 },
    ],
    zIndex: isDragging.value ? 999 : 0,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        testID={`counter-${counter.id}`}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${counter.color} counter`}
        style={[
          styles.counter,
          {
            left: counter.x,
            top: counter.y,
            backgroundColor: COUNTER_COLORS[counter.color],
            borderColor: COUNTER_BORDER_COLORS[counter.color],
          },
          animatedStyle,
        ]}
      />
    </GestureDetector>
  );
}

// ---- Custom dual-color counter display ----

interface DualCountDisplayProps {
  redCount: number;
  yellowCount: number;
}

function DualCountDisplay({ redCount, yellowCount }: DualCountDisplayProps) {
  return (
    <View
      style={styles.dualCount}
      testID="dual-count"
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Red: ${redCount}, Yellow: ${yellowCount}`}
    >
      <View style={styles.countRow}>
        <View style={[styles.colorDot, { backgroundColor: COUNTER_COLORS.red }]} />
        <Text style={styles.countText}>{redCount}</Text>
      </View>
      <Text style={styles.countSeparator}>|</Text>
      <View style={styles.countRow}>
        <View style={[styles.colorDot, { backgroundColor: COUNTER_COLORS.yellow }]} />
        <Text style={styles.countText}>{yellowCount}</Text>
      </View>
    </View>
  );
}

// ---- Main Counters component ----

/**
 * Two-color counter manipulative with free-placement drag and tap-to-flip.
 *
 * Children can add counters from a tray, drag them freely on the workspace,
 * and tap to flip between red and yellow. The running count shows both colors.
 * Capped at MAX_OBJECTS (30) with a gentle nudge message.
 */
export function Counters({ maxCounters = MAX_OBJECTS, testID }: CountersProps) {
  const [counters, setCounters] = useState<CounterState[]>([]);
  const nextId = useRef(0);

  const redCount = counters.filter((c) => c.color === 'red').length;
  const yellowCount = counters.filter((c) => c.color === 'yellow').length;
  const totalCount = counters.length;
  const atCap = totalCount >= maxCounters;

  const handleAdd = useCallback(() => {
    if (atCap) return;
    const id = `c-${nextId.current++}`;
    // Stagger position based on count to avoid overlap
    const col = totalCount % 5;
    const row = Math.floor(totalCount / 5) % 4;
    const x = spacing.md + col * STAGGER_OFFSET;
    const y = spacing.md + row * STAGGER_OFFSET;
    setCounters((prev) => [...prev, { id, color: 'red' as CounterColor, x, y }]);
  }, [atCap, totalCount]);

  const handleFlip = useCallback((id: string) => {
    triggerSnapHaptic();
    setCounters((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, color: c.color === 'red' ? 'yellow' : 'red' }
          : c,
      ),
    );
  }, []);

  const handleMove = useCallback((id: string, x: number, y: number) => {
    setCounters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, x, y } : c)),
    );
  }, []);

  const handleReset = useCallback(() => {
    setCounters([]);
    nextId.current = 0;
  }, []);

  const renderCounter = useCallback(
    () => <DualCountDisplay redCount={redCount} yellowCount={yellowCount} />,
    [redCount, yellowCount],
  );

  return (
    <ManipulativeShell
      count={totalCount}
      onReset={handleReset}
      renderCounter={renderCounter}
      testID={testID}
    >
      {/* Workspace -- free placement area */}
      <View style={styles.workspace}>
        {counters.map((counter) => (
          <DraggableCounter
            key={counter.id}
            counter={counter}
            onFlip={handleFlip}
            onMove={handleMove}
          />
        ))}
      </View>

      {/* Tray -- counter source at bottom */}
      <View style={styles.tray}>
        {atCap ? (
          <Text style={styles.nudgeText} testID="cap-nudge">
            Try grouping your counters!
          </Text>
        ) : (
          <Pressable
            onPress={handleAdd}
            accessibilityLabel="Add counter"
            accessibilityRole="button"
            testID="add-counter-button"
            style={styles.addButton}
          >
            <View
              style={[
                styles.counter,
                styles.trayCounter,
                {
                  backgroundColor: COUNTER_COLORS.red,
                  borderColor: COUNTER_BORDER_COLORS.red,
                },
              ]}
            />
            <Text style={styles.addLabel}>+ Add</Text>
          </Pressable>
        )}
      </View>
    </ManipulativeShell>
  );
}

const styles = StyleSheet.create({
  workspace: {
    flex: 1,
    position: 'relative',
  },
  counter: {
    position: 'absolute',
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    borderRadius: COUNTER_SIZE / 2,
    borderWidth: 2,
    // Pad touch target to meet 48dp minimum
    padding: (48 - COUNTER_SIZE) / 2,
  },
  tray: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
  },
  trayCounter: {
    position: 'relative',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 48,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  addLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  nudgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  dualCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: 'rgba(90, 127, 255, 0.12)',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  countText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countSeparator: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.textMuted,
  },
});
