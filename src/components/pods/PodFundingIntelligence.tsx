import { useState, useMemo } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  Activity,
  Zap,
  Settings,
  Calendar,
  PieChart,
  ArrowUp,
  ArrowDown,
  Equal,
  Lightbulb,
  Shield,
  Gauge,
  Plus,
  Edit,
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
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { AutomationRuleForm } from './AutomationRuleForm';
import type {
  BudgetPod,
  Transaction,
  IncomeSource,
  PodFundingAnalysis,
  FundingSuggestion,
  FundingAutomationRule,
  PodFundingDashboardMetrics
} from '../../types/financial';

interface PodFundingIntelligenceProps {
  budgetPods: BudgetPod[];
  transactions: Transaction[];
  incomeSources: IncomeSource[];
  podAnalyses: PodFundingAnalysis[];
  fundingSuggestions: FundingSuggestion[];
  automationRules: FundingAutomationRule[];
  onApplySuggestion: (suggestionId: string) => void;
  onRejectSuggestion: (suggestionId: string) => void;
  onCreateAutomationRule: (rule: Omit<FundingAutomationRule, 'id' | 'createdDate' | 'lastModified'>) => void;
  onUpdateAutomationRule: (ruleId: string, updates: Partial<FundingAutomationRule>) => void;
  onRunAnalysis?: () => void;
}

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

const SUGGESTION_ICONS = {
  increase: ArrowUp,
  decrease: ArrowDown,
  maintain: Equal,
  redistribute: Target,
};

const PRIORITY_COLORS = {
  low: 'text-blue-600 bg-blue-50 border-blue-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
};

export const PodFundingIntelligence = ({
  budgetPods,
  transactions,
  incomeSources,
  podAnalyses,
  fundingSuggestions,
  automationRules,
  onApplySuggestion,
  onRejectSuggestion,
  onCreateAutomationRule,
  onUpdateAutomationRule,
  onRunAnalysis,
}: PodFundingIntelligenceProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | '180d' | '1y'>('90d');
  const [showOnlyHighPriority, setShowOnlyHighPriority] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<FundingAutomationRule | null>(null);

  // Calculate comprehensive dashboard metrics
  const dashboardMetrics = useMemo((): PodFundingDashboardMetrics => {
    const totalBudgetAmount = budgetPods.reduce((sum, pod) => sum + pod.monthlyAmount, 0);
    const totalUtilized = budgetPods.reduce((sum, pod) => sum + pod.currentAmount, 0);
    const averageUtilization = budgetPods.length > 0 ? 
      (budgetPods.reduce((sum, pod) => sum + ((pod.currentAmount / pod.monthlyAmount) * 100), 0) / budgetPods.length) : 0;

    const pendingSuggestions = fundingSuggestions.filter(s => s.status === 'pending').length;
    const potentialSavings = fundingSuggestions
      .filter(s => s.status === 'pending')
      .reduce((sum, s) => sum + (s.impactAnalysis.monthlySavings || 0), 0);

    const activeRules = automationRules.filter(r => r.isActive).length;
    
    return {
      totalPods: budgetPods.length,
      totalBudgetAmount,
      totalUtilized,
      averageUtilization,
      pendingSuggestions,
      potentialSavings,
      riskReduction: 0, // TODO: Calculate based on suggestions
      activeRules,
      autoApprovedThisMonth: 0, // TODO: Calculate from history
      manualReviewRequired: fundingSuggestions.filter(s => s.implementation.requiresReview).length,
      utilizationTrend: averageUtilization > 75 ? 'improving' : averageUtilization < 50 ? 'declining' : 'stable',
      spendingEfficiency: Math.min(100, averageUtilization), // Simplified calculation
      budgetOptimization: 75, // TODO: Calculate based on analysis
    };
  }, [budgetPods, fundingSuggestions, automationRules]);

  // Prepare visualization data
  const utilizationData = useMemo(() => {
    return budgetPods.map((pod, index) => ({
      name: pod.name,
      utilization: pod.monthlyAmount > 0 ? (pod.currentAmount / pod.monthlyAmount) * 100 : 0,
      budget: pod.monthlyAmount,
      spent: pod.currentAmount,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [budgetPods]);

  // Filter suggestions based on settings
  const filteredSuggestions = useMemo(() => {
    let filtered = fundingSuggestions.filter(s => s.status === 'pending');
    
    if (showOnlyHighPriority) {
      filtered = filtered.filter(s => s.priority === 'high' || s.priority === 'critical');
    }
    
    return filtered.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [fundingSuggestions, showOnlyHighPriority]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 90) return 'text-red-600';
    if (utilization > 75) return 'text-orange-600';
    if (utilization > 50) return 'text-green-600';
    return 'text-blue-600';
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const SuggestionCard = ({ suggestion }: { suggestion: FundingSuggestion }) => {
    const pod = budgetPods.find(p => p.id === suggestion.podId);
    const Icon = SUGGESTION_ICONS[suggestion.suggestionType];
    const analysis = podAnalyses.find(a => a.podId === suggestion.podId);
    
    return (
      <Card className={`transition-all hover:shadow-md border-2 ${PRIORITY_COLORS[suggestion.priority]}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground">{pod?.name}</p>
              </div>
            </div>
            
            <Badge variant="outline" className={`${PRIORITY_COLORS[suggestion.priority]} border`}>
              {suggestion.priority} priority
            </Badge>
          </div>

          <div className="space-y-4">
            <p className="text-sm">{suggestion.description}</p>
            
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium">Current</div>
                <div className="text-lg font-bold">{formatCurrency(suggestion.currentAmount)}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Suggested</div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(suggestion.suggestedAmount)}
                </div>
              </div>
            </div>

            {suggestion.impactAnalysis && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Impact Analysis</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {suggestion.impactAnalysis.monthlySavings !== undefined && (
                    <div className="flex justify-between">
                      <span>Monthly Savings:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(suggestion.impactAnalysis.monthlySavings)}
                      </span>
                    </div>
                  )}
                  {suggestion.impactAnalysis.utilizationOptimization !== undefined && (
                    <div className="flex justify-between">
                      <span>Utilization:</span>
                      <span className="font-medium">
                        {suggestion.impactAnalysis.utilizationOptimization}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" />
                <span>Confidence: {suggestion.supportingData.confidence}%</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRejectSuggestion(suggestion.id)}
                >
                  Reject
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onApplySuggestion(suggestion.id)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AnalysisCard = ({ analysis }: { analysis: PodFundingAnalysis }) => {
    const pod = budgetPods.find(p => p.id === analysis.podId);
    
    return (
      <Card className="transition-all hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{pod?.icon || '📊'}</div>
              <div>
                <h3 className="font-semibold">{pod?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {analysis.spendingTrend} trend
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className={getRiskLevelColor(analysis.riskLevel)}>
              {analysis.riskLevel} risk
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Utilization</span>
              <span className={`font-bold ${getUtilizationColor(analysis.currentUtilization)}`}>
                {analysis.currentUtilization.toFixed(1)}%
              </span>
            </div>
            
            <Progress value={Math.min(analysis.currentUtilization, 100)} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Avg Monthly:</span>
                <div className="font-medium">{formatCurrency(analysis.averageMonthlySpend)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Recommended:</span>
                <div className="font-medium text-green-600">
                  {formatCurrency(analysis.recommendedFunding)}
                </div>
              </div>
            </div>

            {analysis.reasoning.length > 0 && (
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-1">Analysis:</h4>
                <ul className="text-xs space-y-1">
                  {analysis.reasoning.slice(0, 2).map((reason, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
              <span>Confidence: {analysis.confidence}%</span>
              <span>Last analyzed: {new Date(analysis.lastAnalyzed).toLocaleDateString()}</span>
            </div>
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
              {entry.name}: {entry.name.includes('Utilization') ? 
                `${entry.value.toFixed(1)}%` : 
                formatCurrency(entry.value)
              }
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Pod Funding Intelligence
          </h1>
          <p className="text-muted-foreground">
            AI-powered budget optimization and automated funding suggestions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="180d">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={onRunAnalysis}>
            <Activity className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{dashboardMetrics.totalPods}</div>
                <p className="text-xs text-muted-foreground">Active Pods</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{dashboardMetrics.averageUtilization.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">Avg Utilization</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{dashboardMetrics.pendingSuggestions}</div>
                <p className="text-xs text-muted-foreground">Suggestions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(dashboardMetrics.potentialSavings)}</div>
                <p className="text-xs text-muted-foreground">Potential Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{dashboardMetrics.activeRules}</div>
                <p className="text-xs text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="analysis">Pod Analysis</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pod Utilization Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Pod Utilization Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={utilizationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="utilization" name="Utilization">
                        {utilizationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Budget Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Budget Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={utilizationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, budget }) => `${name}: ${formatCurrency(budget)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="budget"
                      >
                        {utilizationData.map((entry, index) => (
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

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Optimization Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Progress value={dashboardMetrics.budgetOptimization} className="h-3" />
                  </div>
                  <span className="text-2xl font-bold">{dashboardMetrics.budgetOptimization}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your budget is well optimized with room for minor improvements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Spending Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Progress value={dashboardMetrics.spendingEfficiency} className="h-3" />
                  </div>
                  <span className="text-2xl font-bold">{dashboardMetrics.spendingEfficiency}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {dashboardMetrics.utilizationTrend === 'improving' ? 
                    'Spending patterns are improving' : 
                    'Consider adjusting allocations'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Allocated:</span>
                    <span className="font-medium">{formatCurrency(dashboardMetrics.totalBudgetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Utilized:</span>
                    <span className="font-medium text-green-600">{formatCurrency(dashboardMetrics.totalUtilized)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Available:</span>
                    <span>{formatCurrency(dashboardMetrics.totalBudgetAmount - dashboardMetrics.totalUtilized)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI-Powered Funding Suggestions</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="high-priority"
                  checked={showOnlyHighPriority}
                  onCheckedChange={setShowOnlyHighPriority}
                />
                <Label htmlFor="high-priority" className="text-sm">High priority only</Label>
              </div>
              <Badge variant="outline">
                {filteredSuggestions.length} suggestions
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSuggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>

          {filteredSuggestions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">All Optimized!</h3>
                <p className="text-muted-foreground">
                  Your budget pods are well-funded. No suggestions at this time.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Detailed Pod Analysis</h3>
            <Button variant="outline" onClick={onRunAnalysis}>
              <Activity className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {podAnalyses.map((analysis) => (
              <AnalysisCard key={analysis.podId} analysis={analysis} />
            ))}
          </div>

          {podAnalyses.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Analysis Required</h3>
                <p className="text-muted-foreground mb-4">
                  Run analysis to get detailed insights into your pod performance
                </p>
                <Button onClick={onRunAnalysis}>
                  <Activity className="w-4 h-4 mr-2" />
                  Run Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Automation Rules</h3>
            <Button onClick={() => setShowRuleForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Automation Rules */}
            <div className="space-y-4">
              {automationRules.map((rule) => (
                <Card key={rule.id} className={`${rule.isActive ? 'border-green-300' : 'border-gray-200'}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <Zap className={`w-5 h-5 ${rule.isActive ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>
                      
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => 
                          onUpdateAutomationRule(rule.id, { isActive: checked })
                        }
                      />
                    </div>

                    {rule.performance && (
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Suggestions:</span>
                          <div className="font-medium">{rule.performance.totalSuggestions}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Accepted:</span>
                          <div className="font-medium text-green-600">
                            {rule.performance.acceptedSuggestions}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setEditingRule(rule);
                          setShowRuleForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Rule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {automationRules.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Automation Rules</h3>
                    <p className="text-muted-foreground mb-4">
                      Create rules to automatically optimize your pod funding
                    </p>
                    <Button onClick={() => setShowRuleForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Rule
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Automation Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Automation Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Rules</span>
                    <span className="font-bold">{dashboardMetrics.activeRules}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Auto-approved This Month</span>
                    <span className="font-bold text-green-600">
                      {dashboardMetrics.autoApprovedThisMonth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Require Manual Review</span>
                    <span className="font-bold text-orange-600">
                      {dashboardMetrics.manualReviewRequired}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Optimization Impact</div>
                    <Progress value={75} className="h-2 mb-1" />
                    <div className="text-xs text-muted-foreground">
                      Automation has improved budget efficiency by 25%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Automation Rule Form Dialog */}
      <Dialog open={showRuleForm} onOpenChange={(open) => {
        setShowRuleForm(open);
        if (!open) {
          setEditingRule(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
            </DialogTitle>
            <DialogDescription>
              {editingRule 
                ? 'Modify your existing automation rule settings and conditions.'
                : 'Set up intelligent automation to optimize your pod funding based on spending patterns and utilization.'
              }
            </DialogDescription>
          </DialogHeader>
          <AutomationRuleForm
            budgetPods={budgetPods}
            rule={editingRule || undefined}
            onSave={(ruleData) => {
              if (editingRule) {
                onUpdateAutomationRule(editingRule.id, ruleData);
              } else {
                onCreateAutomationRule(ruleData);
              }
              setShowRuleForm(false);
              setEditingRule(null);
            }}
            onCancel={() => {
              setShowRuleForm(false);
              setEditingRule(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};