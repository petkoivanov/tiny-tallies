import { create, type StateCreator } from 'zustand';
import {
  type ChildProfileSlice,
  createChildProfileSlice,
} from '@/store/slices/childProfileSlice';

function createTestStore() {
  return create<ChildProfileSlice>()(
    createChildProfileSlice as unknown as StateCreator<ChildProfileSlice>,
  );
}

describe('childProfileSlice', () => {
  describe('defaults', () => {
    it('starts with null profile fields', () => {
      const store = createTestStore();
      const s = store.getState();
      expect(s.childName).toBeNull();
      expect(s.childAge).toBeNull();
      expect(s.childGrade).toBeNull();
      expect(s.avatarId).toBeNull();
      expect(s.frameId).toBeNull();
    });

    it('has sensible default settings', () => {
      const store = createTestStore();
      const s = store.getState();
      expect(s.themeId).toBe('candy');
      expect(s.tutorConsentGranted).toBe(true);
      expect(s.soundEnabled).toBe(true);
      expect(s.dailyLimitMinutes).toBe(0);
      expect(s.bedtimeWindow).toBeNull();
      expect(s.breakReminderMinutes).toBe(0);
      expect(s.benchmarkOptIn).toBe(false);
      expect(s.youtubeConsentGranted).toBe(false);
      expect(s.exploreEnabled).toBe(true);
    });
  });

  describe('setChildProfile', () => {
    it('sets name, age, and grade', () => {
      const store = createTestStore();
      store.getState().setChildProfile({
        childName: 'Emma',
        childAge: 7,
        childGrade: 2,
      });
      const s = store.getState();
      expect(s.childName).toBe('Emma');
      expect(s.childAge).toBe(7);
      expect(s.childGrade).toBe(2);
    });

    it('partial update preserves other fields', () => {
      const store = createTestStore();
      store.getState().setChildProfile({ childName: 'Emma', childAge: 7 });
      store.getState().setChildProfile({ childAge: 8 });
      const s = store.getState();
      expect(s.childName).toBe('Emma');
      expect(s.childAge).toBe(8);
    });

    it('sets avatar and theme', () => {
      const store = createTestStore();
      store.getState().setChildProfile({
        avatarId: 'fox',
        themeId: 'ocean',
      } as Parameters<ChildProfileSlice['setChildProfile']>[0]);
      const s = store.getState();
      expect(s.avatarId).toBe('fox');
      expect(s.themeId).toBe('ocean');
    });
  });

  describe('boolean toggles', () => {
    it('setTutorConsentGranted', () => {
      const store = createTestStore();
      store.getState().setTutorConsentGranted(false);
      expect(store.getState().tutorConsentGranted).toBe(false);
      store.getState().setTutorConsentGranted(true);
      expect(store.getState().tutorConsentGranted).toBe(true);
    });

    it('setSoundEnabled', () => {
      const store = createTestStore();
      store.getState().setSoundEnabled(false);
      expect(store.getState().soundEnabled).toBe(false);
    });

    it('setBenchmarkOptIn', () => {
      const store = createTestStore();
      store.getState().setBenchmarkOptIn(true);
      expect(store.getState().benchmarkOptIn).toBe(true);
    });

    it('setYoutubeConsentGranted', () => {
      const store = createTestStore();
      store.getState().setYoutubeConsentGranted(true);
      expect(store.getState().youtubeConsentGranted).toBe(true);
    });

    it('setExploreEnabled', () => {
      const store = createTestStore();
      store.getState().setExploreEnabled(false);
      expect(store.getState().exploreEnabled).toBe(false);
    });
  });

  describe('parental controls', () => {
    it('setDailyLimitMinutes', () => {
      const store = createTestStore();
      store.getState().setDailyLimitMinutes(30);
      expect(store.getState().dailyLimitMinutes).toBe(30);
    });

    it('setBedtimeWindow', () => {
      const store = createTestStore();
      store.getState().setBedtimeWindow({ start: '20:00', end: '07:00' });
      expect(store.getState().bedtimeWindow).toEqual({
        start: '20:00',
        end: '07:00',
      });
    });

    it('setBedtimeWindow to null clears it', () => {
      const store = createTestStore();
      store.getState().setBedtimeWindow({ start: '21:00', end: '06:00' });
      store.getState().setBedtimeWindow(null);
      expect(store.getState().bedtimeWindow).toBeNull();
    });

    it('setBreakReminderMinutes', () => {
      const store = createTestStore();
      store.getState().setBreakReminderMinutes(15);
      expect(store.getState().breakReminderMinutes).toBe(15);
    });
  });

  describe('benchmarking fields', () => {
    it('setAgeRange', () => {
      const store = createTestStore();
      store.getState().setAgeRange('7-8');
      expect(store.getState().ageRange).toBe('7-8');
    });

    it('setStateCode', () => {
      const store = createTestStore();
      store.getState().setStateCode('CA');
      expect(store.getState().stateCode).toBe('CA');
    });

    it('setStateCode to null clears it', () => {
      const store = createTestStore();
      store.getState().setStateCode('NY');
      store.getState().setStateCode(null);
      expect(store.getState().stateCode).toBeNull();
    });
  });
});
