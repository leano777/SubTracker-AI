import * as Sentry from '@sentry/react';

// Sentry configuration for production monitoring
export function initSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_NODE_ENV || 'production',
      integrations: [
        // Performance monitoring
        new Sentry.BrowserTracing({
          // Capture interactions like clicks, form submissions
          // Routing instrumentation disabled for now - requires router integration
          // routingInstrumentation: Sentry.reactRouterV6Instrumentation(),
        }),
        // Replay sessions for debugging
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance monitoring sample rate
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Session replay sample rate
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Enhanced error context
      beforeSend: (event, hint) => {
        // Add custom context
        event.contexts = {
          ...event.contexts,
          app_info: {
            figma_parity_phase: 'ST-042',
            deployment_phase: 'production',
          }
        };
        
        // Filter out known non-critical errors
        if (event.exception) {
          const error = hint.originalException;
          if (error && error.toString().includes('Non-Error promise rejection')) {
            return null;
          }
        }
        
        return event;
      },
      
      // Custom tags for filtering
      initialScope: {
        tags: {
          component: 'subtracker-ai',
          phase: 'ST-042-production-launch'
        }
      }
    });
  }
}

// Custom error boundary for React components
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Manual error reporting utility
export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional_info', context);
    }
    scope.setTag('error_source', 'manual_report');
    Sentry.captureException(error);
  });
};

// Performance measurement utility
export const measurePerformance = (name: string, fn: () => void) => {
  const transaction = Sentry.startTransaction({ name });
  Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction));
  
  try {
    fn();
  } finally {
    transaction.finish();
  }
};
