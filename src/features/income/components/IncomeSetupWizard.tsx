// Income Setup Wizard - Clean and Simple UX
// Streamlined step-by-step income and budget configuration with improved usability

import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  PieChart,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Wallet,
  Target,
  Clock,
  Building,
  User,
  Sparkles,
  Info,
  X,
  ChevronRight,
  ChevronLeft,
  Shield,
  Home,
  Car,
  UtensilsCrossed,
  CreditCard,
  Heart,
  Lightbulb,
  PiggyBank,
  Percent,
  Gift,
  Briefcase,
  Coffee,
  Zap,
  Trophy,
  ChevronDown,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/utils/cn';
import type { IncomeSource, BudgetPod, PaycheckAllocation } from '@/types/financial';
// Import enhanced step components
import {
  INCOME_TEMPLATES as IMPORTED_INCOME_TEMPLATES,
  POD_TEMPLATES as IMPORTED_POD_TEMPLATES,
  PAY_FREQUENCIES,
  ScheduleStep,
  ExpensesStep,
  PodsStep,
  AllocationStep,
  ReviewStep
} from './IncomeWizardSteps';

interface IncomeSetupWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: {
    incomeSources: Omit<IncomeSource, 'id' | 'createdDate' | 'lastModified'>[];
    budgetPods: Omit<BudgetPod, 'id' | 'createdDate' | 'lastModified'>[];
    allocations: Omit<PaycheckAllocation, 'id'>[];
  }) => void;
  existingIncome?: IncomeSource[];
  existingPods?: BudgetPod[];
}

// Wizard steps
const WIZARD_STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'income', title: 'Income', icon: DollarSign },
  { id: 'schedule', title: 'Pay Schedule', icon: Calendar },
  { id: 'expenses', title: 'Fixed Expenses', icon: Building },
  { id: 'pods', title: 'Budget Pods', icon: PiggyBank },
  { id: 'allocation', title: 'Allocation', icon: PieChart },
  { id: 'review', title: 'Review', icon: CheckCircle },
];

// Use imported templates with proper names
const INCOME_TEMPLATES = IMPORTED_INCOME_TEMPLATES;
const POD_TEMPLATES = IMPORTED_POD_TEMPLATES;

export const IncomeSetupWizard = ({
  open,
  onClose,
  onComplete,
  existingIncome = [],
  existingPods = [],
}: IncomeSetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    // Income sources
    incomeSources: [] as Array<{
      name: string;
      type: string;
      frequency: string;
      grossAmount: number;
      netAmount: number;
      employer?: string;
      taxes: number;
      benefits: number;
      retirement: number;
      otherDeductions: number;
      payDates: string[];
      isActive: boolean;
      inputType: 'gross' | 'net';
      actualPaychecks?: Array<{
        date: string;
        actualAmount: number;
        note?: string;
      }>;
    }>,
    // Fixed expenses
    fixedExpenses: [] as Array<{
      name: string;
      amount: number;
      category: string;
      dueDay?: number;
    }>,
    // Budget pods
    budgetPods: [] as Array<{
      name: string;
      type: string;
      monthlyAmount: number;
      percentage: number;
      priority: number;
      autoTransfer: boolean;
      warningThreshold?: number;
      color?: string;
      icon?: string;
    }>,
    // Settings
    settings: {
      paySchedulePreference: 'thursday' as const,
      customPayDay: undefined,
      bufferPercentage: 10,
      autoAllocate: true,
      rolloverUnused: true,
    },
  });

  // Calculate totals and available amounts
  const calculations = useMemo(() => {
    const totalMonthlyIncome = wizardData.incomeSources.reduce((sum, source) => {
      let monthly = source.netAmount;
      switch (source.frequency) {
        case 'weekly':
          monthly = source.netAmount * 4.33; // More accurate weekly to monthly conversion
          break;
        case 'biweekly':
          monthly = source.netAmount * 2.17; // More accurate bi-weekly to monthly conversion  
          break;
        case 'yearly':
          monthly = source.netAmount / 12;
          break;
        case 'quarterly':
          monthly = source.netAmount / 3;
          break;
        case 'monthly':
          monthly = source.netAmount;
          break;
        default:
          monthly = source.netAmount;
      }
      return sum + monthly;
    }, 0);

    const totalFixedExpenses = wizardData.fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const availableForPods = totalMonthlyIncome - totalFixedExpenses;
    const totalPodAllocation = wizardData.budgetPods.reduce((sum, pod) => sum + pod.monthlyAmount, 0);
    const remainingUnallocated = availableForPods - totalPodAllocation;
    
    // Calculate weekly set-aside for Thursday paychecks
    const weeklySetAside = (totalFixedExpenses + totalPodAllocation) * 12 / 52;
    const weeklyWithBuffer = weeklySetAside * (1 + wizardData.settings.bufferPercentage / 100);

    return {
      totalMonthlyIncome,
      totalFixedExpenses,
      availableForPods,
      totalPodAllocation,
      remainingUnallocated,
      weeklySetAside,
      weeklyWithBuffer,
      savingsRate: totalMonthlyIncome > 0 
        ? ((totalPodAllocation - totalFixedExpenses) / totalMonthlyIncome) * 100 
        : 0,
    };
  }, [wizardData]);

  // Step validation
  const isStepValid = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'welcome':
        return true;
      case 'income':
        return wizardData.incomeSources.length > 0 && 
               wizardData.incomeSources.every(s => s.grossAmount > 0);
      case 'schedule':
        return true; // Schedule is optional
      case 'expenses':
        return true; // Expenses are optional
      case 'pods':
        return wizardData.budgetPods.length > 0;
      case 'allocation':
        return calculations.remainingUnallocated >= -100; // Allow small negative
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const getStepError = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'income':
        if (wizardData.incomeSources.length === 0) {
          return 'Please add at least one income source';
        }
        if (wizardData.incomeSources.some(s => s.grossAmount <= 0)) {
          return 'Please enter a valid income amount';
        }
        break;
      case 'pods':
        if (wizardData.budgetPods.length === 0) {
          return 'Please select at least one budget pod';
        }
        break;
      case 'allocation':
        if (calculations.remainingUnallocated < -100) {
          return 'You\'ve over-allocated your income. Please adjust your pod amounts.';
        }
        break;
    }
    return null;
  };

  // Step navigation
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Transform wizard data to proper types
    const incomeSources = wizardData.incomeSources.map(source => ({
      ...source,
      type: source.type as any,
      frequency: source.frequency as any,
    }));

    const budgetPods = wizardData.budgetPods.map(pod => ({
      ...pod,
      type: pod.type as any,
      description: `Managed by Income Wizard`,
      currentAmount: 0,
      isActive: true,
      rolloverUnused: wizardData.settings.rolloverUnused,
      contributions: [],
      withdrawals: [],
      priority: pod.priority as 1 | 2 | 3 | 4 | 5,
    }));

    // Create initial allocations
    const allocations = incomeSources.map(source => ({
      incomeSourceId: '', // Will be set when saved
      payDate: source.payDates[0] || new Date().toISOString(),
      grossAmount: source.grossAmount,
      netAmount: source.netAmount,
      podAllocations: budgetPods.map(pod => ({
        podId: '', // Will be set when saved
        amount: pod.monthlyAmount / 4, // Weekly allocation
        percentage: pod.percentage,
      })),
      fixedExpenses: wizardData.fixedExpenses.map(expense => ({
        name: expense.name,
        amount: expense.amount,
        category: expense.category as any,
      })),
      remainingAmount: calculations.remainingUnallocated,
      isPlanned: true,
      isProcessed: false,
    }));

    onComplete({
      incomeSources,
      budgetPods,
      allocations,
    });
  };

  // Add income source
  const addIncomeSource = (template: typeof INCOME_TEMPLATES[0]) => {
    const newSource = {
      name: template.title,
      type: template.type,
      frequency: template.frequency,
      grossAmount: 0,
      netAmount: 0,
      employer: '',
      taxes: template.suggestedDeductions.taxes,
      benefits: template.suggestedDeductions.benefits,
      retirement: template.suggestedDeductions.retirement,
      otherDeductions: 0,
      payDates: [],
      isActive: true,
      inputType: 'gross' as const,
      actualPaychecks: [],
    };
    
    setWizardData(prev => ({
      ...prev,
      incomeSources: [...prev.incomeSources, newSource],
    }));
  };

  // Add budget pod
  const addBudgetPod = (template: typeof POD_TEMPLATES[0]) => {
    const suggestedAmount = (calculations.availableForPods * template.suggestedPercent) / 100;
    
    const newPod = {
      name: template.name,
      type: template.type,
      monthlyAmount: Math.round(suggestedAmount),
      percentage: template.suggestedPercent,
      priority: template.priority,
      autoTransfer: true,
      warningThreshold: suggestedAmount * 0.3,
      color: template.color,
      icon: template.icon.name,
    };
    
    setWizardData(prev => ({
      ...prev,
      budgetPods: [...prev.budgetPods, newPod],
    }));
  };

  // Render step content
  const renderStepContent = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'welcome':
        return <WelcomeStep />;
      case 'income':
        return (
          <IncomeStep
            sources={wizardData.incomeSources}
            onAddSource={addIncomeSource}
            onUpdateSource={(index: number, updates: any) => {
              const newSources = [...wizardData.incomeSources];
              newSources[index] = { ...newSources[index], ...updates };
              setWizardData(prev => ({ ...prev, incomeSources: newSources }));
            }}
            onRemoveSource={(index: number) => {
              setWizardData(prev => ({
                ...prev,
                incomeSources: prev.incomeSources.filter((_, i) => i !== index),
              }));
            }}
          />
        );
      case 'schedule':
        return (
          <ScheduleStep
            sources={wizardData.incomeSources}
            settings={wizardData.settings}
            onUpdateSettings={(updates) => {
              setWizardData(prev => ({
                ...prev,
                settings: { ...prev.settings, ...updates },
              }));
            }}
            onUpdatePayDates={(sourceIndex, dates) => {
              const newSources = [...wizardData.incomeSources];
              newSources[sourceIndex].payDates = dates;
              setWizardData(prev => ({ ...prev, incomeSources: newSources }));
            }}
          />
        );
      case 'expenses':
        return (
          <ExpensesStep
            expenses={wizardData.fixedExpenses}
            monthlyIncome={calculations.totalMonthlyIncome}
            onAddExpense={(expense) => {
              setWizardData(prev => ({
                ...prev,
                fixedExpenses: [...prev.fixedExpenses, expense],
              }));
            }}
            onUpdateExpense={(index, updates) => {
              const newExpenses = [...wizardData.fixedExpenses];
              newExpenses[index] = { ...newExpenses[index], ...updates };
              setWizardData(prev => ({ ...prev, fixedExpenses: newExpenses }));
            }}
            onRemoveExpense={(index) => {
              setWizardData(prev => ({
                ...prev,
                fixedExpenses: prev.fixedExpenses.filter((_, i) => i !== index),
              }));
            }}
          />
        );
      case 'pods':
        return (
          <PodsStep
            pods={wizardData.budgetPods}
            availableAmount={calculations.availableForPods}
            onAddPod={addBudgetPod}
            onUpdatePod={(index: number, updates: any) => {
              const newPods = [...wizardData.budgetPods];
              newPods[index] = { ...newPods[index], ...updates };
              setWizardData(prev => ({ ...prev, budgetPods: newPods }));
            }}
            onRemovePod={(index: number) => {
              setWizardData(prev => ({
                ...prev,
                budgetPods: prev.budgetPods.filter((_, i) => i !== index),
              }));
            }}
          />
        );
      case 'allocation':
        return (
          <AllocationStep
            pods={wizardData.budgetPods}
            calculations={calculations}
            onUpdatePods={(pods: any) => {
              setWizardData(prev => ({ ...prev, budgetPods: pods }));
            }}
          />
        );
      case 'review':
        return (
          <ReviewStep
            data={wizardData}
            calculations={calculations}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Simplified Header */}
          <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{WIZARD_STEPS[currentStep].title}</h2>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {WIZARD_STEPS.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {WIZARD_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index <= currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
            <Progress 
              value={(currentStep + 1) / WIZARD_STEPS.length * 100} 
              className="mt-3 h-1" 
            />
          </div>

          {/* Simplified Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6">
              {renderStepContent()}
            </div>
          </div>
            
          {/* Mobile-Optimized Footer */}
          <div className="border-t bg-muted/30 p-3 sm:p-4">
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
              {/* Mobile: Back button on bottom, Desktop: Back button on left */}
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2 w-full sm:w-auto order-2 sm:order-1"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
              {/* Mobile: Action buttons on top, Desktop: Action buttons on right */}
              <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
                <Button variant="outline" onClick={onClose} size="sm" className="flex-1 sm:flex-none">
                  Cancel
                </Button>
                
                {currentStep === WIZARD_STEPS.length - 1 ? (
                  <Button onClick={handleComplete} size="lg" className="gap-2 flex-1 sm:flex-none">
                    <Check className="w-4 h-4" />
                    <span className="sm:inline">Complete Setup</span>
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext} 
                    size="lg" 
                    className="gap-2 flex-1 sm:flex-none"
                    disabled={!isStepValid()}
                  >
                    <span className="sm:inline">Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
              
            {/* Validation Error */}
            {!isStepValid() && getStepError() && (
              <div className="mt-3 text-sm text-red-600 text-center bg-red-50 p-2 rounded border border-red-200">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {getStepError()}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Welcome Step Component - Clean and Simple
const WelcomeStep = () => (
  <div className="space-y-8 text-center max-w-lg mx-auto">
    {/* Hero Section */}
    <div>
      <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-3">Let's Set Up Your Budget</h2>
      <p className="text-lg text-muted-foreground">
        In just 5 minutes, we'll create a personalized budget system that works for you
      </p>
    </div>

    {/* What We'll Do */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-left">Here's what we'll set up:</h3>
      
      <div className="space-y-3 text-left">
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
          <DollarSign className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-900">Your Income Sources</p>
            <p className="text-sm text-green-700">Add your paychecks with smart tax calculations</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <PiggyBank className="w-6 h-6 text-blue-600 shrink-0" />
          <div>
            <p className="font-medium text-blue-900">Budget Pods</p>
            <p className="text-sm text-blue-700">Organize money for rent, food, savings, and fun</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <Calendar className="w-6 h-6 text-purple-600 shrink-0" />
          <div>
            <p className="font-medium text-purple-900">Thursday Paycheck Magic</p>
            <p className="text-sm text-purple-700">Perfect timing for your weekly budget cycle</p>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Stats */}
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-2xl font-bold text-primary">5</p>
          <p className="text-xs text-muted-foreground">Minutes</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">7</p>
          <p className="text-xs text-muted-foreground">Easy Steps</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">∞</p>
          <p className="text-xs text-muted-foreground">Peace of Mind</p>
        </div>
      </div>
    </div>
  </div>
);

// Income Step Component - Clean and Simple
const IncomeStep = ({ sources, onAddSource, onUpdateSource, onRemoveSource }: any) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">What's Your Main Income?</h2>
      <p className="text-muted-foreground">
        Choose your primary income type to get started
      </p>
    </div>

    {sources.length === 0 ? (
      <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
        {INCOME_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.type}
              className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
              onClick={() => onAddSource(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    template.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">{template.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    ) : (
      <div className="max-w-xl mx-auto space-y-6">
        {sources.map((source: any, index: number) => (
          <Card key={index} className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  {source.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {PAY_FREQUENCIES.find(f => f.value === source.frequency)?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Flexible Pay Input */}
              <div>
                <Label className="text-base font-medium mb-3 block">How much do you earn?</Label>
                
                {/* Pay Type Selector */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    variant={source.inputType === 'gross' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateSource(index, { inputType: 'gross' })}
                    className="text-sm"
                  >
                    Gross Pay
                  </Button>
                  <Button
                    variant={source.inputType === 'net' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateSource(index, { inputType: 'net' })}
                    className="text-sm"
                  >
                    Take-Home Pay
                  </Button>
                </div>
                
                {/* Pay Frequency Selector for Weekly Option */}
                {source.frequency !== 'weekly' && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Want to enter weekly amount instead?</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateSource(index, { frequency: 'weekly' })}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      Switch to Weekly
                    </Button>
                  </div>
                )}
                
                {/* Amount Input */}
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={source.inputType === 'gross' ? (source.grossAmount || '') : (source.netAmount || '')}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      if (source.inputType === 'gross') {
                        const deductions = amount * ((source.taxes + source.benefits + source.retirement) / 100);
                        onUpdateSource(index, {
                          grossAmount: amount,
                          netAmount: amount - deductions - source.otherDeductions,
                        });
                      } else {
                        // User is entering net pay directly
                        onUpdateSource(index, {
                          netAmount: amount,
                          grossAmount: amount > 0 ? Math.round(amount / (1 - (source.taxes + source.benefits + source.retirement) / 100)) : 0,
                        });
                      }
                    }}
                    placeholder={source.inputType === 'gross' ? 'Enter gross amount' : 'Enter take-home amount'}
                    className="pl-10 text-lg h-12"
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>
                    {source.inputType === 'gross' ? 'Gross' : 'Take-home'} {' '}
                    {source.frequency === 'weekly' ? 'weekly' : 
                     source.frequency === 'biweekly' ? 'bi-weekly' : 
                     source.frequency} amount
                  </span>
                  {source.frequency === 'weekly' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateSource(index, { frequency: 'biweekly' })}
                      className="text-xs text-blue-600 hover:text-blue-800 p-1 h-auto"
                    >
                      Switch to Bi-weekly
                    </Button>
                  )}
                </div>
              </div>

              {/* Pay Summary */}
              {(source.grossAmount > 0 || source.netAmount > 0) && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Gross Pay</span>
                      <p className="text-lg font-bold text-green-600">
                        ${source.grossAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Take-Home</span>
                      <p className="text-lg font-bold text-blue-600">
                        ${source.netAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Deductions: Taxes ({source.taxes}%), Benefits ({source.benefits}%), 401k ({source.retirement}%)
                  </div>
                  
                  {/* Monthly Conversion */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Monthly Take-Home:</span>
                      <span className="font-bold text-blue-700">
                        ${(() => {
                          let monthly = source.netAmount;
                          switch (source.frequency) {
                            case 'weekly': return (monthly * 4.33).toFixed(2);
                            case 'biweekly': return (monthly * 2.17).toFixed(2);
                            case 'monthly': return monthly.toFixed(2);
                            case 'yearly': return (monthly / 12).toFixed(2);
                            case 'quarterly': return (monthly / 3).toFixed(2);
                            default: return monthly.toFixed(2);
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actual Paycheck Tracking */}
              {source.netAmount > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Actual Paycheck Tracking</span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    When you receive your paycheck, you can record the actual amount (including reimbursements, bonuses, etc.)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    onClick={() => {
                      // This would open a modal or expand to add actual paycheck
                      console.log('Add actual paycheck for:', source.name);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Track Actual Paycheck
                  </Button>
                </div>
              )}

              {/* Advanced Options - Collapsible */}
              {source.grossAmount > 0 && (
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-primary">
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    Adjust deductions
                  </summary>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm">Tax %</Label>
                      <Input
                        type="number"
                        value={source.taxes}
                        onChange={(e) => {
                          const taxes = parseFloat(e.target.value) || 0;
                          const gross = source.grossAmount;
                          const deductions = gross * ((taxes + source.benefits + source.retirement) / 100);
                          onUpdateSource(index, {
                            taxes,
                            netAmount: gross - deductions - source.otherDeductions,
                          });
                        }}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Benefits %</Label>
                      <Input
                        type="number"
                        value={source.benefits}
                        onChange={(e) => {
                          const benefits = parseFloat(e.target.value) || 0;
                          const gross = source.grossAmount;
                          const deductions = gross * ((source.taxes + benefits + source.retirement) / 100);
                          onUpdateSource(index, {
                            benefits,
                            netAmount: gross - deductions - source.otherDeductions,
                          });
                        }}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">401k %</Label>
                      <Input
                        type="number"
                        value={source.retirement}
                        onChange={(e) => {
                          const retirement = parseFloat(e.target.value) || 0;
                          const gross = source.grossAmount;
                          const deductions = gross * ((source.taxes + source.benefits + retirement) / 100);
                          onUpdateSource(index, {
                            retirement,
                            netAmount: gross - deductions - source.otherDeductions,
                          });
                        }}
                        className="h-9"
                      />
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        ))}

        {sources.length < 3 && (
          <Button
            variant="outline"
            onClick={() => onAddSource(INCOME_TEMPLATES[0])}
            className="w-full h-12 text-base"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Income Source
          </Button>
        )}
      </div>
    )}
  </div>
);

