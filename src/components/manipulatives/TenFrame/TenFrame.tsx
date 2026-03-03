import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { ManipulativeShell } from '../ManipulativeShell';
import {
  DraggableItem,
  SnapZone,
  triggerSnapHaptic,
  type SnapTarget,
} from '../shared';
import { colors, spacing } from '@/theme';

import {
  GRID_COLS,
  GRID_ROWS,
  CELLS_PER_FRAME,
  CELL_SIZE,
  TEN_FRAME_COLOR,
  TEN_FRAME_BORDER,
  COUNTER_COLOR,
  COUNTER_BORDER,
  type TenFrameProps,
} from './TenFrameTypes';

// ---- Ten Frame Grid ----

interface FrameGridProps {
  /** Starting cell index for this frame (0 or 10). */
  startIndex: number;
  /** Cell occupation array (full array, not just this frame's slice). */
  cells: boolean[];
  /** Callback when a cell is tapped (for removal). */
  onCellTap: (index: number) => void;
  /** Callback when a SnapZone reports its position. */
  onMeasured: (target: SnapTarget) => void;
  /** Frame number for labeling (1 or 2). */
  frameNumber: number;
}

/**
 * Renders a single 2x5 grid of SnapZone cells.
 */
function FrameGrid({
  startIndex,
  cells,
  onCellTap,
  onMeasured,
  frameNumber,
}: FrameGridProps) {
  const rows = Array.from({ length: GRID_ROWS }, (_, row) =>
    Array.from({ length: GRID_COLS }, (_, col) => startIndex + row * GRID_COLS + col),
  );

  return (
    <View
      style={styles.frame}
      testID={`ten-frame-${frameNumber}`}
      accessible
      accessibilityLabel={`Ten frame ${frameNumber}`}
    >
      {rows.map((rowCells, rowIdx) => (
        <View key={`row-${rowIdx}`} style={styles.row}>
          {rowCells.map((cellIndex) => {
            const occupied = cells[cellIndex] ?? false;
            return (
              <SnapZone
                key={`cell-${cellIndex}`}
                id={`cell-${cellIndex}`}
                onMeasured={onMeasured}
                isOccupied={occupied}
                accessibilityLabel={`Cell ${cellIndex + 1}, ${occupied ? 'filled' : 'empty'}`}
                style={styles.cell}
              >
                {occupied ? (
                  <Pressable
                    onPress={() => onCellTap(cellIndex)}
                    accessibilityLabel={`Remove counter from cell ${cellIndex + 1}`}
                    accessibilityRole="button"
                    testID={`cell-counter-${cellIndex}`}
                    style={styles.cellPressable}
                  >
                    <View style={styles.cellCounter} />
                  </Pressable>
                ) : null}
              </SnapZone>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ---- Draggable tray counter ----

interface TrayCounterProps {
  snapTargets: SharedValue<SnapTarget[]>;
  onSnap: (itemId: string, targetId: string) => void;
}

/**
 * A draggable counter source in the tray area.
 * When snapped to a cell, the parent handles placing and respawning a new tray item.
 */
function TrayCounter({ snapTargets, onSnap }: TrayCounterProps) {
  const keyRef = useRef(0);
  const [key, setKey] = useState(0);

  const handleSnap = useCallback(
    (itemId: string, targetId: string) => {
      onSnap(itemId, targetId);
      // Respawn tray counter by re-keying
      keyRef.current += 1;
      setKey(keyRef.current);
    },
    [onSnap],
  );

  return (
    <DraggableItem
      key={`tray-${key}`}
      id={`tray-counter-${key}`}
      snapTargets={snapTargets}
      onSnap={handleSnap}
      accessibilityLabel="Add counter to ten frame"
      style={styles.trayItemWrapper}
    >
      <View style={styles.trayCounter} />
    </DraggableItem>
  );
}

// ---- Main TenFrame component ----

/**
 * Ten Frame manipulative with 2x5 snap grid and dual-frame support.
 *
 * Children drag counters from a tray to snap into grid cells. Tapping an
 * occupied cell removes the counter. When the first frame is full (10/10),
 * a second frame auto-spawns below. Running count shows total occupied cells.
 */
export function TenFrame({ testID }: TenFrameProps) {
  const [cells, setCells] = useState<boolean[]>(
    () => new Array(CELLS_PER_FRAME).fill(false) as boolean[],
  );
  const [frameCount, setFrameCount] = useState(1);

  // Track snap targets -- updated by SnapZone onMeasured callbacks
  const snapTargets = useSharedValue<SnapTarget[]>([]);

  // Occupied count across all frames
  const occupiedCount = useMemo(
    () => cells.filter(Boolean).length,
    [cells],
  );

  // Track whether first frame is full to trigger second frame
  const firstFrameFull = useMemo(
    () => cells.slice(0, CELLS_PER_FRAME).every(Boolean),
    [cells],
  );

  // Auto-spawn second frame when first is full
  React.useEffect(() => {
    if (firstFrameFull && frameCount === 1) {
      setFrameCount(2);
      setCells((prev) => {
        if (prev.length < CELLS_PER_FRAME * 2) {
          return [...prev, ...new Array(CELLS_PER_FRAME).fill(false) as boolean[]];
        }
        return prev;
      });
    }
  }, [firstFrameFull, frameCount]);

  // Rebuild snap targets filtering out occupied cells
  const updateSnapTargets = useCallback(
    (allTargets: Map<string, SnapTarget>, currentCells: boolean[]) => {
      const filtered = Array.from(allTargets.values()).filter((t) => {
        const idx = parseInt(t.id.replace('cell-', ''), 10);
        return !currentCells[idx];
      });
      snapTargets.value = filtered;
    },
    [snapTargets],
  );

  // Store all measured targets (including occupied ones)
  const allTargetsRef = useRef<Map<string, SnapTarget>>(new Map());

  const handleMeasured = useCallback(
    (target: SnapTarget) => {
      allTargetsRef.current.set(target.id, target);
      updateSnapTargets(allTargetsRef.current, cells);
    },
    [cells, updateSnapTargets],
  );

  // Update snap targets whenever cells change (filter occupied)
  React.useEffect(() => {
    updateSnapTargets(allTargetsRef.current, cells);
  }, [cells, updateSnapTargets]);

  const handleSnap = useCallback(
    (_itemId: string, targetId: string) => {
      const cellIndex = parseInt(targetId.replace('cell-', ''), 10);
      setCells((prev) => {
        if (prev[cellIndex]) return prev; // Already occupied -- reject
        const next = [...prev];
        next[cellIndex] = true;
        return next;
      });
      triggerSnapHaptic();
    },
    [],
  );

  const handleCellTap = useCallback((index: number) => {
    setCells((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setCells(new Array(CELLS_PER_FRAME).fill(false) as boolean[]);
    setFrameCount(1);
    allTargetsRef.current.clear();
    snapTargets.value = [];
  }, [snapTargets]);

  return (
    <ManipulativeShell
      count={occupiedCount}
      countLabel="Count"
      onReset={handleReset}
      testID={testID}
    >
      {/* Grid area */}
      <View style={styles.gridArea} key={`grid-${frameCount}`}>
        <FrameGrid
          startIndex={0}
          cells={cells}
          onCellTap={handleCellTap}
          onMeasured={handleMeasured}
          frameNumber={1}
        />
        {frameCount >= 2 && (
          <FrameGrid
            startIndex={CELLS_PER_FRAME}
            cells={cells}
            onCellTap={handleCellTap}
            onMeasured={handleMeasured}
            frameNumber={2}
          />
        )}
      </View>

      {/* Tray -- counter source at bottom */}
      <View style={styles.tray}>
        <TrayCounter snapTargets={snapTargets} onSnap={handleSnap} />
        <Text style={styles.trayLabel}>Drag to place</Text>
      </View>
    </ManipulativeShell>
  );
}

const styles = StyleSheet.create({
  gridArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  frame: {
    borderWidth: 2,
    borderColor: TEN_FRAME_BORDER,
    borderRadius: 8,
    backgroundColor: `${TEN_FRAME_COLOR}26`, // 0.15 alpha
    padding: 2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: TEN_FRAME_BORDER,
    borderRadius: 4,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
  },
  cellPressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCounter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COUNTER_COLOR,
    borderWidth: 2,
    borderColor: COUNTER_BORDER,
  },
  tray: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  trayItemWrapper: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trayCounter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COUNTER_COLOR,
    borderWidth: 2,
    borderColor: COUNTER_BORDER,
  },
  trayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
});
