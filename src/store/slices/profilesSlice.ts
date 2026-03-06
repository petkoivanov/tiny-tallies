import type { StateCreator } from 'zustand';
import * as Crypto from 'expo-crypto';

import type { AppState } from '../appStore';
import type { ChildData, NewChildProfile } from '../helpers/childDataHelpers';
import {
  dehydrateChild,
  hydrateChild,
  createDefaultChildData,
  DEFAULT_CHILD_DATA,
} from '../helpers/childDataHelpers';
import { createGradeAppropriateSkillStates } from '../../services/profile/profileInitService';

const MAX_CHILDREN = 5;

export interface ProfilesSlice {
  children: Record<string, ChildData>;
  activeChildId: string | null;
  _needsMigrationPrompt: boolean;
  switchChild: (childId: string) => void;
  addChild: (profile: NewChildProfile) => string | null;
  removeChild: (childId: string) => void;
  saveActiveChild: () => void;
  setMigrationComplete: () => void;
}

export const createProfilesSlice: StateCreator<
  AppState,
  [],
  [],
  ProfilesSlice
> = (set, get) => ({
  children: {},
  activeChildId: null,
  _needsMigrationPrompt: false,

  addChild: (profile: NewChildProfile): string | null => {
    const state = get();
    if (Object.keys(state.children).length >= MAX_CHILDREN) {
      return null;
    }

    const childId = Crypto.randomUUID();
    const skillStates = createGradeAppropriateSkillStates(profile.childGrade);
    const childData = createDefaultChildData({ ...profile, skillStates });

    // Dehydrate current active child before switching
    const updatedChildren = { ...state.children };
    if (state.activeChildId && updatedChildren[state.activeChildId]) {
      updatedChildren[state.activeChildId] = dehydrateChild(state);
    }
    updatedChildren[childId] = childData;

    // Hydrate new child into flat state and activate
    set({
      ...hydrateChild(childData),
      children: updatedChildren,
      activeChildId: childId,
    });

    return childId;
  },

  switchChild: (childId: string): void => {
    const state = get();

    // Block switching during active session
    if (state.isSessionActive) {
      return;
    }

    // Guard against non-existent child
    if (!state.children[childId]) {
      return;
    }

    // Dehydrate current child, then hydrate target — single atomic set()
    const updatedChildren = { ...state.children };
    if (state.activeChildId && updatedChildren[state.activeChildId]) {
      updatedChildren[state.activeChildId] = dehydrateChild(state);
    }

    const targetData = updatedChildren[childId];
    set({
      ...hydrateChild(targetData),
      children: updatedChildren,
      activeChildId: childId,
    });
  },

  removeChild: (childId: string): void => {
    const state = get();
    const { [childId]: _removed, ...remainingChildren } = state.children;

    const remainingIds = Object.keys(remainingChildren);

    if (remainingIds.length === 0) {
      // Last child deleted — reset everything
      set({
        ...hydrateChild(DEFAULT_CHILD_DATA),
        children: {},
        activeChildId: null,
      });
      return;
    }

    if (state.activeChildId === childId) {
      // Active child deleted — switch to first remaining
      const nextId = remainingIds[0];
      const nextData = remainingChildren[nextId];
      set({
        ...hydrateChild(nextData),
        children: remainingChildren,
        activeChildId: nextId,
      });
      return;
    }

    // Non-active child deleted — just update map
    set({ children: remainingChildren });
  },

  saveActiveChild: (): void => {
    const state = get();
    if (!state.activeChildId) {
      return;
    }
    set({
      children: {
        ...state.children,
        [state.activeChildId]: dehydrateChild(state),
      },
    });
  },

  setMigrationComplete: (): void => {
    set({ _needsMigrationPrompt: false });
  },
});
