// Lazy-loaded chart components for performance optimization
// This implements code-splitting for heavy Recharts library
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load chart components to reduce initial bundle size
const LazyAreaChart = lazy(() => import('recharts').then(module => ({
  default: module.AreaChart
})));

const LazyArea = lazy(() => import('recharts').then(module => ({
  default: module.Area
})));

const LazyXAxis = lazy(() => import('recharts').then(module => ({
  default: module.XAxis
})));

const LazyYAxis = lazy(() => import('recharts').then(module => ({
  default: module.YAxis
})));

const LazyCartesianGrid = lazy(() => import('recharts').then(module => ({
  default: module.CartesianGrid
})));

const LazyTooltip = lazy(() => import('recharts').then(module => ({
  default: module.Tooltip
})));

const LazyResponsiveContainer = lazy(() => import('recharts').then(module => ({
  default: module.ResponsiveContainer
})));

const LazyBarChart = lazy(() => import('recharts').then(module => ({
  default: module.BarChart
})));

const LazyBar = lazy(() => import('recharts').then(module => ({
  default: module.Bar
})));

const LazyPieChart = lazy(() => import('recharts').then(module => ({
  default: module.PieChart
})));

const LazyPie = lazy(() => import('recharts').then(module => ({
  default: module.Pie
})));

const LazyCell = lazy(() => import('recharts').then(module => ({
  default: module.Cell
})));

const LazyLineChart = lazy(() => import('recharts').then(module => ({
  default: module.LineChart
})));

const LazyLine = lazy(() => import('recharts').then(module => ({
  default: module.Line
})));

const LazyLegend = lazy(() => import('recharts').then(module => ({
  default: module.Legend
})));

// Loading fallback component
const ChartLoading = () => (
  <div className="flex items-center justify-center h-64 w-full">
    <div className="flex flex-col items-center space-y-2">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="text-sm text-gray-600">Loading chart...</span>
    </div>
  </div>
);

// Wrapper components with Suspense
export const AreaChart = (props: any) => (
  <Suspense fallback={<ChartLoading />}>
    <LazyAreaChart {...props} />
  </Suspense>
);

export const Area = (props: any) => (
  <Suspense fallback={null}>
    <LazyArea {...props} />
  </Suspense>
);

export const XAxis = (props: any) => (
  <Suspense fallback={null}>
    <LazyXAxis {...props} />
  </Suspense>
);

export const YAxis = (props: any) => (
  <Suspense fallback={null}>
    <LazyYAxis {...props} />
  </Suspense>
);

export const CartesianGrid = (props: any) => (
  <Suspense fallback={null}>
    <LazyCartesianGrid {...props} />
  </Suspense>
);

export const Tooltip = (props: any) => (
  <Suspense fallback={null}>
    <LazyTooltip {...props} />
  </Suspense>
);

export const ResponsiveContainer = (props: any) => (
  <Suspense fallback={<ChartLoading />}>
    <LazyResponsiveContainer {...props} />
  </Suspense>
);

export const BarChart = (props: any) => (
  <Suspense fallback={<ChartLoading />}>
    <LazyBarChart {...props} />
  </Suspense>
);

export const Bar = (props: any) => (
  <Suspense fallback={null}>
    <LazyBar {...props} />
  </Suspense>
);

export const PieChart = (props: any) => (
  <Suspense fallback={<ChartLoading />}>
    <LazyPieChart {...props} />
  </Suspense>
);

export const Pie = (props: any) => (
  <Suspense fallback={null}>
    <LazyPie {...props} />
  </Suspense>
);

export const Cell = (props: any) => (
  <Suspense fallback={null}>
    <LazyCell {...props} />
  </Suspense>
);

export const LineChart = (props: any) => (
  <Suspense fallback={<ChartLoading />}>
    <LazyLineChart {...props} />
  </Suspense>
);

export const Line = (props: any) => (
  <Suspense fallback={null}>
    <LazyLine {...props} />
  </Suspense>
);

export const Legend = (props: any) => (
  <Suspense fallback={null}>
    <LazyLegend {...props} />
  </Suspense>
);

// Performance-optimized chart bundle
export const LazyChartBundle = {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ChartLoading
};

export default LazyChartBundle;
