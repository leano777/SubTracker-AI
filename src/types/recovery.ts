export interface RecoverySource {
  name: string;
  description: string;
  type: "cache" | "cloud" | "backup" | "browser";
  data?: any;
  timestamp?: string;
  count: {
    subscriptions: number;
    cards: number;
    notifications: number;
  };
  status: "checking" | "found" | "empty" | "error";
}

export type RecoveryStatus = "scanning" | "results" | "recovering" | "complete" | "failed";

export interface RecoveryData {
  subscriptions: any[];
  paymentCards: any[];
  notifications: any[];
  timestamp: string | null;
}

export const RECOVERY_SOURCES_TEMPLATE: RecoverySource[] = [
  {
    name: "Local Cache",
    description: "Data stored in your browser cache",
    type: "cache",
    count: { subscriptions: 0, cards: 0, notifications: 0 },
    status: "checking",
  },
  {
    name: "Cloud Backup",
    description: "Data synchronized with your account",
    type: "cloud",
    count: { subscriptions: 0, cards: 0, notifications: 0 },
    status: "checking",
  },
  {
    name: "Browser Storage",
    description: "Legacy data from browser storage",
    type: "browser",
    count: { subscriptions: 0, cards: 0, notifications: 0 },
    status: "checking",
  },
  {
    name: "Auto Backup",
    description: "Automatic backup from recent session",
    type: "backup",
    count: { subscriptions: 0, cards: 0, notifications: 0 },
    status: "checking",
  },
];

export const LEGACY_STORAGE_KEYS = [
  "subtracker_subscriptions",
  "subtracker_cards",
  "subtracker_data",
  "subscriptions",
  "paymentCards",
];
