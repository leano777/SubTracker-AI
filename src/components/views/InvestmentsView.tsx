import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../utils/formatters';

interface Investment {
  id: string;
  name: string;
  symbol: string;
  platform: string;
  type: 'Stock' | 'Crypto' | 'ETF' | 'Bond' | 'Other';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export const InvestmentsView: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    platform: 'Robinhood',
    type: 'Stock',
    quantity: '',
    purchasePrice: '',
    currentPrice: ''
  });

  useEffect(() => {
    // Load investments from localStorage or initialize with demo data
    const localDataKey = `subtracker_investments_local-user-001`;
    const storedInvestments = localStorage.getItem(localDataKey);
    
    if (storedInvestments) {
      setInvestments(JSON.parse(storedInvestments));
    } else {
      // Initialize with demo investments
      const demoInvestments: Investment[] = [
        {
          id: '1',
          name: 'Apple Inc.',
          symbol: 'AAPL',
          platform: 'Robinhood',
          type: 'Stock',
          quantity: 10,
          purchasePrice: 150,
          currentPrice: 195,
          purchaseDate: '2024-01-15',
          totalValue: 1950,
          gainLoss: 450,
          gainLossPercent: 30
        },
        {
          id: '2',
          name: 'Bitcoin',
          symbol: 'BTC',
          platform: 'Coinbase',
          type: 'Crypto',
          quantity: 0.05,
          purchasePrice: 40000,
          currentPrice: 65000,
          purchaseDate: '2023-12-01',
          totalValue: 3250,
          gainLoss: 1250,
          gainLossPercent: 62.5
        },
        {
          id: '3',
          name: 'Vanguard S&P 500',
          symbol: 'VOO',
          platform: 'Vanguard',
          type: 'ETF',
          quantity: 5,
          purchasePrice: 400,
          currentPrice: 450,
          purchaseDate: '2024-03-10',
          totalValue: 2250,
          gainLoss: 250,
          gainLossPercent: 12.5
        },
        {
          id: '4',
          name: 'Tesla Inc.',
          symbol: 'TSLA',
          platform: 'Robinhood',
          type: 'Stock',
          quantity: 3,
          purchasePrice: 250,
          currentPrice: 180,
          purchaseDate: '2024-02-20',
          totalValue: 540,
          gainLoss: -210,
          gainLossPercent: -28
        },
        {
          id: '5',
          name: 'Ethereum',
          symbol: 'ETH',
          platform: 'Coinbase',
          type: 'Crypto',
          quantity: 1.5,
          purchasePrice: 2000,
          currentPrice: 3500,
          purchaseDate: '2024-01-01',
          totalValue: 5250,
          gainLoss: 2250,
          gainLossPercent: 75
        }
      ];
      
      setInvestments(demoInvestments);
      localStorage.setItem(localDataKey, JSON.stringify(demoInvestments));
    }
  }, []);

  const handleAddInvestment = () => {
    const quantity = parseFloat(formData.quantity);
    const purchasePrice = parseFloat(formData.purchasePrice);
    const currentPrice = parseFloat(formData.currentPrice);
    const totalValue = quantity * currentPrice;
    const totalCost = quantity * purchasePrice;
    const gainLoss = totalValue - totalCost;
    const gainLossPercent = ((gainLoss / totalCost) * 100);

    const newInvestment: Investment = {
      id: Date.now().toString(),
      name: formData.name,
      symbol: formData.symbol.toUpperCase(),
      platform: formData.platform,
      type: formData.type as Investment['type'],
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate: new Date().toISOString().split('T')[0],
      totalValue,
      gainLoss,
      gainLossPercent
    };

    const updated = [...investments, newInvestment];
    setInvestments(updated);
    localStorage.setItem(`subtracker_investments_local-user-001`, JSON.stringify(updated));
    
    setShowAddForm(false);
    setFormData({
      name: '',
      symbol: '',
      platform: 'Robinhood',
      type: 'Stock',
      quantity: '',
      purchasePrice: '',
      currentPrice: ''
    });
  };

  const totalPortfolioValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalGainLoss = investments.reduce((sum, inv) => sum + inv.gainLoss, 0);
  const totalGainLossPercent = totalPortfolioValue > 0 
    ? ((totalGainLoss / (totalPortfolioValue - totalGainLoss)) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your investment performance across all platforms
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Investment
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Current value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {totalGainLoss >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLossPercent.toFixed(2)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{investments.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Investment Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Name (e.g., Apple Inc.)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Symbol (e.g., AAPL)"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Robinhood">Robinhood</option>
                <option value="Coinbase">Coinbase</option>
                <option value="Vanguard">Vanguard</option>
                <option value="Fidelity">Fidelity</option>
                <option value="E*TRADE">E*TRADE</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Stock">Stock</option>
                <option value="Crypto">Crypto</option>
                <option value="ETF">ETF</option>
                <option value="Bond">Bond</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                step="0.0001"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Purchase Price"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Current Price"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg col-span-2 md:col-span-1"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddInvestment}>Add Investment</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investments List */}
      <div className="grid gap-4">
        {investments.map((investment) => (
          <Card key={investment.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{investment.name}</h3>
                    <Badge variant="secondary">{investment.symbol}</Badge>
                    <Badge variant="outline">{investment.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{investment.platform}</span>
                    <span>{investment.quantity} shares</span>
                    <span>Bought at {formatCurrency(investment.purchasePrice)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(investment.totalValue)}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    investment.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {investment.gainLoss >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {investment.gainLoss >= 0 ? '+' : ''}{formatCurrency(investment.gainLoss)}
                    </span>
                    <span className="text-sm">
                      ({investment.gainLossPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InvestmentsView;