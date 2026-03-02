import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';
import type { AvatarId } from '../constants/avatars';

export interface ChildProfileSlice {
  childName: string | null;
  childAge: number | null;
  childGrade: number | null;
  avatarId: AvatarId | null;
  setChildProfile: (
    profile: Partial<
      Pick<ChildProfileSlice, 'childName' | 'childAge' | 'childGrade' | 'avatarId'>
    >,
  ) => void;
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
  setChildProfile: (profile) =>
    set((state) => ({
      ...state,
      ...profile,
    })),
});
