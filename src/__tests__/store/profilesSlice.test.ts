import { useAppStore } from '../../store/appStore';
import type { ChildData } from '../../store/helpers/childDataHelpers';

// Mock expo-crypto with predictable UUIDs
let mockUuidCounter = 0;
jest.mock('expo-crypto', () => ({
  randomUUID: () => `test-uuid-${++mockUuidCounter}`,
}));

// Mock profileInitService
jest.mock('../../services/profile/profileInitService', () => ({
  createGradeAppropriateSkillStates: (grade: number) => {
    if (grade <= 1) return {};
    // For grade 2+, return a pre-mastered skill
    return { 'add-single-digit': { eloRating: 1100, masteryLocked: true } };
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve(null)),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve(null)),
    multiRemove: jest.fn(() => Promise.resolve(null)),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
}));

const makeProfile = (name: string, grade = 1) => ({
  childName: name,
  childAge: 7,
  childGrade: grade,
  avatarId: null as null,
});

beforeEach(() => {
  mockUuidCounter = 0;
  useAppStore.setState(useAppStore.getInitialState(), true);
});

describe('ProfilesSlice', () => {
  describe('initial state', () => {
    it('has empty children map and null activeChildId', () => {
      const state = useAppStore.getState();
      expect(state.children).toEqual({});
      expect(state.activeChildId).toBeNull();
    });
  });

  describe('addChild', () => {
    it('creates a new child with UUID, sets it as active, returns the ID', () => {
      const id = useAppStore.getState().addChild(makeProfile('Alice'));
      expect(id).toBe('test-uuid-1');
      const state = useAppStore.getState();
      expect(state.activeChildId).toBe('test-uuid-1');
      expect(state.children['test-uuid-1']).toBeDefined();
      expect(state.children['test-uuid-1'].childName).toBe('Alice');
    });

    it('with grade 3 includes pre-mastered skills in the child skillStates', () => {
      useAppStore.getState().addChild(makeProfile('Bob', 3));
      const state = useAppStore.getState();
      const child = state.children[state.activeChildId!];
      expect(child.skillStates['add-single-digit']).toEqual({
        eloRating: 1100,
        masteryLocked: true,
      });
    });

    it('returns null and does not modify state when children count is 5', () => {
      for (let i = 0; i < 5; i++) {
        useAppStore.getState().addChild(makeProfile(`Child${i}`));
      }
      const countBefore = Object.keys(useAppStore.getState().children).length;
      const result = useAppStore.getState().addChild(makeProfile('Extra'));
      expect(result).toBeNull();
      expect(Object.keys(useAppStore.getState().children).length).toBe(countBefore);
    });

    it('dehydrates current active child before activating the new one', () => {
      // Add first child and modify flat state
      useAppStore.getState().addChild(makeProfile('Alice'));
      useAppStore.setState({ xp: 500 });

      // Add second child — first child should be saved with xp=500
      useAppStore.getState().addChild(makeProfile('Bob'));
      const state = useAppStore.getState();
      expect(state.children['test-uuid-1'].xp).toBe(500);
      // New child starts with xp=0
      expect(state.xp).toBe(0);
    });
  });

  describe('switchChild', () => {
    it('hydrates target child data into flat state fields', () => {
      useAppStore.getState().addChild(makeProfile('Alice'));
      useAppStore.setState({ xp: 100 });
      useAppStore.getState().addChild(makeProfile('Bob'));
      useAppStore.setState({ xp: 200 });

      // Switch back to Alice
      useAppStore.getState().switchChild('test-uuid-1');
      const state = useAppStore.getState();
      expect(state.childName).toBe('Alice');
      expect(state.xp).toBe(100);
      expect(state.activeChildId).toBe('test-uuid-1');
    });

    it('dehydrates current child before hydrating target', () => {
      useAppStore.getState().addChild(makeProfile('Alice'));
      useAppStore.getState().addChild(makeProfile('Bob'));
      useAppStore.setState({ xp: 999 });

      // Switch to Alice — Bob's xp=999 should be saved
      useAppStore.getState().switchChild('test-uuid-1');
      expect(useAppStore.getState().children['test-uuid-2'].xp).toBe(999);
    });

    it('does nothing when isSessionActive is true', () => {
      useAppStore.getState().addChild(makeProfile('Alice'));
      useAppStore.getState().addChild(makeProfile('Bob'));
      useAppStore.setState({ isSessionActive: true });

      useAppStore.getState().switchChild('test-uuid-1');
      // Should still be on Bob (uuid-2)
      expect(useAppStore.getState().activeChildId).toBe('test-uuid-2');
    });

    it('does nothing when target childId does not exist', () => {
      useAppStore.getState().addChild(makeProfile('Alice'));
      useAppStore.getState().switchChild('nonexistent');
      expect(useAppStore.getState().activeChildId).toBe('test-uuid-1');
    });
  });

  describe('removeChild', () => {
    it('removes the child from the map', () => {
      useAppStore.getState().addChild(makeProfile('Alice'));
      useAppStore.getState().addChild(makeProfile('Bob'));
      useAppStore.getState().removeChild('test-uuid-1');
      expect(useAppStore.getState().children['test-uuid-1']).toBeUndefined();
    });

    it('switches to next remaining child if active child is deleted', () => {
      useAppStore.getState().addChild(makeProfile('Alice'));
      useAppStore.getState().addChild(makeProfile('Bob'));
      // Active is Bob (uuid-2)
      useAppStore.getState().removeChild('test-uuid-2');
      const state = useAppStore.getState();
      expect(state.activeChildId).toBe('test-uuid-1');
      expect(state.childName).toBe('Alice');
    });

    it('resets activeChildId to null and children to empty when last child is deleted', () => {
      useAppStore.getState().addChild(makeProfile('Alice'));
      useAppStore.getState().removeChild('test-uuid-1');
      const state = useAppStore.getState();
      expect(state.activeChildId).toBeNull();
      expect(state.children).toEqual({});
    });
  });

  describe('saveActiveChild', () => {
    it('updates the children map with current flat state', () => {
      useAppStore.getState().addChild(makeProfile('Alice'));
      useAppStore.setState({ xp: 777, level: 5 });
      useAppStore.getState().saveActiveChild();
      const saved = useAppStore.getState().children['test-uuid-1'];
      expect(saved.xp).toBe(777);
      expect(saved.level).toBe(5);
    });
  });
});
