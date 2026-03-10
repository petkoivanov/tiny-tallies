/**
 * AiSummaryCard — shows an AI-generated parent summary at the top of reports.
 *
 * Tapping "View Sessions" expands into the session history list.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { ParentSummaryInput } from '@/services/reports';
import { generateParentSummary } from '@/services/reports';
import type { SessionHistoryEntry } from '@/store/slices/sessionHistorySlice';
import { SessionHistoryList } from './SessionHistoryList';

interface AiSummaryCardProps {
  summaryInput: ParentSummaryInput;
  sessions: SessionHistoryEntry[];
}

export function AiSummaryCard({
  summaryInput,
  sessions,
}: AiSummaryCardProps) {
  const { colors } = useTheme();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current = new AbortController();
    setLoading(true);

    generateParentSummary(summaryInput, abortRef.current.signal)
      .then((text) => {
        setSummary(text);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      abortRef.current?.abort();
    };
  }, [summaryInput]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surface,
          borderRadius: layout.borderRadius.lg,
          padding: spacing.lg,
          gap: spacing.md,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        title: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.lg,
          color: colors.textPrimary,
          flex: 1,
        },
        summaryText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.md,
          color: colors.textSecondary,
          lineHeight: typography.fontSize.md * 1.5,
        },
        fallbackText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textMuted,
          fontStyle: 'italic',
        },
        expandButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
          paddingVertical: spacing.sm,
          minHeight: layout.minTouchTarget,
        },
        expandText: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.sm,
          color: colors.primary,
        },
        loadingContainer: {
          alignItems: 'center',
          paddingVertical: spacing.md,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.card} testID="ai-summary-card">
      <View style={styles.header}>
        <Sparkles size={20} color={colors.primary} />
        <Text style={styles.title}>Progress Summary</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : summary ? (
        <Text style={styles.summaryText}>{summary}</Text>
      ) : (
        <Text style={styles.fallbackText}>
          Summary unavailable. View session details below.
        </Text>
      )}

      {sessions.length > 0 && (
        <>
          <Pressable
            style={styles.expandButton}
            onPress={() => setExpanded(!expanded)}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Hide sessions' : 'View sessions'}
            testID="expand-sessions-button"
          >
            <Text style={styles.expandText}>
              {expanded
                ? 'Hide Sessions'
                : `View ${sessions.length} Session${sessions.length !== 1 ? 's' : ''}`}
            </Text>
            {expanded ? (
              <ChevronUp size={16} color={colors.primary} />
            ) : (
              <ChevronDown size={16} color={colors.primary} />
            )}
          </Pressable>

          {expanded && <SessionHistoryList sessions={sessions} />}
        </>
      )}
    </View>
  );
}
