import { useAppStore, STORE_VERSION } from '@/store/appStore';
import { AVATARS, DEFAULT_AVATAR_ID } from '@/store/constants/avatars';
import {
  DEFAULT_ELO,
  getOrCreateSkillState,
  isProfileComplete,
} from '@/store/helpers/skillStateHelpers';

describe('appStore composition', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState());
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

  it('STORE_VERSION equals 1', () => {
    expect(STORE_VERSION).toBe(1);
  });
});

describe('avatar constants', () => {
  it('AVATARS has exactly 8 entries with required fields', () => {
    expect(AVATARS).toHaveLength(8);
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
    const existing = { eloRating: 1200, attempts: 10, correct: 8 };
    const states = { 'add.single': existing };
    const result = getOrCreateSkillState(states, 'add.single');
    expect(result).toEqual(existing);
  });

  it('getOrCreateSkillState returns default when skillId not found', () => {
    const result = getOrCreateSkillState({}, 'add.single');
    expect(result).toEqual({ eloRating: 1000, attempts: 0, correct: 0 });
  });

  it('getOrCreateSkillState accepts optional defaultElo parameter', () => {
    const result = getOrCreateSkillState({}, 'add.single', 800);
    expect(result).toEqual({ eloRating: 800, attempts: 0, correct: 0 });
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
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState());
  });

  it('updateSkillState with non-existent skillId creates entry with DEFAULT_ELO', () => {
    useAppStore.getState().updateSkillState('add.single', { attempts: 1 });

    const state = useAppStore.getState();
    expect(state.skillStates['add.single']).toEqual({
      eloRating: 1000,
      attempts: 1,
      correct: 0,
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
