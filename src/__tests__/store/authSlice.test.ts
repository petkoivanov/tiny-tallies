import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/store/appStore';

beforeEach(async () => {
  await AsyncStorage.clear();
  useAppStore.setState(useAppStore.getInitialState(), true);
});

describe('authSlice', () => {
  it('starts with no auth', () => {
    const state = useAppStore.getState();
    expect(state.isSignedIn).toBe(false);
    expect(state.userId).toBeNull();
    expect(state.authProvider).toBeNull();
    expect(state.userEmail).toBeNull();
    expect(state.userDisplayName).toBeNull();
  });

  it('setAuth sets all fields', () => {
    useAppStore.getState().setAuth({
      userId: 'u-123',
      provider: 'google',
      email: 'test@example.com',
      displayName: 'Test User',
    });

    const state = useAppStore.getState();
    expect(state.isSignedIn).toBe(true);
    expect(state.userId).toBe('u-123');
    expect(state.authProvider).toBe('google');
    expect(state.userEmail).toBe('test@example.com');
    expect(state.userDisplayName).toBe('Test User');
  });

  it('setAuth works with apple provider', () => {
    useAppStore.getState().setAuth({
      userId: 'u-456',
      provider: 'apple',
      email: null,
      displayName: null,
    });

    const state = useAppStore.getState();
    expect(state.isSignedIn).toBe(true);
    expect(state.authProvider).toBe('apple');
    expect(state.userEmail).toBeNull();
  });

  it('clearAuth resets all fields', () => {
    useAppStore.getState().setAuth({
      userId: 'u-789',
      provider: 'google',
      email: 'x@y.com',
      displayName: 'X',
    });

    useAppStore.getState().clearAuth();

    const state = useAppStore.getState();
    expect(state.isSignedIn).toBe(false);
    expect(state.userId).toBeNull();
    expect(state.authProvider).toBeNull();
    expect(state.userEmail).toBeNull();
    expect(state.userDisplayName).toBeNull();
  });
});
