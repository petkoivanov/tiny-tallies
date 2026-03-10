import {
  type ChildData,
  CHILD_DATA_KEYS,
  dehydrateChild,
  hydrateChild,
  DEFAULT_CHILD_DATA,
  createDefaultChildData,
} from '../../store/helpers/childDataHelpers';
import type { AppState } from '../../store/appStore';

// The 19 fields that partialize persists — single source of truth check
const EXPECTED_PARTIALIZE_KEYS = [
  'childName',
  'childAge',
  'childGrade',
  'avatarId',
  'frameId',
  'themeId',
  'tutorConsentGranted',
  'skillStates',
  'xp',
  'level',
  'weeklyStreak',
  'lastSessionDate',
  'exploredManipulatives',
  'misconceptions',
  'earnedBadges',
  'sessionsCompleted',
  'challengeCompletions',
  'challengesCompleted',
  'sessionHistory',
  'placementComplete',
  'placementGrade',
  'placementTheta',
  'lastPlacementDate',
  'lastPracticeDate',
] as const;

/** Minimal mock AppState with per-child data filled in */
function createMockAppState(): AppState {
  return {
    // ChildProfile fields
    childName: 'Alice',
    childAge: 7,
    childGrade: 2,
    avatarId: 'fox',
    frameId: 'circle',
    themeId: 'ocean',
    tutorConsentGranted: true,
    setChildProfile: jest.fn(),
    setTutorConsentGranted: jest.fn(),

    // SkillStates fields
    skillStates: {
      'addition.single-digit.no-carry': {
        eloRating: 1050,
        attempts: 10,
        correct: 8,
        masteryProbability: 0.85,
        consecutiveWrong: 0,
        masteryLocked: false,
        leitnerBox: 3,
        nextReviewDue: '2026-03-10T00:00:00Z',
        consecutiveCorrectInBox6: 0,
        cpaLevel: 'pictorial',
      },
    },
    updateSkillState: jest.fn(),
    resetSkillStates: jest.fn(),

    // Gamification fields
    xp: 250,
    level: 3,
    weeklyStreak: 4,
    lastSessionDate: '2026-03-05',
    sessionsCompleted: 15,
    addXp: jest.fn(),
    setLevel: jest.fn(),
    setLastSessionDate: jest.fn(),
    setWeeklyStreak: jest.fn(),
    incrementStreak: jest.fn(),
    resetStreak: jest.fn(),
    incrementSessionsCompleted: jest.fn(),

    // Sandbox fields
    exploredManipulatives: ['base_ten_blocks', 'number_line'],
    markExplored: jest.fn(),

    // Misconception fields
    misconceptions: {
      'carry-error::addition.two-digit.with-carry': {
        bugTag: 'carry-error',
        skillId: 'addition.two-digit.with-carry',
        occurrenceCount: 2,
        status: 'suspected',
        firstSeen: '2026-03-01T00:00:00Z',
        lastSeen: '2026-03-04T00:00:00Z',
        remediationCorrectCount: 0,
      },
    },
    sessionRecordedKeys: [],
    recordMisconception: jest.fn(),
    recordRemediationCorrect: jest.fn(),
    resetSessionDedup: jest.fn(),

    // Achievement fields
    earnedBadges: {
      'first-session': { earnedAt: '2026-03-01T00:00:00Z' },
    },
    addEarnedBadges: jest.fn(),

    // Challenge fields
    challengeCompletions: {
      '2026-03-05': {
        themeId: 'space-adventure',
        score: 85,
        accuracy: 0.9,
        streak: 5,
        completedAt: '2026-03-05T15:00:00Z',
        problemCount: 10,
      },
    },
    challengesCompleted: 3,
    completeChallenge: jest.fn(),

    // Session history
    sessionHistory: [],
    addSessionHistory: jest.fn(),

    // Session state (ephemeral, not in ChildData)
    sessionActive: false,
    currentSkillId: null,
    currentProblem: null,
    sessionProblems: [],
    sessionCorrect: 0,
    sessionIncorrect: 0,
    startSession: jest.fn(),
    endSession: jest.fn(),
    setCurrentProblem: jest.fn(),
    recordAnswer: jest.fn(),

    // Tutor state (ephemeral, not in ChildData)
    tutorMode: null,
    tutorMessages: [],
    tutorLoading: false,
    setTutorMode: jest.fn(),
    addTutorMessage: jest.fn(),
    setTutorLoading: jest.fn(),
    clearTutorMessages: jest.fn(),
  } as unknown as AppState;
}

describe('CHILD_DATA_KEYS', () => {
  it('contains exactly 24 keys', () => {
    expect(CHILD_DATA_KEYS).toHaveLength(24);
  });

  it('matches the partialize fields from appStore', () => {
    expect([...CHILD_DATA_KEYS].sort()).toEqual(
      [...EXPECTED_PARTIALIZE_KEYS].sort(),
    );
  });
});

describe('dehydrateChild', () => {
  it('extracts all CHILD_DATA_KEYS from AppState into a ChildData snapshot', () => {
    const state = createMockAppState();
    const snapshot = dehydrateChild(state);

    // Should have exactly the 19 keys
    expect(Object.keys(snapshot).sort()).toEqual(
      [...EXPECTED_PARTIALIZE_KEYS].sort(),
    );

    // Spot-check values
    expect(snapshot.childName).toBe('Alice');
    expect(snapshot.childAge).toBe(7);
    expect(snapshot.xp).toBe(250);
    expect(snapshot.level).toBe(3);
    expect(snapshot.skillStates).toEqual(state.skillStates);
    expect(snapshot.misconceptions).toEqual(state.misconceptions);
    expect(snapshot.earnedBadges).toEqual(state.earnedBadges);
  });

  it('does NOT include action functions or ephemeral state', () => {
    const state = createMockAppState();
    const snapshot = dehydrateChild(state);
    const keys = Object.keys(snapshot);

    expect(keys).not.toContain('setChildProfile');
    expect(keys).not.toContain('updateSkillState');
    expect(keys).not.toContain('addXp');
    expect(keys).not.toContain('sessionActive');
    expect(keys).not.toContain('tutorMode');
    expect(keys).not.toContain('sessionRecordedKeys');
  });
});

describe('hydrateChild', () => {
  it('returns a partial state object containing all ChildData fields', () => {
    const state = createMockAppState();
    const snapshot = dehydrateChild(state);
    const partial = hydrateChild(snapshot);

    for (const key of CHILD_DATA_KEYS) {
      expect(partial).toHaveProperty(key);
    }
  });
});

describe('roundtrip: dehydrate then hydrate', () => {
  it('preserves all field values including nested objects', () => {
    const state = createMockAppState();
    const snapshot = dehydrateChild(state);
    const partial = hydrateChild(snapshot);

    // Every ChildData key should match original state
    for (const key of CHILD_DATA_KEYS) {
      expect((partial as Record<string, unknown>)[key]).toEqual(
        (state as unknown as Record<string, unknown>)[key],
      );
    }
  });
});

describe('DEFAULT_CHILD_DATA', () => {
  it('has correct default values', () => {
    expect(DEFAULT_CHILD_DATA.xp).toBe(0);
    expect(DEFAULT_CHILD_DATA.level).toBe(1);
    expect(DEFAULT_CHILD_DATA.themeId).toBe('dark');
    expect(DEFAULT_CHILD_DATA.weeklyStreak).toBe(0);
    expect(DEFAULT_CHILD_DATA.lastSessionDate).toBeNull();
    expect(DEFAULT_CHILD_DATA.sessionsCompleted).toBe(0);
    expect(DEFAULT_CHILD_DATA.challengesCompleted).toBe(0);
    expect(DEFAULT_CHILD_DATA.skillStates).toEqual({});
    expect(DEFAULT_CHILD_DATA.misconceptions).toEqual({});
    expect(DEFAULT_CHILD_DATA.earnedBadges).toEqual({});
    expect(DEFAULT_CHILD_DATA.challengeCompletions).toEqual({});
    expect(DEFAULT_CHILD_DATA.exploredManipulatives).toEqual([]);
    expect(DEFAULT_CHILD_DATA.tutorConsentGranted).toBe(true);
  });
});

describe('createDefaultChildData', () => {
  it('returns correct defaults for given profile info with empty skillStates', () => {
    const data = createDefaultChildData({
      childName: 'Bob',
      childAge: 8,
      childGrade: 3,
      avatarId: 'cat',
    });

    expect(data.childName).toBe('Bob');
    expect(data.childAge).toBe(8);
    expect(data.childGrade).toBe(3);
    expect(data.avatarId).toBe('cat');
    expect(data.xp).toBe(0);
    expect(data.level).toBe(1);
    expect(data.skillStates).toEqual({});
    expect(data.themeId).toBe('dark');
  });

  it('accepts optional skillStates override', () => {
    const preSeeded = {
      'addition.single-digit.no-carry': {
        eloRating: 1100,
        attempts: 5,
        correct: 5,
        masteryProbability: 0.95,
        consecutiveWrong: 0,
        masteryLocked: true,
        leitnerBox: 5 as const,
        nextReviewDue: null,
        consecutiveCorrectInBox6: 0,
        cpaLevel: 'abstract' as const,
      },
    };

    const data = createDefaultChildData({
      childName: 'Carol',
      childAge: 7,
      childGrade: 2,
      avatarId: null,
      skillStates: preSeeded,
    });

    expect(data.skillStates).toEqual(preSeeded);
  });
});
