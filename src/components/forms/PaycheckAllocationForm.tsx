import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Calculator,
  PieChart,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Percent,
  Wallet,
  Target,
  Calendar,
  Building,
  Clock,
  TrendingUp,
  User,
  PiggyBank,
  Briefcase
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import type { 
  PaycheckAllocation, 
  IncomeSource, 
  BudgetPod 
} from '../../types/financial';

interface PaycheckAllocationFormProps {
  incomeSource?: IncomeSource;
  budgetPods: BudgetPod[];
  allocation?: PaycheckAllocation;
  onSave: (data: Omit<PaycheckAllocation, 'id'>) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent/Mortgage', icon: Building },
  { value: 'utilities', label: 'Utilities', icon: Wallet },
  { value: 'insurance', label: 'Insurance', icon: Briefcase },
  { value: 'debt', label: 'Debt Payment', icon: TrendingUp },
  { value: 'savings', label: 'Savings', icon: PiggyBank },
  { value: 'other', label: 'Other', icon: DollarSign },
];

const INCOME_TYPE_ICONS = {
  salary: Building,
  hourly: Clock,
  contract: Briefcase,
  freelance: User,
  side_hustle: TrendingUp,
  passive: PiggyBank,
  other: DollarSign,
};

export const PaycheckAllocationForm = ({
  incomeSource,
  budgetPods,
  allocation,
  onSave,
  onCancel,
  mode = 'create',
}: PaycheckAllocationFormProps) => {
  const [formData, setFormData] = useState<Partial<PaycheckAllocation>>({
    incomeSourceId: incomeSource?.id || '',
    payDate: '',
    grossAmount: incomeSource?.grossAmount || 0,
    netAmount: incomeSource?.netAmount || 0,
    podAllocations: [],
    fixedExpenses: [],
    remainingAmount: incomeSource?.netAmount || 0,
    isPlanned: true,
    isProcessed: false,
    notes: '',
    ...allocation,
  });

  const [activeTab, setActiveTab] = useState('allocate');
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState(0);
  const [newExpenseCategory, setNewExpenseCategory] = useState<string>('other');

  // Calculate derived values
  const activePods = useMemo(() => budgetPods.filter(pod => pod.isActive), [budgetPods]);
  
  const totalPodAllocations = useMemo(() => {
    return formData.podAllocations?.reduce((sum, allocation) => sum + allocation.amount, 0) || 0;
  }, [formData.podAllocations]);

  const totalFixedExpenses = useMemo(() => {
    return formData.fixedExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  }, [formData.fixedExpenses]);

  const remainingAfterAllocations = useMemo(() => {
    return (formData.netAmount || 0) - totalPodAllocations - totalFixedExpenses;
  }, [formData.netAmount, totalPodAllocations, totalFixedExpenses]);

  const allocationPercentage = useMemo(() => {
    const net = formData.netAmount || 0;
    return net > 0 ? (totalPodAllocations / net) * 100 : 0;
  }, [totalPodAllocations, formData.netAmount]);

  // Update remaining amount when calculations change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      remainingAmount: remainingAfterAllocations,
    }));
  }, [remainingAfterAllocations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  const getIncomeIcon = (type: string) => {
    return INCOME_TYPE_ICONS[type as keyof typeof INCOME_TYPE_ICONS] || DollarSign;
  };

  const handlePodAllocationChange = (podId: string, amount: number) => {
    const net = formData.netAmount || 0;
    const percentage = net > 0 ? (amount / net) * 100 : 0;

    setFormData(prev => ({
      ...prev,
      podAllocations: [
        ...(prev.podAllocations?.filter(p => p.podId !== podId) || []),
        { podId, amount, percentage },
      ].filter(p => p.amount > 0), // Remove zero allocations
    }));
  };

  const handleRemovePodAllocation = (podId: string) => {
    setFormData(prev => ({
      ...prev,
      podAllocations: prev.podAllocations?.filter(p => p.podId !== podId) || [],
    }));
  };

  const handleAddFixedExpense = () => {
    if (!newExpenseName || newExpenseAmount <= 0) return;

    setFormData(prev => ({
      ...prev,
      fixedExpenses: [
        ...(prev.fixedExpenses || []),
        {
          name: newExpenseName,
          amount: newExpenseAmount,
          category: newExpenseCategory as any,
        },
      ],
    }));

    // Reset form
    setNewExpenseName('');
    setNewExpenseAmount(0);
    setNewExpenseCategory('other');
  };

  const handleRemoveFixedExpense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleAutoAllocate = () => {
    const net = formData.netAmount || 0;
    const availableAfterExpenses = net - totalFixedExpenses;
    
    if (availableAfterExpenses <= 0) return;

    // Get total monthly amounts for active pods
    const totalMonthlyTargets = activePods.reduce((sum, pod) => sum + pod.monthlyAmount, 0);
    
    if (totalMonthlyTargets === 0) return;

    // Proportionally allocate based on monthly targets
    const allocations = activePods.map(pod => {
      const proportion = pod.monthlyAmount / totalMonthlyTargets;
      const amount = Math.round(availableAfterExpenses * proportion * 100) / 100;
      const percentage = net > 0 ? (amount / net) * 100 : 0;
      
      return { podId: pod.id, amount, percentage };
    }).filter(a => a.amount > 0);

    setFormData(prev => ({
      ...prev,
      podAllocations: allocations,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!incomeSource?.id) {
      alert('Please select an income source');
      return;
    }

    const allocationData: Omit<PaycheckAllocation, 'id'> = {
      incomeSourceId: incomeSource.id,
      payDate: formData.payDate || new Date().toISOString().split('T')[0],
      grossAmount: formData.grossAmount || 0,
      netAmount: formData.netAmount || 0,
      podAllocations: formData.podAllocations || [],
      fixedExpenses: formData.fixedExpenses || [],
      remainingAmount: remainingAfterAllocations,
      isPlanned: formData.isPlanned !== false,
      isProcessed: formData.isProcessed || false,
      notes: formData.notes,
    };

    onSave(allocationData);
  };

  const getAllocatedAmount = (podId: string) => {
    return formData.podAllocations?.find(a => a.podId === podId)?.amount || 0;
  };

  const IncomeIcon = incomeSource ? getIncomeIcon(incomeSource.type) : Wallet;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header - Income Source Info */}
      {incomeSource && (
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <IncomeIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{incomeSource.name}</h3>
                <p className="text-muted-foreground">
                  {formatCurrency(incomeSource.netAmount)} net • {incomeSource.frequency}
                </p>
                <p className="text-sm text-muted-foreground">
                  {incomeSource.employer}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pay Date */}
      <div className="space-y-2">
        <Label htmlFor="payDate">Pay Date *</Label>
        <Input
          id="payDate"
          type="date"
          value={formData.payDate}
          onChange={(e) => setFormData(prev => ({ ...prev, payDate: e.target.value }))}
          required
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(formData.netAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Net Pay</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalPodAllocations)}
            </div>
            <p className="text-xs text-muted-foreground">To Pods</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalFixedExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">Fixed Expenses</p>
          </CardContent>
        </Card>
        
        <Card className={remainingAfterAllocations < 0 ? 'border-red-300' : 'border-green-300'}>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${remainingAfterAllocations < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(remainingAfterAllocations)}
            </div>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Allocation Progress</span>
            <Badge variant="outline">{formatPercent(allocationPercentage)}</Badge>
          </div>
          <Progress value={Math.min(allocationPercentage, 100)} className="h-3" />
          {allocationPercentage > 100 && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Over-allocated by {formatPercent(allocationPercentage - 100)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="allocate">Allocate to Pods</TabsTrigger>
          <TabsTrigger value="expenses">Fixed Expenses</TabsTrigger>
          <TabsTrigger value="summary">Review</TabsTrigger>
        </TabsList>

        {/* Pod Allocation Tab */}
        <TabsContent value="allocate" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Budget Pod Allocations</h3>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAutoAllocate}
              disabled={activePods.length === 0}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Auto-Allocate
            </Button>
          </div>

          {activePods.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <PiggyBank className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">No Active Budget Pods</h4>
                <p className="text-muted-foreground">
                  Create some budget pods first to allocate your paycheck
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activePods.map((pod) => {
                const allocated = getAllocatedAmount(pod.id);
                const percentage = formData.netAmount ? (allocated / formData.netAmount) * 100 : 0;
                
                return (
                  <Card key={pod.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{pod.icon}</div>
                          <div>
                            <h4 className="font-semibold">{pod.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Target: {formatCurrency(pod.monthlyAmount)}/month
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Current: {formatCurrency(pod.currentAmount)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(allocated)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatPercent(percentage)}
                            </div>
                          </div>
                          {allocated > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePodAllocation(pod.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`pod-${pod.id}`}>Allocation Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`pod-${pod.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            max={formData.netAmount}
                            value={allocated}
                            onChange={(e) => handlePodAllocationChange(pod.id, parseFloat(e.target.value) || 0)}
                            className="pl-9"
                            placeholder="0.00"
                          />
                        </div>
                        
                        {/* Quick Allocation Buttons */}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handlePodAllocationChange(pod.id, pod.monthlyAmount)}
                          >
                            Full Target
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handlePodAllocationChange(pod.id, pod.monthlyAmount / 4)}
                          >
                            Weekly (1/4)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handlePodAllocationChange(pod.id, 0)}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Fixed Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Fixed Expenses</h3>
          </div>

          {/* Add New Expense */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Fixed Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-name">Expense Name</Label>
                  <Input
                    id="expense-name"
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    placeholder="Rent, Car Insurance, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(parseFloat(e.target.value) || 0)}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expense-category">Category</Label>
                  <Select value={newExpenseCategory} onValueChange={setNewExpenseCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {category.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                type="button"
                onClick={handleAddFixedExpense}
                disabled={!newExpenseName || newExpenseAmount <= 0}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardContent>
          </Card>

          {/* Expense List */}
          {formData.fixedExpenses && formData.fixedExpenses.length > 0 && (
            <div className="space-y-3">
              {formData.fixedExpenses.map((expense, index) => {
                const category = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
                const Icon = category?.icon || DollarSign;
                
                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{expense.name}</h4>
                            <p className="text-sm text-muted-foreground">{category?.label}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFixedExpense(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Paycheck Allocation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Allocation Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold">Pod Allocations</h4>
                {formData.podAllocations && formData.podAllocations.length > 0 ? (
                  formData.podAllocations.map((allocation) => {
                    const pod = budgetPods.find(p => p.id === allocation.podId);
                    return (
                      <div key={allocation.podId} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{pod?.icon}</span>
                          <span>{pod?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{formatCurrency(allocation.amount)}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatPercent(allocation.percentage)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground">No pod allocations</p>
                )}
              </div>

              {/* Fixed Expenses */}
              {formData.fixedExpenses && formData.fixedExpenses.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Fixed Expenses</h4>
                  {formData.fixedExpenses.map((expense, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{expense.name}</span>
                      <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Final Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Net Pay</span>
                  <span className="font-semibold">{formatCurrency(formData.netAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Total Pod Allocations</span>
                  <span className="font-semibold">-{formatCurrency(totalPodAllocations)}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Total Fixed Expenses</span>
                  <span className="font-semibold">-{formatCurrency(totalFixedExpenses)}</span>
                </div>
                <div className={`flex justify-between text-lg font-bold border-t pt-2 ${
                  remainingAfterAllocations < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  <span>Remaining</span>
                  <span>{formatCurrency(remainingAfterAllocations)}</span>
                </div>
              </div>

              {/* Validation Messages */}
              {remainingAfterAllocations < 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Over-allocated</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    You've allocated {formatCurrency(Math.abs(remainingAfterAllocations))} more than your net pay. 
                    Please adjust your allocations.
                  </p>
                </div>
              )}

              {remainingAfterAllocations > (formData.netAmount || 0) * 0.1 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Large Amount Unallocated</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    You have {formatCurrency(remainingAfterAllocations)} unallocated. 
                    Consider adding it to your budget pods or emergency fund.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this paycheck allocation..."
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1"
          disabled={remainingAfterAllocations < 0}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {mode === 'create' ? 'Create Allocation Plan' : 'Update Allocation Plan'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};