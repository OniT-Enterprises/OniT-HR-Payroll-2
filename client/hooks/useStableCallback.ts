import { useCallback, useRef } from 'react';

/**
 * A hook that creates a stable callback reference that doesn't change between renders.
 * This helps prevent unnecessary re-renders in child components and ResizeObserver loops.
 * 
 * @param callback The callback function to stabilize
 * @returns A stable callback reference
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef<T>(callback);
  
  // Update the ref with the latest callback
  callbackRef.current = callback;
  
  // Return a stable callback that calls the latest version
  return useCallback(((...args: any[]) => {
    return callbackRef.current(...args);
  }) as T, []);
}

export default useStableCallback;
