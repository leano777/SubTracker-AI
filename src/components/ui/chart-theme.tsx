
export interface ChartThemeConfig {
  colors: {
    primary: string[];
    gradient: {
      from: string;
      to: string;
    }[];
  };
  borderRadius: number;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  animation: {
    duration: number;
    easing: string;
  };
}

// Enhanced theme configurations for different modes
export const chartThemes = {
  light: {
    colors: {
      primary: [
        "#3b82f6", // Blue
        "#10b981", // Emerald
        "#f59e0b", // Amber
        "#ef4444", // Red
        "#8b5cf6", // Violet
        "#06b6d4", // Cyan
        "#84cc16", // Lime
        "#f97316"  // Orange
      ],
      gradient: [
        { from: "#3b82f6", to: "#1e40af" },
        { from: "#10b981", to: "#059669" },
        { from: "#f59e0b", to: "#d97706" },
        { from: "#ef4444", to: "#dc2626" },
        { from: "#8b5cf6", to: "#7c3aed" },
        { from: "#06b6d4", to: "#0891b2" },
        { from: "#84cc16", to: "#65a30d" },
        { from: "#f97316", to: "#ea580c" }
      ]
    },
    borderRadius: 8,
    strokeWidth: 2,
    fontSize: 12,
    fontFamily: "Inter, system-ui, sans-serif",
    animation: {
      duration: 800,
      easing: "ease-in-out"
    }
  },
  dark: {
    colors: {
      primary: [
        "#60a5fa", // Blue lighter
        "#34d399", // Emerald lighter
        "#fbbf24", // Amber lighter
        "#f87171", // Red lighter
        "#a78bfa", // Violet lighter
        "#22d3ee", // Cyan lighter
        "#a3e635", // Lime lighter
        "#fb923c"  // Orange lighter
      ],
      gradient: [
        { from: "#60a5fa", to: "#3b82f6" },
        { from: "#34d399", to: "#10b981" },
        { from: "#fbbf24", to: "#f59e0b" },
        { from: "#f87171", to: "#ef4444" },
        { from: "#a78bfa", to: "#8b5cf6" },
        { from: "#22d3ee", to: "#06b6d4" },
        { from: "#a3e635", to: "#84cc16" },
        { from: "#fb923c", to: "#f97316" }
      ]
    },
    borderRadius: 8,
    strokeWidth: 2,
    fontSize: 12,
    fontFamily: "Inter, system-ui, sans-serif",
    animation: {
      duration: 800,
      easing: "ease-in-out"
    }
  },
  stealthOps: {
    colors: {
      primary: [
        "#00ff00", // Tactical Green
        "#ffffff", // White
        "#ffff00", // Yellow
        "#ff0000", // Red alert
        "#808080", // Gray
        "#00ffff", // Cyan
        "#ff8000", // Orange
        "#c0c0c0"  // Silver
      ],
      gradient: [
        { from: "#00ff00", to: "#008000" },
        { from: "#ffffff", to: "#c0c0c0" },
        { from: "#ffff00", to: "#cccc00" },
        { from: "#ff0000", to: "#cc0000" },
        { from: "#808080", to: "#404040" },
        { from: "#00ffff", to: "#008080" },
        { from: "#ff8000", to: "#cc6600" },
        { from: "#c0c0c0", to: "#808080" }
      ]
    },
    borderRadius: 2,
    strokeWidth: 3,
    fontSize: 11,
    fontFamily: "Courier New, Monaco, Consolas, monospace",
    animation: {
      duration: 400,
      easing: "linear"
    }
  }
} as const;

export type ChartTheme = keyof typeof chartThemes;

// Create gradient definitions for SVG charts
export const ChartGradients = ({ theme = "light" }: { theme?: ChartTheme }) => {
  const themeConfig = chartThemes[theme];
  
  return (
    <defs>
      {themeConfig.colors.gradient.map((gradient, index) => (
        <linearGradient 
          key={`gradient-${index}`}
          id={`chart-gradient-${index}`} 
          x1="0%" 
          y1="0%" 
          x2="0%" 
          y2="100%"
        >
          <stop offset="0%" stopColor={gradient.from} stopOpacity={0.8} />
          <stop offset="100%" stopColor={gradient.to} stopOpacity={0.2} />
        </linearGradient>
      ))}
      
      {/* Glassmorphic overlay gradient */}
      <linearGradient id="glass-overlay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
      </linearGradient>
      
      {/* Enhanced bar gradient for 3D effect */}
      {themeConfig.colors.primary.map((color, index) => (
        <linearGradient 
          key={`bar-gradient-${index}`}
          id={`bar-gradient-${index}`} 
          x1="0%" 
          y1="0%" 
          x2="100%" 
          y2="0%"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.9} />
          <stop offset="50%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
        </linearGradient>
      ))}
    </defs>
  );
};

// Enhanced tooltip styles
export const getTooltipConfig = (theme: ChartTheme) => {
  const themeConfig = chartThemes[theme];
  
  return {
    contentStyle: {
      backgroundColor: theme === "stealthOps" 
        ? "rgba(0, 0, 0, 0.95)" 
        : theme === "dark"
        ? "rgba(31, 41, 55, 0.9)"
        : "rgba(255, 255, 255, 0.9)",
      border: theme === "stealthOps" 
        ? "1px solid #333333" 
        : "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: themeConfig.borderRadius,
      boxShadow: theme === "stealthOps" 
        ? "0 0 10px rgba(0, 255, 0, 0.3)"
        : "0 4px 16px rgba(0, 0, 0, 0.1)",
      backdropFilter: theme === "stealthOps" ? "none" : "blur(8px)",
      fontSize: themeConfig.fontSize,
      fontFamily: themeConfig.fontFamily,
      color: theme === "light" ? "#1f2937" : "#f9fafb",
      fontWeight: theme === "stealthOps" ? 600 : 500
    },
    labelStyle: {
      color: theme === "stealthOps" ? "#00ff00" : theme === "dark" ? "#f3f4f6" : "#374151",
      fontWeight: 600
    },
    itemStyle: {
      color: theme === "light" ? "#1f2937" : "#f9fafb"
    }
  };
};

// Grid configuration
export const getGridConfig = (theme: ChartTheme) => {
  return {
    strokeDasharray: theme === "stealthOps" ? "2 2" : "3 3",
    stroke: theme === "stealthOps" 
      ? "#333333" 
      : theme === "dark" 
      ? "#374151" 
      : "#e5e7eb",
    strokeOpacity: theme === "stealthOps" ? 0.8 : 0.5
  };
};

// Axis configuration
export const getAxisConfig = (theme: ChartTheme) => {
  const themeConfig = chartThemes[theme];
  
  return {
    tick: {
      fontSize: themeConfig.fontSize,
      fontFamily: themeConfig.fontFamily,
      fill: theme === "stealthOps" 
        ? "#cccccc" 
        : theme === "dark" 
        ? "#9ca3af" 
        : "#6b7280",
      fontWeight: theme === "stealthOps" ? 500 : 400
    },
    axisLine: {
      stroke: theme === "stealthOps" 
        ? "#333333" 
        : theme === "dark" 
        ? "#374151" 
        : "#e5e7eb",
      strokeWidth: 1
    },
    tickLine: {
      stroke: theme === "stealthOps" 
        ? "#333333" 
        : theme === "dark" 
        ? "#374151" 
        : "#e5e7eb",
      strokeWidth: 1
    }
  };
};
