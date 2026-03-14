import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';
import type { AllAvatarId, FrameId } from '../constants/avatars';
import type { ThemeId } from '@/theme/colors';

/** Time window for bedtime lockout (24-hour format, e.g. "20:00" to "07:00"). */
export interface BedtimeWindow {
  /** Start time in HH:MM format (e.g. "20:00") */
  start: string;
  /** End time in HH:MM format (e.g. "07:00") */
  end: string;
}

/** Age band for anonymous peer benchmarking. */
export type AgeRange = '6-7' | '7-8' | '8-9' | null;

/** US state code for geographic benchmarking (e.g. "NY", "CA"). */
export type StateCode = string | null;

export interface ChildProfileSlice {
  childName: string | null;
  childAge: number | null;
  childGrade: number | null;
  avatarId: AllAvatarId | null;
  frameId: FrameId | null;
  themeId: ThemeId;
  tutorConsentGranted: boolean;
  soundEnabled: boolean;
  /** Max daily practice minutes (0 = unlimited) */
  dailyLimitMinutes: number;
  /** Bedtime lockout window (null = no lockout) */
  bedtimeWindow: BedtimeWindow | null;
  /** Break reminder interval in minutes (0 = disabled) */
  breakReminderMinutes: number;
  /** Age band for anonymous peer benchmarking (null = not set) */
  ageRange: AgeRange;
  /** US state code for geographic benchmarking (null = not set) */
  stateCode: StateCode;
  /** Whether parent has opted in to peer benchmarking reports */
  benchmarkOptIn: boolean;
  /** Whether parent has granted consent for YouTube video playback */
  youtubeConsentGranted: boolean;
  /** Whether the Explore manipulatives section is visible on the home screen */
  exploreEnabled: boolean;
  setChildProfile: (
    profile: Partial<
      Pick<ChildProfileSlice, 'childName' | 'childAge' | 'childGrade' | 'avatarId' | 'frameId' | 'themeId'>
    >,
  ) => void;
  setTutorConsentGranted: (granted: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setDailyLimitMinutes: (minutes: number) => void;
  setBedtimeWindow: (window: BedtimeWindow | null) => void;
  setBreakReminderMinutes: (minutes: number) => void;
  setAgeRange: (range: AgeRange) => void;
  setStateCode: (code: StateCode) => void;
  setBenchmarkOptIn: (optIn: boolean) => void;
  setYoutubeConsentGranted: (granted: boolean) => void;
  setExploreEnabled: (enabled: boolean) => void;
}

export const createChildProfileSlice: StateCreator<
  AppState,
  [],
  [],
  ChildProfileSlice
> = (set) => ({
  childName: null,
  childAge: null,
  childGrade: null,
  avatarId: null,
  frameId: null,
  themeId: 'dark',
  tutorConsentGranted: true,
  soundEnabled: true,
  dailyLimitMinutes: 0,
  bedtimeWindow: null,
  breakReminderMinutes: 0,
  ageRange: null,
  stateCode: null,
  benchmarkOptIn: false,
  youtubeConsentGranted: false,
  exploreEnabled: true,
  setChildProfile: (profile) =>
    set((state) => ({
      ...state,
      ...profile,
    })),
  setTutorConsentGranted: (granted) => set({ tutorConsentGranted: granted }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setDailyLimitMinutes: (minutes) => set({ dailyLimitMinutes: minutes }),
  setBedtimeWindow: (window) => set({ bedtimeWindow: window }),
  setBreakReminderMinutes: (minutes) => set({ breakReminderMinutes: minutes }),
  setAgeRange: (range) => set({ ageRange: range }),
  setStateCode: (code) => set({ stateCode: code }),
  setBenchmarkOptIn: (optIn) => set({ benchmarkOptIn: optIn }),
  setYoutubeConsentGranted: (granted) => set({ youtubeConsentGranted: granted }),
  setExploreEnabled: (enabled) => set({ exploreEnabled: enabled }),
});
