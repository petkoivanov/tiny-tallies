import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Check, Lightbulb } from 'lucide-react-native';

import { useTheme, spacing, typography, layout } from '@/theme';

interface NumberPadProps {
  onSubmit: (value: string) => void;
  maxDigits?: number;
  showDecimal?: boolean;
  onShowMe?: () => void;
}

const BUTTON_SIZE = 56;
const GAP = 6;

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

export function NumberPad({
  onSubmit,
  maxDigits = 5,
  showDecimal = true,
  onShowMe,
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

  const hasValue = value.length > 0;
  const keypadWidth = 3 * BUTTON_SIZE + 2 * GAP;

  return (
    <View style={styles.container}>
      {/* Display row with Check button on the right */}
      <View style={styles.displayRow}>
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

        <Pressable
          testID="numpad-submit"
          style={({ pressed }) => [
            styles.checkButton,
            {
              backgroundColor: pressed
                ? colors.primary
                : hasValue
                  ? colors.primaryLight
                  : colors.surface,
              opacity: hasValue ? 1 : 0.4,
            },
          ]}
          onPress={handleSubmit}
          disabled={!hasValue}
          accessibilityRole="button"
          accessibilityLabel="Check answer"
        >
          <Check
            size={24}
            color={hasValue ? '#fff' : colors.textSecondary}
            strokeWidth={3}
          />
        </Pressable>
      </View>

      {/* 3x3 digit grid */}
      <View style={styles.keypad}>
        {DIGIT_ROWS.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((key) => (
              <Pressable
                key={key}
                testID={`numpad-key-${key}`}
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
            ))}
          </View>
        ))}

        {/* Bottom row: [showMe/decimal/empty] [0] [backspace] */}
        <View style={styles.row}>
          {onShowMe ? (
            <Pressable
              testID="numpad-show-me"
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor: pressed
                    ? colors.primaryLight + '30'
                    : colors.surface,
                  borderColor: colors.primaryLight + '20',
                },
              ]}
              onPress={onShowMe}
              accessibilityRole="button"
              accessibilityLabel="Show me how"
            >
              <PulsingBulb />
            </Pressable>
          ) : showDecimal ? (
            <Pressable
              testID="numpad-key-."
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor: pressed
                    ? colors.primaryLight + '30'
                    : colors.surface,
                  borderColor: colors.primaryLight + '20',
                },
              ]}
              onPress={() => handlePress('.')}
            >
              <Text style={[styles.keyText, { color: colors.textPrimary }]}>
                .
              </Text>
            </Pressable>
          ) : (
            <View style={styles.emptyKey} />
          )}

          <Pressable
            testID="numpad-key-0"
            style={({ pressed }) => [
              styles.key,
              {
                backgroundColor: pressed
                  ? colors.primaryLight + '30'
                  : colors.surface,
                borderColor: colors.primaryLight + '20',
              },
            ]}
            onPress={() => handlePress('0')}
          >
            <Text style={[styles.keyText, { color: colors.textPrimary }]}>
              0
            </Text>
          </Pressable>

          <Pressable
            testID="numpad-key-backspace"
            style={({ pressed }) => [
              styles.key,
              {
                backgroundColor: pressed
                  ? colors.primaryLight + '30'
                  : colors.surface,
                borderColor: colors.primaryLight + '20',
              },
            ]}
            onPress={() => handlePress('⌫')}
          >
            <Text style={[styles.keyText, { color: colors.textPrimary }]}>
              ⌫
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PulsingBulb() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Lightbulb size={32} color="#f5c542" fill="#f5c54240" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: GAP,
  },
  displayRow: {
    flexDirection: 'row',
    gap: GAP,
    alignItems: 'center',
  },
  display: {
    width: 2 * BUTTON_SIZE + GAP,
    height: BUTTON_SIZE,
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
  checkButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
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
});
