import { useState, useEffect } from 'react';
import {
  Building,
  User,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
  Calculator,
  FileText,
  AlertCircle,
  CheckCircle,
  Percent,
  PiggyBank,
  CreditCard,
  Briefcase,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  EyeOff
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { IncomeSource } from '../../types/financial';

interface IncomeSourceFormProps {
  incomeSource?: IncomeSource;
  onSave: (data: Omit<IncomeSource, 'id' | 'createdDate' | 'lastModified'>) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

const INCOME_TYPES = [
  { value: 'salary', label: 'Salary', icon: Building, description: 'Regular salary from employer', color: 'bg-blue-500' },
  { value: 'hourly', label: 'Hourly Wages', icon: Clock, description: 'Hourly employment income', color: 'bg-green-500' },
  { value: 'contract', label: 'Contract Work', icon: Briefcase, description: '1099 contractor income', color: 'bg-purple-500' },
  { value: 'freelance', label: 'Freelance', icon: User, description: 'Freelance project income', color: 'bg-orange-500' },
  { value: 'side_hustle', label: 'Side Hustle', icon: TrendingUp, description: 'Secondary income source', color: 'bg-pink-500' },
  { value: 'passive', label: 'Passive Income', icon: PiggyBank, description: 'Investments, dividends, etc.', color: 'bg-teal-500' },
  { value: 'other', label: 'Other Income', icon: DollarSign, description: 'Other income sources', color: 'bg-gray-500' },
];

const PAY_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', description: '52 payments/year', multiplier: 52 },
  { value: 'biweekly', label: 'Bi-weekly', description: '26 payments/year', multiplier: 26 },
  { value: 'monthly', label: 'Monthly', description: '12 payments/year', multiplier: 12 },
  { value: 'quarterly', label: 'Quarterly', description: '4 payments/year', multiplier: 4 },
  { value: 'yearly', label: 'Yearly', description: '1 payment/year', multiplier: 1 },
  { value: 'irregular', label: 'Irregular', description: 'Variable schedule', multiplier: 12 },
];

const INCOME_TEMPLATES = [
  {
    name: 'Full-time Salary Employee',
    type: 'salary',
    frequency: 'biweekly',
    grossAmount: 2500,
    netAmount: 1800,
    taxes: 500,
    benefits: 150,
    retirement: 50,
    employer: 'Your Company Name',
  },
  {
    name: 'Freelance Developer',
    type: 'freelance',
    frequency: 'irregular',
    grossAmount: 3000,
    netAmount: 2400,
    taxes: 600,
    employer: 'Various Clients',
  },
  {
    name: 'Part-time Hourly',
    type: 'hourly',
    frequency: 'weekly',
    grossAmount: 800,
    netAmount: 650,
    taxes: 120,
    benefits: 30,
    employer: 'Part-time Employer',
  },
];

export const IncomeSourceForm = ({
  incomeSource,
  onSave,
  onCancel,
  mode = 'create',
}: IncomeSourceFormProps) => {
  const [formData, setFormData] = useState<Partial<IncomeSource>>({
    name: '',
    type: 'salary',
    frequency: 'biweekly',
    grossAmount: 0,
    netAmount: 0,
    taxes: 0,
    benefits: 0,
    retirement: 0,
    otherDeductions: 0,
    payDates: [],
    isActive: true,
    employer: '',
    notes: '',
    ...incomeSource,
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [payDateInput, setPayDateInput] = useState('');

  // Calculate derived values
  const totalDeductions = (formData.taxes || 0) + (formData.benefits || 0) + (formData.retirement || 0) + (formData.otherDeductions || 0);
  const calculatedNet = (formData.grossAmount || 0) - totalDeductions;
  const taxRate = formData.grossAmount ? ((formData.taxes || 0) / formData.grossAmount) * 100 : 0;
  const effectiveRate = formData.grossAmount ? (totalDeductions / formData.grossAmount) * 100 : 0;
  
  // Annual calculations
  const frequency = PAY_FREQUENCIES.find(f => f.value === formData.frequency);
  const annualGross = (formData.grossAmount || 0) * (frequency?.multiplier || 1);
  const annualNet = (formData.netAmount || 0) * (frequency?.multiplier || 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  const handleTemplateSelect = (template: typeof INCOME_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      type: template.type as IncomeSource['type'],
      frequency: template.frequency as IncomeSource['frequency'],
      grossAmount: template.grossAmount,
      netAmount: template.netAmount,
      taxes: template.taxes || 0,
      benefits: template.benefits || 0,
      retirement: template.retirement || 0,
      employer: template.employer,
    }));
    setSelectedTemplate(template.name);
  };

  const handleDeductionChange = (field: keyof IncomeSource, value: number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate net if using calculator mode
      if (showCalculator) {
        const newTotalDeductions = (updated.taxes || 0) + (updated.benefits || 0) + (updated.retirement || 0) + (updated.otherDeductions || 0);
        updated.netAmount = (updated.grossAmount || 0) - newTotalDeductions;
      }
      return updated;
    });
  };

  const handleAddPayDate = () => {
    if (!payDateInput) return;
    
    setFormData(prev => ({
      ...prev,
      payDates: [...(prev.payDates || []), payDateInput],
    }));
    setPayDateInput('');
  };

  const handleRemovePayDate = (dateToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      payDates: prev.payDates?.filter(date => date !== dateToRemove) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const incomeData: Omit<IncomeSource, 'id' | 'createdDate' | 'lastModified'> = {
      name: formData.name || 'Unnamed Income Source',
      type: formData.type || 'salary',
      frequency: formData.frequency || 'biweekly',
      grossAmount: formData.grossAmount || 0,
      netAmount: formData.netAmount || 0,
      taxes: formData.taxes,
      benefits: formData.benefits,
      retirement: formData.retirement,
      otherDeductions: formData.otherDeductions,
      payDates: formData.payDates || [],
      isActive: formData.isActive !== false,
      employer: formData.employer,
      notes: formData.notes,
    };

    onSave(incomeData);
  };

  const getTypeIcon = (type: string) => {
    const incomeType = INCOME_TYPES.find(t => t.value === type);
    return incomeType?.icon || DollarSign;
  };

  const getTypeColor = (type: string) => {
    const incomeType = INCOME_TYPES.find(t => t.value === type);
    return incomeType?.color || 'bg-gray-500';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Templates */}
      {mode === 'create' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <Label className="text-sm font-medium">Income Templates</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {INCOME_TEMPLATES.map((template) => (
              <Button
                key={template.name}
                type="button"
                variant={selectedTemplate === template.name ? "default" : "outline"}
                size="sm"
                onClick={() => handleTemplateSelect(template)}
                className="h-auto p-3 flex flex-col items-center gap-2"
              >
                <div className="text-center">
                  <div className="font-semibold text-xs">{template.name}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {formatCurrency(template.netAmount)} net • {PAY_FREQUENCIES.find(f => f.value === template.frequency)?.label}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="amounts">Income & Taxes</TabsTrigger>
          <TabsTrigger value="schedule">Pay Schedule</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Income Source Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Income Source Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Elite SD Construction - Salary, Freelance Design Work, etc."
                required
              />
            </div>

            {/* Income Type */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="type">Income Type *</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  type: value as IncomeSource['type']
                }))}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {INCOME_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value={type.value} />
                        <div className={`${type.color} p-2 rounded-lg text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Employer */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="employer">Employer/Client</Label>
              <Input
                id="employer"
                value={formData.employer || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, employer: e.target.value }))}
                placeholder="Company name or 'Self-employed'"
              />
            </div>

            {/* Pay Frequency */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="frequency">Pay Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  frequency: value as IncomeSource['frequency']
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAY_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      <div>
                        <div className="font-medium">{freq.label}</div>
                        <div className="text-xs text-muted-foreground">{freq.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <Label className="font-medium">Active Income Source</Label>
                <p className="text-sm text-muted-foreground">
                  Include this income in budget calculations
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

        {/* Income & Taxes Tab */}
        <TabsContent value="amounts" className="space-y-4">
          {/* Calculator Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">Auto-calculate net pay</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
              >
                {showCalculator ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Switch
                checked={showCalculator}
                onCheckedChange={setShowCalculator}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gross Amount */}
            <div className="space-y-2">
              <Label htmlFor="grossAmount">Gross Pay *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="grossAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.grossAmount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    grossAmount: parseFloat(e.target.value) || 0 
                  }))}
                  className="pl-9"
                  placeholder="2500.00"
                  required
                />
              </div>
            </div>

            {/* Net Amount */}
            <div className="space-y-2">
              <Label htmlFor="netAmount">Net Pay *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="netAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={showCalculator ? calculatedNet : formData.netAmount}
                  onChange={(e) => !showCalculator && setFormData(prev => ({ 
                    ...prev, 
                    netAmount: parseFloat(e.target.value) || 0 
                  }))}
                  className="pl-9"
                  placeholder="1800.00"
                  disabled={showCalculator}
                  required
                />
              </div>
              {showCalculator && (
                <p className="text-xs text-muted-foreground">
                  Auto-calculated from gross minus deductions
                </p>
              )}
            </div>

            {/* Tax Deductions */}
            <div className="space-y-2">
              <Label htmlFor="taxes">Taxes</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="taxes"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.taxes}
                  onChange={(e) => handleDeductionChange('taxes', parseFloat(e.target.value) || 0)}
                  className="pl-9"
                  placeholder="500.00"
                />
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits & Insurance</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="benefits"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.benefits}
                  onChange={(e) => handleDeductionChange('benefits', parseFloat(e.target.value) || 0)}
                  className="pl-9"
                  placeholder="150.00"
                />
              </div>
            </div>

            {/* Retirement */}
            <div className="space-y-2">
              <Label htmlFor="retirement">Retirement (401k, etc.)</Label>
              <div className="relative">
                <PiggyBank className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="retirement"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.retirement}
                  onChange={(e) => handleDeductionChange('retirement', parseFloat(e.target.value) || 0)}
                  className="pl-9"
                  placeholder="50.00"
                />
              </div>
            </div>

            {/* Other Deductions */}
            <div className="space-y-2">
              <Label htmlFor="otherDeductions">Other Deductions</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="otherDeductions"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.otherDeductions}
                  onChange={(e) => handleDeductionChange('otherDeductions', parseFloat(e.target.value) || 0)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-sm">Income Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tax Rate</p>
                  <p className="font-semibold text-red-600">{formatPercent(taxRate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Effective Rate</p>
                  <p className="font-semibold text-orange-600">{formatPercent(effectiveRate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Annual Gross</p>
                  <p className="font-semibold">{formatCurrency(annualGross)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Annual Net</p>
                  <p className="font-semibold text-green-600">{formatCurrency(annualNet)}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm">Total Deductions</span>
                <Badge variant="outline">{formatCurrency(totalDeductions)}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <Label className="font-medium">Upcoming Pay Dates</Label>
            </div>
            
            {/* Add Pay Date */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add Pay Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={payDateInput}
                    onChange={(e) => setPayDateInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddPayDate} disabled={!payDateInput}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pay Date List */}
            <div className="space-y-2">
              {formData.payDates && formData.payDates.length > 0 ? (
                formData.payDates.map((date, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePayDate(date)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <p>No pay dates scheduled. Add upcoming pay dates to track your income.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this income source..."
              rows={4}
            />
          </div>

          {/* Income Preview */}
          <Card className="border-2 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Income Source Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`${getTypeColor(formData.type || 'salary')} p-3 rounded-lg text-white`}>
                  {(() => {
                    const Icon = getTypeIcon(formData.type || 'salary');
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold">{formData.name || 'Unnamed Income Source'}</h5>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(formData.netAmount || 0)} net • {PAY_FREQUENCIES.find(f => f.value === formData.frequency)?.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.employer || 'No employer specified'}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={formData.isActive ? "default" : "secondary"} className="text-xs">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {INCOME_TYPES.find(t => t.value === formData.type)?.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          {mode === 'create' ? 'Create Income Source' : 'Update Income Source'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};