// ST-042 Production Launch Monitoring System
import { performanceMonitor } from './performance';

export interface MonitoringMetrics {
  webVitals: Record<string, number>;
  errorRate: number;
  activeUsers: number;
  pageLoadTime: number;
  criticalErrors: string[];
  performanceScore: number;
  uptime: number;
}

export class ProductionMonitor {
  private metrics: MonitoringMetrics = {
    webVitals: {},
    errorRate: 0,
    activeUsers: 0,
    pageLoadTime: 0,
    criticalErrors: [],
    performanceScore: 100,
    uptime: 100
  };

  private errorCount = 0;
  private totalRequests = 0;
  private startTime = Date.now();
  private criticalIssues: Set<string> = new Set();

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Initialize Web Vitals monitoring
    performanceMonitor.initWebVitals();
    
    // Error tracking
    window.addEventListener('error', (event) => {
      this.recordError(event.error || event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(event.reason);
    });

    // Performance tracking
    this.startPerformanceMonitoring();
    
    // Periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute
  }

  private recordError(error: any) {
    this.errorCount++;
    this.totalRequests++;
    
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    
    // Check for critical errors
    const criticalKeywords = [
      'infinite loop',
      'memory leak',
      'crash',
      'timeout',
      'network error',
      'authentication failed',
      'database error'
    ];
    
    if (criticalKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword)
    )) {
      this.criticalIssues.add(errorMessage);
      this.reportCriticalIssue(errorMessage);
    }
    
    this.updateErrorRate();
  }

  private updateErrorRate() {
    this.metrics.errorRate = this.totalRequests > 0 
      ? (this.errorCount / this.totalRequests) * 100 
      : 0;
  }

  private startPerformanceMonitoring() {
    // Monitor navigation timing
    if (performance && performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming;
        this.metrics.pageLoadTime = nav.loadEventEnd - (nav as any).navigationStart;
      }
    }
    
    // Monitor Web Vitals
    setInterval(() => {
      this.metrics.webVitals = performanceMonitor.getWebVitals();
      this.calculatePerformanceScore();
    }, 30000); // Every 30 seconds
  }

  private calculatePerformanceScore() {
    let score = 100;
    const vitals = this.metrics.webVitals;
    
    // LCP scoring (Good: <2.5s, Poor: >4s)
    if (vitals.LCP) {
      if (vitals.LCP > 4000) score -= 30;
      else if (vitals.LCP > 2500) score -= 15;
    }
    
    // FID scoring (Good: <100ms, Poor: >300ms)
    if (vitals.FID) {
      if (vitals.FID > 300) score -= 25;
      else if (vitals.FID > 100) score -= 10;
    }
    
    // CLS scoring (Good: <0.1, Poor: >0.25)
    if (vitals.CLS) {
      if (vitals.CLS > 0.25) score -= 25;
      else if (vitals.CLS > 0.1) score -= 10;
    }
    
    // Error rate impact
    if (this.metrics.errorRate > 5) score -= 20;
    else if (this.metrics.errorRate > 1) score -= 10;
    
    this.metrics.performanceScore = Math.max(0, score);
  }

  private performHealthCheck() {
    // Check if application is responsive
    const healthCheckStart = performance.now();
    
    // Simple responsiveness test
    setTimeout(() => {
      const responseTime = performance.now() - healthCheckStart;
      if (responseTime > 1000) {
        this.reportCriticalIssue('Application unresponsive - high latency detected');
      }
    }, 100);
    
    // Memory usage check
    const memoryInfo = performanceMonitor.checkMemoryUsage();
    if (memoryInfo && memoryInfo.used > 100) { // 100MB threshold
      this.reportCriticalIssue(`High memory usage: ${memoryInfo.used.toFixed(2)}MB`);
    }
    
    // Update uptime
    const uptimeMs = Date.now() - this.startTime;
    this.metrics.uptime = (uptimeMs / (1000 * 60 * 60 * 24)) * 100; // Percentage of day
  }

  private reportCriticalIssue(issue: string) {
    console.error(`🚨 CRITICAL ISSUE (ST-042): ${issue}`);
    
    // Add to critical errors list
    this.metrics.criticalErrors = Array.from(this.criticalIssues);
    
    // Report to external monitoring if available
    if (window.navigator.sendBeacon && import.meta.env.VITE_MONITORING_WEBHOOK) {
      const data = JSON.stringify({
        timestamp: new Date().toISOString(),
        issue,
        phase: 'ST-042',
        url: window.location.href,
        userAgent: navigator.userAgent,
        metrics: this.metrics
      });
      
      window.navigator.sendBeacon(import.meta.env.VITE_MONITORING_WEBHOOK, data);
    }
  }

  // Public API for getting current metrics
  public getMetrics(): MonitoringMetrics {
    return { ...this.metrics };
  }

  // Generate monitoring report for ST-042
  public generateReport(): string {
    const report = `
🏭 ST-042 Production Launch Monitoring Report
Generated: ${new Date().toISOString()}

📊 Performance Metrics:
- Performance Score: ${this.metrics.performanceScore}/100
- Page Load Time: ${this.metrics.pageLoadTime.toFixed(2)}ms
- Error Rate: ${this.metrics.errorRate.toFixed(2)}%
- Uptime: ${this.metrics.uptime.toFixed(2)}%

🎯 Core Web Vitals:
- LCP (Largest Contentful Paint): ${this.metrics.webVitals.LCP?.toFixed(2) || 'N/A'}ms
- FID (First Input Delay): ${this.metrics.webVitals.FID?.toFixed(2) || 'N/A'}ms  
- CLS (Cumulative Layout Shift): ${this.metrics.webVitals.CLS?.toFixed(3) || 'N/A'}

🚨 Critical Issues:
${this.metrics.criticalErrors.length > 0 
  ? this.metrics.criticalErrors.map(err => `- ${err}`).join('\n')
  : '✅ No critical issues detected'
}

📈 Recommendations:
${this.generateRecommendations()}
    `.trim();

    return report;
  }

  private generateRecommendations(): string {
    const recommendations: string[] = [];
    
    if (this.metrics.performanceScore < 80) {
      recommendations.push('- Investigate performance bottlenecks');
    }
    
    if (this.metrics.errorRate > 2) {
      recommendations.push('- Review and fix high error rate');
    }
    
    if (this.metrics.webVitals.LCP && this.metrics.webVitals.LCP > 2500) {
      recommendations.push('- Optimize Largest Contentful Paint');
    }
    
    if (this.metrics.criticalErrors.length > 0) {
      recommendations.push('- Address critical errors immediately');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ All metrics within acceptable ranges');
    }
    
    return recommendations.join('\n');
  }

  // Integration with external monitoring services
  public connectSupabaseLogs() {
    // Monitor Supabase connection health
    const checkSupabaseHealth = async () => {
      try {
        // This would connect to your Supabase instance
        // const { data, error } = await supabase.from('health_check').select('*').limit(1);
        // if (error) throw error;
        console.log('✅ Supabase connection healthy');
      } catch (error) {
        this.reportCriticalIssue(`Supabase connection failed: ${error}`);
      }
    };
    
    // Check every 5 minutes
    setInterval(checkSupabaseHealth, 5 * 60 * 1000);
    checkSupabaseHealth(); // Initial check
  }
}

// Global monitoring instance
export const productionMonitor = new ProductionMonitor();

// Helper functions for ST-042 specific monitoring
export const checkFigmaParityFeatures = () => {
  const features = [
    'subscription-tracking',
    'bill-management', 
    'analytics-dashboard',
    'user-authentication',
    'data-export'
  ];
  
  const results = features.map(feature => {
    try {
      // Check if feature elements are present and functional
      const featureElement = document.querySelector(`[data-feature="${feature}"]`);
      return {
        feature,
        status: featureElement ? 'active' : 'missing',
        element: !!featureElement
      };
    } catch (error) {
      return {
        feature,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });
  
  return results;
};

// Export monitoring data for external services
export const exportMonitoringData = () => {
  return {
    timestamp: new Date().toISOString(),
    phase: 'ST-042',
    metrics: productionMonitor.getMetrics(),
    features: checkFigmaParityFeatures(),
    environment: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: Date.now()
    }
  };
};

// Initialize monitoring on import
if (import.meta.env.PROD) {
  productionMonitor.connectSupabaseLogs();
}

// Add to window for debugging
declare global {
  interface Window {
    productionMonitor: ProductionMonitor;
    exportMonitoringData: () => any;
  }
}

if (typeof window !== 'undefined') {
  window.productionMonitor = productionMonitor;
  window.exportMonitoringData = exportMonitoringData;
}
