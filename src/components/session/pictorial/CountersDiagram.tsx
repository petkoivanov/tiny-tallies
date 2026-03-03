/**
 * Static SVG pictorial diagram for counters manipulative.
 *
 * Renders dot groups in rows of 5 to visualize problem operands.
 * Addition: first operand in primary color, second in yellow.
 * Subtraction: all dots in primary color, last `b` crossed out.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { colors } from '@/theme';
import type { Problem } from '@/services/mathEngine/types';

const DOT_RADIUS = 10;
const DOT_SPACING = 28;
const DOTS_PER_ROW = 5;
const PADDING = 12;
const COLOR_A = colors.primary;
const COLOR_B = '#FACC15';

interface CountersDiagramProps {
  problem: Problem;
}

export function CountersDiagram({ problem }: CountersDiagramProps) {
  const [a, b] = problem.operands;
  const isSubtraction = problem.operation === 'subtraction';
  const totalDots = isSubtraction ? a : a + b;
  const rows = Math.ceil(totalDots / DOTS_PER_ROW);
  const cols = Math.min(totalDots, DOTS_PER_ROW);
  const svgWidth = cols * DOT_SPACING + PADDING * 2;
  const svgHeight = rows * DOT_SPACING + PADDING * 2;

  const dots: React.ReactNode[] = [];
  for (let i = 0; i < totalDots; i++) {
    const row = Math.floor(i / DOTS_PER_ROW);
    const col = i % DOTS_PER_ROW;
    const cx = PADDING + col * DOT_SPACING + DOT_RADIUS;
    const cy = PADDING + row * DOT_SPACING + DOT_RADIUS;

    let fill: string;
    if (isSubtraction) {
      fill = COLOR_A;
    } else {
      fill = i < a ? COLOR_A : COLOR_B;
    }

    dots.push(
      <Circle key={`dot-${i}`} cx={cx} cy={cy} r={DOT_RADIUS} fill={fill} />,
    );

    // Cross out last `b` dots for subtraction
    if (isSubtraction && i >= a - b) {
      const offset = DOT_RADIUS * 0.7;
      dots.push(
        <Line
          key={`cross-${i}`}
          x1={cx - offset}
          y1={cy - offset}
          x2={cx + offset}
          y2={cy + offset}
          stroke={colors.incorrect}
          strokeWidth={2}
        />,
      );
    }
  }

  return (
    <View style={styles.container} testID="pictorial-diagram-counters">
      <Svg width={svgWidth} height={svgHeight}>
        {dots}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
