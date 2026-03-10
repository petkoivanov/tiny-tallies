/**
 * DotPlot — SVG dot plot (line plot) with stacked dots above a number line.
 *
 * Renders a horizontal number line with tick marks at regular intervals.
 * Data points are shown as filled circles stacked vertically above
 * their corresponding values. Used for grades 4-6.
 */
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '@/theme';
import type { DotPlotData } from './types';

interface DotPlotProps {
  data: DotPlotData;
  width?: number;
  height?: number;
  testID?: string;
}

const PADDING = { left: 16, right: 16, top: 28, bottom: 24 };
const DOT_RADIUS = 6;
const DOT_GAP = 2;

export function DotPlot({
  data,
  width = 280,
  height = 160,
  testID = 'dot-plot',
}: DotPlotProps) {
  const { colors } = useTheme();

  const chartW = width - PADDING.left - PADDING.right;
  const axisY = height - PADDING.bottom;

  // Count occurrences per value
  const counts = useMemo(() => {
    const map = new Map<number, number>();
    for (const v of data.values) {
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return map;
  }, [data.values]);

  // Generate tick positions
  const ticks = useMemo(() => {
    const result: number[] = [];
    for (let v = data.min; v <= data.max; v += data.step) {
      result.push(Math.round(v * 1000) / 1000);
    }
    return result;
  }, [data.min, data.max, data.step]);

  const range = data.max - data.min || 1;

  function valueToX(value: number): number {
    return PADDING.left + ((value - data.min) / range) * chartW;
  }

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={data.title ?? 'Dot plot'}
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

        {/* Number line */}
        <Line
          x1={PADDING.left}
          y1={axisY}
          x2={width - PADDING.right}
          y2={axisY}
          stroke={colors.textSecondary}
          strokeWidth={1.5}
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
                y2={axisY + 6}
                stroke={colors.textSecondary}
                strokeWidth={1.5}
              />
              <SvgText
                x={x}
                y={axisY + 18}
                textAnchor="middle"
                fontSize={10}
                fill={colors.textPrimary}
              >
                {Number.isInteger(v) ? v : v.toString()}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Dots stacked above values */}
        {ticks.map((v) => {
          const count = counts.get(v) ?? 0;
          const x = valueToX(v);
          return Array.from({ length: count }).map((_, i) => (
            <Circle
              key={`${v}-${i}`}
              cx={x}
              cy={axisY - DOT_RADIUS - i * (DOT_RADIUS * 2 + DOT_GAP) - 4}
              r={DOT_RADIUS}
              fill={colors.primary}
            />
          ));
        })}

        {/* X-axis label */}
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
