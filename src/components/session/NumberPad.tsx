import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  allowNegative?: boolean;
}

const BUTTON_SIZE = 52;
const GAP = 5;

const DIGIT_ROWS = [
  ['1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '0'],
] as const;

export function NumberPad({
  onSubmit,
  maxDigits = 5,
  showDecimal = true,
  onShowMe,
  allowNegative = false,
}: NumberPadProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const [locked, setLocked] = useState(false);
  const submittedRef = useRef(false);

  const handlePress = useCallback(
    (key: string) => {
      if (submittedRef.current) return;
      if (key === '⌫') {
        setValue((prev) => prev.slice(0, -1));
        return;
      }

      if (key === '±') {
        setValue((prev) => {
          if (prev === '') return '-'; // start negative
          if (prev === '-') return ''; // toggle back to empty
          return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
        });
        return;
      }

      if (key === '.' && !showDecimal) return;
      if (key === '.' && value.includes('.')) return;

      setValue((prev) => {
        if (prev.replace('-', '').length >= maxDigits) return prev;
        return prev + key;
      });
    },
    [value, maxDigits, showDecimal],
  );

  const handleSubmit = useCallback(() => {
    if (value.length > 0 && !submittedRef.current) {
      submittedRef.current = true;
      setLocked(true);
      onSubmit(value);
    }
  }, [value, onSubmit]);

  const hasValue = value.length > 0;

  return (
    <View style={[styles.container, locked && { opacity: 0.5 }]}>
      {/* Display row: [display] [⌫] [✓] */}
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
            testID="numberpad-display"
          >
            {value || '?'}
          </Text>
        </View>

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
            size={22}
            color={hasValue ? '#fff' : colors.textSecondary}
            strokeWidth={3}
          />
        </Pressable>
      </View>

      {/* Row 1: 1-5 */}
      <View style={styles.keypad}>
        <View style={styles.row}>
          {DIGIT_ROWS[0].map((key) => (
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

        {/* Row 2: 6-0 */}
        <View style={styles.row}>
          {DIGIT_ROWS[1].map((key) => (
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

        {/* Row 3: ± key, showMe, or decimal (if applicable) */}
        {(allowNegative || onShowMe || showDecimal) && (
          <View style={styles.row}>
            {allowNegative && (
              <Pressable
                testID="key-plus-minus"
                style={({ pressed }) => [
                  styles.key,
                  styles.specialKey,
                  {
                    backgroundColor: pressed
                      ? colors.primaryLight + '30'
                      : colors.surface,
                    borderColor: colors.primaryLight + '20',
                  },
                ]}
                onPress={() => handlePress('±')}
              >
                <Text style={[styles.keyText, { color: colors.textPrimary }]}>
                  ±
                </Text>
              </Pressable>
            )}
            {onShowMe && (
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
            )}
            {!onShowMe && showDecimal && (
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
            )}
          </View>
        )}
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
    flex: 1,
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
  specialKey: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  keyText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
  },
});
