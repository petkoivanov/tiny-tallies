/**
 * Navigation type definitions for Tiny Tallies.
 *
 * RootStackParamList is a type alias (required by React Navigation for param lists).
 * Global augmentation enables automatic typing for useNavigation/useRoute.
 */

export type RootStackParamList = {
  Home: undefined;
  Session: { sessionId: string };
  Results: {
    sessionId: string;
    score: number;
    total: number;
    xpEarned: number;
    durationMs: number;
    leveledUp: boolean;
    newLevel: number;
    streakCount: number;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
