import { useState } from "react";
import { Brain, Bot, Zap, TrendingUp, Target, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { AIInsightsTab } from "./AIInsightsTab";
import { SmartAutomationTab } from "./SmartAutomationTab";
import type {
  FullSubscription,
  FullPaymentCard,
} from "../types/subscription";
import {
  formatCurrency,
  calculateMonthlyAmount,
  validateSubscriptionForCalculations,
} from "../utils/helpers";

interface IntelligenceTabProps {
  subscriptions: FullSubscription[];
  cards: FullPaymentCard[];
  onAutomationTrigger: (automation: any) => void;
}

export function IntelligenceTab({
  subscriptions,
  cards,
  onAutomationTrigger,
}: IntelligenceTabProps) {
  const [activeView, setActiveView] = useState("insights");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showAutomationSetup, setShowAutomationSetup] = useState(false);
  const [showOptimizationResults, setShowOptimizationResults] = useState(false);

  // Detect theme
  const isStealthOps =
    typeof document !== "undefined" && document.documentElement.classList.contains("stealth-ops");
  const isDarkMode =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
  const totalMonthly = activeSubscriptions.reduce((total, sub) => {
    const validatedSub = validateSubscriptionForCalculations(sub);
    return (
      total +
      calculateMonthlyAmount(
        validatedSub.price,
        validatedSub.frequency,
        validatedSub.variablePricing
      )
    );
  }, 0);

  // Mock AI stats
  const aiStats = {
    insightsGenerated: 7,
    potentialSavings: 247.5,
    automationRules: 3,
    optimizationScore: 87,
  };

  // Enhanced text colors with Stealth Ops support
  const getTextColors = () => {
    if (isStealthOps) {
      return {
        primary: "text-white",
        secondary: "text-gray-300",
        muted: "text-gray-400",
        accent: "text-green-400",
      };
    }
    return {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      muted: isDarkMode ? "text-gray-400" : "text-gray-600",
      accent: isDarkMode ? "text-blue-400" : "text-blue-600",
    };
  };

  const textColors = getTextColors();

  // Run Full Analysis Handler
  const handleRunFullAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisComplete(false);

    // Simulate analysis progress
    const steps = [
      { progress: 20, message: "Analyzing subscription patterns..." },
      { progress: 40, message: "Detecting duplicate services..." },
      { progress: 60, message: "Calculating optimization opportunities..." },
      { progress: 80, message: "Generating AI recommendations..." },
      { progress: 100, message: "Analysis complete!" },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAnalysisProgress(step.progress);
    }

    setAnalysisComplete(true);
    setIsAnalyzing(false);

    // Auto-switch to insights tab after analysis
    setTimeout(() => {
      setActiveView("insights");
    }, 1500);
  };

  // Setup Automation Handler
  const handleSetupAutomation = () => {
    setShowAutomationSetup(true);
  };

  // Optimize Spending Handler
  const handleOptimizeSpending = () => {
    setShowOptimizationResults(true);
  };

  const optimizationRecommendations = [
    {
      id: "1",
      title: "Switch to Annual Billing",
      description: "Save 15% on Netflix, Spotify, and Adobe by switching to annual plans",
      savings: 89.4,
      effort: "Low",
      impact: "High",
    },
    {
      id: "2",
      title: "Bundle Consolidation",
      description: "Combine Adobe Creative Cloud and Figma into Adobe Complete Suite",
      savings: 45.0,
      effort: "Medium",
      impact: "Medium",
    },
    {
      id: "3",
      title: "Unused Service Audit",
      description: "Cancel or downgrade 2 services with low usage in the last 30 days",
      savings: 32.99,
      effort: "Low",
      impact: "Medium",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stealth Ops Support */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2
            className={`text-xl sm:text-2xl font-semibold flex items-center space-x-2 ${textColors.primary} ${
              isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
            }`}
          >
            <Brain className={`w-6 h-6 ${isStealthOps ? "text-green-400" : "text-purple-600"}`} />
            <span>{isStealthOps ? "[INTELLIGENCE HUB]" : "Intelligence Hub"}</span>
          </h2>
          <p
            className={`text-sm ${textColors.muted} mt-1 ${isStealthOps ? "font-mono tracking-wide" : ""}`}
          >
            {isStealthOps
              ? "[AI-POWERED INSIGHTS AND SMART AUTOMATION TO OPTIMIZE YOUR SUBSCRIPTIONS]"
              : "AI-powered insights and smart automation to optimize your subscriptions"}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={`${
            isStealthOps
              ? "tactical-surface border border-green-400 text-green-400 font-mono tracking-wide tactical-glow"
              : "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200 dark:from-purple-900 dark:to-blue-900 dark:text-purple-300 dark:border-purple-700"
          }`}
          style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {isStealthOps ? "[AI-POWERED]" : "AI-Powered"}
        </Badge>
      </div>

      {/* Enhanced Analysis Progress with Stealth Ops Support */}
      {isAnalyzing && (
        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-blue-400 tactical-glow"
              : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Loader2
                className={`w-6 h-6 animate-spin ${
                  isStealthOps ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <div className="flex-1">
                <h3
                  className={`font-medium ${
                    isStealthOps
                      ? "text-blue-400 font-mono tracking-wide tactical-text-glow"
                      : "text-blue-900 dark:text-blue-100"
                  }`}
                >
                  {isStealthOps ? "[RUNNING AI ANALYSIS...]" : "Running AI Analysis..."}
                </h3>
                <p
                  className={`text-sm mb-2 ${
                    isStealthOps
                      ? "text-blue-300 font-mono tracking-wide"
                      : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {isStealthOps
                    ? `[ANALYZING ${activeSubscriptions.length} SUBSCRIPTIONS FOR OPTIMIZATION OPPORTUNITIES]`
                    : `Analyzing ${activeSubscriptions.length} subscriptions for optimization opportunities`}
                </p>
                <Progress
                  value={analysisProgress}
                  className={`h-2 ${isStealthOps ? "tactical-surface" : ""}`}
                />
                <p
                  className={`text-xs mt-1 ${
                    isStealthOps
                      ? "text-blue-400 font-mono tracking-wide"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {isStealthOps
                    ? `[${analysisProgress}% COMPLETE]`
                    : `${analysisProgress}% complete`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Analysis Complete with Stealth Ops Support */}
      {analysisComplete && (
        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-green-400 tactical-glow"
              : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle
                className={`w-6 h-6 ${isStealthOps ? "text-green-400" : "text-green-600"}`}
              />
              <div>
                <h3
                  className={`font-medium ${
                    isStealthOps
                      ? "text-green-400 font-mono tracking-wide tactical-text-glow"
                      : "text-green-900 dark:text-green-100"
                  }`}
                >
                  {isStealthOps ? "[ANALYSIS COMPLETE!]" : "Analysis Complete!"}
                </h3>
                <p
                  className={`text-sm ${
                    isStealthOps
                      ? "text-green-300 font-mono tracking-wide"
                      : "text-green-700 dark:text-green-300"
                  }`}
                >
                  {isStealthOps
                    ? `[FOUND ${aiStats.insightsGenerated} OPTIMIZATION OPPORTUNITIES WORTH ${formatCurrency(aiStats.potentialSavings)}/MONTH]`
                    : `Found ${aiStats.insightsGenerated} optimization opportunities worth ${formatCurrency(aiStats.potentialSavings)}/month`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced AI Overview Cards with Stealth Ops Support */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-purple-400 tactical-glow"
              : "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain
                className={`w-4 h-4 ${isStealthOps ? "text-purple-400" : "text-purple-600"}`}
              />
              <div
                className={`text-sm ${
                  isStealthOps
                    ? "text-purple-300 font-mono tracking-wide"
                    : "text-purple-700 dark:text-purple-300"
                }`}
              >
                {isStealthOps ? "[AI INSIGHTS]" : "AI Insights"}
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                isStealthOps
                  ? "text-purple-400 font-mono tracking-wide tactical-text-glow"
                  : "text-purple-800 dark:text-purple-200"
              }`}
            >
              {aiStats.insightsGenerated}
            </div>
            <div
              className={`text-xs ${
                isStealthOps
                  ? "text-purple-400 font-mono tracking-wide"
                  : "text-purple-600 dark:text-purple-400"
              }`}
            >
              {isStealthOps ? "[OPPORTUNITIES FOUND]" : "opportunities found"}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-green-400 tactical-glow"
              : "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp
                className={`w-4 h-4 ${isStealthOps ? "text-green-400" : "text-green-600"}`}
              />
              <div
                className={`text-sm ${
                  isStealthOps
                    ? "text-green-300 font-mono tracking-wide"
                    : "text-green-700 dark:text-green-300"
                }`}
              >
                {isStealthOps ? "[POTENTIAL SAVINGS]" : "Potential Savings"}
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                isStealthOps
                  ? "text-green-400 font-mono tracking-wide tactical-text-glow"
                  : "text-green-800 dark:text-green-200"
              }`}
            >
              {formatCurrency(aiStats.potentialSavings)}
            </div>
            <div
              className={`text-xs ${
                isStealthOps
                  ? "text-green-400 font-mono tracking-wide"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {isStealthOps ? "[PER MONTH]" : "per month"}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-blue-400 tactical-glow"
              : "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className={`w-4 h-4 ${isStealthOps ? "text-blue-400" : "text-blue-600"}`} />
              <div
                className={`text-sm ${
                  isStealthOps
                    ? "text-blue-300 font-mono tracking-wide"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {isStealthOps ? "[AUTOMATION RULES]" : "Automation Rules"}
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                isStealthOps
                  ? "text-blue-400 font-mono tracking-wide tactical-text-glow"
                  : "text-blue-800 dark:text-blue-200"
              }`}
            >
              {aiStats.automationRules}
            </div>
            <div
              className={`text-xs ${
                isStealthOps
                  ? "text-blue-400 font-mono tracking-wide"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {isStealthOps ? "[ACTIVE RULES]" : "active rules"}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-orange-400 tactical-glow"
              : "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target
                className={`w-4 h-4 ${isStealthOps ? "text-orange-400" : "text-orange-600"}`}
              />
              <div
                className={`text-sm ${
                  isStealthOps
                    ? "text-orange-300 font-mono tracking-wide"
                    : "text-orange-700 dark:text-orange-300"
                }`}
              >
                {isStealthOps ? "[OPTIMIZATION SCORE]" : "Optimization Score"}
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                isStealthOps
                  ? "text-orange-400 font-mono tracking-wide tactical-text-glow"
                  : "text-orange-800 dark:text-orange-200"
              }`}
            >
              {aiStats.optimizationScore}%
            </div>
            <div
              className={`text-xs ${
                isStealthOps
                  ? "text-orange-400 font-mono tracking-wide"
                  : "text-orange-600 dark:text-orange-400"
              }`}
            >
              {isStealthOps ? "[EFFICIENCY RATING]" : "efficiency rating"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced AI Status Banner with Stealth Ops Support */}
      <Card
        className={`${
          isStealthOps
            ? "tactical-surface border-2 border-purple-400 tactical-glow"
            : "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 ${
                  isStealthOps
                    ? "tactical-surface border border-purple-400"
                    : "bg-purple-100 dark:bg-purple-900 rounded-lg"
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <Brain
                  className={`w-5 h-5 ${isStealthOps ? "text-purple-400" : "text-purple-600"}`}
                />
              </div>
              <div>
                <h3
                  className={`font-medium ${
                    isStealthOps
                      ? "text-purple-400 font-mono tracking-wide tactical-text-glow"
                      : "text-purple-900 dark:text-purple-100"
                  }`}
                >
                  {isStealthOps ? "[AI ANALYSIS COMPLETE]" : "AI Analysis Complete"}
                </h3>
                <p
                  className={`text-sm ${
                    isStealthOps
                      ? "text-purple-300 font-mono tracking-wide"
                      : "text-purple-700 dark:text-purple-300"
                  }`}
                >
                  {isStealthOps
                    ? `[FOUND ${aiStats.insightsGenerated} OPTIMIZATION OPPORTUNITIES WORTH ${formatCurrency(aiStats.potentialSavings)}/MONTH]`
                    : `Found ${aiStats.insightsGenerated} optimization opportunities worth ${formatCurrency(aiStats.potentialSavings)}/month`}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className={`${
                isStealthOps
                  ? "tactical-button border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black font-mono tracking-wide"
                  : "border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-800"
              }`}
              onClick={() => setActiveView("insights")}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              <Zap className="w-4 h-4 mr-2" />
              {isStealthOps ? "[VIEW INSIGHTS]" : "View Insights"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Intelligence Tools with Stealth Ops Support */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className={`grid w-full grid-cols-2 ${isStealthOps ? "tactical-surface" : ""}`}>
          <TabsTrigger
            value="insights"
            className={`flex items-center space-x-2 ${
              isStealthOps ? "font-mono tracking-wide" : ""
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>{isStealthOps ? "[AI INSIGHTS]" : "AI Insights"}</span>
          </TabsTrigger>
          <TabsTrigger
            value="automation"
            className={`flex items-center space-x-2 ${
              isStealthOps ? "font-mono tracking-wide" : ""
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{isStealthOps ? "[SMART AUTOMATION]" : "Smart Automation"}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <AIInsightsTab subscriptions={subscriptions} cards={cards} />
        </TabsContent>

        <TabsContent value="automation">
          <SmartAutomationTab
            subscriptions={subscriptions}
            cards={cards}
            onAutomationTrigger={onAutomationTrigger}
          />
        </TabsContent>
      </Tabs>

      {/* Enhanced Quick Actions with Stealth Ops Support */}
      <Card className={isStealthOps ? "tactical-surface" : ""}>
        <CardHeader>
          <CardTitle
            className={`flex items-center space-x-2 ${textColors.primary} ${
              isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
            }`}
          >
            <Zap className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
            <span>{isStealthOps ? "[QUICK AI ACTIONS]" : "Quick AI Actions"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className={`h-auto p-4 flex-col items-start ${
                isStealthOps
                  ? "tactical-button border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black font-mono tracking-wide"
                  : ""
              }`}
              onClick={handleRunFullAnalysis}
              disabled={isAnalyzing}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              <div className="flex items-center space-x-2 mb-2">
                {isAnalyzing ? (
                  <Loader2
                    className={`w-5 h-5 animate-spin ${
                      isStealthOps ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                ) : (
                  <Brain
                    className={`w-5 h-5 ${isStealthOps ? "text-purple-400" : "text-purple-600"}`}
                  />
                )}
                <span className={`font-medium ${isStealthOps ? "font-mono tracking-wide" : ""}`}>
                  {isStealthOps ? "[RUN FULL ANALYSIS]" : "Run Full Analysis"}
                </span>
              </div>
              <p
                className={`text-sm text-left ${
                  isStealthOps ? "text-gray-300 font-mono tracking-wide" : "text-muted-foreground"
                }`}
              >
                {isAnalyzing
                  ? isStealthOps
                    ? "[ANALYZING SUBSCRIPTIONS...]"
                    : "Analyzing subscriptions..."
                  : isStealthOps
                    ? "[ANALYZE ALL SUBSCRIPTIONS FOR OPTIMIZATION OPPORTUNITIES]"
                    : "Analyze all subscriptions for optimization opportunities"}
              </p>
            </Button>

            <Button
              variant="outline"
              className={`h-auto p-4 flex-col items-start ${
                isStealthOps
                  ? "tactical-button border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black font-mono tracking-wide"
                  : ""
              }`}
              onClick={handleSetupAutomation}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Bot className={`w-5 h-5 ${isStealthOps ? "text-blue-400" : "text-blue-600"}`} />
                <span className={`font-medium ${isStealthOps ? "font-mono tracking-wide" : ""}`}>
                  {isStealthOps ? "[SETUP AUTOMATION]" : "Setup Automation"}
                </span>
              </div>
              <p
                className={`text-sm text-left ${
                  isStealthOps ? "text-gray-300 font-mono tracking-wide" : "text-muted-foreground"
                }`}
              >
                {isStealthOps
                  ? "[CREATE SMART RULES TO AUTOMATICALLY MANAGE SUBSCRIPTIONS]"
                  : "Create smart rules to automatically manage subscriptions"}
              </p>
            </Button>

            <Button
              variant="outline"
              className={`h-auto p-4 flex-col items-start ${
                isStealthOps
                  ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                  : ""
              }`}
              onClick={handleOptimizeSpending}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Target
                  className={`w-5 h-5 ${isStealthOps ? "text-green-400" : "text-green-600"}`}
                />
                <span className={`font-medium ${isStealthOps ? "font-mono tracking-wide" : ""}`}>
                  {isStealthOps ? "[OPTIMIZE SPENDING]" : "Optimize Spending"}
                </span>
              </div>
              <p
                className={`text-sm text-left ${
                  isStealthOps ? "text-gray-300 font-mono tracking-wide" : "text-muted-foreground"
                }`}
              >
                {isStealthOps
                  ? "[GET PERSONALIZED RECOMMENDATIONS TO REDUCE COSTS]"
                  : "Get personalized recommendations to reduce costs"}
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Automation Setup Modal with Stealth Ops Support */}
      <Dialog open={showAutomationSetup} onOpenChange={setShowAutomationSetup}>
        <DialogContent
          className={`max-w-2xl border-0 ${isStealthOps ? "tactical-surface font-mono" : "rounded-2xl"}`}
          style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          aria-describedby="automation-setup-description"
        >
          <DialogHeader>
            <DialogTitle
              className={`flex items-center space-x-2 ${textColors.primary} ${
                isStealthOps ? "font-mono tracking-wide text-green-400 tactical-text-glow" : ""
              }`}
            >
              <Bot className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
              <span>{isStealthOps ? "[SETUP SMART AUTOMATION]" : "Setup Smart Automation"}</span>
            </DialogTitle>
            <DialogDescription
              id="automation-setup-description"
              className={`${textColors.muted || "text-gray-600"} ${
                isStealthOps ? "font-mono tracking-wide" : ""
              }`}
            >
              {isStealthOps
                ? "[CREATE INTELLIGENT RULES TO AUTOMATICALLY MANAGE YOUR SUBSCRIPTIONS]"
                : "Create intelligent rules to automatically manage your subscriptions"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className={isStealthOps ? "tactical-surface border border-green-400" : ""}>
              <Sparkles className={`h-4 w-4 ${isStealthOps ? "text-green-400" : ""}`} />
              <AlertDescription
                className={`${isStealthOps ? "font-mono tracking-wide text-green-300" : ""}`}
              >
                {isStealthOps
                  ? "[AI HAS PRE-CONFIGURED 3 AUTOMATION RULES BASED ON YOUR SUBSCRIPTION PATTERNS. YOU CAN CUSTOMIZE OR ADD MORE RULES AS NEEDED.]"
                  : "AI has pre-configured 3 automation rules based on your subscription patterns. You can customize or add more rules as needed."}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div
                className={`p-4 border ${
                  isStealthOps ? "tactical-surface border-gray-600" : "rounded-lg"
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <h4
                  className={`font-medium ${textColors.primary} ${
                    isStealthOps ? "font-mono tracking-wide" : ""
                  }`}
                >
                  {isStealthOps ? "[PRICE INCREASE MONITOR]" : "Price Increase Monitor"}
                </h4>
                <p
                  className={`text-sm ${textColors.muted || "text-gray-600"} mt-1 ${
                    isStealthOps ? "font-mono tracking-wide" : ""
                  }`}
                >
                  {isStealthOps
                    ? "[AUTOMATICALLY ALERT WHEN SUBSCRIPTION PRICES INCREASE BY MORE THAN 10%]"
                    : "Automatically alert when subscription prices increase by more than 10%"}
                </p>
              </div>

              <div
                className={`p-4 border ${
                  isStealthOps ? "tactical-surface border-gray-600" : "rounded-lg"
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <h4
                  className={`font-medium ${textColors.primary} ${
                    isStealthOps ? "font-mono tracking-wide" : ""
                  }`}
                >
                  {isStealthOps ? "[RENEWAL REMINDER]" : "Renewal Reminder"}
                </h4>
                <p
                  className={`text-sm ${textColors.muted || "text-gray-600"} mt-1 ${
                    isStealthOps ? "font-mono tracking-wide" : ""
                  }`}
                >
                  {isStealthOps
                    ? "[REMIND YOU 7 DAYS BEFORE SUBSCRIPTIONS RENEW TO REVIEW AND CANCEL IF NEEDED]"
                    : "Remind you 7 days before subscriptions renew to review and cancel if needed"}
                </p>
              </div>

              <div
                className={`p-4 border ${
                  isStealthOps ? "tactical-surface border-gray-600" : "rounded-lg"
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <h4
                  className={`font-medium ${textColors.primary} ${
                    isStealthOps ? "font-mono tracking-wide" : ""
                  }`}
                >
                  {isStealthOps ? "[BUDGET GUARDIAN]" : "Budget Guardian"}
                </h4>
                <p
                  className={`text-sm ${textColors.muted || "text-gray-600"} mt-1 ${
                    isStealthOps ? "font-mono tracking-wide" : ""
                  }`}
                >
                  {isStealthOps
                    ? "[ALERT WHEN MONTHLY SUBSCRIPTION SPENDING EXCEEDS YOUR SET BUDGET LIMIT]"
                    : "Alert when monthly subscription spending exceeds your set budget limit"}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAutomationSetup(false)}
                className={`${
                  isStealthOps
                    ? "tactical-button border-gray-400 text-gray-300 hover:bg-gray-400 hover:text-black font-mono tracking-wide"
                    : ""
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                {isStealthOps ? "[CANCEL]" : "Cancel"}
              </Button>
              <Button
                onClick={() => {
                  onAutomationTrigger({ type: "setup_complete" });
                  setShowAutomationSetup(false);
                }}
                className={`${
                  isStealthOps
                    ? "bg-green-600 hover:bg-green-500 font-mono tracking-wide tactical-glow"
                    : ""
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <Bot className="w-4 h-4 mr-2" />
                {isStealthOps ? "[ENABLE AUTOMATION]" : "Enable Automation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Optimization Results Modal with Stealth Ops Support */}
      <Dialog open={showOptimizationResults} onOpenChange={setShowOptimizationResults}>
        <DialogContent
          className={`max-w-4xl max-h-[90vh] overflow-y-auto border-0 ${isStealthOps ? "tactical-surface font-mono" : "rounded-2xl"}`}
          style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          aria-describedby="optimization-results-description"
        >
          <DialogHeader>
            <DialogTitle
              className={`flex items-center space-x-2 ${textColors.primary} ${
                isStealthOps ? "font-mono tracking-wide text-green-400 tactical-text-glow" : ""
              }`}
            >
              <Target className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
              <span>
                {isStealthOps ? "[OPTIMIZATION RECOMMENDATIONS]" : "Optimization Recommendations"}
              </span>
            </DialogTitle>
            <DialogDescription
              id="optimization-results-description"
              className={`${textColors.muted || "text-gray-600"} ${
                isStealthOps ? "font-mono tracking-wide" : ""
              }`}
            >
              {isStealthOps
                ? "[AI-GENERATED RECOMMENDATIONS TO OPTIMIZE YOUR SUBSCRIPTION SPENDING AND REDUCE COSTS]"
                : "AI-generated recommendations to optimize your subscription spending and reduce costs"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className={`p-4 border ${
                isStealthOps
                  ? "tactical-surface border-green-400"
                  : "rounded-lg bg-green-50 border-green-200"
              }`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              <h3
                className={`font-medium ${
                  isStealthOps ? "text-green-400 font-mono tracking-wide" : "text-green-800"
                }`}
              >
                {isStealthOps ? "[TOTAL POTENTIAL SAVINGS]" : "Total Potential Savings"}
              </h3>
              <p
                className={`text-2xl font-bold ${
                  isStealthOps ? "text-green-400 tactical-text-glow" : "text-green-900"
                }`}
              >
                {formatCurrency(
                  optimizationRecommendations.reduce((total, rec) => total + rec.savings, 0)
                )}
                <span className={`text-sm ${isStealthOps ? "text-green-300" : "text-green-700"}`}>
                  {isStealthOps ? " [/MONTH]" : " /month"}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              {optimizationRecommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className={`p-4 border ${
                    isStealthOps ? "tactical-surface border-gray-600" : "rounded-lg"
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${textColors.primary} ${
                          isStealthOps ? "font-mono tracking-wide" : ""
                        }`}
                      >
                        {isStealthOps
                          ? `[${recommendation.title.toUpperCase()}]`
                          : recommendation.title}
                      </h4>
                      <p
                        className={`text-sm ${textColors.muted || "text-gray-600"} mt-1 ${
                          isStealthOps ? "font-mono tracking-wide" : ""
                        }`}
                      >
                        {recommendation.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge
                          variant={recommendation.impact === "High" ? "default" : "secondary"}
                          className={`${
                            isStealthOps
                              ? "tactical-surface border border-gray-600 font-mono tracking-wide"
                              : ""
                          }`}
                        >
                          {isStealthOps
                            ? `[${recommendation.impact.toUpperCase()} IMPACT]`
                            : `${recommendation.impact} Impact`}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${
                            isStealthOps
                              ? "tactical-surface border border-gray-600 font-mono tracking-wide"
                              : ""
                          }`}
                        >
                          {isStealthOps
                            ? `[${recommendation.effort.toUpperCase()} EFFORT]`
                            : `${recommendation.effort} Effort`}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div
                        className={`text-xl font-bold ${
                          isStealthOps ? "text-green-400 tactical-text-glow" : "text-green-600"
                        }`}
                      >
                        {formatCurrency(recommendation.savings)}
                      </div>
                      <div
                        className={`text-xs ${textColors.muted || "text-gray-600"} ${
                          isStealthOps ? "font-mono tracking-wide" : ""
                        }`}
                      >
                        {isStealthOps ? "[SAVED/MONTH]" : "saved/month"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowOptimizationResults(false)}
                className={`${
                  isStealthOps
                    ? "tactical-button border-gray-400 text-gray-300 hover:bg-gray-400 hover:text-black font-mono tracking-wide"
                    : ""
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                {isStealthOps ? "[CLOSE]" : "Close"}
              </Button>
              <Button
                className={`${
                  isStealthOps
                    ? "bg-green-600 hover:bg-green-500 font-mono tracking-wide tactical-glow"
                    : ""
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isStealthOps ? "[APPLY RECOMMENDATIONS]" : "Apply Recommendations"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
