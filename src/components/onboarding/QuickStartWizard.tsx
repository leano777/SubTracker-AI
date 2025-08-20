/**
 * Quick Start Wizard Component
 * Streamlined onboarding for immediate value
 */

import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Plus, 
  Trash2, 
  CreditCard,
  DollarSign,
  Calendar,
  Star,
  Zap,
  AlertCircle,
  Sparkles,
  Target,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import userSetupService, { type OnboardingData, type QuickStartTemplate } from '@/services/userSetupService';
import { useAuth } from '@/contexts/AuthContext';

interface QuickStartWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

export function QuickStartWizard({ isOpen, onComplete, onClose }: QuickStartWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: user?.name || '',
    monthlyBudget: 100,
    primaryPaymentMethods: [],
    existingSubscriptions: [],
    preferences: {
      notifications: true,
      smartRecommendations: true,
      priceAlerts: true,
      budgetAlerts: true,
    },
  });

  const templates = userSetupService.getQuickStartTemplates();

  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SubTracker AI',
      description: 'Let\'s get you set up in under 2 minutes',
      component: WelcomeStep,
    },
    {
      id: 'template',
      title: 'Choose Your Setup',
      description: 'Pick a template that matches your needs',
      component: TemplateStep,
    },
    {
      id: 'budget',
      title: 'Set Your Budget',
      description: 'How much do you spend on subscriptions monthly?',
      component: BudgetStep,
    },
    {
      id: 'subscriptions',
      title: 'Add Your Subscriptions',
      description: 'Start with your most important services',
      component: SubscriptionsStep,
    },
    {
      id: 'cards',
      title: 'Payment Methods',
      description: 'Add the cards you use for subscriptions',
      component: PaymentCardsStep,
    },
    {
      id: 'preferences',
      title: 'Smart Features',
      description: 'Configure AI-powered insights',
      component: PreferencesStep,
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start tracking and optimizing your subscriptions',
      component: CompleteStep,
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let result;
      
      if (selectedTemplate && selectedTemplate !== 'custom') {
        // Apply template with customizations
        result = await userSetupService.applyQuickStartTemplate(
          user.id, 
          selectedTemplate,
          onboardingData
        );
      } else {
        // Complete custom onboarding
        result = await userSetupService.completeOnboarding(user.id, onboardingData);
      }

      if (result.success) {
        onComplete();
      } else {
        console.error('Onboarding failed:', result.error);
        // Handle error - maybe show a toast
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                {currentStepData.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {currentStepData.description}
              </CardDescription>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="overflow-y-auto">
          <currentStepData.component
            data={onboardingData}
            onDataChange={setOnboardingData}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            templates={templates}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onComplete={handleComplete}
            isLoading={isLoading}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
            currentStep={currentStep}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Individual step components
function WelcomeStep({ onNext }: any) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Target className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-4">Take Control of Your Subscriptions</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        SubTracker AI helps you discover hidden subscriptions, optimize costs, and never miss important payments.
      </p>
      
      <div className="grid gap-4 mb-8 max-w-md mx-auto">
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm">AI-powered recommendations</span>
        </div>
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-sm">Find potential savings</span>
        </div>
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-sm">Never miss a payment</span>
        </div>
      </div>

      <Button onClick={onNext} size="lg" className="w-full">
        Get Started
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function TemplateStep({ templates, selectedTemplate, onTemplateChange, onNext, onPrevious }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Choose Your Starting Point</h3>
        <p className="text-muted-foreground">
          Select a template that matches your situation, or start fresh
        </p>
      </div>

      <div className="grid gap-3">
        {templates.map((template: QuickStartTemplate) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-accent'
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    {template.id !== 'custom' && (
                      <Badge variant="secondary" className="text-xs">
                        ${template.monthlyBudget}/mo
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  {template.subscriptions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.subscriptions.slice(0, 3).map((sub, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {sub.name}
                        </Badge>
                      ))}
                      {template.subscriptions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.subscriptions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {selectedTemplate === template.id && (
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedTemplate} className="flex-1">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function BudgetStep({ data, onDataChange, onNext, onPrevious }: any) {
  const budgetPresets = [25, 50, 100, 200, 300, 500];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Set Your Monthly Budget</h3>
        <p className="text-muted-foreground">
          This helps us provide better recommendations and alerts
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {budgetPresets.map(amount => (
            <Button
              key={amount}
              variant={data.monthlyBudget === amount ? 'default' : 'outline'}
              onClick={() => onDataChange({ ...data, monthlyBudget: amount })}
              className="h-12"
            >
              ${amount}
            </Button>
          ))}
        </div>

        <div className="relative">
          <Label htmlFor="custom-budget">Or enter a custom amount</Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="custom-budget"
              type="number"
              placeholder="0"
              value={data.monthlyBudget || ''}
              onChange={(e) => onDataChange({ ...data, monthlyBudget: Number(e.target.value) })}
              className="pl-10"
            />
          </div>
        </div>

        {data.monthlyBudget > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Based on your ${data.monthlyBudget} budget, we'll alert you when spending exceeds this amount 
              and suggest optimizations to stay within budget.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function SubscriptionsStep({ data, onDataChange, onNext, onPrevious }: any) {
  const [newSub, setNewSub] = useState({
    name: '',
    cost: '',
    billingCycle: 'monthly' as const,
    category: 'Entertainment',
  });

  const addSubscription = () => {
    if (newSub.name && newSub.cost) {
      const subscription = {
        name: newSub.name,
        cost: Number(newSub.cost),
        billingCycle: newSub.billingCycle,
        category: newSub.category,
      };
      
      onDataChange({
        ...data,
        existingSubscriptions: [...data.existingSubscriptions, subscription],
      });
      
      setNewSub({ name: '', cost: '', billingCycle: 'monthly', category: 'Entertainment' });
    }
  };

  const removeSubscription = (index: number) => {
    const updated = data.existingSubscriptions.filter((_: any, i: number) => i !== index);
    onDataChange({ ...data, existingSubscriptions: updated });
  };

  const suggestions = userSetupService.getSubscriptionSuggestions(newSub.category);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Add Your Subscriptions</h3>
        <p className="text-muted-foreground">
          Start with your most important services. You can add more later.
        </p>
      </div>

      {/* Current subscriptions */}
      {data.existingSubscriptions.length > 0 && (
        <div className="space-y-2">
          <Label>Your Subscriptions ({data.existingSubscriptions.length})</Label>
          {data.existingSubscriptions.map((sub: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{sub.name}</div>
                <div className="text-sm text-muted-foreground">
                  ${sub.cost}/{sub.billingCycle.replace('ly', '')} • {sub.category}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSubscription(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Separator className="my-4" />
        </div>
      )}

      {/* Add new subscription */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sub-name">Service Name</Label>
            <Input
              id="sub-name"
              placeholder="e.g., Netflix"
              value={newSub.name}
              onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="sub-cost">Cost</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="sub-cost"
                type="number"
                placeholder="15.99"
                value={newSub.cost}
                onChange={(e) => setNewSub({ ...newSub, cost: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="billing-cycle">Billing Cycle</Label>
            <Select
              value={newSub.billingCycle}
              onValueChange={(value: any) => setNewSub({ ...newSub, billingCycle: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={newSub.category}
              onValueChange={(value) => setNewSub({ ...newSub, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Business Tools">Business Tools</SelectItem>
                <SelectItem value="Utilities & Services">Utilities & Services</SelectItem>
                <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                <SelectItem value="Education & Learning">Education & Learning</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div>
            <Label className="text-sm text-muted-foreground">Popular in {newSub.category}:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestions.slice(0, 4).map((suggestion) => (
                <Button
                  key={suggestion.name}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewSub({
                    ...newSub,
                    name: suggestion.name,
                    cost: suggestion.estimatedCost.toString(),
                  })}
                >
                  {suggestion.name} (${suggestion.estimatedCost})
                </Button>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={addSubscription} 
          disabled={!newSub.name || !newSub.cost}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function PaymentCardsStep({ data, onDataChange, onNext, onPrevious }: any) {
  const [newCard, setNewCard] = useState({
    nickname: '',
    lastFour: '',
    type: 'visa' as const,
  });

  const addCard = () => {
    if (newCard.nickname && newCard.lastFour) {
      const card = {
        ...newCard,
        isDefault: data.primaryPaymentMethods.length === 0,
      };
      
      onDataChange({
        ...data,
        primaryPaymentMethods: [...data.primaryPaymentMethods, card],
      });
      
      setNewCard({ nickname: '', lastFour: '', type: 'visa' });
    }
  };

  const removeCard = (index: number) => {
    const updated = data.primaryPaymentMethods.filter((_: any, i: number) => i !== index);
    // If we removed the default card, make the first remaining card default
    if (updated.length > 0 && !updated.some((card: any) => card.isDefault)) {
      updated[0].isDefault = true;
    }
    onDataChange({ ...data, primaryPaymentMethods: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Payment Methods</h3>
        <p className="text-muted-foreground">
          Add the cards you use for subscriptions (optional)
        </p>
      </div>

      {/* Current cards */}
      {data.primaryPaymentMethods.length > 0 && (
        <div className="space-y-2">
          <Label>Your Cards ({data.primaryPaymentMethods.length})</Label>
          {data.primaryPaymentMethods.map((card: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">{card.nickname}</div>
                  <div className="text-sm text-muted-foreground">
                    **** {card.lastFour} • {card.type.toUpperCase()}
                    {card.isDefault && <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCard(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Separator className="my-4" />
        </div>
      )}

      {/* Add new card */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="card-nickname">Card Nickname</Label>
            <Input
              id="card-nickname"
              placeholder="e.g., Personal Visa"
              value={newCard.nickname}
              onChange={(e) => setNewCard({ ...newCard, nickname: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="last-four">Last 4 Digits</Label>
            <Input
              id="last-four"
              placeholder="1234"
              maxLength={4}
              value={newCard.lastFour}
              onChange={(e) => setNewCard({ ...newCard, lastFour: e.target.value.replace(/\D/g, '') })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="card-type">Card Type</Label>
          <Select
            value={newCard.type}
            onValueChange={(value: any) => setNewCard({ ...newCard, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visa">Visa</SelectItem>
              <SelectItem value="mastercard">Mastercard</SelectItem>
              <SelectItem value="amex">American Express</SelectItem>
              <SelectItem value="discover">Discover</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={addCard} 
          disabled={!newCard.nickname || !newCard.lastFour}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function PreferencesStep({ data, onDataChange, onNext, onPrevious }: any) {
  const updatePreference = (key: keyof typeof data.preferences, value: boolean) => {
    onDataChange({
      ...data,
      preferences: { ...data.preferences, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Smart Features</h3>
        <p className="text-muted-foreground">
          Configure AI-powered insights and notifications
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <Label className="font-medium">Smart Notifications</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Get alerts for upcoming payments and important changes
            </p>
          </div>
          <Switch
            checked={data.preferences.notifications}
            onCheckedChange={(checked) => updatePreference('notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-purple-600" />
              <Label className="font-medium">AI Recommendations</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive personalized suggestions to save money
            </p>
          </div>
          <Switch
            checked={data.preferences.smartRecommendations}
            onCheckedChange={(checked) => updatePreference('smartRecommendations', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <Label className="font-medium">Price Change Alerts</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Get notified when subscription prices increase
            </p>
          </div>
          <Switch
            checked={data.preferences.priceAlerts}
            onCheckedChange={(checked) => updatePreference('priceAlerts', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-green-600" />
              <Label className="font-medium">Budget Alerts</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Stay informed when approaching your spending limits
            </p>
          </div>
          <Switch
            checked={data.preferences.budgetAlerts}
            onCheckedChange={(checked) => updatePreference('budgetAlerts', checked)}
          />
        </div>
      </div>

      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          You can change these preferences anytime in Settings. All features work locally and protect your privacy.
        </AlertDescription>
      </Alert>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function CompleteStep({ onComplete, isLoading }: any) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-4">You're All Set! 🎉</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Your SubTracker AI account is configured and ready. Start exploring your subscription insights and discover ways to save money.
      </p>
      
      <div className="grid gap-3 mb-8 max-w-sm mx-auto">
        <div className="flex items-center gap-3 text-left text-sm">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>View your subscription dashboard</span>
        </div>
        <div className="flex items-center gap-3 text-left text-sm">
          <Zap className="h-4 w-4 text-blue-500" />
          <span>Get AI-powered recommendations</span>
        </div>
        <div className="flex items-center gap-3 text-left text-sm">
          <Target className="h-4 w-4 text-green-500" />
          <span>Track spending against your budget</span>
        </div>
      </div>

      <Button 
        onClick={onComplete} 
        size="lg" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Setting up your account...' : 'Start Using SubTracker AI'}
      </Button>
    </div>
  );
}

export default QuickStartWizard;