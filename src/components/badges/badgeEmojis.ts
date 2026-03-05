import { BADGES } from '@/services/achievement/badgeRegistry';

/**
 * Emoji lookup map for all 31 badge definitions.
 *
 * Tier differentiation is handled by BadgeIcon border color, not by
 * different emojis per tier. Emojis are themed by condition type.
 */
export const BADGE_EMOJIS: Record<string, string> = {
  // ── Skill-Mastery: Addition (7) ──────────────────────────────────────
  'mastery.addition.single-digit.no-carry': '\u2B50',       // Star
  'mastery.addition.within-20.no-carry': '\uD83C\uDF1F',    // Glowing star
  'mastery.addition.within-20.with-carry': '\uD83D\uDCAB',  // Dizzy (sparkle burst)
  'mastery.addition.two-digit.no-carry': '\u2728',           // Sparkles
  'mastery.addition.two-digit.with-carry': '\uD83C\uDF1E',  // Sun with face
  'mastery.addition.three-digit.no-carry': '\uD83C\uDF20',  // Shooting star
  'mastery.addition.three-digit.with-carry': '\uD83D\uDC51', // Crown

  // ── Skill-Mastery: Subtraction (7) ───────────────────────────────────
  'mastery.subtraction.single-digit.no-borrow': '\uD83D\uDD35', // Blue circle
  'mastery.subtraction.within-20.no-borrow': '\uD83D\uDC8E',    // Gem stone
  'mastery.subtraction.within-20.with-borrow': '\u2744\uFE0F',  // Snowflake
  'mastery.subtraction.two-digit.no-borrow': '\uD83C\uDF0A',    // Water wave
  'mastery.subtraction.two-digit.with-borrow': '\u26A1',         // Lightning
  'mastery.subtraction.three-digit.no-borrow': '\uD83C\uDF0C',  // Milky Way
  'mastery.subtraction.three-digit.with-borrow': '\uD83D\uDE80', // Rocket

  // ── Category-Mastery (2) ─────────────────────────────────────────────
  'mastery.category.addition': '\u2795',       // Plus sign
  'mastery.category.subtraction': '\u2796',    // Heavy minus sign

  // ── Grade-Mastery (3) ────────────────────────────────────────────────
  'mastery.grade.1': '\uD83C\uDF93',  // Graduation cap
  'mastery.grade.2': '\uD83C\uDF93',  // Graduation cap
  'mastery.grade.3': '\uD83C\uDF93',  // Graduation cap

  // ── Streak-Milestone (3) ─────────────────────────────────────────────
  'behavior.streak.bronze': '\uD83D\uDD25',  // Fire
  'behavior.streak.silver': '\uD83D\uDD25',  // Fire
  'behavior.streak.gold': '\uD83D\uDD25',    // Fire

  // ── Sessions-Milestone (3) ───────────────────────────────────────────
  'behavior.sessions.bronze': '\uD83D\uDCD6', // Open book
  'behavior.sessions.silver': '\uD83D\uDCD6', // Open book
  'behavior.sessions.gold': '\uD83D\uDCD6',   // Open book

  // ── Remediation-Victory (2) ──────────────────────────────────────────
  'behavior.remediation.bronze': '\uD83D\uDC1B', // Bug
  'behavior.remediation.silver': '\uD83D\uDC1B', // Bug

  // ── Challenge (4) ───────────────────────────────────────────────────
  'behavior.challenge.first': '\uD83C\uDFC6',   // Trophy
  'behavior.challenge.streak': '\uD83C\uDFC6',  // Trophy
  'behavior.challenge.master': '\uD83C\uDFC6',  // Trophy
  'behavior.challenge.perfect': '\uD83D\uDCAF', // Hundred points
};

// Compile-time coverage check: ensure every registry badge has an emoji
if (process.env.NODE_ENV !== 'production') {
  for (const badge of BADGES) {
    if (!(badge.id in BADGE_EMOJIS)) {
      console.warn(`BADGE_EMOJIS missing entry for badge: ${badge.id}`);
    }
  }
}
