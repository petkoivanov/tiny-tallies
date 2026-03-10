/**
 * Static SVG coin display for money problems.
 *
 * Renders stylized US coins (penny, nickel, dime, quarter) with:
 * - Distinct copper/silver coloring
 * - Realistic relative sizes (quarter > nickel > penny > dime)
 * - Value labels inside each coin
 * - Inner circle detail for coin feel
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/theme';

interface CoinSpec {
  readonly fill: string;
  readonly stroke: string;
  readonly label: string;
  /** Relative radius factor (quarter = 1.0) */
  readonly sizeFactor: number;
}

const COIN_SPECS: Record<string, CoinSpec> = {
  penny: {
    fill: '#B87333',
    stroke: '#8B5A2B',
    label: '1¢',
    sizeFactor: 0.72,
  },
  nickel: {
    fill: '#A8A9AD',
    stroke: '#808080',
    label: '5¢',
    sizeFactor: 0.80,
  },
  dime: {
    fill: '#C0C0C0',
    stroke: '#909090',
    label: '10¢',
    sizeFactor: 0.64,
  },
  quarter: {
    fill: '#D4D4D8',
    stroke: '#A1A1AA',
    label: '25¢',
    sizeFactor: 1.0,
  },
};

const BASE_RADIUS = 24;
const COIN_GAP = 8;
const PADDING = 4;

interface CoinEntry {
  readonly coin: string;
  readonly count: number;
}

interface CoinDisplayProps {
  coinSet: readonly CoinEntry[];
  testID?: string;
}

/** Skills that should show inline coin visuals */
const COIN_VISUAL_SKILLS = new Set([
  'money.coin-id',
  'money.count.same-type',
  'money.count.mixed',
]);

export function shouldShowCoins(skillId: string): boolean {
  return COIN_VISUAL_SKILLS.has(skillId);
}

export function CoinDisplay({ coinSet, testID = 'coin-display' }: CoinDisplayProps) {
  const { colors } = useTheme();

  // Flatten coinSet into individual coins for rendering
  const coins: { spec: CoinSpec; name: string }[] = [];
  for (const entry of coinSet) {
    const spec = COIN_SPECS[entry.coin];
    if (!spec) continue;
    for (let i = 0; i < entry.count; i++) {
      coins.push({ spec, name: entry.coin });
    }
  }

  if (coins.length === 0) return null;

  // Layout: single row with slight vertical offset for variety
  const positions: { cx: number; cy: number; r: number; spec: CoinSpec; key: string }[] = [];
  let x = PADDING + BASE_RADIUS;

  for (let i = 0; i < coins.length; i++) {
    const { spec, name } = coins[i];
    const r = BASE_RADIUS * spec.sizeFactor;
    // Slight vertical jitter for natural feel (alternating ±3px)
    const yOffset = i % 2 === 0 ? -3 : 3;
    positions.push({
      cx: x,
      cy: BASE_RADIUS + PADDING + yOffset,
      r,
      spec,
      key: `${name}-${i}`,
    });
    x += r * 2 + COIN_GAP;
  }

  const svgWidth = x - COIN_GAP + PADDING;
  const svgHeight = (BASE_RADIUS + PADDING) * 2 + 6; // extra for jitter

  const accessLabel = coinSet
    .map((e) => `${e.count} ${e.count === 1 ? e.coin : e.coin + 's'}`)
    .join(', ');

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={accessLabel}
    >
      <Svg width={svgWidth} height={svgHeight}>
        {positions.map(({ cx, cy, r, spec, key }) => (
          <React.Fragment key={key}>
            {/* Outer coin */}
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              fill={spec.fill}
              stroke={spec.stroke}
              strokeWidth={1.5}
            />
            {/* Inner ring for coin detail */}
            <Circle
              cx={cx}
              cy={cy}
              r={r * 0.78}
              fill="none"
              stroke={spec.stroke}
              strokeWidth={0.8}
              opacity={0.5}
            />
            {/* Value label */}
            <SvgText
              x={cx}
              y={cy}
              textAnchor="middle"
              alignmentBaseline="central"
              fontSize={r * 0.65}
              fontWeight="700"
              fill={colors.textPrimary}
            >
              {spec.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
