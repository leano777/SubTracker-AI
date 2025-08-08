import { Cloud, CloudOff, WifiOff, RefreshCw, User, AlertTriangle } from "lucide-react";
import type { SyncStatus } from "./dataSync";

// Enhanced sync status indicator with Stealth Ops tactical styling
export const getSyncStatusColor = (
  isOnline: boolean,
  cloudSyncEnabled: boolean,
  isAuthenticated: boolean,
  syncStatus: SyncStatus | null,
  isStealthOps: boolean
) => {
  if (!isOnline) return isStealthOps ? "text-red-400" : "text-red-500";
  if (!cloudSyncEnabled) return isStealthOps ? "text-gray-400" : "text-gray-500";
  if (!isAuthenticated) return isStealthOps ? "text-gray-500" : "text-gray-400";
  if (syncStatus?.type === "error") {
    const message = syncStatus.message;
    if (
      message.includes("offline") ||
      message.includes("Server offline") ||
      message.includes("Connection failed")
    ) {
      return isStealthOps ? "text-orange-400" : "text-orange-500";
    }
    if (message.includes("Auth required") || message.includes("Please sign in")) {
      return isStealthOps ? "text-yellow-400" : "text-yellow-500";
    }
    return isStealthOps ? "text-red-400" : "text-red-500";
  }
  if (syncStatus?.type === "saving" || syncStatus?.type === "loading")
    return isStealthOps ? "text-blue-400" : "text-blue-500";
  if (syncStatus?.type === "success") return isStealthOps ? "text-green-400" : "text-green-500";
  return isStealthOps ? "text-gray-400" : "text-gray-500";
};

export const getSyncStatusIcon = (
  isOnline: boolean,
  cloudSyncEnabled: boolean,
  isAuthenticated: boolean,
  syncStatus: SyncStatus | null
) => {
  if (!isOnline) return WifiOff;
  if (!cloudSyncEnabled) return CloudOff;
  if (!isAuthenticated) return CloudOff;
  if (syncStatus?.type === "saving" || syncStatus?.type === "loading") return RefreshCw;
  if (syncStatus?.type === "error") {
    const message = syncStatus.message;
    if (
      message.includes("offline") ||
      message.includes("Server offline") ||
      message.includes("Connection failed")
    ) {
      return WifiOff;
    }
    if (message.includes("Auth required") || message.includes("Please sign in")) {
      return User;
    }
    return AlertTriangle;
  }
  return Cloud;
};

export const getSyncStatusText = (
  isAuthenticated: boolean,
  isOnline: boolean,
  cloudSyncEnabled: boolean,
  syncStatus: SyncStatus | null,
  isStealthOps: boolean
) => {
  if (!isAuthenticated) return isStealthOps ? "[NOT SIGNED IN]" : "Not signed in";
  if (!isOnline) return isStealthOps ? "[OFFLINE]" : "Offline";
  if (!cloudSyncEnabled) return isStealthOps ? "[LOCAL ONLY]" : "Local only";
  if (syncStatus?.type === "loading") return isStealthOps ? "[SYNCING...]" : "Syncing...";
  if (syncStatus?.type === "saving") return isStealthOps ? "[SAVING...]" : "Saving...";
  if (syncStatus?.type === "success") return isStealthOps ? "[SYNCED]" : "Synced";
  if (syncStatus?.type === "error") {
    const message = syncStatus.message;
    if (message.includes("Server offline") || message.includes("Server unavailable")) {
      return isStealthOps ? "[SERVER OFFLINE]" : "Server offline";
    }
    if (message.includes("Connection failed") || message.includes("Failed to fetch")) {
      return isStealthOps ? "[NO CONNECTION]" : "No connection";
    }
    if (message.includes("timeout")) {
      return isStealthOps ? "[TIMEOUT]" : "Timeout";
    }
    if (message.includes("Please sign in")) {
      return isStealthOps ? "[AUTH REQUIRED]" : "Auth required";
    }
    if (message.includes("Session not ready")) {
      return isStealthOps ? "[SESSION PENDING]" : "Session pending";
    }
    return isStealthOps ? "[SYNC ERROR]" : "Sync error";
  }
  return isOnline && cloudSyncEnabled
    ? isStealthOps
      ? "[ONLINE]"
      : "Online"
    : isStealthOps
      ? "[OFFLINE]"
      : "Offline";
};
