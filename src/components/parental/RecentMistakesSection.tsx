/**
 * RecentMistakesSection — shows recent wrong answers for parent review.
 * Displays the last 10 mistakes from the past 30 days.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { WRONG_ANSWER_RETENTION_DAYS } from '@/store/slices/wrongAnswerHistorySlice';
import type { WrongAnswerRecord } from '@/store/slices/wrongAnswerHistorySlice';

const MAX_DISPLAY = 10;

interface Props {
  sectionStyle: object;
  sectionHeaderStyle: object;
  sectionTitleStyle: object;
  cardStyle: object;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function RecentMistakesSection({
  sectionStyle,
  sectionHeaderStyle,
  sectionTitleStyle,
  cardStyle,
}: Props) {
  const { colors } = useTheme();
  const wrongAnswerHistory = useAppStore((s) => s.wrongAnswerHistory);
  const [expanded, setExpanded] = useState(false);

  const recentMistakes = useMemo(() => {
    if (!wrongAnswerHistory || wrongAnswerHistory.length === 0) return [];
    const cutoff = Date.now() - WRONG_ANSWER_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    return wrongAnswerHistory
      .filter((r) => new Date(r.timestamp).getTime() >= cutoff)
      .slice(0, MAX_DISPLAY);
  }, [wrongAnswerHistory]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        emptyText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textMuted,
          textAlign: 'center',
          paddingVertical: spacing.md,
        },
        toggleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: layout.minTouchTarget,
        },
        toggleText: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.md,
          color: colors.textPrimary,
          flex: 1,
        },
        countBadge: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.sm,
          color: colors.incorrect,
          marginRight: spacing.sm,
        },
        mistakeCard: {
          backgroundColor: colors.backgroundLight,
          borderRadius: layout.borderRadius.md,
          padding: spacing.md,
          gap: spacing.xs,
        },
        mistakeList: {
          gap: spacing.sm,
          marginTop: spacing.sm,
        },
        questionText: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.md,
          color: colors.textPrimary,
        },
        answerRow: {
          flexDirection: 'row',
          gap: spacing.lg,
        },
        childAnswerLabel: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.incorrect,
        },
        correctAnswerLabel: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.correct,
        },
        metaRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        skillText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.xs,
          color: colors.textMuted,
        },
        dateText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.xs,
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  return (
    <View style={sectionStyle}>
      <View style={sectionHeaderStyle}>
        <AlertTriangle size={20} color={colors.primary} />
        <Text style={sectionTitleStyle}>Recent Mistakes</Text>
      </View>
      <View style={cardStyle}>
        <Pressable
          style={styles.toggleRow}
          onPress={() => setExpanded(!expanded)}
          accessibilityRole="button"
          accessibilityLabel={
            expanded
              ? 'Hide recent mistakes'
              : `Show ${recentMistakes.length} recent mistakes`
          }
          testID="recent-mistakes-toggle"
        >
          <Text style={styles.toggleText}>
            {recentMistakes.length === 0
              ? 'No recent mistakes'
              : `Review wrong answers`}
          </Text>
          {recentMistakes.length > 0 && (
            <>
              <Text style={styles.countBadge}>{recentMistakes.length}</Text>
              {expanded ? (
                <ChevronUp size={20} color={colors.textMuted} />
              ) : (
                <ChevronDown size={20} color={colors.textMuted} />
              )}
            </>
          )}
        </Pressable>

        {expanded && recentMistakes.length === 0 && (
          <Text style={styles.emptyText}>
            No wrong answers in the last {WRONG_ANSWER_RETENTION_DAYS} days.
            Great job!
          </Text>
        )}

        {expanded && recentMistakes.length > 0 && (
          <View style={styles.mistakeList} testID="mistakes-list">
            {recentMistakes.map((mistake, i) => (
              <MistakeCard key={i} mistake={mistake} styles={styles} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function MistakeCard({
  mistake,
  styles,
}: {
  mistake: WrongAnswerRecord;
  styles: Record<string, object>;
}) {
  return (
    <View style={styles.mistakeCard} testID="mistake-item">
      <Text style={styles.questionText}>{mistake.questionText}</Text>
      <View style={styles.answerRow}>
        <Text style={styles.childAnswerLabel}>
          Answered: {mistake.childAnswer}
        </Text>
        <Text style={styles.correctAnswerLabel}>
          Correct: {mistake.correctAnswer}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.skillText}>{mistake.skillName}</Text>
        <Text style={styles.dateText}>{formatDate(mistake.timestamp)}</Text>
      </View>
    </View>
  );
}
