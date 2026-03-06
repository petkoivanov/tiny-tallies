import { useAppStore } from '../../store/appStore';
import type { ChildData } from '../../store/helpers/childDataHelpers';

// Mock expo-crypto with predictable UUIDs
let mockUuidCounter = 0;
jest.mock('expo-crypto', () => ({
  randomUUID: () => `test-uuid-${++mockUuidCounter}`,
}));

// Mock profileInitService
jest.mock('../../services/profile/profileInitService', () => ({
  createGradeAppropriateSkillStates: () => ({}),
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

describe('ProfilesSlice - updateChild', () => {
  describe('active child update', () => {
    it('updates flat state childName when childId is activeChildId', () => {
      const id = useAppStore.getState().addChild(makeProfile('Alice'));
      expect(id).not.toBeNull();

      useAppStore.getState().updateChild(id!, { childName: 'Alicia' });

      const state = useAppStore.getState();
      // Flat state should be updated
      expect(state.childName).toBe('Alicia');
    });

    it('updates flat state childAge when childId is activeChildId', () => {
      const id = useAppStore.getState().addChild(makeProfile('Bob'));
      expect(id).not.toBeNull();

      useAppStore.getState().updateChild(id!, { childAge: 8 });

      const state = useAppStore.getState();
      expect(state.childAge).toBe(8);
    });

    it('updates flat state avatarId when childId is activeChildId', () => {
      const id = useAppStore.getState().addChild(makeProfile('Carol'));
      expect(id).not.toBeNull();

      useAppStore.getState().updateChild(id!, { avatarId: 'cat' as any });

      const state = useAppStore.getState();
      expect(state.avatarId).toBe('cat');
    });
  });

  describe('non-active child update', () => {
    it('updates children map entry for non-active child', () => {
      const id1 = useAppStore.getState().addChild(makeProfile('Alice'));
      const id2 = useAppStore.getState().addChild(makeProfile('Bob'));
      // id2 is now active, id1 is in children map

      useAppStore.getState().updateChild(id1!, { childName: 'Alicia' });

      const state = useAppStore.getState();
      expect(state.children[id1!].childName).toBe('Alicia');
      // Active child flat state should not be affected
      expect(state.childName).toBe('Bob');
    });

    it('updates childGrade in children map for non-active child', () => {
      const id1 = useAppStore.getState().addChild(makeProfile('Alice', 1));
      const id2 = useAppStore.getState().addChild(makeProfile('Bob', 2));

      useAppStore.getState().updateChild(id1!, { childGrade: 3 });

      const state = useAppStore.getState();
      expect(state.children[id1!].childGrade).toBe(3);
    });
  });

  describe('non-existent child', () => {
    it('is a no-op when childId does not exist', () => {
      const id = useAppStore.getState().addChild(makeProfile('Alice'));
      const stateBefore = useAppStore.getState();

      useAppStore.getState().updateChild('non-existent-id', {
        childName: 'Ghost',
      });

      const stateAfter = useAppStore.getState();
      expect(stateAfter.childName).toBe(stateBefore.childName);
      expect(stateAfter.children).toEqual(stateBefore.children);
    });
  });
});
