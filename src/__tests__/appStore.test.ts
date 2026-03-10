import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore, STORE_VERSION } from '@/store/appStore';
import { migrateStore } from '@/store/migrations';
import { AVATARS, DEFAULT_AVATAR_ID } from '@/store/constants/avatars';
import {
  DEFAULT_ELO,
  getOrCreateSkillState,
  isProfileComplete,
} from '@/store/helpers/skillStateHelpers';

describe('appStore composition', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useAppStore.setState(useAppStore.getInitialState(), true);
  });

  it('initializes with all four domain slices', () => {
    const state = useAppStore.getState();

    // childProfileSlice
    expect(state.childName).toBeNull();
    expect(state.childAge).toBeNull();
    expect(state.childGrade).toBeNull();
    expect(state.avatarId).toBeNull();

    // skillStatesSlice
    expect(state.skillStates).toEqual({});

    // sessionStateSlice
    expect(state.isSessionActive).toBe(false);
    expect(state.currentProblemIndex).toBe(0);
    expect(state.sessionScore).toBe(0);
    expect(state.sessionAnswers).toEqual([]);

    // gamificationSlice
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
    expect(state.weeklyStreak).toBe(0);
    expect(state.lastSessionDate).toBeNull();
  });

  it('setChildProfile merges partial profile', () => {
    useAppStore.getState().setChildProfile({
      childName: 'Luna',
      childAge: 7,
    });

    const state = useAppStore.getState();
    expect(state.childName).toBe('Luna');
    expect(state.childAge).toBe(7);
    expect(state.childGrade).toBeNull();
    expect(state.avatarId).toBeNull();
  });

  it('startSession sets isSessionActive true and resets session fields', () => {
    // Set some state first to verify reset
    useAppStore.setState({
      sessionScore: 5,
      currentProblemIndex: 3,
      sessionAnswers: [
        { problemId: 'p1', answer: 4, correct: true },
      ],
    });

    useAppStore.getState().startSession();

    const state = useAppStore.getState();
    expect(state.isSessionActive).toBe(true);
    expect(state.currentProblemIndex).toBe(0);
    expect(state.sessionScore).toBe(0);
    expect(state.sessionXpEarned).toBe(0);
    expect(state.sessionAnswers).toEqual([]);
  });

  it('addXp increments xp value', () => {
    expect(useAppStore.getState().xp).toBe(0);

    useAppStore.getState().addXp(25);
    expect(useAppStore.getState().xp).toBe(25);

    useAppStore.getState().addXp(10);
    expect(useAppStore.getState().xp).toBe(35);
  });

  it('STORE_VERSION equals 17', () => {
    expect(STORE_VERSION).toBe(17);
  });
});

describe('avatar constants', () => {
  it('AVATARS has exactly 14 entries with required fields', () => {
    expect(AVATARS).toHaveLength(14);
    for (const avatar of AVATARS) {
      expect(avatar).toHaveProperty('id');
      expect(avatar).toHaveProperty('label');
      expect(avatar).toHaveProperty('emoji');
      expect(typeof avatar.id).toBe('string');
      expect(typeof avatar.label).toBe('string');
      expect(typeof avatar.emoji).toBe('string');
    }
  });

  it('DEFAULT_AVATAR_ID is fox', () => {
    expect(DEFAULT_AVATAR_ID).toBe('fox');
  });
});

describe('skill state helpers', () => {
  it('DEFAULT_ELO is 1000', () => {
    expect(DEFAULT_ELO).toBe(1000);
  });

  it('getOrCreateSkillState returns existing state when skillId exists', () => {
    const existing = { eloRating: 1200, attempts: 10, correct: 8, masteryProbability: 0.1, consecutiveWrong: 0, masteryLocked: false, leitnerBox: 1 as const, nextReviewDue: null, consecutiveCorrectInBox6: 0, cpaLevel: 'concrete' as const };
    const states = { 'add.single': existing };
    const result = getOrCreateSkillState(states, 'add.single');
    expect(result).toEqual(existing);
  });

  it('getOrCreateSkillState returns default when skillId not found', () => {
    const result = getOrCreateSkillState({}, 'add.single');
    expect(result).toEqual({ eloRating: 1000, attempts: 0, correct: 0, masteryProbability: 0.1, consecutiveWrong: 0, masteryLocked: false, leitnerBox: 1, nextReviewDue: null, consecutiveCorrectInBox6: 0, cpaLevel: 'concrete' });
  });

  it('getOrCreateSkillState accepts optional defaultElo parameter', () => {
    const result = getOrCreateSkillState({}, 'add.single', 800);
    expect(result).toEqual({ eloRating: 800, attempts: 0, correct: 0, masteryProbability: 0.1, consecutiveWrong: 0, masteryLocked: false, leitnerBox: 1, nextReviewDue: null, consecutiveCorrectInBox6: 0, cpaLevel: 'concrete' });
  });

  it('isProfileComplete returns false when any field is null', () => {
    expect(
      isProfileComplete({
        childName: 'Luna',
        childAge: 7,
        childGrade: 2,
        avatarId: null,
      }),
    ).toBe(false);

    expect(
      isProfileComplete({
        childName: null,
        childAge: 7,
        childGrade: 2,
        avatarId: 'fox',
      }),
    ).toBe(false);

    expect(
      isProfileComplete({
        childName: 'Luna',
        childAge: null,
        childGrade: 2,
        avatarId: 'fox',
      }),
    ).toBe(false);

    expect(
      isProfileComplete({
        childName: 'Luna',
        childAge: 7,
        childGrade: null,
        avatarId: 'fox',
      }),
    ).toBe(false);
  });

  it('isProfileComplete returns true when all fields are set', () => {
    expect(
      isProfileComplete({
        childName: 'Luna',
        childAge: 7,
        childGrade: 2,
        avatarId: 'fox',
      }),
    ).toBe(true);
  });
});

describe('enriched slice behaviors', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useAppStore.setState(useAppStore.getInitialState(), true);
  });

  it('updateSkillState with non-existent skillId creates entry with DEFAULT_ELO', () => {
    useAppStore.getState().updateSkillState('add.single', { attempts: 1 });

    const state = useAppStore.getState();
    expect(state.skillStates['add.single']).toEqual({
      eloRating: 1000,
      attempts: 1,
      correct: 0,
      masteryProbability: 0.1,
      consecutiveWrong: 0,
      masteryLocked: false,
      leitnerBox: 1,
      nextReviewDue: null,
      consecutiveCorrectInBox6: 0,
      cpaLevel: 'concrete',
    });
  });

  it('updateSkillState with existing skillId preserves non-updated fields', () => {
    useAppStore.getState().updateSkillState('add.single', {
      eloRating: 1050,
      attempts: 5,
      correct: 4,
    });

    useAppStore.getState().updateSkillState('add.single', { attempts: 6 });

    const state = useAppStore.getState();
    expect(state.skillStates['add.single']).toEqual({
      eloRating: 1050,
      attempts: 6,
      correct: 4,
      masteryProbability: 0.1,
      consecutiveWrong: 0,
      masteryLocked: false,
      leitnerBox: 1,
      nextReviewDue: null,
      consecutiveCorrectInBox6: 0,
      cpaLevel: 'concrete',
    });
  });

  it('startSession sets sessionStartTime to a number', () => {
    useAppStore.getState().startSession();

    const state = useAppStore.getState();
    expect(typeof state.sessionStartTime).toBe('number');
    expect(state.sessionStartTime).toBeGreaterThan(0);
  });

  it('endSession resets sessionStartTime to null', () => {
    useAppStore.getState().startSession();
    expect(useAppStore.getState().sessionStartTime).not.toBeNull();

    useAppStore.getState().endSession();
    expect(useAppStore.getState().sessionStartTime).toBeNull();
  });

  it('recordAnswer with optional metadata fields preserves them', () => {
    useAppStore.getState().startSession();

    useAppStore.getState().recordAnswer({
      problemId: 'p1',
      answer: 7,
      correct: false,
      timeMs: 3200,
      format: 'mc',
      bugId: 'add_carry_ignore',
    });

    const state = useAppStore.getState();
    expect(state.sessionAnswers).toHaveLength(1);
    expect(state.sessionAnswers[0]).toEqual({
      problemId: 'p1',
      answer: 7,
      correct: false,
      timeMs: 3200,
      format: 'mc',
      bugId: 'add_carry_ignore',
    });
  });

  it('sessionStartTime initializes as null', () => {
    const state = useAppStore.getState();
    expect(state.sessionStartTime).toBeNull();
  });
});

describe('appStore persistence', () => {
  const TEST_CHILD_ID = 'test-child-001';

  beforeEach(async () => {
    await AsyncStorage.clear();
    useAppStore.setState(useAppStore.getInitialState(), true);
    // Set up an active child directly so partialize has a target for dehydration
    useAppStore.setState({
      activeChildId: TEST_CHILD_ID,
      children: {},
    });
  });

  it('persists child profile to AsyncStorage', async () => {
    useAppStore.getState().setChildProfile({
      childName: 'Luna',
      childAge: 7,
      childGrade: 2,
      avatarId: 'owl',
    });

    // Flush async persist write
    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = await AsyncStorage.getItem('tiny-tallies-store');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    // After Plan 02 restructure, child data persists inside children map
    const child = parsed.state.children[TEST_CHILD_ID];
    expect(child).toBeDefined();
    expect(child.childName).toBe('Luna');
    expect(child.childAge).toBe(7);
    expect(child.childGrade).toBe(2);
    expect(child.avatarId).toBe('owl');
  });

  it('persists skill states to AsyncStorage', async () => {
    useAppStore
      .getState()
      .updateSkillState('addition.single-digit.no-carry', {
        eloRating: 1050,
        attempts: 5,
        correct: 4,
      });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = await AsyncStorage.getItem('tiny-tallies-store');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    // After Plan 02 restructure, skill states persist inside children map
    const child = parsed.state.children[TEST_CHILD_ID];
    expect(child).toBeDefined();
    const skill =
      child.skillStates['addition.single-digit.no-carry'];
    expect(skill).toBeDefined();
    expect(skill.eloRating).toBe(1050);
    expect(skill.attempts).toBe(5);
    expect(skill.correct).toBe(4);
  });

  it('persists gamification data to AsyncStorage', async () => {
    useAppStore.getState().addXp(50);
    useAppStore.getState().setLevel(3);
    useAppStore.getState().incrementStreak();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = await AsyncStorage.getItem('tiny-tallies-store');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    // After Plan 02 restructure, gamification data persists inside children map
    const child = parsed.state.children[TEST_CHILD_ID];
    expect(child).toBeDefined();
    expect(child.xp).toBe(50);
    expect(child.level).toBe(3);
    expect(child.weeklyStreak).toBe(1);
  });

  it('does NOT persist session state', async () => {
    useAppStore.getState().startSession();
    useAppStore.getState().recordAnswer({
      problemId: 'p1',
      answer: 5,
      correct: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = await AsyncStorage.getItem('tiny-tallies-store');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.isSessionActive).toBeUndefined();
    expect(parsed.state.sessionAnswers).toBeUndefined();
    expect(parsed.state.sessionScore).toBeUndefined();
    expect(parsed.state.sessionStartTime).toBeUndefined();
  });

  it('does NOT persist action functions', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = await AsyncStorage.getItem('tiny-tallies-store');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.setChildProfile).toBeUndefined();
    expect(parsed.state.updateSkillState).toBeUndefined();
    expect(parsed.state.startSession).toBeUndefined();
    expect(parsed.state.addXp).toBeUndefined();
  });
});

describe('store migrations', () => {
  it('migrateStore from version 1 fills defaults', () => {
    const result = migrateStore({}, 1);
    expect(result.childName).toBeNull();
    expect(result.childAge).toBeNull();
    expect(result.childGrade).toBeNull();
    expect(result.avatarId).toBeNull();
    expect(result.skillStates).toEqual({});
    expect(result.xp).toBe(0);
    expect(result.level).toBe(1);
    expect(result.weeklyStreak).toBe(0);
    expect(result.lastSessionDate).toBeNull();
  });

  it('migrateStore from version 2 applies v3 and v4 migrations', () => {
    const input = { childName: 'Luna', xp: 100, skillStates: {} };
    const result = migrateStore(input, 2);
    expect(result.childName).toBe('Luna');
    expect(result.xp).toBe(100);
    expect(result.skillStates).toEqual({});
  });

  it('migrateStore handles null persistedState', () => {
    const result = migrateStore(null, 0);
    expect(result.childName).toBeNull();
    expect(result.childAge).toBeNull();
    expect(result.childGrade).toBeNull();
    expect(result.avatarId).toBeNull();
    expect(result.skillStates).toEqual({});
    expect(result.xp).toBe(0);
    expect(result.level).toBe(1);
    expect(result.weeklyStreak).toBe(0);
    expect(result.lastSessionDate).toBeNull();
  });
});
