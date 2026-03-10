/**
 * ScatterPlot — SVG scatter plot with optional trend line.
 *
 * Renders x-y coordinate points as filled circles with labeled axes.
 * Optionally shows a linear trend line (y = slope*x + intercept).
 * Used for grade 8 data analysis.
 */
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '@/theme';
import type { ScatterPlotData } from './types';

interface ScatterPlotProps {
  data: ScatterPlotData;
  width?: number;
  height?: number;
  testID?: string;
}

const PADDING = { top: 28, right: 16, bottom: 36, left: 40 };
const DOT_RADIUS = 5;

function niceAxis(values: number[]): {
  min: number;
  max: number;
  step: number;
} {
  if (values.length === 0) return { min: 0, max: 10, step: 2 };
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const range = hi - lo || 1;
  const pad = range * 0.1;
  const min = Math.max(0, Math.floor(lo - pad));
  const rawMax = Math.ceil(hi + pad);
  let step: number;
  if (rawMax <= 10) step = 1;
  else if (rawMax <= 20) step = 2;
  else if (rawMax <= 50) step = 5;
  else if (rawMax <= 100) step = 10;
  else step = Math.ceil(rawMax / 10);
  const max = Math.ceil(rawMax / step) * step;
  return { min, max, step };
}

export function ScatterPlot({
  data,
  width = 280,
  height = 200,
  testID = 'scatter-plot',
}: ScatterPlotProps) {
  const { colors } = useTheme();

  const chartW = width - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  const xAxis = useMemo(
    () => niceAxis(data.points.map((p) => p.x)),
    [data.points],
  );
  const yAxis = useMemo(
    () => niceAxis(data.points.map((p) => p.y)),
    [data.points],
  );

  function toSvgX(v: number): number {
    return (
      PADDING.left + ((v - xAxis.min) / (xAxis.max - xAxis.min || 1)) * chartW
    );
  }
  function toSvgY(v: number): number {
    return (
      PADDING.top + chartH - ((v - yAxis.min) / (yAxis.max - yAxis.min || 1)) * chartH
    );
  }

  const xTicks = useMemo(() => {
    const t: number[] = [];
    for (let v = xAxis.min; v <= xAxis.max; v += xAxis.step) t.push(v);
    return t;
  }, [xAxis]);

  const yTicks = useMemo(() => {
    const t: number[] = [];
    for (let v = yAxis.min; v <= yAxis.max; v += yAxis.step) t.push(v);
    return t;
  }, [yAxis]);

  // Trend line endpoints (clamp to chart area)
  const trendLineCoords = useMemo(() => {
    if (!data.trendLine) return null;
    const { slope, intercept } = data.trendLine;
    const x1 = xAxis.min;
    const x2 = xAxis.max;
    const y1 = slope * x1 + intercept;
    const y2 = slope * x2 + intercept;
    return {
      x1: toSvgX(x1),
      y1: toSvgY(y1),
      x2: toSvgX(x2),
      y2: toSvgY(y2),
    };
  }, [data.trendLine, xAxis]);

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={data.title ?? 'Scatter plot'}
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

        {/* Y-axis gridlines */}
        {yTicks.map((v) => {
          const y = toSvgY(v);
          return (
            <React.Fragment key={`yg-${v}`}>
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
                fontSize={9}
                fill={colors.textMuted}
              >
                {v}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X-axis gridlines */}
        {xTicks.map((v) => {
          const x = toSvgX(v);
          return (
            <React.Fragment key={`xg-${v}`}>
              <Line
                x1={x}
                y1={PADDING.top}
                x2={x}
                y2={PADDING.top + chartH}
                stroke={colors.backgroundLight}
                strokeWidth={1}
              />
              <SvgText
                x={x}
                y={PADDING.top + chartH + 14}
                textAnchor="middle"
                fontSize={9}
                fill={colors.textMuted}
              >
                {v}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Y-axis */}
        <Line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={PADDING.top + chartH}
          stroke={colors.textSecondary}
          strokeWidth={1.5}
        />
        {/* X-axis */}
        <Line
          x1={PADDING.left}
          y1={PADDING.top + chartH}
          x2={PADDING.left + chartW}
          y2={PADDING.top + chartH}
          stroke={colors.textSecondary}
          strokeWidth={1.5}
        />

        {/* Trend line */}
        {trendLineCoords && (
          <Line
            x1={trendLineCoords.x1}
            y1={trendLineCoords.y1}
            x2={trendLineCoords.x2}
            y2={trendLineCoords.y2}
            stroke={colors.incorrect}
            strokeWidth={2}
            strokeDasharray="6,3"
            opacity={0.7}
          />
        )}

        {/* Data points */}
        {data.points.map((p, i) => (
          <Circle
            key={i}
            cx={toSvgX(p.x)}
            cy={toSvgY(p.y)}
            r={DOT_RADIUS}
            fill={colors.primary}
          />
        ))}

        {/* Axis labels */}
        <SvgText
          x={PADDING.left + chartW / 2}
          y={height - 4}
          textAnchor="middle"
          fontSize={10}
          fill={colors.textMuted}
        >
          {data.xLabel}
        </SvgText>
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
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
