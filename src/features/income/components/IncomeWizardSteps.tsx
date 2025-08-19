// Income Wizard Step Components - Enhanced implementations
// Complete step-by-step components for the Income Setup Wizard

import { useState, useMemo } from 'react';
import {
  Calendar,
  DollarSign,
  Building,
  Clock,
  User,
  Coffee,
  TrendingUp,
  Briefcase,
  PiggyBank,
  Car,
  Home,
  UtensilsCrossed,
  CreditCard,
  Shield,
  Heart,
  Lightbulb,
  Target,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Info,
  Calculator,
  Percent,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  Zap,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/utils/cn';

// Income Templates
export const INCOME_TEMPLATES = [
  {
    type: 'salary',
    title: 'Full-Time Salary',
    icon: Building,
    frequency: 'biweekly',
    description: 'Regular paycheck from employer',
    suggestedDeductions: { taxes: 25, benefits: 5, retirement: 6 },
    color: 'bg-blue-500',
  },
  {
    type: 'hourly',
    title: 'Hourly Wages',
    icon: Clock,
    frequency: 'weekly',
    description: 'Paid by the hour',
    suggestedDeductions: { taxes: 22, benefits: 3, retirement: 4 },
    color: 'bg-green-500',
  },
  {
    type: 'contract',
    title: '1099 Contractor',
    icon: Briefcase,
    frequency: 'monthly',
    description: 'Self-employed contractor',
    suggestedDeductions: { taxes: 30, benefits: 0, retirement: 10 },
    color: 'bg-purple-500',
  },
  {
    type: 'freelance',
    title: 'Freelance/Gig Work',
    icon: User,
    frequency: 'irregular',
    description: 'Project-based income',
    suggestedDeductions: { taxes: 25, benefits: 0, retirement: 5 },
    color: 'bg-orange-500',
  },
  {
    type: 'side_hustle',
    title: 'Side Business',
    icon: Coffee,
    frequency: 'monthly',
    description: 'Additional income stream',
    suggestedDeductions: { taxes: 20, benefits: 0, retirement: 0 },
    color: 'bg-yellow-500',
  },
  {
    type: 'passive',
    title: 'Investment Income',
    icon: TrendingUp,
    frequency: 'quarterly',
    description: 'Dividends, rental, etc.',
    suggestedDeductions: { taxes: 15, benefits: 0, retirement: 0 },
    color: 'bg-teal-500',
  },
];

// Budget Pod Templates
export const POD_TEMPLATES = [
  { 
    type: 'rent', 
    name: 'Rent/Mortgage', 
    icon: Home, 
    suggestedPercent: 30, 
    priority: 5 as const, 
    color: 'bg-green-500',
    description: 'Housing payments and rent'
  },
  { 
    type: 'food', 
    name: 'Food & Groceries', 
    icon: UtensilsCrossed, 
    suggestedPercent: 12, 
    priority: 4 as const, 
    color: 'bg-orange-500',
    description: 'Groceries and dining out'
  },
  { 
    type: 'vehicle', 
    name: 'Transportation', 
    icon: Car, 
    suggestedPercent: 15, 
    priority: 4 as const, 
    color: 'bg-blue-500',
    description: 'Car payment, gas, maintenance'
  },
  { 
    type: 'utilities', 
    name: 'Utilities', 
    icon: Lightbulb, 
    suggestedPercent: 8, 
    priority: 5 as const, 
    color: 'bg-yellow-500',
    description: 'Electric, water, internet, phone'
  },
  { 
    type: 'subscriptions', 
    name: 'Subscriptions', 
    icon: CreditCard, 
    suggestedPercent: 5, 
    priority: 2 as const, 
    color: 'bg-purple-500',
    description: 'Netflix, Spotify, software subscriptions'
  },
  { 
    type: 'emergency', 
    name: 'Emergency Fund', 
    icon: Shield, 
    suggestedPercent: 10, 
    priority: 5 as const, 
    color: 'bg-red-500',
    description: '3-6 months of expenses'
  },
  { 
    type: 'entertainment', 
    name: 'Entertainment', 
    icon: Heart, 
    suggestedPercent: 5, 
    priority: 1 as const, 
    color: 'bg-pink-500',
    description: 'Movies, games, hobbies'
  },
  { 
    type: 'health', 
    name: 'Health & Fitness', 
    icon: Heart, 
    suggestedPercent: 5, 
    priority: 3 as const, 
    color: 'bg-teal-500',
    description: 'Gym, medical, supplements'
  },
  { 
    type: 'custom', 
    name: 'Savings Goal', 
    icon: Target, 
    suggestedPercent: 10, 
    priority: 3 as const, 
    color: 'bg-gray-500',
    description: 'Custom savings target'
  },
];

// Pay Frequencies
export const PAY_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', description: '52 payments/year', thursdayExample: 'Every Thursday' },
  { value: 'biweekly', label: 'Bi-weekly', description: '26 payments/year', thursdayExample: 'Every other Thursday' },
  { value: 'monthly', label: 'Monthly', description: '12 payments/year', thursdayExample: 'First Thursday of month' },
  { value: 'quarterly', label: 'Quarterly', description: '4 payments/year', thursdayExample: 'First Thursday of quarter' },
  { value: 'yearly', label: 'Yearly', description: '1 payment/year', thursdayExample: 'Once per year' },
  { value: 'irregular', label: 'Irregular', description: 'Variable schedule', thursdayExample: 'As needed' },
];

interface StepProps {
  data: any;
  onUpdate: (updates: any) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

// Schedule Step Component
export const ScheduleStep = ({ 
  sources, 
  settings, 
  onUpdateSettings, 
  onUpdatePayDates 
}: {
  sources: any[];
  settings: any;
  onUpdateSettings: (updates: any) => void;
  onUpdatePayDates: (sourceIndex: number, dates: string[]) => void;
}) => {
  const [selectedSchedule, setSelectedSchedule] = useState(settings.paySchedulePreference || 'thursday');
  
  const generatePayDates = (frequency: string, startDate?: Date) => {
    const dates: string[] = [];
    const start = startDate || new Date();
    
    // Find next Thursday if not thursday preference
    if (selectedSchedule === 'thursday') {
      const nextThursday = new Date(start);
      const daysUntilThursday = (4 - start.getDay() + 7) % 7;
      nextThursday.setDate(start.getDate() + daysUntilThursday);
      
      // Generate next 8 pay dates based on frequency
      for (let i = 0; i < 8; i++) {
        const payDate = new Date(nextThursday);
        
        switch (frequency) {
          case 'weekly':
            payDate.setDate(nextThursday.getDate() + (i * 7));
            break;
          case 'biweekly':
            payDate.setDate(nextThursday.getDate() + (i * 14));
            break;
          case 'monthly':
            payDate.setMonth(nextThursday.getMonth() + i);
            break;
          case 'quarterly':
            payDate.setMonth(nextThursday.getMonth() + (i * 3));
            break;
        }
        
        dates.push(payDate.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Configure Pay Schedule</h2>
        <p className="text-muted-foreground">
          Set up your payday preferences for optimal budget timing
        </p>
      </div>

      {/* Pay Day Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Pay Day Preference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedSchedule}
            onValueChange={(value) => {
              setSelectedSchedule(value);
              onUpdateSettings({ paySchedulePreference: value });
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="thursday" id="thursday" />
                <Label htmlFor="thursday" className="flex-1">
                  <div>
                    <p className="font-medium">Thursday Paychecks</p>
                    <p className="text-sm text-muted-foreground">
                      Optimized for weekly Thursday payments (recommended)
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="friday" id="friday" />
                <Label htmlFor="friday" className="flex-1">
                  <div>
                    <p className="font-medium">Friday Paychecks</p>
                    <p className="text-sm text-muted-foreground">
                      Traditional end-of-week payments
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="flex-1">
                  <div>
                    <p className="font-medium">Custom Schedule</p>
                    <p className="text-sm text-muted-foreground">
                      Set your own pay dates
                    </p>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Income Source Schedule Configuration */}
      {sources.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pay Dates for Each Income Source</h3>
          {sources.map((source, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">{source.name}</CardTitle>
                <CardDescription>
                  {PAY_FREQUENCIES.find(f => f.value === source.frequency)?.label} • {PAY_FREQUENCIES.find(f => f.value === source.frequency)?.thursdayExample}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Next Pay Date</Label>
                    <Input
                      type="date"
                      value={source.payDates?.[0] || ''}
                      onChange={(e) => {
                        const newDates = generatePayDates(source.frequency, new Date(e.target.value));
                        onUpdatePayDates(index, newDates);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Upcoming Dates</Label>
                    <div className="text-sm text-muted-foreground">
                      {(source.payDates || []).slice(1, 4).map((date: string) => (
                        <div key={date}>{new Date(date).toLocaleDateString()}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Buffer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Budget Buffer
          </CardTitle>
          <CardDescription>
            Add a safety margin to prevent overspending
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Buffer Percentage</Label>
              <Badge variant="outline">{settings.bufferPercentage}%</Badge>
            </div>
            <Slider
              value={[settings.bufferPercentage]}
              onValueChange={([value]) => onUpdateSettings({ bufferPercentage: value })}
              max={20}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground mt-1">
              Recommended: 10% buffer for unexpected expenses
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-allocate to pods</Label>
              <p className="text-sm text-muted-foreground">Automatically distribute income to budget pods</p>
            </div>
            <Switch
              checked={settings.autoAllocate}
              onCheckedChange={(checked) => onUpdateSettings({ autoAllocate: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Expenses Step Component  
export const ExpensesStep = ({ 
  expenses, 
  monthlyIncome, 
  onAddExpense, 
  onUpdateExpense, 
  onRemoveExpense 
}: {
  expenses: any[];
  monthlyIncome: number;
  onAddExpense: (expense: any) => void;
  onUpdateExpense: (index: number, updates: any) => void;
  onRemoveExpense: (index: number) => void;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: 0,
    category: 'rent',
    dueDay: 1,
  });

  const expenseCategories = [
    { value: 'rent', label: 'Rent/Mortgage' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'loan', label: 'Loan Payment' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'other', label: 'Other' },
  ];

  const commonExpenses = [
    { name: 'Rent', amount: Math.round(monthlyIncome * 0.3), category: 'rent' },
    { name: 'Electric Bill', amount: 150, category: 'utilities' },
    { name: 'Internet', amount: 80, category: 'utilities' },
    { name: 'Phone', amount: 60, category: 'utilities' },
    { name: 'Car Insurance', amount: 120, category: 'insurance' },
    { name: 'Health Insurance', amount: 200, category: 'insurance' },
  ];

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensePercent = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;

  const handleAddExpense = () => {
    if (newExpense.name && newExpense.amount > 0) {
      onAddExpense(newExpense);
      setNewExpense({ name: '', amount: 0, category: 'rent', dueDay: 1 });
      setShowForm(false);
    }
  };

  const addCommonExpense = (expense: typeof commonExpenses[0]) => {
    onAddExpense({ ...expense, dueDay: 1 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Fixed Monthly Expenses</h2>
        <p className="text-muted-foreground">
          Add your regular monthly bills and commitments
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Fixed Expenses</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold">{expensePercent.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">of Income</p>
            </div>
          </div>
          <Progress value={expensePercent} className="mt-4" />
          {expensePercent > 50 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Fixed expenses are over 50% of income. Consider reducing expenses or increasing income.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Add Common Expenses */}
      {expenses.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Add Common Expenses</CardTitle>
            <CardDescription>Click to add typical monthly expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonExpenses.map((expense, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => addCommonExpense(expense)}
                  className="justify-start"
                >
                  ${expense.amount} {expense.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Fixed Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.map((expense, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{expense.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {expenseCategories.find(c => c.value === expense.category)?.label} • Due: {expense.dueDay}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={expense.amount}
                      onChange={(e) => onUpdateExpense(index, { amount: parseFloat(e.target.value) || 0 })}
                      className="w-24"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveExpense(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Expense */}
      <Card>
        <CardHeader>
          <Button
            variant="outline"
            onClick={() => setShowForm(!showForm)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Expense
          </Button>
        </CardHeader>
        {showForm && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Expense Name</Label>
                <Input
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                  placeholder="e.g., Rent, Electric Bill"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Amount</Label>
                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddExpense} className="flex-1">
                  Add Expense
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// Continue with other step components...
export const PodsStep = ({ pods, availableAmount, onAddPod, onUpdatePod, onRemovePod }: any) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold mb-2">Create Budget Pods</h2>
      <p className="text-muted-foreground">
        Organize your available income into purpose-driven savings buckets
      </p>
    </div>

    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">${availableAmount.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Available for Budget Pods</p>
        </div>
      </CardContent>
    </Card>

    {pods.length === 0 ? (
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Budget Pods</CardTitle>
          <CardDescription>Select the categories that matter to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {POD_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const suggestedAmount = (availableAmount * template.suggestedPercent) / 100;
              
              return (
                <Card
                  key={template.type}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onAddPod(template)}
                >
                  <CardContent className="pt-6 text-center">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3", template.color)}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-2">
                      {template.description}
                    </p>
                    <div className="space-y-1">
                      <Badge variant="outline">${suggestedAmount.toFixed(0)}/mo</Badge>
                      <p className="text-xs text-muted-foreground">{template.suggestedPercent}% suggested</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Budget Pods</h3>
        <div className="space-y-3">
          {pods.map((pod: any, index: number) => {
            const template = POD_TEMPLATES.find(t => t.type === pod.type);
            const Icon = template?.icon || PiggyBank;
            
            return (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", pod.color || 'bg-gray-500')}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{pod.name}</p>
                        <p className="text-sm text-muted-foreground">{pod.percentage}% of available income</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={pod.monthlyAmount}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          const percentage = availableAmount > 0 ? (amount / availableAmount) * 100 : 0;
                          onUpdatePod(index, { monthlyAmount: amount, percentage });
                        }}
                        className="w-24"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemovePod(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          onClick={() => {
            // Find unselected templates
            const availableTemplates = POD_TEMPLATES.filter(
              template => !pods.some((pod: any) => pod.type === template.type)
            );
            if (availableTemplates.length > 0) {
              onAddPod(availableTemplates[0]);
            }
          }}
          className="w-full"
          disabled={pods.length >= POD_TEMPLATES.length}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Pod
        </Button>
      </div>
    )}
  </div>
);

export const AllocationStep = ({ pods, calculations, onUpdatePods }: any) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold mb-2">Fine-tune Allocation</h2>
      <p className="text-muted-foreground">
        Adjust percentages to match your priorities
      </p>
    </div>

    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold">${calculations.totalMonthlyIncome.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Monthly Income</p>
          </div>
          <div>
            <p className="text-xl font-bold">${calculations.totalPodAllocation.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Pod Allocation</p>
          </div>
          <div>
            <p className="text-xl font-bold">${calculations.remainingUnallocated.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Remaining</p>
          </div>
        </div>
        <Progress value={Math.min((calculations.totalPodAllocation / calculations.availableForPods) * 100, 100)} className="mt-4" />
      </CardContent>
    </Card>

    <div className="space-y-4">
      {pods.map((pod: any, index: number) => {
        const template = POD_TEMPLATES.find(t => t.type === pod.type);
        const Icon = template?.icon || PiggyBank;
        
        return (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", pod.color)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{pod.name}</span>
                  </div>
                  <Badge variant="outline">${pod.monthlyAmount.toFixed(2)}</Badge>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Allocation Percentage</Label>
                    <span className="text-sm font-medium">{pod.percentage.toFixed(1)}%</span>
                  </div>
                  <Slider
                    value={[pod.percentage]}
                    onValueChange={([percentage]) => {
                      const amount = (calculations.availableForPods * percentage) / 100;
                      const updatedPods = [...pods];
                      updatedPods[index] = { ...pod, percentage, monthlyAmount: amount };
                      onUpdatePods(updatedPods);
                    }}
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

export const ReviewStep = ({ data, calculations }: any) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold mb-2">Review Your Setup</h2>
      <p className="text-muted-foreground">
        Review your configuration before completing setup
      </p>
    </div>

    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Income Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Monthly Income:</span>
              <span className="font-semibold">${calculations.totalMonthlyIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fixed Expenses:</span>
              <span className="font-semibold">${calculations.totalFixedExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Available for Pods:</span>
              <span className="font-semibold">${calculations.availableForPods.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Weekly Set-aside:</span>
              <span className="font-semibold text-green-600">${calculations.weeklyWithBuffer.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Budget Pods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.budgetPods.map((pod: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span>{pod.name}:</span>
                <span className="font-semibold">${pod.monthlyAmount.toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between">
              <span>Total Allocation:</span>
              <span className="font-semibold">${calculations.totalPodAllocation.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Setup Complete Badge */}
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h3 className="text-xl font-semibold">Setup Complete!</h3>
          <p className="text-muted-foreground">
            Your personalized budget system is ready to use. You'll need to set aside{' '}
            <span className="font-semibold text-green-600">${calculations.weeklyWithBuffer.toFixed(2)}</span>{' '}
            each Thursday to fund all your budget pods.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);