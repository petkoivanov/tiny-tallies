/**
 * BaseTenBlocks -- primary manipulative for place-value understanding.
 *
 * Place-value mat with 3 labeled columns (Hundreds | Tens | Ones), block tray,
 * auto-group (10 cubes -> rod, 10 rods -> flat), tap-to-decompose,
 * cross-column drag decompose, 30-object cap, and running total value count.
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import {
  DraggableItem, SnapZone, triggerGroupHaptic,
  MAX_OBJECTS, RESET_SPRING_CONFIG, RESET_STAGGER_MS,
} from '../shared';
import type { SnapTarget } from '../shared';
import { ManipulativeShell } from '../ManipulativeShell';
import { colors, spacing } from '@/theme';

import type { BaseTenBlocksProps, BlockState, BlockType, PlaceValueColumn } from './BaseTenBlocksTypes';
import { COLUMN_COLORS, COLUMN_LABELS, GROUP_THRESHOLD } from './BaseTenBlocksTypes';
import { getBlockPosition, getColumnWidth, getBlockSize, TRAY_HEIGHT } from './BaseTenBlocksLayout';
import { CubeBlock, RodBlock, FlatBlock } from './BaseTenBlocksRenderers';
import { useAutoGroup, generateBlockId } from './useAutoGroup';

const COLUMNS: PlaceValueColumn[] = ['hundreds', 'tens', 'ones'];

function snapIdToColumn(snapId: string): PlaceValueColumn | null {
  if (snapId === 'col-ones') return 'ones';
  if (snapId === 'col-tens') return 'tens';
  if (snapId === 'col-hundreds') return 'hundreds';
  return null;
}

function blockTypeToColumn(type: BlockType): PlaceValueColumn {
  return type === 'cube' ? 'ones' : type === 'rod' ? 'tens' : 'hundreds';
}

function renderBlock(type: BlockType) {
  switch (type) {
    case 'cube': return <CubeBlock />;
    case 'rod': return <RodBlock />;
    case 'flat': return <FlatBlock />;
  }
}

export function BaseTenBlocks({ testID }: BaseTenBlocksProps) {
  const [blocks, setBlocks] = useState<BlockState[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isGrouping, setIsGrouping] = useState(false);

  const registeredOffsets = useRef<
    Map<string, { offsetX: SharedValue<number>; offsetY: SharedValue<number> }>
  >(new Map());
  const snapTargets = useSharedValue<SnapTarget[]>([]);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  // Computed values
  const totalValue = useMemo(() => {
    let v = 0;
    for (const b of blocks) {
      v += b.type === 'cube' ? 1 : b.type === 'rod' ? 10 : 100;
    }
    return v;
  }, [blocks]);

  const capMessage = blocks.length >= MAX_OBJECTS ? 'Try grouping your blocks!' : null;

  // Auto-group hook
  const { checkAutoGroup, clearTimer } = useAutoGroup({
    onGroupStart: () => setIsGrouping(true),
    onGroupEnd: (removedIds, newBlock) => {
      setBlocks((prev) => [...prev.filter((b) => !removedIds.includes(b.id)), newBlock]);
      setIsGrouping(false);
      setTimeout(() => checkAutoGroup(blocksRef.current), 50);
    },
  });

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const handleSnapMeasured = useCallback(
    (target: SnapTarget) => {
      snapTargets.modify((targets) => {
        'worklet';
        const idx = targets.findIndex((t) => t.id === target.id);
        if (idx >= 0) targets[idx] = target;
        else targets.push(target);
        return targets;
      });
    },
    [snapTargets],
  );

  // Add block from tray
  const addBlock = useCallback(
    (type: BlockType) => {
      if (isGrouping || blocksRef.current.length >= MAX_OBJECTS) return;
      const newBlock: BlockState = {
        id: generateBlockId(type),
        type,
        column: blockTypeToColumn(type),
      };
      setBlocks((prev) => {
        const next = [...prev, newBlock];
        setTimeout(() => checkAutoGroup(next), 0);
        return next;
      });
    },
    [isGrouping, checkAutoGroup],
  );

  // Decompose a block into GROUP_THRESHOLD smaller blocks
  const decomposeBlock = useCallback(
    (blockId: string, intoType: BlockType, intoColumn: PlaceValueColumn) => {
      if (isGrouping) return;
      if (blocksRef.current.length + GROUP_THRESHOLD - 1 > MAX_OBJECTS) return;

      const newBlocks: BlockState[] = Array.from({ length: GROUP_THRESHOLD }, () => ({
        id: generateBlockId(intoType),
        type: intoType,
        column: intoColumn,
      }));

      setBlocks((prev) => {
        const next = [...prev.filter((b) => b.id !== blockId), ...newBlocks];
        setTimeout(() => checkAutoGroup(next), 0);
        return next;
      });
      triggerGroupHaptic();
    },
    [isGrouping, checkAutoGroup],
  );

  // Tap-to-decompose
  const handleTap = useCallback(
    (itemId: string) => {
      const block = blocksRef.current.find((b) => b.id === itemId);
      if (!block) return;
      if (block.type === 'rod') decomposeBlock(block.id, 'cube', 'ones');
      else if (block.type === 'flat') decomposeBlock(block.id, 'rod', 'tens');
    },
    [decomposeBlock],
  );

  // Snap handler (drag to column)
  const handleSnap = useCallback(
    (itemId: string, targetId: string) => {
      const column = snapIdToColumn(targetId);
      if (!column) return;
      const block = blocksRef.current.find((b) => b.id === itemId);
      if (!block) return;

      // Cross-column decompose
      if (block.type === 'rod' && column === 'ones') {
        decomposeBlock(block.id, 'cube', 'ones');
        return;
      }
      if (block.type === 'flat' && column === 'tens') {
        decomposeBlock(block.id, 'rod', 'tens');
        return;
      }

      // Normal move
      setBlocks((prev) => {
        const next = prev.map((b) => (b.id === itemId ? { ...b, column } : b));
        setTimeout(() => checkAutoGroup(next), 0);
        return next;
      });
    },
    [decomposeBlock, checkAutoGroup],
  );

  const handleRegister = useCallback(
    (id: string, offsets: { offsetX: SharedValue<number>; offsetY: SharedValue<number> }) => {
      registeredOffsets.current.set(id, offsets);
    },
    [],
  );

  // Reset all blocks
  const handleReset = useCallback(() => {
    clearTimer();
    let delay = 0;
    registeredOffsets.current.forEach(({ offsetX, offsetY }) => {
      setTimeout(() => {
        offsetX.value = withSpring(0, RESET_SPRING_CONFIG);
        offsetY.value = withSpring(0, RESET_SPRING_CONFIG);
      }, delay);
      delay += RESET_STAGGER_MS;
    });
    setTimeout(() => {
      setBlocks([]);
      registeredOffsets.current.clear();
    }, delay + 200);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  // Render helpers
  const colWidth = containerWidth > 0 ? getColumnWidth(containerWidth) : 100;
  const blocksByColumn = useMemo(() => {
    const grouped: Record<PlaceValueColumn, BlockState[]> = { ones: [], tens: [], hundreds: [] };
    for (const b of blocks) grouped[b.column].push(b);
    return grouped;
  }, [blocks]);

  return (
    <ManipulativeShell count={totalValue} countLabel="Total" onReset={handleReset} testID={testID}>
      <View style={styles.matContainer} onLayout={handleLayout}>
        <View style={styles.columnsRow}>
          {COLUMNS.map((col) => (
            <SnapZone
              key={col}
              id={`col-${col}`}
              onMeasured={handleSnapMeasured}
              accessibilityLabel={`${COLUMN_LABELS[col]} column`}
              style={[styles.column, { width: colWidth, backgroundColor: COLUMN_COLORS[col] }]}
            >
              <Text style={styles.columnLabel}>{COLUMN_LABELS[col]}</Text>
              <View style={styles.blockArea}>
                {blocksByColumn[col].map((block, idx) => {
                  const pos = getBlockPosition(col, idx, containerWidth);
                  const size = getBlockSize(block.type);
                  return (
                    <DraggableItem
                      key={block.id}
                      id={block.id}
                      snapTargets={snapTargets}
                      onSnap={handleSnap}
                      onTap={handleTap}
                      onRegister={handleRegister}
                      enabled={!isGrouping}
                      accessibilityLabel={`${block.type} block in ${col} column`}
                      style={[styles.blockItem, { top: pos.y, width: size.width, height: size.height }]}
                    >
                      {renderBlock(block.type)}
                    </DraggableItem>
                  );
                })}
              </View>
            </SnapZone>
          ))}
        </View>

        {capMessage ? (
          <View style={styles.capMessageContainer}>
            <Text style={styles.capMessageText}>{capMessage}</Text>
          </View>
        ) : null}

        <View style={styles.tray}>
          <TraySource type="flat" label="100" onPress={addBlock} disabled={isGrouping || blocks.length >= MAX_OBJECTS} />
          <TraySource type="rod" label="10" onPress={addBlock} disabled={isGrouping || blocks.length >= MAX_OBJECTS} />
          <TraySource type="cube" label="1" onPress={addBlock} disabled={isGrouping || blocks.length >= MAX_OBJECTS} />
        </View>
      </View>
    </ManipulativeShell>
  );
}

// Tray source button extracted for DRY
function TraySource({ type, label, onPress, disabled }: {
  type: BlockType; label: string;
  onPress: (t: BlockType) => void; disabled: boolean;
}) {
  return (
    <Pressable
      onPress={() => onPress(type)}
      accessibilityLabel={`Add ${type}`}
      accessibilityRole="button"
      style={styles.traySource}
      disabled={disabled}
    >
      {renderBlock(type)}
      <Text style={styles.trayLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  matContainer: { flex: 1 },
  columnsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  column: {
    flex: 1,
    borderRadius: 8,
    paddingTop: spacing.xs,
    alignItems: 'center',
    minHeight: 200,
  },
  columnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  blockArea: { flex: 1, width: '100%', position: 'relative' },
  blockItem: { position: 'absolute' },
  capMessageContainer: { paddingVertical: spacing.xs, alignItems: 'center' },
  capMessageText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  tray: {
    height: TRAY_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
  },
  traySource: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  trayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
