/**
 * TallyChart — SVG tally marks grouped by 5 per category.
 *
 * Renders a table-like layout with category labels on the left,
 * tally marks in the middle (groups of 5 with diagonal strike),
 * and numeric totals on the right. Designed for grades 1-3.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Line,
  Text as SvgText,
  Rect,
} from 'react-native-svg';
import { useTheme } from '@/theme';
import type { TallyChartData } from './types';

interface TallyChartProps {
  data: TallyChartData;
  width?: number;
  testID?: string;
}

const LABEL_COL = 60;
const TOTAL_COL = 32;
const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 24;
const TITLE_HEIGHT = 24;
const TALLY_GROUP_WIDTH = 28;
const TALLY_MARK_GAP = 5;

function TallyGroup({
  count,
  x,
  y,
  color,
}: {
  count: number;
  x: number;
  y: number;
  color: string;
}) {
  const marks: React.ReactNode[] = [];
  const full = count >= 5;
  const sticks = full ? 4 : count;

  for (let i = 0; i < sticks; i++) {
    const mx = x + i * TALLY_MARK_GAP;
    marks.push(
      <Line
        key={`s-${i}`}
        x1={mx}
        y1={y - 8}
        x2={mx}
        y2={y + 8}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />,
    );
  }

  // Diagonal strike-through for group of 5
  if (full) {
    marks.push(
      <Line
        key="strike"
        x1={x - 2}
        y1={y + 6}
        x2={x + 3 * TALLY_MARK_GAP + 2}
        y2={y - 6}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />,
    );
  }

  return <>{marks}</>;
}

export function TallyChart({
  data,
  width = 280,
  testID = 'tally-chart',
}: TallyChartProps) {
  const { colors } = useTheme();

  const hasTitle = !!data.title;
  const topOffset = hasTitle ? TITLE_HEIGHT : 0;
  const tallyCol = width - LABEL_COL - TOTAL_COL;
  const svgHeight =
    topOffset + HEADER_HEIGHT + data.categories.length * ROW_HEIGHT;

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={data.title ?? 'Tally chart'}
    >
      <Svg width={width} height={svgHeight}>
        {/* Title */}
        {hasTitle && (
          <SvgText
            x={width / 2}
            y={16}
            textAnchor="middle"
            fontSize={13}
            fontWeight="600"
            fill={colors.textPrimary}
          >
            {data.title}
          </SvgText>
        )}

        {/* Header row */}
        <Rect
          x={0}
          y={topOffset}
          width={width}
          height={HEADER_HEIGHT}
          fill={colors.backgroundLight}
          opacity={0.5}
        />
        <SvgText
          x={LABEL_COL / 2}
          y={topOffset + HEADER_HEIGHT / 2 + 1}
          textAnchor="middle"
          alignmentBaseline="central"
          fontSize={11}
          fontWeight="600"
          fill={colors.textPrimary}
        >
          Item
        </SvgText>
        <SvgText
          x={LABEL_COL + tallyCol / 2}
          y={topOffset + HEADER_HEIGHT / 2 + 1}
          textAnchor="middle"
          alignmentBaseline="central"
          fontSize={11}
          fontWeight="600"
          fill={colors.textPrimary}
        >
          Tally
        </SvgText>
        <SvgText
          x={width - TOTAL_COL / 2}
          y={topOffset + HEADER_HEIGHT / 2 + 1}
          textAnchor="middle"
          alignmentBaseline="central"
          fontSize={11}
          fontWeight="600"
          fill={colors.textPrimary}
        >
          Total
        </SvgText>

        {/* Rows */}
        {data.categories.map((cat, i) => {
          const rowY = topOffset + HEADER_HEIGHT + i * ROW_HEIGHT;
          const centerY = rowY + ROW_HEIGHT / 2;
          const groups = Math.floor(cat.value / 5);
          const remainder = cat.value % 5;

          return (
            <React.Fragment key={cat.label}>
              {/* Alternating row bg */}
              {i % 2 === 0 && (
                <Rect
                  x={0}
                  y={rowY}
                  width={width}
                  height={ROW_HEIGHT}
                  fill={colors.backgroundLight}
                  opacity={0.15}
                />
              )}

              {/* Row separator */}
              <Line
                x1={0}
                y1={rowY}
                x2={width}
                y2={rowY}
                stroke={colors.backgroundLight}
                strokeWidth={1}
              />

              {/* Category label */}
              <SvgText
                x={LABEL_COL / 2}
                y={centerY + 1}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize={12}
                fill={colors.textPrimary}
              >
                {cat.label}
              </SvgText>

              {/* Tally marks */}
              {Array.from({ length: groups }).map((_, g) => (
                <TallyGroup
                  key={`g-${g}`}
                  count={5}
                  x={LABEL_COL + 8 + g * TALLY_GROUP_WIDTH}
                  y={centerY}
                  color={colors.primary}
                />
              ))}
              {remainder > 0 && (
                <TallyGroup
                  count={remainder}
                  x={LABEL_COL + 8 + groups * TALLY_GROUP_WIDTH}
                  y={centerY}
                  color={colors.primary}
                />
              )}

              {/* Numeric total */}
              <SvgText
                x={width - TOTAL_COL / 2}
                y={centerY + 1}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize={12}
                fontWeight="600"
                fill={colors.textPrimary}
              >
                {cat.value}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Bottom border */}
        <Line
          x1={0}
          y1={svgHeight}
          x2={width}
          y2={svgHeight}
          stroke={colors.backgroundLight}
          strokeWidth={1}
        />

        {/* Column separators */}
        <Line
          x1={LABEL_COL}
          y1={topOffset}
          x2={LABEL_COL}
          y2={svgHeight}
          stroke={colors.backgroundLight}
          strokeWidth={1}
        />
        <Line
          x1={width - TOTAL_COL}
          y1={topOffset}
          x2={width - TOTAL_COL}
          y2={svgHeight}
          stroke={colors.backgroundLight}
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
