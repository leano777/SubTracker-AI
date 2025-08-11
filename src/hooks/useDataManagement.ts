import { useState, useEffect, useCallback, useRef } from "react";

import {
  INITIAL_SUBSCRIPTIONS,
  INITIAL_PAYMENT_CARDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_APP_SETTINGS,
} from "../data/mockData";
import type { AppSettings, AppNotification } from "../types/constants";
import type { FullSubscription, PaymentCard as FullPaymentCard } from "../types/subscription";
import { DEFAULT_BUDGET_CATEGORIES } from "../types/subscription";
import { saveUserDataToCache, loadUserDataFromCache, clearUserDataCache } from "../utils/cache";
import { dataSyncManager } from "../utils/dataSync";
import type { SyncStatus } from "../utils/dataSync";
import { calculatePayPeriodRequirements } from "../utils/payPeriodCalculations";

// Enhanced data migration function with robust validation
const migrateSubscriptionData = (subscription: any): FullSubscription => {
  if (!subscription) {
    console.error("⚠️ Null subscription passed to migration, creating placeholder");
    return {
      id: `placeholder-${Date.now()}`,
      name: "Unknown Subscription",
      price: 0,
      cost: 0,
      frequency: "monthly",
      billingCycle: "monthly",
      nextPayment: new Date().toISOString().split("T")[0],
      category: "Other",
      status: "active",
      isActive: true,
      dateAdded: new Date().toISOString().split("T")[0],
    };
  }

  // Enhanced frequency validation and migration with more robust handling
  const determineFrequency = (sub: any): "monthly" | "yearly" | "weekly" | "daily" | "quarterly" => {
    // Try multiple possible field names for frequency
    const freq =
      sub.frequency || sub.billingCycle || sub.billing_cycle || sub.cycle || sub.interval;

    if (!freq || (typeof freq !== "string" && typeof freq !== "number")) {
      console.warn(
        `⚠️ Missing or invalid frequency for "${sub.name || "Unknown"}" (value: ${freq}), defaulting to monthly`
      );
      return "monthly";
    }

    // Convert to string and normalize
    const normalizedFreq = String(freq).toLowerCase().trim();

    // Map various frequency formats to standard values (more comprehensive)
    switch (normalizedFreq) {
      // Weekly variants
      case "weekly":
      case "week":
      case "w":
      case "7":
      case "every week":
        return "weekly";

      // Monthly variants
      case "monthly":
      case "month":
      case "m":
      case "30":
      case "1":
      case "every month":
      case "per month":
        return "monthly";

      // Yearly variants
      case "yearly":
      case "annual":
      case "annually":
      case "year":
      case "y":
      case "365":
      case "12":
      case "every year":
      case "per year":
        return "yearly";

      // Daily variants
      case "daily":
      case "day":
      case "d":
      case "every day":
      case "per day":
        return "daily";

      // Special cases - convert to closest standard frequency
      case "quarterly":
      case "quarter":
      case "q":
      case "3":
      case "every 3 months":
        return "quarterly";

      case "bi-weekly":
      case "biweekly":
      case "every 2 weeks":
      case "14":
        return "weekly";

      case "semi-annually":
      case "semi-annual":
      case "every 6 months":
      case "6":
        return "monthly";

      default:
        return "monthly";
    }
  };

  // Robust price validation
  const determinePrice = (sub: any): number => {
    const price = sub.price ?? sub.cost;
    const parsedPrice = typeof price === "number" ? price : parseFloat(price);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return 0;
    }

    return parsedPrice;
  };

  // Check if this is already in the correct format
  const hasNewFormat = subscription.price !== undefined && subscription.frequency !== undefined;
  const hasValidFrequency =
    subscription.frequency &&
    typeof subscription.frequency === "string" &&
    subscription.frequency.trim() !== "";

  if (hasNewFormat && hasValidFrequency) {
    // Always validate the frequency even if it seems correct
    const determinedFrequency = determineFrequency(subscription);
    const determinedPrice = determinePrice(subscription);

    // Ensure the frequency is one of our valid options
    const validFrequencies = ["monthly", "yearly", "weekly", "daily", "quarterly"];
    const finalFrequency = validFrequencies.includes(determinedFrequency)
      ? determinedFrequency
      : "monthly";

    const validated = {
      ...subscription,
      frequency: finalFrequency,
      price: determinedPrice,
    };

    return validated as FullSubscription;
  }

  // Migrate from old format to new format
  const determinedFrequency = determineFrequency(subscription);
  const determinedPrice = determinePrice(subscription);

  // Final safety check - ensure frequency is valid
  const validFrequencies = ["monthly", "yearly", "weekly", "daily", "quarterly"];
  const safeFrequency = validFrequencies.includes(determinedFrequency)
    ? determinedFrequency
    : "monthly";

  const migrated: FullSubscription = {
    id: subscription.id || `migrated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: subscription.name || "Unknown Subscription",
    price: determinedPrice,
    cost: determinedPrice,
    frequency: safeFrequency,
    billingCycle: "monthly",
    nextPayment: subscription.nextPayment || new Date().toISOString().split("T")[0],
    category: subscription.category || "Other",
    status: subscription.status || (subscription.isActive ? "active" : "cancelled") || "active",
    isActive:
      (subscription.status || (subscription.isActive ? "active" : "cancelled") || "active") ===
      "active",
    description: subscription.description,
    website: subscription.billingUrl || subscription.website,
    dateAdded: subscription.dateAdded || new Date().toISOString().split("T")[0],
    cancelledDate: subscription.dateCancelled || subscription.cancelledDate,
    tags: subscription.tags || [],
    notes: subscription.watchlistNotes || subscription.notes,
    priority: subscription.priority,
    paymentCard: subscription.cardId || subscription.paymentCard,
    linkedCard: subscription.cardId || subscription.linkedCard,
    planType: subscription.planType,
    variablePricing: subscription.variablePricing,
    automationEnabled: subscription.automationEnabled,
    automationRules: subscription.automationRules,
    budgetCategory: subscription.budgetCategory,
    businessExpense: subscription.subscriptionType === "business" || subscription.businessExpense,
    taxDeductible: subscription.taxDeductible,
    isStarred: subscription.isStarred,
    reminderDays: subscription.reminderDays,
    trialEndDate: subscription.trialEndDate,
  };

  // Validate the final migrated object
  if (
    !migrated.frequency ||
    !["monthly", "yearly", "weekly", "daily", "quarterly"].includes(migrated.frequency)
  ) {
    console.error(
      `❌ Migration failed validation for "${migrated.name}" - invalid frequency: ${migrated.frequency}, forcing to monthly`
    );
    migrated.frequency = "monthly";
  }

  if (typeof migrated.price !== "number" || migrated.price < 0) {
    console.error(
      `❌ Migration failed validation for "${migrated.name}" - invalid price: ${migrated.price}, forcing to 0`
    );
    migrated.price = 0;
  }

  return migrated;
};

// Data migration function for payment cards
const migratePaymentCardData = (card: any): FullPaymentCard => {
  // Check if this is already using the new format
  if (card.lastFourDigits !== undefined && card.provider !== undefined) {
    return card as FullPaymentCard;
  }

  // Migrate from old format to new format
  const migrated: FullPaymentCard = {
    id: card.id,
    name: card.nickname || card.name,
    lastFourDigits: card.lastFour || card.lastFourDigits || "0000",
    expiryMonth: parseInt(card.expiryMonth) || 12,
    expiryYear: parseInt(card.expiryYear) || 2026,
    provider: card.issuer?.toLowerCase() || card.provider || "visa",
    isDefault: card.isDefault || false,
    nickname: card.nickname,
    color: card.color,
    dateAdded: card.dateAdded,
    billingAddress: card.billingAddress,
    creditLimit: card.creditLimit,
    availableCredit: card.availableCredit,
    statementDate: card.statementDate,
    paymentDueDate: card.paymentDueDate,
  };

  return migrated;
};

// Define WeeklyBudget type locally since it's not exported
interface WeeklyBudget {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  allocatedAmount: number;
  subscriptions: string[];
}

// Helper function to convert PayPeriodRequirement to WeeklyBudget
const convertToWeeklyBudgets = (requirements: any[]): WeeklyBudget[] => {
  return requirements.map((req, index) => ({
    id: req.id || `budget-${index}`,
    weekLabel: req.weekLabel,
    startDate: req.startDate,
    endDate: req.endDate,
    allocatedAmount: req.requiredAmount || 0,
    subscriptions: req.subscriptions || [],
  }));
};

// Enhanced session readiness check with multiple validation layers
// Enhanced session readiness check with multiple validation layers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isSessionReady = (session: any, user: any, retryCount: number = 0): boolean => {
  if (!session || !user) {
    return false;
  }

  // Check if we have the essential session components
  if (!session.access_token || !user.id || !user.email) {
    return false;
  }

  // Check if the token looks valid (enhanced format check)
  if (!session.access_token.startsWith("eyJ") || session.access_token.split(".").length !== 3) {
    return false;
  }

  // Additional JWT payload validation
  try {
    const payload = JSON.parse(atob(session.access_token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }

    // Check if token has required claims
    if (!payload.sub || !payload.email || payload.sub !== user.id) {
      return false;
    }
  } catch (error) {
    return false;
  }

  // For new users, be more lenient but add time-based checks
  const isNewUser = !user.email_confirmed_at;
  const userCreatedRecently =
    user.created_at && Date.now() - new Date(user.created_at).getTime() < 10 * 60 * 1000; // 10 minutes grace period

  if (isNewUser && userCreatedRecently) {
    // For very new users, add additional wait time based on how recent they are
    const userAge = Date.now() - new Date(user.created_at).getTime();
    const minWaitTime = 5000; // 5 seconds minimum

    if (userAge < minWaitTime && retryCount < 3) {
      return false;
    }
  }

  return true;
};

// Enhanced check for email confirmation flow
const isEmailConfirmationFlow = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const hasConfirmationParams =
    urlParams.has("token_hash") ||
    urlParams.has("type") ||
    urlParams.has("access_token") ||
    urlParams.has("refresh_token");

  // Also check for common confirmation URL patterns
  const hasConfirmationPath =
    window.location.pathname.includes("confirm") || window.location.pathname.includes("verify");

  return hasConfirmationParams || hasConfirmationPath;
};

export const useDataManagement = (
  isAuthenticated: boolean,
  stableUserId: string | null,
  isOnline: boolean,
  cloudSyncEnabled: boolean
) => {
  // State management - initialize with properly migrated and validated data
  const [subscriptions, setSubscriptions] = useState<FullSubscription[]>(() => {
    if (isAuthenticated) {
      return [];
    }

    try {
      const migratedSubs = INITIAL_SUBSCRIPTIONS.map((sub, index) => {
        try {
          const migrated = migrateSubscriptionData(sub);
          return migrated;
        } catch (error) {
          console.error(`❌ Failed to migrate demo subscription ${index + 1}:`, error);
          // Return a safe fallback
          return migrateSubscriptionData({
            id: `demo-fallback-${index}`,
            name: `Demo Subscription ${index + 1}`,
            price: 9.99,
            frequency: "monthly",
            category: "Other",
            status: "active",
            dateAdded: new Date().toISOString().split("T")[0],
            nextPayment: new Date().toISOString().split("T")[0],
          });
        }
      });

      return migratedSubs;
    } catch (error) {
      console.error("❌ Failed to initialize demo data:", error);
      return [];
    }
  });

  const [paymentCards, setPaymentCards] = useState<FullPaymentCard[]>(() => {
    if (isAuthenticated) {
      return [];
    }

    try {
      const migratedCards = INITIAL_PAYMENT_CARDS.map(migratePaymentCardData);
      return migratedCards;
    } catch (error) {
      console.error("❌ Failed to initialize demo payment cards:", error);
      return [];
    }
  });
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    // Only use demo data if not authenticated
    return isAuthenticated ? [] : INITIAL_NOTIFICATIONS;
  });
  const [weeklyBudgets, setWeeklyBudgets] = useState<WeeklyBudget[]>([]);

  // Enhanced subscription setter with automatic migration
  const setSubscriptionsWithMigration = (
    subscriptionsOrUpdater: FullSubscription[] | ((prev: FullSubscription[]) => FullSubscription[])
  ) => {
    setSubscriptions((prev) => {
      let newSubscriptions: FullSubscription[];

      if (typeof subscriptionsOrUpdater === "function") {
        newSubscriptions = subscriptionsOrUpdater(prev);
      } else {
        newSubscriptions = subscriptionsOrUpdater;
      }

      // Always ensure all subscriptions are properly migrated
      const migratedSubscriptions = newSubscriptions.map((sub, index) => {
        try {
          return migrateSubscriptionData(sub);
        } catch (error) {
          console.error(`❌ Failed to migrate subscription ${index}:`, error, sub);
          // Return a safe fallback that won't break calculations
          return migrateSubscriptionData({
            id: sub.id || `fallback-${Date.now()}-${index}`,
            name: sub.name || "Unknown Subscription",
            price: 0,
            frequency: "monthly",
            category: "Other",
            status: "active",
            dateAdded: new Date().toISOString().split("T")[0],
            nextPayment: new Date().toISOString().split("T")[0],
          });
        }
      });

      // Log any subscriptions that were migrated
      const migratedCount = migratedSubscriptions.filter((sub, index) => {
        const original = newSubscriptions[index];
        return original && (original.frequency !== sub.frequency || original.price !== sub.price);
      }).length;

      return migratedSubscriptions;
    });
  };

  // Data persistence flags
  const [hasInitialized, setHasInitialized] = useState(false);
  const [dataCleared, setDataCleared] = useState(false);

  // Enhanced sync state management
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionReadyRetries, setSessionReadyRetries] = useState(0);
  const [serverRequestsAllowed, setServerRequestsAllowed] = useState(false);

  // Initialize server requests allowed when authenticated with stable user ID
  useEffect(() => {
    if (isAuthenticated && stableUserId) {
      setServerRequestsAllowed(true);
      setSessionReady(true);
    } else {
      setServerRequestsAllowed(false);
      setSessionReady(false);
    }
  }, [isAuthenticated, stableUserId]);

  // Reset retry counter when user ID changes
  useEffect(() => {
    setSessionReadyRetries(0);
    setServerRequestsAllowed(false);
  }, [stableUserId]);

  // Check if user data was accidentally cleared and attempt recovery
  const attemptDataRecovery = async (userId: string) => {
    // Check if there's any cached data
    const cachedData = loadUserDataFromCache(userId);
    if (cachedData.subscriptions.length > 0) {
      return cachedData;
    }

    // Only try cloud recovery if server requests are allowed
    if (cloudSyncEnabled && isOnline && serverRequestsAllowed) {
      try {
        const cloudResult = await dataSyncManager.loadFromCloud();

        if (cloudResult.success && cloudResult.data && cloudResult.data.subscriptions.length > 0) {
          // Migrate legacy data if necessary
          const migratedSubscriptions = (cloudResult.data.subscriptions || []).map(
            migrateSubscriptionData
          );
          const migratedPaymentCards = (cloudResult.data.paymentCards || []).map(
            migratePaymentCardData
          );

          const recoveredData = {
            subscriptions: migratedSubscriptions,
            paymentCards: migratedPaymentCards,
            notifications: cloudResult.data.notifications || [],
            appSettings: cloudResult.data.appSettings || INITIAL_APP_SETTINGS,
            hasInitialized: true,
            dataCleared: false,
            weeklyBudgets: cloudResult.data.weeklyBudgets || [],
            cacheTimestamp: cloudResult.timestamp,
          };

          // Restore to cache
          saveUserDataToCache(userId, recoveredData);
          return recoveredData;
        }
      } catch (error) {
        console.warn("⚠️ Cloud recovery failed, continuing with local data:", error);
        // Continue with local data
      }
    } else {
    }

    return null;
  };

  // Enhanced data loading with progressive timing and better error handling
  const loadUserDataImpl = async (userId: string, forceCloudSync: boolean = false) => {
    try {
      // Check if we're in email confirmation flow
      const isEmailConfirmation = isEmailConfirmationFlow();

      // For authenticated users, assume they are established unless proven otherwise
      // This simplifies the logic and prevents cache clearing issues
      const isNewUser = false;

      // No need to clear cache for established users
      if (isNewUser) {
        clearUserDataCache(userId);
      }

      // First, attempt data recovery if needed (but not during email confirmation for new users or truly new users)
      const recoveredData =
        !isEmailConfirmation && !isNewUser ? await attemptDataRecovery(userId) : null;

      // Always try to load from cache first for immediate UI
      const cachedData = recoveredData || loadUserDataFromCache(userId);
      let dataToUse = cachedData;

      // Set cached/recovered data immediately for responsive UI (but not for new users)
      if (!isNewUser && (cachedData.subscriptions.length > 0 || cachedData.hasInitialized)) {
        // Migrate legacy data if necessary
        const migratedSubscriptions = cachedData.subscriptions.map(migrateSubscriptionData);
        const migratedPaymentCards = cachedData.paymentCards.map(migratePaymentCardData);

        setSubscriptionsWithMigration(migratedSubscriptions);
        setPaymentCards(migratedPaymentCards);
        setNotifications(cachedData.notifications);
        setAppSettings(cachedData.appSettings);
        setHasInitialized(cachedData.hasInitialized);
        setDataCleared(cachedData.dataCleared);
        setWeeklyBudgets(cachedData.weeklyBudgets);
      } else if (isNewUser) {
        // Ensure new users start with clean state
        const newUserData = {
          subscriptions: [],
          paymentCards: [],
          notifications: [],
          appSettings: INITIAL_APP_SETTINGS,
          hasInitialized: true,
          dataCleared: false,
          weeklyBudgets: [],
          cacheTimestamp: new Date().toISOString(),
        };

        setSubscriptionsWithMigration(newUserData.subscriptions);
        setPaymentCards(newUserData.paymentCards);
        setNotifications(newUserData.notifications);
        setAppSettings(newUserData.appSettings);
        setHasInitialized(true);
        setDataCleared(false);
        setWeeklyBudgets([]);

        // Save clean state to cache
        saveUserDataToCache(userId, newUserData);

        // Schedule cloud save for when the server becomes ready
        if (cloudSyncEnabled && isOnline) {
          setTimeout(() => {
            if (serverRequestsAllowed) {
              dataSyncManager.saveToCloud(newUserData).catch((error) => {
                console.log("ℹ️ Initial cloud save for new user failed (expected):", error);
              });
            }
          }, 15000); // Wait 15 seconds for new users to ensure session is fully ready
        }
      }

      // Enhanced cloud sync conditions with more conservative checks
      const shouldAttemptCloudSync =
        cloudSyncEnabled &&
        isOnline &&
        serverRequestsAllowed &&
        !isEmailConfirmation &&
        !isNewUser && // Don't attempt cloud sync for brand new users
        (forceCloudSync || (!cachedData.hasInitialized && sessionReadyRetries >= 2));

      if (shouldAttemptCloudSync) {
        try {
          // Progressive delays based on retry count
          let delay = 1000; // Base delay

          if (sessionReadyRetries > 0) {
            delay = Math.min(1000 + sessionReadyRetries * 500, 3000); // 1-3s for existing users
          }

          await new Promise((resolve) => setTimeout(resolve, delay));

          const cloudResult = await dataSyncManager.loadFromCloud();

          if (cloudResult.success && cloudResult.data) {
            // Migrate legacy data if necessary
            const migratedSubscriptions = (cloudResult.data.subscriptions || []).map(
              migrateSubscriptionData
            );
            const migratedPaymentCards = (cloudResult.data.paymentCards || []).map(
              migratePaymentCardData
            );

            dataToUse = {
              subscriptions: migratedSubscriptions,
              paymentCards: migratedPaymentCards,
              notifications: cloudResult.data.notifications || [],
              appSettings: cloudResult.data.appSettings || INITIAL_APP_SETTINGS,
              hasInitialized: cloudResult.data.metadata?.hasInitialized || false,
              dataCleared: cloudResult.data.metadata?.dataCleared || false,
              weeklyBudgets: cloudResult.data.weeklyBudgets || [],
              cacheTimestamp: cloudResult.timestamp,
            };

            // Update UI with cloud data
            setSubscriptionsWithMigration(dataToUse.subscriptions);
            setPaymentCards(dataToUse.paymentCards);
            setNotifications(dataToUse.notifications);
            setAppSettings(dataToUse.appSettings);
            setHasInitialized(dataToUse.hasInitialized);
            setDataCleared(dataToUse.dataCleared);
            setWeeklyBudgets(dataToUse.weeklyBudgets);

            // Update cache with fresh cloud data
            saveUserDataToCache(userId, dataToUse);
          } else {
            console.warn("⚠️ Failed to load from cloud, using cached data:", cloudResult.error);

            // Enhanced error categorization
            const errorMessage = cloudResult.error || "";
            const isNetworkError =
              errorMessage.includes("Network connection failed") ||
              errorMessage.includes("Failed to fetch") ||
              errorMessage.includes("timed out") ||
              errorMessage.includes("Server offline");

            const isAuthError =
              errorMessage.includes("AuthSessionMissingError") ||
              errorMessage.includes("Auth session missing") ||
              errorMessage.includes("Invalid or expired token") ||
              errorMessage.includes("Authentication required");

            const isServerWarning =
              errorMessage.includes("Supabase validation failed, but JWT is valid") ||
              errorMessage.includes("Supabase secondary validation unavailable");

            const isSessionError =
              errorMessage.includes("Session not ready") ||
              errorMessage.includes("session missing") ||
              errorMessage.includes("User not found");

            // Handle different error types appropriately
            if (isServerWarning) {
              setSyncStatus({
                type: "success",
                message: "Data synced (secondary validation pending)",
              });
            } else if (isAuthError || isSessionError) {
              setSyncStatus({ type: "error", message: "Session initializing - using local data" });
            } else if (isNetworkError) {
              setSyncStatus({ type: "error", message: "Server unavailable - using local data" });
            }

            // If cloud fails but we have cached data, continue with cached (only for existing users)
            if (
              !isNewUser &&
              !cachedData.hasInitialized &&
              cachedData.subscriptions.length === 0 &&
              !isNetworkError
            ) {
              // Existing user with no cloud data - start with empty data
              dataToUse = {
                subscriptions: [], // Empty for users with no data
                paymentCards: [], // Empty for users with no data
                notifications: [], // Empty for users with no data
                appSettings: INITIAL_APP_SETTINGS, // Keep settings defaults
                hasInitialized: true,
                dataCleared: false,
                weeklyBudgets: [],
                cacheTimestamp: new Date().toISOString(),
              };

              setSubscriptionsWithMigration(dataToUse.subscriptions);
              setPaymentCards(dataToUse.paymentCards);
              setNotifications(dataToUse.notifications);
              setAppSettings(dataToUse.appSettings);
              setHasInitialized(true);
              setDataCleared(false);

              // Save empty initial data to cache
              saveUserDataToCache(userId, dataToUse);

              // Try to save empty initial data to cloud in background
              if (serverRequestsAllowed) {
                const backgroundDelay = 3000;
                setTimeout(() => {
                  dataSyncManager.saveToCloud(dataToUse).catch((error) => {
                    console.warn("⚠️ Background cloud save failed:", error);
                  });
                }, backgroundDelay);
              }
            }
          }
        } catch (error) {
          // Continue with cached data on any unexpected errors
        }
      } else {
        // Handle cases where cloud sync is not attempted
        if (isEmailConfirmation || isNewUser) {
          // Initialize with empty data for new users during email confirmation or initial setup
          if (!cachedData.hasInitialized && cachedData.subscriptions.length === 0) {
            const emptyData = {
              subscriptions: [], // Empty for new users
              paymentCards: [], // Empty for new users
              notifications: [], // Empty for new users
              appSettings: INITIAL_APP_SETTINGS, // Keep settings defaults
              hasInitialized: true,
              dataCleared: false,
              weeklyBudgets: [],
              cacheTimestamp: new Date().toISOString(),
            };

            setSubscriptionsWithMigration(emptyData.subscriptions);
            setPaymentCards(emptyData.paymentCards);
            setNotifications(emptyData.notifications);
            setAppSettings(emptyData.appSettings);
            setHasInitialized(true);
            setDataCleared(false);

            saveUserDataToCache(userId, emptyData);
          }
        } else if (!serverRequestsAllowed) {
          setSyncStatus({ type: "loading", message: "Preparing session..." });
        } else if (!cachedData.hasInitialized && cachedData.subscriptions.length === 0) {
          // Local-only user with no data - start with empty data
          const localData = {
            subscriptions: [], // Empty for users with no data
            paymentCards: [], // Empty for users with no data
            notifications: [], // Empty for users with no data
            appSettings: INITIAL_APP_SETTINGS, // Keep settings defaults
            hasInitialized: true,
            dataCleared: false,
            weeklyBudgets: [],
            cacheTimestamp: new Date().toISOString(),
          };

          setSubscriptionsWithMigration(localData.subscriptions);
          setPaymentCards(localData.paymentCards);
          setNotifications(localData.notifications);
          setAppSettings(localData.appSettings);
          setHasInitialized(true);
          setDataCleared(false);

          saveUserDataToCache(userId, localData);
        }
      }

      // Determine and log the data source
      const dataSource = shouldAttemptCloudSync
        ? "cloud+cache"
        : isEmailConfirmation
          ? "cache (email confirmation)"
          : isNewUser
            ? "empty (new user)"
            : !serverRequestsAllowed
              ? "cache (session pending)"
              : !cloudSyncEnabled
                ? "cache (sync disabled)"
                : !isOnline
                  ? "cache (offline)"
                  : "cache";
    } catch (error) {
      console.error("❌ Error loading user data:", error);

      // Be more conservative about auth error handling during email confirmation
      const isEmailConfirmation = isEmailConfirmationFlow();

      if (!isEmailConfirmation) {
        throw error; // Let the caller handle auth errors
      } else {
        // Initialize with empty data for new users even if there's an error
        const errorRecoveryData = {
          subscriptions: [], // Empty for new users
          paymentCards: [], // Empty for new users
          notifications: [], // Empty for new users
          appSettings: INITIAL_APP_SETTINGS, // Keep settings defaults
          hasInitialized: true,
          dataCleared: false,
          weeklyBudgets: [],
          cacheTimestamp: new Date().toISOString(),
        };

        setSubscriptionsWithMigration(errorRecoveryData.subscriptions);
        setPaymentCards(errorRecoveryData.paymentCards);
        setNotifications(errorRecoveryData.notifications);
        setAppSettings(errorRecoveryData.appSettings);
        setHasInitialized(true);
        setDataCleared(false);

        saveUserDataToCache(userId, errorRecoveryData);
      }
    }
  };

  // Create a stable reference to loadUserData
  const loadUserDataRef = useRef(loadUserDataImpl);
  loadUserDataRef.current = loadUserDataImpl;

  const loadUserData = useCallback((userId: string, forceCloudSync: boolean = false) => {
    return loadUserDataRef.current(userId, forceCloudSync);
  }, []);

  // Save user data with enhanced session checks
  const saveUserData = async (data: {
    subscriptions: FullSubscription[];
    paymentCards: FullPaymentCard[];
    notifications: AppNotification[];
    appSettings: AppSettings;
    hasInitialized: boolean;
    dataCleared: boolean;
    weeklyBudgets: WeeklyBudget[];
  }) => {
    if (!isAuthenticated || !stableUserId) return;

    try {
      // Always save to cache immediately for responsive UI
      saveUserDataToCache(stableUserId, data);

      // Only attempt cloud save if server requests are allowed
      if (cloudSyncEnabled && isOnline && serverRequestsAllowed) {
        // Use background promise to avoid blocking UI
        dataSyncManager
          .saveToCloud({
            subscriptions: data.subscriptions,
            paymentCards: data.paymentCards,
            notifications: data.notifications,
            appSettings: data.appSettings,
            weeklyBudgets: data.weeklyBudgets,
          })
          .catch((error) => {
            // Enhanced error handling - only log unexpected errors
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            // Filter out expected errors and warnings during new user onboarding
            if (
              !errorMessage.includes("Network connection failed") &&
              !errorMessage.includes("Failed to fetch") &&
              !errorMessage.includes("timed out") &&
              !errorMessage.includes("Server offline") &&
              !errorMessage.includes("AuthSessionMissingError") &&
              !errorMessage.includes("Session not ready") &&
              !errorMessage.includes("Authentication required") &&
              !errorMessage.includes("Supabase validation failed, but JWT is valid") &&
              !errorMessage.includes("Supabase secondary validation unavailable")
            ) {
              // Cloud save failed with unexpected error, data saved locally
            }
            // Otherwise silently handle expected errors and warnings
          });
      }
    } catch (error) {
      console.error("❌ Error saving user data:", error);
      // Even if there's an error, the cache save should have succeeded
    }
  };

  // Enhanced manual data sync with comprehensive readiness checks
  const triggerDataSync = async () => {
    if (!isAuthenticated || !stableUserId) {
      return;
    }

    if (!isOnline) {
      setSyncStatus({ type: "error", message: "Cannot sync while offline" });
      return;
    }

    if (!cloudSyncEnabled) {
      return;
    }

    if (!serverRequestsAllowed) {
      setSyncStatus({ type: "error", message: "Session not ready - please wait" });
      return;
    }

    try {
      setSyncStatus({ type: "loading", message: "Syncing..." });

      await loadUserData(stableUserId, true);
    } catch (error) {
      console.error("❌ Manual sync failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Enhanced error categorization for user feedback
      if (
        errorMessage.includes("Network connection failed") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setSyncStatus({ type: "error", message: "Connection failed - check internet" });
      } else if (errorMessage.includes("timed out")) {
        setSyncStatus({ type: "error", message: "Server timeout - try again later" });
      } else if (errorMessage.includes("Invalid or expired token")) {
        setSyncStatus({ type: "error", message: "Please sign in again" });
      } else if (
        errorMessage.includes("AuthSessionMissingError") ||
        errorMessage.includes("Session not ready")
      ) {
        setSyncStatus({ type: "error", message: "Session not ready - please wait" });
      } else {
        setSyncStatus({ type: "error", message: "Sync failed - will retry automatically" });
      }
    }
  };

  // Enhanced data watcher for automatic updates
  useEffect(() => {
    const saveUpdatedData = () => {
      if (hasInitialized && stableUserId) {
        const currentData = {
          subscriptions,
          paymentCards,
          notifications,
          appSettings,
          hasInitialized,
          dataCleared,
          weeklyBudgets,
          cacheTimestamp: new Date().toISOString(),
        };
        saveUserData(currentData);
      }
    };

    saveUpdatedData();
  }, [
    subscriptions,
    paymentCards,
    notifications,
    appSettings,
    hasInitialized,
    dataCleared,
    weeklyBudgets,
    stableUserId,
  ]);

  // Enhanced sync status monitoring
  useEffect(() => {
    const handleSyncStatusUpdate = (status: SyncStatus) => {
      setSyncStatus(status);
      if (status.timestamp) {
        setLastSyncTime(status.timestamp);
      }
    };

    dataSyncManager.addSyncListener(handleSyncStatusUpdate);
    return () => dataSyncManager.removeSyncListener(handleSyncStatusUpdate);
  }, []);

  // Enhanced weekly budget calculation
  useEffect(() => {
    if (subscriptions.length > 0) {
      try {
        const requirements = calculatePayPeriodRequirements(subscriptions);
        const budgets = convertToWeeklyBudgets(requirements);
        setWeeklyBudgets(budgets);
      } catch (error) {
        console.warn("⚠️ Error calculating weekly budgets:", error);
        setWeeklyBudgets([]);
      }
    } else {
      setWeeklyBudgets([]);
    }
  }, [subscriptions]);

  const clearUserDataCacheFunction = () => {
    if (stableUserId) {
      clearUserDataCache(stableUserId);
    }
  };

  return {
    subscriptions,
    setSubscriptions: setSubscriptionsWithMigration,
    paymentCards,
    setPaymentCards,
    appSettings,
    setAppSettings,
    notifications,
    setNotifications,
    weeklyBudgets,
    hasInitialized,
    setHasInitialized,
    dataCleared,
    setDataCleared,
    syncStatus,
    setSyncStatus,
    lastSyncTime,
    sessionReady,
    serverRequestsAllowed,
    loadUserData,
    triggerDataSync,
    clearUserDataCache: clearUserDataCacheFunction,
  };
};
