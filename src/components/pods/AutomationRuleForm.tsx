import { useState } from 'react';
import {
  Zap,
  Settings,
  Calendar,
  Percent,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
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
import { Textarea } from '../ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import type { FundingAutomationRule, BudgetPod } from '../../types/financial';

interface AutomationRuleFormProps {
  budgetPods: BudgetPod[];
  rule?: FundingAutomationRule;
  onSave: (rule: Omit<FundingAutomationRule, 'id' | 'createdDate' | 'lastModified'>) => void;
  onCancel: () => void;
}

const TRIGGER_PRESETS = {
  high_utilization: {
    name: 'High Utilization Response',
    description: 'Automatically increase funding when pods exceed utilization threshold',
    triggers: {
      utilizationThreshold: 85,
      timeInterval: 'monthly' as const
    },
    actions: {
      adjustmentType: 'percentage' as const,
      maxAdjustment: 15,
      minReviewThreshold: 50,
      autoApprovalLimit: 100
    }
  },
  low_utilization: {
    name: 'Low Utilization Optimizer',
    description: 'Suggest reallocation when pods are consistently underutilized',
    triggers: {
      utilizationThreshold: 40,
      timeInterval: 'quarterly' as const
    },
    actions: {
      adjustmentType: 'smart_algorithm' as const,
      maxAdjustment: 25,
      minReviewThreshold: 30,
      autoApprovalLimit: 75
    }
  },
  income_change: {
    name: 'Income Change Adapter',
    description: 'Adjust pod funding when income sources change significantly',
    triggers: {
      incomeChange: 10,
      timeInterval: 'monthly' as const
    },
    actions: {
      adjustmentType: 'percentage' as const,
      maxAdjustment: 20,
      minReviewThreshold: 100,
      autoApprovalLimit: 50
    }
  }
};

export const AutomationRuleForm = ({
  budgetPods,
  rule,
  onSave,
  onCancel
}: AutomationRuleFormProps) => {
  const [formData, setFormData] = useState<Partial<FundingAutomationRule>>({
    name: rule?.name || '',
    description: rule?.description || '',
    isActive: rule?.isActive ?? true,
    triggers: {
      utilizationThreshold: rule?.triggers.utilizationThreshold || 80,
      spendingVariance: rule?.triggers.spendingVariance || 15,
      incomeChange: rule?.triggers.incomeChange || 10,
      timeInterval: rule?.triggers.timeInterval || 'monthly',
      seasonalAdjustment: rule?.triggers.seasonalAdjustment || false,
      ...rule?.triggers
    },
    actions: {
      adjustmentType: rule?.actions.adjustmentType || 'percentage',
      maxAdjustment: rule?.actions.maxAdjustment || 15,
      minReviewThreshold: rule?.actions.minReviewThreshold || 50,
      autoApprovalLimit: rule?.actions.autoApprovalLimit || 100,
      ...rule?.actions
    },
    scope: {
      includePods: rule?.scope.includePods || [],
      excludePods: rule?.scope.excludePods || [],
      maxTotalAdjustment: rule?.scope.maxTotalAdjustment || 200,
      preserveTotalBudget: rule?.scope.preserveTotalBudget ?? false,
      ...rule?.scope
    }
  });

  const handlePresetSelect = (presetKey: keyof typeof TRIGGER_PRESETS) => {
    const preset = TRIGGER_PRESETS[presetKey];
    setFormData(prev => ({
      ...prev,
      name: preset.name,
      description: preset.description,
      triggers: { ...prev.triggers, ...preset.triggers },
      actions: { ...prev.actions, ...preset.actions }
    }));
  };

  const handlePodToggle = (podId: string, type: 'include' | 'exclude') => {
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope!,
        [type === 'include' ? 'includePods' : 'excludePods']: 
          prev.scope?.[type === 'include' ? 'includePods' : 'excludePods']?.includes(podId)
            ? prev.scope![type === 'include' ? 'includePods' : 'excludePods']!.filter(id => id !== podId)
            : [...(prev.scope?.[type === 'include' ? 'includePods' : 'excludePods'] || []), podId],
        maxTotalAdjustment: prev.scope?.maxTotalAdjustment || 200,
        preserveTotalBudget: prev.scope?.preserveTotalBudget || false
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<FundingAutomationRule, 'id' | 'createdDate' | 'lastModified'>);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          {rule ? 'Edit Automation Rule' : 'Create Automation Rule'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preset Selection */}
          {!rule && (
            <div className="space-y-4">
              <Label>Quick Start Presets</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(TRIGGER_PRESETS).map(([key, preset]) => (
                  <Card 
                    key={key}
                    className="cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => handlePresetSelect(key as keyof typeof TRIGGER_PRESETS)}
                  >
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-1">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter rule name"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this rule does and when it should trigger"
              rows={2}
            />
          </div>

          <Accordion type="multiple" defaultValue={["triggers", "actions", "scope"]} className="w-full">
            {/* Triggers Configuration */}
            <AccordionItem value="triggers">
              <AccordionTrigger className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Trigger Conditions
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Utilization Threshold (%)</Label>
                    <div className="px-3 py-2">
                      <Slider
                        value={[formData.triggers?.utilizationThreshold || 80]}
                        onValueChange={([value]) => 
                          setFormData(prev => ({
                            ...prev,
                            triggers: { ...prev.triggers!, utilizationThreshold: value }
                          }))
                        }
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {formData.triggers?.utilizationThreshold}% - Trigger when utilization crosses this threshold
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Time Interval</Label>
                    <Select 
                      value={formData.triggers?.timeInterval} 
                      onValueChange={(value) => 
                        setFormData(prev => ({
                          ...prev,
                          triggers: { ...prev.triggers!, timeInterval: value as any }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Spending Variance Threshold (%)</Label>
                    <Input
                      type="number"
                      value={formData.triggers?.spendingVariance || ''}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          triggers: { ...prev.triggers!, spendingVariance: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      placeholder="15"
                    />
                    <div className="text-xs text-muted-foreground">
                      Trigger when spending varies by this percentage
                    </div>
                  </div>

                  <div>
                    <Label>Income Change Threshold (%)</Label>
                    <Input
                      type="number"
                      value={formData.triggers?.incomeChange || ''}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          triggers: { ...prev.triggers!, incomeChange: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      placeholder="10"
                    />
                    <div className="text-xs text-muted-foreground">
                      Trigger when income changes by this percentage
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="seasonal">Enable Seasonal Adjustments</Label>
                  <Switch
                    id="seasonal"
                    checked={formData.triggers?.seasonalAdjustment || false}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        triggers: { ...prev.triggers!, seasonalAdjustment: checked }
                      }))
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Actions Configuration */}
            <AccordionItem value="actions">
              <AccordionTrigger className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Action Settings
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label>Adjustment Type</Label>
                  <Select 
                    value={formData.actions?.adjustmentType} 
                    onValueChange={(value) => 
                      setFormData(prev => ({
                        ...prev,
                        actions: { ...prev.actions!, adjustmentType: value as any }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Based</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      <SelectItem value="smart_algorithm">Smart Algorithm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Maximum Adjustment (%)</Label>
                    <div className="px-3 py-2">
                      <Slider
                        value={[formData.actions?.maxAdjustment || 15]}
                        onValueChange={([value]) => 
                          setFormData(prev => ({
                            ...prev,
                            actions: { ...prev.actions!, maxAdjustment: value }
                          }))
                        }
                        max={50}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {formData.actions?.maxAdjustment}% - Maximum change allowed per adjustment
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Auto-Approval Limit</Label>
                    <Input
                      type="number"
                      value={formData.actions?.autoApprovalLimit || ''}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          actions: { ...prev.actions!, autoApprovalLimit: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      placeholder="100"
                    />
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(formData.actions?.autoApprovalLimit || 0)} - Auto-approve changes below this amount
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Manual Review Threshold</Label>
                  <Input
                    type="number"
                    value={formData.actions?.minReviewThreshold || ''}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        actions: { ...prev.actions!, minReviewThreshold: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    placeholder="50"
                  />
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(formData.actions?.minReviewThreshold || 0)} - Changes above this require manual review
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Scope Configuration */}
            <AccordionItem value="scope">
              <AccordionTrigger className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Rule Scope
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label>Include Specific Pods</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {budgetPods.map((pod) => (
                      <div 
                        key={pod.id}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          formData.scope?.includePods?.includes(pod.id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePodToggle(pod.id, 'include')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{pod.icon || '📊'}</span>
                          <span className="text-sm font-medium">{pod.name}</span>
                          {formData.scope?.includePods?.includes(pod.id) && (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formData.scope?.includePods?.length === 0 
                      ? 'All pods will be included' 
                      : `${formData.scope?.includePods?.length} pods selected`}
                  </div>
                </div>

                <div>
                  <Label>Exclude Specific Pods</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {budgetPods.map((pod) => (
                      <div 
                        key={pod.id}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          formData.scope?.excludePods?.includes(pod.id)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePodToggle(pod.id, 'exclude')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{pod.icon || '📊'}</span>
                          <span className="text-sm font-medium">{pod.name}</span>
                          {formData.scope?.excludePods?.includes(pod.id) && (
                            <X className="w-4 h-4 text-red-600 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formData.scope?.excludePods?.length} pods excluded from this rule
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Max Total Adjustment</Label>
                    <Input
                      type="number"
                      value={formData.scope?.maxTotalAdjustment || ''}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          scope: { ...prev.scope!, maxTotalAdjustment: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      placeholder="200"
                    />
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(formData.scope?.maxTotalAdjustment || 0)} - Maximum total adjustment across all pods
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="preserve">Preserve Total Budget</Label>
                    <Switch
                      id="preserve"
                      checked={formData.scope?.preserveTotalBudget || false}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          scope: { ...prev.scope!, preserveTotalBudget: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Zap className="w-4 h-4 mr-2" />
              {rule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};