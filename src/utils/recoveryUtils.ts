import { FullSubscription, PaymentCard as FullPaymentCard } from "../types/subscription";
import { Notification } from "../types/constants";
import { RecoveryData, LEGACY_STORAGE_KEYS } from "../types/recovery";
import { getUserStorageKey } from "./cache";

// Check legacy browser storage for recoverable data
export const checkLegacyBrowserStorage = (): RecoveryData => {
  let subscriptions: FullSubscription[] = [];
  let paymentCards: FullPaymentCard[] = [];
  let notifications: Notification[] = [];
  let timestamp: string | null = null;

  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        if (Array.isArray(data)) {
          // Determine data type by structure
          if (data.length > 0) {
            const first = data[0];
            if (first.name && first.cost && first.nextPayment) {
              subscriptions = [...subscriptions, ...data];
            } else if (first.lastFour && first.brand) {
              paymentCards = [...paymentCards, ...data];
            }
          }
        } else if (data.subscriptions || data.paymentCards) {
          subscriptions = [...subscriptions, ...(data.subscriptions || [])];
          paymentCards = [...paymentCards, ...(data.paymentCards || [])];
          notifications = [...notifications, ...(data.notifications || [])];
        }

        // Try to get timestamp
        const timestampKey = key + "_timestamp";
        const storedTimestamp = localStorage.getItem(timestampKey);
        if (storedTimestamp && !timestamp) {
          timestamp = storedTimestamp;
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  return {
    subscriptions,
    paymentCards,
    notifications,
    timestamp: timestamp || new Date().toISOString(),
  };
};

// Check auto backup for recoverable data
export const checkAutoBackup = (userId: string): RecoveryData => {
  try {
    const backupKey = getUserStorageKey(userId, "autoBackup");
    const stored = localStorage.getItem(backupKey);
    if (stored) {
      const backup = JSON.parse(stored);
      return {
        subscriptions: backup.subscriptions || [],
        paymentCards: backup.paymentCards || [],
        notifications: backup.notifications || [],
        timestamp: backup.timestamp,
      };
    }
  } catch (error) {
    // Ignore errors
  }

  return {
    subscriptions: [],
    paymentCards: [],
    notifications: [],
    timestamp: null,
  };
};

// Create recovery backup for future reference
export const createRecoveryBackup = (userId: string, data: any, sourceName: string) => {
  try {
    const recoveryBackupKey = getUserStorageKey(userId, "recoveryBackup");
    localStorage.setItem(
      recoveryBackupKey,
      JSON.stringify({
        ...data,
        recoverySource: sourceName,
        recoveryTimestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Failed to create recovery backup:", error);
  }
};

// Get priority order for recovery sources
export const getSourcePriorityOrder = (): string[] => {
  return ["cloud", "cache", "browser", "backup"];
};

// Auto-select the best recovery source
export const selectBestRecoverySource = (sources: any[]) => {
  const availableSources = sources.filter((s) => s.status === "found");
  if (availableSources.length === 0) return null;

  const priorityOrder = getSourcePriorityOrder();
  return (
    priorityOrder.map((type) => availableSources.find((s) => s.type === type)).filter(Boolean)[0] ||
    availableSources[0]
  );
};
