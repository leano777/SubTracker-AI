/**
 * Smart Insights Dashboard Component
 * Displays AI-powered recommendations and subscription intelligence
 */

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Copy, 
  DollarSign, 
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancialStore } from '@/stores/useFinancialStore';
import intelligenceService, { 
  type SmartRecommendation, 
  type DuplicateDetection, 
  type BudgetAlert 
} from '@/services/intelligenceService';

interface SmartInsightsDashboardProps {
  className?: string;
}

export function SmartInsightsDashboard({ className }: SmartInsightsDashboardProps) {
  const { subscriptions, paymentCards } = useFinancialStore();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateInsights();
  }, [subscriptions, paymentCards]);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      // Generate recommendations
      const recs = intelligenceService.generateRecommendations(subscriptions, paymentCards);
      setRecommendations(recs);

      // Generate budget alerts
      const totalMonthlyBudget = 500; // This would come from user settings
      const alerts = intelligenceService.generateBudgetAlerts(subscriptions, totalMonthlyBudget);
      setBudgetAlerts(alerts);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissRecommendation = (recommendationId: string) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
  };

  const getRecommendationIcon = (type: SmartRecommendation['type']) => {
    switch (type) {
      case 'duplicate':
        return <Copy className="h-4 w-4" />;
      case 'cost_optimization':
        return <DollarSign className="h-4 w-4" />;
      case 'usage_concern':
        return <Eye className="h-4 w-4" />;
      case 'price_increase':
        return <TrendingUp className="h-4 w-4" />;
      case 'better_plan':
        return <Target className="h-4 w-4" />;
      case 'seasonal_cancel':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: SmartRecommendation['priority']) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getAlertSeverityColor = (severity: BudgetAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const activeRecommendations = recommendations.filter(rec => !dismissedRecommendations.has(rec.id));
  const criticalRecommendations = activeRecommendations.filter(rec => rec.priority === 'critical');
  const highPriorityRecommendations = activeRecommendations.filter(rec => rec.priority === 'high');
  const totalPotentialSavings = activeRecommendations.reduce((sum, rec) => sum + (rec.potentialSavings || 0), 0);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Brain className="h-12 w-12 animate-pulse text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Analyzing your subscriptions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Smart Recommendations</p>
                <p className="text-2xl font-bold">{activeRecommendations.length}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">${totalPotentialSavings.toFixed(0)}</p>
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
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{highPriorityRecommendations.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{budgetAlerts.length}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalRecommendations.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-red-800">Critical Recommendations</AlertTitle>
          <AlertDescription className="text-red-700">
            You have {criticalRecommendations.length} critical recommendations that require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Budget Alerts
          </h3>
          {budgetAlerts.map((alert) => (
            <Alert key={alert.id} className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-orange-800">{alert.title}</AlertTitle>
              <AlertDescription className="text-orange-700">
                {alert.message}
                {alert.suggestedActions.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Suggested Actions:</p>
                    <ul className="list-disc list-inside text-sm">
                      {alert.suggestedActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">
            Recommendations ({activeRecommendations.length})
          </TabsTrigger>
          <TabsTrigger value="duplicates">
            Duplicates
          </TabsTrigger>
          <TabsTrigger value="insights">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {activeRecommendations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">All Good!</h3>
                <p className="text-muted-foreground text-center">
                  No recommendations at the moment. Your subscriptions are optimized.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeRecommendations.map((recommendation) => (
                <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {getRecommendationIcon(recommendation.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant={getPriorityColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Badge>
                            {recommendation.potentialSavings && (
                              <Badge variant="outline" className="text-green-600">
                                Save ${recommendation.potentialSavings.toFixed(0)}/mo
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {Math.round(recommendation.confidence * 100)}% confidence
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissRecommendation(recommendation.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {recommendation.description}
                    </p>
                    
                    {recommendation.metadata.reasonDetails && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Details:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {recommendation.metadata.reasonDetails.map((detail, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {recommendation.actionText}
                      </Button>
                      <Button variant="ghost" size="sm">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Detection</CardTitle>
              <CardDescription>
                We scan for similar services to help you save money and reduce redundancy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.filter(rec => rec.type === 'duplicate').length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Duplicates Found</h3>
                  <p className="text-muted-foreground">
                    Great! We didn't find any duplicate or overlapping services.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations
                    .filter(rec => rec.type === 'duplicate' && !dismissedRecommendations.has(rec.id))
                    .map((duplicate) => (
                      <Alert key={duplicate.id} className="border-yellow-200 bg-yellow-50">
                        <Copy className="h-4 w-4" />
                        <AlertTitle className="text-yellow-800">{duplicate.title}</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                          <p>{duplicate.description}</p>
                          {duplicate.metadata.relatedSubscriptions && (
                            <div className="mt-2">
                              <p className="font-medium">Affected Subscriptions:</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {duplicate.metadata.relatedSubscriptions.map((subId) => {
                                  const sub = subscriptions.find(s => s.id === subId);
                                  return sub ? (
                                    <Badge key={subId} variant="outline">{sub.name}</Badge>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Subscriptions</span>
                    <span className="font-medium">{subscriptions.filter(s => s.status === 'active').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Spending</span>
                    <span className="font-medium">
                      ${subscriptions
                        .filter(s => s.status === 'active')
                        .reduce((sum, s) => sum + (s.cost || s.price), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average per Service</span>
                    <span className="font-medium">
                      ${(subscriptions
                        .filter(s => s.status === 'active')
                        .reduce((sum, s) => sum + (s.cost || s.price), 0) / 
                        Math.max(subscriptions.filter(s => s.status === 'active').length, 1))
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round(Math.max(0, 100 - (activeRecommendations.length * 10)))}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your subscription management is{' '}
                    {activeRecommendations.length === 0 ? 'excellent' : 
                     activeRecommendations.length < 3 ? 'good' : 'needs improvement'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SmartInsightsDashboard;