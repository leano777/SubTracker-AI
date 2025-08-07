// Timeout utility for proper cleanup and tracking
export interface TrackedTimeout {
  id: NodeJS.Timeout;
  clear: () => void;
}

// Creates a timeout that can be tracked and cleaned up properly
export const createTrackedTimeout = (
  callback: () => void,
  delay: number,
  timeoutTracker?: Set<NodeJS.Timeout>,
  isMountedRef?: React.MutableRefObject<boolean>
): TrackedTimeout => {
  const timeoutId = setTimeout(() => {
    // Only execute if component is still mounted
    if (!isMountedRef || isMountedRef.current) {
      try {
        callback();
      } catch (error) {
        console.error("Error in tracked timeout callback:", error);
      }
    }
    
    // Remove from tracker
    if (timeoutTracker) {
      timeoutTracker.delete(timeoutId);
    }
  }, delay);

  // Add to tracker if provided
  if (timeoutTracker) {
    timeoutTracker.add(timeoutId);
  }

  const clear = () => {
    clearTimeout(timeoutId);
    if (timeoutTracker) {
      timeoutTracker.delete(timeoutId);
    }
  };

  return { id: timeoutId, clear };
};

// Creates an AbortController for async operations with cleanup
export const createTrackedAbortController = (
  controllerTracker?: Set<AbortController>
): AbortController => {
  const controller = new AbortController();
  
  if (controllerTracker) {
    controllerTracker.add(controller);
  }

  // Auto-cleanup after signal is aborted
  controller.signal.addEventListener('abort', () => {
    if (controllerTracker) {
      controllerTracker.delete(controller);
    }
  });

  return controller;
};

// Cleanup utility for all tracked resources
export const cleanupTrackedResources = (
  timeoutTracker?: Set<NodeJS.Timeout>,
  controllerTracker?: Set<AbortController>
) => {
  // Clear all timeouts
  if (timeoutTracker) {
    timeoutTracker.forEach(timeout => clearTimeout(timeout));
    timeoutTracker.clear();
  }

  // Abort all controllers
  if (controllerTracker) {
    controllerTracker.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
    controllerTracker.clear();
  }
};
