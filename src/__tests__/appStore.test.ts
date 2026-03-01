import { useAppStore, STORE_VERSION } from '@/store/appStore';

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
