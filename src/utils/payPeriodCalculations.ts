import { FullSubscription, PayPeriodRequirement } from "../types/subscription";
import { validateSubscriptionForCalculations, safeCalculateMonthlyAmount } from "./helpers";

// Get the Thursday that starts the current or next pay period (Thursday-to-Wednesday)
// For Thursday-Wednesday pay periods, always return the current Thursday if today is
// Thursday through Wednesday, or the next Thursday if we need to start fresh
export function getCurrentPayPeriodThursday(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  let daysToCurrentThursday;

  if (day === 4) {
    // Thursday - start of current pay period
    daysToCurrentThursday = 0;
  } else if (day === 5) {
    // Friday - current pay period started yesterday
    daysToCurrentThursday = -1;
  } else if (day === 6) {
    // Saturday - current pay period started 2 days ago
    daysToCurrentThursday = -2;
  } else if (day === 0) {
    // Sunday - current pay period started 3 days ago
    daysToCurrentThursday = -3;
  } else if (day === 1) {
    // Monday - current pay period started 4 days ago
    daysToCurrentThursday = -4;
  } else if (day === 2) {
    // Tuesday - current pay period started 5 days ago
    daysToCurrentThursday = -5;
  } else if (day === 3) {
    // Wednesday - current pay period started 6 days ago
    daysToCurrentThursday = -6;
  }

  const thursday = new Date(d);
  thursday.setDate(d.getDate() + daysToCurrentThursday);
  thursday.setHours(0, 0, 0, 0); // Normalize to start of day

  return thursday;
}

// Get the next N Thursday pay period start dates starting from current/next period
export function getNextThursdays(count: number): Date[] {
  const thursdays: Date[] = [];

  // Start with the Thursday that begins the current pay period
  let currentThursday = getCurrentPayPeriodThursday();

  for (let i = 0; i < count; i++) {
    thursdays.push(new Date(currentThursday));
    currentThursday.setDate(currentThursday.getDate() + 7); // Move to next Thursday (7 days later)
  }

  return thursdays;
}

// Backward compatibility - keep the old function name
export function getThursdayOfWeek(date: Date): Date {
  return getCurrentPayPeriodThursday(date);
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Helper function to normalize dates to midnight UTC for consistent comparison
function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

// Helper function to parse date strings consistently
function parseDate(dateString: string): Date {
  // Handle both YYYY-MM-DD and other formats
  const date = new Date(dateString + "T00:00:00.000Z");
  return normalizeDate(date);
}

// Get the cost of a subscription for a specific date, accounting for variable pricing
function getSubscriptionCostForDate(subscription: FullSubscription, targetDate: Date): number {
  // Validate the subscription first
  const validatedSub = validateSubscriptionForCalculations(subscription);

  if (validatedSub.frequency !== "monthly" || !validatedSub.variablePricing?.averagePrice) {
    return validatedSub.price;
  }

  // For variable pricing, use the average price if available
  return validatedSub.variablePricing.averagePrice || validatedSub.price;
}

// Enhanced function to calculate all subscription occurrences within a date range
function calculateSubscriptionOccurrences(
  subscription: FullSubscription,
  periodStart: Date,
  periodEnd: Date
): Array<{ date: Date; cost: number }> {
  // Validate the subscription first
  const validatedSub = validateSubscriptionForCalculations(subscription);
  const occurrences: Array<{ date: Date; cost: number }> = [];

  if (!validatedSub.nextPayment) {
    console.warn(`⚠️ Subscription ${validatedSub.name} has no nextPayment date`);
    return occurrences;
  }

  console.log(`🔍 Calculating occurrences for ${validatedSub.name}:`);
  console.log(`   📅 Next payment: ${validatedSub.nextPayment}`);
  console.log(`   📆 Period: ${formatDate(periodStart)} - ${formatDate(periodEnd)}`);
  console.log(`   🔄 Frequency: ${validatedSub.frequency}`);
  console.log(`   ✅ Status: ${validatedSub.status}`);

  const nextPaymentDate = parseDate(validatedSub.nextPayment);
  const normalizedStart = normalizeDate(periodStart);
  const normalizedEnd = normalizeDate(periodEnd);

  console.log(`   🎯 Parsed payment date: ${formatDate(nextPaymentDate)}`);

  // Helper function to add months while preserving day of month (handles edge cases)
  const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date);
    const originalDay = result.getDate();
    result.setMonth(result.getMonth() + months);

    // Handle cases where the target month has fewer days (e.g., Jan 31 -> Feb 28)
    if (result.getDate() !== originalDay) {
      result.setDate(0); // Go to last day of previous month
    }

    return normalizeDate(result);
  };

  // Helper function to add years
  const addYears = (date: Date, years: number): Date => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return normalizeDate(result);
  };

  // Start from next payment date and work backwards to catch any payments in the period
  let currentDate = new Date(nextPaymentDate);

  // Go backwards to find earlier occurrences that might fall in our period
  const tempDate = new Date(nextPaymentDate);
  const maxBackwardLookup = 36; // Look back up to 36 cycles (3 years for monthly)

  console.log(`   ⬅️ Looking backwards from ${formatDate(tempDate)}...`);

  for (let i = 0; i < maxBackwardLookup; i++) {
    if (tempDate < normalizedStart) {
      console.log(`   🛑 Reached date before period start: ${formatDate(tempDate)}`);
      break;
    }

    if (tempDate >= normalizedStart && tempDate <= normalizedEnd) {
      console.log(`   ✅ Found occurrence (backward): ${formatDate(tempDate)}`);
      occurrences.push({
        date: new Date(tempDate),
        cost: getSubscriptionCostForDate(validatedSub, tempDate),
      });
    }

    // Move backwards based on frequency
    switch (validatedSub.frequency) {
      case "monthly":
        tempDate.setMonth(tempDate.getMonth() - 1);
        break;
      case "weekly":
        tempDate.setDate(tempDate.getDate() - 7);
        break;
      case "yearly":
        tempDate.setFullYear(tempDate.getFullYear() - 1);
        break;
      case "daily":
        tempDate.setDate(tempDate.getDate() - 1);
        break;
    }
    tempDate.setHours(0, 0, 0, 0); // Normalize after date manipulation
  }

  // Now go forwards from next payment date
  currentDate = new Date(nextPaymentDate);
  const maxForwardLookup = 36; // Look ahead up to 36 cycles

  console.log(`   ➡️ Looking forwards from ${formatDate(currentDate)}...`);

  for (let i = 0; i < maxForwardLookup; i++) {
    if (currentDate > normalizedEnd) {
      console.log(`   🛑 Reached date after period end: ${formatDate(currentDate)}`);
      break;
    }

    if (currentDate >= normalizedStart && currentDate <= normalizedEnd) {
      // Check if we already added this date from backward lookup
      const existingDate = occurrences.find(
        (occ) => normalizeDate(occ.date).getTime() === normalizeDate(currentDate).getTime()
      );

      if (!existingDate) {
        console.log(`   ✅ Found occurrence (forward): ${formatDate(currentDate)}`);
        occurrences.push({
          date: new Date(currentDate),
          cost: getSubscriptionCostForDate(validatedSub, currentDate),
        });
      } else {
        console.log(`   🔄 Skipping duplicate: ${formatDate(currentDate)}`);
      }
    }

    // Move forward based on frequency
    switch (validatedSub.frequency) {
      case "monthly":
        currentDate = addMonths(currentDate, 1);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case "yearly":
        currentDate = addYears(currentDate, 1);
        break;
      case "daily":
        currentDate.setDate(currentDate.getDate() + 1);
        break;
    }
  }

  // Sort occurrences by date and remove duplicates
  const sortedOccurrences = occurrences
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .filter(
      (occurrence, index, array) =>
        index === 0 ||
        normalizeDate(occurrence.date).getTime() !== normalizeDate(array[index - 1].date).getTime()
    );

  console.log(`   📊 Final occurrences for ${validatedSub.name}: ${sortedOccurrences.length}`);
  sortedOccurrences.forEach((occ) => {
    console.log(`      - ${formatDate(occ.date)}: $${occ.cost}`);
  });

  return sortedOccurrences;
}

// Enhanced function to get upcoming subscriptions for a specific pay period
export function getUpcomingSubscriptions(
  subscriptions: FullSubscription[],
  periodStart: Date,
  periodEnd: Date,
  includeAllStatuses: boolean = true
): Array<{
  id: string;
  name: string;
  cost: number;
  dueDate: string;
  category: string;
  frequency: string;
  status: string;
  subscriptionType: string;
}> {
  console.log(`\n📊 === CALCULATING SUBSCRIPTIONS FOR PAY PERIOD ===`);
  console.log(`📅 Period: ${formatDate(periodStart)} - ${formatDate(periodEnd)}`);
  console.log(`🎯 Include all statuses: ${includeAllStatuses}`);

  const upcomingSubscriptions: Array<{
    id: string;
    name: string;
    cost: number;
    dueDate: string;
    category: string;
    frequency: string;
    status: string;
    subscriptionType: string;
  }> = [];

  // Filter subscriptions based on includeAllStatuses flag
  const filteredSubscriptions = includeAllStatuses
    ? subscriptions // Include ALL subscriptions (active, cancelled, watchlist)
    : subscriptions.filter((sub) => sub.isActive && sub.status === "active"); // Only active

  console.log(`📋 Total subscriptions: ${subscriptions.length}`);
  console.log(`📋 Processing ${filteredSubscriptions.length} filtered subscriptions`);

  // Log subscription details for debugging
  filteredSubscriptions.forEach((sub) => {
    console.log(`   📦 ${sub.name}: ${sub.nextPayment} (${sub.status}, ${sub.frequency})`);
  });

  filteredSubscriptions.forEach((subscription, index) => {
    try {
      console.log(
        `\n🔄 Processing subscription ${index + 1}/${filteredSubscriptions.length}: ${subscription.name}`
      );

      const occurrences = calculateSubscriptionOccurrences(subscription, periodStart, periodEnd);

      occurrences.forEach((occurrence) => {
        upcomingSubscriptions.push({
          id: subscription.id,
          name: subscription.name,
          cost: occurrence.cost,
          dueDate: occurrence.date.toISOString().split("T")[0],
          category: subscription.category,
          frequency: subscription.frequency,
          status: subscription.status,
          subscriptionType: subscription.subscriptionType,
        });
      });

      if (occurrences.length > 0) {
        console.log(`✅ ${subscription.name}: Added ${occurrences.length} occurrence(s) to period`);
      } else {
        console.log(`❌ ${subscription.name}: No occurrences found in this period`);
      }
    } catch (error) {
      console.error(`❌ Error processing subscription ${subscription.name}:`, error);
    }
  });

  const sortedSubscriptions = upcomingSubscriptions.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  console.log(`\n📊 === PAY PERIOD CALCULATION SUMMARY ===`);
  console.log(`✅ Found ${sortedSubscriptions.length} total subscription occurrences`);
  console.log(
    `💰 Total amount: $${sortedSubscriptions.reduce((sum, sub) => sum + sub.cost, 0).toFixed(2)}`
  );

  if (sortedSubscriptions.length > 0) {
    console.log(`📅 Occurrences by date:`);
    sortedSubscriptions.forEach((sub) => {
      console.log(`   - ${sub.dueDate}: ${sub.name} ($${sub.cost})`);
    });
  } else {
    console.log(`❌ No subscription occurrences found in this period`);
    console.log(`🔍 Debug info:`);
    console.log(`   - Period start: ${periodStart.toISOString()}`);
    console.log(`   - Period end: ${periodEnd.toISOString()}`);
    console.log(`   - Filtered subscriptions: ${filteredSubscriptions.length}`);
    if (filteredSubscriptions.length > 0) {
      console.log(`   - Next payment dates:`);
      filteredSubscriptions.forEach((sub) => {
        console.log(`     • ${sub.name}: ${sub.nextPayment}`);
      });
    }
  }

  return sortedSubscriptions;
}

// Enhanced pay period summary with comprehensive status inclusion
export function getPayPeriodSummary(
  subscriptions: FullSubscription[],
  periodStart: Date,
  periodEnd: Date,
  includeAllStatuses: boolean = true
): {
  totalRequired: number;
  subscriptionCount: number;
  categoryBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  upcomingChanges: Array<{
    subscription: FullSubscription;
    change: {
      date: string;
      cost: number;
      description?: string;
    };
    currentCost: number;
    difference: number;
  }>;
} {
  const upcomingSubscriptions = getUpcomingSubscriptions(
    subscriptions,
    periodStart,
    periodEnd,
    includeAllStatuses
  );

  const totalRequired = upcomingSubscriptions.reduce((sum, sub) => sum + sub.cost, 0);
  const subscriptionCount = upcomingSubscriptions.length;

  // Calculate category breakdown
  const categoryBreakdown: Record<string, number> = {};
  upcomingSubscriptions.forEach((sub) => {
    categoryBreakdown[sub.category] = (categoryBreakdown[sub.category] || 0) + sub.cost;
  });

  // Calculate status breakdown (new feature)
  const statusBreakdown: Record<string, number> = {};
  upcomingSubscriptions.forEach((sub) => {
    statusBreakdown[sub.status] = (statusBreakdown[sub.status] || 0) + sub.cost;
  });

  // Get upcoming price changes in this period
  const upcomingChanges = getUpcomingPricingChanges(subscriptions).filter((change) => {
    const changeDate = parseDate(change.change.date);
    return changeDate >= normalizeDate(periodStart) && changeDate <= normalizeDate(periodEnd);
  });

  return {
    totalRequired,
    subscriptionCount,
    categoryBreakdown,
    statusBreakdown,
    upcomingChanges,
  };
}

// Enhanced pay period requirements calculation with comprehensive subscription inclusion
export function calculatePayPeriodRequirements(
  subscriptions: FullSubscription[],
  periodCount: number = 12,
  includeAllStatuses: boolean = true
): PayPeriodRequirement[] {
  console.log(`\n🗓️ === CALCULATING PAY PERIOD REQUIREMENTS ===`);
  console.log(`📊 Periods to calculate: ${periodCount}`);
  console.log(`📋 Total subscriptions: ${subscriptions.length}`);
  console.log(`🎯 Include all statuses: ${includeAllStatuses}`);

  // Log current date and subscription info for debugging
  const now = new Date();
  const currentPayPeriodStart = getCurrentPayPeriodThursday(now);
  const currentPayPeriodEnd = new Date(currentPayPeriodStart);
  currentPayPeriodEnd.setDate(currentPayPeriodEnd.getDate() + 6);

  console.log(`⏰ Current date: ${formatDate(now)} (Day ${now.getDay()})`);
  console.log(`📅 Current ISO: ${now.toISOString()}`);
  console.log(
    `🗓️ Current pay period: ${formatDate(currentPayPeriodStart)} to ${formatDate(currentPayPeriodEnd)} (Thu-Wed)`
  );
  console.log(`🎯 Day of week mapping: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat`);

  console.log(`\n📦 Subscription overview:`);
  subscriptions.forEach((sub) => {
    console.log(`   • ${sub.name}: ${sub.nextPayment} (${sub.status}, ${sub.frequency})`);
  });

  const thursdays = getNextThursdays(periodCount);
  const requirements: PayPeriodRequirement[] = [];

  console.log(`\n📅 Thursday-to-Wednesday pay periods:`);
  thursdays.forEach((thursday, index) => {
    const endDate = new Date(thursday);
    endDate.setDate(endDate.getDate() + 6); // Wednesday (6 days after Thursday)
    console.log(`   ${index + 1}. ${formatDate(thursday)} to ${formatDate(endDate)} (Thu-Wed)`);
  });

  thursdays.forEach((thursday, index) => {
    const periodStart = normalizeDate(new Date(thursday));
    const periodEnd = normalizeDate(new Date(thursday));
    periodEnd.setDate(periodEnd.getDate() + 6); // One week from Thursday (Thu-Wed)

    console.log(`\n🔄 === PROCESSING PERIOD ${index + 1}/${periodCount} ===`);
    console.log(`📅 Period: ${formatDate(periodStart)} - ${formatDate(periodEnd)} (Thu-Wed)`);

    try {
      const periodSubscriptions = getUpcomingSubscriptions(
        subscriptions,
        periodStart,
        periodEnd,
        includeAllStatuses
      ).map((sub) => ({
        id: sub.id,
        name: sub.name,
        cost: sub.cost,
        dueDate: sub.dueDate,
        category: sub.category,
      }));

      const totalRequired = periodSubscriptions.reduce((sum, sub) => sum + sub.cost, 0);

      requirements.push({
        id: `period-${index}`,
        weekLabel: `Week ${index + 1}: ${formatDate(periodStart)} - ${formatDate(periodEnd)}`,
        startDate: periodStart.toISOString().split("T")[0],
        endDate: periodEnd.toISOString().split("T")[0],
        requiredAmount: totalRequired,
        subscriptions: periodSubscriptions,
      });

      console.log(
        `✅ Period ${index + 1} complete: ${periodSubscriptions.length} subscriptions, $${totalRequired.toFixed(2)}`
      );
    } catch (error) {
      console.error(`❌ Error calculating period ${index + 1}:`, error);

      // Add empty period on error
      requirements.push({
        id: `period-${index}`,
        weekLabel: `Week ${index + 1}: ${formatDate(periodStart)} - ${formatDate(periodEnd)}`,
        startDate: periodStart.toISOString().split("T")[0],
        endDate: periodEnd.toISOString().split("T")[0],
        requiredAmount: 0,
        subscriptions: [],
      });
    }
  });

  console.log(`\n📊 === FINAL CALCULATION SUMMARY ===`);
  console.log(`✅ Successfully calculated ${requirements.length} pay period requirements`);
  console.log(
    `💰 Total across all periods: $${requirements.reduce((sum, req) => sum + req.requiredAmount, 0).toFixed(2)}`
  );

  // Log summary of each period
  requirements.forEach((req, index) => {
    console.log(
      `   Period ${index + 1}: $${req.requiredAmount.toFixed(2)} (${req.subscriptions.length} subscriptions)`
    );
  });

  return requirements;
}

// Get the current pay period requirement
export function getCurrentPayPeriodRequirement(
  subscriptions: FullSubscription[],
  includeAllStatuses: boolean = true
): PayPeriodRequirement | null {
  const requirements = calculatePayPeriodRequirements(subscriptions, 1, includeAllStatuses);
  return requirements.length > 0 ? requirements[0] : null;
}

// Enhanced function to get upcoming variable pricing changes across all subscriptions
export function getUpcomingPricingChanges(subscriptions: FullSubscription[]): Array<{
  subscription: FullSubscription;
  change: {
    date: string;
    cost: number;
    description?: string;
  };
  currentCost: number;
  difference: number;
}> {
  const changes: Array<{
    subscription: FullSubscription;
    change: {
      date: string;
      cost: number;
      description?: string;
    };
    currentCost: number;
    difference: number;
  }> = [];

  subscriptions
    .filter((sub) => sub.variablePricing?.upcomingChanges)
    .forEach((subscription) => {
      subscription
        .variablePricing!.upcomingChanges!.filter(
          (change) => parseDate(change.date) > normalizeDate(new Date())
        )
        .forEach((change) => {
          changes.push({
            subscription,
            change,
            currentCost: subscription.price,
            difference: change.cost - subscription.price,
          });
        });
    });

  // Sort by date
  return changes.sort(
    (a, b) => parseDate(a.change.date).getTime() - parseDate(b.change.date).getTime()
  );
}

// Utility function to get subscription statistics for debugging
export function getSubscriptionStatistics(subscriptions: FullSubscription[]): {
  total: number;
  active: number;
  cancelled: number;
  watchlist: number;
  byCategory: Record<string, number>;
  byFrequency: Record<string, number>;
  nextPaymentDates: string[];
} {
  const stats = {
    total: subscriptions.length,
    active: 0,
    cancelled: 0,
    watchlist: 0,
    byCategory: {} as Record<string, number>,
    byFrequency: {} as Record<string, number>,
    nextPaymentDates: [] as string[],
  };

  subscriptions.forEach((sub) => {
    // Status breakdown
    switch (sub.status) {
      case "active":
        stats.active++;
        break;
      case "cancelled":
        stats.cancelled++;
        break;
      case "watchlist":
        stats.watchlist++;
        break;
    }

    // Category breakdown
    stats.byCategory[sub.category] = (stats.byCategory[sub.category] || 0) + 1;

    // Frequency breakdown (FIXED: was billingCycle, now frequency)
    stats.byFrequency[sub.frequency] = (stats.byFrequency[sub.frequency] || 0) + 1;

    // Collect next payment dates
    if (sub.nextPayment) {
      stats.nextPaymentDates.push(sub.nextPayment);
    }
  });

  return stats;
}
