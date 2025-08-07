import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Plus, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { WeeklyBudget } from "../types/subscription";
import { WeekSelector } from "./WeekSelector";

interface BudgetAllocationProps {
  availableWeeks: WeeklyBudget[];
  selectedWeekId: string;
  onWeekChange: (weekId: string) => void;
  onUpdateBudget: (weekId: string, budget: WeeklyBudget) => void;
  totalMonthlySubscriptions: number;
}

export function BudgetAllocation({
  availableWeeks,
  selectedWeekId,
  onWeekChange,
  onUpdateBudget,
  totalMonthlySubscriptions,
}: BudgetAllocationProps) {
  const [allocationAmount, setAllocationAmount] = useState<number>(0);
  const [isAllocating, setIsAllocating] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  const selectedWeek = availableWeeks.find((week) => week.id === selectedWeekId);

  const handleAllocate = () => {
    if (allocationAmount > 0 && selectedWeek) {
      const updatedBudget = {
        ...selectedWeek,
        allocated: selectedWeek.allocated + allocationAmount,
        remaining: selectedWeek.remaining + allocationAmount,
      };
      onUpdateBudget(selectedWeekId, updatedBudget);
      setAllocationAmount(0);
      setIsAllocating(false);
    }
  };

  const handleSetBudget = () => {
    if (budgetAmount >= 0 && selectedWeek) {
      const difference = budgetAmount - selectedWeek.totalBudget;
      const updatedBudget = {
        ...selectedWeek,
        totalBudget: budgetAmount,
        remaining: selectedWeek.remaining + difference,
      };
      onUpdateBudget(selectedWeekId, updatedBudget);
      setBudgetAmount(0);
      setIsSettingBudget(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!selectedWeek) return null;

  const suggestedWeeklyAmount = totalMonthlySubscriptions / 4;
  const progressPercentage =
    selectedWeek.totalBudget > 0 ? (selectedWeek.allocated / selectedWeek.totalBudget) * 100 : 0;
  const spentAmount = selectedWeek.allocated - selectedWeek.remaining;

  return (
    <div className="space-y-6">
      <WeekSelector
        availableWeeks={availableWeeks}
        selectedWeekId={selectedWeekId}
        onWeekChange={onWeekChange}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Weekly Budget - {selectedWeek.weekLabel}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Total Budget</Label>
              <div className="text-2xl font-bold">{formatCurrency(selectedWeek.totalBudget)}</div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Allocated</Label>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(selectedWeek.allocated)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Spent</Label>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(spentAmount)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Remaining</Label>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(selectedWeek.remaining)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Budget Allocation Progress</Label>
              <span className="text-sm text-muted-foreground">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Suggested Amount */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Weekly Budget Suggestion</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on your monthly subscriptions ({formatCurrency(totalMonthlySubscriptions)}),
              consider budgeting {formatCurrency(suggestedWeeklyAmount)} per week.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Set Weekly Budget */}
            {isSettingBudget ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="budget">Set Weekly Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                    placeholder={selectedWeek.totalBudget.toString()}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSetBudget} disabled={budgetAmount < 0}>
                    Set Budget
                  </Button>
                  <Button variant="outline" onClick={() => setIsSettingBudget(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setBudgetAmount(selectedWeek.totalBudget);
                  setIsSettingBudget(true);
                }}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <DollarSign className="w-5 h-5" />
                <span>Set Weekly Budget</span>
                <span className="text-xs text-muted-foreground">
                  Current: {formatCurrency(selectedWeek.totalBudget)}
                </span>
              </Button>
            )}

            {/* Add Money */}
            {isAllocating ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="allocation">Add Money Amount</Label>
                  <Input
                    id="allocation"
                    type="number"
                    step="0.01"
                    min="0"
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAllocate} disabled={allocationAmount <= 0}>
                    Add {formatCurrency(allocationAmount)}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAllocating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAllocating(true)}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Money</span>
                <span className="text-xs opacity-80">Payday allocation</span>
              </Button>
            )}
          </div>

          {/* Week Summary */}
          {selectedWeek.subscriptions.length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Subscriptions This Week</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedWeek.subscriptions.length} subscription(s) allocated to this week
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
