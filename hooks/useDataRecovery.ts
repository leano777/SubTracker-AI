import { useState, useEffect } from 'react';
import { RecoverySource, RecoveryStatus, RECOVERY_SOURCES_TEMPLATE } from '../types/recovery';
import { loadUserDataFromCache, saveUserDataToCache } from '../utils/cache';
import { dataSyncManager } from '../utils/dataSync';
import { checkLegacyBrowserStorage, checkAutoBackup, createRecoveryBackup, selectBestRecoverySource } from '../utils/recoveryUtils';
import { INITIAL_APP_SETTINGS } from '../data/mockData';

export function useDataRecovery(user: any) {
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [recoverySources, setRecoverySources] = useState<RecoverySource[]>([]);
  const [selectedSource, setSelectedSource] = useState<RecoverySource | null>(null);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>('scanning');

  // Scan for recoverable data
  const scanForRecoverableData = async () => {
    if (!user?.id) return;

    setIsScanning(true);
    setRecoveryProgress(0);
    setRecoverySources([...RECOVERY_SOURCES_TEMPLATE]);
    
    const sources = [...RECOVERY_SOURCES_TEMPLATE];

    try {
      // Check local cache
      setRecoveryProgress(25);
      try {
        const cachedData = loadUserDataFromCache(user.id);
        if (cachedData.subscriptions.length > 0 || cachedData.paymentCards.length > 0) {
          sources[0] = {
            ...sources[0],
            data: cachedData,
            timestamp: cachedData.cacheTimestamp,
            count: {
              subscriptions: cachedData.subscriptions.length,
              cards: cachedData.paymentCards.length,
              notifications: cachedData.notifications.length
            },
            status: 'found'
          };
        } else {
          sources[0].status = 'empty';
        }
      } catch (error) {
        sources[0].status = 'error';
      }

      // Check cloud backup
      setRecoveryProgress(50);
      try {
        const cloudResult = await dataSyncManager.loadFromCloud();
        if (cloudResult.success && cloudResult.data && 
            (cloudResult.data.subscriptions.length > 0 || cloudResult.data.paymentCards.length > 0)) {
          sources[1] = {
            ...sources[1],
            data: cloudResult.data,
            timestamp: cloudResult.timestamp,
            count: {
              subscriptions: cloudResult.data.subscriptions.length,
              cards: cloudResult.data.paymentCards.length,
              notifications: cloudResult.data.notifications.length
            },
            status: 'found'
          };
        } else {
          sources[1].status = 'empty';
        }
      } catch (error) {
        sources[1].status = 'error';
      }

      // Check browser storage (legacy keys)
      setRecoveryProgress(75);
      try {
        const legacyData = checkLegacyBrowserStorage();
        if (legacyData.subscriptions.length > 0 || legacyData.paymentCards.length > 0) {
          sources[2] = {
            ...sources[2],
            data: legacyData,
            timestamp: legacyData.timestamp,
            count: {
              subscriptions: legacyData.subscriptions.length,
              cards: legacyData.paymentCards.length,
              notifications: legacyData.notifications.length
            },
            status: 'found'
          };
        } else {
          sources[2].status = 'empty';
        }
      } catch (error) {
        sources[2].status = 'error';
      }

      // Check auto backup
      setRecoveryProgress(90);
      try {
        const backupData = checkAutoBackup(user.id);
        if (backupData.subscriptions.length > 0 || backupData.paymentCards.length > 0) {
          sources[3] = {
            ...sources[3],
            data: backupData,
            timestamp: backupData.timestamp,
            count: {
              subscriptions: backupData.subscriptions.length,
              cards: backupData.paymentCards.length,
              notifications: backupData.notifications.length
            },
            status: 'found'
          };
        } else {
          sources[3].status = 'empty';
        }
      } catch (error) {
        sources[3].status = 'error';
      }

      setRecoveryProgress(100);
      setRecoverySources(sources);
      setRecoveryStatus('results');

      // Auto-select the best source
      const bestSource = selectBestRecoverySource(sources);
      setSelectedSource(bestSource);

    } catch (error) {
      console.error('Recovery scan failed:', error);
      setRecoveryStatus('failed');
    } finally {
      setIsScanning(false);
    }
  };

  // Perform data recovery
  const performRecovery = async (onDataRecovered: (data: any) => void) => {
    if (!selectedSource || !selectedSource.data) return;

    setRecoveryStatus('recovering');
    setRecoveryProgress(0);

    try {
      // Prepare recovered data
      const recoveredData = {
        subscriptions: selectedSource.data.subscriptions || [],
        paymentCards: selectedSource.data.paymentCards || [],
        notifications: selectedSource.data.notifications || [],
        appSettings: selectedSource.data.appSettings || INITIAL_APP_SETTINGS
      };

      setRecoveryProgress(50);

      // Create backup of current state before recovery
      if (user?.id) {
        const backupData = {
          subscriptions: recoveredData.subscriptions,
          paymentCards: recoveredData.paymentCards,
          notifications: recoveredData.notifications,
          appSettings: recoveredData.appSettings,
          hasInitialized: true,
          dataCleared: false,
          weeklyBudgets: [],
          timestamp: new Date().toISOString()
        };

        saveUserDataToCache(user.id, backupData);
        createRecoveryBackup(user.id, backupData, selectedSource.name);
      }

      setRecoveryProgress(100);
      setRecoveryStatus('complete');

      // Notify parent component
      onDataRecovered(recoveredData);

    } catch (error) {
      console.error('Recovery failed:', error);
      setRecoveryStatus('failed');
    }
  };

  return {
    recoveryProgress,
    isScanning,
    recoverySources,
    selectedSource,
    recoveryStatus,
    setSelectedSource,
    scanForRecoverableData,
    performRecovery
  };
}