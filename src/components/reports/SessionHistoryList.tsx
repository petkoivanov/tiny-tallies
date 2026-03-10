/**
 * SessionHistoryList — expandable list of recent session summaries.
 *
 * Shows each session with date, score, duration, and mode badge.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Clock, Target } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { SessionHistoryEntry } from '@/store/slices/sessionHistorySlice';
import { getSkillById } from '@/services/mathEngine/skills';

interface SessionHistoryListProps {
  sessions: SessionHistoryEntry[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
}

const MODE_LABELS: Record<string, string> = {
  standard: 'Practice',
  remediation: 'Review',
  challenge: 'Challenge',
};

export function SessionHistoryList({ sessions }: SessionHistoryListProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        list: {
          gap: spacing.sm,
        },
        sessionCard: {
          backgroundColor: colors.backgroundLight,
          borderRadius: layout.borderRadius.md,
          padding: spacing.md,
          gap: spacing.xs,
        },
        topRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        dateText: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.sm,
          color: colors.textPrimary,
        },
        modeBadge: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.xs,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
          borderRadius: layout.borderRadius.sm,
          overflow: 'hidden',
          backgroundColor: colors.primaryLight + '30',
          color: colors.primary,
        },
        statsRow: {
          flexDirection: 'row',
          gap: spacing.lg,
          alignItems: 'center',
        },
        statItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        },
        statText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        },
        scoreCorrect: {
          color: colors.correct,
          fontFamily: typography.fontFamily.semiBold,
        },
        skillsText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.xs,
          color: colors.textMuted,
        },
        emptyText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.md,
          color: colors.textMuted,
          textAlign: 'center',
          paddingVertical: spacing.md,
        },
      }),
    [colors],
  );

  if (sessions.length === 0) {
    return (
      <Text style={styles.emptyText}>
        No sessions completed yet.
      </Text>
    );
  }

  return (
    <View style={styles.list} testID="session-history-list">
      {sessions.slice(0, 20).map((session, i) => {
        const pct =
          session.total > 0
            ? Math.round((session.score / session.total) * 100)
            : 0;
        const skillNames = session.skillIds
          .slice(0, 3)
          .map((id) => getSkillById(id)?.name ?? id)
          .join(', ');
        const extra = session.skillIds.length > 3
          ? ` +${session.skillIds.length - 3} more`
          : '';

        return (
          <View key={i} style={styles.sessionCard} testID="session-history-item">
            <View style={styles.topRow}>
              <Text style={styles.dateText}>
                {formatDate(session.completedAt)} at{' '}
                {formatTime(session.completedAt)}
              </Text>
              <Text style={styles.modeBadge}>
                {MODE_LABELS[session.mode] ?? session.mode}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Target size={14} color={colors.textSecondary} />
                <Text style={styles.statText}>
                  <Text style={pct >= 85 ? styles.scoreCorrect : undefined}>
                    {session.score}/{session.total}
                  </Text>
                  {' '}({pct}%)
                </Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={styles.statText}>
                  {formatDuration(session.durationMs)}
                </Text>
              </View>
            </View>
            {skillNames && (
              <Text style={styles.skillsText} numberOfLines={1}>
                {skillNames}{extra}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
