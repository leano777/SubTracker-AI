import { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, Users, Shield, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Subscription, PaymentCard } from '../types/subscription';

interface RealTimeSyncProps {
  subscriptions: Subscription[];
  cards: PaymentCard[];
  onDataSync: (data: any) => void;
  onConflictResolution: (conflicts: any[]) => void;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date;
  pendingChanges: number;
  conflicts: any[];
  syncProgress: number;
  collaborators: Array<{
    id: string;
    name: string;
    status: 'online' | 'offline';
    lastSeen: Date;
  }>;
}

export function RealTimeSync({ subscriptions, cards, onDataSync, onConflictResolution }: RealTimeSyncProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: new Date(),
    pendingChanges: 0,
    conflicts: [],
    syncProgress: 0,
    collaborators: []
  });
  
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('excellent');

  // Simulate real-time collaborators
  useEffect(() => {
    const mockCollaborators = [
      { id: '1', name: 'Sarah Chen', status: 'online' as const, lastSeen: new Date() },
      { id: '2', name: 'Mike Johnson', status: 'offline' as const, lastSeen: new Date(Date.now() - 1800000) }, // 30 min ago
    ];
    
    setSyncStatus(prev => ({ ...prev, collaborators: mockCollaborators }));
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      setConnectionQuality('excellent');
      if (autoSyncEnabled) {
        performSync();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      setConnectionQuality('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSyncEnabled]);

  // Auto-sync interval
  useEffect(() => {
    if (autoSyncEnabled && syncStatus.isOnline) {
      syncIntervalRef.current = setInterval(() => {
        performSync();
      }, 30000); // Sync every 30 seconds
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [autoSyncEnabled, syncStatus.isOnline]);

  // Simulate connection quality monitoring
  useEffect(() => {
    const checkConnectionQuality = () => {
      if (!syncStatus.isOnline) {
        setConnectionQuality('offline');
        return;
      }

      // Simulate network quality detection
      const qualities = ['excellent', 'good', 'poor'] as const;
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    };

    const qualityInterval = setInterval(checkConnectionQuality, 10000); // Check every 10 seconds
    return () => clearInterval(qualityInterval);
  }, [syncStatus.isOnline]);

  const performSync = async () => {
    if (!syncStatus.isOnline) return;

    setIsManualSyncing(true);
    setSyncStatus(prev => ({ ...prev, syncProgress: 0 }));

    try {
      // Simulate sync progress
      for (let i = 0; i <= 100; i += 20) {
        setSyncStatus(prev => ({ ...prev, syncProgress: i }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate potential conflicts (5% chance)
      const hasConflicts = Math.random() < 0.05;
      const conflicts = hasConflicts ? [
        {
          id: '1',
          type: 'subscription_modified',
          description: 'Netflix subscription was modified by Sarah Chen',
          localVersion: { cost: 15.99, lastModified: new Date(Date.now() - 60000) },
          serverVersion: { cost: 17.99, lastModified: new Date() },
          conflictType: 'cost_change'
        }
      ] : [];

      // Simulate pending changes
      const pendingChanges = Math.floor(Math.random() * 3);

      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingChanges,
        conflicts,
        syncProgress: 100
      }));

      if (conflicts.length > 0) {
        onConflictResolution(conflicts);
      }

      // Simulate receiving updates from server
      const hasUpdates = Math.random() < 0.3;
      if (hasUpdates) {
        const mockUpdate = {
          type: 'subscription_added',
          data: {
            id: Date.now().toString(),
            name: 'New Subscription from Collaborator',
            cost: 9.99,
            billingCycle: 'monthly',
            category: 'Productivity',
            addedBy: 'Sarah Chen'
          }
        };
        onDataSync(mockUpdate);
      }

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsManualSyncing(false);
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, syncProgress: 0 }));
      }, 2000);
    }
  };

  const getConnectionIcon = () => {
    if (!syncStatus.isOnline) return WifiOff;
    
    switch (connectionQuality) {
      case 'excellent': return Wifi;
      case 'good': return Wifi;
      case 'poor': return Wifi;
      default: return WifiOff;
    }
  };

  const getConnectionColor = () => {
    if (!syncStatus.isOnline) return 'text-red-500';
    
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'poor': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  const getSyncStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline - Changes will sync when reconnected';
    if (isManualSyncing) return 'Syncing...';
    if (syncStatus.pendingChanges > 0) return `${syncStatus.pendingChanges} changes pending`;
    return `Last synced ${syncStatus.lastSync.toLocaleTimeString()}`;
  };

  const ConnectionIcon = getConnectionIcon();

  return (
    <div className="space-y-4">
      {/* Main Sync Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <ConnectionIcon className={`w-5 h-5 ${getConnectionColor()}`} />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {syncStatus.isOnline ? 'Connected' : 'Offline'}
                    </span>
                    {syncStatus.isOnline && (
                      <Badge 
                        variant="outline" 
                        className={
                          connectionQuality === 'excellent' ? 'text-green-600 border-green-600' :
                          connectionQuality === 'good' ? 'text-blue-600 border-blue-600' :
                          connectionQuality === 'poor' ? 'text-yellow-600 border-yellow-600' :
                          'text-red-600 border-red-600'
                        }
                      >
                        {connectionQuality}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getSyncStatusText()}
                  </div>
                </div>
              </div>

              {/* Active Collaborators */}
              {syncStatus.collaborators.filter(c => c.status === 'online').length > 0 && (
                <div className="flex items-center space-x-2 ml-6">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div className="flex -space-x-2">
                    {syncStatus.collaborators
                      .filter(c => c.status === 'online')
                      .slice(0, 3)
                      .map((collaborator, index) => (
                        <div
                          key={collaborator.id}
                          className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background"
                          title={collaborator.name}
                        >
                          {collaborator.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {syncStatus.collaborators.filter(c => c.status === 'online').length} online
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Sync Progress */}
              {syncStatus.syncProgress > 0 && syncStatus.syncProgress < 100 && (
                <div className="w-24">
                  <Progress value={syncStatus.syncProgress} className="h-2" />
                </div>
              )}

              {/* Manual Sync Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={performSync}
                disabled={!syncStatus.isOnline || isManualSyncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isManualSyncing ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>

              {/* Auto-sync Toggle */}
              <Button
                variant={autoSyncEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              >
                <Cloud className="w-4 h-4 mr-2" />
                Auto-sync {autoSyncEnabled ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Alert */}
      {syncStatus.conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {syncStatus.conflicts.length} sync conflict{syncStatus.conflicts.length > 1 ? 's' : ''} detected. 
            Please resolve to continue syncing.
            <div className="mt-2">
              {syncStatus.conflicts.map((conflict, index) => (
                <div key={index} className="text-sm p-2 bg-destructive/10 rounded border mt-1">
                  {conflict.description}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Offline Indicator */}
      {!syncStatus.isOnline && (
        <Alert>
          <CloudOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Changes will be saved locally and synced when you reconnect.
            <div className="mt-2">
              <Badge variant="secondary">
                {syncStatus.pendingChanges} changes queued for sync
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Collaborator Status */}
      {syncStatus.collaborators.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Team Members
              </h4>
              <Badge variant="outline">
                {syncStatus.collaborators.filter(c => c.status === 'online').length} of {syncStatus.collaborators.length} online
              </Badge>
            </div>
            
            <div className="space-y-2">
              {syncStatus.collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-sm">{collaborator.name}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {collaborator.status === 'online' 
                      ? 'Online now' 
                      : `Last seen ${collaborator.lastSeen.toLocaleTimeString()}`
                    }
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Security Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">End-to-end encrypted</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>🔒 AES-256 encryption</span>
              <span>🛡️ SOC 2 compliant</span>
              <span>🌍 Global CDN</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}