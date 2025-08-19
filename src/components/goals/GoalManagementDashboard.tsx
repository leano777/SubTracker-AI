import { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Filter,
  Calendar,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Zap,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  Bell,
  Star,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { GoalProgressVisualization } from './GoalProgressVisualization';
import { IncomeBasedGoalFunding } from './IncomeBasedGoalFunding';
import type {
  FinancialGoal,
  GoalProgressAnalytics,
  GoalFundingRecommendation,
  IncomeSource,
  BudgetPod,
  Transaction
} from '../../types/financial';

interface GoalManagementDashboardProps {
  goals: FinancialGoal[];
  analytics: GoalProgressAnalytics[];
  recommendations: GoalFundingRecommendation[];
  incomeSources: IncomeSource[];
  budgetPods: BudgetPod[];
  transactions: Transaction[];
  onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'createdDate' | 'lastModified'>) => void;
  onUpdateGoal: (goalId: string, updates: Partial<FinancialGoal>) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddContribution: (goalId: string, amount: number, note?: string) => void;
}

const GOAL_CATEGORIES = [
  { value: 'savings', label: 'Savings', icon: '💰' },
  { value: 'investment', label: 'Investment', icon: '📈' },
  { value: 'debt_reduction', label: 'Debt Reduction', icon: '💳' },
  { value: 'purchase', label: 'Purchase', icon: '🛒' },
  { value: 'retirement', label: 'Retirement', icon: '🏖️' },
  { value: 'emergency', label: 'Emergency Fund', icon: '🚨' },
  { value: 'other', label: 'Other', icon: '🎯' },
];

const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'];
const STATUS_ORDER = ['in_progress', 'not_started', 'paused', 'completed', 'abandoned'];

export const GoalManagementDashboard = ({
  goals,
  analytics,
  recommendations,
  incomeSources,
  budgetPods,
  transactions,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddContribution,
}: GoalManagementDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'progress' | 'amount'>('deadline');

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    let filtered = goals;

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(g => g.category === filterCategory);
    }

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(g => g.status === 'in_progress' || g.status === 'not_started');
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(g => g.status === 'completed');
    } else if (filterStatus === 'paused') {
      filtered = filtered.filter(g => g.status === 'paused');
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'priority':
          return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
        case 'progress':
          const progressA = a.targetAmount > 0 ? (a.currentAmount / a.targetAmount) : 0;
          const progressB = b.targetAmount > 0 ? (b.currentAmount / b.targetAmount) : 0;
          return progressB - progressA;
        case 'amount':
          return b.targetAmount - a.targetAmount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [goals, filterCategory, filterStatus, sortBy]);

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === 'in_progress' || g.status === 'not_started');
    const completedGoals = goals.filter(g => g.status === 'completed');
    
    const totalTargetAmount = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrentAmount = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalCompletedValue = completedGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    
    const monthlyContributions = activeGoals.reduce((sum, g) => sum + (g.monthlyContribution || 0), 0);
    
    // Calculate goals at risk (less than 3 months to deadline and less than 70% complete)
    const goalsAtRisk = activeGoals.filter(g => {
      const deadline = new Date(g.deadline);
      const now = new Date();
      const daysToDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      return daysToDeadline <= 90 && progress < 70;
    });

    // Calculate goals ahead of schedule
    const goalsAheadOfSchedule = activeGoals.filter(g => {
      const deadline = new Date(g.deadline);
      const now = new Date();
      const totalDays = Math.ceil((deadline.getTime() - new Date(g.createdDate).getTime()) / (1000 * 60 * 60 * 24));
      const daysPassed = Math.ceil((now.getTime() - new Date(g.createdDate).getTime()) / (1000 * 60 * 60 * 24));
      const expectedProgress = (daysPassed / totalDays) * 100;
      const actualProgress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      return actualProgress > expectedProgress + 10; // 10% buffer
    });

    return {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTargetAmount,
      totalCurrentAmount,
      totalCompletedValue,
      overallProgress,
      monthlyContributions,
      goalsAtRisk: goalsAtRisk.length,
      goalsAheadOfSchedule: goalsAheadOfSchedule.length,
      averageProgress: activeGoals.length > 0 ? 
        activeGoals.reduce((sum, g) => sum + ((g.currentAmount / g.targetAmount) * 100), 0) / activeGoals.length : 0,
    };
  }, [goals]);

  // Recent activity from transactions
  const recentGoalActivity = useMemo(() => {
    return transactions
      .filter(t => t.type === 'transfer' && t.category === 'goal_contribution')
      .slice(0, 5)
      .map(t => {
        const goal = goals.find(g => g.id === t.externalAccountId);
        return {
          ...t,
          goalTitle: goal?.title || 'Unknown Goal',
          goalIcon: goal?.icon || '🎯',
        };
      });
  }, [transactions, goals]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeToDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600', urgent: true };
    if (diffDays <= 30) return { text: `${diffDays} days`, color: 'text-red-600', urgent: true };
    if (diffDays <= 90) return { text: `${Math.ceil(diffDays / 7)} weeks`, color: 'text-yellow-600', urgent: true };
    if (diffDays <= 365) return { text: `${Math.ceil(diffDays / 30)} months`, color: 'text-blue-600', urgent: false };
    return { text: `${Math.ceil(diffDays / 365)} years`, color: 'text-gray-600', urgent: false };
  };

  const QuickActionCard = ({ goal }: { goal: FinancialGoal }) => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const timeInfo = getTimeToDeadline(goal.deadline);
    const categoryInfo = GOAL_CATEGORIES.find(c => c.value === goal.category);
    
    return (
      <Card className="transition-all hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{goal.icon || categoryInfo?.icon || '🎯'}</div>
              <div>
                <h3 className="font-semibold truncate">{goal.title}</h3>
                <p className="text-sm text-muted-foreground">{categoryInfo?.label}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {}}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contribution
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Goal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {}}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className={`text-sm font-bold ${getProgressColor(progress)}`}>
                {Math.round(progress)}%
              </span>
            </div>
            
            <Progress value={Math.min(progress, 100)} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-green-600">
                {formatCurrency(goal.currentAmount)}
              </span>
              <span className="text-muted-foreground">
                of {formatCurrency(goal.targetAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className={timeInfo.color}>{formatDate(goal.deadline)}</span>
              </div>
              {timeInfo.urgent && (
                <Badge variant="outline" className="text-xs text-red-600">
                  {timeInfo.text}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-muted-foreground">
            Manage and track your financial objectives with intelligent automation
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <Label className="text-xs font-semibold text-muted-foreground mb-2 block">CATEGORY</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {GOAL_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-2">
                <Label className="text-xs font-semibold text-muted-foreground mb-2 block">STATUS</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active Goals</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="all">All Statuses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={() => {}}>
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{dashboardMetrics.activeGoals}</div>
                <p className="text-xs text-muted-foreground">Active Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{dashboardMetrics.completedGoals}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{Math.round(dashboardMetrics.averageProgress)}%</div>
                <p className="text-xs text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(dashboardMetrics.monthlyContributions)}</div>
                <p className="text-xs text-muted-foreground">Monthly</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={dashboardMetrics.goalsAtRisk > 0 ? 'border-red-300' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{dashboardMetrics.goalsAtRisk}</div>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{dashboardMetrics.goalsAheadOfSchedule}</div>
                <p className="text-xs text-muted-foreground">Ahead</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Notifications */}
      {recommendations.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Bell className="w-5 h-5" />
              Action Required ({recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-yellow-700">
                {recommendations.filter(r => r.severity === 'critical' || r.severity === 'high').length} high priority recommendations need your attention
              </p>
              <Button size="sm" variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Review All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="automation">Smart Funding</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Goals Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGoals.slice(0, 6).map((goal) => (
                  <QuickActionCard key={goal.id} goal={goal} />
                ))}
              </div>
              
              {filteredGoals.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Goals Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {filterCategory !== 'all' || filterStatus !== 'active'
                        ? 'Try adjusting your filters'
                        : 'Start by creating your first financial goal'
                      }
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Goal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Activity & Quick Stats */}
            <div className="space-y-4">
              {/* Overall Progress */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Progress</span>
                      <span className="text-sm font-bold text-green-600">
                        {Math.round(dashboardMetrics.overallProgress)}%
                      </span>
                    </div>
                    
                    <Progress value={dashboardMetrics.overallProgress} className="h-3" />
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span>{formatCurrency(dashboardMetrics.totalCurrentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target:</span>
                        <span>{formatCurrency(dashboardMetrics.totalTargetAmount)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Remaining:</span>
                        <span>{formatCurrency(dashboardMetrics.totalTargetAmount - dashboardMetrics.totalCurrentAmount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentGoalActivity.length > 0 ? (
                      recentGoalActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3">
                          <div className="text-xl">{activity.goalIcon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{activity.goalTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(activity.amount)} • {formatDate(activity.date)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contribution
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Create New Goal
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Zap className="w-4 h-4 mr-2" />
                    Setup Auto-funding
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Full Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <GoalProgressVisualization
            goals={filteredGoals}
            analytics={analytics}
            recommendations={recommendations}
            incomeSources={incomeSources}
            budgetPods={budgetPods}
            onEditGoal={(goal) => onUpdateGoal(goal.id, goal)}
            onAddContribution={onAddContribution}
            onCreateGoal={() => {}}
          />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <IncomeBasedGoalFunding
            goals={filteredGoals}
            incomeSources={incomeSources}
            budgetPods={budgetPods}
            onUpdateGoal={onUpdateGoal}
            onCreateAllocationRule={() => {}}
            onUpdateAllocationRule={() => {}}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className="font-bold">
                      {goals.length > 0 ? Math.round((dashboardMetrics.completedGoals / goals.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Monthly Contribution</span>
                    <span className="font-bold">{formatCurrency(dashboardMetrics.monthlyContributions)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Value Achieved</span>
                    <span className="font-bold text-green-600">{formatCurrency(dashboardMetrics.totalCompletedValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Goals Ahead of Schedule</span>
                    <span className="font-bold text-blue-600">{dashboardMetrics.goalsAheadOfSchedule}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {GOAL_CATEGORIES.map(category => {
                    const categoryGoals = goals.filter(g => g.category === category.value);
                    const categoryValue = categoryGoals.reduce((sum, g) => sum + g.targetAmount, 0);
                    const categoryProgress = categoryGoals.length > 0 ? 
                      categoryGoals.reduce((sum, g) => sum + ((g.currentAmount / g.targetAmount) * 100), 0) / categoryGoals.length : 0;
                    
                    if (categoryGoals.length === 0) return null;
                    
                    return (
                      <div key={category.value} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span className="text-sm font-medium">{category.label}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {categoryGoals.length} goals • {formatCurrency(categoryValue)}
                          </span>
                        </div>
                        <Progress value={categoryProgress} className="h-1" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};