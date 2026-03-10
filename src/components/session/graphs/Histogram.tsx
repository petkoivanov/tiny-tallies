/**
 * Histogram — SVG histogram with contiguous bars for continuous data ranges.
 *
 * Unlike BarGraph, histogram bars are adjacent (no gaps) to represent
 * continuous data. Bin labels show ranges. Used for grade 6 data analysis.
 */
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Rect,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '@/theme';
import type { HistogramData } from './types';

interface HistogramProps {
  data: HistogramData;
  width?: number;
  height?: number;
  testID?: string;
}

const PADDING = { top: 28, right: 12, bottom: 36, left: 36 };

function niceMax(value: number): number {
  if (value <= 5) return 5;
  if (value <= 10) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(value)));
  const norm = value / mag;
  if (norm <= 2) return 2 * mag;
  if (norm <= 5) return 5 * mag;
  return 10 * mag;
}

function niceStep(max: number): number {
  if (max <= 5) return 1;
  if (max <= 10) return 2;
  if (max <= 20) return 5;
  return Math.ceil(max / 5);
}

export function Histogram({
  data,
  width = 280,
  height = 180,
  testID = 'histogram',
}: HistogramProps) {
  const { colors } = useTheme();
  const n = data.bins.length;

  const chartW = width - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  const maxCount = useMemo(
    () => niceMax(Math.max(...data.bins.map((b) => b.count), 1)),
    [data.bins],
  );
  const step = niceStep(maxCount);

  const barWidth = chartW / n;

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let v = 0; v <= maxCount; v += step) ticks.push(v);
    return ticks;
  }, [maxCount, step]);

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={data.title ?? 'Histogram'}
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
          const y = PADDING.top + chartH - (v / maxCount) * chartH;
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

        {/* Axes */}
        <Line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={PADDING.top + chartH}
          stroke={colors.textSecondary}
          strokeWidth={1.5}
        />
        <Line
          x1={PADDING.left}
          y1={PADDING.top + chartH}
          x2={PADDING.left + chartW}
          y2={PADDING.top + chartH}
          stroke={colors.textSecondary}
          strokeWidth={1.5}
        />

        {/* Bars — contiguous, no gaps */}
        {data.bins.map((bin, i) => {
          const barH = (bin.count / maxCount) * chartH;
          const x = PADDING.left + i * barWidth;
          const y = PADDING.top + chartH - barH;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                fill={colors.primary}
                opacity={0.7}
                stroke={colors.surface}
                strokeWidth={1}
              />
              <SvgText
                x={x + barWidth / 2}
                y={PADDING.top + chartH + 14}
                textAnchor="middle"
                fontSize={8}
                fill={colors.textPrimary}
              >
                {bin.range}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X-axis label */}
        {data.xLabel && (
          <SvgText
            x={PADDING.left + chartW / 2}
            y={height - 4}
            textAnchor="middle"
            fontSize={10}
            fill={colors.textMuted}
          >
            {data.xLabel}
          </SvgText>
        )}

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
