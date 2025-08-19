import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Percent,
  AlertCircle,
  ChevronRight,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { Investment } from '../../types/financial';
import { formatCurrency } from '../../utils/helpers';

interface PerformanceData {
  date: string;
  value: number;
  cost: number;
  return: number;
  returnPercent: number;
}

interface SectorPerformance {
  sector: string;
  value: number;
  return: number;
  count: number;
}

interface PortfolioPerformanceProps {
  investments: Investment[];
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  onTimeframeChange: (timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL') => void;
}

// Generate mock historical data (in production, this would come from an API)
const generateHistoricalData = (
  investments: Investment[],
  timeframe: string
): PerformanceData[] => {
  const days = timeframe === '1D' ? 1 : 
              timeframe === '1W' ? 7 : 
              timeframe === '1M' ? 30 : 
              timeframe === '3M' ? 90 : 
              timeframe === '1Y' ? 365 : 730;
  
  const data: PerformanceData[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Calculate portfolio value for this date
    let totalValue = 0;
    let totalCost = 0;
    
    investments.forEach(inv => {
      // Simulate historical price (simplified)
      const daysSincePurchase = Math.floor((date.getTime() - new Date(inv.purchaseDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSincePurchase >= 0) {
        const randomWalk = 1 + (Math.random() - 0.5) * 0.02 * Math.sqrt(daysSincePurchase);
        const historicalPrice = inv.purchasePrice * randomWalk;
        totalValue += inv.quantity * historicalPrice;
        totalCost += inv.quantity * inv.purchasePrice;
      }
    });
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: totalValue,
      cost: totalCost,
      return: totalValue - totalCost,
      returnPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    });
  }
  
  return data;
};

// Calculate sector performance
const calculateSectorPerformance = (investments: Investment[]): SectorPerformance[] => {
  const sectors: Record<string, { value: number; cost: number; count: number }> = {};
  
  investments.forEach(inv => {
    const sector = inv.sector || 'Other';
    if (!sectors[sector]) {
      sectors[sector] = { value: 0, cost: 0, count: 0 };
    }
    sectors[sector].value += inv.quantity * inv.currentPrice;
    sectors[sector].cost += inv.quantity * inv.purchasePrice;
    sectors[sector].count += 1;
  });
  
  return Object.entries(sectors).map(([sector, data]) => ({
    sector,
    value: data.value,
    return: ((data.value - data.cost) / data.cost) * 100,
    count: data.count
  }));
};

// Risk metrics calculation
const calculateRiskMetrics = (investments: Investment[]) => {
  const riskDistribution = {
    low: 0,
    medium: 0,
    high: 0,
    very_high: 0
  };
  
  investments.forEach(inv => {
    const value = inv.quantity * inv.currentPrice;
    riskDistribution[inv.riskLevel] += value;
  });
  
  const totalValue = Object.values(riskDistribution).reduce((a, b) => a + b, 0);
  
  return Object.entries(riskDistribution).map(([risk, value]) => ({
    risk: risk.replace('_', ' ').charAt(0).toUpperCase() + risk.slice(1),
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
  }));
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({
  investments,
  timeframe,
  onTimeframeChange
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'return' | 'percent'>('value');
  const [comparisonIndex, setComparisonIndex] = useState<'sp500' | 'nasdaq' | 'btc' | 'none'>('sp500');

  // Calculate performance data
  const performanceData = useMemo(() => 
    generateHistoricalData(investments, timeframe), 
    [investments, timeframe]
  );
  
  const sectorPerformance = useMemo(() => 
    calculateSectorPerformance(investments), 
    [investments]
  );
  
  const riskMetrics = useMemo(() => 
    calculateRiskMetrics(investments), 
    [investments]
  );

  // Calculate key metrics
  const currentPerformance = performanceData[performanceData.length - 1] || {
    value: 0,
    cost: 0,
    return: 0,
    returnPercent: 0
  };
  
  const startPerformance = performanceData[0] || currentPerformance;
  const periodReturn = currentPerformance.value - startPerformance.value;
  const periodReturnPercent = startPerformance.value > 0 
    ? (periodReturn / startPerformance.value) * 100 
    : 0;

  // Best and worst performing investments
  const performanceByInvestment = investments.map(inv => ({
    ...inv,
    returnPercent: ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100
  })).sort((a, b) => b.returnPercent - a.returnPercent);
  
  const topPerformers = performanceByInvestment.slice(0, 3);
  const bottomPerformers = performanceByInvestment.slice(-3).reverse();

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Period Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${periodReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {periodReturn >= 0 ? '+' : ''}{formatCurrency(periodReturn)}
              </span>
              <Badge variant={periodReturn >= 0 ? 'default' : 'destructive'}>
                {periodReturnPercent.toFixed(2)}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {timeframe} performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${currentPerformance.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {currentPerformance.return >= 0 ? '+' : ''}{formatCurrency(currentPerformance.return)}
              </span>
              <Badge variant={currentPerformance.return >= 0 ? 'default' : 'destructive'}>
                {currentPerformance.returnPercent.toFixed(2)}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              All-time return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Daily Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {(periodReturnPercent / performanceData.length).toFixed(3)}%
              </span>
              {periodReturnPercent / performanceData.length >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Daily average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Track your portfolio value over time</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={timeframe} onValueChange={(v: any) => onTimeframeChange(v)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1 Day</SelectItem>
                  <SelectItem value="1W">1 Week</SelectItem>
                  <SelectItem value="1M">1 Month</SelectItem>
                  <SelectItem value="3M">3 Months</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                  <SelectItem value="ALL">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#6b7280" 
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sector Performance and Risk Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sector Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sector Performance</CardTitle>
            <CardDescription>Performance breakdown by sector</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sectorPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => 
                    name === 'return' ? `${value.toFixed(2)}%` : formatCurrency(value)
                  }
                />
                <Bar dataKey="return" fill="#10b981">
                  {sectorPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Portfolio allocation by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ risk, percentage }) => `${risk}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top and Bottom Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{inv.symbol}</Badge>
                  <span className="text-sm">{inv.name}</span>
                </div>
                <span className="text-sm font-medium text-green-500">
                  +{inv.returnPercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Bottom Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bottomPerformers.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{inv.symbol}</Badge>
                  <span className="text-sm">{inv.name}</span>
                </div>
                <span className="text-sm font-medium text-red-500">
                  {inv.returnPercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Your portfolio has {currentPerformance.returnPercent >= 0 ? 'gained' : 'lost'} {' '}
              {Math.abs(currentPerformance.returnPercent).toFixed(2)}% overall, {' '}
              {currentPerformance.returnPercent >= 10 ? 'outperforming' : 
               currentPerformance.returnPercent >= 0 ? 'performing in line with' : 'underperforming'} {' '}
              the market average.
            </AlertDescription>
          </Alert>
          
          {sectorPerformance.length > 0 && (
            <Alert>
              <TrendingUp className="w-4 h-4" />
              <AlertDescription>
                Your best performing sector is <strong>{sectorPerformance[0].sector}</strong> with a {' '}
                {sectorPerformance[0].return.toFixed(2)}% return.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};