// Comprehensive date utilities to prevent timezone-related date display issues

/**
 * Parse a date string (YYYY-MM-DD) into a Date object without timezone conversion
 * This prevents the common issue where "2025-01-15" becomes Jan 14 in PST
 */
export const parseStoredDate = (dateString: string): Date => {
  if (!dateString) {
    return new Date();
  }

  // Split the YYYY-MM-DD format and construct date with explicit components
  const [year, month, day] = dateString.split("-").map((num) => parseInt(num, 10));

  // Create date using local timezone components (month is 0-indexed)
  return new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid any edge cases
};

/**
 * Format a Date object to YYYY-MM-DD string without timezone conversion
 */
export const formatDateForStorage = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return new Date().toISOString().split("T")[0];
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Convert 0-11 to 1-12
  const day = date.getDate();

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

/**
 * Get the display date string without timezone issues
 * Returns format like "Jan 15, 2025"
 */
export const getDisplayDate = (dateString: string): string => {
  const date = parseStoredDate(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Get short display date string without timezone issues
 * Returns format like "Jan 15"
 */
export const getShortDisplayDate = (dateString: string): string => {
  const date = parseStoredDate(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Check if a stored date string is today
 */
export const isToday = (dateString: string): boolean => {
  const storedDate = parseStoredDate(dateString);
  const today = new Date();

  return (
    storedDate.getFullYear() === today.getFullYear() &&
    storedDate.getMonth() === today.getMonth() &&
    storedDate.getDate() === today.getDate()
  );
};

/**
 * Check if a stored date string is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  const storedDate = parseStoredDate(dateString);
  const today = new Date();

  // Set both dates to midnight for accurate comparison
  storedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return storedDate < today;
};

/**
 * Check if a stored date string is within X days from today
 */
export const isWithinDays = (dateString: string, days: number): boolean => {
  const storedDate = parseStoredDate(dateString);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  // Set times to midnight for accurate comparison
  storedDate.setHours(0, 0, 0, 0);
  futureDate.setHours(23, 59, 59, 999);

  return storedDate <= futureDate;
};

/**
 * Get days until a stored date (positive = future, negative = past, 0 = today)
 */
export const getDaysUntil = (dateString: string): number => {
  const storedDate = parseStoredDate(dateString);
  const today = new Date();

  // Set both to midnight for accurate day calculation
  storedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = storedDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Convert a date string to a Date object for calendar components
 * This ensures the calendar shows the correct date without timezone shifts
 */
export const getCalendarDate = (dateString: string): Date => {
  return parseStoredDate(dateString);
};

/**
 * Check if two date strings represent the same date
 */
export const isSameDate = (dateString1: string, dateString2: string): boolean => {
  if (!dateString1 || !dateString2) return false;

  const date1 = parseStoredDate(dateString1);
  const date2 = parseStoredDate(dateString2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get the start of the current week (Monday)
 */
export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end of the current week (Sunday)
 */
export const getWeekEnd = (date: Date = new Date()): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

/**
 * Format date for display in calendar cells
 */
export const formatCalendarDate = (dateString: string): string => {
  const date = parseStoredDate(dateString);
  return date.getDate().toString();
};

/**
 * Get relative date description (Today, Tomorrow, etc.)
 */
export const getRelativeDateDescription = (dateString: string): string => {
  const daysUntil = getDaysUntil(dateString);

  if (daysUntil === 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";
  if (daysUntil === -1) return "Yesterday";
  if (daysUntil > 1 && daysUntil <= 7) return `In ${daysUntil} days`;
  if (daysUntil < -1 && daysUntil >= -7) return `${Math.abs(daysUntil)} days ago`;

  return getShortDisplayDate(dateString);
};

/**
 * Debug function to log date parsing information
 */
export const debugDateParsing = (dateString: string, label: string = "") => {
  console.log(`🔍 Date Debug ${label}:`);
  console.log(`  Input string: "${dateString}"`);

  // Show the problematic parsing method
  const badParse = new Date(dateString);
  console.log(
    `  Bad parse (new Date("${dateString}")): ${badParse.toDateString()} (${badParse.toISOString()})`
  );

  // Show the correct parsing method
  const goodParse = parseStoredDate(dateString);
  console.log(`  Good parse (parseStoredDate): ${goodParse.toDateString()} (Local time)`);

  // Show timezone info
  console.log(`  Timezone offset: ${new Date().getTimezoneOffset()} minutes`);
  console.log(`  User timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
};
