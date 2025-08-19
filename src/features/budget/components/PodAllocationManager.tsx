// Pod Allocation Manager - Connects income sources to budget pods
// Implements automatic weekly allocation from Thursday paychecks

import { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  PiggyBank,
  TrendingUp,
  Calendar,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Zap,
  Target,
  Clock,
  Percent,
  Calculator,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BudgetPod, IncomeSource, PaycheckAllocation } from '@/types/financial';
import { cn } from '@/utils/cn';

interface PodAllocationManagerProps {
  incomeSources: IncomeSource[];
  budgetPods: BudgetPod[];
  onUpdatePod: (id: string, updates: Partial<BudgetPod>) => void;
  onCreateAllocation: (allocation: Omit<PaycheckAllocation, 'id'>) => void;
}

export const PodAllocationManager = ({
  incomeSources,
  budgetPods,
  onUpdatePod,
  onCreateAllocation
}: PodAllocationManagerProps) => {
  const [allocationMode, setAllocationMode] = useState<'percentage' | 'fixed'>('percentage');
  const [simulationDate, setSimulationDate] = useState(new Date());
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate total monthly income
  const monthlyIncome = useMemo(() => {
    return incomeSources.reduce((sum, source) => {
      if (!source.isActive) return sum;
      
      let monthly = source.netAmount;
      switch (source.frequency) {
        case 'weekly':
          monthly = source.netAmount * 4.33;
          break;
        case 'biweekly':
          monthly = source.netAmount * 2.17;
          break;
        case 'yearly':
          monthly = source.netAmount / 12;
          break;
        case 'quarterly':
          monthly = source.netAmount / 3;
          break;
      }
      return sum + monthly;
    }, 0);
  }, [incomeSources]);

  // Calculate weekly allocation for Thursday system
  const weeklyAllocation = useMemo(() => {
    const yearlyIncome = monthlyIncome * 12;
    return yearlyIncome / 52;
  }, [monthlyIncome]);

  // Calculate pod allocations
  const podAllocations = useMemo(() => {
    const totalPercentage = budgetPods.reduce((sum, pod) => sum + (pod.percentage || 0), 0);
    const totalFixed = budgetPods.reduce((sum, pod) => sum + pod.monthlyAmount, 0);

    return budgetPods.map(pod => {
      let allocatedAmount = 0;
      
      if (allocationMode === 'percentage') {
        allocatedAmount = (monthlyIncome * (pod.percentage || 0)) / 100;
      } else {
        allocatedAmount = pod.monthlyAmount;
      }

      const weeklyAmount = (allocatedAmount * 12) / 52;
      const isFunded = pod.currentAmount >= pod.monthlyAmount;
      const fundingProgress = pod.monthlyAmount > 0 
        ? (pod.currentAmount / pod.monthlyAmount) * 100 
        : 0;

      return {
        ...pod,
        allocatedAmount,
        weeklyAmount,
        isFunded,
        fundingProgress,
        shortage: Math.max(0, pod.monthlyAmount - pod.currentAmount)
      };
    });
  }, [budgetPods, monthlyIncome, allocationMode]);

  // Sort pods by priority
  const sortedPods = useMemo(() => {
    return [...podAllocations].sort((a, b) => a.priority - b.priority);
  }, [podAllocations]);

  // Calculate allocation summary
  const allocationSummary = useMemo(() => {
    const totalAllocated = podAllocations.reduce((sum, pod) => sum + pod.allocatedAmount, 0);
    const unallocated = monthlyIncome - totalAllocated;
    const allocationPercentage = monthlyIncome > 0 ? (totalAllocated / monthlyIncome) * 100 : 0;

    return {
      totalAllocated,
      unallocated,
      allocationPercentage,
      isOverAllocated: totalAllocated > monthlyIncome,
      weeklyRequired: (totalAllocated * 12) / 52
    };
  }, [podAllocations, monthlyIncome]);

  // Handle percentage adjustment
  const handlePercentageChange = (podId: string, newPercentage: number) => {
    onUpdatePod(podId, { percentage: newPercentage });
  };

  // Handle fixed amount change
  const handleAmountChange = (podId: string, newAmount: number) => {
    onUpdatePod(podId, { monthlyAmount: newAmount });
  };

  // Auto-balance percentages
  const autoBalancePercentages = () => {
    const activePods = budgetPods.filter(pod => pod.isActive);
    if (activePods.length === 0) return;

    const equalPercentage = Math.floor(100 / activePods.length);
    const remainder = 100 - (equalPercentage * activePods.length);

    activePods.forEach((pod, index) => {
      const percentage = equalPercentage + (index === 0 ? remainder : 0);
      onUpdatePod(pod.id, { percentage });
    });
  };

  // Optimize based on priorities
  const optimizeByPriority = () => {
    const sortedByPriority = [...budgetPods].sort((a, b) => a.priority - b.priority);
    let remainingPercentage = 100;
    
    // High priority pods get more allocation
    const priorityWeights = [40, 30, 20, 10]; // Percentages for priority levels
    
    sortedByPriority.forEach((pod, index) => {
      const weight = priorityWeights[Math.min(index, priorityWeights.length - 1)];
      const allocation = Math.min(weight, remainingPercentage);
      onUpdatePod(pod.id, { percentage: allocation });
      remainingPercentage -= allocation;
    });
  };

  // Create Thursday paycheck allocation
  const createThursdayAllocation = () => {
    const nextThursday = getNextThursday(new Date());
    
    const allocation: Omit<PaycheckAllocation, 'id'> = {
      incomeSourceId: incomeSources[0]?.id || '',
      payDate: nextThursday.toISOString(),
      grossAmount: weeklyAllocation / 0.7, // Estimate gross from net
      netAmount: weeklyAllocation,
      podAllocations: sortedPods.map(pod => ({
        podId: pod.id,
        amount: pod.weeklyAmount,
        percentage: pod.percentage || 0
      })),
      fixedExpenses: [],
      remainingAmount: allocationSummary.unallocated / 4.33,
      isPlanned: true,
      isProcessed: false
    };

    onCreateAllocation(allocation);
  };

  // Get next Thursday
  const getNextThursday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (4 - day + 7) % 7 || 7; // 4 is Thursday
    d.setDate(d.getDate() + diff);
    return d;
  };

  return (
    <div className="space-y-6">
      {/* Income Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Income & Allocation Overview
          </CardTitle>
          <CardDescription>
            Manage how your income flows into budget pods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">
                ${monthlyIncome.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">After taxes & deductions</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Weekly Allocation</p>
              <p className="text-2xl font-bold text-blue-600">
                ${weeklyAllocation.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Thursday paycheck system</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Allocation Status</p>
              <p className={cn(
                "text-2xl font-bold",
                allocationSummary.isOverAllocated ? "text-red-600" : "text-green-600"
              )}>
                {allocationSummary.allocationPercentage.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {allocationSummary.isOverAllocated ? "Over-allocated" : "Of income allocated"}
              </p>
            </div>
          </div>

          {/* Allocation Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Allocation Progress</span>
              <span className={cn(
                allocationSummary.isOverAllocated && "text-red-600 font-semibold"
              )}>
                ${allocationSummary.totalAllocated.toFixed(2)} / ${monthlyIncome.toFixed(2)}
              </span>
            </div>
            <Progress 
              value={Math.min(100, allocationSummary.allocationPercentage)} 
              className={cn(
                "h-3",
                allocationSummary.isOverAllocated && "[&>div]:bg-red-600"
              )}
            />
            {allocationSummary.isOverAllocated && (
              <Alert className="mt-3 border-red-200 bg-red-50">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  You've allocated ${Math.abs(allocationSummary.unallocated).toFixed(2)} more than your income.
                  Consider adjusting pod amounts or percentages.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Allocation Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Pod Allocation Settings
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={autoBalancePercentages}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Auto-Balance
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={optimizeByPriority}
              >
                <Zap className="w-4 h-4 mr-1" />
                Optimize
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={allocationMode} onValueChange={(v) => setAllocationMode(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="percentage">
                <Percent className="w-4 h-4 mr-2" />
                Percentage Based
              </TabsTrigger>
              <TabsTrigger value="fixed">
                <DollarSign className="w-4 h-4 mr-2" />
                Fixed Amounts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="percentage" className="space-y-4 mt-6">
              {sortedPods.map((pod) => (
                <div key={pod.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        pod.color || "bg-gray-100"
                      )}>
                        <PiggyBank className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{pod.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Priority {pod.priority} • ${pod.allocatedAmount.toFixed(2)}/mo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold min-w-[60px] text-right">
                        {pod.percentage}%
                      </span>
                      {pod.isFunded && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Funded
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="pl-13">
                    <Slider
                      value={[pod.percentage || 0]}
                      onValueChange={([value]) => handlePercentageChange(pod.id, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Weekly: ${pod.weeklyAmount.toFixed(2)}</span>
                      <span>Current: ${pod.currentAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="fixed" className="space-y-4 mt-6">
              {sortedPods.map((pod) => (
                <div key={pod.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        pod.color || "bg-gray-100"
                      )}>
                        <PiggyBank className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{pod.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Priority {pod.priority}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">$</span>
                        <input
                          type="number"
                          value={pod.monthlyAmount}
                          onChange={(e) => handleAmountChange(pod.id, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border rounded text-right font-semibold"
                        />
                      </div>
                      {pod.isFunded && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Funded
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="pl-13">
                    <Progress value={pod.fundingProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Weekly: ${pod.weeklyAmount.toFixed(2)}</span>
                      <span>{pod.shortage > 0 && `Needs: $${pod.shortage.toFixed(2)}`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {/* Advanced Options */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="advanced" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Show Advanced Options
              </Label>
              <Switch 
                id="advanced"
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
            </div>

            {showAdvanced && (
              <div className="space-y-4 mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label>Auto-Transfer on Thursdays</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically allocate funds to pods every Thursday
                  </p>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Overflow Handling</Label>
                  <p className="text-sm text-muted-foreground">
                    What to do with unallocated funds
                  </p>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option>Add to Emergency Fund</option>
                    <option>Distribute to All Pods</option>
                    <option>Keep in Checking</option>
                  </select>
                </div>

                <Button 
                  className="w-full"
                  onClick={createThursdayAllocation}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Next Thursday Allocation
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unallocated Funds Alert */}
      {allocationSummary.unallocated > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription>
            <strong>${allocationSummary.unallocated.toFixed(2)}</strong> of your monthly income is unallocated.
            Consider adding it to savings or emergency funds.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};