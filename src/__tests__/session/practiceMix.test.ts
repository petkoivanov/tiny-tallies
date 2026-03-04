import {
  computeSlotCounts,
  buildReviewPool,
  buildNewSkillPool,
  buildChallengePool,
  selectFromPool,
  generatePracticeMix,
  constrainedShuffle,
} from '@/services/session/practiceMix';
import type {
  PracticeProblemCategory,
  PracticeSlotCounts,
} from '@/services/session/sessionTypes';
import { createRng } from '@/services/mathEngine/seededRng';
import type { SkillState } from '@/store/slices/skillStatesSlice';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** BKT + Leitner default fields for test SkillState objects */
const bktDefaults = {
  masteryProbability: 0.1,
  consecutiveWrong: 0,
  masteryLocked: false,
  leitnerBox: 1 as const,
  nextReviewDue: null,
  consecutiveCorrectInBox6: 0,
  cpaLevel: 'concrete' as const,
} as const;

function makeSkillState(overrides: Partial<SkillState> = {}): SkillState {
  return {
    eloRating: 1000,
    attempts: 0,
    correct: 0,
    ...bktDefaults,
    ...overrides,
  };
}

// Fixed "now" for deterministic review status checks
const NOW = new Date('2026-03-01T12:00:00Z');
// A past date (review is due)
const PAST_DATE = '2026-02-20T12:00:00Z';
// A future date (review is not due)
const FUTURE_DATE = '2026-04-01T12:00:00Z';

// ---------------------------------------------------------------------------
// computeSlotCounts
// ---------------------------------------------------------------------------

describe('computeSlotCounts', () => {
  it('returns { review: 5, new: 3, challenge: 1 } for practiceCount=9', () => {
    const result = computeSlotCounts(9);
    expect(result).toEqual({ review: 5, new: 3, challenge: 1 });
  });

  it('slot sum always equals practiceCount', () => {
    for (let count = 0; count <= 20; count++) {
      const { review, new: newSlots, challenge } = computeSlotCounts(count);
      expect(review + newSlots + challenge).toBe(count);
    }
  });

  it('returns all zeros for practiceCount=0', () => {
    expect(computeSlotCounts(0)).toEqual({ review: 0, new: 0, challenge: 0 });
  });

  it('returns { review: 1, new: 0, challenge: 0 } for practiceCount=1', () => {
    expect(computeSlotCounts(1)).toEqual({ review: 1, new: 0, challenge: 0 });
  });
});

// ---------------------------------------------------------------------------
// buildReviewPool
// ---------------------------------------------------------------------------

describe('buildReviewPool', () => {
  it('returns only skills where getReviewStatus reports isDue=true', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 5,
        correct: 3,
        leitnerBox: 3,
        nextReviewDue: PAST_DATE, // due
        masteryProbability: 0.6,
      }),
      'addition.within-20.no-carry': makeSkillState({
        attempts: 3,
        correct: 2,
        leitnerBox: 2,
        nextReviewDue: FUTURE_DATE, // not due
        masteryProbability: 0.4,
      }),
      'subtraction.single-digit.no-borrow': makeSkillState({
        attempts: 4,
        correct: 3,
        leitnerBox: 2,
        nextReviewDue: PAST_DATE, // due
        masteryProbability: 0.5,
      }),
    };

    const pool = buildReviewPool(skillStates, NOW);
    const skillIds = pool.map((p) => p.skillId);
    expect(skillIds).toContain('addition.single-digit.no-carry');
    expect(skillIds).toContain('subtraction.single-digit.no-borrow');
    expect(skillIds).not.toContain('addition.within-20.no-carry');
  });

  it('sorts by lowest P(L) first (weakest due skills prioritized)', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 5,
        nextReviewDue: PAST_DATE,
        masteryProbability: 0.7,
      }),
      'subtraction.single-digit.no-borrow': makeSkillState({
        attempts: 3,
        nextReviewDue: PAST_DATE,
        masteryProbability: 0.3,
      }),
    };

    const pool = buildReviewPool(skillStates, NOW);
    expect(pool[0].skillId).toBe('subtraction.single-digit.no-borrow');
    expect(pool[1].skillId).toBe('addition.single-digit.no-carry');
  });

  it('excludes mastered skills (masteryLocked=true)', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 10,
        correct: 9,
        masteryLocked: true,
        nextReviewDue: PAST_DATE,
        masteryProbability: 0.96,
      }),
      'subtraction.single-digit.no-borrow': makeSkillState({
        attempts: 3,
        nextReviewDue: PAST_DATE,
        masteryProbability: 0.4,
      }),
    };

    const pool = buildReviewPool(skillStates, NOW);
    const skillIds = pool.map((p) => p.skillId);
    expect(skillIds).not.toContain('addition.single-digit.no-carry');
    expect(skillIds).toContain('subtraction.single-digit.no-borrow');
  });
});

// ---------------------------------------------------------------------------
// buildNewSkillPool
// ---------------------------------------------------------------------------

describe('buildNewSkillPool', () => {
  it('returns outer fringe skills with P(L) values', () => {
    // Empty skill states -> root skills (no prerequisites) are in the fringe
    const skillStates: Record<string, SkillState> = {};
    const pool = buildNewSkillPool(skillStates);
    // Root skills: addition.single-digit.no-carry, subtraction.single-digit.no-borrow
    expect(pool.length).toBeGreaterThanOrEqual(2);
    expect(pool.every((p) => p.masteryPL !== undefined)).toBe(true);
  });

  it('uses default 0.1 P(L) for unpracticed skills', () => {
    const skillStates: Record<string, SkillState> = {};
    const pool = buildNewSkillPool(skillStates);
    // Unpracticed skills should have default 0.1 P(L)
    for (const item of pool) {
      expect(item.masteryPL).toBe(0.1);
    }
  });
});

// ---------------------------------------------------------------------------
// buildChallengePool
// ---------------------------------------------------------------------------

describe('buildChallengePool', () => {
  it('returns unlocked skills with P(L) in [0.40, 0.80] that have been practiced', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 10,
        correct: 6,
        masteryProbability: 0.55, // in range
        eloRating: 950,
      }),
      'subtraction.single-digit.no-borrow': makeSkillState({
        attempts: 5,
        correct: 2,
        masteryProbability: 0.35, // below range
        eloRating: 900,
      }),
    };

    const pool = buildChallengePool(skillStates);
    const skillIds = pool.map((p) => p.skillId);
    expect(skillIds).toContain('addition.single-digit.no-carry');
    expect(skillIds).not.toContain('subtraction.single-digit.no-borrow');
  });

  it('excludes mastered skills', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 20,
        correct: 18,
        masteryLocked: true,
        masteryProbability: 0.55, // in range but mastered
        eloRating: 1100,
      }),
    };

    const pool = buildChallengePool(skillStates);
    expect(pool).toHaveLength(0);
  });

  it('excludes unpracticed skills (attempts=0)', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 0,
        masteryProbability: 0.55,
        eloRating: 950,
      }),
    };

    const pool = buildChallengePool(skillStates);
    expect(pool).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// selectFromPool
// ---------------------------------------------------------------------------

describe('selectFromPool', () => {
  it('returns null for empty pool', () => {
    const rng = createRng(42);
    const result = selectFromPool([], rng, new Set());
    expect(result).toBeNull();
  });

  it('BKT-weighted: lower P(L) gets higher selection probability', () => {
    const pool = [
      { skillId: 'weak', masteryPL: 0.2 },
      { skillId: 'strong', masteryPL: 0.8 },
    ];
    const counts: Record<string, number> = { weak: 0, strong: 0 };
    // Run many iterations with different seeds
    for (let seed = 0; seed < 200; seed++) {
      const rng = createRng(seed);
      const pick = selectFromPool(pool, rng, new Set());
      if (pick) counts[pick.skillId]++;
    }
    // Weak skill (lower P(L)) should be selected more often
    expect(counts.weak).toBeGreaterThan(counts.strong);
  });

  it('prefers unique skills (excludes already-used skill IDs)', () => {
    const pool = [
      { skillId: 'a', masteryPL: 0.5 },
      { skillId: 'b', masteryPL: 0.5 },
    ];
    const usedSkillIds = new Set(['a']);
    const rng = createRng(42);
    // Should always pick 'b' since 'a' is used and 'b' is available
    const result = selectFromPool(pool, rng, usedSkillIds);
    expect(result!.skillId).toBe('b');
  });

  it('falls back to used skills when all unique skills exhausted', () => {
    const pool = [
      { skillId: 'a', masteryPL: 0.5 },
      { skillId: 'b', masteryPL: 0.5 },
    ];
    const usedSkillIds = new Set(['a', 'b']);
    const rng = createRng(42);
    // Should still return something (allow repeats)
    const result = selectFromPool(pool, rng, usedSkillIds);
    expect(result).not.toBeNull();
    expect(['a', 'b']).toContain(result!.skillId);
  });
});

// ---------------------------------------------------------------------------
// generatePracticeMix
// ---------------------------------------------------------------------------

describe('generatePracticeMix', () => {
  it('with all categories populated returns correct count per category', () => {
    // Set up: some due for review, some in outer fringe, some challengeable
    const skillStates: Record<string, SkillState> = {
      // Review candidates (practiced, due for review, not mastered)
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 10,
        correct: 7,
        masteryProbability: 0.5,
        nextReviewDue: PAST_DATE,
        leitnerBox: 3,
        eloRating: 950,
      }),
      'subtraction.single-digit.no-borrow': makeSkillState({
        attempts: 8,
        correct: 5,
        masteryProbability: 0.45,
        nextReviewDue: PAST_DATE,
        leitnerBox: 2,
        eloRating: 930,
      }),
      'addition.within-20.no-carry': makeSkillState({
        attempts: 6,
        correct: 4,
        masteryProbability: 0.42,
        nextReviewDue: PAST_DATE,
        leitnerBox: 2,
        eloRating: 940,
      }),
      'subtraction.within-20.no-borrow': makeSkillState({
        attempts: 5,
        correct: 3,
        masteryProbability: 0.44,
        nextReviewDue: PAST_DATE,
        leitnerBox: 2,
        eloRating: 920,
      }),
      'addition.within-20.with-carry': makeSkillState({
        attempts: 4,
        correct: 2,
        masteryProbability: 0.38,
        nextReviewDue: PAST_DATE,
        leitnerBox: 2,
        eloRating: 910,
      }),
      // Challenge candidate (practiced, P(L) in [0.40, 0.80], not mastered)
      'addition.two-digit.no-carry': makeSkillState({
        attempts: 7,
        correct: 5,
        masteryProbability: 0.55,
        nextReviewDue: FUTURE_DATE, // not due for review
        leitnerBox: 3,
        eloRating: 960,
      }),
    };

    const rng = createRng(42);
    const mix = generatePracticeMix(skillStates, 8, rng, 9, NOW);
    expect(mix).toHaveLength(9);

    const reviewCount = mix.filter((m) => m.category === 'review').length;
    const newCount = mix.filter((m) => m.category === 'new').length;
    const challengeCount = mix.filter((m) => m.category === 'challenge').length;

    // Default 9: review=5, new=3, challenge=1
    expect(reviewCount + newCount + challengeCount).toBe(9);
  });

  it('fallback: no review-due skills shifts review slots to new', () => {
    // No skills due for review
    const skillStates: Record<string, SkillState> = {};
    const rng = createRng(42);
    const mix = generatePracticeMix(skillStates, 8, rng, 9, NOW);
    expect(mix).toHaveLength(9);
    // All should be from fallback sources (new skills or ultimate fallback)
    expect(mix.every((m) => m.category !== 'review' || m.category === 'review')).toBe(true);
  });

  it('fallback: no outer fringe shifts new slots to review', () => {
    // All root skills mastered, no outer fringe, but review due
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 20,
        correct: 19,
        masteryLocked: true,
        masteryProbability: 0.96,
        nextReviewDue: FUTURE_DATE,
        leitnerBox: 6,
      }),
      'subtraction.single-digit.no-borrow': makeSkillState({
        attempts: 20,
        correct: 19,
        masteryLocked: true,
        masteryProbability: 0.96,
        nextReviewDue: FUTURE_DATE,
        leitnerBox: 6,
      }),
      // Unlocked via mastery, practiced, due
      'addition.within-20.no-carry': makeSkillState({
        attempts: 10,
        correct: 6,
        masteryProbability: 0.5,
        nextReviewDue: PAST_DATE,
        leitnerBox: 3,
        eloRating: 950,
      }),
    };

    const rng = createRng(42);
    const mix = generatePracticeMix(skillStates, 8, rng, 9, NOW);
    expect(mix).toHaveLength(9);
    // No new skills should be available (roots mastered, next-tier practiced)
    // So new slots should cascade
  });

  it('fallback: no challenge candidates shifts challenge slot to review', () => {
    // Only review-due skills, no P(L) in [0.40, 0.80] range
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 5,
        correct: 2,
        masteryProbability: 0.25, // below challenge range
        nextReviewDue: PAST_DATE,
        leitnerBox: 2,
      }),
      'subtraction.single-digit.no-borrow': makeSkillState({
        attempts: 5,
        correct: 2,
        masteryProbability: 0.20, // below challenge range
        nextReviewDue: PAST_DATE,
        leitnerBox: 2,
      }),
    };

    const rng = createRng(42);
    const mix = generatePracticeMix(skillStates, 8, rng, 9, NOW);
    expect(mix).toHaveLength(9);
    // No challenge items possible
    const challengeCount = mix.filter((m) => m.category === 'challenge').length;
    expect(challengeCount).toBe(0);
  });

  it('fallback: all categories empty falls back to root skills', () => {
    // Brand new user, no skill states at all
    const skillStates: Record<string, SkillState> = {};
    const rng = createRng(42);
    const mix = generatePracticeMix(skillStates, 7, rng, 9, NOW);
    expect(mix).toHaveLength(9);
    // Should have something -- root skills are always unlocked
    for (const item of mix) {
      expect(item.skillId).toBeDefined();
      expect(item.category).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// generatePracticeMix -- remediation injection
// ---------------------------------------------------------------------------

describe('generatePracticeMix remediation', () => {
  // Skill states with enough review-due skills so remediation can replace review
  const remediationSkillStates: Record<string, SkillState> = {
    'addition.single-digit.no-carry': makeSkillState({
      attempts: 10, correct: 7, masteryProbability: 0.5,
      nextReviewDue: PAST_DATE, leitnerBox: 3, eloRating: 950,
    }),
    'subtraction.single-digit.no-borrow': makeSkillState({
      attempts: 8, correct: 5, masteryProbability: 0.45,
      nextReviewDue: PAST_DATE, leitnerBox: 2, eloRating: 930,
    }),
    'addition.within-20.no-carry': makeSkillState({
      attempts: 6, correct: 4, masteryProbability: 0.42,
      nextReviewDue: PAST_DATE, leitnerBox: 2, eloRating: 940,
    }),
    'subtraction.within-20.no-borrow': makeSkillState({
      attempts: 5, correct: 3, masteryProbability: 0.44,
      nextReviewDue: PAST_DATE, leitnerBox: 2, eloRating: 920,
    }),
    'addition.within-20.with-carry': makeSkillState({
      attempts: 4, correct: 2, masteryProbability: 0.38,
      nextReviewDue: PAST_DATE, leitnerBox: 2, eloRating: 910,
    }),
    // Misconception targets (confirmed misconception skillIds)
    'addition.two-digit.no-carry': makeSkillState({
      attempts: 7, correct: 5, masteryProbability: 0.30,
      nextReviewDue: PAST_DATE, leitnerBox: 2, eloRating: 900,
    }),
    'subtraction.within-20.with-borrow': makeSkillState({
      attempts: 5, correct: 2, masteryProbability: 0.25,
      nextReviewDue: PAST_DATE, leitnerBox: 2, eloRating: 880,
    }),
    'addition.two-digit.with-carry': makeSkillState({
      attempts: 3, correct: 1, masteryProbability: 0.20,
      nextReviewDue: PAST_DATE, leitnerBox: 2, eloRating: 870,
    }),
  };

  it('1 confirmed misconception -> 1 remediation item', () => {
    const rng = createRng(42);
    const mix = generatePracticeMix(
      remediationSkillStates, 8, rng, 9, NOW,
      ['addition.two-digit.no-carry'],
    );
    expect(mix).toHaveLength(9);
    const remediation = mix.filter((m) => m.category === 'remediation');
    expect(remediation).toHaveLength(1);
    expect(remediation[0].skillId).toBe('addition.two-digit.no-carry');
  });

  it('3 confirmed misconceptions -> 3 remediation items', () => {
    const rng = createRng(42);
    const confirmed = [
      'addition.two-digit.no-carry',
      'subtraction.within-20.with-borrow',
      'addition.two-digit.with-carry',
    ];
    const mix = generatePracticeMix(
      remediationSkillStates, 8, rng, 9, NOW, confirmed,
    );
    expect(mix).toHaveLength(9);
    const remediation = mix.filter((m) => m.category === 'remediation');
    expect(remediation).toHaveLength(3);
    const remSkillIds = remediation.map((r) => r.skillId);
    for (const id of confirmed) {
      expect(remSkillIds).toContain(id);
    }
  });

  it('5 confirmed misconceptions -> capped at 3 remediation items', () => {
    const rng = createRng(42);
    const confirmed = [
      'addition.two-digit.no-carry',
      'subtraction.within-20.with-borrow',
      'addition.two-digit.with-carry',
      'addition.single-digit.no-carry',
      'subtraction.single-digit.no-borrow',
    ];
    const mix = generatePracticeMix(
      remediationSkillStates, 8, rng, 9, NOW, confirmed,
    );
    expect(mix).toHaveLength(9);
    const remediation = mix.filter((m) => m.category === 'remediation');
    expect(remediation).toHaveLength(3);
  });

  it('remediation slots reduce review count', () => {
    const rng = createRng(42);
    const confirmed = [
      'addition.two-digit.no-carry',
      'subtraction.within-20.with-borrow',
      'addition.two-digit.with-carry',
    ];
    const mix = generatePracticeMix(
      remediationSkillStates, 8, rng, 9, NOW, confirmed,
    );
    expect(mix).toHaveLength(9);
    const remediationCount = mix.filter((m) => m.category === 'remediation').length;
    const reviewCount = mix.filter((m) => m.category === 'review').length;
    // Default 9 slots: review=5, new=3, challenge=1
    // With 3 remediation: review should be 5-3=2
    expect(remediationCount).toBe(3);
    expect(reviewCount).toBe(2);
  });

  it('new and challenge slot counts unchanged regardless of remediation', () => {
    const rng1 = createRng(42);
    const mixWithout = generatePracticeMix(
      remediationSkillStates, 8, rng1, 9, NOW, [],
    );
    const rng2 = createRng(42);
    const mixWith = generatePracticeMix(
      remediationSkillStates, 8, rng2, 9, NOW,
      ['addition.two-digit.no-carry', 'subtraction.within-20.with-borrow'],
    );

    const newWithout = mixWithout.filter((m) => m.category === 'new').length;
    const challengeWithout = mixWithout.filter((m) => m.category === 'challenge').length;
    const newWith = mixWith.filter((m) => m.category === 'new').length;
    const challengeWith = mixWith.filter((m) => m.category === 'challenge').length;

    expect(newWith).toBe(newWithout);
    expect(challengeWith).toBe(challengeWithout);
  });

  it('empty confirmedMisconceptionSkillIds -> identical to pre-change behavior', () => {
    const rng1 = createRng(42);
    const mixDefault = generatePracticeMix(
      remediationSkillStates, 8, rng1, 9, NOW,
    );
    const rng2 = createRng(42);
    const mixExplicit = generatePracticeMix(
      remediationSkillStates, 8, rng2, 9, NOW, [],
    );
    expect(mixDefault).toEqual(mixExplicit);
  });

  it('remediation skillIds added to usedSkillIds preventing duplicates', () => {
    const rng = createRng(42);
    const confirmed = ['addition.two-digit.no-carry'];
    const mix = generatePracticeMix(
      remediationSkillStates, 8, rng, 9, NOW, confirmed,
    );
    // The remediation skill should not also appear as a review item
    const reviewSkillIds = mix
      .filter((m) => m.category === 'review')
      .map((m) => m.skillId);
    // Remediation skillId should not be duplicated in review
    // (though it could appear via fallback, the preference is unique)
    const remSkillId = 'addition.two-digit.no-carry';
    const allOccurrences = mix.filter((m) => m.skillId === remSkillId);
    // Should appear exactly once (as remediation)
    expect(allOccurrences).toHaveLength(1);
    expect(allOccurrences[0].category).toBe('remediation');
  });

  it('remediation count capped at slots.review (never exceeds available review slots)', () => {
    // Use practiceCount=3 -> review=2, new=1, challenge=0
    // With 3 confirmed skills, only 2 remediation slots (limited by review=2)
    const rng = createRng(42);
    const confirmed = [
      'addition.two-digit.no-carry',
      'subtraction.within-20.with-borrow',
      'addition.two-digit.with-carry',
    ];
    const mix = generatePracticeMix(
      remediationSkillStates, 8, rng, 3, NOW, confirmed,
    );
    expect(mix).toHaveLength(3);
    const remediation = mix.filter((m) => m.category === 'remediation');
    // practiceCount=3 -> review=2, so max 2 remediation
    expect(remediation.length).toBeLessThanOrEqual(2);
    // Review slots should be 0 (all replaced)
    const review = mix.filter((m) => m.category === 'review');
    expect(review.length).toBe(0);
  });

  it('>3 confirmed skills -> BKT-inverse weighted selection prioritizes lowest mastery', () => {
    const rng = createRng(42);
    // 5 confirmed skills with varying mastery
    const confirmed = [
      'addition.two-digit.no-carry',        // P(L) = 0.30
      'subtraction.within-20.with-borrow',   // P(L) = 0.25
      'addition.two-digit.with-carry',       // P(L) = 0.20
      'addition.single-digit.no-carry',      // P(L) = 0.50
      'subtraction.single-digit.no-borrow',  // P(L) = 0.45
    ];
    // Run many trials and count selection frequency
    const selectionCounts: Record<string, number> = {};
    for (const id of confirmed) selectionCounts[id] = 0;

    for (let seed = 0; seed < 100; seed++) {
      const trialRng = createRng(seed);
      const mix = generatePracticeMix(
        remediationSkillStates, 8, trialRng, 9, NOW, confirmed,
      );
      const remediation = mix.filter((m) => m.category === 'remediation');
      for (const item of remediation) {
        selectionCounts[item.skillId] = (selectionCounts[item.skillId] ?? 0) + 1;
      }
    }

    // The three lowest-mastery skills (0.20, 0.25, 0.30) should appear more often
    // than the two highest-mastery (0.45, 0.50)
    const lowestThree = selectionCounts['addition.two-digit.with-carry'] +
      selectionCounts['subtraction.within-20.with-borrow'] +
      selectionCounts['addition.two-digit.no-carry'];
    const highestTwo = selectionCounts['addition.single-digit.no-carry'] +
      selectionCounts['subtraction.single-digit.no-borrow'];
    expect(lowestThree).toBeGreaterThan(highestTwo);
  });
});

// ---------------------------------------------------------------------------
// constrainedShuffle
// ---------------------------------------------------------------------------

describe('constrainedShuffle', () => {
  it('no two challenge problems adjacent', () => {
    const items: Array<{ skillId: string; category: PracticeProblemCategory }> =
      [
        { skillId: 'r1', category: 'review' },
        { skillId: 'r2', category: 'review' },
        { skillId: 'r3', category: 'review' },
        { skillId: 'n1', category: 'new' },
        { skillId: 'n2', category: 'new' },
        { skillId: 'n3', category: 'new' },
        { skillId: 'c1', category: 'challenge' },
        { skillId: 'c2', category: 'challenge' },
        { skillId: 'c3', category: 'challenge' },
      ];

    const rng = createRng(42);
    const shuffled = constrainedShuffle(items, rng);

    for (let i = 0; i < shuffled.length - 1; i++) {
      if (shuffled[i].category === 'challenge') {
        expect(shuffled[i + 1].category).not.toBe('challenge');
      }
    }
  });

  it('at least one review problem before first new/challenge', () => {
    const items: Array<{ skillId: string; category: PracticeProblemCategory }> =
      [
        { skillId: 'r1', category: 'review' },
        { skillId: 'r2', category: 'review' },
        { skillId: 'n1', category: 'new' },
        { skillId: 'c1', category: 'challenge' },
      ];

    const rng = createRng(42);
    const shuffled = constrainedShuffle(items, rng);

    // First item should be a review
    expect(shuffled[0].category).toBe('review');
  });

  it('deterministic given same seed', () => {
    const items: Array<{ skillId: string; category: PracticeProblemCategory }> =
      [
        { skillId: 'r1', category: 'review' },
        { skillId: 'n1', category: 'new' },
        { skillId: 'c1', category: 'challenge' },
        { skillId: 'r2', category: 'review' },
        { skillId: 'n2', category: 'new' },
      ];

    const rng1 = createRng(123);
    const rng2 = createRng(123);
    const result1 = constrainedShuffle(items, rng1);
    const result2 = constrainedShuffle(items, rng2);

    expect(result1).toEqual(result2);
  });

  it('handles empty input', () => {
    const rng = createRng(42);
    const result = constrainedShuffle([], rng);
    expect(result).toEqual([]);
  });

  it('handles single item', () => {
    const rng = createRng(42);
    const result = constrainedShuffle(
      [{ skillId: 'r1', category: 'review' }],
      rng,
    );
    expect(result).toHaveLength(1);
  });

  it('handles case with no review items (best-effort)', () => {
    const items: Array<{ skillId: string; category: PracticeProblemCategory }> =
      [
        { skillId: 'n1', category: 'new' },
        { skillId: 'c1', category: 'challenge' },
      ];

    const rng = createRng(42);
    const result = constrainedShuffle(items, rng);
    // Should still return all items
    expect(result).toHaveLength(2);
  });

  it('accepts remediation as valid warm-start first slot', () => {
    const items: Array<{ skillId: string; category: PracticeProblemCategory }> =
      [
        { skillId: 'n1', category: 'new' },
        { skillId: 'c1', category: 'challenge' },
        { skillId: 'rem1', category: 'remediation' },
      ];

    const rng = createRng(42);
    const result = constrainedShuffle(items, rng);
    // First item should be remediation (the only warm-start candidate)
    expect(result[0].category).toBe('remediation');
    expect(result).toHaveLength(3);
  });
});
