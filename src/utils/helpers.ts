import type { FullSubscription } from "../types/subscription";

// Enhanced date utilities for Thursday-based pay periods
export function getNextThursday(date: Date = new Date()): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7; // 4 = Thursday

  // If it's already Thursday and before noon, consider it current Thursday
  // Otherwise, get next Thursday
  if (dayOfWeek === 4 && result.getHours() < 12) {
    return result;
  }

  result.setDate(result.getDate() + (daysUntilThursday || 7));
  result.setHours(9, 0, 0, 0); // Set to 9 AM on Thursday (typical payday time)
  return result;
}

export function getPreviousThursday(date: Date = new Date()): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  const daysSinceThursday = (dayOfWeek - 4 + 7) % 7;

  if (dayOfWeek === 4 && result.getHours() >= 12) {
    // If it's Thursday afternoon, consider it current Thursday
    result.setHours(9, 0, 0, 0);
    return result;
  }

  result.setDate(result.getDate() - (daysSinceThursday || 7));
  result.setHours(9, 0, 0, 0);
  return result;
}

export function getThursdayOfWeek(year: number, week: number): Date {
  const firstDayOfYear = new Date(year, 0, 1);
  const firstThursdayOfYear = getNextThursday(firstDayOfYear);

  const thursdayOfWeek = new Date(firstThursdayOfYear);
  thursdayOfWeek.setDate(firstThursdayOfYear.getDate() + (week - 1) * 7);

  return thursdayOfWeek;
}

export function getWeekString(date: Date): string {
  const thursday = getNextThursday(date);
  const year = thursday.getFullYear();

  // Calculate week number based on Thursday (ISO 8601 standard)
  const firstThursday = getNextThursday(new Date(year, 0, 1));
  const weekNumber = Math.ceil(
    (thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000) + 1
  );

  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

export function getWeekRange(weekString: string): { start: Date; end: Date; thursday: Date } {
  const [year, week] = weekString.split("-W").map(Number);
  const thursday = getThursdayOfWeek(year, week);

  const start = new Date(thursday);
  start.setDate(thursday.getDate() - 3); // Monday (Thursday - 3 days)
  start.setHours(0, 0, 0, 0);

  const end = new Date(thursday);
  end.setDate(thursday.getDate() + 3); // Sunday (Thursday + 3 days)
  end.setHours(23, 59, 59, 999);

  return { start, end, thursday };
}

// Enhanced currency formatting with more options
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
  minimumFractionDigits: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Enhanced amount calculation supporting variable pricing
export function calculateWeeklyAmount(
  price: number,
  frequency: string,
  variablePricing?: { averagePrice: number }
): number {
  const basePrice = variablePricing?.averagePrice ?? price;

  // Handle undefined, null, or invalid frequency with more robust checking
  if (!frequency || typeof frequency !== "string" || frequency.trim() === "") {
    console.warn(
      "❌ Invalid frequency provided to calculateWeeklyAmount:",
      frequency,
      'using fallback value of "monthly"'
    );
    console.warn("  Subscription details - Price:", {
      price,
      frequency,
      variablePricing,
      priceType: typeof price,
      frequencyType: typeof frequency,
    });
    return basePrice / 4.33; // Default to monthly (divide by average weeks per month)
  }

  const normalizedFrequency = frequency.toLowerCase().trim();

  switch (normalizedFrequency) {
    case "weekly":
    case "week":
      return basePrice;
    case "monthly":
    case "month":
      return basePrice / 4.33; // Average weeks per month
    case "yearly":
    case "annual":
    case "year":
      return basePrice / 52; // Weeks per year
    case "daily":
    case "day":
      return basePrice * 7; // Days per week
    case "quarterly":
    case "quarter":
      return basePrice / 13; // Weeks per quarter (52/4)
    case "semi-annually":
    case "semi-annual":
      return basePrice / 26; // Weeks per half year
    case "bi-weekly":
    case "biweekly":
      return basePrice / 2; // Every other week
    default:
      console.warn(
        `❌ Unknown frequency "${frequency}" provided to calculateWeeklyAmount, defaulting to monthly`
      );
      return basePrice / 4.33; // Default to monthly
  }
}

export function calculateMonthlyAmount(
  price: number,
  frequency: string,
  variablePricing?: { averagePrice: number }
): number {
  const basePrice = variablePricing?.averagePrice ?? price;

  // Handle undefined, null, or invalid frequency with more robust checking
  if (!frequency || typeof frequency !== "string" || frequency.trim() === "") {
    console.warn(
      "❌ Invalid frequency provided to calculateMonthlyAmount:",
      frequency,
      'using fallback value of "monthly"'
    );
    console.warn("  Subscription details - Price:", {
      price,
      frequency,
      variablePricing,
      priceType: typeof price,
      frequencyType: typeof frequency,
    });
    return basePrice; // Default to monthly (price stays the same)
  }

  const normalizedFrequency = frequency.toLowerCase().trim();

  switch (normalizedFrequency) {
    case "weekly":
    case "week":
      return basePrice * 4.33;
    case "monthly":
    case "month":
      return basePrice;
    case "yearly":
    case "annual":
    case "year":
      return basePrice / 12;
    case "daily":
    case "day":
      return basePrice * 30.44; // Average days per month
    case "quarterly":
    case "quarter":
      return basePrice / 3;
    case "semi-annually":
    case "semi-annual":
      return basePrice / 6;
    case "bi-weekly":
    case "biweekly":
      return basePrice * 2.16; // 26 bi-weekly periods per year / 12 months
    default:
      console.warn(
        `❌ Unknown frequency "${frequency}" provided to calculateMonthlyAmount, defaulting to monthly`
      );
      return basePrice;
  }
}

export function calculateYearlyAmount(
  price: number,
  frequency: string,
  variablePricing?: { averagePrice: number }
): number {
  const basePrice = variablePricing?.averagePrice ?? price;

  // Handle undefined, null, or invalid frequency with more robust checking
  if (!frequency || typeof frequency !== "string" || frequency.trim() === "") {
    console.warn(
      "❌ Invalid frequency provided to calculateYearlyAmount:",
      frequency,
      'using fallback value of "monthly"'
    );
    console.warn("  Subscription details - Price:", {
      price,
      frequency,
      variablePricing,
      priceType: typeof price,
      frequencyType: typeof frequency,
    });
    return basePrice * 12; // Default to monthly (multiply by 12 months)
  }

  const normalizedFrequency = frequency.toLowerCase().trim();

  switch (normalizedFrequency) {
    case "weekly":
    case "week":
      return basePrice * 52;
    case "monthly":
    case "month":
      return basePrice * 12;
    case "yearly":
    case "annual":
    case "year":
      return basePrice;
    case "daily":
    case "day":
      return basePrice * 365.25; // Including leap years
    case "quarterly":
    case "quarter":
      return basePrice * 4;
    case "semi-annually":
    case "semi-annual":
      return basePrice * 2;
    case "bi-weekly":
    case "biweekly":
      return basePrice * 26; // 26 bi-weekly periods per year
    default:
      console.warn(
        `❌ Unknown frequency "${frequency}" provided to calculateYearlyAmount, defaulting to monthly`
      );
      return basePrice * 12;
  }
}

// Safe wrapper functions that ensure parameters are valid before calling calculation functions
export function safeCalculateWeeklyAmount(subscription: FullSubscription): number {
  try {
    const validated = validateSubscriptionForCalculations(subscription);
    return calculateWeeklyAmount(validated.price, validated.frequency, validated.variablePricing);
  } catch (error) {
    console.error(`❌ Error in safeCalculateWeeklyAmount for "${subscription.name}":`, error);
    return 0;
  }
}

export function safeCalculateMonthlyAmount(subscription: FullSubscription): number {
  try {
    const validated = validateSubscriptionForCalculations(subscription);
    return calculateMonthlyAmount(validated.price, validated.frequency, validated.variablePricing);
  } catch (error) {
    console.error(`❌ Error in safeCalculateMonthlyAmount for "${subscription.name}":`, error);
    return 0;
  }
}

export function safeCalculateYearlyAmount(subscription: FullSubscription): number {
  try {
    const validated = validateSubscriptionForCalculations(subscription);
    return calculateYearlyAmount(validated.price, validated.frequency, validated.variablePricing);
  } catch (error) {
    console.error(`❌ Error in safeCalculateYearlyAmount for "${subscription.name}":`, error);
    return 0;
  }
}

// Calculate next payment date based on frequency
export function calculateNextPaymentDate(lastPayment: Date, frequency: string): Date {
  const nextDate = new Date(lastPayment);

  // Handle undefined or null frequency
  if (!frequency || typeof frequency !== "string") {
    console.warn(
      "Invalid frequency provided to calculateNextPaymentDate:",
      frequency,
      "defaulting to monthly"
    );
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate;
  }

  switch (frequency.toLowerCase()) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case "daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "quarterly":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case "semi-annually":
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
}

// Validate subscription data before calculations
export function validateSubscriptionForCalculations(
  subscription: FullSubscription
): FullSubscription {
  const validFrequencies = ["monthly", "yearly", "weekly", "daily"];

  // Create a safe copy to avoid modifying the original
  const safeSub = { ...subscription };

  // Debug logging to see what we're receiving
  if (safeSub.frequency === undefined || safeSub.price === undefined) {
    console.error("❌ Subscription missing required fields:", {
      id: safeSub.id,
      name: safeSub.name,
      frequency: safeSub.frequency,
      price: safeSub.price,
      frequencyType: typeof safeSub.frequency,
      priceType: typeof safeSub.price,
      hasFrequency: safeSub.hasOwnProperty("frequency"),
      hasPrice: safeSub.hasOwnProperty("price"),
      allKeys: Object.keys(safeSub),
      rawSubscription: subscription,
    });
  }

  // Ensure frequency is valid - be more specific about the validation
  if (
    !safeSub.frequency ||
    typeof safeSub.frequency !== "string" ||
    !validFrequencies.includes(safeSub.frequency)
  ) {
    console.warn(
      `⚠️ Invalid frequency "${safeSub.frequency}" (type: ${typeof safeSub.frequency}) in subscription "${safeSub.name}", fixing to monthly`
    );
    console.warn("Valid frequencies are:", validFrequencies);
    safeSub.frequency = "monthly" as const;
  }

  // Ensure price is valid
  if (typeof safeSub.price !== "number" || safeSub.price < 0 || isNaN(safeSub.price)) {
    console.warn(
      `⚠️ Invalid price "${safeSub.price}" (type: ${typeof safeSub.price}) in subscription "${safeSub.name}", fixing to 0`
    );
    safeSub.price = 0;
  }

  // Log the validated subscription for debugging

  return safeSub;
}

// Calculate subscription value metrics
export function calculateSubscriptionMetrics(subscription: FullSubscription) {
  // Validate subscription data first
  const validatedSubscription = validateSubscriptionForCalculations(subscription);

  const weeklyAmount = calculateWeeklyAmount(
    validatedSubscription.price,
    validatedSubscription.frequency,
    validatedSubscription.variablePricing
  );
  const monthlyAmount = calculateMonthlyAmount(
    validatedSubscription.price,
    validatedSubscription.frequency,
    validatedSubscription.variablePricing
  );
  const yearlyAmount = calculateYearlyAmount(
    validatedSubscription.price,
    validatedSubscription.frequency,
    validatedSubscription.variablePricing
  );

  // Calculate cost per day
  const dailyAmount = weeklyAmount / 7;

  // Calculate days until next payment
  const nextPayment = new Date(validatedSubscription.nextPayment);
  const today = new Date();
  const daysUntilPayment = Math.ceil(
    (nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate value score (lower cost per day = higher value)
  const valueScore = dailyAmount > 0 ? Math.max(0, 100 - dailyAmount * 10) : 0;

  return {
    weeklyAmount,
    monthlyAmount,
    yearlyAmount,
    dailyAmount,
    daysUntilPayment,
    valueScore,
    isOverdue: daysUntilPayment < 0,
    isDueSoon: daysUntilPayment <= 7 && daysUntilPayment >= 0,
    isDueThisWeek: daysUntilPayment >= 0 && daysUntilPayment <= 7,
  };
}

// Budget allocation utilities
export function calculateWeeklyBudgetAllocation(
  subscriptions: FullSubscription[],
  categories: Array<{ id: string; name: string; weeklyAllocation: number }>,
  weeklyIncome: number
): {
  allocations: Array<{
    categoryId: string;
    categoryName: string;
    requiredAmount: number;
    allocatedAmount: number;
    utilization: number;
    subscriptionCount: number;
  }>;
  totalRequired: number;
  totalAllocated: number;
  remainingIncome: number;
  isOverBudget: boolean;
} {
  const allocations = categories.map((category) => {
    const categorySubscriptions = subscriptions.filter(
      (sub) =>
        sub.status === "active" &&
        (sub.budgetCategory === category.id || sub.category === category.name)
    );

    const requiredAmount = categorySubscriptions.reduce((sum, sub) => {
      return sum + safeCalculateWeeklyAmount(sub);
    }, 0);

    const utilization =
      category.weeklyAllocation > 0 ? (requiredAmount / category.weeklyAllocation) * 100 : 0;

    return {
      categoryId: category.id,
      categoryName: category.name,
      requiredAmount,
      allocatedAmount: category.weeklyAllocation,
      utilization,
      subscriptionCount: categorySubscriptions.length,
    };
  });

  const totalRequired = allocations.reduce((sum, alloc) => sum + alloc.requiredAmount, 0);
  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
  const remainingIncome = weeklyIncome - totalAllocated;
  const isOverBudget = totalRequired > weeklyIncome;

  return {
    allocations,
    totalRequired,
    totalAllocated,
    remainingIncome,
    isOverBudget,
  };
}

// Subscription filtering and sorting utilities
export function filterSubscriptionsByStatus(
  subscriptions: FullSubscription[],
  status: string[]
): FullSubscription[] {
  return subscriptions.filter((sub) => status.includes(sub.status));
}

export function filterSubscriptionsByCategory(
  subscriptions: FullSubscription[],
  categories: string[]
): FullSubscription[] {
  if (categories.length === 0) return subscriptions;
  return subscriptions.filter((sub) => categories.includes(sub.category || "Uncategorized"));
}

export function filterSubscriptionsByPriceRange(
  subscriptions: FullSubscription[],
  minPrice: number,
  maxPrice: number
): FullSubscription[] {
  return subscriptions.filter((sub) => {
    const monthlyPrice = safeCalculateMonthlyAmount(sub);
    return monthlyPrice >= minPrice && monthlyPrice <= maxPrice;
  });
}

export function sortSubscriptions(
  subscriptions: FullSubscription[],
  sortBy: string,
  sortOrder: "asc" | "desc" = "asc"
): FullSubscription[] {
  const sorted = [...subscriptions].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "price":
        const aMonthly = safeCalculateMonthlyAmount(a);
        const bMonthly = safeCalculateMonthlyAmount(b);
        comparison = aMonthly - bMonthly;
        break;
      case "nextPayment":
        comparison = new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime();
        break;
      case "category":
        comparison = (a.category || "Uncategorized").localeCompare(b.category || "Uncategorized");
        break;
      case "frequency":
        comparison = a.frequency.localeCompare(b.frequency);
        break;
      case "dateAdded":
        comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  return sorted;
}

// Search utility
export function searchSubscriptions(
  subscriptions: FullSubscription[],
  searchTerm: string
): FullSubscription[] {
  if (!searchTerm.trim()) return subscriptions;

  const term = searchTerm.toLowerCase();
  return subscriptions.filter(
    (sub) =>
      sub.name.toLowerCase().includes(term) ||
      sub.category?.toLowerCase().includes(term) ||
      sub.description?.toLowerCase().includes(term) ||
      sub.website?.toLowerCase().includes(term) ||
      sub.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
      sub.notes?.toLowerCase().includes(term)
  );
}

// Date formatting utilities
export function formatDate(
  date: string | Date,
  format: "short" | "long" | "relative" = "short"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString();
    case "long":
      return dateObj.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "relative":
      const now = new Date();
      const diffTime = dateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays === -1) return "Yesterday";
      if (diffDays > 0) return `In ${diffDays} days`;
      return `${Math.abs(diffDays)} days ago`;
    default:
      return dateObj.toLocaleDateString();
  }
}

// Color utilities for categories
export function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    "Business Tools": "#3b82f6",
    Entertainment: "#ef4444",
    "Utilities & Services": "#10b981",
    "Health & Fitness": "#f59e0b",
    "Education & Learning": "#8b5cf6",
    "Personal Finance": "#06b6d4",
    "Shopping & Retail": "#84cc16",
    "Travel & Transportation": "#f97316",
    "Food & Dining": "#ec4899",
    "Home & Garden": "#6366f1",
  };

  return colors[category] || "#6b7280";
}

// Generate week options for WeekSelector
export function generateWeekOptions(
  weeksAhead: number = 8,
  weeksBehind: number = 4
): Array<{ value: string; label: string; date: string }> {
  const options: Array<{ value: string; label: string; date: string }> = [];
  const currentDate = new Date();

  for (let i = -weeksBehind; i <= weeksAhead; i++) {
    const weekDate = new Date(currentDate);
    weekDate.setDate(currentDate.getDate() + i * 7);

    const weekString = getWeekString(weekDate);
    const { thursday } = getWeekRange(weekString);

    const label =
      i === 0
        ? "This Week"
        : i === 1
          ? "Next Week"
          : i === -1
            ? "Last Week"
            : thursday.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    options.push({
      value: weekString,
      label,
      date: thursday.toLocaleDateString(),
    });
  }

  return options;
}

// Calculate savings potential
export function calculateSavingsPotential(subscriptions: FullSubscription[]): {
  unusedSubscriptions: FullSubscription[];
  potentialMonthlySavings: number;
  potentialYearlySavings: number;
  recommendations: Array<{ subscription: FullSubscription; reason: string; savings: number }>;
} {
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Find potentially unused subscriptions (no usage tracking available, so using heuristics)
  const unusedSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active" && new Date(sub.dateAdded) < sixtyDaysAgo
    // In a real app, you'd check usage metrics here
  );

  const potentialMonthlySavings = unusedSubscriptions.reduce((sum, sub) => {
    return sum + safeCalculateMonthlyAmount(sub);
  }, 0);

  const potentialYearlySavings = potentialMonthlySavings * 12;

  const recommendations = unusedSubscriptions.map((sub) => {
    return {
      subscription: sub,
      reason: "Low usage detected - consider canceling or downgrading",
      savings: safeCalculateMonthlyAmount(sub),
    };
  });

  return {
    unusedSubscriptions,
    potentialMonthlySavings,
    potentialYearlySavings,
    recommendations,
  };
}

// Validation utilities
export function validateSubscriptionData(subscription: Partial<FullSubscription>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!subscription.name?.trim()) {
    errors.push("Subscription name is required");
  }

  if (!subscription.price || subscription.price <= 0) {
    errors.push("Price must be greater than 0");
  }

  if (!subscription.frequency) {
    errors.push("Billing frequency is required");
  }

  if (!subscription.nextPayment) {
    errors.push("Next payment date is required");
  } else {
    const nextPayment = new Date(subscription.nextPayment);
    if (isNaN(nextPayment.getTime())) {
      errors.push("Invalid next payment date");
    }
  }

  if (!subscription.category?.trim()) {
    errors.push("Category is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Export additional utility functions
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundToNearestCent(amount: number): number {
  return Math.round(amount * 100) / 100;
}
