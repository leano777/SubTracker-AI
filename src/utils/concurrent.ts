// React 18 concurrent features utility for performance optimization
// Implements startTransition for heavy operations to keep UI responsive
import { startTransition, useTransition, useDeferredValue } from 'react';

/**
 * Wrapper for startTransition to handle heavy UI updates non-blocking
 * This keeps the UI responsive during expensive operations
 * 
 * @param callback - The function to run in a transition
 */
export const withTransition = (callback: () => void) => {
  startTransition(() => {
    callback();
  });
};

/**
 * Custom hook for handling transitions with loading states
 * Returns [isPending, startTransition] for component use
 */
export const usePerformantTransition = () => {
  const [isPending, startTransition] = useTransition();
  
  const performTransition = (callback: () => void) => {
    startTransition(() => {
      callback();
    });
  };
  
  return [isPending, performTransition] as const;
};

/**
 * Higher-order function to wrap state updates in transitions
 * Useful for expensive state updates that should be non-blocking
 * 
 * @param setter - State setter function
 * @returns Wrapped setter that uses startTransition
 */
export const createTransitionSetter = <T>(setter: (value: T | ((prev: T) => T)) => void) => {
  return (value: T | ((prev: T) => T)) => {
    startTransition(() => {
      setter(value);
    });
  };
};

/**
 * Debounced transition for search and filter operations
 * Combines debouncing with startTransition for optimal performance
 * 
 * @param callback - Function to call after debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced function that uses startTransition
 */
export const createDebouncedTransition = (callback: (...args: any[]) => void, delay: number = 300) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      startTransition(() => {
        callback(...args);
      });
    }, delay);
  };
};

/**
 * Batch multiple updates in a single transition
 * Useful when multiple state updates need to happen together
 * 
 * @param updates - Array of functions to execute in the transition
 */
export const batchTransitionUpdates = (updates: (() => void)[]) => {
  startTransition(() => {
    updates.forEach(update => update());
  });
};

/**
 * Hook for deferred values with automatic fallback
 * Returns both the deferred value and a boolean indicating if it's deferred
 * 
 * @param value - The value to defer
 * @returns [deferredValue, isDeferred]
 */
export const useDeferredWithStatus = <T>(value: T): [T, boolean] => {
  const deferredValue = useDeferredValue(value);
  const isDeferred = deferredValue !== value;
  
  return [deferredValue, isDeferred];
};

/**
 * Performance-optimized search hook using concurrent features
 * Combines debouncing, deferred values, and transitions for smooth UX
 * 
 * @param searchFunction - Function to perform the search
 * @param delay - Debounce delay
 * @returns Hook for performant searching
 */
export const usePerformantSearch = <T>(
  searchFunction: (query: string) => T[],
  delay: number = 300
) => {
  const [isPending, startTransition] = useTransition();
  
  const performSearch = createDebouncedTransition((query: string) => {
    return searchFunction(query);
  }, delay);
  
  return {
    performSearch,
    isPending
  };
};

/**
 * Performance utilities for heavy data operations
 */
export const PerformanceUtils = {
  withTransition,
  usePerformantTransition,
  createTransitionSetter,
  createDebouncedTransition,
  batchTransitionUpdates,
  useDeferredWithStatus,
  usePerformantSearch
};

/**
 * Constants for performance optimization
 */
export const PERFORMANCE_CONSTANTS = {
  // Debounce delays for different operations
  SEARCH_DEBOUNCE: 300,
  FILTER_DEBOUNCE: 200,
  TYPING_DEBOUNCE: 150,
  
  // Batch sizes for large operations
  LARGE_LIST_BATCH_SIZE: 50,
  PAGINATION_SIZE: 25,
  
  // Thresholds for performance optimizations
  VIRTUAL_LIST_THRESHOLD: 100,
  LAZY_LOAD_THRESHOLD: 20,
  
  // Animation durations aligned with transitions
  TRANSITION_DURATION: 200,
  QUICK_TRANSITION: 100,
  SLOW_TRANSITION: 400
};

export default PerformanceUtils;
