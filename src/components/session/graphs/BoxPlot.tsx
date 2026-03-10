/**
 * BoxPlot — SVG box-and-whisker plot.
 *
 * Renders a horizontal box plot showing min, Q1, median, Q3, max
 * with a number line beneath. Used for grades 6-7 data analysis.
 */
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Line,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '@/theme';
import type { BoxPlotData } from './types';

interface BoxPlotProps {
  data: BoxPlotData;
  width?: number;
  height?: number;
  testID?: string;
}

const PADDING = { left: 20, right: 20, top: 28, bottom: 28 };
const BOX_HEIGHT = 40;

function niceStep(range: number): number {
  if (range <= 10) return 1;
  if (range <= 20) return 2;
  if (range <= 50) return 5;
  if (range <= 100) return 10;
  return Math.ceil(range / 10);
}

export function BoxPlot({
  data,
  width = 280,
  height = 120,
  testID = 'box-plot',
}: BoxPlotProps) {
  const { colors } = useTheme();

  const chartW = width - PADDING.left - PADDING.right;
  const boxY = PADDING.top;
  const axisY = boxY + BOX_HEIGHT + 12;

  // Extend range slightly beyond min/max for padding
  const dataRange = data.max - data.min || 1;
  const pad = dataRange * 0.05;
  const scaleMin = data.min - pad;
  const scaleMax = data.max + pad;
  const scaleRange = scaleMax - scaleMin;

  function valueToX(v: number): number {
    return PADDING.left + ((v - scaleMin) / scaleRange) * chartW;
  }

  const step = niceStep(dataRange);
  const ticks = useMemo(() => {
    const result: number[] = [];
    const start = Math.ceil(data.min / step) * step;
    for (let v = start; v <= data.max; v += step) {
      result.push(v);
    }
    return result;
  }, [data.min, data.max, step]);

  const xMin = valueToX(data.min);
  const xQ1 = valueToX(data.q1);
  const xMed = valueToX(data.median);
  const xQ3 = valueToX(data.q3);
  const xMax = valueToX(data.max);

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={data.title ?? 'Box plot'}
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

        {/* Left whisker */}
        <Line
          x1={xMin}
          y1={boxY + BOX_HEIGHT / 2}
          x2={xQ1}
          y2={boxY + BOX_HEIGHT / 2}
          stroke={colors.textPrimary}
          strokeWidth={2}
        />
        {/* Left whisker cap */}
        <Line
          x1={xMin}
          y1={boxY + BOX_HEIGHT * 0.25}
          x2={xMin}
          y2={boxY + BOX_HEIGHT * 0.75}
          stroke={colors.textPrimary}
          strokeWidth={2}
        />

        {/* Box (Q1 to Q3) */}
        <Rect
          x={xQ1}
          y={boxY}
          width={xQ3 - xQ1}
          height={BOX_HEIGHT}
          fill={colors.primary}
          opacity={0.3}
          stroke={colors.primary}
          strokeWidth={2}
          rx={2}
        />

        {/* Median line */}
        <Line
          x1={xMed}
          y1={boxY}
          x2={xMed}
          y2={boxY + BOX_HEIGHT}
          stroke={colors.textPrimary}
          strokeWidth={3}
        />

        {/* Right whisker */}
        <Line
          x1={xQ3}
          y1={boxY + BOX_HEIGHT / 2}
          x2={xMax}
          y2={boxY + BOX_HEIGHT / 2}
          stroke={colors.textPrimary}
          strokeWidth={2}
        />
        {/* Right whisker cap */}
        <Line
          x1={xMax}
          y1={boxY + BOX_HEIGHT * 0.25}
          x2={xMax}
          y2={boxY + BOX_HEIGHT * 0.75}
          stroke={colors.textPrimary}
          strokeWidth={2}
        />

        {/* Number line */}
        <Line
          x1={PADDING.left}
          y1={axisY}
          x2={width - PADDING.right}
          y2={axisY}
          stroke={colors.textSecondary}
          strokeWidth={1}
        />

        {/* Tick marks and labels */}
        {ticks.map((v) => {
          const x = valueToX(v);
          return (
            <React.Fragment key={v}>
              <Line
                x1={x}
                y1={axisY}
                x2={x}
                y2={axisY + 5}
                stroke={colors.textSecondary}
                strokeWidth={1}
              />
              <SvgText
                x={x}
                y={axisY + 16}
                textAnchor="middle"
                fontSize={10}
                fill={colors.textPrimary}
              >
                {v}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Label */}
        {data.label && (
          <SvgText
            x={width / 2}
            y={height - 2}
            textAnchor="middle"
            fontSize={10}
            fill={colors.textMuted}
          >
            {data.label}
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
