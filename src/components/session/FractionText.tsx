import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme, typography } from '@/theme';

interface FractionTextProps {
  /** Numerator (number or '?' for answer blanks) */
  numerator: string;
  /** Denominator (number or '?' for answer blanks) */
  denominator: string;
  /** Font size for the numerator and denominator text. Default 28. */
  fontSize?: number;
  /** Color override — defaults to theme textPrimary */
  color?: string;
}

/**
 * Renders a fraction as stacked numerator/denominator with a horizontal bar.
 *
 *    3
 *   ───
 *    5
 *
 * Sized proportionally to the given fontSize. The divider bar width
 * auto-fits to the wider of numerator/denominator text.
 */
export function FractionText({
  numerator,
  denominator,
  fontSize = 28,
  color,
}: FractionTextProps) {
  const { colors } = useTheme();
  const textColor = color ?? colors.textPrimary;
  const digitSize = fontSize * 0.65;
  const barThickness = Math.max(2, fontSize * 0.06);
  const barPadding = fontSize * 0.15;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.digit,
          { fontSize: digitSize, color: textColor },
        ]}
      >
        {numerator}
      </Text>
      <View
        style={[
          styles.bar,
          {
            height: barThickness,
            backgroundColor: textColor,
            marginVertical: barPadding,
          },
        ]}
      />
      <Text
        style={[
          styles.digit,
          { fontSize: digitSize, color: textColor },
        ]}
      >
        {denominator}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  digit: {
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    lineHeight: undefined, // let RN auto-size
  },
  bar: {
    minWidth: 20,
    alignSelf: 'stretch',
  },
});
