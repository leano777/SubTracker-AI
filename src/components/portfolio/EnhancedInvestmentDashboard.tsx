import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Plus,
  Search,
  Filter,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Globe,
  Bitcoin,
  Building2,
  Briefcase,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Activity,
  Calendar,
  Clock,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Alert, AlertDescription } from '../ui/alert';
import type { Investment } from '../../types/financial';
import { formatCurrency } from '../../utils/helpers';
import { useFinancialStore } from '../../stores/useFinancialStore';

// Mock real-time price updates (in production, this would connect to a real API)
const generatePriceUpdate = (currentPrice: number): number => {
  const changePercent = (Math.random() - 0.5) * 0.02; // ±1% change
  return currentPrice * (1 + changePercent);
};

interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  bestPerformer: Investment | null;
  worstPerformer: Investment | null;
  allocation: {
    stocks: number;
    crypto: number;
    etfs: number;
    other: number;
  };
}

const calculatePortfolioMetrics = (investments: Investment[]): PortfolioMetrics => {
  let totalValue = 0;
  let totalCost = 0;
  let dayChange = 0;
  let bestReturn = -Infinity;
  let worstReturn = Infinity;
  let bestPerformer = null;
  let worstPerformer = null;
  
  const allocation = {
    stocks: 0,
    crypto: 0,
    etfs: 0,
    other: 0
  };

  investments.forEach(inv => {
    const value = inv.quantity * inv.currentPrice;
    const cost = inv.quantity * inv.purchasePrice;
    const returnPercent = ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100;
    
    totalValue += value;
    totalCost += cost;
    dayChange += (inv.dayChange || 0) * inv.quantity;
    
    // Track allocation
    if (inv.type === 'stock') allocation.stocks += value;
    else if (inv.type === 'crypto') allocation.crypto += value;
    else if (inv.type === 'etf') allocation.etfs += value;
    else allocation.other += value;
    
    // Track best/worst performers
    if (returnPercent > bestReturn) {
      bestReturn = returnPercent;
      bestPerformer = inv;
    }
    if (returnPercent < worstReturn) {
      worstReturn = returnPercent;
      worstPerformer = inv;
    }
  });

  const totalReturn = totalValue - totalCost;
  const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
  const dayChangePercent = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalReturn,
    totalReturnPercent,
    dayChange,
    dayChangePercent,
    bestPerformer,
    worstPerformer,
    allocation
  };
};

export const EnhancedInvestmentDashboard: React.FC = () => {
  const { investments, updateInvestment, addInvestment, deleteInvestment } = useFinancialStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('value');
  const [showBalances, setShowBalances] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  const [priceAlerts, setPriceAlerts] = useState<Record<string, { high?: number; low?: number }>>({});

  // Calculate portfolio metrics
  const metrics = useMemo(() => calculatePortfolioMetrics(investments), [investments]);

  // Filter and sort investments
  const filteredInvestments = useMemo(() => {
    let filtered = [...investments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(inv => 
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(inv => inv.type === filterType);
    }

    // Platform filter
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(inv => inv.platform === filterPlatform);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice);
        case 'return':
          return ((b.currentPrice - b.purchasePrice) / b.purchasePrice) - 
                 ((a.currentPrice - a.purchasePrice) / a.purchasePrice);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [investments, searchTerm, filterType, filterPlatform, sortBy]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (investments.length > 0 && Math.random() > 0.7) {
        const randomIndex = Math.floor(Math.random() * investments.length);
        const investment = investments[randomIndex];
        const newPrice = generatePriceUpdate(investment.currentPrice);
        const priceChange = newPrice - investment.currentPrice;
        
        updateInvestment(investment.id, {
          currentPrice: newPrice,
          dayChange: (investment.dayChange || 0) + priceChange,
          dayChangePercent: (priceChange / investment.currentPrice) * 100,
          lastUpdated: new Date().toISOString()
        });

        // Check price alerts
        const alert = priceAlerts[investment.id];
        if (alert) {
          if (alert.high && newPrice >= alert.high) {
            // In production, trigger notification
            console.log(`Price alert: ${investment.symbol} reached high target of ${alert.high}`);
          }
          if (alert.low && newPrice <= alert.low) {
            console.log(`Price alert: ${investment.symbol} reached low target of ${alert.low}`);
          }
        }
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [investments, updateInvestment, priceAlerts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In production, this would fetch real prices from an API
    setTimeout(() => {
      investments.forEach(inv => {
        const newPrice = generatePriceUpdate(inv.currentPrice);
        updateInvestment(inv.id, {
          currentPrice: newPrice,
          lastUpdated: new Date().toISOString()
        });
      });
      setIsRefreshing(false);
    }, 1000);
  };

  const getTypeIcon = (type: Investment['type']) => {
    switch (type) {
      case 'stock': return Building2;
      case 'crypto': return Bitcoin;
      case 'etf': return Briefcase;
      default: return DollarSign;
    }
  };

  const getRiskColor = (risk: Investment['riskLevel']) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'very_high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {showBalances ? formatCurrency(metrics.totalValue) : '••••••'}
              </span>
              <Badge 
                variant={metrics.totalReturnPercent >= 0 ? 'default' : 'destructive'}
                className="gap-1"
              >
                {metrics.totalReturnPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metrics.totalReturnPercent.toFixed(2)}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {metrics.totalReturn >= 0 ? 'Profit' : 'Loss'}: {formatCurrency(Math.abs(metrics.totalReturn))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${metrics.dayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.dayChange >= 0 ? '+' : ''}{formatCurrency(metrics.dayChange)}
              </span>
              <Badge 
                variant={metrics.dayChange >= 0 ? 'default' : 'destructive'}
                className="gap-1"
              >
                {metrics.dayChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(metrics.dayChangePercent).toFixed(2)}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Updated: {new Date().toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Best Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.bestPerformer ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="gap-1">
                    {metrics.bestPerformer.symbol}
                  </Badge>
                  <span className="text-sm font-medium">
                    {metrics.bestPerformer.name.substring(0, 15)}...
                  </span>
                </div>
                <p className="text-sm text-green-500 mt-1">
                  +{(((metrics.bestPerformer.currentPrice - metrics.bestPerformer.purchasePrice) / 
                      metrics.bestPerformer.purchasePrice) * 100).toFixed(2)}%
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No investments</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="text-lg font-semibold">Good</span>
            </div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Diversified across {Object.keys(metrics.allocation).filter(k => metrics.allocation[k as keyof typeof metrics.allocation] > 0).length} asset types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search investments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stock">Stocks</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="etf">ETFs</SelectItem>
                  <SelectItem value="mutual_fund">Mutual Funds</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="robinhood">Robinhood</SelectItem>
                  <SelectItem value="coinbase">Coinbase</SelectItem>
                  <SelectItem value="vanguard">Vanguard</SelectItem>
                  <SelectItem value="fidelity">Fidelity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
              >
                {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Investment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="thesis">Investment Thesis</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          {/* Holdings List */}
          <div className="grid gap-4">
            {filteredInvestments.map((investment) => {
              const value = investment.quantity * investment.currentPrice;
              const cost = investment.quantity * investment.purchasePrice;
              const returnAmount = value - cost;
              const returnPercent = ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100;
              const Icon = getTypeIcon(investment.type);

              return (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg bg-${investment.type === 'crypto' ? 'orange' : 'blue'}-100`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{investment.symbol}</h3>
                              <Badge variant="outline" className="text-xs">
                                {investment.type}
                              </Badge>
                              {investment.conviction === 'very_high' && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{investment.name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {investment.quantity} shares @ {formatCurrency(investment.purchasePrice)}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {investment.platform}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">{showBalances ? formatCurrency(value) : '••••'}</p>
                          <div className={`flex items-center justify-end gap-1 text-sm ${returnPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {returnPercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {showBalances ? formatCurrency(Math.abs(returnAmount)) : '••••'}
                            <span className="text-xs">({returnPercent.toFixed(2)}%)</span>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Current: {formatCurrency(investment.currentPrice)}
                            </span>
                            {investment.dayChange !== undefined && (
                              <Badge 
                                variant={investment.dayChange >= 0 ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {investment.dayChange >= 0 ? '+' : ''}{investment.dayChangePercent?.toFixed(2)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Investment Details */}
                      {investment.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">{investment.notes}</p>
                        </div>
                      )}

                      {/* Risk and Target Prices */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className={`w-4 h-4 ${getRiskColor(investment.riskLevel)}`} />
                          <span className="text-xs capitalize">{investment.riskLevel} risk</span>
                        </div>
                        {investment.targetPrice && (
                          <div className="flex items-center gap-1">
                            <ChevronUp className="w-4 h-4 text-green-500" />
                            <span className="text-xs">Target: {formatCurrency(investment.targetPrice)}</span>
                          </div>
                        )}
                        {investment.stopLoss && (
                          <div className="flex items-center gap-1">
                            <ChevronDown className="w-4 h-4 text-red-500" />
                            <span className="text-xs">Stop: {formatCurrency(investment.stopLoss)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredInvestments.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No investments found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track your portfolio performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Performance charts and analytics will be displayed here
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
              <CardDescription>Asset distribution and diversification analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Stocks</p>
                  <p className="text-2xl font-bold">{((metrics.allocation.stocks / metrics.totalValue) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(metrics.allocation.stocks)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Crypto</p>
                  <p className="text-2xl font-bold">{((metrics.allocation.crypto / metrics.totalValue) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(metrics.allocation.crypto)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ETFs</p>
                  <p className="text-2xl font-bold">{((metrics.allocation.etfs / metrics.totalValue) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(metrics.allocation.etfs)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Other</p>
                  <p className="text-2xl font-bold">{((metrics.allocation.other / metrics.totalValue) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(metrics.allocation.other)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thesis">
          <Card>
            <CardHeader>
              <CardTitle>Investment Thesis Tracker</CardTitle>
              <CardDescription>Document and track your investment reasoning</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Investment thesis documentation will be displayed here
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};