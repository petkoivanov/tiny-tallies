/**
 * SkillDomainSummary — shows mastery breakdown by skill domain (operation).
 *
 * Displays per-domain counts of mastered / in-progress / not-started skills
 * with simple View-based progress bars.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { Operation } from '@/services/mathEngine/types';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import { SKILLS } from '@/services/mathEngine/skills';

/** Human-friendly labels for each operation/domain */
const DOMAIN_LABELS: Record<Operation, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  fractions: 'Fractions',
  place_value: 'Place Value',
  time: 'Time',
  money: 'Money',
  patterns: 'Patterns',
  measurement: 'Measurement',
  ratios: 'Ratios',
  exponents: 'Exponents',
  expressions: 'Expressions',
};

const DOMAIN_ORDER: Operation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'fractions',
  'place_value',
  'time',
  'money',
  'patterns',
];

interface DomainStats {
  total: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
}

function computeDomainStats(
  skillStates: Record<string, SkillState>,
): Record<Operation, DomainStats> {
  const stats: Record<string, DomainStats> = {};
  for (const op of DOMAIN_ORDER) {
    stats[op] = { total: 0, mastered: 0, inProgress: 0, notStarted: 0 };
  }

  for (const skill of SKILLS) {
    const domain = stats[skill.operation];
    if (!domain) continue;
    domain.total++;
    const state = skillStates[skill.id];
    if (!state || state.attempts === 0) {
      domain.notStarted++;
    } else if (state.masteryLocked) {
      domain.mastered++;
    } else {
      domain.inProgress++;
    }
  }

  return stats as Record<Operation, DomainStats>;
}

interface SkillDomainSummaryProps {
  skillStates: Record<string, SkillState>;
}

export function SkillDomainSummary({ skillStates }: SkillDomainSummaryProps) {
  const { colors } = useTheme();
  const domainStats = useMemo(() => computeDomainStats(skillStates), [skillStates]);

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
        },
        domainRow: {
          gap: spacing.xs,
        },
        domainLabelRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        domainName: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.md,
          color: colors.textPrimary,
        },
        domainCount: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textMuted,
        },
        progressBarBackground: {
          height: 8,
          backgroundColor: colors.backgroundLight,
          borderRadius: layout.borderRadius.round,
          overflow: 'hidden',
          flexDirection: 'row',
        },
        masteredFill: {
          height: '100%',
          backgroundColor: colors.correct,
        },
        inProgressFill: {
          height: '100%',
          backgroundColor: colors.primary,
        },
        legend: {
          flexDirection: 'row',
          gap: spacing.md,
          marginTop: spacing.xs,
        },
        legendItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        },
        legendDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
        },
        legendText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.xs,
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.card} testID="skill-domain-summary">
      <View style={styles.header}>
        <BookOpen size={20} color={colors.primary} />
        <Text style={styles.title}>Skills by Domain</Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.correct }]} />
          <Text style={styles.legendText}>Mastered</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>In Progress</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.backgroundLight }]}
          />
          <Text style={styles.legendText}>Not Started</Text>
        </View>
      </View>

      {DOMAIN_ORDER.map((op) => {
        const stats = domainStats[op];
        if (stats.total === 0) return null;
        const masteredPct = (stats.mastered / stats.total) * 100;
        const inProgressPct = (stats.inProgress / stats.total) * 100;

        return (
          <View key={op} style={styles.domainRow} testID={`domain-${op}`}>
            <View style={styles.domainLabelRow}>
              <Text style={styles.domainName}>{DOMAIN_LABELS[op]}</Text>
              <Text style={styles.domainCount}>
                {stats.mastered}/{stats.total}
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              {masteredPct > 0 && (
                <View
                  style={[styles.masteredFill, { width: `${masteredPct}%` }]}
                />
              )}
              {inProgressPct > 0 && (
                <View
                  style={[styles.inProgressFill, { width: `${inProgressPct}%` }]}
                />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
