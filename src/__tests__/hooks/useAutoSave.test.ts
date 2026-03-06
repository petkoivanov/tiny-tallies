import { renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { useAutoSave } from '@/hooks/useAutoSave';

// Mock the store
const mockSaveActiveChild = jest.fn();
jest.mock('@/store/appStore', () => ({
  useAppStore: {
    getState: () => ({
      saveActiveChild: mockSaveActiveChild,
    }),
  },
}));

// Capture the AppState listener
let appStateCallback: ((state: AppStateStatus) => void) | null = null;
const mockRemove = jest.fn();

jest.spyOn(AppState, 'addEventListener').mockImplementation(
  (_type: string, listener: (state: AppStateStatus) => void) => {
    appStateCallback = listener;
    return { remove: mockRemove } as ReturnType<typeof AppState.addEventListener>;
  },
);

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appStateCallback = null;
    // Reset AppState.currentState to 'active' for each test
    Object.defineProperty(AppState, 'currentState', {
      value: 'active' as AppStateStatus,
      writable: true,
      configurable: true,
    });
  });

  it('calls saveActiveChild when app transitions from active to background', () => {
    renderHook(() => useAutoSave());
    expect(appStateCallback).not.toBeNull();

    appStateCallback!('background');
    expect(mockSaveActiveChild).toHaveBeenCalledTimes(1);
  });

  it('calls saveActiveChild when app transitions from active to inactive', () => {
    renderHook(() => useAutoSave());

    appStateCallback!('inactive');
    expect(mockSaveActiveChild).toHaveBeenCalledTimes(1);
  });

  it('does NOT call saveActiveChild when app transitions from background to active', () => {
    Object.defineProperty(AppState, 'currentState', {
      value: 'background' as AppStateStatus,
      writable: true,
      configurable: true,
    });
    renderHook(() => useAutoSave());

    appStateCallback!('active');
    expect(mockSaveActiveChild).not.toHaveBeenCalled();
  });

  it('does NOT call saveActiveChild when app transitions from inactive to active', () => {
    Object.defineProperty(AppState, 'currentState', {
      value: 'inactive' as AppStateStatus,
      writable: true,
      configurable: true,
    });
    renderHook(() => useAutoSave());

    appStateCallback!('active');
    expect(mockSaveActiveChild).not.toHaveBeenCalled();
  });

  it('cleans up AppState listener on unmount', () => {
    const { unmount } = renderHook(() => useAutoSave());
    unmount();
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});
