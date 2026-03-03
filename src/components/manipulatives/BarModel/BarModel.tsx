/**
 * Part-whole bar model manipulative with draggable dividers and labeled sections.
 *
 * Helps children visualize part-whole relationships for addition,
 * subtraction, and word problems. Users select a partition count (2/3/4),
 * then resize sections by dragging dividers, and label sections with
 * numeric values or "?" unknowns.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';

import { ManipulativeShell } from '../ManipulativeShell';
import { triggerSnapHaptic } from '../shared/haptics';
import { useActionHistory } from '../shared/useActionHistory';
import { GuidedHighlight } from '../shared/GuidedHighlight';
import { colors, spacing, typography } from '../../../theme';
import { NumberPicker } from './NumberPicker';
import { PresetButton, DividerHandle, SectionView } from './BarModelParts';
import {
  type SectionState,
  type BarModelProps,
  type PartitionCount,
  BAR_HEIGHT,
  BAR_BORDER,
  SNAP_PERCENT,
} from './BarModelTypes';
import { layout } from '../../../theme';

/** Minimum section width as fraction (10%). */
const MIN_SECTION_FRACTION = SNAP_PERCENT / 100;

/** Generate a short random ID. */
function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Create equal-width sections for a given partition count. */
function createSections(count: PartitionCount): SectionState[] {
  const fraction = 1 / count;
  return Array.from({ length: count }, () => ({
    id: generateId(),
    widthFraction: fraction,
    label: null,
    isUnknown: false,
  }));
}

/** Snap a fraction to the nearest SNAP_PERCENT increment. */
function snapFraction(fraction: number): number {
  const step = SNAP_PERCENT / 100;
  return Math.round(fraction / step) * step;
}

export function BarModel({ testID, guidedTargetId }: BarModelProps) {
  const [partitionCount, setPartitionCount] = useState<PartitionCount | null>(
    null,
  );
  const { state: sections, canUndo, pushState, undo, reset } = useActionHistory<SectionState[]>([]);
  const [pickerTarget, setPickerTarget] = useState<{
    sectionId: string;
    currentValue: number;
  } | null>(null);
  const [barWidth, setBarWidth] = useState(0);

  // --- Running total ---
  const total = useMemo(
    () =>
      sections.reduce(
        (sum, s) => sum + (s.label !== null ? s.label : 0),
        0,
      ),
    [sections],
  );

  // --- Handlers ---

  const handleSelectPartition = useCallback((count: PartitionCount) => {
    setPartitionCount(count);
    pushState(createSections(count));
    setPickerTarget(null);
  }, [pushState]);

  const handleReset = useCallback(() => {
    setPartitionCount(null);
    reset([]);
    setPickerTarget(null);
  }, [reset]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleBarLayout = useCallback((event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  }, []);

  const handleSectionTap = useCallback(
    (sectionId: string) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;
      setPickerTarget({
        sectionId,
        currentValue: section.label ?? 0,
      });
    },
    [sections],
  );

  const handlePickerChange = useCallback(
    (value: number) => {
      if (!pickerTarget) return;
      pushState(
        sections.map((s) =>
          s.id === pickerTarget.sectionId
            ? { ...s, label: value, isUnknown: false }
            : s,
        ),
      );
      setPickerTarget((prev) =>
        prev ? { ...prev, currentValue: value } : null,
      );
    },
    [pickerTarget, sections, pushState],
  );

  const handlePickerClose = useCallback(() => {
    setPickerTarget(null);
  }, []);

  const handleMarkUnknown = useCallback(() => {
    if (!pickerTarget) return;
    pushState(
      sections.map((s) =>
        s.id === pickerTarget.sectionId
          ? { ...s, label: null, isUnknown: true }
          : s,
      ),
    );
    setPickerTarget(null);
    triggerSnapHaptic();
  }, [pickerTarget, sections, pushState]);

  const handleDividerMove = useCallback(
    (dividerIndex: number, newCumulativePosition: number) => {
      const updated = [...sections];
      const left = updated[dividerIndex];
      const right = updated[dividerIndex + 1];
      if (!left || !right) return;

      // Compute cumulative left edge of the left section
      let cumulativeLeft = 0;
      for (let i = 0; i < dividerIndex; i++) {
        cumulativeLeft += updated[i].widthFraction;
      }

      // New left fraction = position - cumulative left
      let newLeftFraction = snapFraction(
        newCumulativePosition - cumulativeLeft,
      );
      // Right fraction compensates
      const combinedFraction = left.widthFraction + right.widthFraction;
      let newRightFraction = combinedFraction - newLeftFraction;

      // Enforce minimum section width
      if (newLeftFraction < MIN_SECTION_FRACTION) {
        newLeftFraction = MIN_SECTION_FRACTION;
        newRightFraction = combinedFraction - MIN_SECTION_FRACTION;
      }
      if (newRightFraction < MIN_SECTION_FRACTION) {
        newRightFraction = MIN_SECTION_FRACTION;
        newLeftFraction = combinedFraction - MIN_SECTION_FRACTION;
      }

      updated[dividerIndex] = { ...left, widthFraction: newLeftFraction };
      updated[dividerIndex + 1] = {
        ...right,
        widthFraction: newRightFraction,
      };
      // Live update during drag (not pushed to undo history)
      pushState(updated);
    },
    [sections, pushState],
  );

  const handleDividerEnd = useCallback(() => {
    // Divider drag end -- state already committed via pushState during move
  }, []);

  // --- Render: Partition Selection ---

  if (partitionCount === null) {
    return (
      <ManipulativeShell
        count={0}
        countLabel="Total"
        onReset={handleReset}
        testID={testID}
      >
        <View style={styles.presetContainer}>
          <Text style={styles.presetTitle}>Choose partitions</Text>
          <View style={styles.presetRow}>
            {([2, 3, 4] as PartitionCount[]).map((count) => (
              <PresetButton
                key={count}
                count={count}
                onSelect={handleSelectPartition}
              />
            ))}
          </View>
        </View>
      </ManipulativeShell>
    );
  }

  // --- Render: Bar Model ---

  return (
    <ManipulativeShell
      count={total}
      countLabel="Total"
      onReset={handleReset}
      onUndo={handleUndo}
      canUndo={canUndo}
      testID={testID}
    >
      <View style={styles.workspace}>
        {/* Bar container */}
        <View style={styles.barOuter} onLayout={handleBarLayout}>
          <View style={styles.barInner}>
            {/* Sections */}
            <View style={styles.sectionsRow}>
              {sections.map((section, index) => (
                <SectionView
                  key={section.id}
                  section={section}
                  sectionIndex={index}
                  barWidth={barWidth}
                  onTap={handleSectionTap}
                />
              ))}
            </View>

            {/* Dividers */}
            {barWidth > 0 &&
              sections.slice(0, -1).map((section, index) => {
                let cLeft = 0;
                for (let i = 0; i < index; i++) {
                  cLeft += sections[i].widthFraction;
                }
                return (
                  <DividerHandle
                    key={`divider-${index}`}
                    index={index}
                    barWidth={barWidth}
                    leftFraction={section.widthFraction}
                    cumulativeLeft={cLeft}
                    onDividerMove={handleDividerMove}
                    onDividerEnd={handleDividerEnd}
                  />
                );
              })}
          </View>

          {/* Number Picker Overlay */}
          <NumberPicker
            value={pickerTarget?.currentValue ?? 0}
            onChange={handlePickerChange}
            visible={pickerTarget !== null}
            onClose={handlePickerClose}
            onMarkUnknown={handleMarkUnknown}
          />
        </View>

        {/* Section labels below bar */}
        <View style={styles.labelsRow}>
          {sections.map((section, index) => {
            const width = section.widthFraction * barWidth;
            return (
              <View
                key={`label-${section.id}`}
                style={[styles.labelContainer, { width }]}
              >
                <Text style={styles.labelIndex}>{index + 1}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ManipulativeShell>
  );
}

const styles = StyleSheet.create({
  presetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  presetTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  workspace: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  barOuter: {
    position: 'relative',
  },
  barInner: {
    height: BAR_HEIGHT,
    borderRadius: layout.borderRadius.md,
    borderWidth: 2,
    borderColor: BAR_BORDER,
    overflow: 'hidden',
    position: 'relative',
  },
  sectionsRow: {
    flexDirection: 'row',
    height: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  labelContainer: {
    alignItems: 'center',
  },
  labelIndex: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
});
