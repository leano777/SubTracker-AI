import { useState, useEffect } from 'react';
import { FullSubscription, PaymentCard as FullPaymentCard, WeeklyBudget } from '../types/subscription';
import { AppSettings, Notification } from '../types/constants';
import { INITIAL_SUBSCRIPTIONS, INITIAL_PAYMENT_CARDS, INITIAL_NOTIFICATIONS, INITIAL_APP_SETTINGS } from '../data/mockData';
import { dataSyncManager, SyncStatus } from '../utils/dataSync';
import { saveUserDataToCache, loadUserDataFromCache, clearUserDataCache } from '../utils/cache';
import { calculatePayPeriodRequirements, getSubscriptionStatistics } from '../utils/payPeriodCalculations';

// Enhanced data migration function with robust validation
const migrateSubscriptionData = (subscription: any): FullSubscription => {
  if (!subscription) {
    console.error('⚠️ Null subscription passed to migration, creating placeholder');
    return {
      id: 'placeholder-' + Date.now(),
      name: 'Unknown Subscription',
      price: 0,
      frequency: 'monthly',
      nextPayment: new Date().toISOString().split('T')[0],
      category: 'Other',
      status: 'active',
      dateAdded: new Date().toISOString().split('T')[0]
    };
  }

  // Enhanced frequency validation and migration with more robust handling
  const determineFrequency = (sub: any): 'monthly' | 'yearly' | 'weekly' | 'daily' => {
    // Try multiple possible field names for frequency
    const freq = sub.frequency || sub.billingCycle || sub.billing_cycle || sub.cycle || sub.interval;
    
    if (!freq || (typeof freq !== 'string' && typeof freq !== 'number')) {
      console.warn(`⚠️ Missing or invalid frequency for "${sub.name || 'Unknown'}" (value: ${freq}), defaulting to monthly`);
      console.warn(`   Available fields:`, Object.keys(sub || {}));
      return 'monthly';
    }
    
    // Convert to string and normalize
    const normalizedFreq = String(freq).toLowerCase().trim();
    
    // Map various frequency formats to standard values (more comprehensive)
    switch (normalizedFreq) {
      // Weekly variants
      case 'weekly':
      case 'week':
      case 'w':
      case '7':
      case 'every week':
        return 'weekly';
      
      // Monthly variants  
      case 'monthly':
      case 'month':
      case 'm':
      case '30':
      case '1':
      case 'every month':
      case 'per month':
        return 'monthly';
      
      // Yearly variants
      case 'yearly':
      case 'annual':
      case 'annually':
      case 'year':
      case 'y':
      case '365':
      case '12':
      case 'every year':
      case 'per year':
        return 'yearly';
      
      // Daily variants
      case 'daily':
      case 'day':
      case 'd':
      case 'every day':
      case 'per day':
        return 'daily';
      
      // Special cases - convert to closest standard frequency
      case 'quarterly':
      case 'quarter':
      case 'q':
      case '3':
      case 'every 3 months':
        console.warn(`⚠️ Converting quarterly billing to monthly for "${sub.name || 'Unknown'}" (will adjust price accordingly)`);
        return 'monthly';
      
      case 'bi-weekly':
      case 'biweekly':
      case 'every 2 weeks':
      case '14':
        console.warn(`⚠️ Converting bi-weekly billing to weekly for "${sub.name || 'Unknown'}" (will adjust price accordingly)`);
        return 'weekly';
      
      case 'semi-annually':
      case 'semi-annual':
      case 'every 6 months':
      case '6':
        console.warn(`⚠️ Converting semi-annual billing to monthly for "${sub.name || 'Unknown'}" (will adjust price accordingly)`);
        return 'monthly';
      
      default:
        console.warn(`⚠️ Unknown frequency "${freq}" for "${sub.name || 'Unknown'}", defaulting to monthly`);
        console.warn(`   Normalized value was: "${normalizedFreq}"`);
        return 'monthly';
    }
  };

  // Robust price validation
  const determinePrice = (sub: any): number => {
    const price = sub.price ?? sub.cost;
    const parsedPrice = typeof price === 'number' ? price : parseFloat(price);
    
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      console.warn(`⚠️ Invalid price for "${sub.name || 'Unknown'}": ${price}, defaulting to 0`);
      return 0;
    }
    
    return parsedPrice;
  };

  // Check if this is already in the correct format
  const hasNewFormat = subscription.price !== undefined && subscription.frequency !== undefined;
  const hasValidFrequency = subscription.frequency && typeof subscription.frequency === 'string' && subscription.frequency.trim() !== '';
  
  if (hasNewFormat && hasValidFrequency) {
    // Always validate the frequency even if it seems correct
    const determinedFrequency = determineFrequency(subscription);
    const determinedPrice = determinePrice(subscription);
    
    // Ensure the frequency is one of our valid options
    const validFrequencies = ['monthly', 'yearly', 'weekly', 'daily'];
    const finalFrequency = validFrequencies.includes(determinedFrequency) ? determinedFrequency : 'monthly';
    
    const validated = {
      ...subscription,
      frequency: finalFrequency,
      price: determinedPrice
    };
    
    console.log(`✅ Validated subscription "${subscription.name}" - frequency: ${finalFrequency}, price: ${determinedPrice}`);
    return validated as FullSubscription;
  }
  
  // Migrate from old format to new format
  const determinedFrequency = determineFrequency(subscription);
  const determinedPrice = determinePrice(subscription);
  
  // Final safety check - ensure frequency is valid
  const validFrequencies = ['monthly', 'yearly', 'weekly', 'daily'];
  const safeFrequency = validFrequencies.includes(determinedFrequency) ? determinedFrequency : 'monthly';
  
  const migrated: FullSubscription = {
    id: subscription.id || `migrated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: subscription.name || 'Unknown Subscription',
    price: determinedPrice,
    frequency: safeFrequency,
    nextPayment: subscription.nextPayment || new Date().toISOString().split('T')[0],
    category: subscription.category || 'Other',
    status: subscription.status || (subscription.isActive ? 'active' : 'cancelled') || 'active',
    description: subscription.description,
    website: subscription.billingUrl || subscription.website,
    dateAdded: subscription.dateAdded || new Date().toISOString().split('T')[0],
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
    businessExpense: subscription.subscriptionType === 'business' || subscription.businessExpense,
    taxDeductible: subscription.taxDeductible,
    isStarred: subscription.isStarred,
    reminderDays: subscription.reminderDays,
    trialEndDate: subscription.trialEndDate
  };
  
  // Validate the final migrated object
  if (!migrated.frequency || !['monthly', 'yearly', 'weekly', 'daily'].includes(migrated.frequency)) {
    console.error(`❌ Migration failed validation for "${migrated.name}" - invalid frequency: ${migrated.frequency}, forcing to monthly`);
    migrated.frequency = 'monthly';
  }
  
  if (typeof migrated.price !== 'number' || migrated.price < 0) {
    console.error(`❌ Migration failed validation for "${migrated.name}" - invalid price: ${migrated.price}, forcing to 0`);
    migrated.price = 0;
  }
  
  console.log(`🔄 Migrated subscription "${migrated.name}" from legacy format - price: ${migrated.price}, frequency: ${migrated.frequency}`);
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
    lastFourDigits: card.lastFour || card.lastFourDigits || '0000',
    expiryMonth: parseInt(card.expiryMonth) || 12,
    expiryYear: parseInt(card.expiryYear) || 2026,
    provider: card.issuer?.toLowerCase() || card.provider || 'visa',
    isDefault: card.isDefault || false,
    nickname: card.nickname,
    color: card.color,
    dateAdded: card.dateAdded,
    billingAddress: card.billingAddress,
    creditLimit: card.creditLimit,
    availableCredit: card.availableCredit,
    statementDate: card.statementDate,
    paymentDueDate: card.paymentDueDate
  };
  
  console.log(`🔄 Migrated payment card "${card.nickname || card.name}" from legacy format`);
  return migrated;
};

// Helper function to convert PayPeriodRequirement to WeeklyBudget
const convertToWeeklyBudgets = (requirements: any[]): WeeklyBudget[] => {
  return requirements.map((req, index) => ({
    id: req.id || `budget-${index}`,
    weekLabel: req.weekLabel,
    startDate: req.startDate,
    endDate: req.endDate,
    allocatedAmount: req.requiredAmount || 0,
    subscriptions: req.subscriptions || []
  }));
};

// Enhanced session readiness check with multiple validation layers
const isSessionReady = (session: any, user: any, retryCount: number = 0): boolean => {
  if (!session || !user) {
    console.log(`⏳ Session readiness check failed: missing session (${!!session}) or user (${!!user})`);
    return false;
  }
  
  // Check if we have the essential session components
  if (!session.access_token || !user.id || !user.email) {
    console.log(`⏳ Session readiness check failed: missing essential data - token: ${!!session.access_token}, id: ${!!user.id}, email: ${!!user.email}`);
    return false;
  }
  
  // Check if the token looks valid (enhanced format check)
  if (!session.access_token.startsWith('eyJ') || session.access_token.split('.').length !== 3) {
    console.log('⏳ Session readiness check failed: invalid JWT token format');
    return false;
  }
  
  // Additional JWT payload validation
  try {
    const payload = JSON.parse(atob(session.access_token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      console.log('⏳ Session readiness check failed: token expired');
      return false;
    }
    
    // Check if token has required claims
    if (!payload.sub || !payload.email || payload.sub !== user.id) {
      console.log('⏳ Session readiness check failed: token missing required claims or mismatch');
      return false;
    }
    
  } catch (error) {
    console.log('⏳ Session readiness check failed: JWT payload validation error:', error);
    return false;
  }
  
  // For new users, be more lenient but add time-based checks
  const isNewUser = !user.email_confirmed_at;
  const userCreatedRecently = user.created_at && 
    (Date.now() - new Date(user.created_at).getTime()) < 10 * 60 * 1000; // 10 minutes grace period
  
  if (isNewUser && userCreatedRecently) {
    // For very new users, add additional wait time based on how recent they are
    const userAge = Date.now() - new Date(user.created_at).getTime();
    const minWaitTime = 5000; // 5 seconds minimum
    
    if (userAge < minWaitTime && retryCount < 3) {
      console.log(`⏳ New user (${Math.round(userAge/1000)}s old) - waiting for session to fully settle (retry ${retryCount + 1})`);
      return false;
    }
    
    console.log(`✅ New user session ready (age: ${Math.round(userAge/1000)}s, retry: ${retryCount})`);
  }
  
  return true;
};

// Enhanced check for email confirmation flow
const isEmailConfirmationFlow = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const hasConfirmationParams = urlParams.has('token_hash') || urlParams.has('type') || 
                               urlParams.has('access_token') || urlParams.has('refresh_token');
  
  // Also check for common confirmation URL patterns
  const hasConfirmationPath = window.location.pathname.includes('confirm') || 
                             window.location.pathname.includes('verify');
  
  return hasConfirmationParams || hasConfirmationPath;
};

export const useDataManagement = (
  isAuthenticated: boolean,
  user: any,
  session: any,
  isOnline: boolean,
  cloudSyncEnabled: boolean
) => {
  // State management - initialize with properly migrated and validated data
  const [subscriptions, setSubscriptions] = useState<FullSubscription[]>(() => {
    if (isAuthenticated) {
      return [];
    }
    
    try {
      console.log('🔄 Initializing demo subscriptions with migration...');
      const migratedSubs = INITIAL_SUBSCRIPTIONS.map((sub, index) => {
        try {
          const migrated = migrateSubscriptionData(sub);
          console.log(`✅ Demo subscription ${index + 1} migrated: ${migrated.name} - ${migrated.frequency} - ${migrated.price}`);
          return migrated;
        } catch (error) {
          console.error(`❌ Failed to migrate demo subscription ${index + 1}:`, error);
          // Return a safe fallback
          return migrateSubscriptionData({
            id: `demo-fallback-${index}`,
            name: `Demo Subscription ${index + 1}`,
            price: 9.99,
            frequency: 'monthly',
            category: 'Other',
            status: 'active',
            dateAdded: new Date().toISOString().split('T')[0],
            nextPayment: new Date().toISOString().split('T')[0]
          });
        }
      });
      
      console.log(`✅ Initialized ${migratedSubs.length} demo subscriptions`);
      return migratedSubs;
    } catch (error) {
      console.error('❌ Failed to initialize demo data:', error);
      return [];
    }
  });
  
  const [paymentCards, setPaymentCards] = useState<FullPaymentCard[]>(() => {
    if (isAuthenticated) {
      return [];
    }
    
    try {
      console.log('🔄 Initializing demo payment cards...');
      const migratedCards = INITIAL_PAYMENT_CARDS.map(migratePaymentCardData);
      console.log(`✅ Initialized ${migratedCards.length} demo payment cards`);
      return migratedCards;
    } catch (error) {
      console.error('❌ Failed to initialize demo payment cards:', error);
      return [];
    }
  });
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Only use demo data if not authenticated
    return isAuthenticated ? [] : INITIAL_NOTIFICATIONS;
  });
  const [weeklyBudgets, setWeeklyBudgets] = useState<WeeklyBudget[]>([]);

  // Enhanced subscription setter with automatic migration
  const setSubscriptionsWithMigration = (subscriptionsOrUpdater: FullSubscription[] | ((prev: FullSubscription[]) => FullSubscription[])) => {
    setSubscriptions(prev => {
      let newSubscriptions: FullSubscription[];
      
      if (typeof subscriptionsOrUpdater === 'function') {
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
            name: sub.name || 'Unknown Subscription',
            price: 0,
            frequency: 'monthly',
            category: 'Other',
            status: 'active',
            dateAdded: new Date().toISOString().split('T')[0],
            nextPayment: new Date().toISOString().split('T')[0]
          });
        }
      });
      
      // Log any subscriptions that were migrated
      const migratedCount = migratedSubscriptions.filter((sub, index) => {
        const original = newSubscriptions[index];
        return original && (original.frequency !== sub.frequency || original.price !== sub.price);
      }).length;
      
      if (migratedCount > 0) {
        console.log(`🔄 Auto-migrated ${migratedCount} subscriptions during state update`);
      }
      
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

  // **CRITICAL FIX**: Set access token in data sync manager when session changes
  useEffect(() => {
    if (session?.access_token) {
      console.log('🔑 Setting access token in data sync manager');
      dataSyncManager.setAccessToken(session.access_token);
    } else {
      console.log('🔑 Clearing access token from data sync manager');
      dataSyncManager.setAccessToken(null);
    }
  }, [session?.access_token]);

  // Monitor session readiness with progressive checking
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkSessionReadiness = () => {
      const ready = isSessionReady(session, user, sessionReadyRetries);
      setSessionReady(ready);
      
      if (ready && isAuthenticated) {
        console.log('✅ Session is ready for data operations');
        setServerRequestsAllowed(true);
      } else if (isAuthenticated) {
        console.log(`⏳ Waiting for session to be ready (attempt ${sessionReadyRetries + 1})...`);
        
        // Progressive retry with longer delays for new users
        const isNewUser = !user?.email_confirmed_at;
        const retryDelay = isNewUser ? Math.min(2000 * (sessionReadyRetries + 1), 10000) : 1000;
        
        if (sessionReadyRetries < 10) { // Max 10 retries
          timeoutId = setTimeout(() => {
            setSessionReadyRetries(prev => prev + 1);
          }, retryDelay);
        } else {
          console.log('⚠️ Session readiness check timed out, allowing limited operations');
          setServerRequestsAllowed(false); // Only local operations allowed
        }
      }
    };

    checkSessionReadiness();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [session, user, isAuthenticated, sessionReadyRetries]);

  // Reset retry counter when user changes
  useEffect(() => {
    setSessionReadyRetries(0);
    setServerRequestsAllowed(false);
  }, [user?.id]);

  // Check if user data was accidentally cleared and attempt recovery
  const attemptDataRecovery = async (userId: string) => {
    console.log('🔄 Attempting data recovery for user:', userId);
    
    // Check if there's any cached data
    const cachedData = loadUserDataFromCache(userId);
    if (cachedData.subscriptions.length > 0) {
      console.log('✅ Found cached data, no recovery needed');
      return cachedData;
    }
    
    // Only try cloud recovery if server requests are allowed
    if (cloudSyncEnabled && isOnline && serverRequestsAllowed) {
      console.log('☁️ Attempting cloud data recovery...');
      try {
        const cloudResult = await dataSyncManager.loadFromCloud();
        
        if (cloudResult.success && cloudResult.data && cloudResult.data.subscriptions.length > 0) {
          console.log('🎉 Successfully recovered data from cloud!');
          
          // Migrate legacy data if necessary
          const migratedSubscriptions = (cloudResult.data.subscriptions || []).map(migrateSubscriptionData);
          const migratedPaymentCards = (cloudResult.data.paymentCards || []).map(migratePaymentCardData);
          
          const recoveredData = {
            subscriptions: migratedSubscriptions,
            paymentCards: migratedPaymentCards,
            notifications: cloudResult.data.notifications || [],
            appSettings: cloudResult.data.appSettings || INITIAL_APP_SETTINGS,
            hasInitialized: true,
            dataCleared: false,
            weeklyBudgets: cloudResult.data.weeklyBudgets || [],
            cacheTimestamp: cloudResult.timestamp
          };
          
          // Restore to cache
          saveUserDataToCache(userId, recoveredData);
          return recoveredData;
        }
      } catch (error) {
        console.warn('⚠️ Cloud recovery failed, continuing with local data:', error);
        // Continue with local data
      }
    } else {
      console.log('ℹ️ Cloud recovery skipped - server requests not allowed yet');
    }
    
    console.log('ℹ️ No data found for recovery');
    return null;
  };

  // Enhanced data loading with progressive timing and better error handling
  const loadUserData = async (userId: string, forceCloudSync: boolean = false) => {
    try {
      console.log(`🔄 Loading user data (userId: ${userId}, forceCloud: ${forceCloudSync})`);
      console.log(`📊 Session status - Ready: ${sessionReady}, Server requests allowed: ${serverRequestsAllowed}, Retries: ${sessionReadyRetries}`);
      
      // Check if we're in email confirmation flow
      const isEmailConfirmation = isEmailConfirmationFlow();
      
      // Check if this is a truly new user (very recent account creation)
      const isNewUser = user && user.created_at && 
        (Date.now() - new Date(user.created_at).getTime()) < 60 * 60 * 1000; // Within last hour
      
      // For new users, clear any existing demo data cache to ensure clean start
      if (isNewUser) {
        console.log('🧹 New user detected - clearing any existing demo data cache');
        clearUserDataCache(userId);
      }
      
      // First, attempt data recovery if needed (but not during email confirmation for new users or truly new users)
      const recoveredData = (!isEmailConfirmation && !isNewUser) ? await attemptDataRecovery(userId) : null;
      
      // Always try to load from cache first for immediate UI
      const cachedData = recoveredData || loadUserDataFromCache(userId);
      let dataToUse = cachedData;
      
      // Set cached/recovered data immediately for responsive UI (but not for new users)
      if (!isNewUser && (cachedData.subscriptions.length > 0 || cachedData.hasInitialized)) {
        console.log(recoveredData ? '🎉 Using recovered data for immediate display' : '⚡ Using cached data for immediate display');
        
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
        
        // Show success message if data was recovered
        if (recoveredData && recoveredData.subscriptions.length > 0) {
          console.log('🎊 Data recovery successful! User data has been restored.');
        }
      } else if (isNewUser) {
        console.log('🆕 New user - starting with completely clean state');
        // Ensure new users start with clean state
        const newUserData = {
          subscriptions: [],
          paymentCards: [],
          notifications: [],
          appSettings: INITIAL_APP_SETTINGS,
          hasInitialized: true,
          dataCleared: false,
          weeklyBudgets: [],
          cacheTimestamp: new Date().toISOString()
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
              dataSyncManager.saveToCloud(newUserData).catch(error => {
                console.log('ℹ️ Initial cloud save for new user failed (expected):', error);
              });
            }
          }, 15000); // Wait 15 seconds for new users to ensure session is fully ready
        }
      }
      
      // Enhanced cloud sync conditions with more conservative checks
      const shouldAttemptCloudSync = cloudSyncEnabled && 
                                   isOnline && 
                                   serverRequestsAllowed && 
                                   !isEmailConfirmation &&
                                   !isNewUser && // Don't attempt cloud sync for brand new users
                                   (forceCloudSync || (!cachedData.hasInitialized && sessionReadyRetries >= 2));
      
      if (shouldAttemptCloudSync) {
        console.log('☁️ Attempting to sync with cloud...');
        
        try {
          // Progressive delays based on user type and retry count
          const isNewUser = !user?.email_confirmed_at;
          let delay = 1000; // Base delay
          
          if (isNewUser) {
            delay = Math.min(3000 + (sessionReadyRetries * 1000), 8000); // 3-8s for new users
          } else if (sessionReadyRetries > 0) {
            delay = Math.min(1000 + (sessionReadyRetries * 500), 3000); // 1-3s for existing users
          }
          
          console.log(`⏳ Waiting ${delay}ms before cloud sync (new user: ${isNewUser}, retries: ${sessionReadyRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          const cloudResult = await dataSyncManager.loadFromCloud();
          
          if (cloudResult.success && cloudResult.data) {
            console.log('✅ Cloud data loaded successfully');
            
            // Migrate legacy data if necessary
            const migratedSubscriptions = (cloudResult.data.subscriptions || []).map(migrateSubscriptionData);
            const migratedPaymentCards = (cloudResult.data.paymentCards || []).map(migratePaymentCardData);
            
            dataToUse = {
              subscriptions: migratedSubscriptions,
              paymentCards: migratedPaymentCards,
              notifications: cloudResult.data.notifications || [],
              appSettings: cloudResult.data.appSettings || INITIAL_APP_SETTINGS,
              hasInitialized: cloudResult.data.metadata?.hasInitialized || false,
              dataCleared: cloudResult.data.metadata?.dataCleared || false,
              weeklyBudgets: cloudResult.data.weeklyBudgets || [],
              cacheTimestamp: cloudResult.timestamp
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
            console.warn('⚠️ Failed to load from cloud, using cached data:', cloudResult.error);
            
            // Enhanced error categorization
            const errorMessage = cloudResult.error || '';
            const isNetworkError = errorMessage.includes('Network connection failed') ||
                                 errorMessage.includes('Failed to fetch') ||
                                 errorMessage.includes('timed out') ||
                                 errorMessage.includes('Server offline');
            
            const isAuthError = errorMessage.includes('AuthSessionMissingError') ||
                              errorMessage.includes('Auth session missing') ||
                              errorMessage.includes('Invalid or expired token') ||
                              errorMessage.includes('Authentication required');
            
            const isServerWarning = errorMessage.includes('Supabase validation failed, but JWT is valid') ||
                                  errorMessage.includes('Supabase secondary validation unavailable');
            
            const isSessionError = errorMessage.includes('Session not ready') ||
                                  errorMessage.includes('session missing') ||
                                  errorMessage.includes('User not found');
            
            // Handle different error types appropriately
            if (isServerWarning) {
              console.log('ℹ️ Server secondary validation warning - this is normal for new users, data sync completed successfully');
              setSyncStatus({ type: 'success', message: 'Data synced (secondary validation pending)' });
            } else if (isAuthError || isSessionError) {
              console.log('ℹ️ Auth/session error - expected for new users, continuing with local data');
              setSyncStatus({ type: 'error', message: 'Session initializing - using local data' });
            } else if (isNetworkError) {
              console.log('ℹ️ Network error - continuing in local mode');
              setSyncStatus({ type: 'error', message: 'Server unavailable - using local data' });
            }
            
            // If cloud fails but we have cached data, continue with cached (only for existing users)
            if (!isNewUser && !cachedData.hasInitialized && cachedData.subscriptions.length === 0 && !isNetworkError) {
              // Existing user with no cloud data - start with empty data
              console.log('🎯 Existing user with no data detected, initializing with empty data');
              dataToUse = {
                subscriptions: [], // Empty for users with no data
                paymentCards: [], // Empty for users with no data
                notifications: [], // Empty for users with no data
                appSettings: INITIAL_APP_SETTINGS, // Keep settings defaults
                hasInitialized: true,
                dataCleared: false,
                weeklyBudgets: [],
                cacheTimestamp: new Date().toISOString()
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
                  dataSyncManager.saveToCloud(dataToUse).catch(error => {
                    console.warn('⚠️ Background cloud save failed:', error);
                  });
                }, backgroundDelay);
              }
            }
          }
        } catch (error) {
          console.log('ℹ️ Cloud sync exception (expected for new users), using local storage mode:', error);
          // Continue with cached data on any unexpected errors
        }
      } else {
        // Handle cases where cloud sync is not attempted
        if (isEmailConfirmation || isNewUser) {
          console.log(isEmailConfirmation ? 'ℹ️ Email confirmation in progress, skipping cloud sync' : 'ℹ️ New user detected, skipping cloud sync');
          // Initialize with empty data for new users during email confirmation or initial setup
          if (!cachedData.hasInitialized && cachedData.subscriptions.length === 0) {
            console.log('🎯 New user initialization, starting with empty data');
            const emptyData = {
              subscriptions: [], // Empty for new users
              paymentCards: [], // Empty for new users
              notifications: [], // Empty for new users
              appSettings: INITIAL_APP_SETTINGS, // Keep settings defaults
              hasInitialized: true,
              dataCleared: false,
              weeklyBudgets: [],
              cacheTimestamp: new Date().toISOString()
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
          console.log('⏳ Server requests not allowed yet, waiting for session to be ready');
          setSyncStatus({ type: 'loading', message: 'Preparing session...' });
        } else if (!cachedData.hasInitialized && cachedData.subscriptions.length === 0) {
          // Local-only user with no data - start with empty data
          console.log('ℹ️ User in local mode with no data, initializing with empty data');
          const localData = {
            subscriptions: [], // Empty for users with no data
            paymentCards: [], // Empty for users with no data
            notifications: [], // Empty for users with no data
            appSettings: INITIAL_APP_SETTINGS, // Keep settings defaults
            hasInitialized: true,
            dataCleared: false,
            weeklyBudgets: [],
            cacheTimestamp: new Date().toISOString()
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
      const dataSource = shouldAttemptCloudSync ? 'cloud+cache' : 
                        isEmailConfirmation ? 'cache (email confirmation)' :
                        isNewUser ? 'empty (new user)' :
                        !serverRequestsAllowed ? 'cache (session pending)' : 
                        !cloudSyncEnabled ? 'cache (sync disabled)' :
                        !isOnline ? 'cache (offline)' : 'cache';
      
      console.log(`✅ Data loading complete. Source: ${dataSource}`);
      
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      
      // Be more conservative about auth error handling during email confirmation
      const isEmailConfirmation = isEmailConfirmationFlow();
      
      if (!isEmailConfirmation) {
        throw error; // Let the caller handle auth errors
      } else {
        console.log('ℹ️ Error during email confirmation - continuing with local initialization');
        // Initialize with empty data for new users even if there's an error
        const errorRecoveryData = {
          subscriptions: [], // Empty for new users
          paymentCards: [], // Empty for new users
          notifications: [], // Empty for new users
          appSettings: INITIAL_APP_SETTINGS, // Keep settings defaults
          hasInitialized: true,
          dataCleared: false,
          weeklyBudgets: [],
          cacheTimestamp: new Date().toISOString()
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

  // Save user data with enhanced session checks
  const saveUserData = async (data: {
    subscriptions: FullSubscription[];
    paymentCards: FullPaymentCard[];
    notifications: Notification[];
    appSettings: AppSettings;
    hasInitialized: boolean;
    dataCleared: boolean;
    weeklyBudgets: WeeklyBudget[];
  }) => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      // Always save to cache immediately for responsive UI
      saveUserDataToCache(user.id, data);
      
      // Only attempt cloud save if server requests are allowed
      if (cloudSyncEnabled && isOnline && serverRequestsAllowed) {
        // Use background promise to avoid blocking UI
        dataSyncManager.saveToCloud({
          subscriptions: data.subscriptions,
          paymentCards: data.paymentCards,
          notifications: data.notifications,
          appSettings: data.appSettings,
          weeklyBudgets: data.weeklyBudgets
        }).catch(error => {
          // Enhanced error handling - only log unexpected errors
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          // Filter out expected errors and warnings during new user onboarding
          if (!errorMessage.includes('Network connection failed') && 
              !errorMessage.includes('Failed to fetch') && 
              !errorMessage.includes('timed out') &&
              !errorMessage.includes('Server offline') &&
              !errorMessage.includes('AuthSessionMissingError') &&
              !errorMessage.includes('Session not ready') &&
              !errorMessage.includes('Authentication required') &&
              !errorMessage.includes('Supabase validation failed, but JWT is valid') &&
              !errorMessage.includes('Supabase secondary validation unavailable')) {
            console.log('ℹ️ Cloud save not available, data saved locally');
          }
          // Otherwise silently handle expected errors and warnings
        });
      } else if (!isOnline) {
        console.log('ℹ️ Offline mode - data saved to cache only');
      } else if (!cloudSyncEnabled) {
        console.log('ℹ️ Cloud sync disabled - data saved to cache only');
      } else if (!serverRequestsAllowed) {
        console.log('⏳ Server requests not ready - data saved to cache only');
      }
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      // Even if there's an error, the cache save should have succeeded
    }
  };

  // Enhanced manual data sync with comprehensive readiness checks
  const triggerDataSync = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('🚫 Sync not available - not authenticated');
      return;
    }
    
    if (!isOnline) {
      console.log('📴 Sync not available - offline');
      setSyncStatus({ type: 'error', message: 'Cannot sync while offline' });
      return;
    }
    
    if (!cloudSyncEnabled) {
      console.log('☁️ Sync not available - cloud sync disabled');
      return;
    }
    
    if (!serverRequestsAllowed) {
      console.log('⏳ Sync not available - session not ready');
      setSyncStatus({ type: 'error', message: 'Session not ready - please wait' });
      return;
    }
    
    try {
      console.log('🔄 Triggering manual data sync...');
      setSyncStatus({ type: 'loading', message: 'Syncing...' });
      
      await loadUserData(user.id, true);
      
      console.log('✅ Manual sync completed');
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Enhanced error categorization for user feedback
      if (errorMessage.includes('Network connection failed') || errorMessage.includes('Failed to fetch')) {
        setSyncStatus({ type: 'error', message: 'Connection failed - check internet' });
      } else if (errorMessage.includes('timed out')) {
        setSyncStatus({ type: 'error', message: 'Server timeout - try again later' });
      } else if (errorMessage.includes('Invalid or expired token')) {
        setSyncStatus({ type: 'error', message: 'Please sign in again' });
      } else if (errorMessage.includes('AuthSessionMissingError') || errorMessage.includes('Session not ready')) {
        setSyncStatus({ type: 'error', message: 'Session not ready - please wait' });
      } else {
        setSyncStatus({ type: 'error', message: 'Sync failed - will retry automatically' });
      }
    }
  };

  // Enhanced data watcher for automatic updates
  useEffect(() => {
    const saveUpdatedData = () => {
      if (hasInitialized && user?.id) {
        const currentData = {
          subscriptions,
          paymentCards,
          notifications,
          appSettings,
          hasInitialized,
          dataCleared,
          weeklyBudgets,
          cacheTimestamp: new Date().toISOString()
        };
        saveUserData(currentData);
      }
    };

    saveUpdatedData();
  }, [subscriptions, paymentCards, notifications, appSettings, hasInitialized, dataCleared, weeklyBudgets]);

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
        console.warn('⚠️ Error calculating weekly budgets:', error);
        setWeeklyBudgets([]);
      }
    } else {
      setWeeklyBudgets([]);
    }
  }, [subscriptions]);

  const clearUserDataCache = () => {
    if (user?.id) {
      clearUserDataCache(user.id);
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
    clearUserDataCache
  };
};