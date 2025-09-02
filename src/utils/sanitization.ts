// ============================================
// INPUT SANITIZATION UTILITIES
// ============================================

/**
 * Remove HTML tags and dangerous content from user input
 */
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const textArea = document.createElement('textarea');
  textArea.innerHTML = sanitized;
  sanitized = textArea.value;
  
  return sanitized.trim();
};

/**
 * Sanitize user input for display (keeps safe formatting)
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize input for use in URLs
 */
export const sanitizeUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  
  // Remove whitespace
  url = url.trim();
  
  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return null;
    }
  }
  
  // Ensure URL starts with http:// or https://
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return null;
    }
    return urlObj.toString();
  } catch {
    return null;
  }
};

/**
 * Sanitize filename to prevent directory traversal
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename || typeof filename !== 'string') return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow alphanumeric, dots, underscores, hyphens
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\.+/, '') // Remove leading dots
    .slice(0, 255); // Limit length
};

/**
 * Sanitize JSON string for safe parsing
 */
export const safeJsonParse = <T = any>(
  jsonString: string,
  fallback?: T
): T | undefined => {
  try {
    // Remove any BOM or zero-width characters
    const cleaned = jsonString.replace(/^\uFEFF/, '').trim();
    
    if (!cleaned) {
      return fallback;
    }
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
};

/**
 * Sanitize number input
 */
export const sanitizeNumber = (
  input: string | number,
  options: {
    min?: number;
    max?: number;
    decimals?: number;
    allowNegative?: boolean;
  } = {}
): number | null => {
  const { min, max, decimals = 2, allowNegative = false } = options;
  
  // Convert to string and clean
  let cleaned = String(input).trim();
  
  // Remove non-numeric characters except . and -
  cleaned = cleaned.replace(/[^0-9.-]/g, '');
  
  // Handle negative numbers
  if (!allowNegative) {
    cleaned = cleaned.replace(/-/g, '');
  }
  
  // Parse the number
  const num = parseFloat(cleaned);
  
  if (isNaN(num)) {
    return null;
  }
  
  // Apply constraints
  let result = num;
  
  if (min !== undefined && result < min) {
    result = min;
  }
  
  if (max !== undefined && result > max) {
    result = max;
  }
  
  // Round to specified decimals
  result = Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals);
  
  return result;
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/gi, ''); // Only allow valid email characters
};

/**
 * Sanitize search query
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') return '';
  
  return query
    .replace(/[<>\"']/g, '') // Remove potential XSS characters
    .replace(/\\+/g, '') // Remove backslashes
    .trim()
    .slice(0, 100); // Limit length
};

/**
 * Escape HTML entities for safe display
 */
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char);
};

/**
 * Sanitize object keys and values recursively
 */
export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  maxDepth: number = 10,
  currentDepth: number = 0
): T => {
  if (currentDepth >= maxDepth) {
    throw new Error('Maximum recursion depth exceeded');
  }
  
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Sanitize key
      const sanitizedKey = sanitizeText(key);
      
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = sanitizeText(value);
      } else if (typeof value === 'number') {
        sanitized[sanitizedKey] = value;
      } else if (typeof value === 'boolean') {
        sanitized[sanitizedKey] = value;
      } else if (value === null || value === undefined) {
        sanitized[sanitizedKey] = value;
      } else if (typeof value === 'object') {
        sanitized[sanitizedKey] = sanitizeObject(value, maxDepth, currentDepth + 1);
      }
    }
  }
  
  return sanitized;
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(
        (timestamp) => now - timestamp < this.windowMs
      );
      
      if (validAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, validAttempts);
      }
    }
  }
}