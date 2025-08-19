import React, { useState, useEffect } from 'react';
import {
  Key,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Shield,
  Zap,
  DollarSign,
  Building,
  Bitcoin,
  TrendingUp,
  Eye,
  EyeOff,
  TestTube,
  Loader2,
  ChevronRight,
  Coins,
  LineChart,
  Activity,
  Link,
  Unlink,
  CheckCircle,
  Clock,
  Settings,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { marketDataService } from '../../services/api/marketDataService';
import { bankingService } from '../../services/api/bankingService';
// Temporarily commented out to resolve APIResponse import issue
// import { API_CONFIGS, isAPIConfigured, getAvailableAPIs } from '../../services/api/apiConfig';
// import { SecureCredentialStore, APIServiceRegistry } from '../../services/api/base';
// import { SequenceAPIService } from '../../services/api/sequence';
// import { CoinbaseAPIService } from '../../services/api/coinbase';
// import { RobinhoodAPIService } from '../../services/api/robinhood';

interface APIIntegration {
  id: string;
  name: string;
  description: string;
  category: 'market_data' | 'banking' | 'crypto' | 'brokerage';
  icon: React.ComponentType<any>;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  requiresKey: boolean;
  keyName?: string;
  documentationUrl: string;
  features: string[];
  pricing: string;
}

const API_INTEGRATIONS: APIIntegration[] = [
  // Phase 4 - New Premier Integrations
  {
    id: 'sequence',
    name: 'Sequence.io',
    description: 'Banking and transaction aggregation for comprehensive financial tracking',
    category: 'banking',
    icon: Building,
    status: 'disconnected',
    requiresKey: true,
    keyName: 'VITE_SEQUENCE_API_KEY',
    documentationUrl: 'https://docs.sequence.io',
    features: ['Bank sync', 'Transaction categorization', 'Subscription detection', 'Spending insights'],
    pricing: 'Professional: Contact for pricing',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Cryptocurrency portfolio tracking with real-time data',
    category: 'crypto',
    icon: Coins,
    status: 'disconnected',
    requiresKey: true,
    keyName: 'VITE_COINBASE_API_KEY',
    documentationUrl: 'https://docs.cloud.coinbase.com',
    features: ['Crypto portfolio sync', 'Real-time prices', 'P&L tracking', 'Historical data'],
    pricing: 'Free for personal use',
  },
  {
    id: 'robinhood',
    name: 'Robinhood',
    description: 'Stock and options portfolio synchronization',
    category: 'brokerage',
    icon: LineChart,
    status: 'disconnected',
    requiresKey: true,
    keyName: 'VITE_ROBINHOOD_ACCESS_TOKEN',
    documentationUrl: 'https://github.com/robinhood-unofficial/pyrh',
    features: ['Stock portfolio', 'Options tracking', 'Dividend history', 'Performance analytics'],
    pricing: 'Free (requires OAuth token)',
  },
  {
    id: 'alphaVantage',
    name: 'Alpha Vantage',
    description: 'Real-time and historical stock market data',
    category: 'market_data',
    icon: TrendingUp,
    status: 'disconnected',
    requiresKey: true,
    keyName: 'VITE_ALPHA_VANTAGE_KEY',
    documentationUrl: 'https://www.alphavantage.co/documentation/',
    features: ['Stock quotes', 'Historical data', 'Technical indicators', 'Fundamental data'],
    pricing: 'Free tier: 5 API calls/min, 500/day',
  },
  {
    id: 'yahooFinance',
    name: 'Yahoo Finance',
    description: 'Free market data without API key',
    category: 'market_data',
    icon: TrendingUp,
    status: 'connected',
    requiresKey: false,
    documentationUrl: 'https://finance.yahoo.com',
    features: ['Stock quotes', 'Historical data', 'Market news'],
    pricing: 'Free (no API key required)',
  },
  {
    id: 'coinGecko',
    name: 'CoinGecko',
    description: 'Comprehensive cryptocurrency data',
    category: 'crypto',
    icon: Bitcoin,
    status: 'connected',
    requiresKey: false,
    documentationUrl: 'https://www.coingecko.com/en/api',
    features: ['Crypto prices', 'Market cap', 'Volume data', 'Historical data'],
    pricing: 'Free tier: 10-50 calls/min',
  },
  {
    id: 'plaid',
    name: 'Plaid',
    description: 'Connect bank accounts and fetch transactions',
    category: 'banking',
    icon: Building,
    status: 'disconnected',
    requiresKey: true,
    keyName: 'VITE_PLAID_SECRET',
    documentationUrl: 'https://plaid.com/docs/',
    features: ['Bank connections', 'Transaction history', 'Account balances', 'Investment accounts'],
    pricing: 'Development: Free, Production: $500+/month',
  },
  {
    id: 'finnhub',
    name: 'Finnhub',
    description: 'Stock market data and financial news',
    category: 'market_data',
    icon: TrendingUp,
    status: 'disconnected',
    requiresKey: true,
    keyName: 'VITE_FINNHUB_KEY',
    documentationUrl: 'https://finnhub.io/docs/api',
    features: ['Real-time quotes', 'Company news', 'Earnings calendar', 'Economic data'],
    pricing: 'Free tier: 60 calls/min',
  },
  {
    id: 'iexCloud',
    name: 'IEX Cloud',
    description: 'Reliable financial data platform',
    category: 'market_data',
    icon: TrendingUp,
    status: 'disconnected',
    requiresKey: true,
    keyName: 'VITE_IEX_CLOUD_KEY',
    documentationUrl: 'https://iexcloud.io/docs/',
    features: ['Stock quotes', 'Company financials', 'Market news', 'Sector performance'],
    pricing: 'Free tier: 50,000 messages/month',
  },
];

export const APIIntegrations: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingAPI, setTestingAPI] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [showPlaidDialog, setShowPlaidDialog] = useState(false);
  const [integrations, setIntegrations] = useState(API_INTEGRATIONS);

  useEffect(() => {
    // Load saved API keys from localStorage (in production, use secure storage)
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }

    // Update integration status based on configured APIs
    updateIntegrationStatus();
  }, []);

  const updateIntegrationStatus = () => {
    // Temporarily simplified to avoid API_CONFIGS dependency
    const updated = API_INTEGRATIONS.map(integration => {
      if (!integration.requiresKey) {
        return { ...integration, status: 'connected' as const };
      }
      
      return {
        ...integration,
        status: 'disconnected' as const,
      };
    });
    setIntegrations(updated);
  };

  const saveAPIKey = (integrationId: string, key: string) => {
    const newKeys = { ...apiKeys, [integrationId]: key };
    setApiKeys(newKeys);
    localStorage.setItem('apiKeys', JSON.stringify(newKeys));
    
    // In production, you would save this securely on the backend
    // For now, we're using environment variables
    updateIntegrationStatus();
  };

  const testAPIConnection = async (integrationId: string) => {
    setTestingAPI(integrationId);
    
    try {
      let success = false;
      let message = '';

      switch (integrationId) {
        case 'alphaVantage':
        case 'yahooFinance':
        case 'finnhub':
        case 'iexCloud':
          // Test stock quote
          const quote = await marketDataService.getStockQuote('AAPL');
          success = !!quote;
          message = success 
            ? `Successfully fetched AAPL quote: $${quote?.price.toFixed(2)}` 
            : 'Failed to fetch stock quote';
          break;

        case 'coinGecko':
          // Test crypto quote
          const crypto = await marketDataService.getCryptoQuote('BTC');
          success = !!crypto;
          message = success 
            ? `Successfully fetched Bitcoin price: $${crypto?.currentPrice.toFixed(2)}` 
            : 'Failed to fetch crypto data';
          break;

        case 'plaid':
          // Plaid requires a different testing approach (Link flow)
          success = !!apiKeys[integrationId];
          message = success 
            ? 'API key configured. Use Connect Bank Account to test.' 
            : 'Please add your Plaid API keys';
          break;

        default:
          message = 'Test not implemented for this API';
      }

      setTestResults({
        ...testResults,
        [integrationId]: { success, message },
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        [integrationId]: { 
          success: false, 
          message: error instanceof Error ? error.message : 'Test failed' 
        },
      });
    } finally {
      setTestingAPI(null);
    }
  };

  const getCategoryIcon = (category: APIIntegration['category']) => {
    switch (category) {
      case 'market_data': return TrendingUp;
      case 'banking': return Building;
      case 'crypto': return Bitcoin;
      case 'brokerage': return DollarSign;
      default: return Zap;
    }
  };

  const getCategoryColor = (category: APIIntegration['category']) => {
    switch (category) {
      case 'market_data': return 'text-blue-500';
      case 'banking': return 'text-green-500';
      case 'crypto': return 'text-orange-500';
      case 'brokerage': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: APIIntegration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="gap-1"><Check className="w-3 h-3" /> Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary" className="gap-1"><X className="w-3 h-3" /> Not Connected</Badge>;
      case 'error':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> Error</Badge>;
      case 'testing':
        return <Badge variant="outline" className="gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Testing</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>
            Connect external services to sync real-time data and automate your financial tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'connected').length}</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{integrations.length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Configured</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="w-4 h-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          API keys are currently stored in your browser's local storage for demo purposes. 
          In production, use environment variables or a secure backend service to manage API credentials.
        </AlertDescription>
      </Alert>

      {/* API Integrations List */}
      <div className="space-y-4">
        {['banking', 'brokerage', 'crypto', 'market_data'].map(category => {
          const categoryIntegrations = integrations.filter(i => i.category === category);
          const CategoryIcon = getCategoryIcon(category as APIIntegration['category']);
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CategoryIcon className={`w-5 h-5 ${getCategoryColor(category as APIIntegration['category'])}`} />
                  {category === 'market_data' ? 'Market Data' : 
                   category === 'crypto' ? 'Cryptocurrency' : 
                   category === 'banking' ? 'Banking & Transactions' :
                   category === 'brokerage' ? 'Investment Brokers' : category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {categoryIntegrations.map(integration => (
                    <AccordionItem key={integration.id} value={integration.id}>
                      <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <integration.icon className="w-5 h-5" />
                            <div className="text-left">
                              <p className="font-medium">{integration.name}</p>
                              <p className="text-sm text-muted-foreground">{integration.description}</p>
                            </div>
                          </div>
                          {getStatusBadge(testingAPI === integration.id ? 'testing' : integration.status)}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {/* Features */}
                          <div>
                            <Label>Features</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {integration.features.map(feature => (
                                <Badge key={feature} variant="secondary">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Pricing */}
                          <div>
                            <Label>Pricing</Label>
                            <p className="text-sm text-muted-foreground mt-1">{integration.pricing}</p>
                          </div>

                          {/* API Key Input */}
                          {integration.requiresKey && (
                            <div>
                              <Label htmlFor={`key-${integration.id}`}>API Key</Label>
                              <div className="flex gap-2 mt-2">
                                <div className="relative flex-1">
                                  <Input
                                    id={`key-${integration.id}`}
                                    type={showKeys[integration.id] ? 'text' : 'password'}
                                    placeholder="Enter your API key"
                                    value={apiKeys[integration.id] || ''}
                                    onChange={(e) => saveAPIKey(integration.id, e.target.value)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={() => setShowKeys({
                                      ...showKeys,
                                      [integration.id]: !showKeys[integration.id]
                                    })}
                                  >
                                    {showKeys[integration.id] ? 
                                      <EyeOff className="w-4 h-4" /> : 
                                      <Eye className="w-4 h-4" />
                                    }
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Test Result */}
                          {testResults[integration.id] && (
                            <Alert variant={testResults[integration.id].success ? 'default' : 'destructive'}>
                              <AlertCircle className="w-4 h-4" />
                              <AlertDescription>
                                {testResults[integration.id].message}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testAPIConnection(integration.id)}
                              disabled={testingAPI === integration.id}
                            >
                              {testingAPI === integration.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  Testing...
                                </>
                              ) : (
                                <>
                                  <TestTube className="w-4 h-4 mr-1" />
                                  Test Connection
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(integration.documentationUrl, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Documentation
                            </Button>
                            {integration.id === 'plaid' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setShowPlaidDialog(true)}
                              >
                                Connect Bank Account
                              </Button>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge className="mt-0.5">1</Badge>
            <div>
              <p className="font-medium">Get API Keys</p>
              <p className="text-sm text-muted-foreground">
                Sign up for free accounts at the service providers to get API keys
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge className="mt-0.5">2</Badge>
            <div>
              <p className="font-medium">Configure Keys</p>
              <p className="text-sm text-muted-foreground">
                Enter your API keys in the fields above and save them
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge className="mt-0.5">3</Badge>
            <div>
              <p className="font-medium">Test Connections</p>
              <p className="text-sm text-muted-foreground">
                Use the test button to verify your API connections are working
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge className="mt-0.5">4</Badge>
            <div>
              <p className="font-medium">Start Syncing</p>
              <p className="text-sm text-muted-foreground">
                Your data will automatically sync based on the configured APIs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plaid Connect Dialog */}
      <Dialog open={showPlaidDialog} onOpenChange={setShowPlaidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Bank Account with Plaid</DialogTitle>
            <DialogDescription>
              Plaid requires additional setup to connect your bank accounts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                To use Plaid in production, you need:
                <ul className="list-disc list-inside mt-2">
                  <li>Plaid account with API credentials</li>
                  <li>Backend server to handle token exchange</li>
                  <li>Plaid Link integration in the frontend</li>
                </ul>
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Visit the Plaid documentation to learn how to set up bank connections.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlaidDialog(false)}>
              Close
            </Button>
            <Button onClick={() => window.open('https://plaid.com/docs/quickstart/', '_blank')}>
              View Setup Guide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};