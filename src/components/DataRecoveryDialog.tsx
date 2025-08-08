import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import type { FullSubscription, PaymentCard as FullPaymentCard } from "../types/subscription";
import type { AppSettings, Notification } from "../types/constants";
import type { RecoverySource } from "../types/recovery";
import { useDataRecovery } from "../hooks/useDataRecovery";

interface DataRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  isStealthOps: boolean;
  isDarkMode: boolean;
  textColors: any;
  glassAccentStyles: any;
  onDataRecovered: (data: {
    subscriptions: FullSubscription[];
    paymentCards: FullPaymentCard[];
    notifications: Notification[];
    appSettings: AppSettings;
  }) => void;
}

export function DataRecoveryDialog({
  open,
  onOpenChange,
  user,
  isStealthOps,
  isDarkMode,
  textColors,
  glassAccentStyles,
  onDataRecovered,
}: DataRecoveryDialogProps) {
  const {
    recoveryProgress,
    isScanning,
    recoverySources,
    selectedSource,
    recoveryStatus,
    setSelectedSource,
    scanForRecoverableData,
    performRecovery,
  } = useDataRecovery(user);

  // Static accessibility ID to prevent undefined values
  const DIALOG_DESCRIPTION_ID = "data-recovery-dialog-description";

  // Start scanning when dialog opens
  useEffect(() => {
    if (open && user?.id) {
      scanForRecoverableData();
    }
  }, [open, user?.id]);

  const getStatusIcon = (status: RecoverySource["status"]) => {
    switch (status) {
      case "checking":
        return <Clock className="w-4 h-4 animate-pulse text-blue-500" />;
      case "found":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "empty":
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: RecoverySource["status"]) => {
    switch (status) {
      case "found":
        return "border-green-500 bg-green-50 dark:bg-green-900/20";
      case "empty":
        return "border-gray-300 bg-gray-50 dark:bg-gray-800/20";
      case "error":
        return "border-red-300 bg-red-50 dark:bg-red-900/20";
      default:
        return "border-gray-300 bg-white dark:bg-gray-800";
    }
  };

  const handleRecovery = async () => {
    await performRecovery(onDataRecovered);
    // Auto-close after completion
    setTimeout(() => onOpenChange(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-2xl max-h-[90vh] overflow-y-auto border-0 mx-4 ${
          isStealthOps ? "tactical-surface" : "rounded-2xl"
        }`}
        style={glassAccentStyles}
        aria-describedby={DIALOG_DESCRIPTION_ID}
      >
        <DialogHeader>
          <DialogTitle className={`${textColors.onGlass} flex items-center gap-2`}>
            <RefreshCw className={`w-5 h-5 ${isStealthOps ? "text-green-400" : "text-blue-500"}`} />
            {isStealthOps ? "[DATA RECOVERY SYSTEM]" : "Data Recovery System"}
          </DialogTitle>
          <DialogDescription id={DIALOG_DESCRIPTION_ID} className={textColors.muted}>
            {isStealthOps
              ? "[SCANNING MULTIPLE SOURCES TO RECOVER YOUR SUBSCRIPTION DATA...]"
              : "Scanning multiple sources to recover your subscription data and restore your account."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {recoveryStatus === "scanning" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <RefreshCw
                  className={`w-5 h-5 animate-spin ${isStealthOps ? "text-green-400" : "text-blue-500"}`}
                />
                <span className={textColors.onGlass}>
                  {isStealthOps
                    ? "[SCANNING FOR RECOVERABLE DATA...]"
                    : "Scanning for recoverable data..."}
                </span>
              </div>
              <Progress value={recoveryProgress} className="w-full" />
            </div>
          )}

          {recoveryStatus === "results" && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg ${isStealthOps ? "tactical-surface border border-blue-400" : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200"}`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle
                    className={`w-5 h-5 mt-0.5 ${isStealthOps ? "text-blue-400" : "text-blue-500"}`}
                  />
                  <div>
                    <h4 className={`font-medium ${textColors.onGlass} mb-1`}>
                      {isStealthOps ? "[SCAN COMPLETE]" : "Scan Complete"}
                    </h4>
                    <p className={`text-sm ${textColors.muted}`}>
                      {isStealthOps
                        ? "[FOUND MULTIPLE DATA SOURCES. SELECT ONE TO RECOVER YOUR SUBSCRIPTIONS.]"
                        : "Found multiple data sources. Select one to recover your subscriptions."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {recoverySources.map((source, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSource === source
                        ? `border-blue-500 ${isStealthOps ? "tactical-glow" : "ring-2 ring-blue-200"}`
                        : getStatusColor(source.status)
                    } ${source.status === "found" ? "hover:border-blue-400" : ""}`}
                    onClick={() =>
                      source.status === "found" ? setSelectedSource(source) : undefined
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(source.status)}
                        <div>
                          <h4 className={`font-medium ${textColors.onGlass}`}>
                            {isStealthOps ? `[${source.name.toUpperCase()}]` : source.name}
                          </h4>
                          <p className={`text-sm ${textColors.muted} mb-2`}>
                            {isStealthOps
                              ? `[${source.description.toUpperCase()}]`
                              : source.description}
                          </p>
                          {source.status === "found" && (
                            <div className="flex gap-4 text-xs">
                              <span className={textColors.muted}>
                                {isStealthOps ? "[SUBS: " : "Subscriptions: "}
                                {source.count.subscriptions}
                                {isStealthOps ? "]" : ""}
                              </span>
                              <span className={textColors.muted}>
                                {isStealthOps ? "[CARDS: " : "Cards: "}
                                {source.count.cards}
                                {isStealthOps ? "]" : ""}
                              </span>
                              {source.timestamp && (
                                <span className={textColors.muted}>
                                  {isStealthOps ? "[LAST UPDATE: " : "Last updated: "}
                                  {new Date(source.timestamp).toLocaleDateString()}
                                  {isStealthOps ? "]" : ""}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedSource === source && (
                        <CheckCircle
                          className={`w-5 h-5 ${isStealthOps ? "text-green-400" : "text-blue-500"}`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedSource && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleRecovery}
                    className={`flex-1 ${
                      isStealthOps
                        ? "tactical-button text-black bg-green-500 hover:bg-green-400"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isStealthOps ? "[RECOVER DATA]" : "Recover Data"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className={isStealthOps ? "tactical-button" : ""}
                  >
                    {isStealthOps ? "[CANCEL]" : "Cancel"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {recoveryStatus === "recovering" && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <RefreshCw
                  className={`w-6 h-6 animate-spin ${isStealthOps ? "text-green-400" : "text-blue-500"}`}
                />
                <span className={`text-lg ${textColors.onGlass}`}>
                  {isStealthOps ? "[RECOVERING DATA...]" : "Recovering your data..."}
                </span>
              </div>
              <Progress value={recoveryProgress} className="w-full" />
            </div>
          )}

          {recoveryStatus === "complete" && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle
                  className={`w-8 h-8 ${isStealthOps ? "text-green-400" : "text-green-500"}`}
                />
                <span className={`text-lg font-medium ${textColors.onGlass}`}>
                  {isStealthOps ? "[RECOVERY COMPLETE]" : "Recovery Complete!"}
                </span>
              </div>
              <p className={textColors.muted}>
                {isStealthOps
                  ? "[YOUR SUBSCRIPTION DATA HAS BEEN SUCCESSFULLY RESTORED.]"
                  : "Your subscription data has been successfully restored."}
              </p>
            </div>
          )}

          {recoveryStatus === "failed" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isStealthOps
                  ? "[RECOVERY FAILED. PLEASE TRY MANUAL IMPORT OR CONTACT SUPPORT.]"
                  : "Recovery failed. Please try manual import or contact support."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
