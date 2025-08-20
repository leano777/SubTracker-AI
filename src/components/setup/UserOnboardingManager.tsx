/**
 * User Onboarding Manager Component
 * Handles the complete new user setup flow
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialStore } from '@/stores/useFinancialStore';
import userSetupService from '@/services/userSetupService';
import QuickStartWizard from '@/components/onboarding/QuickStartWizard';
import SubscriptionDiscovery from './SubscriptionDiscovery';
import type { FullSubscription } from '@/types/subscription';

interface UserOnboardingManagerProps {
  children: React.ReactNode;
}

export function UserOnboardingManager({ children }: UserOnboardingManagerProps) {
  const { user, isAuthenticated } = useAuth();
  const { setSubscriptions, setPaymentCards, subscriptions } = useFinancialStore();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user, isAuthenticated]);

  const checkOnboardingStatus = async () => {
    if (!user || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const needsSetup = await userSetupService.needsOnboarding(user.id);
      setNeedsOnboarding(needsSetup);
      
      // Show onboarding immediately if needed
      if (needsSetup) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Onboarding check failed:', error);
      // Default to showing onboarding if check fails
      setNeedsOnboarding(true);
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    setNeedsOnboarding(false);
    setOnboardingComplete(true);
    
    // Optionally show subscription discovery after onboarding
    if (subscriptions.length === 0) {
      setTimeout(() => {
        setShowDiscovery(true);
      }, 1000);
    }
  };

  const handleDiscoveredSubscriptions = (discoveredSubs: FullSubscription[]) => {
    if (discoveredSubs.length > 0) {
      // Add discovered subscriptions to the store
      setSubscriptions([...subscriptions, ...discoveredSubs]);
    }
    setShowDiscovery(false);
  };

  const handleSkipDiscovery = () => {
    setShowDiscovery(false);
  };

  // Show loading state while checking onboarding status
  if (isLoading && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Don't show onboarding if user is not authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Quick Start Wizard */}
      {showOnboarding && (
        <QuickStartWizard
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onClose={() => {
            setShowOnboarding(false);
            setNeedsOnboarding(false);
          }}
        />
      )}
      
      {/* Subscription Discovery */}
      {showDiscovery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Discover Your Subscriptions</h2>
              <button
                onClick={handleSkipDiscovery}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Skip for now
              </button>
            </div>
            <div className="p-6">
              <SubscriptionDiscovery
                onSubscriptionsFound={handleDiscoveredSubscriptions}
                onClose={handleSkipDiscovery}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserOnboardingManager;