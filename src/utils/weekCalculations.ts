import { ThursdayWeek, WeeklyBudget } from "../types/subscription";

/**
 * Get the Thursday of the week containing the given date
 */
export function getThursdayOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(date);

  // Calculate days to add/subtract to get to Thursday (4)
  const daysToThursday = 4 - day;
  thursday.setDate(date.getDate() + daysToThursday);

  return thursday;
}

/**
 * Get the Wednesday of the week ending the Thursday-based week
 */
export function getWednesdayOfWeek(thursdayDate: Date): Date {
  const wednesday = new Date(thursdayDate);
  wednesday.setDate(thursdayDate.getDate() + 6); // Thursday + 6 days = Wednesday
  return wednesday;
}

/**
 * Get Thursday-based weeks for a given month and year
 * Special handling: August 7th, 2025 is defined as August Week 1
 */
export function getThursdayWeeksForMonth(month: number, year: number): ThursdayWeek[] {
  const weeks: ThursdayWeek[] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Find all Thursdays in the month
  const thursdaysInMonth: Date[] = [];
  let currentDate = new Date(firstDayOfMonth);

  // Find the first Thursday in the month
  while (currentDate.getDay() !== 4 && currentDate <= lastDayOfMonth) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Collect all Thursdays in the month
  while (currentDate <= lastDayOfMonth) {
    if (currentDate.getDay() === 4) {
      thursdaysInMonth.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const today = new Date();
  const currentWeekThursday = getThursdayOfWeek(today);

  thursdaysInMonth.forEach((thursday, index) => {
    const weekEnd = getWednesdayOfWeek(thursday);
    const monthName = thursday.toLocaleDateString("en-US", { month: "long" });
    const monthYear = `${monthName}-${year}`;

    // Special handling for August 2025 - August 7th should be Week 1
    let weekNumber = index + 1;
    if (month === 7 && year === 2025) {
      // August is month 7 (0-indexed)
      const august7th = new Date(2025, 7, 7); // August 7th, 2025
      if (thursday.getTime() === august7th.getTime()) {
        weekNumber = 1;
      } else if (thursday > august7th) {
        // Calculate week number based on weeks after August 7th
        const weeksSinceAug7 =
          Math.floor((thursday.getTime() - august7th.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
        weekNumber = weeksSinceAug7;
      } else {
        // This Thursday is before August 7th, so it's from July
        return; // Skip this Thursday as it's not part of August's week system
      }
    }

    weeks.push({
      startDate: new Date(thursday),
      endDate: weekEnd,
      weekNumber,
      monthYear,
      weekLabel: `${monthName} Week ${weekNumber}`,
      isCurrentWeek: thursday.getTime() === currentWeekThursday.getTime(),
    });
  });

  return weeks;
}

/**
 * Get the current Thursday-based week
 */
export function getCurrentThursdayWeek(): ThursdayWeek {
  const today = new Date();
  const currentThursday = getThursdayOfWeek(today);
  const currentWednesday = getWednesdayOfWeek(currentThursday);

  // Find which week number this is in the month
  const monthWeeks = getThursdayWeeksForMonth(
    currentThursday.getMonth(),
    currentThursday.getFullYear()
  );
  const currentWeek = monthWeeks.find(
    (week) => week.startDate.getTime() === currentThursday.getTime()
  );

  if (currentWeek) {
    return currentWeek;
  }

  // Special handling for dates before August 7th, 2025 in August
  const currentMonth = currentThursday.getMonth();
  const currentYear = currentThursday.getFullYear();

  if (currentMonth === 7 && currentYear === 2025) {
    // August 2025
    const august7th = new Date(2025, 7, 7);
    if (currentThursday < august7th) {
      // We're in early August but before the Aug 7th Week 1 starts
      // This would be part of July's week system
      const julyWeeks = getThursdayWeeksForMonth(6, 2025); // July is month 6
      const julyWeek = julyWeeks.find(
        (week) => week.startDate.getTime() === currentThursday.getTime()
      );
      if (julyWeek) {
        return { ...julyWeek, isCurrentWeek: true };
      }
    }
  }

  // Fallback if not found in month weeks
  const monthName = currentThursday.toLocaleDateString("en-US", { month: "long" });
  const monthYear = `${monthName}-${currentThursday.getFullYear()}`;
  return {
    startDate: currentThursday,
    endDate: currentWednesday,
    weekNumber: 1,
    monthYear,
    weekLabel: `${monthName} Week 1`,
    isCurrentWeek: true,
  };
}

/**
 * Get the next several Thursday-based weeks (useful for planning ahead)
 */
export function getUpcomingThursdayWeeks(numberOfWeeks: number = 8): ThursdayWeek[] {
  const weeks: ThursdayWeek[] = [];
  const today = new Date();
  let currentThursday = getThursdayOfWeek(today);

  for (let i = 0; i < numberOfWeeks; i++) {
    const weekEnd = getWednesdayOfWeek(currentThursday);
    const monthWeeks = getThursdayWeeksForMonth(
      currentThursday.getMonth(),
      currentThursday.getFullYear()
    );
    const weekInfo = monthWeeks.find(
      (week) => week.startDate.getTime() === currentThursday.getTime()
    );

    if (weekInfo) {
      weeks.push(weekInfo);
    } else {
      // Fallback for edge cases
      const monthName = currentThursday.toLocaleDateString("en-US", { month: "long" });
      const monthYear = `${monthName}-${currentThursday.getFullYear()}`;
      weeks.push({
        startDate: new Date(currentThursday),
        endDate: weekEnd,
        weekNumber: 1,
        monthYear,
        weekLabel: `${monthName} Week 1`,
        isCurrentWeek: i === 0,
      });
    }

    // Move to next Thursday
    currentThursday = new Date(currentThursday);
    currentThursday.setDate(currentThursday.getDate() + 7);
  }

  return weeks;
}

/**
 * Format date for display
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const end = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${start} - ${end}`;
}

/**
 * Create a WeeklyBudget from a ThursdayWeek
 */
export function createWeeklyBudgetFromThursdayWeek(
  thursdayWeek: ThursdayWeek,
  initialBudget: number = 0
): WeeklyBudget {
  return {
    id: `week-${thursdayWeek.weekNumber}-${thursdayWeek.monthYear}`,
    startDate: thursdayWeek.startDate,
    endDate: thursdayWeek.endDate,
    weekNumber: thursdayWeek.weekNumber,
    monthYear: thursdayWeek.monthYear,
    weekLabel: thursdayWeek.weekLabel,
    isCurrentWeek: thursdayWeek.isCurrentWeek,
    requiredAmount: initialBudget,
    subscriptions: [],
    daysUntilPayday: 0,
  };
}
