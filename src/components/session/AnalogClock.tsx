/**
 * Static SVG analog clock for time problems.
 *
 * Renders a clock face with hour and minute hands.
 * Clock face complexity scales with skill level:
 * - full: all 12 numbers + minute ticks (read.hours, read.half-hours)
 * - quarters: 12/3/6/9 + hour ticks (read.quarter-hours, read.five-minutes)
 * - minimal: 12 only + hour ticks (read.one-minute, elapsed, am-pm)
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Line,
  Text as SvgText,
  G,
} from 'react-native-svg';

import { useTheme } from '@/theme';

export type ClockFaceDetail = 'full' | 'quarters' | 'minimal';

interface AnalogClockProps {
  hours: number;
  minutes: number;
  detail?: ClockFaceDetail;
  size?: number;
  testID?: string;
}

/** Map skill IDs to clock face detail level */
export function clockDetailForSkill(skillId: string): ClockFaceDetail {
  switch (skillId) {
    case 'time.read.hours':
    case 'time.read.half-hours':
      return 'full';
    case 'time.read.quarter-hours':
    case 'time.read.five-minutes':
      return 'quarters';
    default:
      return 'minimal';
  }
}

// Clock geometry helpers
function degreesToRadians(deg: number): number {
  return ((deg - 90) * Math.PI) / 180;
}

function polarToXY(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = degreesToRadians(angleDeg);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function hourHandAngle(hours: number, minutes: number): number {
  return (hours % 12) * 30 + minutes * 0.5;
}

function minuteHandAngle(minutes: number): number {
  return minutes * 6;
}

const QUARTER_NUMBERS = new Set([12, 3, 6, 9]);

export function AnalogClock({
  hours,
  minutes,
  detail = 'full',
  size = 200,
  testID = 'analog-clock',
}: AnalogClockProps) {
  const { colors } = useTheme();

  const center = size / 2;
  const outerRadius = size / 2 - 4;
  const faceRadius = outerRadius - 2;
  const numberRadius = faceRadius - 20;
  const tickOuterRadius = faceRadius - 4;
  const tickInnerMajor = tickOuterRadius - 12;
  const tickInnerMinor = tickOuterRadius - 6;
  const hourHandLength = faceRadius * 0.5;
  const minuteHandLength = faceRadius * 0.72;

  const hourAngle = hourHandAngle(hours, minutes);
  const minAngle = minuteHandAngle(minutes);

  const hourEnd = polarToXY(center, center, hourHandLength, hourAngle);
  const minEnd = polarToXY(center, center, minuteHandLength, minAngle);

  // Build tick marks
  const ticks: React.ReactNode[] = [];
  for (let i = 0; i < 60; i++) {
    const angle = i * 6;
    const isMajor = i % 5 === 0;

    if (detail === 'minimal' && !isMajor) continue;
    if (detail === 'quarters' && !isMajor) continue;

    const outer = polarToXY(center, center, tickOuterRadius, angle);
    const inner = polarToXY(
      center,
      center,
      isMajor ? tickInnerMajor : tickInnerMinor,
      angle,
    );

    ticks.push(
      <Line
        key={`tick-${i}`}
        x1={outer.x}
        y1={outer.y}
        x2={inner.x}
        y2={inner.y}
        stroke={colors.textSecondary}
        strokeWidth={isMajor ? 2 : 1}
        strokeLinecap="round"
      />,
    );
  }

  // Build numbers
  const numbers: React.ReactNode[] = [];
  for (let n = 1; n <= 12; n++) {
    if (detail === 'minimal' && n !== 12) continue;
    if (detail === 'quarters' && !QUARTER_NUMBERS.has(n)) continue;

    const angle = n * 30;
    const pos = polarToXY(center, center, numberRadius, angle);

    numbers.push(
      <SvgText
        key={`num-${n}`}
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        alignmentBaseline="central"
        fontSize={size * 0.09}
        fontWeight="600"
        fill={colors.textPrimary}
      >
        {n}
      </SvgText>,
    );
  }

  const accessLabel = `Analog clock showing ${hours}:${String(minutes).padStart(2, '0')}`;

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={accessLabel}
    >
      <Svg width={size} height={size}>
        {/* Outer ring */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill={colors.surface}
          stroke={colors.textSecondary}
          strokeWidth={2}
        />

        {/* Tick marks */}
        {ticks}

        {/* Numbers */}
        {numbers}

        {/* Hour hand — thicker, shorter */}
        <G>
          <Line
            x1={center}
            y1={center}
            x2={hourEnd.x}
            y2={hourEnd.y}
            stroke={colors.textPrimary}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </G>

        {/* Minute hand — thinner, longer */}
        <G>
          <Line
            x1={center}
            y1={center}
            x2={minEnd.x}
            y2={minEnd.y}
            stroke={colors.primary}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </G>

        {/* Center dot */}
        <Circle cx={center} cy={center} r={4} fill={colors.textPrimary} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
