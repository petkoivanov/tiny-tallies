/**
 * FlatList-based wheel picker for numeric values 0-999.
 *
 * Renders as an absolutely positioned overlay within the bar model area.
 * Uses snapToInterval for smooth wheel behavior without keyboard input.
 */

import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  type ListRenderItemInfo,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useTheme, layout, spacing } from '../../../theme';
import {
  BAR_BORDER,
  BAR_UNKNOWN,
  NUMBER_PICKER_ITEM_HEIGHT,
  NUMBER_PICKER_VISIBLE_ITEMS,
} from './BarModelTypes';

interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  visible: boolean;
  onClose: () => void;
  /** Mark section as unknown "?" instead of a number. */
  onMarkUnknown?: () => void;
}

const PICKER_HEIGHT =
  NUMBER_PICKER_ITEM_HEIGHT * NUMBER_PICKER_VISIBLE_ITEMS;

/** Padding items for centering the first/last values in the visible area. */
const PADDING_ITEMS = Math.floor(NUMBER_PICKER_VISIBLE_ITEMS / 2);

export function NumberPicker({
  value,
  onChange,
  min = 0,
  max = 999,
  visible,
  onClose,
  onMarkUnknown,
}: NumberPickerProps) {
  const { colors } = useTheme();
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      width: 120,
      backgroundColor: colors.surface,
      borderRadius: layout.borderRadius.md,
      borderWidth: 2,
      borderColor: BAR_BORDER,
      overflow: 'hidden',
      zIndex: 11,
    },
    itemText: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    itemTextSelected: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    doneButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
  }), [colors]);
  const flatListRef = useRef<FlatList<number>>(null);

  // Build data array with padding items for centering
  const data = useMemo(() => {
    const numbers: number[] = [];
    // Add padding at start (use -1 sentinel for empty padding)
    for (let p = 0; p < PADDING_ITEMS; p++) {
      numbers.push(-1 - p);
    }
    for (let i = min; i <= max; i++) {
      numbers.push(i);
    }
    // Add padding at end
    for (let p = 0; p < PADDING_ITEMS; p++) {
      numbers.push(-100 - p);
    }
    return numbers;
  }, [min, max]);

  const initialIndex = useMemo(
    () => PADDING_ITEMS + (value - min),
    [value, min],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: NUMBER_PICKER_ITEM_HEIGHT,
      offset: NUMBER_PICKER_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const rawIndex = Math.round(offsetY / NUMBER_PICKER_ITEM_HEIGHT);
      const selectedValue = min + rawIndex;
      const clamped = Math.max(min, Math.min(max, selectedValue));
      onChange(clamped);
    },
    [min, max, onChange],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<number>) => {
      const isPadding = item < 0;
      if (isPadding) {
        return <View style={styles.item} />;
      }

      const centerIndex = PADDING_ITEMS + (value - min);
      const distance = Math.abs(index - centerIndex);
      const isSelected = distance === 0;
      const opacity = isSelected ? 1 : Math.max(0.3, 1 - distance * 0.25);

      return (
        <View style={styles.item} accessibilityLabel={`${item}`}>
          <Text
            style={[
              dynamicStyles.itemText,
              isSelected && dynamicStyles.itemTextSelected,
              { opacity },
            ]}
          >
            {item}
          </Text>
        </View>
      );
    },
    [value, min, dynamicStyles],
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Close number picker"
      />
      <View
        style={dynamicStyles.container}
        accessibilityLabel="Number picker"
        accessibilityRole="adjustable"
      >
        {onMarkUnknown ? (
          <Pressable
            style={styles.unknownButton}
            onPress={onMarkUnknown}
            accessibilityLabel="Mark as unknown"
          >
            <Text style={styles.unknownButtonText}>?</Text>
          </Pressable>
        ) : null}
        <View style={styles.listWrapper}>
          <View style={styles.selectionIndicator} />
          <FlatList
            ref={flatListRef}
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) => `picker-${index}-${item}`}
            getItemLayout={getItemLayout}
            initialScrollIndex={initialIndex}
            snapToInterval={NUMBER_PICKER_ITEM_HEIGHT}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            style={styles.list}
          />
        </View>
        <Pressable
          style={styles.doneButton}
          onPress={onClose}
          accessibilityLabel="Done"
        >
          <Text style={dynamicStyles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  unknownButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BAR_BORDER,
  },
  unknownButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: BAR_UNKNOWN,
  },
  listWrapper: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  selectionIndicator: {
    position: 'absolute',
    top: NUMBER_PICKER_ITEM_HEIGHT * PADDING_ITEMS,
    left: 0,
    right: 0,
    height: NUMBER_PICKER_ITEM_HEIGHT,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BAR_BORDER,
    zIndex: 1,
    pointerEvents: 'none',
  },
  list: {
    height: PICKER_HEIGHT,
  },
  item: {
    height: NUMBER_PICKER_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: BAR_BORDER,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
  },
});
