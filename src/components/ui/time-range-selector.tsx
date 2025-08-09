import { Button } from "./button";
import { cn } from "./utils";

export interface TimeRange {
  label: string;
  value: "7d" | "30d" | "ytd" | "all";
  days?: number;
}

interface TimeRangeSelectorProps {
  selected: TimeRange["value"];
  onSelect: (range: TimeRange["value"]) => void;
  className?: string;
}

export const timeRanges: TimeRange[] = [
  { label: "7 Days", value: "7d", days: 7 },
  { label: "30 Days", value: "30d", days: 30 },
  { label: "YTD", value: "ytd" },
  { label: "All Time", value: "all" }
];

export const TimeRangeSelector = ({ selected, onSelect, className }: TimeRangeSelectorProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {timeRanges.map((range) => (
        <Button
          key={range.value}
          variant={selected === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(range.value)}
          className={cn(
            "transition-all duration-200 glass-surface",
            selected === range.value 
              ? "bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm" 
              : "bg-glass-secondary border-glass-border text-text-on-glass hover:bg-glass-accent",
            "stealth-ops:tactical-button stealth-ops:font-mono stealth-ops:tracking-wide"
          )}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
};

export const getDateRangeFilter = (range: TimeRange["value"], date: Date = new Date()) => {
  const now = new Date(date);
  
  switch (range) {
    case "7d":
      return {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
    case "30d":
      return {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      };
    case "ytd":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now
      };
    case "all":
    default:
      return {
        start: new Date(0),
        end: now
      };
  }
};
