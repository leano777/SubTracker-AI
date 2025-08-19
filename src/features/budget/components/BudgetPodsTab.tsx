// Budget Pods Tab - Integrated with Income Setup Wizard
// Complete budget management with guided setup

import { useState, useEffect, useMemo } from 'react';
import {
  PiggyBank,
  Plus,
  Settings,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Calculator
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { BudgetPods } from './BudgetPods';
import { PodAllocationManager } from './PodAllocationManager';
import { IncomeSetupWizard } from '../../income/components/IncomeSetupWizard';
import { useFinancialStore } from '../../../stores/useFinancialStore';
import type { BudgetPod, IncomeSource, PaycheckAllocation } from '../../../types/financial';
import { cn } from '../../../utils/cn';

interface BudgetPodsTabProps {
  className?: string;
}

export const BudgetPodsTab = ({ className }: BudgetPodsTabProps) => {
  const [showIncomeWizard, setShowIncomeWizard] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  // Mock financial store data (in real app, use actual store)
  const [budgetPods, setBudgetPods] = useState<BudgetPod[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [paycheckAllocations, setPaycheckAllocations] = useState<PaycheckAllocation[]>([]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const totalIncome = incomeSources.reduce((sum, source) => {
      let monthly = source.netAmount;
      switch (source.frequency) {
        case 'weekly':
          monthly = source.netAmount * 52 / 12;
          break;
        case 'biweekly':
          monthly = source.netAmount * 26 / 12;
          break;
        case 'yearly':
          monthly = source.netAmount / 12;
          break;
        case 'quarterly':
          monthly = source.netAmount * 4 / 12;
          break;
      }
      return sum + monthly;
    }, 0);

    const totalPodAllocation = budgetPods.reduce((sum, pod) => sum + pod.monthlyAmount, 0);
    const activePods = budgetPods.filter(p => p.isActive);
    const totalBalance = activePods.reduce((sum, pod) => sum + pod.currentAmount, 0);
    
    return {
      totalIncome,
      totalPodAllocation,
      totalBalance,
      activePods: activePods.length,
      allocationPercent: totalIncome > 0 ? (totalPodAllocation / totalIncome) * 100 : 0,
      remainingIncome: totalIncome - totalPodAllocation,
    };
  }, [budgetPods, incomeSources]);

  // Check if setup is needed
  const needsSetup = incomeSources.length === 0 || budgetPods.length === 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle Income Wizard completion
  const handleWizardComplete = (data: {
    incomeSources: Omit<IncomeSource, 'id' | 'createdDate' | 'lastModified'>[];
    budgetPods: Omit<BudgetPod, 'id' | 'createdDate' | 'lastModified'>[];
    allocations: Omit<PaycheckAllocation, 'id'>[];
  }) => {
    // Transform and save data
    const newIncomeSources: IncomeSource[] = data.incomeSources.map((source, index) => ({
      ...source,
      id: `income_${Date.now()}_${index}`,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }));

    const newBudgetPods: BudgetPod[] = data.budgetPods.map((pod, index) => ({
      ...pod,
      id: `pod_${Date.now()}_${index}`,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      contributions: [],
      withdrawals: [],
    }));

    setIncomeSources(newIncomeSources);
    setBudgetPods(newBudgetPods);
    setShowIncomeWizard(false);
    
    // Show success message
    console.log('✅ Budget setup complete!', { newIncomeSources, newBudgetPods });
  };

  // Budget pod handlers
  const handleAddPod = (pod: Omit<BudgetPod, 'id' | 'createdDate' | 'lastModified'>) => {
    const newPod: BudgetPod = {
      ...pod,
      id: `pod_${Date.now()}`,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      contributions: [],
      withdrawals: [],
    };
    setBudgetPods(prev => [...prev, newPod]);
  };

  const handleUpdatePod = (id: string, updates: Partial<BudgetPod>) => {
    setBudgetPods(prev => prev.map(pod => 
      pod.id === id 
        ? { ...pod, ...updates, lastModified: new Date().toISOString() }
        : pod
    ));
  };

  const handleDeletePod = (id: string) => {
    setBudgetPods(prev => prev.filter(pod => pod.id !== id));
  };

  const handleAddFunds = (id: string, amount: number, note?: string) => {
    setBudgetPods(prev => prev.map(pod => {
      if (pod.id === id) {
        const contribution = {
          date: new Date().toISOString(),
          amount,
          note: note || 'Manual addition',
        };
        return {
          ...pod,
          currentAmount: pod.currentAmount + amount,
          contributions: [...(pod.contributions || []), contribution],
          lastModified: new Date().toISOString(),
        };
      }
      return pod;
    }));
  };

  const handleWithdrawFunds = (id: string, amount: number, reason: string) => {
    setBudgetPods(prev => prev.map(pod => {
      if (pod.id === id && pod.currentAmount >= amount) {
        const withdrawal = {
          date: new Date().toISOString(),
          amount,
          reason,
        };
        return {
          ...pod,
          currentAmount: pod.currentAmount - amount,
          withdrawals: [...(pod.withdrawals || []), withdrawal],
          lastModified: new Date().toISOString(),
        };
      }
      return pod;
    }));
  };

  // Income source handlers (simplified for demo)
  const handleAddIncomeSource = (source: Omit<IncomeSource, 'id' | 'createdDate' | 'lastModified'>) => {
    const newSource: IncomeSource = {
      ...source,
      id: `income_${Date.now()}`,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setIncomeSources(prev => [...prev, newSource]);
  };

  const handleUpdateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
    setIncomeSources(prev => prev.map(source => 
      source.id === id 
        ? { ...source, ...updates, lastModified: new Date().toISOString() }
        : source
    ));
  };

  const handleDeleteIncomeSource = (id: string) => {
    setIncomeSources(prev => prev.filter(source => source.id !== id));
  };

  const handleCreatePaycheckAllocation = (allocation: Omit<PaycheckAllocation, 'id'>) => {
    const newAllocation: PaycheckAllocation = {
      ...allocation,
      id: `allocation_${Date.now()}`,
    };
    setPaycheckAllocations(prev => [...prev, newAllocation]);
  };

  const handleUpdatePaycheckAllocation = (id: string, updates: Partial<PaycheckAllocation>) => {
    setPaycheckAllocations(prev => prev.map(allocation => 
      allocation.id === id ? { ...allocation, ...updates } : allocation
    ));
  };

  if (needsSetup) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Setup Required Card */}
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Set Up Your Budget Pods</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Get started with our guided setup wizard to create your personalized budget allocation system.
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setShowIncomeWizard(true)}
                  size="lg"
                  className="gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Start Setup Wizard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSetupGuide(true)}
                  size="lg"
                >
                  <Info className="w-4 h-4" />
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <DollarSign className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-semibold mb-1">Income Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track multiple income sources with automatic calculations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <PiggyBank className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-semibold mb-1">Smart Allocation</h3>
              <p className="text-sm text-muted-foreground">
                Organize money into purpose-driven budget pods
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <Calendar className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="font-semibold mb-1">Thursday Paychecks</h3>
              <p className="text-sm text-muted-foreground">
                Optimized for weekly Thursday paycheck schedules
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Guide Dialog */}
        <Dialog open={showSetupGuide} onOpenChange={setShowSetupGuide}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Budget Pods Overview</DialogTitle>
              <DialogDescription>
                Learn how Budget Pods can transform your financial organization
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">What are Budget Pods?</h4>
                <p className="text-sm text-muted-foreground">
                  Budget Pods are purpose-driven savings buckets that help you organize your money 
                  for specific expenses like rent, food, emergency fund, and subscriptions.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">How it works:</h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Add your income sources</li>
                  <li>2. Create budget pods for your expenses</li>
                  <li>3. Set up automatic allocations</li>
                  <li>4. Track and manage your money flow</li>
                </ol>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  The setup wizard takes just 5 minutes and provides smart suggestions 
                  based on your income level.
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>

        {/* Income Setup Wizard */}
        <IncomeSetupWizard
          open={showIncomeWizard}
          onClose={() => setShowIncomeWizard(false)}
          onComplete={handleWizardComplete}
          existingIncome={incomeSources}
          existingPods={budgetPods}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Budget Pods</h2>
          <p className="text-muted-foreground">
            Organize your finances with purpose-driven savings buckets
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowIncomeWizard(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Setup Wizard
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">Monthly Income</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(summary.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">Pod Balances</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summary.activePods}</div>
            <p className="text-xs text-muted-foreground">Active Pods</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{Math.round(summary.allocationPercent)}%</div>
            <p className="text-xs text-muted-foreground">Income Allocated</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {summary.remainingIncome > 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>Unallocated Income</AlertTitle>
          <AlertDescription>
            You have {formatCurrency(summary.remainingIncome)} in unallocated income. 
            Consider creating additional budget pods or increasing existing allocations.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="pods" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pods">
            <PiggyBank className="w-4 h-4 mr-2" />
            Budget Pods
          </TabsTrigger>
          <TabsTrigger value="allocation">
            <Calculator className="w-4 h-4 mr-2" />
            Allocation Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pods" className="space-y-4">
          <BudgetPods
            budgetPods={budgetPods}
            incomeSources={incomeSources}
            paycheckAllocations={paycheckAllocations}
            onAddPod={handleAddPod}
            onUpdatePod={handleUpdatePod}
            onDeletePod={handleDeletePod}
            onAddFunds={handleAddFunds}
            onWithdrawFunds={handleWithdrawFunds}
            onAddIncomeSource={handleAddIncomeSource}
            onUpdateIncomeSource={handleUpdateIncomeSource}
            onDeleteIncomeSource={handleDeleteIncomeSource}
            onCreatePaycheckAllocation={handleCreatePaycheckAllocation}
            onUpdatePaycheckAllocation={handleUpdatePaycheckAllocation}
          />
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          {incomeSources.length > 0 && budgetPods.length > 0 ? (
            <PodAllocationManager
              incomeSources={incomeSources}
              budgetPods={budgetPods}
              onUpdatePod={handleUpdatePod}
              onCreateAllocation={handleCreatePaycheckAllocation}
            />
          ) : (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertTitle>Setup Required</AlertTitle>
              <AlertDescription>
                Please add income sources and budget pods using the Setup Wizard before managing allocations.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Income Setup Wizard */}
      <IncomeSetupWizard
        open={showIncomeWizard}
        onClose={() => setShowIncomeWizard(false)}
        onComplete={handleWizardComplete}
        existingIncome={incomeSources}
        existingPods={budgetPods}
      />
    </div>
  );
};