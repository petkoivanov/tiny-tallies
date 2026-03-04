import { useNetInfo } from '@react-native-community/netinfo';

/**
 * Thin wrapper around NetInfo's useNetInfo hook.
 * Returns { isOnline } where null (unknown initial state) is treated as online.
 * Only explicit isConnected === false is treated as offline.
 */
export function useNetworkStatus(): { isOnline: boolean } {
  const netInfo = useNetInfo();
  return { isOnline: netInfo.isConnected !== false };
}
