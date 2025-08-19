import { useState, useMemo } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trophy,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Plus,
  Edit,
  Settings,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type {
  FinancialGoal,
  GoalProgressAnalytics,
  GoalFundingRecommendation,
  IncomeSource,
  BudgetPod
} from '../../types/financial';

interface GoalProgressVisualizationProps {
  goals: FinancialGoal[];
  analytics: GoalProgressAnalytics[];
  recommendations: GoalFundingRecommendation[];
  incomeSources: IncomeSource[];
  budgetPods: BudgetPod[];
  onEditGoal?: (goal: FinancialGoal) => void;
  onAddContribution?: (goalId: string, amount: number, note?: string) => void;
  onCreateGoal?: () => void;
}

const GOAL_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
];

const PRIORITY_COLORS = {
  low: 'text-blue-600 bg-blue-50',
  medium: 'text-yellow-600 bg-yellow-50',
  high: 'text-orange-600 bg-orange-50',
  critical: 'text-red-600 bg-red-50',
};

const STATUS_COLORS = {
  not_started: 'text-gray-600 bg-gray-50',
  in_progress: 'text-blue-600 bg-blue-50',
  completed: 'text-green-600 bg-green-50',
  paused: 'text-yellow-600 bg-yellow-50',
  abandoned: 'text-red-600 bg-red-50',
};

export const GoalProgressVisualization = ({
  goals,
  analytics,
  recommendations,
  incomeSources,
  budgetPods,
  onEditGoal,
  onAddContribution,
  onCreateGoal,
}: GoalProgressVisualizationProps) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === 'in_progress' || g.status === 'not_started');
    const completedGoals = goals.filter(g => g.status === 'completed');
    
    const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalCompleted = completedGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    const monthlyContributions = activeGoals.reduce((sum, g) => sum + (g.monthlyContribution || 0), 0);
    
    const urgentGoals = activeGoals.filter(g => {
      const deadline = new Date(g.deadline);
      const now = new Date();
      const daysToDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      return daysToDeadline <= 90 && progress < 70; // Less than 3 months and under 70% complete
    });

    return {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTarget,
      totalCurrent,
      totalCompleted,
      overallProgress,
      monthlyContributions,
      urgentGoals: urgentGoals.length,
      averageProgress: activeGoals.length > 0 ? 
        activeGoals.reduce((sum, g) => sum + ((g.currentAmount / g.targetAmount) * 100), 0) / activeGoals.length : 0,
    };
  }, [goals]);

  // Prepare chart data
  const progressChartData = useMemo(() => {
    if (!selectedGoal) return [];
    
    const goalAnalytics = analytics.find(a => a.goalId === selectedGoal && a.timeframe === timeframe);
    return goalAnalytics?.progressData.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })) || [];
  }, [selectedGoal, timeframe, analytics]);

  // Goal categories distribution
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    goals.filter(g => g.status !== 'abandoned').forEach(goal => {
      categoryTotals[goal.category] = (categoryTotals[goal.category] || 0) + goal.targetAmount;
    });

    return Object.entries(categoryTotals).map(([category, value], index) => ({
      name: category.replace('_', ' ').toUpperCase(),
      value,
      color: GOAL_COLORS[index % GOAL_COLORS.length],
    }));
  }, [goals]);

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

  const GoalCard = ({ goal }: { goal: FinancialGoal }) => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const timeInfo = getTimeToDeadline(goal.deadline);
    const goalRecommendations = recommendations.filter(r => r.goalId === goal.id);
    
    return (
      <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => setSelectedGoal(goal.id)}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {goal.icon ? (
                  <span className="text-xl">{goal.icon}</span>
                ) : (
                  <Target className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg truncate">{goal.title}</h3>
                <p className="text-sm text-muted-foreground capitalize">{goal.category.replace('_', ' ')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={PRIORITY_COLORS[goal.priority]}>
                {goal.priority}
              </Badge>
              <Badge variant="outline" className={STATUS_COLORS[goal.status]}>
                {goal.status.replace('_', ' ')}
              </Badge>
            </div>
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

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span className={timeInfo.color}>{formatDate(goal.deadline)}</span>
                {timeInfo.urgent && (
                  <Badge variant="outline" className="text-xs text-red-600">
                    {timeInfo.text}
                  </Badge>
                )}
              </div>
              
              {goalRecommendations.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {goalRecommendations.length} alerts
                </Badge>
              )}
            </div>

            {goal.monthlyContribution && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUp className="w-4 h-4" />
                {formatCurrency(goal.monthlyContribution)}/month
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-muted-foreground">
            Track progress and manage your financial objectives
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={onCreateGoal}>
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{overallMetrics.activeGoals}</div>
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
                <div className="text-2xl font-bold">{overallMetrics.completedGoals}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{Math.round(overallMetrics.averageProgress)}%</div>
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
                <div className="text-2xl font-bold">{formatCurrency(overallMetrics.monthlyContributions)}</div>
                <p className="text-xs text-muted-foreground">Monthly Contributions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={overallMetrics.urgentGoals > 0 ? 'border-red-300' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{overallMetrics.urgentGoals}</div>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Goals List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Goals</h3>
                <Select value={selectedGoal || ''} onValueChange={setSelectedGoal}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {goals.slice(0, 6).map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Goals by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {selectedGoal ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {goals.find(g => g.id === selectedGoal)?.title} Progress
                </h3>
                <Select value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Progress Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={progressChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="currentAmount" 
                          stackId="1"
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.3}
                          name="Current Amount"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="projectedAmount" 
                          stackId="2"
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.1}
                          strokeDasharray="5 5"
                          name="Projected"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="contribution" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          name="Monthly Contribution"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Select a Goal</h3>
                <p className="text-muted-foreground">
                  Choose a goal from the overview tab to view detailed progress tracking
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Progress Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Overall Progress Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Goal Value</span>
                    <span className="font-bold">{formatCurrency(overallMetrics.totalTarget)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Current Progress</span>
                    <span className="font-bold text-green-600">{formatCurrency(overallMetrics.totalCurrent)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed Value</span>
                    <span className="font-bold text-blue-600">{formatCurrency(overallMetrics.totalCompleted)}</span>
                  </div>
                  <Progress value={overallMetrics.overallProgress} className="h-3" />
                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round(overallMetrics.overallProgress)}% of active goals completed
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.filter(g => g.performanceMetrics).slice(0, 3).map((goal) => (
                    <div key={goal.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium truncate">{goal.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {goal.performanceMetrics?.contributionStreakDays} day streak
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Avg Monthly:</span>
                          <span>{formatCurrency(goal.performanceMetrics?.avgMonthlyContribution || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Consistency:</span>
                          <span>{goal.performanceMetrics?.contributionConsistency}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Months to Goal:</span>
                          <span>{goal.performanceMetrics?.monthsToCompletion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {recommendations.slice(0, 5).map((rec) => {
              const goal = goals.find(g => g.id === rec.goalId);
              const severityColors = {
                low: 'border-blue-300 bg-blue-50',
                medium: 'border-yellow-300 bg-yellow-50',
                high: 'border-orange-300 bg-orange-50',
                critical: 'border-red-300 bg-red-50',
              };
              
              return (
                <Card key={rec.goalId + rec.recommendationType} className={severityColors[rec.severity]}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {rec.title}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {rec.severity} priority
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Goal: {goal?.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                      
                      <div className="bg-white/60 p-3 rounded-lg space-y-2">
                        <h4 className="font-medium text-sm">Recommended Action:</h4>
                        <div className="text-sm">
                          {rec.suggestedAction.type === 'monthly_increase' && (
                            <p>Increase monthly contribution by {formatCurrency(rec.suggestedAction.amount || 0)}</p>
                          )}
                          {rec.suggestedAction.type === 'income_allocation' && (
                            <p>Allocate income from {incomeSources.find(s => s.id === rec.suggestedAction.incomeSourceId)?.name}</p>
                          )}
                          {rec.suggestedAction.type === 'deadline_extension' && (
                            <p>Extend deadline to {formatDate(rec.suggestedAction.newDeadline || '')}</p>
                          )}
                        </div>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Time Impact: {rec.impactAnalysis.timeToGoal} months</span>
                          <span>Success Rate: {rec.impactAnalysis.probabilityOfSuccess}%</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          Apply Recommendation
                        </Button>
                        <Button variant="outline" size="sm">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {recommendations.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-xl font-semibold mb-2">All Goals On Track!</h3>
                  <p className="text-muted-foreground">
                    Your financial goals are progressing well. Keep up the great work!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};