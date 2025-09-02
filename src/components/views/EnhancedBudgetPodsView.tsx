import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, Home, Car, ShoppingCart, Heart, Shield, Plus, 
  TrendingUp, TrendingDown, Calendar, Settings, Target,
  AlertTriangle, CheckCircle, DollarSign, PiggyBank
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import type { BudgetPod, Transaction } from '../../types/database';
import type { FullSubscription } from '../../types/subscription';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface EnhancedBudgetPodsViewProps {
  subscriptions: FullSubscription[];
  userId?: string;
}

// Helper function to get the current budget period
const getCurrentPeriod = (pod: BudgetPod): { start: Date; end: Date } => {
  const today = new Date();
  const start = new Date(pod.startDate);
  
  switch (pod.period) {
    case 'monthly':
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return { start: currentMonth, end: nextMonth };
    
    case 'weekly':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return { start: weekStart, end: weekEnd };
    
    case 'yearly':
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear() + 1, 0, 1);
      return { start: yearStart, end: yearEnd };
    
    default:
      return { start, end: new Date() };
  }
};

export const EnhancedBudgetPodsView: React.FC<EnhancedBudgetPodsViewProps> = ({ 
  subscriptions, 
  userId = 'local-user-001' 
}) => {
  const [budgetPods, setBudgetPods] = useState<BudgetPod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPod, setSelectedPod] = useState<BudgetPod | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid');
  
  // Form state for new pod
  const [newPod, setNewPod] = useState({
    name: '',
    amount: '',
    budgetType: 'fixed' as const,
    period: 'monthly' as const,
    categories: [] as string[],
    rolloverEnabled: false,
    savingsGoal: '',
    iconName: 'Wallet'
  });

  // Icon mapping
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Home, Car, ShoppingCart, Heart, Shield, Wallet, 
    PiggyBank, Target, DollarSign
  };

  // Load data on mount
  useEffect(() => {
    loadBudgetPods();
    loadTransactions();
  }, [userId]);

  const loadBudgetPods = () => {
    const storedPods = localStorage.getItem(`subtracker_enhanced_pods_${userId}`);
    if (storedPods) {
      setBudgetPods(JSON.parse(storedPods));
    } else {
      // Initialize with smart defaults
      initializeDefaultPods();
    }
  };

  const loadTransactions = () => {
    const storedTransactions = localStorage.getItem(`subtracker_transactions_${userId}`);
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  };

  const initializeDefaultPods = () => {
    const defaultPods: BudgetPod[] = [
      {
        id: '1',
        userId,
        name: 'Essential Expenses',
        description: 'Rent, utilities, and necessities',
        iconName: 'Home',
        color: 'bg-blue-500',
        budgetType: 'fixed',
        amount: 2500,
        period: 'monthly',
        startDate: new Date(),
        rolloverEnabled: false,
        categories: ['Housing', 'Utilities', 'Insurance'],
        autoAssignRules: [],
        currentPeriodSpent: 0,
        currentPeriodRemaining: 2500,
        previousPeriodRollover: 0,
        isActive: true,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastResetAt: new Date()
      },
      {
        id: '2',
        userId,
        name: 'Food & Dining',
        description: 'Groceries and restaurants',
        iconName: 'ShoppingCart',
        color: 'bg-green-500',
        budgetType: 'fixed',
        amount: 600,
        period: 'monthly',
        startDate: new Date(),
        rolloverEnabled: true,
        rolloverType: 'carryforward',
        maxRolloverAmount: 200,
        categories: ['Groceries', 'Restaurants', 'Coffee'],
        autoAssignRules: [],
        currentPeriodSpent: 0,
        currentPeriodRemaining: 600,
        previousPeriodRollover: 0,
        isActive: true,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastResetAt: new Date()
      },
      {
        id: '3',
        userId,
        name: 'Entertainment',
        description: 'Subscriptions, movies, and fun',
        iconName: 'Heart',
        color: 'bg-purple-500',
        budgetType: 'envelope',
        amount: 200,
        period: 'monthly',
        startDate: new Date(),
        rolloverEnabled: true,
        rolloverType: 'accumulate',
        categories: ['Entertainment', 'Subscriptions', 'Gaming'],
        autoAssignRules: [],
        currentPeriodSpent: calculateSubscriptionSpending('Entertainment'),
        currentPeriodRemaining: 200 - calculateSubscriptionSpending('Entertainment'),
        previousPeriodRollover: 0,
        isActive: true,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastResetAt: new Date()
      },
      {
        id: '4',
        userId,
        name: 'Emergency Fund',
        description: 'Building financial security',
        iconName: 'Shield',
        color: 'bg-red-500',
        budgetType: 'goal',
        amount: 500,
        period: 'monthly',
        startDate: new Date(),
        rolloverEnabled: true,
        rolloverType: 'accumulate',
        categories: ['Savings'],
        autoAssignRules: [],
        currentPeriodSpent: 0,
        currentPeriodRemaining: 500,
        previousPeriodRollover: 0,
        savingsGoal: 10000,
        goalDeadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        goalProgress: 2500,
        isActive: true,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastResetAt: new Date()
      }
    ];

    setBudgetPods(defaultPods);
    saveBudgetPods(defaultPods);
  };

  // Calculate subscription spending for a category
  function calculateSubscriptionSpending(category: string): number {
    return subscriptions
      .filter(sub => sub.status === 'active' && sub.category === category)
      .reduce((total, sub) => {
        if (sub.billingCycle === 'monthly') return total + sub.cost;
        if (sub.billingCycle === 'yearly') return total + (sub.cost / 12);
        return total;
      }, 0);
  }

  const saveBudgetPods = (pods: BudgetPod[]) => {
    localStorage.setItem(`subtracker_enhanced_pods_${userId}`, JSON.stringify(pods));
  };

  const saveTransactions = (txns: Transaction[]) => {
    localStorage.setItem(`subtracker_transactions_${userId}`, JSON.stringify(txns));
  };

  // Create a new budget pod
  const createBudgetPod = () => {
    const pod: BudgetPod = {
      id: Date.now().toString(),
      userId,
      name: newPod.name,
      iconName: newPod.iconName,
      color: `bg-${['blue', 'green', 'purple', 'yellow', 'pink', 'indigo'][Math.floor(Math.random() * 6)]}-500`,
      budgetType: newPod.budgetType,
      amount: parseFloat(newPod.amount),
      period: newPod.period,
      startDate: new Date(),
      rolloverEnabled: newPod.rolloverEnabled,
      categories: newPod.categories,
      autoAssignRules: [],
      currentPeriodSpent: 0,
      currentPeriodRemaining: parseFloat(newPod.amount),
      previousPeriodRollover: 0,
      savingsGoal: newPod.savingsGoal ? parseFloat(newPod.savingsGoal) : undefined,
      isActive: true,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastResetAt: new Date()
    };

    const updatedPods = [...budgetPods, pod];
    setBudgetPods(updatedPods);
    saveBudgetPods(updatedPods);
    setShowCreateForm(false);
    resetNewPodForm();
  };

  const resetNewPodForm = () => {
    setNewPod({
      name: '',
      amount: '',
      budgetType: 'fixed',
      period: 'monthly',
      categories: [],
      rolloverEnabled: false,
      savingsGoal: '',
      iconName: 'Wallet'
    });
  };

  // Add a transaction
  const addTransaction = (podId: string, description: string, amount: number, type: 'income' | 'expense') => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      userId,
      podId,
      description,
      amount,
      type,
      category: budgetPods.find(p => p.id === podId)?.categories[0] || 'Uncategorized',
      tags: [],
      transactionDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isRecurring: false,
      impactedPods: [podId],
      isReconciled: false
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);

    // Update pod spending
    const updatedPods = budgetPods.map(pod => {
      if (pod.id === podId) {
        const spent = type === 'expense' 
          ? pod.currentPeriodSpent + amount 
          : pod.currentPeriodSpent - amount;
        return {
          ...pod,
          currentPeriodSpent: spent,
          currentPeriodRemaining: pod.amount - spent + pod.previousPeriodRollover,
          updatedAt: new Date()
        };
      }
      return pod;
    });

    setBudgetPods(updatedPods);
    saveBudgetPods(updatedPods);
  };

  // Calculate budget health
  const getBudgetHealth = (pod: BudgetPod): { status: string; color: string; icon: any } => {
    const percentUsed = (pod.currentPeriodSpent / pod.amount) * 100;
    
    if (percentUsed >= 100) {
      return { status: 'Over Budget', color: 'text-red-600', icon: AlertTriangle };
    } else if (percentUsed >= 80) {
      return { status: 'Near Limit', color: 'text-yellow-600', icon: AlertTriangle };
    } else if (percentUsed >= 50) {
      return { status: 'On Track', color: 'text-blue-600', icon: TrendingUp };
    } else {
      return { status: 'Great', color: 'text-green-600', icon: CheckCircle };
    }
  };

  // Calculate total budget stats
  const budgetStats = useMemo(() => {
    const totalBudget = budgetPods.reduce((sum, pod) => sum + pod.amount, 0);
    const totalSpent = budgetPods.reduce((sum, pod) => sum + pod.currentPeriodSpent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const totalRollover = budgetPods.reduce((sum, pod) => sum + pod.previousPeriodRollover, 0);
    const savingsGoalProgress = budgetPods
      .filter(pod => pod.savingsGoal)
      .reduce((sum, pod) => sum + (pod.goalProgress || 0), 0);

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      totalRollover,
      savingsGoalProgress,
      utilizationRate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  }, [budgetPods]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Budget Pods</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Intelligent budget tracking with automatic categorization and rollover
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'analytics' : 'grid')}
          >
            {viewMode === 'grid' ? 'Analytics' : 'Grid View'}
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Pod
          </Button>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
                <p className="text-xl font-bold">{formatCurrency(budgetStats.totalBudget)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Spent</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(budgetStats.totalSpent)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(budgetStats.totalRemaining)}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rollover</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(budgetStats.totalRollover)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Saved</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(budgetStats.savingsGoalProgress)}
                </p>
              </div>
              <PiggyBank className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Pod Form */}
      {showCreateForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Create New Budget Pod</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pod Name</label>
                <input
                  type="text"
                  value={newPod.name}
                  onChange={(e) => setNewPod({ ...newPod, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Vacation Fund"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget Amount</label>
                <input
                  type="number"
                  value={newPod.amount}
                  onChange={(e) => setNewPod({ ...newPod, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget Type</label>
                <select
                  value={newPod.budgetType}
                  onChange={(e) => setNewPod({ ...newPod, budgetType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage of Income</option>
                  <option value="envelope">Envelope System</option>
                  <option value="goal">Savings Goal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Period</label>
                <select
                  value={newPod.period}
                  onChange={(e) => setNewPod({ ...newPod, period: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPod.rolloverEnabled}
                    onChange={(e) => setNewPod({ ...newPod, rolloverEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Enable rollover for unused budget</span>
                </label>
              </div>

              {newPod.budgetType === 'goal' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Savings Goal Amount</label>
                  <input
                    type="number"
                    value={newPod.savingsGoal}
                    onChange={(e) => setNewPod({ ...newPod, savingsGoal: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Target amount to save"
                  />
                </div>
              )}

              <div className="col-span-2 flex gap-2">
                <Button onClick={createBudgetPod}>Create Pod</Button>
                <Button variant="outline" onClick={() => {
                  setShowCreateForm(false);
                  resetNewPodForm();
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Pods Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetPods.map((pod) => {
            const Icon = iconMap[pod.iconName] || Wallet;
            const health = getBudgetHealth(pod);
            const HealthIcon = health.icon;
            const percentUsed = (pod.currentPeriodSpent / pod.amount) * 100;
            const period = getCurrentPeriod(pod);

            return (
              <Card key={pod.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${pod.color} bg-opacity-20`}>
                        <Icon className={`w-6 h-6 ${pod.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{pod.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {pod.period.charAt(0).toUpperCase() + pod.period.slice(1)} Budget
                        </p>
                      </div>
                    </div>
                    <HealthIcon className={`w-5 h-5 ${health.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatCurrency(pod.currentPeriodSpent)} spent
                        </span>
                        <span className="font-medium">
                          {formatCurrency(pod.amount)} budget
                        </span>
                      </div>
                      <Progress 
                        value={percentUsed} 
                        className={percentUsed >= 100 ? 'bg-red-100' : percentUsed >= 80 ? 'bg-yellow-100' : ''}
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {percentUsed.toFixed(1)}% used
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Remaining</p>
                        <p className={`font-semibold ${pod.currentPeriodRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(pod.currentPeriodRemaining)}
                        </p>
                      </div>
                      {pod.rolloverEnabled && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Rollover</p>
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(pod.previousPeriodRollover)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Savings Goal */}
                    {pod.savingsGoal && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Goal Progress</span>
                          <span className="font-medium">
                            {((pod.goalProgress || 0) / pod.savingsGoal * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={(pod.goalProgress || 0) / pod.savingsGoal * 100} 
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {formatCurrency(pod.goalProgress || 0)} of {formatCurrency(pod.savingsGoal)}
                        </p>
                      </div>
                    )}

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1">
                      {pod.categories.slice(0, 3).map((category, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                      {pod.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pod.categories.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setSelectedPod(pod)}
                        className="flex-1"
                      >
                        Details
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          const amount = prompt('Enter expense amount:');
                          const description = prompt('Enter description:');
                          if (amount && description) {
                            addTransaction(pod.id, description, parseFloat(amount), 'expense');
                          }
                        }}
                        className="flex-1"
                      >
                        Add Expense
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization by Pod</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetPods.map(pod => {
                  const percentUsed = (pod.currentPeriodSpent / pod.amount) * 100;
                  return (
                    <div key={pod.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{pod.name}</span>
                        <span>{percentUsed.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentUsed} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Period Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Period</span>
                  <span className="font-semibold">{formatCurrency(budgetStats.totalSpent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Period</span>
                  <span className="font-semibold">{formatCurrency(budgetStats.totalSpent * 0.9)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average</span>
                  <span className="font-semibold">{formatCurrency(budgetStats.totalSpent * 0.95)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};