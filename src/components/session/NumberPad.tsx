import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme, spacing, typography, layout } from '@/theme';

interface NumberPadProps {
  onSubmit: (value: string) => void;
  maxDigits?: number;
  showDecimal?: boolean;
}

const BUTTON_SIZE = 64;
const GAP = spacing.sm;

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
] as const;

export function NumberPad({
  onSubmit,
  maxDigits = 5,
  showDecimal = true,
}: NumberPadProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');

  const handlePress = useCallback(
    (key: string) => {
      if (key === '⌫') {
        setValue((prev) => prev.slice(0, -1));
        return;
      }

      if (key === '.' && !showDecimal) return;
      if (key === '.' && value.includes('.')) return;

      setValue((prev) => {
        if (prev.length >= maxDigits) return prev;
        return prev + key;
      });
    },
    [value, maxDigits, showDecimal],
  );

  const handleSubmit = useCallback(() => {
    if (value.length > 0) {
      onSubmit(value);
      setValue('');
    }
  }, [value, onSubmit]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.display,
          {
            backgroundColor: colors.surface,
            borderColor: colors.primaryLight + '40',
          },
        ]}
      >
        <Text
          style={[
            styles.displayText,
            { color: value ? colors.textPrimary : colors.textSecondary },
          ]}
          numberOfLines={1}
          testID="number-pad-display"
        >
          {value || '?'}
        </Text>
      </View>

      <View style={styles.keypad}>
        {KEYS.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((key) => {
              if (key === '.' && !showDecimal) {
                return <View key={key} style={styles.emptyKey} />;
              }

              return (
                <Pressable
                  key={key}
                  testID={`numpad-key-${key === '⌫' ? 'backspace' : key}`}
                  style={({ pressed }) => [
                    styles.key,
                    {
                      backgroundColor: pressed
                        ? colors.primaryLight + '30'
                        : colors.surface,
                      borderColor: colors.primaryLight + '20',
                    },
                  ]}
                  onPress={() => handlePress(key)}
                >
                  <Text style={[styles.keyText, { color: colors.textPrimary }]}>
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Pressable
        testID="numpad-submit"
        style={({ pressed }) => [
          styles.submitButton,
          {
            backgroundColor: pressed
              ? colors.primary
              : value.length > 0
                ? colors.primaryLight
                : colors.surface,
            opacity: value.length > 0 ? 1 : 0.5,
          },
        ]}
        onPress={handleSubmit}
        disabled={value.length === 0}
      >
        <Text
          style={[
            styles.submitText,
            { color: value.length > 0 ? '#fff' : colors.textSecondary },
          ]}
        >
          Check
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  display: {
    width: 3 * BUTTON_SIZE + 2 * GAP,
    height: 56,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  displayText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
  },
  keypad: {
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  key: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyKey: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  keyText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
  },
  submitButton: {
    width: 3 * BUTTON_SIZE + 2 * GAP,
    height: 56,
    borderRadius: layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
});
