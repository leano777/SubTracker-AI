// Performance monitoring utility to detect potential browser crash causes

export class PerformanceMonitor {
  private renderCount = 0;
  private lastRenderTime = performance.now();
  private memoryWarningThreshold = 50; // MB
  private renderWarningThreshold = 100; // renders per second
  private componentRenderCounts: Map<string, number> = new Map();
  // Core Web Vitals monitoring
  private observers: PerformanceObserver[] = [];
  private webVitals: Map<string, number> = new Map();

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
      console.warn("Component render counts:", Object.fromEntries(this.componentRenderCounts));
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
    if ("memory" in performance) {
      const { memory } = performance as any;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;

      if (usedMB > this.memoryWarningThreshold) {
        console.warn(`🚨 MEMORY WARNING: ${usedMB.toFixed(2)}MB used`);

        // Force garbage collection if available (dev tools)
        if ("gc" in window && typeof (window as any).gc === "function") {
          console.log("🧹 Triggering garbage collection...");
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
    this.componentRenderCounts.set(key, (this.componentRenderCounts.get(key) || 0) + 1);

    if ((this.componentRenderCounts.get(key) || 0) > 50) {
      console.error(
        `🚨 EFFECT LOOP DETECTED: ${effectName} has run ${this.componentRenderCounts.get(key)} times!`
      );
      console.error("Dependencies:", dependencies);
    }
  }

  // Initialize Core Web Vitals monitoring
  public initWebVitals() {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            this.webVitals.set('LCP', lastEntry.startTime);
            this.reportWebVital('LCP', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fidValue = entry.processingStart - entry.startTime;
            this.webVitals.set('FID', fidValue);
            this.reportWebVital('FID', fidValue);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.webVitals.set('CLS', clsValue);
          this.reportWebVital('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private reportWebVital(name: string, value: number) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 }
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (threshold) {
      const status = value <= threshold.good ? '✅ GOOD' : 
                    value <= threshold.poor ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR';
      console.log(`${name}: ${value.toFixed(2)} - ${status}`);
      
      // Track for Lighthouse optimization
      if (status.includes('POOR')) {
        console.warn(`🎯 LIGHTHOUSE OPTIMIZATION NEEDED: ${name} score is poor`);
      }
    }
  }

  // Get Core Web Vitals for reporting
  public getWebVitals(): Record<string, number> {
    return Object.fromEntries(this.webVitals);
  }

  // Bundle analysis for optimization
  public analyzeBundlePerformance(): void {
    if ('performance' in window && performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const jsResources = resources.filter(r => 
        r.name.includes('.js') && r.transferSize > 0
      );

      const cssResources = resources.filter(r => 
        r.name.includes('.css') && r.transferSize > 0
      );

      const totalJSSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
      const totalCSSSize = cssResources.reduce((sum, r) => sum + r.transferSize, 0);

      console.group('📊 Bundle Performance Analysis');
      console.log(`Total JS Size: ${this.formatBytes(totalJSSize)}`);
      console.log(`Total CSS Size: ${this.formatBytes(totalCSSSize)}`);
      
      // Lighthouse recommendations
      if (totalJSSize > 500000) { // 500KB
        console.warn('⚠️ LIGHTHOUSE: JS bundle size is large, consider code splitting');
      }
      
      const largestJS = jsResources.reduce((max, r) => 
        r.transferSize > max.transferSize ? r : max, jsResources[0]
      );
      if (largestJS) {
        console.log(`Largest JS: ${largestJS.name.split('/').pop()} (${this.formatBytes(largestJS.transferSize)})`);
      }
      
      console.groupEnd();
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clean up observers
  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to detect problematic patterns
export const detectCrashPatterns = () => {
  const patterns = [];

  // Check for excessive DOM nodes
  const domNodes = document.querySelectorAll("*").length;
  if (domNodes > 5000) {
    patterns.push(`Excessive DOM nodes: ${domNodes}`);
  }

  // Check for event listeners
  const eventListenerCount = (window as any).getEventListeners
    ? Object.keys((window as any).getEventListeners(document)).length
    : "unknown";
  if (eventListenerCount !== "unknown" && eventListenerCount > 100) {
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
  console.log("🚨 Emergency cleanup triggered");

  // Clear all intervals and timeouts - safer approach
  const highestTimeoutId = setTimeout(() => {}, 0);
  clearTimeout(highestTimeoutId);
  const timeoutNumber = Number(highestTimeoutId);

  if (!isNaN(timeoutNumber)) {
    for (let i = 0; i <= timeoutNumber && i <= 10000; i++) {
      // Limit to 10k for safety
      clearTimeout(i);
      clearInterval(i);
    }
  }

  // Force garbage collection if available
  if ("gc" in window && typeof (window as any).gc === "function") {
    (window as any).gc();
  }

  console.log("✅ Emergency cleanup completed");
};


/**
 * Resource optimization utilities
 */
export class ResourceOptimizer {
  /**
   * Preload critical resources
   */
  static preloadResource(href: string, as: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }

  /**
   * Lazy load images with intersection observer
   */
  static initLazyImages(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

/**
 * Initialize performance monitoring for Lighthouse optimization
 */
export function initializeLighthouseOptimization(): void {
  // Initialize Core Web Vitals monitoring
  performanceMonitor.initWebVitals();
  
  // Analyze bundle performance after load
  setTimeout(() => {
    performanceMonitor.analyzeBundlePerformance();
  }, 3000);
  
  // Initialize lazy loading
  ResourceOptimizer.initLazyImages();
  
  // Clean up on unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.disconnect();
  });
}

// Add to window for debugging
declare global {
  interface Window {
    performanceMonitor: PerformanceMonitor;
    emergencyCleanup: () => void;
    detectCrashPatterns: () => string[];
    initializeLighthouseOptimization: () => void;
  }
}

if (typeof window !== "undefined") {
  window.performanceMonitor = performanceMonitor;
  window.emergencyCleanup = emergencyCleanup;
  window.detectCrashPatterns = detectCrashPatterns;
  window.initializeLighthouseOptimization = initializeLighthouseOptimization;
}
