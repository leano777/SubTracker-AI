import type { AppSettings, Notification } from "../types/constants";
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
import { getUserStorageKey } from "./cache";

export interface BackupData {
  subscriptions: FullSubscription[];
  paymentCards: FullPaymentCard[];
  notifications: Notification[];
  appSettings: AppSettings;
  weeklyBudgets: WeeklyBudget[];
  timestamp: string;
  backupType: "auto" | "manual" | "pre-operation";
}

// Create automatic backup before any destructive operations
export const createAutoBackup = (
  userId: string,
  data: {
    subscriptions: FullSubscription[];
    paymentCards: FullPaymentCard[];
    notifications: Notification[];
    appSettings: AppSettings;
    weeklyBudgets: any[];
  },
  type: BackupData["backupType"] = "auto"
) => {
  try {
    const backupData: BackupData = {
      ...data,
      timestamp: new Date().toISOString(),
      backupType: type,
    };

    const backupKey = getUserStorageKey(userId, `backup_${type}_${Date.now()}`);
    localStorage.setItem(backupKey, JSON.stringify(backupData));

    // Keep only the last 5 backups to prevent storage bloat
    cleanupOldBackups(userId, type);

    // Auto backup created successfully
    return backupKey;
  } catch (error) {
    console.error("Failed to create auto backup:", error);
    return null;
  }
};

// Clean up old backups to prevent storage bloat
export const cleanupOldBackups = (userId: string, backupType: BackupData["backupType"]) => {
  try {
    const prefix = getUserStorageKey(userId, `backup_${backupType}_`);
    const backupKeys: string[] = [];

    // Find all backup keys for this type
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        backupKeys.push(key);
      }
    }

    // Sort by timestamp (newest first) and keep only the latest 5
    backupKeys.sort((a, b) => {
      const timestampA = a.split("_").pop() || "0";
      const timestampB = b.split("_").pop() || "0";
      return parseInt(timestampB) - parseInt(timestampA);
    });

    // Remove old backups (keep only 5 most recent)
    for (let i = 5; i < backupKeys.length; i++) {
      localStorage.removeItem(backupKeys[i]);
    }
  } catch (error) {
    console.error("Failed to cleanup old backups:", error);
  }
};

// Get the most recent backup
export const getLatestBackup = (
  userId: string,
  backupType?: BackupData["backupType"]
): BackupData | null => {
  try {
    const searchPrefix = backupType
      ? getUserStorageKey(userId, `backup_${backupType}_`)
      : getUserStorageKey(userId, "backup_");

    let latestBackup: BackupData | null = null;
    let latestTimestamp = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(searchPrefix)) {
        try {
          const backup = JSON.parse(localStorage.getItem(key) || "");
          const timestamp = new Date(backup.timestamp).getTime();

          if (timestamp > latestTimestamp) {
            latestTimestamp = timestamp;
            latestBackup = backup;
          }
        } catch (parseError) {
          // Ignore invalid backups
        }
      }
    }

    return latestBackup;
  } catch (error) {
    console.error("Failed to get latest backup:", error);
    return null;
  }
};

// Check if data appears to be empty/cleared and attempt recovery
export const detectDataLossAndRecover = (
  userId: string,
  currentData: {
    subscriptions: FullSubscription[];
    paymentCards: FullPaymentCard[];
  }
): BackupData | null => {
  // If current data is empty, try to find a recent backup with data
  if (currentData.subscriptions.length === 0 && currentData.paymentCards.length === 0) {
    // Empty data detected, checking for recent backups

    const recentBackup = getLatestBackup(userId);
    if (
      recentBackup &&
      (recentBackup.subscriptions.length > 0 || recentBackup.paymentCards.length > 0)
    ) {
      console.log("📦 Found recent backup with data, suggesting recovery");
      return recentBackup;
    }
  }

  return null;
};

// Create emergency backup immediately
export const createEmergencyBackup = (userId: string, data: any) => {
  return createAutoBackup(userId, data, "manual");
};

// Get all available backups for user
export const getAllBackups = (userId: string): BackupData[] => {
  const backups: BackupData[] = [];
  const searchPrefix = getUserStorageKey(userId, "backup_");

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(searchPrefix)) {
        try {
          const backup = JSON.parse(localStorage.getItem(key) || "");
          backups.push(backup);
        } catch (parseError) {
          // Ignore invalid backups
        }
      }
    }

    // Sort by timestamp (newest first)
    backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Failed to get all backups:", error);
  }

  return backups;
};
