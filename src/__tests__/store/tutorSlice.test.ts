import { create, type StateCreator } from 'zustand';
import type { TutorMessage } from '@/services/tutor/types';
import {
  type TutorSlice,
  createTutorSlice,
} from '@/store/slices/tutorSlice';

// Create a minimal test store with just the tutor slice.
// The cast is necessary because createTutorSlice is typed for the full
// AppState context, but the slice is self-contained and works standalone.
function createTestStore() {
  return create<TutorSlice>()(
    createTutorSlice as unknown as StateCreator<TutorSlice>,
  );
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

describe('tutorSlice', () => {
  describe('initial state', () => {
    it('has empty tutorMessages array', () => {
      const store = createTestStore();
      expect(store.getState().tutorMessages).toEqual([]);
    });

    it('has tutorMode set to hint', () => {
      const store = createTestStore();
      expect(store.getState().tutorMode).toBe('hint');
    });

    it('has hintLevel set to 0', () => {
      const store = createTestStore();
      expect(store.getState().hintLevel).toBe(0);
    });

    it('has tutorLoading set to false', () => {
      const store = createTestStore();
      expect(store.getState().tutorLoading).toBe(false);
    });

    it('has tutorError set to null', () => {
      const store = createTestStore();
      expect(store.getState().tutorError).toBeNull();
    });
  });

  describe('addTutorMessage', () => {
    it('appends a TutorMessage to tutorMessages array', () => {
      const store = createTestStore();
      const msg: TutorMessage = {
        id: 'msg-1',
        role: 'tutor',
        text: 'Can you try breaking this into smaller parts?',
        timestamp: Date.now(),
      };

      store.getState().addTutorMessage(msg);

      expect(store.getState().tutorMessages).toHaveLength(1);
      expect(store.getState().tutorMessages[0]).toEqual(msg);
    });

    it('appends multiple messages in order', () => {
      const store = createTestStore();
      const msg1: TutorMessage = {
        id: 'msg-1',
        role: 'tutor',
        text: 'What do you think?',
        timestamp: 1000,
      };
      const msg2: TutorMessage = {
        id: 'msg-2',
        role: 'child',
        text: 'I think 5!',
        timestamp: 2000,
      };

      store.getState().addTutorMessage(msg1);
      store.getState().addTutorMessage(msg2);

      expect(store.getState().tutorMessages).toHaveLength(2);
      expect(store.getState().tutorMessages[0].id).toBe('msg-1');
      expect(store.getState().tutorMessages[1].id).toBe('msg-2');
    });
  });

  describe('setTutorMode', () => {
    it('changes tutorMode to teach', () => {
      const store = createTestStore();
      store.getState().setTutorMode('teach');
      expect(store.getState().tutorMode).toBe('teach');
    });

    it('changes tutorMode to boost', () => {
      const store = createTestStore();
      store.getState().setTutorMode('boost');
      expect(store.getState().tutorMode).toBe('boost');
    });
  });

  describe('incrementHintLevel', () => {
    it('increments hintLevel by 1', () => {
      const store = createTestStore();
      expect(store.getState().hintLevel).toBe(0);

      store.getState().incrementHintLevel();
      expect(store.getState().hintLevel).toBe(1);

      store.getState().incrementHintLevel();
      expect(store.getState().hintLevel).toBe(2);
    });
  });

  describe('setTutorLoading', () => {
    it('toggles loading boolean', () => {
      const store = createTestStore();
      expect(store.getState().tutorLoading).toBe(false);

      store.getState().setTutorLoading(true);
      expect(store.getState().tutorLoading).toBe(true);

      store.getState().setTutorLoading(false);
      expect(store.getState().tutorLoading).toBe(false);
    });
  });

  describe('setTutorError', () => {
    it('sets error string', () => {
      const store = createTestStore();
      store.getState().setTutorError('Network timeout');
      expect(store.getState().tutorError).toBe('Network timeout');
    });

    it('clears error with null', () => {
      const store = createTestStore();
      store.getState().setTutorError('Some error');
      store.getState().setTutorError(null);
      expect(store.getState().tutorError).toBeNull();
    });
  });

  describe('resetProblemTutor', () => {
    it('clears messages, resets mode to hint, hintLevel to 0, error to null, problemCallCount to 0', () => {
      const store = createTestStore();

      // Set up dirty state
      store.getState().addTutorMessage({
        id: 'msg-1',
        role: 'tutor',
        text: 'Think about it',
        timestamp: Date.now(),
      });
      store.getState().setTutorMode('teach');
      store.getState().incrementHintLevel();
      store.getState().setTutorError('error');
      store.getState().incrementCallCount();
      store.getState().incrementCallCount();

      store.getState().resetProblemTutor();

      const state = store.getState();
      expect(state.tutorMessages).toEqual([]);
      expect(state.tutorMode).toBe('hint');
      expect(state.hintLevel).toBe(0);
      expect(state.tutorError).toBeNull();
      expect(state.problemCallCount).toBe(0);
    });

    it('preserves sessionCallCount and dailyCallCount', () => {
      const store = createTestStore();
      store.getState().incrementCallCount();
      store.getState().incrementCallCount();

      const beforeSession = store.getState().sessionCallCount;
      const beforeDaily = store.getState().dailyCallCount;

      store.getState().resetProblemTutor();

      expect(store.getState().sessionCallCount).toBe(beforeSession);
      expect(store.getState().dailyCallCount).toBe(beforeDaily);
    });
  });

  describe('resetSessionTutor', () => {
    it('clears messages, resets mode/hintLevel/error, resets problemCallCount and sessionCallCount', () => {
      const store = createTestStore();

      // Set up dirty state
      store.getState().addTutorMessage({
        id: 'msg-1',
        role: 'tutor',
        text: 'Think about it',
        timestamp: Date.now(),
      });
      store.getState().setTutorMode('boost');
      store.getState().incrementHintLevel();
      store.getState().setTutorError('error');
      store.getState().incrementCallCount();

      store.getState().resetSessionTutor();

      const state = store.getState();
      expect(state.tutorMessages).toEqual([]);
      expect(state.tutorMode).toBe('hint');
      expect(state.hintLevel).toBe(0);
      expect(state.tutorError).toBeNull();
      expect(state.problemCallCount).toBe(0);
      expect(state.sessionCallCount).toBe(0);
    });

    it('preserves dailyCallCount', () => {
      const store = createTestStore();
      store.getState().incrementCallCount();
      store.getState().incrementCallCount();

      const beforeDaily = store.getState().dailyCallCount;

      store.getState().resetSessionTutor();

      expect(store.getState().dailyCallCount).toBe(beforeDaily);
    });
  });

  describe('incrementCallCount', () => {
    it('increments problem, session, and daily counts', () => {
      const store = createTestStore();

      store.getState().incrementCallCount();

      expect(store.getState().problemCallCount).toBe(1);
      expect(store.getState().sessionCallCount).toBe(1);
      expect(store.getState().dailyCallCount).toBe(1);

      store.getState().incrementCallCount();

      expect(store.getState().problemCallCount).toBe(2);
      expect(store.getState().sessionCallCount).toBe(2);
      expect(store.getState().dailyCallCount).toBe(2);
    });

    it('resets dailyCallCount to 1 when dailyCountDate is yesterday (daily reset logic)', () => {
      const store = createTestStore();

      // Simulate calls from yesterday
      store.getState().incrementCallCount();
      store.getState().incrementCallCount();
      store.getState().incrementCallCount();
      expect(store.getState().dailyCallCount).toBe(3);

      // Manually set dailyCountDate to yesterday to simulate next-day usage
      store.setState({ dailyCountDate: yesterdayISO() });

      store.getState().incrementCallCount();

      // Daily count should reset to 1 (new day)
      expect(store.getState().dailyCallCount).toBe(1);
      expect(store.getState().dailyCountDate).toBe(todayISO());
      // Problem and session should still increment normally
      expect(store.getState().problemCallCount).toBe(4);
      expect(store.getState().sessionCallCount).toBe(4);
    });
  });

  describe('wrongAnswerCount', () => {
    it('starts at 0', () => {
      const store = createTestStore();
      expect(store.getState().wrongAnswerCount).toBe(0);
    });

    it('increments by 1 via incrementWrongAnswerCount', () => {
      const store = createTestStore();
      store.getState().incrementWrongAnswerCount();
      expect(store.getState().wrongAnswerCount).toBe(1);

      store.getState().incrementWrongAnswerCount();
      expect(store.getState().wrongAnswerCount).toBe(2);

      store.getState().incrementWrongAnswerCount();
      expect(store.getState().wrongAnswerCount).toBe(3);
    });

    it('resets to 0 when resetProblemTutor is called', () => {
      const store = createTestStore();
      store.getState().incrementWrongAnswerCount();
      store.getState().incrementWrongAnswerCount();
      expect(store.getState().wrongAnswerCount).toBe(2);

      store.getState().resetProblemTutor();
      expect(store.getState().wrongAnswerCount).toBe(0);
    });

    it('resets to 0 when resetSessionTutor is called', () => {
      const store = createTestStore();
      store.getState().incrementWrongAnswerCount();
      store.getState().incrementWrongAnswerCount();
      expect(store.getState().wrongAnswerCount).toBe(2);

      store.getState().resetSessionTutor();
      expect(store.getState().wrongAnswerCount).toBe(0);
    });
  });
});
