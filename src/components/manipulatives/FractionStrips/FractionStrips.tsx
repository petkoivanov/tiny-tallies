/**
 * FractionStrips -- Tap-to-shade fraction strips with vertical stacking.
 *
 * Up to 3 strips can be stacked for visual comparison of fractions.
 * Each strip is divided into equal sections that toggle shading on tap.
 * Strips share the same total width so sections align proportionally
 * (e.g. 1/2 visually aligns with 2/4).
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';

import { ManipulativeShell } from '../ManipulativeShell';
import { triggerSnapHaptic } from '../shared/haptics';
import { useActionHistory } from '../shared/useActionHistory';
import { GuidedHighlight } from '../shared/GuidedHighlight';
import { colors, spacing, layout } from '@/theme';
import {
  DENOMINATORS,
  MAX_STRIPS,
  SECTION_HEIGHT,
  MIN_SECTION_WIDTH,
  FRACTION_SHADED,
  FRACTION_UNSHADED,
  FRACTION_BORDER,
  type Denominator,
  type StripState,
  type FractionStripsProps,
} from './FractionStripsTypes';

// ---------- Helpers ----------

/** Create a new strip with all sections unshaded. */
function createStrip(denominator: Denominator): StripState {
  return {
    denominator,
    shaded: Array.from<boolean>({ length: denominator }).fill(false),
  };
}

/** Count total shaded sections across all strips. */
function totalShaded(strips: StripState[]): number {
  return strips.reduce(
    (sum, strip) => sum + strip.shaded.filter(Boolean).length,
    0,
  );
}

/** Get fraction label for a strip: "numerator/denominator". */
function fractionLabel(strip: StripState): string {
  const numerator = strip.shaded.filter(Boolean).length;
  return `${numerator}/${strip.denominator}`;
}

// ---------- Sub-components ----------

interface StripRowProps {
  strip: StripState;
  stripIndex: number;
  stripWidth: number;
  onToggle: (stripIdx: number, sectionIdx: number) => void;
  onRemove: (stripIdx: number) => void;
  canRemove: boolean;
  guidedTargetId?: string | null;
}

function StripRow({
  strip,
  stripIndex,
  stripWidth,
  onToggle,
  onRemove,
  canRemove,
  guidedTargetId,
}: StripRowProps) {
  const sectionWidth = stripWidth / strip.denominator;
  const needsScroll = sectionWidth < MIN_SECTION_WIDTH;
  const actualSectionWidth = needsScroll ? MIN_SECTION_WIDTH : sectionWidth;

  const sections = strip.shaded.map((isShaded, sectionIdx) => {
    const isFirst = sectionIdx === 0;
    const isLast = sectionIdx === strip.denominator - 1;
    const sectionId = `section-${stripIndex}-${sectionIdx}`;

    return (
      <GuidedHighlight key={`section-${sectionIdx}`} active={guidedTargetId === sectionId}>
        <Pressable
          style={[
            styles.section,
            {
              width: actualSectionWidth,
              height: SECTION_HEIGHT,
              backgroundColor: isShaded ? FRACTION_SHADED : FRACTION_UNSHADED,
              borderTopLeftRadius: isFirst ? layout.borderRadius.sm : 0,
              borderBottomLeftRadius: isFirst ? layout.borderRadius.sm : 0,
              borderTopRightRadius: isLast ? layout.borderRadius.sm : 0,
              borderBottomRightRadius: isLast ? layout.borderRadius.sm : 0,
              borderRightWidth: isLast ? 2 : 1,
            },
          ]}
          onPress={() => onToggle(stripIndex, sectionIdx)}
          accessibilityLabel={`${isShaded ? 'Shaded' : 'Unshaded'} section ${sectionIdx + 1} of ${strip.denominator}`}
          accessibilityRole="button"
        />
      </GuidedHighlight>
    );
  });

  const stripContent = (
    <View style={styles.stripSections}>
      {sections}
    </View>
  );

  return (
    <View style={styles.stripRow}>
      {needsScroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ width: stripWidth }}
        >
          {stripContent}
        </ScrollView>
      ) : (
        <View style={{ width: stripWidth }}>{stripContent}</View>
      )}

      <View style={styles.labelContainer}>
        <Text style={styles.fractionLabel}>{fractionLabel(strip)}</Text>
        {canRemove && (
          <Pressable
            onPress={() => onRemove(stripIndex)}
            style={styles.removeButton}
            accessibilityLabel={`Remove fraction strip ${stripIndex + 1}`}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.removeButtonText}>x</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ---------- Denominator selector ----------

interface DenominatorSelectorProps {
  onSelect: (d: Denominator) => void;
}

function DenominatorSelector({ onSelect }: DenominatorSelectorProps) {
  return (
    <View style={styles.denominatorRow}>
      {DENOMINATORS.map((d) => (
        <Pressable
          key={`denom-${d}`}
          style={styles.denominatorButton}
          onPress={() => onSelect(d)}
          accessibilityLabel={`Add strip with ${d} sections`}
          accessibilityRole="button"
        >
          <Text style={styles.denominatorText}>{d}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------- Main component ----------

export function FractionStrips({
  initialStrips,
  guidedTargetId,
  testID,
}: FractionStripsProps) {
  const initialState = initialStrips ?? [createStrip(2)];
  const { state: strips, canUndo, pushState, undo, reset } = useActionHistory<StripState[]>(initialState);
  const [stripWidth, setStripWidth] = useState(0);
  const [showSelector, setShowSelector] = useState(false);

  // ---------- Layout ----------
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    // Reserve space for the fraction label on the right
    const w = event.nativeEvent.layout.width - LABEL_AREA_WIDTH;
    setStripWidth(Math.max(0, w));
  }, []);

  // ---------- Toggle section shading ----------
  const toggleSection = useCallback(
    (stripIdx: number, sectionIdx: number) => {
      const next = strips.map((strip, i) => {
        if (i !== stripIdx) return strip;
        const newShaded = [...strip.shaded];
        newShaded[sectionIdx] = !newShaded[sectionIdx];
        return { ...strip, shaded: newShaded };
      });
      pushState(next);
      triggerSnapHaptic();
    },
    [strips, pushState],
  );

  // ---------- Add strip ----------
  const addStrip = useCallback(
    (denominator: Denominator) => {
      if (strips.length >= MAX_STRIPS) return;
      pushState([...strips, createStrip(denominator)]);
      setShowSelector(false);
    },
    [strips, pushState],
  );

  // ---------- Remove strip ----------
  const removeStrip = useCallback(
    (stripIdx: number) => {
      if (strips.length <= 1) return;
      pushState(strips.filter((_, i) => i !== stripIdx));
    },
    [strips, pushState],
  );

  // ---------- Reset ----------
  const handleReset = useCallback(() => {
    reset([createStrip(2)]);
    setShowSelector(false);
  }, [reset]);

  // ---------- Undo ----------
  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  // ---------- Count and label ----------
  const count = totalShaded(strips);
  const countLabel =
    strips.length > 0 ? fractionLabel(strips[0]) : '0/2';

  return (
    <ManipulativeShell
      count={count}
      countLabel={countLabel}
      onReset={handleReset}
      onUndo={handleUndo}
      canUndo={canUndo}
      testID={testID}
    >
      <View style={styles.container} onLayout={onLayout}>
        {stripWidth > 0 &&
          strips.map((strip, idx) => (
            <StripRow
              key={`strip-${idx}`}
              strip={strip}
              stripIndex={idx}
              stripWidth={stripWidth}
              onToggle={toggleSection}
              onRemove={removeStrip}
              canRemove={strips.length > 1}
              guidedTargetId={guidedTargetId}
            />
          ))}

        {/* Add strip button / selector */}
        {strips.length < MAX_STRIPS && (
          <View style={styles.addArea}>
            {showSelector ? (
              <DenominatorSelector onSelect={addStrip} />
            ) : (
              <Pressable
                style={styles.addButton}
                onPress={() => setShowSelector(true)}
                accessibilityLabel="Add fraction strip"
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>+ Add Strip</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </ManipulativeShell>
  );
}

// ---------- Constants ----------
const LABEL_AREA_WIDTH = 72;

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
  },
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stripSections: {
    flexDirection: 'row',
  },
  section: {
    borderWidth: 2,
    borderColor: FRACTION_BORDER,
    borderRightWidth: 1,
  },
  labelContainer: {
    width: LABEL_AREA_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: spacing.sm,
  },
  fractionLabel: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  removeButton: {
    marginTop: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(248, 113, 113, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '700',
  },
  addArea: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: layout.borderRadius.md,
    borderWidth: 2,
    borderColor: FRACTION_BORDER,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  denominatorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  denominatorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FRACTION_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denominatorText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
