import { z } from "zod";

// Subscription validation schema
export const subscriptionSchema = z.object({
  name: z
    .string()
    .min(1, "Subscription name is required")
    .max(100, "Name must be less than 100 characters"),
  
  cost: z
    .number()
    .min(0, "Cost must be positive")
    .max(99999, "Cost must be less than $99,999"),
  
  billingCycle: z.enum(["monthly", "quarterly", "yearly", "variable"], {
    message: "Please select a valid billing cycle",
  }),
  
  nextPayment: z
    .string()
    .min(1, "Next payment date is required")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Please enter a valid date"),
  
  category: z
    .string()
    .min(1, "Category is required"),
  
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  
  billingUrl: z
    .string()
    .optional()
    .refine((url) => {
      if (!url || url.trim() === "") return true;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid URL"),
  
  subscriptionType: z.enum(["personal", "business"]),
  
  tags: z
    .string()
    .optional(),
  
  planType: z.enum(["free", "paid", "trial"]),
  
  priority: z.enum(["low", "medium", "high", "essential", "important", "nice-to-have"]).optional(),
  
  watchlistNotes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  
  cardId: z.string().optional(),
  
  automationEnabled: z.boolean().default(false),
  
  // Variable pricing validation
  variablePricing: z.object({
    isVariable: z.boolean().default(false),
    upcomingChanges: z.array(z.object({
      date: z.string().optional(),
      cost: z.string().optional(),
      description: z.string().optional(),
    })).optional(),
  }).optional(),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

// Watchlist-specific schema with extended validation
export const watchlistSchema = subscriptionSchema.extend({
  priority: z.enum(["low", "medium", "high"], {
    message: "Priority is required for watchlist items",
  }),
  watchlistNotes: z
    .string()
    .min(10, "Please add some notes about why you're interested in this subscription")
    .max(1000, "Notes must be less than 1000 characters"),
});

export type WatchlistFormData = z.infer<typeof watchlistSchema>;

// Validation rules for different contexts
export const getValidationSchema = (isWatchlistMode: boolean) => {
  return isWatchlistMode ? watchlistSchema : subscriptionSchema;
};

// Custom validation messages
export const validationMessages = {
  required: "This field is required",
  invalidEmail: "Please enter a valid email address",
  invalidUrl: "Please enter a valid URL",
  positiveNumber: "Must be a positive number",
  futureDate: "Date must be in the future",
  pastDate: "Date must be in the past",
  maxLength: (max: number) => `Must be less than ${max} characters`,
  minLength: (min: number) => `Must be at least ${min} characters`,
} as const;
