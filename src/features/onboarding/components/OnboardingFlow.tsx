// Onboarding Flow - First-time user experience
// Guides users through initial setup with income wizard integration

import { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  DollarSign,
  PiggyBank,
  CreditCard,
  Target,
  Trophy,
  ArrowRight,
  Zap,
  Info,
  PlayCircle,
  User,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { IncomeSetupWizard } from '../../income/components/IncomeSetupWizard';
import { cn } from '../../../utils/cn';

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
  userName?: string;
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to SubTracker AI',
    subtitle: 'Your personal finance companion',
    icon: Sparkles,
    color: 'bg-gradient-to-br from-purple-500 to-pink-500'
  },
  {
    id: 'overview',
    title: 'What We\'ll Help You Do',
    subtitle: 'Get the most from your money',
    icon: Target,
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  },
  {
    id: 'income-setup',
    title: 'Set Up Your Income',
    subtitle: 'Track your earnings accurately',
    icon: DollarSign,
    color: 'bg-gradient-to-br from-green-500 to-emerald-500'
  },
  {
    id: 'budget-intro',
    title: 'Budget Pods Explained',
    subtitle: 'Organize money by purpose',
    icon: PiggyBank,
    color: 'bg-gradient-to-br from-orange-500 to-red-500'
  },
  {
    id: 'features',
    title: 'Key Features',
    subtitle: 'Tools to manage your finances',
    icon: Zap,
    color: 'bg-gradient-to-br from-indigo-500 to-purple-500'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    subtitle: 'Start managing your money',
    icon: Trophy,
    color: 'bg-gradient-to-br from-yellow-500 to-orange-500'
  }
];

export const OnboardingFlow = ({ open, onComplete, userName = 'there' }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showIncomeWizard, setShowIncomeWizard] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [hasSeenDemo, setHasSeenDemo] = useState(false);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStepData.id === 'income-setup' && !completedSteps.has('income-setup')) {
      setShowIncomeWizard(true);
      return;
    }

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding completion
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_date', new Date().toISOString());
    onComplete();
  };

  const handleIncomeWizardComplete = (data: any) => {
    setShowIncomeWizard(false);
    setCompletedSteps(prev => new Set([...prev, 'income-setup']));
    setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    if (confirm('Are you sure you want to skip the onboarding? You can always access it later from settings.')) {
      handleComplete();
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={cn(
                "w-24 h-24 rounded-full mx-auto flex items-center justify-center",
                currentStepData.color
              )}
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold">
                Welcome{userName !== 'there' ? `, ${userName}` : ''}! 👋
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Let's get you set up with SubTracker AI in just a few minutes.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 max-w-lg mx-auto">
              <h3 className="font-semibold mb-3">What we'll do together:</h3>
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm">Set up your income sources (2 min)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm">Create budget pods for your goals (1 min)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm">Learn key features (1 min)</span>
                </div>
              </div>
            </div>

            <Button size="lg" onClick={handleNext} className="gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        );

      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Your Financial Command Center</h2>
              <p className="text-muted-foreground">
                SubTracker AI helps you manage every aspect of your finances
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Track Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monitor paychecks, calculate taxes, and track reimbursements
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-blue-600" />
                    Budget Pods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Allocate money into purpose-driven savings buckets
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Never miss a payment or forget to cancel unused services
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Financial Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Set and track progress toward your financial objectives
                  </p>
                </CardContent>
              </Card>
            </div>

            {!hasSeenDemo && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <PlayCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> You can explore with sample data first before adding your real information.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'income-setup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={cn(
                "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
                currentStepData.color
              )}>
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Let's Add Your Income</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We'll walk you through setting up your income sources with our smart calculator
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6">
              <h3 className="font-semibold mb-3">What you can set up:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="mt-0.5">New</Badge>
                  <div>
                    <p className="font-medium">Weekly Gross Pay Input</p>
                    <p className="text-sm text-muted-foreground">
                      Enter your weekly earnings and we'll calculate everything else
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Smart Tax Calculations</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically calculate net pay from gross
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Paycheck Tracking</p>
                    <p className="text-sm text-muted-foreground">
                      Track actual amounts including reimbursements
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setCurrentStep(currentStep + 1)}>
                Skip for Now
              </Button>
              <Button size="lg" onClick={() => setShowIncomeWizard(true)} className="gap-2">
                <Zap className="w-4 h-4" />
                Open Income Wizard
              </Button>
            </div>
          </div>
        );

      case 'budget-intro':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={cn(
                "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
                currentStepData.color
              )}>
                <PiggyBank className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Budget Pods System</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                A revolutionary way to organize your money by purpose
              </p>
            </div>

            <div className="space-y-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">What are Budget Pods?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Think of them as digital envelopes where you allocate money for specific purposes - 
                    rent, groceries, savings, fun money, etc.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Thursday Paycheck System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Every Thursday, your income is automatically allocated to your pods based on your 
                    preferences. Perfect timing for weekend planning!
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Visual Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See at a glance how much you have in each pod, what's fully funded, and what needs attention.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                You can create pods for anything: Emergency Fund, Vacation, New Gadget, or even "Treat Yourself"!
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Powerful Features</h2>
              <p className="text-muted-foreground">
                Everything you need to master your finances
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Calendar View</p>
                  <p className="text-xs text-muted-foreground">
                    See upcoming bills & paychecks
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Target className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Goal Tracking</p>
                  <p className="text-xs text-muted-foreground">
                    Set & achieve financial goals
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Zap className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Smart Insights</p>
                  <p className="text-xs text-muted-foreground">
                    AI-powered recommendations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <User className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Personalized</p>
                  <p className="text-xs text-muted-foreground">
                    Adapts to your habits
                  </p>
                </div>
              </div>
            </div>

            <Card className="border-primary bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Actions</h3>
                    <p className="text-sm text-muted-foreground">
                      Access everything with keyboard shortcuts: Press <kbd>Cmd+K</kbd> anytime
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className={cn(
                "w-24 h-24 rounded-full mx-auto flex items-center justify-center",
                currentStepData.color
              )}
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold">You're All Set! 🎉</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your financial journey with SubTracker AI begins now
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 max-w-lg mx-auto">
              <h3 className="font-semibold mb-3">Next Steps:</h3>
              <div className="space-y-2 text-left">
                {!completedSteps.has('income-setup') && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">1.</span>
                    <span className="text-sm">Complete income setup when ready</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">2.</span>
                  <span className="text-sm">Add your subscriptions to track</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">3.</span>
                  <span className="text-sm">Create budget pods for your needs</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">4.</span>
                  <span className="text-sm">Explore the dashboard insights</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.open('/help', '_blank')}>
                View Help Guide
              </Button>
              <Button size="lg" onClick={handleComplete} className="gap-2">
                Start Using SubTracker
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open && !showIncomeWizard}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    currentStepData.color
                  )}>
                    <currentStepData.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{currentStepData.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSkip}>
                  Skip Tour
                </Button>
              </div>
              <Progress value={progress} className="mt-3 h-1" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="flex gap-1">
                  {ONBOARDING_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index <= currentStep ? "bg-primary" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                <Button onClick={handleNext} className="gap-2">
                  {currentStep === ONBOARDING_STEPS.length - 1 ? (
                    <>
                      Complete
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Income Setup Wizard */}
      {showIncomeWizard && (
        <IncomeSetupWizard
          open={showIncomeWizard}
          onClose={() => setShowIncomeWizard(false)}
          onComplete={handleIncomeWizardComplete}
        />
      )}
    </>
  );
};