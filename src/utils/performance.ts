// Performance monitoring utility to detect potential browser crash causes

export class PerformanceMonitor {
  private renderCount = 0;
  private lastRenderTime = performance.now();
  private memoryWarningThreshold = 50; // MB
  private renderWarningThreshold = 100; // renders per second
  private componentRenderCounts: Map<string, number> = new Map();
  
  // Monitor component renders to detect infinite loops
  public trackRender(componentName: string) {
    this.renderCount++;
    this.componentRenderCounts.set(
      componentName, 
      (this.componentRenderCounts.get(componentName) || 0) + 1
    );
    
    const now = performance.now();
    const timeDiff = now - this.lastRenderTime;
    
    // Check for excessive renders in short time
    if (timeDiff < 1000 && this.renderCount > this.renderWarningThreshold) {
      console.warn(`🚨 PERFORMANCE WARNING: ${this.renderCount} renders in ${timeDiff}ms`);
      console.warn('Component render counts:', Object.fromEntries(this.componentRenderCounts));
      this.renderCount = 0;
      this.componentRenderCounts.clear();
    }
    
    // Reset counter every second
    if (timeDiff > 1000) {
      this.renderCount = 0;
      this.componentRenderCounts.clear();
      this.lastRenderTime = now;
    }
  }
  
  // Monitor memory usage
  public checkMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      if (usedMB > this.memoryWarningThreshold) {
        console.warn(`🚨 MEMORY WARNING: ${usedMB.toFixed(2)}MB used`);
        
        // Force garbage collection if available (dev tools)
        if ('gc' in window && typeof (window as any).gc === 'function') {
          console.log('🧹 Triggering garbage collection...');
          (window as any).gc();
        }
      }
      
      return {
        used: usedMB,
        total: memory.totalJSHeapSize / 1024 / 1024,
        limit: memory.jsHeapSizeLimit / 1024 / 1024,
      };
    }
    return null;
  }
  
  // Start continuous monitoring
  public startMonitoring() {
    const interval = setInterval(() => {
      this.checkMemoryUsage();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }
  
  // Check for potential infinite loops in useEffect
  public trackEffect(effectName: string, dependencies?: any[]) {
    console.log(`🔄 Effect triggered: ${effectName}`, dependencies);
    
    // Track effect frequency
    const key = `effect_${effectName}`;
    this.componentRenderCounts.set(
      key, 
      (this.componentRenderCounts.get(key) || 0) + 1
    );
    
    if ((this.componentRenderCounts.get(key) || 0) > 50) {
      console.error(`🚨 EFFECT LOOP DETECTED: ${effectName} has run ${this.componentRenderCounts.get(key)} times!`);
      console.error('Dependencies:', dependencies);
    }
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to detect problematic patterns
export const detectCrashPatterns = () => {
  const patterns = [];
  
  // Check for excessive DOM nodes
  const domNodes = document.querySelectorAll('*').length;
  if (domNodes > 5000) {
    patterns.push(`Excessive DOM nodes: ${domNodes}`);
  }
  
  // Check for event listeners
  const eventListenerCount = (window as any).getEventListeners ? 
    Object.keys((window as any).getEventListeners(document)).length : 'unknown';
  if (eventListenerCount !== 'unknown' && eventListenerCount > 100) {
    patterns.push(`Many event listeners: ${eventListenerCount}`);
  }
  
  // Check for intervals/timeouts
  const highestTimeoutId = setTimeout(() => {}, 0);
  clearTimeout(highestTimeoutId);
  const timeoutNumber = Number(highestTimeoutId);
  if (!isNaN(timeoutNumber) && timeoutNumber > 1000) {
    patterns.push(`Many timeouts created: ${timeoutNumber}`);
  }
  
  return patterns;
};

// Emergency cleanup function
export const emergencyCleanup = () => {
  console.log('🚨 Emergency cleanup triggered');
  
  // Clear all intervals and timeouts - safer approach
  const highestTimeoutId = setTimeout(() => {}, 0);
  clearTimeout(highestTimeoutId);
  const timeoutNumber = Number(highestTimeoutId);
  
  if (!isNaN(timeoutNumber)) {
    for (let i = 0; i <= timeoutNumber && i <= 10000; i++) { // Limit to 10k for safety
      clearTimeout(i);
      clearInterval(i);
    }
  }
  
  // Force garbage collection if available
  if ('gc' in window && typeof (window as any).gc === 'function') {
    (window as any).gc();
  }
  
  console.log('✅ Emergency cleanup completed');
};

// Add to window for debugging
declare global {
  interface Window {
    performanceMonitor: PerformanceMonitor;
    emergencyCleanup: () => void;
    detectCrashPatterns: () => string[];
  }
}

if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
  window.emergencyCleanup = emergencyCleanup;
  window.detectCrashPatterns = detectCrashPatterns;
}
