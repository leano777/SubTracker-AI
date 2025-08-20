/**
 * Price Tracker Component
 * Monitor subscription price changes and track historical pricing data
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  LineChart,
  Bell,
  History,
  Target
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useFinancialStore } from '@/stores/useFinancialStore';
import intelligenceService, { type PriceTracking } from '@/services/intelligenceService';

interface PriceAlert {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  alertType: 'increase' | 'decrease' | 'target_reached';
  threshold: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

interface PriceTrackerProps {
  className?: string;
}

export function PriceTracker({ className }: PriceTrackerProps) {
  const { subscriptions } = useFinancialStore();
  const [priceData, setPriceData] = useState<PriceTracking[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializePriceTracking();
  }, [subscriptions]);

  const initializePriceTracking = async () => {
    setIsLoading(true);
    try {
      // Get existing price tracking data from localStorage
      const existingData = localStorage.getItem('price-tracking-data');
      const historicalData: PriceTracking[] = existingData ? JSON.parse(existingData) : [];
      
      // Update with current subscription data
      const updatedData = intelligenceService.trackPriceChanges(subscriptions, historicalData);
      
      setPriceData(updatedData);
      
      // Save updated data
      localStorage.setItem('price-tracking-data', JSON.stringify(updatedData));
      
      // Generate alerts for significant changes
      generatePriceAlerts(updatedData);
    } catch (error) {
      console.error('Error initializing price tracking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePriceAlerts = (trackingData: PriceTracking[]) => {
    const newAlerts: PriceAlert[] = [];
    
    trackingData.forEach(data => {
      const recentChanges = data.priceChanges.filter(change => 
        differenceInDays(new Date(), new Date(change.date)) <= 30 && !change.notified
      );
      
      recentChanges.forEach(change => {
        if (Math.abs(change.changePercent) >= 10) { // Alert for 10% or more change
          newAlerts.push({
            id: `alert-${data.subscriptionId}-${change.date}`,
            subscriptionId: data.subscriptionId,
            subscriptionName: data.subscriptionName,
            alertType: change.changeType,
            threshold: 10,
            currentPrice: change.newPrice,
            isActive: true,
            createdAt: change.date,
          });
        }
      });
    });
    
    setAlerts(newAlerts);
  };

  const getSubscriptionPriceData = (subscriptionId: string) => {
    const tracking = priceData.find(p => p.subscriptionId === subscriptionId);
    if (!tracking) return null;
    
    return tracking.historicalPrices.map(price => ({
      date: format(new Date(price.date), 'MMM dd'),
      price: price.price,
      fullDate: price.date,
    }));
  };

  const calculatePriceChangePercent = (tracking: PriceTracking) => {
    if (tracking.historicalPrices.length < 2) return 0;
    
    const oldest = tracking.historicalPrices[0];
    const newest = tracking.historicalPrices[tracking.historicalPrices.length - 1];
    
    return ((newest.price - oldest.price) / oldest.price) * 100;
  };

  const getRecentPriceChanges = () => {
    const recentChanges: Array<PriceTracking & { changePercent: number }> = [];
    
    priceData.forEach(tracking => {
      const changePercent = calculatePriceChangePercent(tracking);
      if (Math.abs(changePercent) >= 5) { // Show changes of 5% or more
        recentChanges.push({ ...tracking, changePercent });
      }
    });
    
    return recentChanges.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const selectedSubscriptionData = selectedSubscription ? getSubscriptionPriceData(selectedSubscription) : null;
  const selectedSubscriptionInfo = selectedSubscription ? 
    subscriptions.find(s => s.id === selectedSubscription) : null;
  const selectedTracking = selectedSubscription ? 
    priceData.find(p => p.subscriptionId === selectedSubscription) : null;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <LineChart className="h-12 w-12 animate-pulse text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Loading price data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Price Alerts */}
      {alerts.filter(a => a.isActive).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Price Alerts ({alerts.filter(a => a.isActive).length})
          </h3>
          {alerts.filter(a => a.isActive).slice(0, 3).map((alert) => (
            <Alert key={alert.id} className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-orange-800">
                Price {alert.alertType === 'increase' ? 'Increase' : 'Decrease'} Alert
              </AlertTitle>
              <AlertDescription className="text-orange-700">
                {alert.subscriptionName} price {alert.alertType === 'increase' ? 'increased' : 'decreased'} to ${alert.currentPrice}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tracked Services</p>
                <p className="text-2xl font-bold">{priceData.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Price Changes</p>
                <p className="text-2xl font-bold">{priceData.reduce((sum, p) => sum + p.priceChanges.length, 0)}</p>
                <p className="text-xs text-muted-foreground">Total recorded</p>
              </div>
              <History className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Increases</p>
                <p className="text-2xl font-bold text-red-600">
                  {getRecentPriceChanges().filter(p => p.changePercent > 0).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">
                  {alerts.filter(a => a.isActive).length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Price Details</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Price Changes</CardTitle>
              <CardDescription>
                Subscriptions with significant price changes in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getRecentPriceChanges().length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Recent Changes</h3>
                  <p className="text-muted-foreground">
                    Your subscription prices have been stable recently.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getRecentPriceChanges().slice(0, 5).map((tracking) => {
                    const subscription = subscriptions.find(s => s.id === tracking.subscriptionId);
                    const isIncrease = tracking.changePercent > 0;
                    
                    return (
                      <div key={tracking.subscriptionId} 
                           className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            isIncrease ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            {isIncrease ? 
                              <TrendingUp className="h-4 w-4 text-red-600" /> :
                              <TrendingDown className="h-4 w-4 text-green-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium">{tracking.subscriptionName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(tracking.currentPrice)}/month
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={isIncrease ? 'destructive' : 'secondary'}>
                            {isIncrease ? '+' : ''}{tracking.changePercent.toFixed(1)}%
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            Since {format(new Date(tracking.historicalPrices[0]?.date || ''), 'MMM yyyy')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Select Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {priceData.map((tracking) => (
                    <Button
                      key={tracking.subscriptionId}
                      variant={selectedSubscription === tracking.subscriptionId ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedSubscription(tracking.subscriptionId)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{tracking.subscriptionName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {formatCurrency(tracking.currentPrice)}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedSubscriptionInfo ? selectedSubscriptionInfo.name : 'Price History'}
                </CardTitle>
                <CardDescription>
                  Historical price data and changes over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSubscriptionData ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsLineChart data={selectedSubscriptionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Price']} />
                        <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                    
                    {selectedTracking && selectedTracking.priceChanges.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Price Change History</h4>
                        <div className="space-y-2">
                          {selectedTracking.priceChanges.slice(0, 5).map((change, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{format(new Date(change.date), 'MMM dd, yyyy')}</span>
                              <span className={change.changeType === 'increase' ? 'text-red-600' : 'text-green-600'}>
                                {formatCurrency(change.oldPrice)} → {formatCurrency(change.newPrice)} 
                                ({change.changeType === 'increase' ? '+' : ''}{change.changePercent.toFixed(1)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a subscription to view its price history
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Trend Analysis</CardTitle>
              <CardDescription>
                Overall trends and insights across all your subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Most Volatile Services</h4>
                  {getRecentPriceChanges().slice(0, 3).map((tracking) => (
                    <div key={tracking.subscriptionId} className="flex items-center justify-between">
                      <span className="text-sm">{tracking.subscriptionName}</span>
                      <Badge variant="outline">
                        {Math.abs(tracking.changePercent).toFixed(1)}% change
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Price Stability</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Stable Prices</span>
                      <span className="font-medium">
                        {priceData.filter(p => calculatePriceChangePercent(p) === 0).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price Increases</span>
                      <span className="font-medium text-red-600">
                        {priceData.filter(p => calculatePriceChangePercent(p) > 0).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price Decreases</span>
                      <span className="font-medium text-green-600">
                        {priceData.filter(p => calculatePriceChangePercent(p) < 0).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PriceTracker;