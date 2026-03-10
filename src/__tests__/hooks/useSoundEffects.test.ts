import { renderHook } from '@testing-library/react-native';

// Mock store state
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

// Mock sound service
const mockSetSoundEnabled = jest.fn();
const mockPlayCorrect = jest.fn();
const mockPlayIncorrect = jest.fn();
const mockPlaySessionComplete = jest.fn();
jest.mock('@/services/sound', () => ({
  setSoundEnabled: (...args: unknown[]) => mockSetSoundEnabled(...args),
  playCorrect: (...args: unknown[]) => mockPlayCorrect(...args),
  playIncorrect: (...args: unknown[]) => mockPlayIncorrect(...args),
  playSessionComplete: (...args: unknown[]) => mockPlaySessionComplete(...args),
}));

import { useSoundSync, useSessionSounds } from '@/hooks/useSoundEffects';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    soundEnabled: true,
    ...overrides,
  };
}

describe('useSoundSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
  });

  it('syncs soundEnabled=true to service', () => {
    renderHook(() => useSoundSync());
    expect(mockSetSoundEnabled).toHaveBeenCalledWith(true);
  });

  it('syncs soundEnabled=false to service', () => {
    setMockState({ soundEnabled: false });
    renderHook(() => useSoundSync());
    expect(mockSetSoundEnabled).toHaveBeenCalledWith(false);
  });
});

describe('useSessionSounds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('plays correct sound on correct feedback', () => {
    renderHook(() =>
      useSessionSounds({ visible: true, correct: true }, false),
    );
    expect(mockPlayCorrect).toHaveBeenCalledTimes(1);
    expect(mockPlayIncorrect).not.toHaveBeenCalled();
  });

  it('plays incorrect sound on wrong feedback', () => {
    renderHook(() =>
      useSessionSounds({ visible: true, correct: false }, false),
    );
    expect(mockPlayIncorrect).toHaveBeenCalledTimes(1);
    expect(mockPlayCorrect).not.toHaveBeenCalled();
  });

  it('does not play sound when feedback is null', () => {
    renderHook(() => useSessionSounds(null, false));
    expect(mockPlayCorrect).not.toHaveBeenCalled();
    expect(mockPlayIncorrect).not.toHaveBeenCalled();
  });

  it('plays session complete sound when isComplete becomes true', () => {
    renderHook(() => useSessionSounds(null, true));
    expect(mockPlaySessionComplete).toHaveBeenCalledTimes(1);
  });

  it('does not play session complete when not complete', () => {
    renderHook(() => useSessionSounds(null, false));
    expect(mockPlaySessionComplete).not.toHaveBeenCalled();
  });
});
