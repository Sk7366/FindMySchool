import { useState, useEffect, useCallback, useRef } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  execute: (...args: any[]) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
}

export interface UseAsyncOptions<T> {
  immediate?: boolean;
  initialData?: T | null;
  checkIsEmpty?: (data: T | null) => boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

const defaultCheckIsEmpty = <T>(data: T | null): boolean => {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data) && data.length === 0) return true;
  if (typeof data === 'object' && Object.keys(data).length === 0) return true;
  return false;
};

/**
 * Centralized hook for managing async operations with loading, error, empty, and retry states.
 */
export function useAsync<T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): AsyncState<T> {
  const {
    immediate = true,
    initialData = null,
    checkIsEmpty = defaultCheckIsEmpty,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const lastArgsRef = useRef<any[]>([]);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      lastArgsRef.current = args;
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn(...args);
        if (isMountedRef.current) {
          setData(result);
          setLoading(false);
          onSuccess?.(result);
        }
        return result;
      } catch (err: any) {
        const errorMessage =
          typeof err === 'string'
            ? err
            : err?.message || 'An unexpected error occurred. Please try again.';

        if (isMountedRef.current) {
          setError(errorMessage);
          setLoading(false);
          onError?.(errorMessage);
        }
        return null;
      }
    },
    [asyncFn, onSuccess, onError]
  );

  const retry = useCallback(() => {
    return execute(...lastArgsRef.current);
  }, [execute]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const isEmpty = !loading && !error && checkIsEmpty(data);

  return {
    data,
    loading,
    error,
    isEmpty,
    execute,
    retry,
    reset,
  };
}
