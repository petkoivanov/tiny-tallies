import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';
import type { AllAvatarId, FrameId } from '../constants/avatars';

export interface ChildProfileSlice {
  childName: string | null;
  childAge: number | null;
  childGrade: number | null;
  avatarId: AllAvatarId | null;
  frameId: FrameId | null;
  tutorConsentGranted: boolean;
  setChildProfile: (
    profile: Partial<
      Pick<ChildProfileSlice, 'childName' | 'childAge' | 'childGrade' | 'avatarId' | 'frameId'>
    >,
  ) => void;
  setTutorConsentGranted: (granted: boolean) => void;
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
  tutorConsentGranted: false,
  setChildProfile: (profile) =>
    set((state) => ({
      ...state,
      ...profile,
    })),
  setTutorConsentGranted: (granted) => set({ tutorConsentGranted: granted }),
});
