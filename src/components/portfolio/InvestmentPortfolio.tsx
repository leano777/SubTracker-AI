import { useState, useMemo } from 'react';
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
  Edit,
  Trash2,
  ExternalLink,
  Building,
  Smartphone,
  Coins,
  Target,
  AlertCircle,
  CheckCircle,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import type { Investment } from '../../types/financial';

interface InvestmentPortfolioProps {
  investments: Investment[];
  onAddInvestment: (investment: Investment) => void;
  onUpdateInvestment: (id: string, updates: Partial<Investment>) => void;
  onDeleteInvestment: (id: string) => void;
}

const PLATFORM_ICONS = {
  robinhood: Building,
  coinbase: Coins,
  sequence: Smartphone,
  vanguard: Building,
  fidelity: Building,
  other: Building,
};

const PLATFORM_COLORS = {
  robinhood: '#00C805',
  coinbase: '#0052FF',
  sequence: '#6366F1',
  vanguard: '#C41E3A',
  fidelity: '#00A862',
  other: '#6B7280',
};

const InvestmentCard = ({ 
  investment, 
  onUpdate, 
  onDelete 
}: {
  investment: Investment;
  onUpdate: (updates: Partial<Investment>) => void;
  onDelete: () => void;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const Icon = PLATFORM_ICONS[investment.platform] || Building;
  const platformColor = PLATFORM_COLORS[investment.platform] || '#6B7280';
  
  const totalValue = investment.quantity * investment.currentPrice;
  const totalReturn = totalValue - (investment.quantity * investment.purchasePrice);
  const percentReturn = ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100;
  const dayChange = investment.dayChange || 0;
  const dayChangePercent = investment.dayChangePercent || 0;
  
  const isPositive = totalReturn >= 0;
  const isDayPositive = dayChange >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getConvictionBadge = () => {
    const variants = {
      low: 'secondary',
      medium: 'outline',
      high: 'default',
      very_high: 'destructive'
    } as const;
    return variants[investment.conviction];
  };

  const getRiskColor = () => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      very_high: 'text-red-600'
    };
    return colors[investment.riskLevel];
  };

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: platformColor }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {investment.symbol}
                {investment.type === 'crypto' && <Coins className="w-4 h-4 text-orange-500" />}
              </CardTitle>
              <CardDescription className="text-sm">
                {investment.name}
              </CardDescription>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowDetails(true)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Position
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="w-4 h-4 mr-2" />
                View on {investment.platform}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Return</p>
            <div className="flex items-center">
              <p className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalReturn)}
              </p>
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-green-600 ml-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600 ml-1" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Return %</p>
            <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(percentReturn)}
            </p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Day Change</p>
            <p className={`font-semibold ${isDayPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(dayChangePercent)}
            </p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="font-semibold">{investment.quantity}</p>
          </div>
        </div>

        {/* Investment Characteristics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getConvictionBadge()}>
              {investment.conviction.replace('_', ' ')}
            </Badge>
            <span className={`text-xs ${getRiskColor()}`}>
              {investment.riskLevel} risk
            </span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < (investment.conviction === 'very_high' ? 5 : 
                       investment.conviction === 'high' ? 4 :
                       investment.conviction === 'medium' ? 3 : 2)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <Plus className="w-3 h-3 mr-1" />
            Buy More
          </Button>
          <Button variant="outline" size="sm">
            <TrendingDown className="w-3 h-3 mr-1" />
            Sell Position
          </Button>
        </div>
      </CardContent>

      {/* Detailed View Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{investment.name} ({investment.symbol})</DialogTitle>
            <DialogDescription>
              Detailed investment information and performance analysis
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Position Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Purchase Price:</span>
                    <span>{formatCurrency(investment.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Price:</span>
                    <span>{formatCurrency(investment.currentPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{investment.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Invested:</span>
                    <span>{formatCurrency(investment.quantity * investment.purchasePrice)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current Value:</span>
                    <span>{formatCurrency(totalValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Return:</span>
                    <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(totalReturn)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return %:</span>
                    <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                      {formatPercent(percentReturn)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Day Change:</span>
                    <span className={isDayPositive ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(dayChange)} ({formatPercent(dayChangePercent)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {investment.notes && (
              <div>
                <h4 className="font-semibold mb-2">Investment Notes</h4>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  {investment.notes}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export const InvestmentPortfolio = ({
  investments,
  onAddInvestment,
  onUpdateInvestment,
  onDeleteInvestment,
}: InvestmentPortfolioProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('value');

  // Calculate portfolio summary
  const portfolioSummary = useMemo(() => {
    const totalValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
    const totalReturn = totalValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const dayChange = investments.reduce((sum, inv) => sum + (inv.dayChange || 0), 0);

    return {
      totalValue,
      totalInvested,
      totalReturn,
      totalReturnPercent,
      dayChange,
      totalHoldings: investments.length,
    };
  }, [investments]);

  // Filter and sort investments
  const filteredInvestments = useMemo(() => {
    let filtered = investments.filter(inv => {
      const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inv.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = filterPlatform === 'all' || inv.platform === filterPlatform;
      const matchesType = filterType === 'all' || inv.type === filterType;
      
      return matchesSearch && matchesPlatform && matchesType;
    });

    // Sort investments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice);
        case 'return':
          const aReturn = ((a.currentPrice - a.purchasePrice) / a.purchasePrice) * 100;
          const bReturn = ((b.currentPrice - b.purchasePrice) / b.purchasePrice) * 100;
          return bReturn - aReturn;
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });

    return filtered;
  }, [investments, searchTerm, filterPlatform, filterType, sortBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Investment Portfolio</h2>
          <p className="text-muted-foreground">
            Track your investments across all platforms
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Investment</DialogTitle>
              <DialogDescription>
                Add a new investment to your portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-4 text-muted-foreground">
              Investment form coming soon...
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Portfolio Value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${portfolioSummary.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(portfolioSummary.totalReturn)}
            </div>
            <p className="text-xs text-muted-foreground">Total Return</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${portfolioSummary.totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(portfolioSummary.totalReturnPercent)}
            </div>
            <p className="text-xs text-muted-foreground">Return %</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${portfolioSummary.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(portfolioSummary.dayChange)}
            </div>
            <p className="text-xs text-muted-foreground">Day Change</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{portfolioSummary.totalHoldings}</div>
            <p className="text-xs text-muted-foreground">Holdings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search investments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="robinhood">Robinhood</SelectItem>
            <SelectItem value="coinbase">Coinbase</SelectItem>
            <SelectItem value="sequence">Sequence</SelectItem>
            <SelectItem value="vanguard">Vanguard</SelectItem>
            <SelectItem value="fidelity">Fidelity</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="stock">Stocks</SelectItem>
            <SelectItem value="etf">ETFs</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="bond">Bonds</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="value">Value</SelectItem>
            <SelectItem value="return">Return %</SelectItem>
            <SelectItem value="symbol">Symbol</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Investments Grid */}
      <Tabs defaultValue="holdings" className="w-full">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>
        
        <TabsContent value="holdings" className="space-y-4">
          {filteredInvestments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Investments Found</h3>
                <p className="text-muted-foreground mb-4">
                  {investments.length === 0 
                    ? "Start building your portfolio by adding your first investment"
                    : "No investments match your current filters"
                  }
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Investment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Investment</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-4 text-muted-foreground">
                      Investment form coming soon...
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInvestments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  onUpdate={(updates) => onUpdateInvestment(investment.id, updates)}
                  onDelete={() => onDeleteInvestment(investment.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Portfolio Analytics</h3>
              <p className="text-muted-foreground">
                Advanced analytics and performance charts coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="watchlist" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Investment Watchlist</h3>
              <p className="text-muted-foreground">
                Track potential investments and research targets
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};