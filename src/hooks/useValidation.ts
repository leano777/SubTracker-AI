import { useState, useCallback } from 'react';
import { z } from 'zod';
import { sanitizeText, sanitizeHtml, sanitizeNumber } from '../utils/sanitization';

interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: Record<string, string>;
  validate: (data: unknown) => boolean;
  validateField: (field: string, value: unknown) => string | null;
  clearErrors: () => void;
  setFieldError: (field: string, error: string) => void;
  sanitizeInput: (value: string, type?: 'text' | 'html' | 'number') => string | number | null;
}

/**
 * Custom hook for form validation with Zod schemas
 */
export function useValidation<T>(schema: z.ZodSchema<T>): ValidationResult<T> {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [validatedData, setValidatedData] = useState<T | undefined>();

  /**
   * Validate entire form data
   */
  const validate = useCallback((data: unknown): boolean => {
    try {
      const result = schema.parse(data);
      setValidatedData(result);
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!newErrors[path]) {
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
        setIsValid(false);
      }
      return false;
    }
  }, [schema]);

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: string, value: unknown): string | null => {
    try {
      // Create a partial schema for the field if possible
      const fieldPath = field.split('.');
      let fieldSchema: any = schema;
      
      // Navigate to the field schema
      for (const part of fieldPath) {
        if (fieldSchema._def?.shape) {
          fieldSchema = fieldSchema._def.shape[part];
        } else if (fieldSchema.shape) {
          fieldSchema = fieldSchema.shape[part];
        }
      }
      
      if (fieldSchema) {
        fieldSchema.parse(value);
        
        // Clear error for this field
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        
        return null;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || 'Validation failed';
        
        // Set error for this field
        setErrors((prev) => ({
          ...prev,
          [field]: errorMessage,
        }));
        
        return errorMessage;
      }
    }
    
    return null;
  }, [schema]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  /**
   * Set error for a specific field
   */
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
    setIsValid(false);
  }, []);

  /**
   * Sanitize input based on type
   */
  const sanitizeInput = useCallback((
    value: string,
    type: 'text' | 'html' | 'number' = 'text'
  ): string | number | null => {
    switch (type) {
      case 'html':
        return sanitizeHtml(value);
      case 'number':
        return sanitizeNumber(value);
      case 'text':
      default:
        return sanitizeText(value);
    }
  }, []);

  return {
    isValid,
    data: validatedData,
    errors,
    validate,
    validateField,
    clearErrors,
    setFieldError,
    sanitizeInput,
  };
}

/**
 * Hook for real-time field validation
 */
export function useFieldValidation(
  schema: z.ZodSchema,
  debounceMs: number = 300
) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const validateField = useCallback((value: unknown) => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setIsValidating(true);

    // Debounce validation
    const newTimeoutId = setTimeout(() => {
      try {
        schema.parse(value);
        setError(null);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setError(error.errors[0]?.message || 'Invalid value');
        }
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);

    setTimeoutId(newTimeoutId);
  }, [schema, debounceMs, timeoutId]);

  const clearError = useCallback(() => {
    setError(null);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }, [timeoutId]);

  return {
    error,
    isValidating,
    validateField,
    clearError,
  };
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  // Credit card patterns
  VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
  MASTERCARD: /^5[1-5][0-9]{14}$/,
  AMEX: /^3[47][0-9]{13}$/,
  DISCOVER: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
  
  // Common patterns
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PHONE_US: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  ZIP_US: /^\d{5}(-\d{4})?$/,
  
  // Security patterns
  NO_SCRIPT: /^(?!.*<script).*$/i,
  NO_SQL_INJECTION: /^(?!.*(;|--|SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)).*$/i,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.@]+$/,
  
  // Financial patterns
  CURRENCY: /^\$?\d+(\.\d{2})?$/,
  PERCENTAGE: /^(100|[0-9]{1,2})(\.\d{1,2})?%?$/,
};

/**
 * Common validation messages
 */
export const ValidationMessages = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_ZIP: 'Please enter a valid ZIP code',
  INVALID_CARD: 'Please enter a valid card number',
  INVALID_CVV: 'Please enter a valid CVV',
  INVALID_EXPIRY: 'Please enter a valid expiry date',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be no more than ${max}`,
  PATTERN_MISMATCH: 'Please enter a valid value',
  DANGEROUS_INPUT: 'This input contains potentially dangerous content',
};