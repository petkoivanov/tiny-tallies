import {
  createFrustrationState,
  updateFrustrationState,
  shouldTriggerGuard,
  FRUSTRATION_THRESHOLD,
} from '@/services/adaptive/frustrationGuard';

describe('frustrationGuard', () => {
  const SKILL_A = 'addition.single-digit.no-carry';
  const SKILL_B = 'subtraction.single-digit.no-borrow';

  it('creates empty state', () => {
    const state = createFrustrationState();
    expect(state.consecutiveWrong).toEqual({});
  });

  it('increments on wrong answer', () => {
    const initial = createFrustrationState();
    const updated = updateFrustrationState(initial, SKILL_A, false);
    expect(updated.consecutiveWrong[SKILL_A]).toBe(1);
  });

  it('increments to 3 after 3 wrong answers', () => {
    let state = createFrustrationState();
    state = updateFrustrationState(state, SKILL_A, false);
    state = updateFrustrationState(state, SKILL_A, false);
    state = updateFrustrationState(state, SKILL_A, false);
    expect(state.consecutiveWrong[SKILL_A]).toBe(3);
  });

  it('resets on correct answer', () => {
    let state = createFrustrationState();
    state = updateFrustrationState(state, SKILL_A, false);
    state = updateFrustrationState(state, SKILL_A, false);
    state = updateFrustrationState(state, SKILL_A, true);
    expect(state.consecutiveWrong[SKILL_A]).toBeUndefined();
  });

  it('tracks per skill independently', () => {
    let state = createFrustrationState();
    state = updateFrustrationState(state, SKILL_A, false);
    state = updateFrustrationState(state, SKILL_A, false);
    state = updateFrustrationState(state, SKILL_B, false);
    expect(state.consecutiveWrong[SKILL_A]).toBe(2);
    expect(state.consecutiveWrong[SKILL_B]).toBe(1);
  });

  it('triggers at exactly 3 wrong (threshold boundary)', () => {
    let state = createFrustrationState();
    state = updateFrustrationState(state, SKILL_A, false);
    state = updateFrustrationState(state, SKILL_A, false);
    expect(shouldTriggerGuard(state, SKILL_A)).toBe(false);

    state = updateFrustrationState(state, SKILL_A, false);
    expect(shouldTriggerGuard(state, SKILL_A)).toBe(true);
    expect(FRUSTRATION_THRESHOLD).toBe(3);
  });

  it('does not trigger for unknown skill', () => {
    const state = createFrustrationState();
    expect(shouldTriggerGuard(state, 'nonexistent.skill')).toBe(false);
  });

  it('does not mutate input state (immutable updates)', () => {
    const original = createFrustrationState();
    const originalCopy = JSON.parse(JSON.stringify(original));

    updateFrustrationState(original, SKILL_A, false);
    expect(original).toEqual(originalCopy);

    // Also verify with a state that has existing data
    const withData = updateFrustrationState(
      createFrustrationState(),
      SKILL_A,
      false,
    );
    const withDataCopy = JSON.parse(JSON.stringify(withData));

    updateFrustrationState(withData, SKILL_A, true);
    expect(withData).toEqual(withDataCopy);
  });
});
