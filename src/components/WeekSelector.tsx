import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import type { WeeklyBudget } from "../types/subscription";
import { formatDateRange } from "../utils/weekCalculations";

interface WeekSelectorProps {
  availableWeeks: WeeklyBudget[];
  selectedWeekId: string;
  onWeekChange: (weekId: string) => void;
}

export function WeekSelector({ availableWeeks, selectedWeekId, onWeekChange }: WeekSelectorProps) {
  const selectedWeek = availableWeeks.find((week) => week.id === selectedWeekId);
  const currentWeekIndex = availableWeeks.findIndex((week) => week.id === selectedWeekId);

  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) {
      onWeekChange(availableWeeks[currentWeekIndex - 1].id);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < availableWeeks.length - 1) {
      onWeekChange(availableWeeks[currentWeekIndex + 1].id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!selectedWeek) return null;

  const startDate = new Date(selectedWeek.startDate);
  const endDate = new Date(selectedWeek.endDate);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
            disabled={currentWeekIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex-1 text-center space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">{selectedWeek.weekLabel}</h3>
              {selectedWeek.isCurrentWeek && (
                <Badge variant="default" className="text-xs">
                  Current
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{formatDateRange(startDate, endDate)}</p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <span>Budget: {formatCurrency(selectedWeek.totalBudget)}</span>
              <span className="text-muted-foreground">•</span>
              <span>Remaining: {formatCurrency(selectedWeek.remaining)}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            disabled={currentWeekIndex === availableWeeks.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
