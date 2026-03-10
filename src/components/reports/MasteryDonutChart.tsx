/**
 * MasteryDonutChart — SVG donut chart showing mastered / in-progress / not-started
 * skill counts with centered total label.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, spacing, typography } from '@/theme';

interface MasteryDonutChartProps {
  mastered: number;
  inProgress: number;
  notStarted: number;
}

const SIZE = 140;
const STROKE_WIDTH = 16;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MasteryDonutChart({
  mastered,
  inProgress,
  notStarted,
}: MasteryDonutChartProps) {
  const { colors } = useTheme();
  const total = mastered + inProgress + notStarted;

  const segments = useMemo(() => {
    if (total === 0) return [];
    const masteredPct = mastered / total;
    const inProgressPct = inProgress / total;
    const notStartedPct = notStarted / total;

    let offset = 0;
    const result: Array<{
      color: string;
      dashArray: string;
      dashOffset: number;
    }> = [];

    if (masteredPct > 0) {
      result.push({
        color: colors.correct,
        dashArray: `${CIRCUMFERENCE * masteredPct} ${CIRCUMFERENCE * (1 - masteredPct)}`,
        dashOffset: -offset,
      });
      offset += CIRCUMFERENCE * masteredPct;
    }
    if (inProgressPct > 0) {
      result.push({
        color: colors.primary,
        dashArray: `${CIRCUMFERENCE * inProgressPct} ${CIRCUMFERENCE * (1 - inProgressPct)}`,
        dashOffset: -offset,
      });
      offset += CIRCUMFERENCE * inProgressPct;
    }
    if (notStartedPct > 0) {
      result.push({
        color: colors.backgroundLight,
        dashArray: `${CIRCUMFERENCE * notStartedPct} ${CIRCUMFERENCE * (1 - notStartedPct)}`,
        dashOffset: -offset,
      });
    }
    return result;
  }, [mastered, inProgress, notStarted, total, colors]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        centerLabel: {
          position: 'absolute',
          alignItems: 'center',
        },
        totalValue: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.xxl,
          color: colors.textPrimary,
        },
        totalLabel: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.xs,
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.container} testID="mastery-donut-chart">
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {segments.map((seg, i) => (
          <Circle
            key={i}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={seg.color}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={seg.dashArray}
            strokeDashoffset={seg.dashOffset}
            strokeLinecap="butt"
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        ))}
      </Svg>
      <View style={styles.centerLabel}>
        <Text style={styles.totalValue}>{mastered}</Text>
        <Text style={styles.totalLabel}>
          {mastered === 1 ? 'mastered' : 'mastered'}
        </Text>
      </View>
    </View>
  );
}
