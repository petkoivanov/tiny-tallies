/**
 * SessionBarChart — SVG bar chart showing score percentage for recent sessions.
 *
 * Renders up to 10 most recent sessions as vertical bars with date labels.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { SessionHistoryEntry } from '@/store/slices/sessionHistorySlice';

interface SessionBarChartProps {
  sessions: SessionHistoryEntry[];
}

const CHART_WIDTH = 280;
const CHART_HEIGHT = 120;
const BAR_MAX_WIDTH = 22;
const BAR_GAP = 4;
const LABEL_HEIGHT = 18;

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function SessionBarChart({ sessions }: SessionBarChartProps) {
  const { colors } = useTheme();

  const recent = useMemo(
    () => [...sessions].slice(0, 10).reverse(),
    [sessions],
  );

  const barWidth = useMemo(() => {
    if (recent.length === 0) return BAR_MAX_WIDTH;
    const available = CHART_WIDTH / recent.length - BAR_GAP;
    return Math.min(available, BAR_MAX_WIDTH);
  }, [recent.length]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.surface,
          borderRadius: layout.borderRadius.lg,
          padding: spacing.lg,
          gap: spacing.sm,
        },
        title: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.lg,
          color: colors.textPrimary,
        },
        chartContainer: {
          alignItems: 'center',
        },
        labelsRow: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: CHART_WIDTH,
        },
        dateLabel: {
          fontFamily: typography.fontFamily.regular,
          fontSize: 9,
          color: colors.textMuted,
          textAlign: 'center',
          width: barWidth + BAR_GAP,
        },
        emptyText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.md,
          color: colors.textMuted,
          textAlign: 'center',
          paddingVertical: spacing.lg,
        },
      }),
    [colors, barWidth],
  );

  if (recent.length === 0) {
    return (
      <View style={styles.container} testID="session-bar-chart">
        <Text style={styles.title}>Recent Sessions</Text>
        <Text style={styles.emptyText}>
          No sessions completed yet. Start practicing!
        </Text>
      </View>
    );
  }

  const totalWidth =
    recent.length * (barWidth + BAR_GAP) - BAR_GAP;

  return (
    <View style={styles.container} testID="session-bar-chart">
      <Text style={styles.title}>Recent Sessions</Text>
      <View style={styles.chartContainer}>
        <Svg
          width={totalWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${totalWidth} ${CHART_HEIGHT}`}
        >
          {/* 50% guide line */}
          <Line
            x1={0}
            y1={CHART_HEIGHT / 2}
            x2={totalWidth}
            y2={CHART_HEIGHT / 2}
            stroke={colors.backgroundLight}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          {recent.map((session, i) => {
            const pct = session.total > 0 ? session.score / session.total : 0;
            const barHeight = Math.max(pct * CHART_HEIGHT, 2);
            const x = i * (barWidth + BAR_GAP);
            const y = CHART_HEIGHT - barHeight;
            const barColor = pct >= 0.85 ? colors.correct : colors.primary;

            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={3}
                fill={barColor}
              />
            );
          })}
        </Svg>
        <View
          style={[styles.labelsRow, { width: totalWidth }]}
        >
          {recent.map((session, i) => (
            <Text key={i} style={styles.dateLabel}>
              {formatShortDate(session.completedAt)}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
