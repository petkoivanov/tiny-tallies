import { renderHook } from '@testing-library/react-native';

import { useAppStore } from '@/store/appStore';
import { useCpaMode } from '@/hooks/useCpaMode';
import type { SkillState } from '@/store/slices/skillStatesSlice';

describe('useCpaMode', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true);
  });

  it('returns abstract stage with null manipulativeType when skillId is null', () => {
    const { result } = renderHook(() => useCpaMode(null));

    expect(result.current.stage).toBe('abstract');
    expect(result.current.manipulativeType).toBeNull();
  });

  it('returns concrete stage with counters for single-digit addition at concrete cpaLevel', () => {
    const skillId = 'addition.single-digit.no-carry';
    useAppStore.setState({
      skillStates: {
        [skillId]: {
          eloRating: 1000,
          attempts: 5,
          correct: 2,
          masteryProbability: 0.2,
          consecutiveWrong: 0,
          masteryLocked: false,
          leitnerBox: 1 as const,
          nextReviewDue: null,
          consecutiveCorrectInBox6: 0,
          cpaLevel: 'concrete' as const,
        },
      },
    });

    const { result } = renderHook(() => useCpaMode(skillId));

    expect(result.current.stage).toBe('concrete');
    expect(result.current.manipulativeType).toBe('counters');
  });

  it('returns pictorial stage with counters for single-digit addition at pictorial cpaLevel', () => {
    const skillId = 'addition.single-digit.no-carry';
    useAppStore.setState({
      skillStates: {
        [skillId]: {
          eloRating: 1000,
          attempts: 20,
          correct: 14,
          masteryProbability: 0.55,
          consecutiveWrong: 0,
          masteryLocked: false,
          leitnerBox: 3 as const,
          nextReviewDue: null,
          consecutiveCorrectInBox6: 0,
          cpaLevel: 'pictorial' as const,
        },
      },
    });

    const { result } = renderHook(() => useCpaMode(skillId));

    expect(result.current.stage).toBe('pictorial');
    expect(result.current.manipulativeType).toBe('counters');
  });

  it('returns abstract stage with null manipulativeType for abstract cpaLevel', () => {
    const skillId = 'addition.single-digit.no-carry';
    useAppStore.setState({
      skillStates: {
        [skillId]: {
          eloRating: 1200,
          attempts: 50,
          correct: 45,
          masteryProbability: 0.95,
          consecutiveWrong: 0,
          masteryLocked: true,
          leitnerBox: 6 as const,
          nextReviewDue: null,
          consecutiveCorrectInBox6: 3,
          cpaLevel: 'abstract' as const,
        },
      },
    });

    const { result } = renderHook(() => useCpaMode(skillId));

    expect(result.current.stage).toBe('abstract');
    expect(result.current.manipulativeType).toBeNull();
  });

  it('returns concrete stage with null manipulativeType for unknown skill', () => {
    // Unknown skill has no entry in skillStates, so getOrCreateSkillState returns default (cpaLevel: 'concrete')
    // Unknown skill has no mapping in skillManipulativeMap, so getPrimaryManipulative returns null
    const { result } = renderHook(() => useCpaMode('unknown.skill'));

    expect(result.current.stage).toBe('concrete');
    expect(result.current.manipulativeType).toBeNull();
  });
});
