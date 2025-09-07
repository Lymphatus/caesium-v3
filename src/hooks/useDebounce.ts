import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: never[]) => void>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef == null) {
        return;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay],
  );
}
