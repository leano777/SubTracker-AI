import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Filter,
  Download,
  Maximize2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import type { 
  Transaction, 
  CashFlowPeriod,
  TransactionCategory
} from '../../types/financial';

interface CashFlowChartsProps {
  transactions: Transaction[];
  cashFlowHistory: CashFlowPeriod[];
  categories: TransactionCategory[];
  onExportData?: () => void;
}

const CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
];

const PERIOD_OPTIONS = [
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last90days', label: 'Last 90 Days' },
  { value: 'last6months', label: 'Last 6 Months' },
  { value: 'lastyear', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

export const CashFlowCharts = ({
  transactions,
  cashFlowHistory,
  categories,
  onExportData,
}: CashFlowChartsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [activeChart, setActiveChart] = useState('overview');

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    if (selectedPeriod === 'all') return transactions;

    const now = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case 'last7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'last6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'lastyear':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, selectedPeriod]);

  // Prepare cash flow data for line chart
  const cashFlowData = useMemo(() => {
    const groupedData: Record<string, { income: number; expenses: number; date: string }> = {};

    filteredTransactions.forEach(transaction => {
      const date = transaction.date.split('T')[0]; // Get date portion only
      
      if (!groupedData[date]) {
        groupedData[date] = { income: 0, expenses: 0, date };
      }

      if (transaction.type === 'income') {
        groupedData[date].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        groupedData[date].expenses += Math.abs(transaction.amount);
      }
    });

    const sortedData = Object.values(groupedData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        netCashFlow: item.income - item.expenses,
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
      }));

    return sortedData;
  }, [filteredTransactions]);

  // Prepare category breakdown data
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = categories.find(c => c.id === transaction.category);
        const categoryName = category?.name || transaction.category;
        
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = 0;
        }
        categoryTotals[categoryName] += Math.abs(transaction.amount);
      });

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10 categories
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [filteredTransactions, categories]);

  // Prepare monthly trend data
  const monthlyTrendData = useMemo(() => {
    const monthlyData: Record<string, { income: number; expenses: number; month: string }> = {};

    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthLabel = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, month: monthLabel };
      }

      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        monthlyData[monthKey].expenses += Math.abs(transaction.amount);
      }
    });

    return Object.values(monthlyData)
      .sort((a, b) => new Date(a.month + ' 1').getTime() - new Date(b.month + ' 1').getTime())
      .map(item => ({
        ...item,
        netCashFlow: item.income - item.expenses,
      }));
  }, [filteredTransactions]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const avgDailyIncome = income / (filteredTransactions.length || 1);
    const avgDailyExpense = expenses / (filteredTransactions.length || 1);

    return {
      income,
      expenses,
      netCashFlow: income - expenses,
      avgDailyIncome,
      avgDailyExpense,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cash Flow Analytics</h2>
          <p className="text-muted-foreground">
            Visualize your financial patterns and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.income)}
                </div>
                <p className="text-xs text-muted-foreground">Total Income</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.expenses)}
                </div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={summary.netCashFlow >= 0 ? 'border-green-300' : 'border-red-300'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <div>
                <div className={`text-2xl font-bold ${
                  summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.netCashFlow)}
                </div>
                <p className="text-xs text-muted-foreground">Net Cash Flow</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summary.transactionCount}</div>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Tabs */}
      <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Cash Flow</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="comparison">Income vs Expenses</TabsTrigger>
        </TabsList>

        {/* Cash Flow Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Daily Cash Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      name="Income"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stackId="2"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.3}
                      name="Expenses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netCashFlow" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Net Cash Flow"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Breakdown */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Expense Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryData.slice(0, 6).map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(category.value)}</span>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Income vs Expenses Comparison */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Income vs Expenses Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Expenses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netCashFlow" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name="Net Cash Flow"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};