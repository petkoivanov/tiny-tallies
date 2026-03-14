/**
 * BarGraph — SVG vertical bar chart with labeled axes.
 *
 * Renders category labels on the x-axis, value ticks on the y-axis,
 * and vertical bars with rounded tops. Used for grades 2-4 bar graph
 * questions and reused internally for basic histogram rendering.
 */
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Rect,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '@/theme';
import type { BarGraphData } from './types';

interface BarGraphProps {
  data: BarGraphData;
  width?: number;
  height?: number;
  testID?: string;
}

const PADDING = { top: 28, right: 12, bottom: 32, left: 36 };
const BAR_COLORS = [
  '#5B9BD5', '#ED7D31', '#70AD47', '#FFC000',
  '#9B59B6', '#E74C3C', '#3498DB', '#2ECC71',
];

function niceMax(value: number): number {
  if (value <= 5) return 5;
  if (value <= 10) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function niceStep(max: number): number {
  if (max <= 5) return 1;
  if (max <= 10) return 2;
  if (max <= 20) return 5;
  if (max <= 50) return 10;
  return Math.ceil(max / 5);
}

export function BarGraph({
  data,
  width = 280,
  height = 180,
  testID = 'bar-graph',
}: BarGraphProps) {
  const { colors } = useTheme();
  const n = data.categories.length;

  const chartW = width - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  const maxVal = useMemo(
    () => niceMax(Math.max(...data.categories.map((c) => c.value), 1)),
    [data.categories],
  );
  const step = niceStep(maxVal);

  const barWidth = Math.min(chartW / n * 0.7, 36);
  const barGap = (chartW - barWidth * n) / (n + 1);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let v = 0; v <= maxVal; v += step) ticks.push(v);
    return ticks;
  }, [maxVal, step]);

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={data.title ?? 'Bar graph'}
    >
      <Svg width={width} height={height}>
        {/* Title */}
        {data.title && (
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

        {/* Y-axis gridlines and labels */}
        {yTicks.map((v) => {
          const y = PADDING.top + chartH - (v / maxVal) * chartH;
          return (
            <React.Fragment key={`y-${v}`}>
              <Line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + chartW}
                y2={y}
                stroke={colors.backgroundLight}
                strokeWidth={1}
              />
              <SvgText
                x={PADDING.left - 6}
                y={y + 1}
                textAnchor="end"
                alignmentBaseline="central"
                fontSize={10}
                fill={colors.textMuted}
              >
                {v}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Y-axis line */}
        <Line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={PADDING.top + chartH}
          stroke={colors.textSecondary}
          strokeWidth={1.5}
        />

        {/* X-axis line */}
        <Line
          x1={PADDING.left}
          y1={PADDING.top + chartH}
          x2={PADDING.left + chartW}
          y2={PADDING.top + chartH}
          stroke={colors.textSecondary}
          strokeWidth={1.5}
        />

        {/* Bars and x-labels */}
        {data.categories.map((cat, i) => {
          const barH = (cat.value / maxVal) * chartH;
          const x = PADDING.left + barGap + i * (barWidth + barGap);
          const y = PADDING.top + chartH - barH;
          const color = BAR_COLORS[i % BAR_COLORS.length];

          return (
            <React.Fragment key={cat.label}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={3}
                fill={color}
              />
              {/* Value label above bar */}
              <SvgText
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight="700"
                fill={colors.textPrimary}
              >
                {cat.value}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={PADDING.top + chartH + 14}
                textAnchor="middle"
                fontSize={10}
                fill={colors.textPrimary}
              >
                {cat.label}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Y-axis label */}
        {data.yLabel && (
          <SvgText
            x={10}
            y={PADDING.top + chartH / 2}
            textAnchor="middle"
            fontSize={10}
            fill={colors.textMuted}
            rotation={-90}
            originX={10}
            originY={PADDING.top + chartH / 2}
          >
            {data.yLabel}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
