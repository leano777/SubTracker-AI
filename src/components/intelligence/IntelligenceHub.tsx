/**
 * Intelligence Hub Component
 * Central hub for all AI-powered features and insights
 */

import React, { useState } from 'react';
import { Brain, TrendingUp, Bell, DollarSign, Zap, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SmartInsightsDashboard from './SmartInsightsDashboard';
import SmartNotifications from './SmartNotifications';
import PriceTracker from './PriceTracker';
import { useFinancialStore } from '@/stores/useFinancialStore';

interface IntelligenceHubProps {
  className?: string;
}

export function IntelligenceHub({ className }: IntelligenceHubProps) {
  const { subscriptions } = useFinancialStore();
  const [activeTab, setActiveTab] = useState('overview');

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const monthlySpend = activeSubscriptions.reduce((sum, sub) => sum + (sub.cost || sub.price), 0);

  // Mock data for demonstration - in production this would come from the intelligence service
  const intelligenceStats = {
    recommendations: 4,
    potentialSavings: 127,
    priceChanges: 2,
    duplicatesFound: 1,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Intelligence Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered insights and recommendations for your subscriptions
          </p>
        </div>
        <SmartNotifications />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
                <p className="text-xs text-muted-foreground">${monthlySpend.toFixed(2)}/month</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Smart Recommendations</p>
                <p className="text-2xl font-bold">{intelligenceStats.recommendations}</p>
                <p className="text-xs text-muted-foreground">Active suggestions</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">${intelligenceStats.potentialSavings}</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Price Monitoring</p>
                <p className="text-2xl font-bold text-orange-600">{intelligenceStats.priceChanges}</p>
                <p className="text-xs text-muted-foreground">Recent changes</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Intelligence Features */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Brain className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Zap className="h-4 w-4 mr-2" />
            Smart Insights
          </TabsTrigger>
          <TabsTrigger value="price-tracking">
            <TrendingUp className="h-4 w-4 mr-2" />
            Price Tracking
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Intelligence Overview */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Insights Summary
                </CardTitle>
                <CardDescription>
                  Current status of AI-powered recommendations and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duplicate Services</span>
                  <Badge variant={intelligenceStats.duplicatesFound > 0 ? 'destructive' : 'secondary'}>
                    {intelligenceStats.duplicatesFound} found
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cost Optimizations</span>
                  <Badge variant="default">3 opportunities</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price Alerts</span>
                  <Badge variant={intelligenceStats.priceChanges > 0 ? 'default' : 'secondary'}>
                    {intelligenceStats.priceChanges} active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usage Reviews</span>
                  <Badge variant="outline">2 recommended</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Savings Opportunities
                </CardTitle>
                <CardDescription>
                  Potential monthly savings identified by AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Annual billing discounts</span>
                    <span className="text-sm font-medium text-green-600">$45/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Duplicate service removal</span>
                    <span className="text-sm font-medium text-green-600">$32/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plan downgrades</span>
                    <span className="text-sm font-medium text-green-600">$28/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Unused subscriptions</span>
                    <span className="text-sm font-medium text-green-600">$22/mo</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Potential Savings</span>
                    <span className="font-bold text-green-600">$127/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    $1,524 annually
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Intelligence Activity</CardTitle>
              <CardDescription>
                Latest AI-generated insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-1 rounded-full bg-blue-100">
                    <Brain className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New recommendation available</p>
                    <p className="text-xs text-muted-foreground">
                      Switch to annual billing for Adobe Creative Cloud to save $60/year
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                  <Badge variant="secondary">High Priority</Badge>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-1 rounded-full bg-orange-100">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Price increase detected</p>
                    <p className="text-xs text-muted-foreground">
                      Netflix monthly plan increased from $15.49 to $17.99
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                  </div>
                  <Badge variant="destructive">Price Alert</Badge>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-1 rounded-full bg-yellow-100">
                    <Zap className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Duplicate services found</p>
                    <p className="text-xs text-muted-foreground">
                      You have 2 cloud storage subscriptions - consider consolidating
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                  </div>
                  <Badge variant="outline">Optimization</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <SmartInsightsDashboard />
        </TabsContent>

        <TabsContent value="price-tracking">
          <PriceTracker />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure your intelligent notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Smart Notifications</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced notification settings are integrated into the main notification system.
                </p>
                <p className="text-sm text-muted-foreground">
                  Use the notification bell in the top navigation to access smart alerts and configure your preferences.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IntelligenceHub;