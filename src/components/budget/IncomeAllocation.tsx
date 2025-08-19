import { useState, useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  PieChart,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Wallet,
  Target,
  Clock,
  MoreVertical,
  Eye,
  BarChart3,
  Percent,
  Building,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { 
  IncomeSource, 
  PaycheckAllocation, 
  PayCycleSummary, 
  BudgetPod 
} from '../../types/financial';

interface IncomeAllocationProps {
  incomeSources: IncomeSource[];
  paycheckAllocations: PaycheckAllocation[];
  budgetPods: BudgetPod[];
  payCycleSummary?: PayCycleSummary;
  onAddIncomeSource: (source: Omit<IncomeSource, 'id' | 'createdDate' | 'lastModified'>) => void;
  onUpdateIncomeSource: (id: string, updates: Partial<IncomeSource>) => void;
  onDeleteIncomeSource: (id: string) => void;
  onCreatePaycheckAllocation: (allocation: Omit<PaycheckAllocation, 'id'>) => void;
  onUpdatePaycheckAllocation: (id: string, updates: Partial<PaycheckAllocation>) => void;
}

const INCOME_TYPES = [
  { value: 'salary', label: 'Salary', icon: Building, description: 'Regular salary from employer' },
  { value: 'hourly', label: 'Hourly Wages', icon: Clock, description: 'Hourly employment income' },
  { value: 'contract', label: 'Contract Work', icon: User, description: '1099 contractor income' },
  { value: 'freelance', label: 'Freelance', icon: User, description: 'Freelance project income' },
  { value: 'side_hustle', label: 'Side Hustle', icon: TrendingUp, description: 'Secondary income source' },
  { value: 'passive', label: 'Passive Income', icon: DollarSign, description: 'Investments, dividends, etc.' },
  { value: 'other', label: 'Other Income', icon: Wallet, description: 'Other income sources' },
];

const PAY_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', description: '52 payments/year' },
  { value: 'biweekly', label: 'Bi-weekly', description: '26 payments/year' },
  { value: 'monthly', label: 'Monthly', description: '12 payments/year' },
  { value: 'quarterly', label: 'Quarterly', description: '4 payments/year' },
  { value: 'yearly', label: 'Yearly', description: '1 payment/year' },
  { value: 'irregular', label: 'Irregular', description: 'Variable schedule' },
];

export const IncomeAllocation = ({
  incomeSources,
  paycheckAllocations,
  budgetPods,
  payCycleSummary,
  onAddIncomeSource,
  onUpdateIncomeSource,
  onDeleteIncomeSource,
  onCreatePaycheckAllocation,
  onUpdatePaycheckAllocation,
}: IncomeAllocationProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);
  const [selectedPaycheck, setSelectedPaycheck] = useState<PaycheckAllocation | null>(null);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const activeIncome = incomeSources.filter(s => s.isActive);
    const monthlyGross = activeIncome.reduce((sum, source) => {
      switch (source.frequency) {
        case 'weekly': return sum + (source.grossAmount * 4.33);
        case 'biweekly': return sum + (source.grossAmount * 2.17);
        case 'monthly': return sum + source.grossAmount;
        case 'quarterly': return sum + (source.grossAmount / 3);
        case 'yearly': return sum + (source.grossAmount / 12);
        default: return sum;
      }
    }, 0);

    const monthlyNet = activeIncome.reduce((sum, source) => {
      switch (source.frequency) {
        case 'weekly': return sum + (source.netAmount * 4.33);
        case 'biweekly': return sum + (source.netAmount * 2.17);
        case 'monthly': return sum + source.netAmount;
        case 'quarterly': return sum + (source.netAmount / 3);
        case 'yearly': return sum + (source.netAmount / 12);
        default: return sum;
      }
    }, 0);

    const totalPodTargets = budgetPods
      .filter(p => p.isActive)
      .reduce((sum, pod) => sum + pod.monthlyAmount, 0);

    const allocationCoverage = monthlyNet > 0 ? (totalPodTargets / monthlyNet) * 100 : 0;

    return {
      totalSources: incomeSources.length,
      activeSources: activeIncome.length,
      monthlyGross,
      monthlyNet,
      totalDeductions: monthlyGross - monthlyNet,
      totalPodTargets,
      remainingAfterPods: monthlyNet - totalPodTargets,
      allocationCoverage,
      taxRate: monthlyGross > 0 ? ((monthlyGross - monthlyNet) / monthlyGross) * 100 : 0,
    };
  }, [incomeSources, budgetPods]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const getNextPayDate = (source: IncomeSource) => {
    if (source.payDates.length > 0) {
      const nextDate = new Date(source.payDates[0]);
      return nextDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: nextDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
      });
    }
    return 'Not scheduled';
  };

  const IncomeSourceCard = ({ source }: { source: IncomeSource }) => {
    const TypeIcon = INCOME_TYPES.find(t => t.value === source.type)?.icon || Wallet;
    const frequency = PAY_FREQUENCIES.find(f => f.value === source.frequency);

    return (
      <Card className={`transition-all hover:shadow-md ${!source.isActive ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TypeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{source.name}</CardTitle>
                <CardDescription>
                  {frequency?.label} • {source.employer || 'Self-employed'}
                </CardDescription>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setEditingIncome(source);
                  setShowIncomeForm(true);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Source
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateIncomeSource(source.id, { isActive: !source.isActive })}>
                  {source.isActive ? 'Pause' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => onDeleteIncomeSource(source.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Gross Amount</p>
              <p className="text-xl font-semibold">{formatCurrency(source.grossAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Amount</p>
              <p className="text-xl font-semibold text-green-600">{formatCurrency(source.netAmount)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tax Rate</span>
              <span>{formatPercent(((source.grossAmount - source.netAmount) / source.grossAmount) * 100)}</span>
            </div>
            <Progress 
              value={((source.grossAmount - source.netAmount) / source.grossAmount) * 100} 
              className="h-2" 
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Next Pay: {getNextPayDate(source)}</span>
            </div>
            {!source.isActive && (
              <Badge variant="secondary">Paused</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const PaycheckAllocationCard = ({ allocation }: { allocation: PaycheckAllocation }) => {
    const source = incomeSources.find(s => s.id === allocation.incomeSourceId);
    const totalAllocated = allocation.podAllocations.reduce((sum, p) => sum + p.amount, 0);
    const fixedExpensesTotal = allocation.fixedExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {source?.name} Paycheck
              </CardTitle>
              <CardDescription>
                {new Date(allocation.payDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </div>
            <Badge variant={allocation.isProcessed ? "default" : "outline"}>
              {allocation.isProcessed ? 'Processed' : 'Planned'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">Net Pay</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(allocation.netAmount)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">To Pods</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(totalAllocated)}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-800">Remaining</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(allocation.remainingAmount)}</p>
            </div>
          </div>

          {allocation.podAllocations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Pod Allocations</h4>
              {allocation.podAllocations.map((podAlloc) => {
                const pod = budgetPods.find(p => p.id === podAlloc.podId);
                return (
                  <div key={podAlloc.podId} className="flex justify-between items-center text-sm">
                    <span>{pod?.name || 'Unknown Pod'}</span>
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(podAlloc.amount)}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatPercent(podAlloc.percentage)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {allocation.fixedExpenses.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Fixed Expenses</h4>
              {allocation.fixedExpenses.map((expense, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{expense.name}</span>
                  <span>{formatCurrency(expense.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Income & Allocation</h2>
          <p className="text-muted-foreground">
            Map your paychecks to budget pods and track cash flow
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAllocationForm(true)}>
            <Calculator className="w-4 h-4 mr-2" />
            Plan Paycheck
          </Button>
          <Button onClick={() => setShowIncomeForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Income
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(summary.monthlyNet)}</div>
            <p className="text-xs text-muted-foreground">Monthly Net</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(summary.totalPodTargets)}</div>
            <p className="text-xs text-muted-foreground">Pod Targets</p>
          </CardContent>
        </Card>
        
        <Card className={summary.remainingAfterPods < 0 ? 'border-red-300' : 'border-green-300'}>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${summary.remainingAfterPods < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(summary.remainingAfterPods)}
            </div>
            <p className="text-xs text-muted-foreground">After Pods</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatPercent(summary.allocationCoverage)}</div>
            <p className="text-xs text-muted-foreground">Coverage</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summary.activeSources}</div>
            <p className="text-xs text-muted-foreground">Income Sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Income Sources</TabsTrigger>
          <TabsTrigger value="allocations">Paychecks</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {payCycleSummary ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Current Pay Cycle Summary
                </CardTitle>
                <CardDescription>
                  {new Date(payCycleSummary.startDate).toLocaleDateString()} - {new Date(payCycleSummary.endDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Total Income</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(payCycleSummary.totalIncome)}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Allocated</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(payCycleSummary.totalAllocated)}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">Fixed Expenses</p>
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(payCycleSummary.totalFixedExpenses)}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">Remaining</p>
                    <p className="text-xl font-bold text-purple-600">{formatCurrency(payCycleSummary.totalRemaining)}</p>
                  </div>
                </div>

                {payCycleSummary.podFunding.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Pod Funding Status</h4>
                    {payCycleSummary.podFunding.map((funding) => {
                      const pod = budgetPods.find(p => p.id === funding.podId);
                      const progress = (funding.allocatedAmount / funding.targetAmount) * 100;
                      
                      return (
                        <div key={funding.podId} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">{pod?.name}</span>
                            <div className="flex items-center gap-2">
                              <span>{formatCurrency(funding.allocatedAmount)} / {formatCurrency(funding.targetAmount)}</span>
                              {funding.isFunded ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <PieChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Pay Cycle Data</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding income sources and planning paycheck allocations
                </p>
                <Button onClick={() => setShowIncomeForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Income Source
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Income Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          {incomeSources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Income Sources</h3>
                <p className="text-muted-foreground mb-4">
                  Add your paychecks, freelance income, and other sources
                </p>
                <Button onClick={() => setShowIncomeForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Income Source
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {incomeSources.map((source) => (
                <IncomeSourceCard key={source.id} source={source} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Paycheck Allocations Tab */}
        <TabsContent value="allocations" className="space-y-4">
          {paycheckAllocations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calculator className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Paycheck Allocations</h3>
                <p className="text-muted-foreground mb-4">
                  Plan how to allocate your paychecks to budget pods
                </p>
                <Button onClick={() => setShowAllocationForm(true)}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Plan Your First Paycheck
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {paycheckAllocations
                .sort((a, b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime())
                .map((allocation) => (
                  <PaycheckAllocationCard key={allocation.id} allocation={allocation} />
                ))}
            </div>
          )}
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Advanced Planning Tools</h3>
              <p className="text-muted-foreground">
                Future home for allocation scenarios, goal planning, and optimization tools
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals will be added in the next step */}
      <Dialog open={showIncomeForm} onOpenChange={setShowIncomeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? 'Edit Income Source' : 'Add New Income Source'}
            </DialogTitle>
            <DialogDescription>
              Track your paychecks and other income sources
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            Income source form coming soon...
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAllocationForm} onOpenChange={setShowAllocationForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan Paycheck Allocation</DialogTitle>
            <DialogDescription>
              Allocate your paycheck to budget pods and track remaining funds
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            Paycheck allocation form coming soon...
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};