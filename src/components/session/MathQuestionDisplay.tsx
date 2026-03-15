import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme, typography } from '@/theme';
import { FractionText } from './FractionText';

/** A parsed segment of a math question string */
type QuestionSegment =
  | { type: 'text'; value: string }
  | { type: 'fraction'; numerator: string; denominator: string };

/**
 * Parses a question string and extracts fraction notation (e.g. "3/5", "?/12")
 * into structured segments for visual rendering.
 *
 * Handles:
 *  - Simple fractions: "3/5"
 *  - Answer blanks: "?/5"
 *  - Mixed numbers: "2 3/5" (whole number kept as text, fraction rendered stacked)
 *  - Operators and surrounding text preserved as-is
 */
export function parseQuestionText(text: string): QuestionSegment[] {
  // Match fractions: optional "?" or digits for numerator, "/" , digits for denominator
  // Negative lookbehind for letter to avoid matching "parts" in "4 equal parts. 3/4"
  const fractionPattern = /(\?|\d+)\/(\d+)/g;
  const segments: QuestionSegment[] = [];
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = fractionPattern.exec(text)) !== null) {
    // Add any text before this fraction
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    segments.push({
      type: 'fraction',
      numerator: match[1],
      denominator: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Returns true if a question string contains fraction notation worth rendering
 * visually (at least one "N/D" or "?/D" pattern).
 */
export function hasFractionNotation(text: string): boolean {
  return /(\?|\d+)\/(\d+)/.test(text);
}

interface MathQuestionDisplayProps {
  /** The raw question text from the math engine */
  questionText: string;
  /** Whether the question is long (triggers smaller font) */
  isLong?: boolean;
}

/**
 * Renders a math question with proper fraction visualization.
 *
 * Fraction notation like "3/5" is rendered as stacked numerator/denominator
 * with a horizontal bar. All other text (operators, words) renders inline.
 *
 * For questions without fractions, falls through to plain text rendering
 * (caller should check `hasFractionNotation` first).
 */
export function MathQuestionDisplay({
  questionText,
  isLong = false,
}: MathQuestionDisplayProps) {
  const { colors } = useTheme();
  const fontSize = isLong ? typography.fontSize.xxl : typography.fontSize.display;

  // Split on newlines to render each line as a separate row
  const lines = questionText.split('\n');

  return (
    <View style={styles.outerContainer}>
      {lines.map((line, lineIdx) => {
        const segments = parseQuestionText(line);
        return (
          <View key={lineIdx} style={styles.container}>
            {segments.map((segment, i) => {
              if (segment.type === 'text') {
                return (
                  <Text
                    key={i}
                    style={[
                      styles.text,
                      {
                        fontSize: lineIdx > 0 ? typography.fontSize.lg : fontSize,
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {segment.value}
                  </Text>
                );
              }

              return (
                <FractionText
                  key={i}
                  numerator={segment.numerator}
                  denominator={segment.denominator}
                  fontSize={lineIdx > 0 ? typography.fontSize.lg : fontSize}
                  color={colors.textPrimary}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
});
