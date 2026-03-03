import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { ManipulativeShell } from '../ManipulativeShell';
import { triggerSnapHaptic, MAX_OBJECTS, DRAG_SCALE, useActionHistory, GuidedHighlight } from '../shared';
import { colors, spacing } from '@/theme';

import {
  COUNTER_COLORS,
  COUNTER_BORDER_COLORS,
  COUNTER_SIZE,
  STAGGER_OFFSET,
  GRID_COUNTER_SPACING,
  type CounterState,
  type CounterColor,
  type CountersProps,
  type CountersGridState,
} from './CountersTypes';
import { CountersGrid, computeGridPositions } from './CountersGrid';
import { DualCountDisplay, DimensionStepper } from './CountersParts';

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

// ---- Helper: build grid-mode counters ----

function buildGridCounters(
  rows: number,
  cols: number,
  existing: CounterState[],
  nextIdRef: React.MutableRefObject<number>,
): CounterState[] {
  const cellSize = COUNTER_SIZE + GRID_COUNTER_SPACING;
  const positions = computeGridPositions({
    rows,
    cols,
    cellSize,
    originX: spacing.md,
    originY: spacing.md,
  });

  const total = rows * cols;
  const result: CounterState[] = [];

  for (let i = 0; i < total; i++) {
    if (i < existing.length) {
      // Reposition existing counter
      result.push({ ...existing[i], x: positions[i].x, y: positions[i].y });
    } else {
      // Create new counter to fill grid
      const id = `c-${nextIdRef.current++}`;
      result.push({ id, color: 'red' as CounterColor, x: positions[i].x, y: positions[i].y });
    }
  }

  return result;
}

// ---- Main Counters component ----

/**
 * Two-color counter manipulative with free-placement drag, tap-to-flip,
 * and grid array mode for multiplication visualization.
 *
 * Children can add counters from a tray, drag them freely on the workspace,
 * and tap to flip between red and yellow. Grid mode arranges counters in a
 * rows x columns layout. Capped at MAX_OBJECTS (30) with a gentle nudge.
 */
export function Counters({
  maxCounters = MAX_OBJECTS,
  guidedTargetId,
  gridRows,
  gridCols,
  testID,
}: CountersProps) {
  const { state: counters, canUndo, pushState, undo, reset } = useActionHistory<CounterState[]>([]);
  const nextId = useRef(0);

  // Grid state
  const [gridState, setGridState] = useState<CountersGridState>(() => ({
    mode: gridRows != null && gridCols != null ? 'grid' : 'free',
    rows: gridRows ?? 3,
    cols: gridCols ?? 4,
  }));

  // Auto-configure grid mode from session props on mount
  useEffect(() => {
    if (gridRows != null && gridCols != null) {
      setGridState({ mode: 'grid', rows: gridRows, cols: gridCols });
      const gridCounters = buildGridCounters(gridRows, gridCols, [], nextId);
      pushState(gridCounters);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const redCount = counters.filter((c) => c.color === 'red').length;
  const yellowCount = counters.filter((c) => c.color === 'yellow').length;
  const totalCount = counters.length;
  const atCap = totalCount >= maxCounters;
  const isGridMode = gridState.mode === 'grid';

  const handleAdd = useCallback(() => {
    if (atCap) return;
    const id = `c-${nextId.current++}`;
    // Stagger position based on count to avoid overlap
    const col = totalCount % 5;
    const row = Math.floor(totalCount / 5) % 4;
    const x = spacing.md + col * STAGGER_OFFSET;
    const y = spacing.md + row * STAGGER_OFFSET;
    pushState([...counters, { id, color: 'red' as CounterColor, x, y }]);
  }, [atCap, totalCount, counters, pushState]);

  const handleFlip = useCallback((id: string) => {
    triggerSnapHaptic();
    pushState(
      counters.map((c) =>
        c.id === id
          ? { ...c, color: c.color === 'red' ? 'yellow' : 'red' }
          : c,
      ),
    );
  }, [counters, pushState]);

  const handleMove = useCallback((id: string, x: number, y: number) => {
    pushState(
      counters.map((c) => (c.id === id ? { ...c, x, y } : c)),
    );
  }, [counters, pushState]);

  const handleReset = useCallback(() => {
    reset([]);
    nextId.current = 0;
    if (gridRows != null && gridCols != null) {
      // Session mode: reset back to session config
      setGridState({ mode: 'grid', rows: gridRows, cols: gridCols });
    } else {
      setGridState((prev) => ({ ...prev, mode: 'free' }));
    }
  }, [reset, gridRows, gridCols]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  // Grid toggle handler
  const handleGridToggle = useCallback(() => {
    if (isGridMode) {
      // Switch grid -> free: positions stay, drag re-enabled
      setGridState((prev) => ({ ...prev, mode: 'free' }));
    } else {
      // Switch free -> grid: arrange counters into grid
      const { rows, cols } = gridState;
      const gridCounters = buildGridCounters(rows, cols, counters, nextId);
      pushState(gridCounters);
      setGridState((prev) => ({ ...prev, mode: 'grid' }));
    }
  }, [isGridMode, gridState, counters, pushState]);

  // Handle dimension changes in sandbox grid mode
  const handleRowsChange = useCallback((newRows: number) => {
    setGridState((prev) => {
      const updated = { ...prev, rows: newRows };
      if (prev.mode === 'grid') {
        const gridCounters = buildGridCounters(newRows, prev.cols, counters, nextId);
        pushState(gridCounters);
      }
      return updated;
    });
  }, [counters, pushState]);

  const handleColsChange = useCallback((newCols: number) => {
    setGridState((prev) => {
      const updated = { ...prev, cols: newCols };
      if (prev.mode === 'grid') {
        const gridCounters = buildGridCounters(prev.rows, newCols, counters, nextId);
        pushState(gridCounters);
      }
      return updated;
    });
  }, [counters, pushState]);

  const renderCounter = useCallback(
    () => <DualCountDisplay redCount={redCount} yellowCount={yellowCount} />,
    [redCount, yellowCount],
  );

  // Show dimension pickers only in sandbox mode (no gridRows/gridCols props) when grid mode is on
  const showDimensionPickers = isGridMode && gridRows == null && gridCols == null;

  return (
    <ManipulativeShell
      count={totalCount}
      onReset={handleReset}
      onUndo={handleUndo}
      canUndo={canUndo}
      onGridToggle={handleGridToggle}
      isGridMode={isGridMode}
      renderCounter={renderCounter}
      testID={testID}
    >
      {/* Workspace */}
      {isGridMode ? (
        <View style={styles.gridWorkspace}>
          <CountersGrid
            counters={counters}
            rows={gridState.rows}
            cols={gridState.cols}
            onFlip={handleFlip}
          />
          {showDimensionPickers && (
            <View style={styles.dimensionPickers} testID="grid-dimension-pickers">
              <DimensionStepper
                label="Rows"
                value={gridState.rows}
                onChange={handleRowsChange}
                testID="rows-stepper"
              />
              <DimensionStepper
                label="Cols"
                value={gridState.cols}
                onChange={handleColsChange}
                testID="cols-stepper"
              />
            </View>
          )}
        </View>
      ) : (
        <>
          {/* Free placement area */}
          <View style={styles.workspace}>
            {counters.map((counter) => (
              <GuidedHighlight
                key={counter.id}
                active={guidedTargetId === counter.id}
              >
                <DraggableCounter
                  counter={counter}
                  onFlip={handleFlip}
                  onMove={handleMove}
                />
              </GuidedHighlight>
            ))}
          </View>

          {/* Tray -- counter source at bottom */}
          <View style={styles.tray}>
            {atCap ? (
              <Text style={styles.nudgeText} testID="cap-nudge">
                Try grouping your counters!
              </Text>
            ) : (
              <GuidedHighlight active={guidedTargetId === 'add-counter-button'}>
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
              </GuidedHighlight>
            )}
          </View>
        </>
      )}
    </ManipulativeShell>
  );
}

const styles = StyleSheet.create({
  workspace: {
    flex: 1,
    position: 'relative',
  },
  gridWorkspace: {
    flex: 1,
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
  dimensionPickers: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
});
