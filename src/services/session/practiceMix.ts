import type { SkillState } from '../../store/slices/skillStatesSlice';
import type { SeededRng } from '../mathEngine/seededRng';
import type {
  PracticeProblemCategory,
  PracticeSlotCounts,
} from './sessionTypes';
import { getReviewStatus } from '../adaptive/leitnerCalculator';
import {
  getOuterFringe,
  getUnlockedSkills,
} from '../adaptive/prerequisiteGating';
import { getOrCreateSkillState } from '../../store/helpers/skillStateHelpers';
import { selectSkill } from '../adaptive/skillSelector';
import { SKILLS } from '../mathEngine/skills';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Pool item for review-due skills */
export interface ReviewPoolItem {
  readonly skillId: string;
  readonly masteryPL: number;
  readonly overdueByMs: number;
}

/** Pool item for new (outer fringe) skills */
export interface NewSkillPoolItem {
  readonly skillId: string;
  readonly masteryPL: number;
}

/** Pool item for challenge-worthy skills */
export interface ChallengePoolItem {
  readonly skillId: string;
  readonly masteryPL: number;
  readonly eloRating: number;
}

/** Generic pool item constraint for selectFromPool */
interface PoolItem {
  readonly skillId: string;
  readonly masteryPL: number;
}

/** A single item in the practice mix before ordering */
export interface PracticeMixItem {
  readonly skillId: string;
  readonly category: PracticeProblemCategory;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Ratios for the practice mix: 60% review, 30% new, 10% challenge */
const REVIEW_RATIO = 0.6;
const NEW_RATIO = 0.3;
const CHALLENGE_RATIO = 0.1;

/** P(L) range for challenge candidates */
const CHALLENGE_PL_MIN = 0.40;
const CHALLENGE_PL_MAX = 0.80;

/** Floor weight added to BKT inverse weighting to prevent zero probability */
const BKT_WEIGHT_FLOOR = 0.05;

/** Default P(L) for unpracticed skills */
const DEFAULT_PL = 0.1;

/** Maximum remediation slots per session (one per unique confirmed misconception skill) */
const MAX_REMEDIATION_SLOTS = 3;

// ---------------------------------------------------------------------------
// 1. Slot calculation
// ---------------------------------------------------------------------------

/**
 * Computes the 60/30/10 slot split for the practice portion of a session.
 *
 * Uses rounding for challenge and new, with review getting the remainder
 * to ensure the sum always equals practiceCount exactly.
 *
 * @param practiceCount - Total number of practice problems (default 9)
 * @returns Slot counts for each category
 */
export function computeSlotCounts(practiceCount: number): PracticeSlotCounts {
  if (practiceCount <= 0) {
    return { review: 0, new: 0, challenge: 0 };
  }

  const challenge = Math.round(practiceCount * CHALLENGE_RATIO);
  const newSlots = Math.round(practiceCount * NEW_RATIO);
  const review = practiceCount - newSlots - challenge;

  return { review, new: newSlots, challenge };
}

// ---------------------------------------------------------------------------
// 2. Review pool
// ---------------------------------------------------------------------------

/**
 * Builds the review pool: skills that are due for Leitner review,
 * sorted by lowest P(L) first (weakest due skills get priority).
 *
 * Excludes mastered skills (masteryLocked=true) since they don't
 * need active review from the practice mix.
 *
 * @param skillStates - Map of skillId -> SkillState
 * @param now - Current timestamp for review status calculation
 * @returns Array of review pool items, sorted by lowest P(L) first
 */
export function buildReviewPool(
  skillStates: Record<string, SkillState>,
  now?: Date,
): ReviewPoolItem[] {
  const pool: ReviewPoolItem[] = [];

  for (const skillId of Object.keys(skillStates)) {
    const state = skillStates[skillId];

    // Exclude mastered skills
    if (state.masteryLocked) continue;

    const reviewStatus = getReviewStatus(state.nextReviewDue, now);
    if (!reviewStatus.isDue) continue;

    pool.push({
      skillId,
      masteryPL: state.masteryProbability,
      overdueByMs: reviewStatus.overdueByMs,
    });
  }

  // Sort by lowest P(L) first (weakest skills prioritized)
  pool.sort((a, b) => a.masteryPL - b.masteryPL);

  return pool;
}

// ---------------------------------------------------------------------------
// 3. New skill pool
// ---------------------------------------------------------------------------

/**
 * Builds the new skill pool from the outer fringe (unmastered skills
 * whose prerequisites are all mastered).
 *
 * Uses default P(L) of 0.1 for unpracticed skills.
 *
 * @param skillStates - Map of skillId -> SkillState
 * @returns Array of new skill pool items
 */
export function buildNewSkillPool(
  skillStates: Record<string, SkillState>,
): NewSkillPoolItem[] {
  const fringeIds = getOuterFringe(skillStates);

  return fringeIds.map((skillId) => {
    const state = skillStates[skillId];
    return {
      skillId,
      masteryPL: state?.masteryProbability ?? DEFAULT_PL,
    };
  });
}

// ---------------------------------------------------------------------------
// 4. Challenge pool
// ---------------------------------------------------------------------------

/**
 * Builds the challenge pool: unlocked skills with P(L) in the mid-range
 * [0.40, 0.80] that have been practiced at least once.
 *
 * These are skills the child knows somewhat but hasn't mastered --
 * good candidates for stretching beyond current Elo.
 *
 * @param skillStates - Map of skillId -> SkillState
 * @returns Array of challenge pool items
 */
export function buildChallengePool(
  skillStates: Record<string, SkillState>,
): ChallengePoolItem[] {
  const unlockedIds = getUnlockedSkills(skillStates);
  const pool: ChallengePoolItem[] = [];

  for (const skillId of unlockedIds) {
    const state = skillStates[skillId];
    if (!state) continue;

    // Must have been practiced
    if (state.attempts <= 0) continue;

    // Exclude mastered skills
    if (state.masteryLocked) continue;

    // P(L) must be in challenge range
    if (state.masteryProbability < CHALLENGE_PL_MIN) continue;
    if (state.masteryProbability > CHALLENGE_PL_MAX) continue;

    pool.push({
      skillId,
      masteryPL: state.masteryProbability,
      eloRating: state.eloRating,
    });
  }

  return pool;
}

// ---------------------------------------------------------------------------
// 5. Weighted selection from pool
// ---------------------------------------------------------------------------

/**
 * Selects a single item from a pool using inverse BKT weighting.
 *
 * Lower P(L) = higher selection probability. A floor weight ensures
 * all items have non-zero probability.
 *
 * Prefers unique skills: first tries selecting from items NOT in usedSkillIds.
 * Falls back to the full pool when all items have been used.
 *
 * @param pool - Array of pool items with skillId and masteryPL
 * @param rng - Seeded random number generator for deterministic selection
 * @param usedSkillIds - Set of skill IDs already selected in this session
 * @returns Selected pool item, or null if pool is empty
 */
export function selectFromPool<T extends PoolItem>(
  pool: readonly T[],
  rng: SeededRng,
  usedSkillIds: Set<string>,
): T | null {
  if (pool.length === 0) return null;

  // Try unused skills first
  const unused = pool.filter((item) => !usedSkillIds.has(item.skillId));
  const candidates = unused.length > 0 ? unused : pool;

  return weightedSelect(candidates, rng);
}

/**
 * Performs inverse-BKT weighted random selection.
 * Weight = (1 - masteryPL) + BKT_WEIGHT_FLOOR
 */
function weightedSelect<T extends PoolItem>(
  candidates: readonly T[],
  rng: SeededRng,
): T {
  const weights = candidates.map(
    (item) => 1 - item.masteryPL + BKT_WEIGHT_FLOOR,
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let roll = rng.next() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }

  // Floating point safety: return last item
  return candidates[candidates.length - 1];
}

// ---------------------------------------------------------------------------
// 6. Remediation skill selection
// ---------------------------------------------------------------------------

/**
 * Selects which confirmed-misconception skill IDs to include as remediation slots.
 *
 * When the number of confirmed skills is within maxSlots, returns all of them.
 * When it exceeds maxSlots, uses inverse-BKT weighting to prioritize the
 * lowest-mastery (weakest) misconception skills -- consistent with review pool
 * prioritization.
 *
 * @param confirmedSkillIds - Skill IDs with confirmed misconceptions
 * @param skillStates - Map of skillId -> SkillState for BKT mastery lookup
 * @param rng - Seeded random number generator
 * @param maxSlots - Maximum number of remediation slots to fill
 * @returns Array of selected skill IDs (length <= maxSlots)
 */
function selectRemediationSkillIds(
  confirmedSkillIds: readonly string[],
  skillStates: Record<string, SkillState>,
  rng: SeededRng,
  maxSlots: number,
): string[] {
  if (confirmedSkillIds.length === 0) return [];
  if (confirmedSkillIds.length <= maxSlots) return [...confirmedSkillIds];

  // Build pool items with BKT mastery for weighted selection
  const pool = confirmedSkillIds.map((skillId) => ({
    skillId,
    masteryPL: getOrCreateSkillState(skillStates, skillId).masteryProbability,
  }));

  const selected: string[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < maxSlots; i++) {
    const item = selectFromPool(pool, rng, usedIds);
    if (item) {
      selected.push(item.skillId);
      usedIds.add(item.skillId);
    }
  }

  return selected;
}

// ---------------------------------------------------------------------------
// 7. Generate practice mix
// ---------------------------------------------------------------------------

/**
 * Main orchestrator: generates the practice mix for a session.
 *
 * Fills review, new, and challenge slots according to the 60/30/10 split.
 * Applies fallback cascade when categories have insufficient candidates:
 *   a. Unfilled challenge slots -> try review pool, then new pool
 *   b. Unfilled new slots -> try review pool
 *   c. Unfilled review slots -> try new pool
 *   d. If ALL pools empty -> weakness-weighted selection from unlocked skills
 *   e. Safety fallback -> root skills
 *
 * @param skillStates - Map of skillId -> SkillState
 * @param childAge - Child's age (6-9), or null for defaults
 * @param rng - Seeded random number generator
 * @param practiceCount - Number of practice problems (default 9)
 * @param now - Current timestamp for review status calculation
 * @param confirmedMisconceptionSkillIds - Skill IDs with confirmed misconceptions for remediation
 * @returns Array of practice mix items (skillId + category)
 */
export function generatePracticeMix(
  skillStates: Record<string, SkillState>,
  childAge: number | null,
  rng: SeededRng,
  practiceCount: number = 9,
  now?: Date,
  confirmedMisconceptionSkillIds: readonly string[] = [],
): PracticeMixItem[] {
  const slots = computeSlotCounts(practiceCount);
  const reviewPool = buildReviewPool(skillStates, now);
  const newPool = buildNewSkillPool(skillStates);
  const challengePool = buildChallengePool(skillStates);

  const usedSkillIds = new Set<string>();
  const result: PracticeMixItem[] = [];

  // Helper to select from a pool and track usage
  function selectAndTrack<T extends PoolItem>(
    pool: readonly T[],
    category: PracticeProblemCategory,
  ): boolean {
    const item = selectFromPool(pool, rng, usedSkillIds);
    if (item) {
      result.push({ skillId: item.skillId, category });
      usedSkillIds.add(item.skillId);
      return true;
    }
    return false;
  }

  // Inject remediation slots (replace review slots, up to MAX_REMEDIATION_SLOTS)
  const selectedRemediationIds = selectRemediationSkillIds(
    confirmedMisconceptionSkillIds,
    skillStates,
    rng,
    MAX_REMEDIATION_SLOTS,
  );
  const remediationCount = Math.min(selectedRemediationIds.length, slots.review);
  for (const skillId of selectedRemediationIds.slice(0, remediationCount)) {
    result.push({ skillId, category: 'remediation' });
    usedSkillIds.add(skillId);
  }
  const adjustedReviewCount = slots.review - remediationCount;

  // Fill review slots (reduced by remediation)
  let unfilledReview = 0;
  for (let i = 0; i < adjustedReviewCount; i++) {
    if (!selectAndTrack(reviewPool, 'review')) {
      unfilledReview++;
    }
  }

  // Fill new-skill slots
  let unfilledNew = 0;
  for (let i = 0; i < slots.new; i++) {
    if (!selectAndTrack(newPool, 'new')) {
      unfilledNew++;
    }
  }

  // Fill challenge slots
  let unfilledChallenge = 0;
  for (let i = 0; i < slots.challenge; i++) {
    if (!selectAndTrack(challengePool, 'challenge')) {
      unfilledChallenge++;
    }
  }

  // Fallback cascade:
  // a. Unfilled challenge slots -> try review pool, then new pool
  for (let i = 0; i < unfilledChallenge; i++) {
    if (!selectAndTrack(reviewPool, 'review')) {
      if (!selectAndTrack(newPool, 'new')) {
        // Will be handled by ultimate fallback below
      }
    }
  }

  // b. Unfilled new slots -> try review pool
  for (let i = 0; i < unfilledNew; i++) {
    if (!selectAndTrack(reviewPool, 'review')) {
      // Will be handled by ultimate fallback below
    }
  }

  // c. Unfilled review slots -> try new pool
  for (let i = 0; i < unfilledReview; i++) {
    if (!selectAndTrack(newPool, 'new')) {
      // Will be handled by ultimate fallback below
    }
  }

  // d. Ultimate fallback: fill remaining slots from unlocked skills
  if (result.length < practiceCount) {
    const unlockedIds = getUnlockedSkills(skillStates);

    if (unlockedIds.length > 0) {
      while (result.length < practiceCount) {
        const skillId = selectSkill(unlockedIds, skillStates, rng);
        result.push({ skillId, category: 'new' });
        usedSkillIds.add(skillId);
      }
    } else {
      // e. Safety fallback: root skills (should always exist)
      const rootSkills = SKILLS.filter(
        (s) => s.prerequisites.length === 0,
      ).map((s) => s.id);

      while (result.length < practiceCount) {
        const idx = rng.intRange(0, rootSkills.length - 1);
        result.push({ skillId: rootSkills[idx], category: 'new' });
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 8. Constrained shuffle
// ---------------------------------------------------------------------------

/**
 * Applies constrained random ordering to the practice mix.
 *
 * Constraints:
 *   1. First slot is always a review problem (warm start)
 *   2. No two challenge problems are adjacent
 *
 * Algorithm:
 *   - Place one review item first (guaranteed warm start)
 *   - Fisher-Yates shuffle the remaining items
 *   - Fix adjacent challenge pairs by swapping with nearest non-challenge
 *
 * @param items - Practice mix items to order
 * @param rng - Seeded random number generator
 * @returns New array with constrained random ordering
 */
export function constrainedShuffle(
  items: ReadonlyArray<PracticeMixItem>,
  rng: SeededRng,
): PracticeMixItem[] {
  if (items.length <= 1) return [...items];

  // Make a mutable copy
  const arr = [...items];

  // Step 1: Ensure a review or remediation item is first (warm start)
  const warmStartIdx = arr.findIndex(
    (item) => item.category === 'review' || item.category === 'remediation',
  );
  if (warmStartIdx > 0) {
    // Swap the found warm-start item to position 0
    [arr[0], arr[warmStartIdx]] = [arr[warmStartIdx], arr[0]];
  }
  // If no review/remediation items exist, just leave the first item as-is (best-effort)

  // Step 2: Fisher-Yates shuffle on remaining items (index 1+)
  for (let i = arr.length - 1; i > 1; i--) {
    const j = rng.intRange(1, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Step 3: Fix adjacent challenge pairs
  fixAdjacentChallenges(arr);

  return arr;
}

/**
 * Fixes adjacent challenge items by swapping with the nearest non-challenge item.
 * Operates in-place. Best-effort: if too many challenges to separate, leaves as-is.
 */
function fixAdjacentChallenges(arr: PracticeMixItem[]): void {
  for (let i = 0; i < arr.length - 1; i++) {
    if (
      arr[i].category === 'challenge' &&
      arr[i + 1].category === 'challenge'
    ) {
      // Find nearest non-challenge item after i+1 to swap with i+1
      let swapIdx = -1;
      for (let j = i + 2; j < arr.length; j++) {
        if (arr[j].category !== 'challenge') {
          swapIdx = j;
          break;
        }
      }

      if (swapIdx === -1) {
        // Try before i
        for (let j = i - 1; j >= 0; j--) {
          if (arr[j].category !== 'challenge') {
            swapIdx = j;
            break;
          }
        }
      }

      if (swapIdx !== -1) {
        [arr[i + 1], arr[swapIdx]] = [arr[swapIdx], arr[i + 1]];
      }
      // If no swap target found, too many challenges -- best effort
    }
  }
}
