import type { BadgeCategory, BadgeDefinition } from './badgeTypes';

/**
 * Static badge registry: 27 badge definitions organized by category.
 *
 * Mastery badges (19):
 *   - 14 skill-mastery (one per skill)
 *   - 2 category-mastery (addition, subtraction)
 *   - 3 grade-mastery (grades 1-3)
 *
 * Behavior badges (8):
 *   - 3 streak-milestone (bronze/silver/gold)
 *   - 3 sessions-milestone (bronze/silver/gold)
 *   - 2 remediation-victory (bronze/silver)
 */
export const BADGES: readonly BadgeDefinition[] = [
  // ── Skill-Mastery Badges (14) ──────────────────────────────────────────
  {
    id: 'mastery.addition.single-digit.no-carry',
    name: 'Addition Starter',
    description: 'Master adding within 10',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'addition.single-digit.no-carry' },
  },
  {
    id: 'mastery.addition.within-20.no-carry',
    name: 'Quick Adder',
    description: 'Master adding within 20 without carrying',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'addition.within-20.no-carry' },
  },
  {
    id: 'mastery.addition.within-20.with-carry',
    name: 'Carry Champion',
    description: 'Master adding within 20 with carrying',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'addition.within-20.with-carry' },
  },
  {
    id: 'mastery.addition.two-digit.no-carry',
    name: 'Two-Digit Adder',
    description: 'Master adding two-digit numbers without carrying',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'addition.two-digit.no-carry' },
  },
  {
    id: 'mastery.addition.two-digit.with-carry',
    name: 'Two-Digit Pro',
    description: 'Master adding two-digit numbers with carrying',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'addition.two-digit.with-carry' },
  },
  {
    id: 'mastery.addition.three-digit.no-carry',
    name: 'Triple Adder',
    description: 'Master adding three-digit numbers without carrying',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'addition.three-digit.no-carry' },
  },
  {
    id: 'mastery.addition.three-digit.with-carry',
    name: 'Addition Master',
    description: 'Master adding three-digit numbers with carrying',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'addition.three-digit.with-carry' },
  },
  {
    id: 'mastery.subtraction.single-digit.no-borrow',
    name: 'Subtraction Starter',
    description: 'Master subtracting within 10',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'subtraction.single-digit.no-borrow' },
  },
  {
    id: 'mastery.subtraction.within-20.no-borrow',
    name: 'Quick Subtractor',
    description: 'Master subtracting within 20 without borrowing',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'subtraction.within-20.no-borrow' },
  },
  {
    id: 'mastery.subtraction.within-20.with-borrow',
    name: 'Borrow Boss',
    description: 'Master subtracting within 20 with borrowing',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'subtraction.within-20.with-borrow' },
  },
  {
    id: 'mastery.subtraction.two-digit.no-borrow',
    name: 'Two-Digit Subtractor',
    description: 'Master subtracting two-digit numbers without borrowing',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'subtraction.two-digit.no-borrow' },
  },
  {
    id: 'mastery.subtraction.two-digit.with-borrow',
    name: 'Two-Digit Hero',
    description: 'Master subtracting two-digit numbers with borrowing',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'subtraction.two-digit.with-borrow' },
  },
  {
    id: 'mastery.subtraction.three-digit.no-borrow',
    name: 'Triple Subtractor',
    description: 'Master subtracting three-digit numbers without borrowing',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'subtraction.three-digit.no-borrow' },
  },
  {
    id: 'mastery.subtraction.three-digit.with-borrow',
    name: 'Subtraction Master',
    description: 'Master subtracting three-digit numbers with borrowing',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'skill-mastery', skillId: 'subtraction.three-digit.with-borrow' },
  },

  // ── Category-Mastery Badges (2) ────────────────────────────────────────
  {
    id: 'mastery.category.addition',
    name: 'Addition Expert',
    description: 'Master all addition skills',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'category-mastery', operation: 'addition' },
  },
  {
    id: 'mastery.category.subtraction',
    name: 'Subtraction Expert',
    description: 'Master all subtraction skills',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'category-mastery', operation: 'subtraction' },
  },

  // ── Grade-Mastery Badges (3) ───────────────────────────────────────────
  {
    id: 'mastery.grade.1',
    name: 'Grade 1 Graduate',
    description: 'Master all Grade 1 skills',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'grade-mastery', grade: 1 },
  },
  {
    id: 'mastery.grade.2',
    name: 'Grade 2 Graduate',
    description: 'Master all Grade 2 skills',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'grade-mastery', grade: 2 },
  },
  {
    id: 'mastery.grade.3',
    name: 'Grade 3 Graduate',
    description: 'Master all Grade 3 skills',
    category: 'mastery',
    tier: 'gold',
    condition: { type: 'grade-mastery', grade: 3 },
  },

  // ── Streak-Milestone Badges (3) ────────────────────────────────────────
  {
    id: 'behavior.streak.bronze',
    name: 'Steady Learner',
    description: 'Maintain a 2-week practice streak',
    category: 'behavior',
    tier: 'bronze',
    condition: { type: 'streak-milestone', weeklyStreakRequired: 2 },
  },
  {
    id: 'behavior.streak.silver',
    name: 'Dedicated Learner',
    description: 'Maintain a 4-week practice streak',
    category: 'behavior',
    tier: 'silver',
    condition: { type: 'streak-milestone', weeklyStreakRequired: 4 },
  },
  {
    id: 'behavior.streak.gold',
    name: 'Streak Star',
    description: 'Maintain an 8-week practice streak',
    category: 'behavior',
    tier: 'gold',
    condition: { type: 'streak-milestone', weeklyStreakRequired: 8 },
  },

  // ── Sessions-Milestone Badges (3) ──────────────────────────────────────
  {
    id: 'behavior.sessions.bronze',
    name: 'Getting Started',
    description: 'Complete 10 practice sessions',
    category: 'behavior',
    tier: 'bronze',
    condition: { type: 'sessions-milestone', sessionsRequired: 10 },
  },
  {
    id: 'behavior.sessions.silver',
    name: 'Practice Pro',
    description: 'Complete 50 practice sessions',
    category: 'behavior',
    tier: 'silver',
    condition: { type: 'sessions-milestone', sessionsRequired: 50 },
  },
  {
    id: 'behavior.sessions.gold',
    name: 'Math Marathoner',
    description: 'Complete 100 practice sessions',
    category: 'behavior',
    tier: 'gold',
    condition: { type: 'sessions-milestone', sessionsRequired: 100 },
  },

  // ── Remediation-Victory Badges (2) ─────────────────────────────────────
  {
    id: 'behavior.remediation.bronze',
    name: 'Bug Squasher',
    description: 'Resolve your first misconception',
    category: 'behavior',
    tier: 'bronze',
    condition: { type: 'remediation-victory', resolvedCountRequired: 1 },
  },
  {
    id: 'behavior.remediation.silver',
    name: 'Misconception Hunter',
    description: 'Resolve 3 misconceptions',
    category: 'behavior',
    tier: 'silver',
    condition: { type: 'remediation-victory', resolvedCountRequired: 3 },
  },
];

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}

export function getBadgesByCategory(
  category: BadgeCategory,
): BadgeDefinition[] {
  return BADGES.filter((b) => b.category === category);
}
