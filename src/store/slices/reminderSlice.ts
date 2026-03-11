import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

export interface ReminderSlice {
  reminderEnabled: boolean;
  reminderTime: string; // 24hr "HH:MM"
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
}

export const createReminderSlice: StateCreator<
  AppState,
  [],
  [],
  ReminderSlice
> = (set) => ({
  reminderEnabled: true,
  reminderTime: '17:00',
  setReminderEnabled: (enabled) => set({ reminderEnabled: enabled }),
  setReminderTime: (time) => set({ reminderTime: time }),
});
