import { z } from 'zod';

// ============================================
// SUBSCRIPTION VALIDATION SCHEMAS
// ============================================

export const subscriptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Subscription name is required').max(100),
  description: z.string().max(500).optional(),
  amount: z.number()
    .positive('Amount must be positive')
    .max(99999, 'Amount exceeds maximum limit'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD']).default('USD'),
  billingCycle: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
  nextBillingDate: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime()) && d > new Date();
  }, 'Next billing date must be in the future'),
  category: z.string().min(1, 'Category is required').max(50),
  status: z.enum(['active', 'paused', 'cancelled', 'trial']),
  paymentMethodId: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
});

export type ValidatedSubscription = z.infer<typeof subscriptionSchema>;

// ============================================
// PAYMENT CARD VALIDATION SCHEMAS
// ============================================

export const paymentCardSchema = z.object({
  id: z.string().min(1),
  nickname: z.string().min(1, 'Card nickname is required').max(50),
  last4: z.string().regex(/^\d{4}$/, 'Last 4 digits must be exactly 4 numbers'),
  brand: z.enum(['Visa', 'Mastercard', 'Amex', 'Discover', 'Unknown']),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()).max(new Date().getFullYear() + 20),
  isDefault: z.boolean(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// For adding a new card (includes full validation)
export const newPaymentCardSchema = z.object({
  cardNumber: z.string().refine((num) => {
    const cleaned = num.replace(/\s/g, '');
    return validateLuhn(cleaned);
  }, 'Invalid card number'),
  cardholderName: z.string()
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(100)
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid cardholder name'),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().refine((year) => {
    const currentYear = new Date().getFullYear();
    return year >= currentYear && year <= currentYear + 20;
  }, 'Invalid expiry year'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  nickname: z.string().min(1).max(50),
  setAsDefault: z.boolean().optional(),
});

// Luhn algorithm for card validation
function validateLuhn(cardNumber: string): boolean {
  if (!/^\d{13,19}$/.test(cardNumber)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// ============================================
// BUDGET POD VALIDATION SCHEMAS
// ============================================

export const budgetPodSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Budget pod name is required').max(100),
  description: z.string().max(500).optional(),
  budgetType: z.enum(['fixed', 'percentage', 'envelope', 'goal']),
  amount: z.number().positive('Budget amount must be positive'),
  spent: z.number().min(0, 'Spent amount cannot be negative'),
  period: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
  rolloverEnabled: z.boolean(),
  rolloverAmount: z.number().min(0).optional(),
  categories: z.array(z.string()).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  iconName: z.string().optional(),
});

export const transactionSchema = z.object({
  id: z.string().min(1),
  podId: z.string().min(1),
  amount: z.number().positive('Transaction amount must be positive'),
  description: z.string().min(1).max(200),
  date: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, 'Invalid date format'),
  category: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

// ============================================
// SETTINGS VALIDATION SCHEMAS
// ============================================

export const emailSchema = z.string()
  .email('Invalid email address')
  .min(3)
  .max(255);

export const userSettingsSchema = z.object({
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100)
    .regex(/^[a-zA-Z0-9\s'-]+$/, 'Display name contains invalid characters'),
  email: emailSchema,
  notifications: z.object({
    emailNotifications: z.boolean(),
    budgetAlerts: z.boolean(),
    subscriptionReminders: z.boolean(),
    weeklyReports: z.boolean(),
    alertThreshold: z.number().min(0).max(100),
  }),
  preferences: z.object({
    currency: z.enum(['USD', 'EUR', 'GBP', 'CAD']),
    timezone: z.string(),
    fiscalMonthStartDay: z.number().min(1).max(31),
    darkMode: z.boolean(),
    dataRetentionDays: z.number().min(30).max(730),
  }),
});

// ============================================
// REMINDER VALIDATION SCHEMAS
// ============================================

export const reminderSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Reminder title is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['payment', 'renewal', 'trial_ending', 'custom']),
  dueDate: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, 'Invalid due date'),
  priority: z.enum(['low', 'medium', 'high']),
  isComplete: z.boolean(),
  subscriptionId: z.string().optional(),
  amount: z.number().positive().optional(),
});

// ============================================
// SEARCH/FILTER VALIDATION SCHEMAS
// ============================================

export const searchQuerySchema = z.string()
  .max(100, 'Search query too long')
  .refine((query) => {
    // Prevent potential XSS in search
    const dangerous = /<script|javascript:|on\w+=/gi;
    return !dangerous.test(query);
  }, 'Invalid search query');

export const filterSchema = z.object({
  categories: z.array(z.string()).optional(),
  status: z.array(z.enum(['active', 'paused', 'cancelled', 'trial'])).optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().positive().optional(),
  billingCycle: z.array(z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])).optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
});

// ============================================
// UTILITY VALIDATION FUNCTIONS
// ============================================

export const validateAmount = (amount: string | number): { valid: boolean; value?: number; error?: string } => {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return { valid: false, error: 'Invalid number' };
    if (num < 0) return { valid: false, error: 'Amount cannot be negative' };
    if (num > 99999) return { valid: false, error: 'Amount exceeds maximum limit' };
    return { valid: true, value: num };
  } catch {
    return { valid: false, error: 'Invalid amount' };
  }
};

export const validateDate = (date: string): { valid: boolean; value?: Date; error?: string } => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return { valid: false, error: 'Invalid date format' };
    return { valid: true, value: d };
  } catch {
    return { valid: false, error: 'Invalid date' };
  }
};

export const validatePercentage = (value: number): { valid: boolean; error?: string } => {
  if (value < 0 || value > 100) {
    return { valid: false, error: 'Percentage must be between 0 and 100' };
  }
  return { valid: true };
};

export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url) return { valid: true }; // Optional
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// ============================================
// FORM VALIDATION HELPER
// ============================================

export const validateForm = <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};