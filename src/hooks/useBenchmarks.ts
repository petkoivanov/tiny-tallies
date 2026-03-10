/**
 * useBenchmarks — fetches peer benchmark data for the active child.
 *
 * Only fetches when the child has opted into benchmarking.
 * Returns loading/error states and the benchmark response.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  getBenchmarks,
  type BenchmarkResponse,
} from '@/services/api/apiClient';

interface UseBenchmarksResult {
  data: BenchmarkResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBenchmarks(): UseBenchmarksResult {
  const userId = useAppStore((s) => s.userId);
  const activeChildId = useAppStore((s) => s.activeChildId);
  const benchmarkOptIn = useAppStore((s) => s.benchmarkOptIn);
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const [data, setData] = useState<BenchmarkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    if (!isSignedIn || !userId || !activeChildId || !benchmarkOptIn) {
      setData(null);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await getBenchmarks(userId, activeChildId, controller.signal);
      if (!controller.signal.aborted) {
        setData(result);
      }
    } catch (e) {
      if (!controller.signal.aborted) {
        setError((e as Error).message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [isSignedIn, userId, activeChildId, benchmarkOptIn]);

  useEffect(() => {
    fetch();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
