import type { AppSettings, AppNotification } from "../types/constants";
import type { FullSubscription, PaymentCard as FullPaymentCard } from "../types/subscription";

// Define WeeklyBudget locally
interface WeeklyBudget {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  allocatedAmount: number;
  subscriptions: string[];
}
import { INITIAL_APP_SETTINGS } from "../data/mockData";

// Enhanced user-specific localStorage utilities (now used as cache only)
export const getUserStorageKey = (userId: string, key: string) =>
  `subtracker_cache_${userId}_${key}`;

export const saveUserDataToCache = (
  userId: string,
  data: {
    subscriptions: FullSubscription[];
    paymentCards: FullPaymentCard[];
    notifications: AppNotification[];
    appSettings: AppSettings;
    hasInitialized: boolean;
    dataCleared: boolean;
    weeklyBudgets: WeeklyBudget[];
  }
) => {
  try {
    localStorage.setItem(
      getUserStorageKey(userId, "subscriptions"),
      JSON.stringify(data.subscriptions)
    );
    localStorage.setItem(
      getUserStorageKey(userId, "paymentCards"),
      JSON.stringify(data.paymentCards)
    );
    localStorage.setItem(
      getUserStorageKey(userId, "notifications"),
      JSON.stringify(data.notifications)
    );
    localStorage.setItem(
      getUserStorageKey(userId, "appSettings"),
      JSON.stringify(data.appSettings)
    );
    localStorage.setItem(
      getUserStorageKey(userId, "hasInitialized"),
      JSON.stringify(data.hasInitialized)
    );
    localStorage.setItem(
      getUserStorageKey(userId, "dataCleared"),
      JSON.stringify(data.dataCleared)
    );
    localStorage.setItem(
      getUserStorageKey(userId, "weeklyBudgets"),
      JSON.stringify(data.weeklyBudgets)
    );
    localStorage.setItem(
      getUserStorageKey(userId, "cacheTimestamp"),
      JSON.stringify(new Date().toISOString())
    );
    console.log(`💾 User data cached locally for user: ${userId.substring(0, 8)}...`);
  } catch (error) {
    console.error("❌ Failed to cache user data:", error);
  }
};

export const loadUserDataFromCache = (userId: string) => {
  try {
    const subscriptions = JSON.parse(
      localStorage.getItem(getUserStorageKey(userId, "subscriptions")) || "[]"
    );
    const paymentCards = JSON.parse(
      localStorage.getItem(getUserStorageKey(userId, "paymentCards")) || "[]"
    );
    const notifications = JSON.parse(
      localStorage.getItem(getUserStorageKey(userId, "notifications")) || "[]"
    );
    const appSettings =
      JSON.parse(localStorage.getItem(getUserStorageKey(userId, "appSettings")) || "null") ||
      INITIAL_APP_SETTINGS;
    const hasInitialized = JSON.parse(
      localStorage.getItem(getUserStorageKey(userId, "hasInitialized")) || "false"
    );
    const dataCleared = JSON.parse(
      localStorage.getItem(getUserStorageKey(userId, "dataCleared")) || "false"
    );
    const weeklyBudgets = JSON.parse(
      localStorage.getItem(getUserStorageKey(userId, "weeklyBudgets")) || "[]"
    );
    const cacheTimestamp = JSON.parse(
      localStorage.getItem(getUserStorageKey(userId, "cacheTimestamp")) || "null"
    );

    console.log(`📂 Loaded cached data for user ${userId.substring(0, 8)}...:`, {
      subscriptionsCount: subscriptions.length,
      cardsCount: paymentCards.length,
      notificationsCount: notifications.length,
      weeklyBudgetsCount: weeklyBudgets.length,
      hasInitialized,
      dataCleared,
      cacheAge: cacheTimestamp
        ? `${Math.round((Date.now() - new Date(cacheTimestamp).getTime()) / 1000)}s`
        : "unknown",
    });

    return {
      subscriptions,
      paymentCards,
      notifications,
      appSettings,
      hasInitialized,
      dataCleared,
      weeklyBudgets,
      cacheTimestamp,
    };
  } catch (error) {
    console.error(`❌ Failed to load cached data for user ${userId.substring(0, 8)}...:`, error);
    return {
      subscriptions: [],
      paymentCards: [],
      notifications: [],
      appSettings: INITIAL_APP_SETTINGS,
      hasInitialized: false,
      dataCleared: false,
      weeklyBudgets: [],
      cacheTimestamp: null,
    };
  }
};

export const clearUserDataCache = (userId: string) => {
  try {
    const keys = [
      "subscriptions",
      "paymentCards",
      "notifications",
      "appSettings",
      "hasInitialized",
      "dataCleared",
      "weeklyBudgets",
      "cacheTimestamp",
    ];
    keys.forEach((key) => {
      localStorage.removeItem(getUserStorageKey(userId, key));
    });
    console.log(`🧹 User data cache cleared for user: ${userId.substring(0, 8)}...`);
  } catch (error) {
    console.error(
      `❌ Failed to clear user data cache for user ${userId.substring(0, 8)}...:`,
      error
    );
  }
};

// Enhanced session cleanup utilities (PRESERVE USER DATA CACHE)
export const clearAuthSessionDataOnly = () => {
  try {
    // Clear ONLY auth-related localStorage items, preserve user data cache
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("sb-") ||
          key.includes("supabase.auth.token") ||
          key.includes("supabase-auth-token") ||
          (key.includes("supabase") && key.includes("auth")) ||
          key.includes("refresh_token") ||
          key.includes("access_token"))
      ) {
        // CRITICAL: Do NOT clear user data cache (subtracker_cache_)
        if (!key.includes("subtracker_cache_")) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      console.log(`🧹 Removed auth session key: ${key}`);
    });

    // Clear sessionStorage but preserve user data
    const sessionKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && !key.includes("subtracker_")) {
        sessionKeysToRemove.push(key);
      }
    }

    sessionKeysToRemove.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    console.log("🧹 Auth session data cleared, user data cache preserved");
  } catch (error) {
    console.error("❌ Failed to clear session data:", error);
  }
};
