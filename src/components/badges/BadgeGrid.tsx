import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BadgeIcon } from './BadgeIcon';
import { BADGE_EMOJIS } from './badgeEmojis';
import { getBadgesByCategory } from '@/services/achievement/badgeRegistry';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { BadgeDefinition } from '@/services/achievement/badgeTypes';
import type { EarnedBadge } from '@/store/slices/achievementSlice';

export interface BadgeGridProps {
  earnedBadges: Record<string, EarnedBadge>;
  onBadgePress: (badge: BadgeDefinition) => void;
}

interface BadgeSection {
  title: string;
  badges: BadgeDefinition[];
}

function buildSections(): BadgeSection[] {
  const mastery = getBadgesByCategory('mastery');
  const behavior = getBadgesByCategory('behavior');

  const skillMastery = mastery.filter(
    (b) => b.condition.type === 'skill-mastery',
  );
  const categoryGrade = mastery.filter(
    (b) =>
      b.condition.type === 'category-mastery' ||
      b.condition.type === 'grade-mastery',
  );

  return [
    { title: 'Skill Mastery', badges: skillMastery },
    { title: 'Category & Grade', badges: categoryGrade },
    { title: 'Milestones', badges: behavior },
  ];
}

function getShortRequirement(badge: BadgeDefinition): string {
  const c = badge.condition;
  switch (c.type) {
    case 'skill-mastery':
      return badge.description;
    case 'category-mastery':
      return `All ${c.operation}`;
    case 'grade-mastery':
      return `Grade ${c.grade}`;
    case 'streak-milestone':
      return `${c.weeklyStreakRequired}-wk streak`;
    case 'sessions-milestone':
      return `${c.sessionsRequired} sessions`;
    case 'remediation-victory':
      return `${c.resolvedCountRequired} fixed`;
    default:
      return badge.description;
  }
}

export function BadgeGrid({ earnedBadges, onBadgePress }: BadgeGridProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      marginBottom: spacing.md,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    item: {
      width: '33%',
      alignItems: 'center',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    badgeName: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.medium,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    badgeNameEarned: {
      color: colors.textPrimary,
    },
    badgeNameLocked: {
      color: colors.textMuted,
    },
    requirement: {
      color: colors.textMuted,
      fontSize: 10,
      fontFamily: typography.fontFamily.regular,
      textAlign: 'center',
      marginTop: 2,
    },
  }), [colors]);
  const sections = buildSections();

  return (
    <View>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.grid}>
            {section.badges.map((badge) => {
              const earned = badge.id in earnedBadges;
              const emoji = BADGE_EMOJIS[badge.id] ?? '?';
              return (
                <Pressable
                  key={badge.id}
                  style={styles.item}
                  onPress={() => onBadgePress(badge)}
                  accessibilityRole="button"
                  accessibilityLabel={badge.name}
                >
                  <BadgeIcon
                    emoji={emoji}
                    earned={earned}
                    size={64}
                    tier={badge.tier}
                  />
                  <Text
                    style={[
                      styles.badgeName,
                      earned
                        ? styles.badgeNameEarned
                        : styles.badgeNameLocked,
                    ]}
                    numberOfLines={2}
                  >
                    {badge.name}
                  </Text>
                  {!earned && (
                    <Text style={styles.requirement} numberOfLines={2}>
                      {getShortRequirement(badge)}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
