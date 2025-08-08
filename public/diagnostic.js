// Lightweight crash diagnostic script - runs before React
(function() {
  'use strict';
  
  let crashPatterns = [];
  let performanceIssues = [];
  
  // Function to safely log issues
  function safeLog(type, message, data) {
    try {
      console[type](`🚨 [DIAGNOSTIC] ${message}`, data || '');
    } catch (e) {
      // Fallback if console fails
      if (window.alert && type === 'error') {
        window.alert(`CRASH DIAGNOSTIC: ${message}`);
      }
    }
  }
  
  // Monitor for excessive DOM nodes
  function checkDOMNodes() {
    try {
      const nodeCount = document.querySelectorAll('*').length;
      if (nodeCount > 5000) {
        crashPatterns.push(`Excessive DOM nodes: ${nodeCount}`);
        safeLog('warn', 'Excessive DOM nodes detected', nodeCount);
      }
    } catch (e) {
      safeLog('error', 'DOM node check failed', e.message);
    }
  }
  
  // Monitor memory usage if available
  function checkMemoryUsage() {
    try {
      if (performance.memory) {
        const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
        if (usedMB > 100) { // Alert at 100MB
          performanceIssues.push(`High memory usage: ${usedMB.toFixed(2)}MB`);
          safeLog('warn', 'High memory usage detected', `${usedMB.toFixed(2)}MB`);
        }
      }
    } catch (e) {
      safeLog('error', 'Memory check failed', e.message);
    }
  }
  
  // Monitor for infinite loops by tracking script execution time
  let scriptStartTime = Date.now();
  function checkExecutionTime() {
    const executionTime = Date.now() - scriptStartTime;
    if (executionTime > 5000) { // 5 second threshold
      crashPatterns.push(`Long script execution: ${executionTime}ms`);
      safeLog('error', 'Long script execution detected', `${executionTime}ms`);
    }
  }
  
  // Emergency cleanup function
  window.emergencyCleanup = function() {
    safeLog('warn', 'Emergency cleanup triggered');
    
    try {
      // Clear intervals and timeouts
      const highestId = setTimeout(() => {}, 0);
      for (let i = 0; i <= highestId; i++) {
        clearTimeout(i);
        clearInterval(i);
      }
      
      // Force garbage collection if available
      if (window.gc && typeof window.gc === 'function') {
        window.gc();
      }
      
      safeLog('log', 'Emergency cleanup completed');
    } catch (e) {
      safeLog('error', 'Emergency cleanup failed', e.message);
    }
  };
  
  // Global error handler
  window.addEventListener('error', function(event) {
    crashPatterns.push(`JavaScript Error: ${event.error?.message || 'Unknown'}`);
    safeLog('error', 'JavaScript error caught', {
      message: event.error?.message,
      filename: event.filename,
      lineno: event.lineno,
      stack: event.error?.stack?.substring(0, 500) // Limit stack trace
    });
  });
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    crashPatterns.push(`Unhandled Promise Rejection: ${event.reason}`);
    safeLog('error', 'Unhandled promise rejection', event.reason);
  });
  
  // Check for browser crash patterns every 3 seconds
  let diagnosticInterval = setInterval(function() {
    try {
      checkDOMNodes();
      checkMemoryUsage();
      checkExecutionTime();
      
      // Reset script start time for next interval
      scriptStartTime = Date.now();
      
      // Log summary if issues found
      if (crashPatterns.length > 0 || performanceIssues.length > 0) {
        safeLog('warn', 'Diagnostic Summary', {
          crashPatterns: crashPatterns,
          performanceIssues: performanceIssues
        });
      }
      
    } catch (e) {
      safeLog('error', 'Diagnostic interval failed', e.message);
      clearInterval(diagnosticInterval);
    }
  }, 3000);
  
  // Expose diagnostic data
  window.getDiagnosticData = function() {
    return {
      crashPatterns: [...crashPatterns],
      performanceIssues: [...performanceIssues],
      timestamp: new Date().toISOString()
    };
  };
  
  safeLog('log', 'Crash diagnostic script loaded successfully');
})();
