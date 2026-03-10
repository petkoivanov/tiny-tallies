/**
 * SkillDomainSummary — shows mastery breakdown by skill domain (operation).
 *
 * Displays per-domain counts with expandable per-skill drill-down.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { MathDomain } from '@/services/mathEngine/types';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import { SKILLS } from '@/services/mathEngine/skills';
import { ExpandableSkillDomain } from './ExpandableSkillDomain';

/** Human-friendly labels for each operation/domain */
const DOMAIN_LABELS: Record<MathDomain, string> = {
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
  geometry: 'Geometry',
  probability: 'Probability',
  number_theory: 'Number Theory',
  basic_graphs: 'Basic Graphs',
  data_analysis: 'Data Analysis',
};

const DOMAIN_ORDER: MathDomain[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'fractions',
  'place_value',
  'time',
  'money',
  'patterns',
  'measurement',
  'ratios',
  'exponents',
  'expressions',
  'geometry',
  'probability',
  'number_theory',
  'basic_graphs',
  'data_analysis',
];

interface DomainData {
  mastered: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

function computeDomainData(
  skillStates: Record<string, SkillState>,
): Record<MathDomain, DomainData> {
  const stats: Record<string, DomainData> = {};
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

  return stats as Record<MathDomain, DomainData>;
}

/** Group skills by operation for drill-down */
function getSkillsByDomain() {
  const map = new Map<MathDomain, typeof SKILLS[number][]>();
  for (const skill of SKILLS) {
    const list = map.get(skill.operation) ?? [];
    list.push(skill);
    map.set(skill.operation, list);
  }
  return map;
}

const SKILLS_BY_DOMAIN = getSkillsByDomain();

interface SkillDomainSummaryProps {
  skillStates: Record<string, SkillState>;
}

export function SkillDomainSummary({ skillStates }: SkillDomainSummaryProps) {
  const { colors } = useTheme();
  const domainData = useMemo(() => computeDomainData(skillStates), [skillStates]);

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
        const data = domainData[op];
        const domainSkills = SKILLS_BY_DOMAIN.get(op) ?? [];
        if (data.total === 0) return null;

        return (
          <ExpandableSkillDomain
            key={op}
            domainLabel={DOMAIN_LABELS[op]}
            skills={domainSkills}
            skillStates={skillStates}
            masteredCount={data.mastered}
            totalCount={data.total}
            inProgressCount={data.inProgress}
          />
        );
      })}
    </View>
  );
}
