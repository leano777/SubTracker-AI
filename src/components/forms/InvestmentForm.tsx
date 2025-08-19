import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Building,
  Smartphone,
  Coins,
  Target,
  AlertCircle,
  CheckCircle,
  Star,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  Sparkles,
  BarChart3,
  PieChart,
  Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import type { Investment } from '../../types/financial';

interface InvestmentFormProps {
  investment?: Investment;
  onSave: (data: Partial<Investment>) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

// Popular investments for quick selection
const POPULAR_INVESTMENTS = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', sector: 'Technology', suggestedPlatform: 'robinhood' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', sector: 'Technology', suggestedPlatform: 'robinhood' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'stock', sector: 'Automotive', suggestedPlatform: 'robinhood' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'etf', sector: 'Diversified', suggestedPlatform: 'vanguard' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf', sector: 'Diversified', suggestedPlatform: 'vanguard' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', sector: 'Cryptocurrency', suggestedPlatform: 'coinbase' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', sector: 'Cryptocurrency', suggestedPlatform: 'coinbase' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', sector: 'Technology', suggestedPlatform: 'robinhood' },
];

const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Stock', icon: BarChart3, description: 'Individual company shares' },
  { value: 'etf', label: 'ETF', icon: PieChart, description: 'Exchange-traded fund' },
  { value: 'crypto', label: 'Cryptocurrency', icon: Coins, description: 'Digital currency' },
  { value: 'mutual_fund', label: 'Mutual Fund', icon: Building, description: 'Managed fund' },
  { value: 'bond', label: 'Bond', icon: Shield, description: 'Fixed income security' },
  { value: 'option', label: 'Option', icon: Target, description: 'Derivative contract' },
  { value: 'other', label: 'Other', icon: FileText, description: 'Other investment type' },
];

const PLATFORMS = [
  { value: 'robinhood', label: 'Robinhood', icon: Building, color: '#00C805' },
  { value: 'coinbase', label: 'Coinbase', icon: Coins, color: '#0052FF' },
  { value: 'sequence', label: 'Sequence', icon: Smartphone, color: '#6366F1' },
  { value: 'vanguard', label: 'Vanguard', icon: Building, color: '#C41E3A' },
  { value: 'fidelity', label: 'Fidelity', icon: Building, color: '#00A862' },
  { value: 'other', label: 'Other Platform', icon: Building, color: '#6B7280' },
];

const CONVICTION_LEVELS = [
  { value: 'low', label: 'Low', description: 'Small position, testing waters', stars: 2 },
  { value: 'medium', label: 'Medium', description: 'Moderate conviction, standard position', stars: 3 },
  { value: 'high', label: 'High', description: 'Strong conviction, large position', stars: 4 },
  { value: 'very_high', label: 'Very High', description: 'Maximum conviction, core holding', stars: 5 },
];

const RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', color: 'text-green-600', description: 'Stable, conservative' },
  { value: 'medium', label: 'Medium Risk', color: 'text-yellow-600', description: 'Balanced risk/reward' },
  { value: 'high', label: 'High Risk', color: 'text-orange-600', description: 'Growth focused' },
  { value: 'very_high', label: 'Very High Risk', color: 'text-red-600', description: 'Speculative' },
];

const SECTORS = [
  'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical', 'Communication Services',
  'Industrials', 'Consumer Defensive', 'Energy', 'Utilities', 'Real Estate', 'Basic Materials', 
  'Cryptocurrency', 'Diversified', 'Other'
];

export const InvestmentForm = ({
  investment,
  onSave,
  onCancel,
  mode = 'create',
}: InvestmentFormProps) => {
  const [formData, setFormData] = useState<Partial<Investment>>({
    symbol: '',
    name: '',
    type: 'stock',
    quantity: 1,
    purchasePrice: 0,
    currentPrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    platform: 'robinhood',
    conviction: 'medium',
    riskLevel: 'medium',
    sector: '',
    notes: '',
    currency: 'USD',
    ...investment,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Calculate investment metrics
  const totalInvestment = (formData.quantity || 0) * (formData.purchasePrice || 0);
  const currentValue = (formData.quantity || 0) * (formData.currentPrice || 0);
  const totalReturn = currentValue - totalInvestment;
  const percentReturn = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

  // Auto-update current price to purchase price if not set
  useEffect(() => {
    if (mode === 'create' && formData.purchasePrice && !formData.currentPrice) {
      setFormData(prev => ({
        ...prev,
        currentPrice: prev.purchasePrice,
      }));
    }
  }, [formData.purchasePrice, mode]);

  const handleTemplateSelect = (template: typeof POPULAR_INVESTMENTS[0]) => {
    setFormData(prev => ({
      ...prev,
      symbol: template.symbol,
      name: template.name,
      type: template.type as Investment['type'],
      platform: template.suggestedPlatform as Investment['platform'],
      sector: template.sector,
    }));
    setSelectedTemplate(template.symbol);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate ID if creating new investment
    const investmentData = {
      ...formData,
      id: formData.id || `inv-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onSave(investmentData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = PLATFORMS.find(p => p.value === platform);
    const Icon = platformData?.icon || Building;
    return Icon;
  };

  const getTypeIcon = (type: string) => {
    const typeData = INVESTMENT_TYPES.find(t => t.value === type);
    const Icon = typeData?.icon || BarChart3;
    return Icon;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Templates */}
      {mode === 'create' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <Label className="text-sm font-medium">Quick Start Templates</Label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {POPULAR_INVESTMENTS.map((template) => {
              const Icon = getTypeIcon(template.type);
              return (
                <Button
                  key={template.symbol}
                  type="button"
                  variant={selectedTemplate === template.symbol ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-center">
                    <div className="font-semibold text-xs">{template.symbol}</div>
                    <div className="text-xs opacity-75">{template.type.toUpperCase()}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Symbol */}
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol/Ticker *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                placeholder="AAPL, BTC, VOO..."
                required
                className="uppercase"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Investment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Apple Inc., Bitcoin, etc."
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Investment Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Investment['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value as Investment['platform'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: platform.color }} />
                          <span>{platform.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Sector */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sector">Sector</Label>
              <Select
                value={formData.sector || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Financial Information Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity/Shares *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.00000001"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                placeholder="1.0"
                required
              />
            </div>

            {/* Purchase Price */}
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                  className="pl-9"
                  placeholder="150.00"
                  required
                />
              </div>
            </div>

            {/* Current Price */}
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: parseFloat(e.target.value) || 0 }))}
                  className="pl-9"
                  placeholder="160.00"
                />
              </div>
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </div>

          {/* Investment Summary Card */}
          {totalInvestment > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-3">Investment Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Invested</p>
                  <p className="font-semibold">{formatCurrency(totalInvestment)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Value</p>
                  <p className="font-semibold">{formatCurrency(currentValue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Return</p>
                  <p className={`font-semibold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalReturn)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Return %</p>
                  <p className={`font-semibold ${percentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {percentReturn >= 0 ? '+' : ''}{percentReturn.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-4">
          {/* Conviction Level */}
          <div className="space-y-3">
            <Label>Investment Conviction</Label>
            <RadioGroup
              value={formData.conviction}
              onValueChange={(value) => setFormData(prev => ({ ...prev, conviction: value as Investment['conviction'] }))}
            >
              {CONVICTION_LEVELS.map((level) => (
                <div key={level.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value={level.value} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{level.label}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < level.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Risk Level */}
          <div className="space-y-3">
            <Label>Risk Level</Label>
            <RadioGroup
              value={formData.riskLevel}
              onValueChange={(value) => setFormData(prev => ({ ...prev, riskLevel: value as Investment['riskLevel'] }))}
            >
              {RISK_LEVELS.map((risk) => (
                <div key={risk.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value={risk.value} />
                  <div className="flex-1">
                    <span className={`font-medium ${risk.color}`}>{risk.label}</span>
                    <p className="text-xs text-muted-foreground">{risk.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Target Price */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>Advanced Settings</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetPrice">Target Price</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="targetPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.targetPrice || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || undefined }))}
                      className="pl-9"
                      placeholder="200.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stopLoss">Stop Loss</Label>
                  <div className="relative">
                    <TrendingDown className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="stopLoss"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.stopLoss || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || undefined }))}
                      className="pl-9"
                      placeholder="120.00"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Investment Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Investment thesis, strategy, or other notes..."
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          {mode === 'create' ? 'Add Investment' : 'Update Investment'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};