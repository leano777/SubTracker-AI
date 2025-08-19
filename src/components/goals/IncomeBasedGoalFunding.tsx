import { useState, useMemo } from 'react';
import {
  DollarSign,
  Target,
  TrendingUp,
  Calculator,
  Zap,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Percent,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import type {
  FinancialGoal,
  IncomeSource,
  BudgetPod,
  GoalFundingRecommendation
} from '../../types/financial';

interface IncomeAllocationRule {
  id: string;
  name: string;
  incomeSourceId: string;
  percentage: number;
  fixedAmount?: number;
  priority: number;
  isActive: boolean;
  conditions?: {
    minIncome?: number;
    maxIncome?: number;
    afterExpenses?: boolean;
  };
}

interface FundingSimulation {
  goalId: string;
  currentProgress: number;
  projectedCompletion: string;
  monthlyContribution: number;
  totalNeeded: number;
  likelihood: number;
}

interface IncomeBasedGoalFundingProps {
  goals: FinancialGoal[];
  incomeSources: IncomeSource[];
  budgetPods: BudgetPod[];
  onUpdateGoal: (goalId: string, updates: Partial<FinancialGoal>) => void;
  onCreateAllocationRule: (rule: Omit<IncomeAllocationRule, 'id'>) => void;
  onUpdateAllocationRule: (ruleId: string, updates: Partial<IncomeAllocationRule>) => void;
  existingRules?: IncomeAllocationRule[];
}

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

export const IncomeBasedGoalFunding = ({
  goals,
  incomeSources,
  budgetPods,
  onUpdateGoal,
  onCreateAllocationRule,
  onUpdateAllocationRule,
  existingRules = [],
}: IncomeBasedGoalFundingProps) => {
  const [selectedIncomeSource, setSelectedIncomeSource] = useState<string>('');
  const [allocationMethod, setAllocationMethod] = useState<'percentage' | 'fixed'>('percentage');
  const [activeTab, setActiveTab] = useState('automation');
  const [simulationSettings, setSimulationSettings] = useState({
    timeframe: 12, // months
    incomeGrowth: 0, // percentage
    includeExpenses: true,
  });

  // Calculate available income after existing allocations
  const availableIncome = useMemo(() => {
    const sourceMap: Record<string, { total: number; allocated: number; available: number }> = {};
    
    incomeSources.forEach(source => {
      if (source.isActive) {
        sourceMap[source.id] = {
          total: source.netAmount,
          allocated: 0,
          available: source.netAmount,
        };
      }
    });

    // Subtract existing goal allocations
    goals.forEach(goal => {
      goal.incomeAllocation?.forEach(allocation => {
        if (allocation.isActive && sourceMap[allocation.incomeSourceId]) {
          const amount = allocation.fixedAmount || 
            (sourceMap[allocation.incomeSourceId].total * allocation.percentage / 100);
          sourceMap[allocation.incomeSourceId].allocated += amount;
          sourceMap[allocation.incomeSourceId].available -= amount;
        }
      });
    });

    return sourceMap;
  }, [incomeSources, goals]);

  // Generate smart funding recommendations
  const fundingRecommendations = useMemo(() => {
    const recommendations: GoalFundingRecommendation[] = [];
    
    goals.filter(g => g.status === 'in_progress' || g.status === 'not_started').forEach(goal => {
      const progress = goal.currentAmount / goal.targetAmount;
      const timeToDeadline = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      const remaining = goal.targetAmount - goal.currentAmount;
      const requiredMonthly = remaining / Math.max(timeToDeadline, 1);
      const currentMonthly = goal.monthlyContribution || 0;
      
      if (requiredMonthly > currentMonthly * 1.2) { // Need 20% more contribution
        const severity = timeToDeadline <= 6 ? 'critical' : 
                       timeToDeadline <= 12 ? 'high' : 'medium';
        
        // Find best income source to allocate from
        const bestSource = Object.entries(availableIncome)
          .filter(([_, data]) => data.available >= (requiredMonthly - currentMonthly))
          .sort(([,a], [,b]) => b.available - a.available)[0];
        
        if (bestSource) {
          recommendations.push({
            goalId: goal.id,
            recommendationType: 'reallocate_income',
            severity,
            title: `Increase funding for ${goal.title}`,
            description: `To meet your deadline, you need ${formatCurrency(requiredMonthly)}/month instead of ${formatCurrency(currentMonthly)}/month.`,
            suggestedAction: {
              type: 'income_allocation',
              amount: requiredMonthly - currentMonthly,
              incomeSourceId: bestSource[0],
            },
            impactAnalysis: {
              timeToGoal: timeToDeadline,
              additionalContributionNeeded: requiredMonthly - currentMonthly,
              probabilityOfSuccess: Math.min(95, 70 + (bestSource[1].available / (requiredMonthly - currentMonthly)) * 10),
            },
          });
        }
      }
    });
    
    return recommendations;
  }, [goals, availableIncome]);

  // Calculate funding simulation
  const fundingSimulation = useMemo(() => {
    const simulations: FundingSimulation[] = [];
    
    goals.filter(g => g.status === 'in_progress' || g.status === 'not_started').forEach(goal => {
      const currentProgress = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;
      const monthlyContribution = goal.monthlyContribution || 0;
      
      // Project completion based on current contribution rate
      const monthsToCompletion = monthlyContribution > 0 ? 
        Math.ceil(remaining / monthlyContribution) : Infinity;
      
      const projectedCompletion = monthsToCompletion !== Infinity ?
        new Date(Date.now() + monthsToCompletion * 30 * 24 * 60 * 60 * 1000).toISOString() :
        new Date(goal.deadline).toISOString();
      
      // Calculate likelihood based on deadline vs projection
      const deadlineMonths = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      const likelihood = monthsToCompletion <= deadlineMonths ? 
        Math.min(95, 50 + (deadlineMonths - monthsToCompletion) * 5) : 
        Math.max(10, 90 - (monthsToCompletion - deadlineMonths) * 10);
      
      simulations.push({
        goalId: goal.id,
        currentProgress,
        projectedCompletion,
        monthlyContribution,
        totalNeeded: remaining,
        likelihood,
      });
    });
    
    return simulations;
  }, [goals]);

  // Prepare allocation visualization data
  const allocationData = useMemo(() => {
    const data = goals
      .filter(g => g.incomeAllocation && g.incomeAllocation.length > 0)
      .map((goal, index) => ({
        name: goal.title,
        value: goal.incomeAllocation?.reduce((sum, alloc) => {
          const sourceData = availableIncome[alloc.incomeSourceId];
          return sum + (alloc.fixedAmount || (sourceData?.total || 0) * alloc.percentage / 100);
        }, 0) || 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
    
    // Add available income
    const totalAvailable = Object.values(availableIncome)
      .reduce((sum, data) => sum + data.available, 0);
    
    if (totalAvailable > 0) {
      data.push({
        name: 'Available',
        value: totalAvailable,
        color: '#e5e7eb',
      });
    }
    
    return data;
  }, [goals, availableIncome]);

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

  const AutomationRuleCard = ({ rule }: { rule: IncomeAllocationRule }) => {
    const incomeSource = incomeSources.find(s => s.id === rule.incomeSourceId);
    const amount = rule.fixedAmount || 
      (availableIncome[rule.incomeSourceId]?.total || 0) * rule.percentage / 100;
    
    return (
      <Card className={`transition-all ${rule.isActive ? 'border-green-300' : 'border-gray-200'}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-50' : 'bg-gray-50'}`}>
                <Zap className={`w-5 h-5 ${rule.isActive ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <h3 className="font-semibold">{rule.name}</h3>
                <p className="text-sm text-muted-foreground">
                  From: {incomeSource?.name || 'Unknown Source'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={rule.isActive ? 'default' : 'outline'}>
                {rule.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Priority {rule.priority}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Allocation Amount</span>
              <span className="font-bold text-green-600">
                {rule.fixedAmount ? 
                  formatCurrency(rule.fixedAmount) : 
                  `${rule.percentage}% (${formatCurrency(amount)})`
                }
              </span>
            </div>

            {rule.conditions && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Conditions</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {rule.conditions.minIncome && (
                    <div>Min Income: {formatCurrency(rule.conditions.minIncome)}</div>
                  )}
                  {rule.conditions.maxIncome && (
                    <div>Max Income: {formatCurrency(rule.conditions.maxIncome)}</div>
                  )}
                  {rule.conditions.afterExpenses && (
                    <div>After essential expenses</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onUpdateAllocationRule(rule.id, { isActive: !rule.isActive })}
              >
                {rule.isActive ? 'Pause' : 'Activate'}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
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
          <h2 className="text-2xl font-bold">Income-Based Goal Funding</h2>
          <p className="text-muted-foreground">
            Automate and optimize your goal funding from income sources
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calculator className="w-4 h-4 mr-2" />
            Simulate
          </Button>
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(Object.values(availableIncome).reduce((sum, data) => sum + data.total, 0))}
                </div>
                <p className="text-xs text-muted-foreground">Total Income</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(Object.values(availableIncome).reduce((sum, data) => sum + data.allocated, 0))}
                </div>
                <p className="text-xs text-muted-foreground">Allocated to Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(Object.values(availableIncome).reduce((sum, data) => sum + data.available, 0))}
                </div>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{existingRules.filter(r => r.isActive).length}</div>
                <p className="text-xs text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="allocation">Allocation Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Existing Rules */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold">Active Automation Rules</h3>
              
              {existingRules.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {existingRules.map((rule) => (
                    <AutomationRuleCard key={rule.id} rule={rule} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Automation Rules</h3>
                    <p className="text-muted-foreground mb-4">
                      Create rules to automatically fund your goals from income sources
                    </p>
                    <Button>
                      <Zap className="w-4 h-4 mr-2" />
                      Create First Rule
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Rule Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Create Automation Rule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="income-source">Income Source</Label>
                  <Select value={selectedIncomeSource} onValueChange={setSelectedIncomeSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select income source" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeSources.filter(s => s.isActive).map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name} - {formatCurrency(source.netAmount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Allocation Method</Label>
                  <div className="flex gap-2 mt-1">
                    <Button 
                      variant={allocationMethod === 'percentage' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAllocationMethod('percentage')}
                    >
                      <Percent className="w-4 h-4 mr-1" />
                      Percentage
                    </Button>
                    <Button 
                      variant={allocationMethod === 'fixed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAllocationMethod('fixed')}
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Fixed Amount
                    </Button>
                  </div>
                </div>

                {selectedIncomeSource && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">
                        Available: {formatCurrency(availableIncome[selectedIncomeSource]?.available || 0)}
                      </div>
                      <div className="text-xs text-blue-600">
                        Total: {formatCurrency(availableIncome[selectedIncomeSource]?.total || 0)} | 
                        Allocated: {formatCurrency(availableIncome[selectedIncomeSource]?.allocated || 0)}
                      </div>
                    </div>

                    {allocationMethod === 'percentage' ? (
                      <div>
                        <Label htmlFor="percentage">Percentage</Label>
                        <div className="px-3 py-2">
                          <Slider
                            defaultValue={[10]}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="fixed-amount">Fixed Amount</Label>
                        <Input
                          id="fixed-amount"
                          type="number"
                          placeholder="Enter amount"
                        />
                      </div>
                    )}

                    <Button className="w-full">
                      Create Automation Rule
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {fundingRecommendations.map((rec) => {
              const goal = goals.find(g => g.id === rec.goalId);
              const incomeSource = incomeSources.find(s => s.id === rec.suggestedAction.incomeSourceId);
              
              const severityColors = {
                low: 'border-blue-300 bg-blue-50',
                medium: 'border-yellow-300 bg-yellow-50',
                high: 'border-orange-300 bg-orange-50',
                critical: 'border-red-300 bg-red-50',
              };
              
              return (
                <Card key={rec.goalId} className={severityColors[rec.severity]}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
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
                      
                      <div className="bg-white/60 p-3 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">Recommended Action:</h4>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Allocate from {incomeSource?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Additional: {formatCurrency(rec.suggestedAction.amount || 0)}/month
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">
                              {rec.impactAnalysis.probabilityOfSuccess}% Success
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {rec.impactAnalysis.timeToGoal} months to goal
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Zap className="w-4 h-4 mr-2" />
                          Auto-Apply
                        </Button>
                        <Button variant="outline" size="sm">
                          Customize
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
            
            {fundingRecommendations.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-xl font-semibold mb-2">All Goals Well Funded!</h3>
                  <p className="text-muted-foreground">
                    Your current income allocations are sufficient for your goals.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Simulation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Simulation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timeframe">Timeframe (months)</Label>
                  <Slider
                    value={[simulationSettings.timeframe]}
                    onValueChange={([value]) => setSimulationSettings(prev => ({ ...prev, timeframe: value }))}
                    max={60}
                    min={6}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {simulationSettings.timeframe} months
                  </div>
                </div>

                <div>
                  <Label htmlFor="income-growth">Expected Income Growth (%)</Label>
                  <Slider
                    value={[simulationSettings.incomeGrowth]}
                    onValueChange={([value]) => setSimulationSettings(prev => ({ ...prev, incomeGrowth: value }))}
                    max={20}
                    min={-10}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {simulationSettings.incomeGrowth}% annual growth
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-expenses">Include Essential Expenses</Label>
                  <Switch
                    id="include-expenses"
                    checked={simulationSettings.includeExpenses}
                    onCheckedChange={(checked) => 
                      setSimulationSettings(prev => ({ ...prev, includeExpenses: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Simulation Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Funding Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fundingSimulation.map((sim) => {
                    const goal = goals.find(g => g.id === sim.goalId);
                    return (
                      <div key={sim.goalId} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium truncate">{goal?.title}</h4>
                          <Badge variant={sim.likelihood > 70 ? 'default' : sim.likelihood > 40 ? 'secondary' : 'destructive'}>
                            {sim.likelihood}% likely
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <Progress value={sim.currentProgress} className="h-2" />
                          
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formatCurrency(sim.monthlyContribution)}/month</span>
                            <span>Complete: {formatDate(sim.projectedCompletion)}</span>
                          </div>
                          
                          <div className="text-xs">
                            <span className="font-medium">Remaining:</span> {formatCurrency(sim.totalNeeded)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allocation Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Income Allocation Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Source Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Income Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(availableIncome).map(([sourceId, data]) => {
                    const source = incomeSources.find(s => s.id === sourceId);
                    const utilizationRate = data.total > 0 ? (data.allocated / data.total) * 100 : 0;
                    
                    return (
                      <div key={sourceId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{source?.name}</h4>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(utilizationRate)}% utilized
                          </span>
                        </div>
                        
                        <Progress value={utilizationRate} className="h-2" />
                        
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Allocated: {formatCurrency(data.allocated)}</span>
                          <span>Available: {formatCurrency(data.available)}</span>
                        </div>
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