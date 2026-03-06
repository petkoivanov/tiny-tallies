/**
 * Static SVG pictorial diagram for bar model manipulative.
 *
 * Addition: two bars side by side proportional to operands, total bar above with "?".
 * Subtraction: whole bar on top (a), part bar below (b), remaining shows "?".
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';

import { useTheme } from '@/theme';
import type { Problem } from '@/services/mathEngine/types';

const MAX_BAR_WIDTH = 220;
const BAR_HEIGHT = 22;
const ROW_GAP = 6;
const PADDING = 16;
const COLOR_B = '#FACC15';

interface BarModelDiagramProps {
  problem: Problem;
}

export function BarModelDiagram({ problem }: BarModelDiagramProps) {
  const { colors } = useTheme();
  const [a, b] = problem.operands;
  const isAddition = problem.operation === 'addition';
  const total = isAddition ? a + b : a;
  const scale = total > 0 ? MAX_BAR_WIDTH / total : 1;

  const widthA = a * scale;
  const widthB = b * scale;
  const totalWidth = total * scale;

  const svgWidth = totalWidth + PADDING * 2;
  const svgHeight = PADDING * 2 + BAR_HEIGHT * 2 + ROW_GAP + 18;

  if (isAddition) {
    // Top row: total bar with "?"
    const topY = PADDING;
    // Bottom row: a bar + b bar side by side
    const bottomY = topY + BAR_HEIGHT + ROW_GAP;

    return (
      <View style={styles.container} testID="pictorial-diagram-bar_model">
        <Svg width={svgWidth} height={svgHeight}>
          {/* Total bar (unknown) */}
          <Rect
            x={PADDING}
            y={topY}
            width={totalWidth}
            height={BAR_HEIGHT}
            rx={4}
            fill={colors.surface}
            stroke={colors.textSecondary}
            strokeWidth={1}
          />
          <SvgText
            x={PADDING + totalWidth / 2}
            y={topY + BAR_HEIGHT / 2 + 5}
            fill={colors.textPrimary}
            fontSize={13}
            fontWeight="bold"
            textAnchor="middle"
          >
            ?
          </SvgText>

          {/* Part A */}
          <Rect
            x={PADDING}
            y={bottomY}
            width={widthA}
            height={BAR_HEIGHT}
            rx={4}
            fill={colors.primary}
          />
          <SvgText
            x={PADDING + widthA / 2}
            y={bottomY + BAR_HEIGHT / 2 + 5}
            fill={colors.textPrimary}
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
          >
            {String(a)}
          </SvgText>

          {/* Part B */}
          <Rect
            x={PADDING + widthA}
            y={bottomY}
            width={widthB}
            height={BAR_HEIGHT}
            rx={4}
            fill={COLOR_B}
          />
          <SvgText
            x={PADDING + widthA + widthB / 2}
            y={bottomY + BAR_HEIGHT / 2 + 5}
            fill={colors.background}
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
          >
            {String(b)}
          </SvgText>

          {/* Divider line */}
          <Line
            x1={PADDING + widthA}
            y1={bottomY}
            x2={PADDING + widthA}
            y2={bottomY + BAR_HEIGHT}
            stroke={colors.textSecondary}
            strokeWidth={1}
          />
        </Svg>
      </View>
    );
  }

  // Subtraction layout
  const topY = PADDING;
  const bottomY = topY + BAR_HEIGHT + ROW_GAP;
  const remainderWidth = Math.max(0, (a - b) * scale);

  return (
    <View style={styles.container} testID="pictorial-diagram-bar_model">
      <Svg width={svgWidth} height={svgHeight}>
        {/* Whole bar (a) */}
        <Rect
          x={PADDING}
          y={topY}
          width={widthA}
          height={BAR_HEIGHT}
          rx={4}
          fill={colors.primary}
        />
        <SvgText
          x={PADDING + widthA / 2}
          y={topY + BAR_HEIGHT / 2 + 5}
          fill={colors.textPrimary}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
        >
          {String(a)}
        </SvgText>

        {/* Part bar (b) */}
        <Rect
          x={PADDING}
          y={bottomY}
          width={widthB}
          height={BAR_HEIGHT}
          rx={4}
          fill={COLOR_B}
        />
        <SvgText
          x={PADDING + widthB / 2}
          y={bottomY + BAR_HEIGHT / 2 + 5}
          fill={colors.background}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
        >
          {String(b)}
        </SvgText>

        {/* Remainder (unknown) */}
        <Rect
          x={PADDING + widthB}
          y={bottomY}
          width={remainderWidth}
          height={BAR_HEIGHT}
          rx={4}
          fill={colors.surface}
          stroke={colors.textSecondary}
          strokeWidth={1}
        />
        <SvgText
          x={PADDING + widthB + remainderWidth / 2}
          y={bottomY + BAR_HEIGHT / 2 + 5}
          fill={colors.textPrimary}
          fontSize={13}
          fontWeight="bold"
          textAnchor="middle"
        >
          ?
        </SvgText>

        {/* Divider line */}
        <Line
          x1={PADDING + widthB}
          y1={bottomY}
          x2={PADDING + widthB}
          y2={bottomY + BAR_HEIGHT}
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
