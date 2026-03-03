/**
 * Generic state-snapshot undo hook for manipulative components.
 *
 * Tracks a history of state snapshots (max 10 by default).
 * Push new state on each user action; undo pops the last snapshot.
 */

import { useState, useCallback, useRef } from 'react';

interface ActionHistoryState<T> {
  history: T[];
  current: T;
}

export interface UseActionHistoryResult<T> {
  state: T;
  canUndo: boolean;
  historyLength: number;
  pushState: (newState: T) => void;
  undo: () => T | null;
  reset: (resetState: T) => void;
}

/**
 * Hook that maintains an undo history of state snapshots.
 *
 * Tracks a stack of previous states (up to `maxSteps`) and allows
 * undoing to the most recent snapshot. Used by all 6 virtual
 * manipulatives for consistent undo behavior.
 *
 * @param initialState - The starting state value
 * @param maxSteps - Maximum number of undo steps to retain (default 10)
 */
export function useActionHistory<T>(
  initialState: T,
  maxSteps = 10,
): UseActionHistoryResult<T> {
  const [internal, setInternal] = useState<ActionHistoryState<T>>({
    history: [],
    current: initialState,
  });

  // Ref mirrors internal so undo can read synchronously before setState completes
  const internalRef = useRef(internal);
  internalRef.current = internal;

  const pushState = useCallback(
    (newState: T) => {
      setInternal((prev) => ({
        history: [...prev.history, prev.current].slice(-maxSteps),
        current: newState,
      }));
    },
    [maxSteps],
  );

  const undo = useCallback((): T | null => {
    const prev = internalRef.current;
    if (prev.history.length === 0) return null;
    const newHistory = [...prev.history];
    const last = newHistory.pop()!;
    setInternal({ history: newHistory, current: last });
    return last;
  }, []);

  const reset = useCallback((resetState: T) => {
    setInternal({ history: [], current: resetState });
  }, []);

  return {
    state: internal.current,
    canUndo: internal.history.length > 0,
    historyLength: internal.history.length,
    pushState,
    undo,
    reset,
  };
}
