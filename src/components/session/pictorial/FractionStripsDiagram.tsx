/**
 * Static SVG pictorial diagram for fraction strips manipulative.
 *
 * Renders a bar divided into sections based on operand values.
 * Since fraction skills are not yet in the app, this is a fallback
 * showing the operands as proportional strip sections.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';

import { colors } from '@/theme';
import type { Problem } from '@/services/mathEngine/types';

const STRIP_WIDTH = 220;
const STRIP_HEIGHT = 24;
const PADDING = 16;
const COLOR_A = colors.primary;
const COLOR_B = '#FACC15';

interface FractionStripsDiagramProps {
  problem: Problem;
}

export function FractionStripsDiagram({ problem }: FractionStripsDiagramProps) {
  const [a, b] = problem.operands;
  const total = a + b;
  const scale = total > 0 ? STRIP_WIDTH / total : 1;
  const widthA = a * scale;
  const widthB = b * scale;

  const svgWidth = STRIP_WIDTH + PADDING * 2;
  const svgHeight = STRIP_HEIGHT + PADDING * 2 + 14;

  return (
    <View style={styles.container} testID="pictorial-diagram-fraction_strips">
      <Svg width={svgWidth} height={svgHeight}>
        {/* Background strip outline */}
        <Rect
          x={PADDING}
          y={PADDING}
          width={STRIP_WIDTH}
          height={STRIP_HEIGHT}
          rx={4}
          fill="none"
          stroke={colors.textSecondary}
          strokeWidth={1}
        />

        {/* Section A */}
        <Rect
          x={PADDING}
          y={PADDING}
          width={widthA}
          height={STRIP_HEIGHT}
          rx={4}
          fill={COLOR_A}
        />
        <SvgText
          x={PADDING + widthA / 2}
          y={PADDING + STRIP_HEIGHT / 2 + 5}
          fill={colors.textPrimary}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
        >
          {String(a)}
        </SvgText>

        {/* Section B */}
        <Rect
          x={PADDING + widthA}
          y={PADDING}
          width={widthB}
          height={STRIP_HEIGHT}
          rx={4}
          fill={COLOR_B}
        />
        <SvgText
          x={PADDING + widthA + widthB / 2}
          y={PADDING + STRIP_HEIGHT / 2 + 5}
          fill={colors.background}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
        >
          {String(b)}
        </SvgText>

        {/* Divider */}
        <Line
          x1={PADDING + widthA}
          y1={PADDING}
          x2={PADDING + widthA}
          y2={PADDING + STRIP_HEIGHT}
          stroke={colors.textSecondary}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
