/**
 * Shared Type Definitions for Tiny Tallies API
 */

export interface Env {
  // App authentication
  APP_API_KEY: string;

  // Auth verification config
  APPLE_BUNDLE_ID: string;
  GOOGLE_WEB_CLIENT_ID: string;

  // D1 database
  DB: D1Database;

  // Environment
  ENVIRONMENT: string;
}

export interface AppConfig {
  sentryEnabled: boolean;
}

// Auth types

export type AuthProvider = 'google' | 'apple';

export interface AuthVerifyRequest {
  idToken: string;
  provider: AuthProvider;
}

export interface AuthVerifyResponse {
  success: boolean;
  userId: string;
  provider: AuthProvider;
  email: string | null;
  displayName: string | null;
  isNewUser: boolean;
}

// Consent types

export interface ConsentAcknowledgeRequest {
  type: 'privacy_acknowledged' | 'vpc_google' | 'vpc_apple';
}

export interface ConsentStatusResponse {
  privacyAcknowledged: boolean;
  vpcCompleted: boolean;
  vpcProvider: AuthProvider | null;
  acknowledgedAt: number | null;
  vpcAt: number | null;
}

// Sync types

export interface SyncPushRequest {
  childId: string;
  profile: {
    childName: string;
    childAge: number;
    childGrade: number;
    avatarId: string | null;
    frameId: string | null;
    themeId: string | null;
    ageRange: string | null;
    stateCode: string | null;
    benchmarkOptIn: boolean;
  };
  scoreDeltas: ScoreDelta[];
  badges: BadgeRecord[];
  skillStates: SkillStateRecord[];
  deviceId: string;
}

export interface ScoreDelta {
  skillId: string;
  eloDelta: number;
  xpDelta: number;
  correct: number; // 1 or 0
  timestamp: number;
}

export interface BadgeRecord {
  badgeId: string;
  earnedAt: number;
}

export interface SkillStateRecord {
  skillId: string;
  elo: number;
  attempts: number;
  correctCount: number;
  mastery: number;
  leitnerBox: number;
  updatedAt: number;
}

export interface SyncPullResponse {
  children: SyncedChild[];
  lastSyncAt: number;
}

export interface SyncedChild {
  childId: string;
  profile: {
    childName: string;
    childAge: number;
    childGrade: number;
    avatarId: string | null;
    frameId: string | null;
    themeId: string | null;
  };
  skillStates: SkillStateRecord[];
  badges: BadgeRecord[];
  xp: number;
  level: number;
  sessionsCompleted: number;
  eloRating: number;
  updatedAt: number;
}

// Benchmark types

export interface BenchmarkDomain {
  skillDomain: string;
  childElo: number;
  percentile: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  sampleSize: number;
}

export interface BenchmarkResponse {
  national: BenchmarkDomain[];
  state: BenchmarkDomain[] | null;
  ageRange: string;
  stateCode: string | null;
}
