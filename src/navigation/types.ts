/**
 * Navigation type definitions for Tiny Tallies.
 *
 * RootStackParamList is a type alias (required by React Navigation for param lists).
 * Global augmentation enables automatic typing for useNavigation/useRoute.
 */

// Session and Results will receive params in Phase 6
// (e.g., Session: { sessionId: string }, Results: { sessionId: string })
export type RootStackParamList = {
  Home: undefined;
  Session: undefined;
  Results: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
