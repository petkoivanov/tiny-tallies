/**
 * Backend API client for Tiny Tallies.
 *
 * Wraps fetch with auth headers, API key, offline detection.
 * All endpoints return typed responses or throw on error.
 */

import NetInfo from '@react-native-community/netinfo';
import { getStoredToken } from '../auth/authService';

const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8788' // Android emulator -> host
  : 'https://tiny-tallies-api.YOUR_DOMAIN.workers.dev'; // TODO: replace after deploy

const API_KEY = 'REPLACE_WITH_PRODUCTION_API_KEY'; // TODO: move to env/config

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class OfflineError extends Error {
  constructor() {
    super('No network connection');
    this.name = 'OfflineError';
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  userId?: string;
  signal?: AbortSignal;
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    throw new OfflineError();
  }

  const headers: Record<string, string> = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  };

  if (options.userId) {
    headers['X-User-Id'] = options.userId;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(
      (errorBody as { error?: string }).error ?? `HTTP ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

// --- Auth ---

export interface AuthVerifyResponse {
  userId: string;
  provider: string;
  email: string | null;
  displayName: string | null;
  isNewUser: boolean;
}

export async function verifyAuth(
  provider: 'google' | 'apple',
  idToken: string,
): Promise<AuthVerifyResponse> {
  return apiRequest<AuthVerifyResponse>('/api/auth/verify', {
    method: 'POST',
    body: { provider, idToken },
  });
}

// --- Consent ---

export interface ConsentStatusResponse {
  privacyAcknowledged: boolean;
  vpcCompleted: boolean;
  vpcProvider: 'google' | 'apple' | null;
  acknowledgedAt: number | null;
  vpcAt: number | null;
}

export async function getConsentStatus(
  userId: string,
): Promise<ConsentStatusResponse> {
  return apiRequest<ConsentStatusResponse>('/api/consent/status', { userId });
}

export async function acknowledgeConsent(
  userId: string,
  type: string,
): Promise<void> {
  await apiRequest('/api/consent/acknowledge', {
    method: 'POST',
    userId,
    body: { type },
  });
}

// --- Config ---

export interface AppConfigResponse {
  sentryEnabled: boolean;
}

export async function getAppConfig(): Promise<AppConfigResponse> {
  return apiRequest<AppConfigResponse>('/api/config');
}

// --- Sync ---

export interface SyncPushPayload {
  childId: string;
  profile: {
    childName: string;
    childAge: number;
    childGrade: number;
    avatarId: string | null;
    frameId: string | null;
    themeId: string;
  };
  scoreDeltas: Array<{
    skillId: string;
    eloDelta: number;
    xpDelta: number;
    correct: number;
    timestamp: number;
  }>;
  badges: Array<{ badgeId: string; earnedAt: number }>;
  skillStates: Array<{
    skillId: string;
    elo: number;
    attempts: number;
    correctCount: number;
    mastery: number;
    leitnerBox: number;
    updatedAt: number;
  }>;
  deviceId: string;
}

export async function syncPush(
  userId: string,
  payload: SyncPushPayload,
): Promise<{ success: boolean }> {
  return apiRequest('/api/sync/push', {
    method: 'POST',
    userId,
    body: payload,
  });
}

export interface SyncPullChild {
  childId: string;
  profile: {
    childName: string;
    childAge: number;
    childGrade: number;
    avatarId: string | null;
    frameId: string | null;
    themeId: string;
  };
  xp: number;
  level: number;
  sessionsCompleted: number;
  eloRating: number;
  badges: Array<{ badgeId: string; earnedAt: number }>;
  skillStates: Array<{
    skillId: string;
    elo: number;
    attempts: number;
    correctCount: number;
    mastery: number;
    leitnerBox: number;
    updatedAt: number;
  }>;
}

export interface SyncPullResponse {
  children: SyncPullChild[];
}

export async function syncPull(userId: string): Promise<SyncPullResponse> {
  return apiRequest<SyncPullResponse>('/api/sync/pull', { userId });
}

// --- User Data Deletion ---

export async function deleteUserData(userId: string): Promise<void> {
  await apiRequest('/api/user/data', {
    method: 'DELETE',
    userId,
  });
}
