import { useState, useEffect } from 'react';
import {
  PiggyBank,
  Car,
  Home,
  UtensilsCrossed,
  CreditCard,
  Shield,
  Heart,
  Lightbulb,
  DollarSign,
  Calendar,
  Target,
  Settings,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Bell,
  FileText,
  ChevronDown,
  Sparkles,
  Eye
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import type { BudgetPod } from '../../types/financial';

interface BudgetPodFormProps {
  pod?: BudgetPod;
  onSave: (data: Omit<BudgetPod, 'id' | 'createdDate' | 'lastModified'>) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

// Predefined pod templates for quick setup
const POD_TEMPLATES = [
  {
    name: 'Vehicle Expenses',
    type: 'vehicle',
    description: 'Gas, maintenance, insurance, and car payments',
    monthlyAmount: 400,
    icon: Car,
    color: 'bg-blue-500',
    priority: 2,
  },
  {
    name: 'Rent & Housing',
    type: 'rent',
    description: 'Monthly rent, utilities, and housing costs',
    monthlyAmount: 1200,
    icon: Home,
    color: 'bg-green-500',
    priority: 1,
  },
  {
    name: 'Food & Groceries',
    type: 'food',
    description: 'Groceries, dining out, and food delivery',
    monthlyAmount: 500,
    icon: UtensilsCrossed,
    color: 'bg-orange-500',
    priority: 2,
  },
  {
    name: 'Subscriptions',
    type: 'subscriptions',
    description: 'Streaming, software, and recurring services',
    monthlyAmount: 150,
    icon: CreditCard,
    color: 'bg-purple-500',
    priority: 3,
  },
  {
    name: 'Emergency Fund',
    type: 'emergency',
    description: 'Emergency savings for unexpected expenses',
    monthlyAmount: 300,
    icon: Shield,
    color: 'bg-red-500',
    priority: 1,
    targetAmount: 3000,
  },
  {
    name: 'Entertainment',
    type: 'entertainment',
    description: 'Movies, games, hobbies, and fun activities',
    monthlyAmount: 200,
    icon: Heart,
    color: 'bg-pink-500',
    priority: 4,
  },
];

const POD_TYPES = [
  { value: 'vehicle', label: 'Vehicle', icon: Car, description: 'Car expenses, gas, maintenance' },
  { value: 'rent', label: 'Rent & Housing', icon: Home, description: 'Rent, utilities, housing costs' },
  { value: 'food', label: 'Food & Groceries', icon: UtensilsCrossed, description: 'Groceries and dining' },
  { value: 'subscriptions', label: 'Subscriptions', icon: CreditCard, description: 'Recurring services' },
  { value: 'emergency', label: 'Emergency Fund', icon: Shield, description: 'Emergency savings' },
  { value: 'entertainment', label: 'Entertainment', icon: Heart, description: 'Fun and leisure' },
  { value: 'health', label: 'Health & Fitness', icon: Heart, description: 'Medical and fitness' },
  { value: 'utilities', label: 'Utilities', icon: Lightbulb, description: 'Power, water, internet' },
  { value: 'custom', label: 'Custom Pod', icon: PiggyBank, description: 'Your custom category' },
];

const POD_COLORS = {
  vehicle: 'bg-blue-500',
  rent: 'bg-green-500',
  food: 'bg-orange-500',
  subscriptions: 'bg-purple-500',
  emergency: 'bg-red-500',
  entertainment: 'bg-pink-500',
  health: 'bg-teal-500',
  utilities: 'bg-yellow-500',
  custom: 'bg-gray-500',
};

const PRIORITY_LEVELS = [
  { value: 1, label: 'Critical', description: 'Essential expenses (rent, food)', color: 'text-red-600' },
  { value: 2, label: 'High', description: 'Important but flexible', color: 'text-orange-600' },
  { value: 3, label: 'Medium', description: 'Regular planned expenses', color: 'text-yellow-600' },
  { value: 4, label: 'Low', description: 'Nice to have expenses', color: 'text-blue-600' },
  { value: 5, label: 'Optional', description: 'Luxury or optional expenses', color: 'text-gray-600' },
];

export const BudgetPodForm = ({
  pod,
  onSave,
  onCancel,
  mode = 'create',
}: BudgetPodFormProps) => {
  const [formData, setFormData] = useState<Partial<BudgetPod>>({
    name: '',
    type: 'custom',
    description: '',
    monthlyAmount: 0,
    currentAmount: 0,
    targetAmount: undefined,
    isActive: true,
    autoTransfer: false,
    transferDay: 1,
    priority: 3,
    rolloverUnused: true,
    warningThreshold: undefined,
    notes: '',
    ...pod,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Calculate helpful metrics
  const yearlyAmount = (formData.monthlyAmount || 0) * 12;
  const weeklyAmount = (formData.monthlyAmount || 0) / 4.33;
  const dailyAmount = (formData.monthlyAmount || 0) / 30;
  const targetProgress = formData.targetAmount 
    ? ((formData.currentAmount || 0) / formData.targetAmount) * 100
    : 0;

  const handleTemplateSelect = (template: typeof POD_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      type: template.type as BudgetPod['type'],
      description: template.description,
      monthlyAmount: template.monthlyAmount,
      priority: template.priority as BudgetPod['priority'],
      targetAmount: template.targetAmount,
    }));
    setSelectedTemplate(template.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure required fields and defaults
    const podData = {
      ...formData,
      name: formData.name || 'Unnamed Pod',
      type: formData.type || 'custom',
      monthlyAmount: formData.monthlyAmount || 0,
      currentAmount: formData.currentAmount || 0,
      isActive: formData.isActive !== false,
      autoTransfer: formData.autoTransfer || false,
      priority: formData.priority || 3,
      rolloverUnused: formData.rolloverUnused !== false,
      transferDay: formData.transferDay || 1,
    } as Omit<BudgetPod, 'id' | 'createdDate' | 'lastModified'>;

    onSave(podData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPodIcon = (type: string) => {
    const podType = POD_TYPES.find(t => t.value === type);
    const Icon = podType?.icon || PiggyBank;
    return Icon;
  };

  const getPodColor = (type: string) => {
    return POD_COLORS[type as keyof typeof POD_COLORS] || POD_COLORS.custom;
  };

  const getPriorityColor = (priority: number) => {
    const level = PRIORITY_LEVELS.find(p => p.value === priority);
    return level?.color || 'text-gray-600';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Templates */}
      {mode === 'create' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <Label className="text-sm font-medium">Quick Setup Templates</Label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POD_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <Button
                  key={template.name}
                  type="button"
                  variant={selectedTemplate === template.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <div className={`${template.color} p-2 rounded-lg text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-xs">{template.name}</div>
                    <div className="text-xs opacity-75">{formatCurrency(template.monthlyAmount)}/mo</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Setup</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Basic Setup Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pod Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Pod Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Emergency Fund, Car Expenses, etc."
                required
              />
            </div>

            {/* Pod Type */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="type">Pod Category *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  type: value as BudgetPod['type']
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POD_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div className={`${getPodColor(type.value)} p-1 rounded text-white`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Monthly Amount */}
            <div className="space-y-2">
              <Label htmlFor="monthlyAmount">Monthly Budget *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="monthlyAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthlyAmount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    monthlyAmount: parseFloat(e.target.value) || 0 
                  }))}
                  className="pl-9"
                  placeholder="500.00"
                  required
                />
              </div>
            </div>

            {/* Current Balance */}
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Current Balance</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    currentAmount: parseFloat(e.target.value) || 0 
                  }))}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Goal (Optional)</Label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.targetAmount || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    targetAmount: parseFloat(e.target.value) || undefined 
                  }))}
                  className="pl-9"
                  placeholder="3000.00"
                />
              </div>
            </div>

            {/* Priority Level */}
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select
                value={formData.priority?.toString()}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  priority: parseInt(value) as BudgetPod['priority']
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      <div>
                        <div className={`font-medium ${level.color}`}>{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What this pod is for and how you plan to use it..."
              rows={2}
            />
          </div>

          {/* Budget Breakdown */}
          {(formData.monthlyAmount || 0) > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-3">Budget Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Monthly</p>
                  <p className="font-semibold">{formatCurrency(formData.monthlyAmount || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weekly</p>
                  <p className="font-semibold">{formatCurrency(weeklyAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Daily</p>
                  <p className="font-semibold">{formatCurrency(dailyAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Yearly</p>
                  <p className="font-semibold">{formatCurrency(yearlyAmount)}</p>
                </div>
              </div>
              
              {formData.targetAmount && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress to Goal</span>
                    <span>{targetProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(targetProgress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          {/* Auto Transfer */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <ArrowRight className="w-5 h-5 text-blue-500" />
              <div>
                <Label className="font-medium">Auto Transfer</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically transfer money to this pod each month
                </p>
              </div>
            </div>
            <Switch
              checked={formData.autoTransfer}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                autoTransfer: checked 
              }))}
            />
          </div>

          {/* Transfer Day */}
          {formData.autoTransfer && (
            <div className="space-y-2">
              <Label htmlFor="transferDay">Transfer Day of Month</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="transferDay"
                  type="number"
                  min="1"
                  max="28"
                  value={formData.transferDay}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    transferDay: parseInt(e.target.value) || 1 
                  }))}
                  className="pl-9"
                  placeholder="15"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Day of the month to automatically transfer {formatCurrency(formData.monthlyAmount || 0)}
              </p>
            </div>
          )}

          {/* Rollover Settings */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-green-500" />
              <div>
                <Label className="font-medium">Rollover Unused Funds</Label>
                <p className="text-sm text-muted-foreground">
                  Keep unused money in the pod for next month
                </p>
              </div>
            </div>
            <Switch
              checked={formData.rolloverUnused}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                rolloverUnused: checked 
              }))}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <Label className="font-medium">Pod Active</Label>
                <p className="text-sm text-muted-foreground">
                  Include this pod in budgeting and calculations
                </p>
              </div>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                isActive: checked 
              }))}
            />
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          {/* Warning Threshold */}
          <div className="space-y-2">
            <Label htmlFor="warningThreshold">Low Balance Warning</Label>
            <div className="relative">
              <Bell className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="warningThreshold"
                type="number"
                step="0.01"
                min="0"
                value={formData.warningThreshold || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  warningThreshold: parseFloat(e.target.value) || undefined 
                }))}
                className="pl-9"
                placeholder="50.00"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Get notified when pod balance drops below this amount
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Special instructions, reminders, or planning notes..."
              rows={3}
            />
          </div>

          {/* Pod Preview */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Pod Preview
            </h4>
            <div className="flex items-center gap-3">
              <div className={`${getPodColor(formData.type || 'custom')} p-3 rounded-lg text-white`}>
                {(() => {
                  const Icon = getPodIcon(formData.type || 'custom');
                  return <Icon className="w-5 h-5" />;
                })()}
              </div>
              <div className="flex-1">
                <h5 className="font-semibold">{formData.name || 'Unnamed Pod'}</h5>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(formData.monthlyAmount || 0)}/month
                  {formData.targetAmount && ` • Goal: ${formatCurrency(formData.targetAmount)}`}
                </p>
                <div className="flex gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(formData.priority || 3)}`}
                  >
                    Priority {formData.priority}
                  </Badge>
                  {formData.autoTransfer && (
                    <Badge variant="secondary" className="text-xs">
                      Auto Transfer
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          {mode === 'create' ? 'Create Budget Pod' : 'Update Pod'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};