/**
 * Sentry Error Tracking Configuration
 * Production error monitoring and performance tracking
 */

import * as Sentry from '@sentry/react';

// Environment-based Sentry configuration
const isProduction = import.meta.env.NODE_ENV === 'production';
const sentryDSN = import.meta.env.VITE_SENTRY_DSN;
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.NODE_ENV || 'development';

/**
 * Initialize Sentry error tracking
 * Only runs in production with valid DSN
 */
export const initSentry = () => {
  // Only initialize Sentry if DSN is provided and we're in production
  if (!sentryDSN || !isProduction) {
    console.info('Sentry error tracking disabled (development mode or missing DSN)');
    return;
  }

  try {
    Sentry.init({
      dsn: sentryDSN,
      environment,
      release: `subtracker-ai@${appVersion}`,
      
      // Integrations
      integrations: [
        Sentry.browserTracingIntegration({
          // Set sampling rate for performance monitoring
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/.*\.supabase\.co\//, // Supabase API
            /^https:\/\/your-api-domain\.com\//,
          ],
        }),
      ],

      // Performance monitoring
      tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in dev
      
      // Error filtering
      beforeSend(event, hint) {
        // Filter out non-critical errors
        const error = hint.originalException;
        
        // Skip network errors that are not actionable
        if (error && error.toString().includes('Network Error')) {
          return null;
        }
        
        // Skip ResizeObserver errors (common browser quirk)
        if (error && error.toString().includes('ResizeObserver')) {
          return null;
        }
        
        // Skip authentication-related errors (these are expected)
        if (event.exception?.values?.[0]?.value?.includes('auth')) {
          return null;
        }
        
        return event;
      },
      
      // Session tracking
      autoSessionTracking: true,
      
      // Privacy settings
      sendDefaultPii: false,
      
      // Debug mode (disabled in production)
      debug: !isProduction,
      
      // Maximum breadcrumbs to collect
      maxBreadcrumbs: 50,
      
      // Attach stacktraces to pure capture message calls
      attachStacktrace: true,
      
      // Set user context
      initialScope: {
        tags: {
          component: 'SubTracker-AI',
          version: appVersion,
        },
        level: 'info',
      },
    });
    
    console.info('Sentry error tracking initialized');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
};

/**
 * Capture an exception with context
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (!isProduction) {
    console.error('Error (dev mode):', error, context);
    return;
  }
  
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('errorContext', context);
    }
    Sentry.captureException(error);
  });
};

/**
 * Capture a message with level
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  if (!isProduction) {
    console.log(`Message (${level}):`, message, context);
    return;
  }
  
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('messageContext', context);
    }
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (user: {
  id?: string;
  email?: string;
  username?: string;
}) => {
  if (!isProduction) return;
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category = 'custom', level: Sentry.SeverityLevel = 'info', data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Performance monitoring transaction
 */
export const startTransaction = (name: string, op = 'navigation') => {
  if (!isProduction) return null;
  
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Sentry Error Boundary component
 */
export const SentryErrorBoundary = Sentry.withErrorBoundary;

export default {
  initSentry,
  captureException,
  captureMessage,
  setUserContext,
  addBreadcrumb,
  startTransaction,
  SentryErrorBoundary,
};