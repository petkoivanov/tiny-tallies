import { renderHook, act } from '@testing-library/react-native';

import { useActionHistory } from '@/components/manipulatives/shared/useActionHistory';

describe('useActionHistory', () => {
  it('initializes with the provided initial state', () => {
    const { result } = renderHook(() => useActionHistory({ count: 0 }));
    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.historyLength).toBe(0);
  });

  it('pushState adds current to history and sets new current', () => {
    const { result } = renderHook(() => useActionHistory({ count: 0 }));
    act(() => {
      result.current.pushState({ count: 1 });
    });
    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.historyLength).toBe(1);
  });

  it('undo pops last history item and sets as current', () => {
    const { result } = renderHook(() => useActionHistory({ count: 0 }));
    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
    });
    let restored: { count: number } | null = null;
    act(() => {
      restored = result.current.undo();
    });
    expect(restored).toEqual({ count: 1 });
    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.historyLength).toBe(1);
  });

  it('undo returns null when history is empty', () => {
    const { result } = renderHook(() => useActionHistory({ count: 0 }));
    let restored: { count: number } | null = null;
    act(() => {
      restored = result.current.undo();
    });
    expect(restored).toBeNull();
    expect(result.current.state).toEqual({ count: 0 });
  });

  it('canUndo is true when history has items, false when empty', () => {
    const { result } = renderHook(() => useActionHistory(0));
    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.pushState(1);
    });
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });
    expect(result.current.canUndo).toBe(false);
  });

  it('history is capped at maxSteps, oldest items dropped', () => {
    const { result } = renderHook(() => useActionHistory(0, 3));

    act(() => {
      result.current.pushState(1);
      result.current.pushState(2);
      result.current.pushState(3);
      result.current.pushState(4); // Should push out 0
    });
    expect(result.current.state).toBe(4);
    expect(result.current.historyLength).toBe(3);

    // Undo 3 times should get back to 1 (not 0, which was dropped)
    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toBe(3);
    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toBe(2);
    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toBe(1);
    // No more undo available
    expect(result.current.canUndo).toBe(false);
  });

  it('reset clears history and sets new initial state', () => {
    const { result } = renderHook(() => useActionHistory({ count: 0 }));
    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
    });
    act(() => {
      result.current.reset({ count: 10 });
    });
    expect(result.current.state).toEqual({ count: 10 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.historyLength).toBe(0);
  });

  it('defaults maxSteps to 10', () => {
    const { result } = renderHook(() => useActionHistory(0));

    act(() => {
      for (let i = 1; i <= 12; i++) {
        result.current.pushState(i);
      }
    });
    // 12 pushes, capped at 10
    expect(result.current.historyLength).toBe(10);
    expect(result.current.state).toBe(12);
  });
});
