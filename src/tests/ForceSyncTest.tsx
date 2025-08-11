import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface ForceSyncTestProps {
  triggerDataSync: () => Promise<void>;
  syncStatus: any;
  lastSyncTime: string | null;
  isOnline: boolean;
  cloudSyncEnabled: boolean;
}

export const ForceSyncTest: React.FC<ForceSyncTestProps> = ({
  triggerDataSync,
  syncStatus,
  lastSyncTime,
  isOnline,
  cloudSyncEnabled,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [uiBlocked, setUIBlocked] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Test UI responsiveness during sync
  const testUIResponsiveness = () => {
    setClickCount(prev => prev + 1);
    setTestResults(prev => [...prev, `UI Click Test ${clickCount + 1}: ${uiBlocked ? 'BLOCKED' : 'RESPONSIVE'}`]);
  };

  // Monitor sync status for UI blocking
  useEffect(() => {
    if (syncStatus?.type === "loading" || syncStatus?.type === "saving") {
      setUIBlocked(true);
    } else {
      setUIBlocked(false);
    }
  }, [syncStatus]);

  const runForceSyncTest = async () => {
    setIsTesting(true);
    setTestResults([]);
    setClickCount(0);

    try {
      // Test 1: Initial state check
      setTestResults(prev => [...prev, `Initial sync status: ${syncStatus?.type || 'null'}`]);
      setTestResults(prev => [...prev, `Cloud sync enabled: ${cloudSyncEnabled}`]);
      setTestResults(prev => [...prev, `Online status: ${isOnline}`]);

      // Test 2: Trigger force sync
      setTestResults(prev => [...prev, 'Triggering force sync...']);
      await triggerDataSync();

      // Test 3: Check if sync completed
      setTimeout(() => {
        setTestResults(prev => [...prev, `Post-sync status: ${syncStatus?.type || 'null'}`]);
        setTestResults(prev => [...prev, `Last sync time updated: ${lastSyncTime ? 'YES' : 'NO'}`]);
        
        // Test 4: Final UI responsiveness check
        setTestResults(prev => [...prev, `Final UI state: ${uiBlocked ? 'BLOCKED' : 'RESPONSIVE'}`]);
        
        setIsTesting(false);
      }, 2000);

    } catch (error) {
      setTestResults(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (isTesting) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (!isOnline) return <XCircle className="w-4 h-4 text-red-500" />;
    if (!cloudSyncEnabled) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isTesting) return "Running tests...";
    if (!isOnline) return "Offline - Cannot test sync";
    if (!cloudSyncEnabled) return "Cloud sync disabled";
    return "Ready to test";
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Force Sync Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Test Status:</span>
          <Badge variant={isTesting ? "default" : isOnline && cloudSyncEnabled ? "default" : "destructive"}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Current Sync Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Sync Status:</strong> {syncStatus?.type || 'None'}
          </div>
          <div>
            <strong>UI Blocked:</strong> {uiBlocked ? 'YES' : 'NO'}
          </div>
          <div>
            <strong>Last Sync:</strong> {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
          </div>
          <div>
            <strong>Click Count:</strong> {clickCount}
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={runForceSyncTest}
            disabled={isTesting || !isOnline || !cloudSyncEnabled}
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
            Run Force Sync Test
          </Button>
          
          <Button 
            onClick={testUIResponsiveness}
            variant="outline"
            className="flex-1"
          >
            Test UI Responsiveness
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm font-mono max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-gray-700 dark:text-gray-300">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Summary */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p><strong>Expected behavior:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Force sync should trigger without blocking UI</li>
            <li>UI responsiveness test should work during sync</li>
            <li>Sync status should update correctly</li>
            <li>Last sync time should be updated after successful sync</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
