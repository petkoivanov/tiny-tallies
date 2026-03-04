import { renderHook } from '@testing-library/react-native';

const mockUseNetInfo = jest.fn();
jest.mock('@react-native-community/netinfo', () => ({
  ...jest.requireActual('@react-native-community/netinfo'),
  useNetInfo: (...args: unknown[]) => mockUseNetInfo(...args),
}));

import { useNetworkStatus } from '../useNetworkStatus';

describe('useNetworkStatus', () => {
  it('returns isOnline true when isConnected is true', () => {
    mockUseNetInfo.mockReturnValue({ isConnected: true });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('returns isOnline true when isConnected is null (unknown)', () => {
    mockUseNetInfo.mockReturnValue({ isConnected: null });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('returns isOnline false when isConnected is false', () => {
    mockUseNetInfo.mockReturnValue({ isConnected: false });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);
  });
});
