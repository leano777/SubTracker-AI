// API Integration Manager - Configure and manage external service connections
// Handles Sequence.io, Coinbase, and Robinhood API connections

import { useState, useEffect } from 'react';
import {
  Link,
  Unlink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Shield,
  Activity,
  DollarSign,
  TrendingUp,
  Building,
  Coins,
  LineChart,
  ArrowRight,
  Info,
  Key,
  Loader2,
  ExternalLink,
  Zap,
  Clock,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../ui/alert';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { SecureCredentialStore, APIServiceRegistry } from '../../services/api/base';
import { SequenceAPIService } from '../../services/api/sequence';
import { CoinbaseAPIService } from '../../services/api/coinbase';
import { RobinhoodAPIService } from '../../services/api/robinhood';
import { useFinancialStore } from '../../stores/useFinancialStore';
import { cn } from '../../utils/cn';

interface APIIntegrationManagerProps {
  onDataSync?: (service: string, data: any) => void;
}

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
  requiredCredentials: Array<{
    key: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    helpText?: string;
  }>;
  documentationUrl: string;
  setupInstructions?: string[];
}

const SERVICES: ServiceConfig[] = [
  {
    id: 'sequence',
    name: 'Sequence.io',
    description: 'Banking and transaction aggregation',
    icon: Building,
    color: 'bg-blue-500',
    features: [
      'Bank account sync',
      'Transaction categorization',
      'Spending insights',
      'Recurring payment detection',
    ],
    requiredCredentials: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'seq_live_...',
        helpText: 'Found in your Sequence.io dashboard',
      },
      {
        key: 'apiSecret',
        label: 'API Secret',
        type: 'password',
        placeholder: 'Your API secret',
        helpText: 'Keep this secure and never share it',
      },
    ],
    documentationUrl: 'https://docs.sequence.io',
    setupInstructions: [
      'Log in to your Sequence.io dashboard',
      'Navigate to API Settings',
      'Create a new API key with read permissions',
      'Copy your API key and secret',
      'Paste them here and click Connect',
    ],
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Cryptocurrency portfolio tracking',
    icon: Coins,
    color: 'bg-orange-500',
    features: [
      'Crypto portfolio sync',
      'Real-time price updates',
      'Transaction history',
      'Portfolio analytics',
    ],
    requiredCredentials: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Your Coinbase API key',
        helpText: 'Create in Coinbase Pro settings',
      },
      {
        key: 'apiSecret',
        label: 'API Secret',
        type: 'password',
        placeholder: 'Your API secret',
        helpText: 'Shown once when creating the key',
      },
    ],
    documentationUrl: 'https://docs.cloud.coinbase.com',
    setupInstructions: [
      'Log in to Coinbase Pro',
      'Go to Profile > API',
      'Click "New API Key"',
      'Select "View" permissions only',
      'Save your API key and secret',
      'Enter them here to connect',
    ],
  },
  {
    id: 'robinhood',
    name: 'Robinhood',
    description: 'Stock and options portfolio',
    icon: LineChart,
    color: 'bg-green-500',
    features: [
      'Stock portfolio sync',
      'Options tracking',
      'Dividend tracking',
      'Performance analytics',
    ],
    requiredCredentials: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Your Robinhood access token',
        helpText: 'Requires OAuth authentication',
      },
    ],
    documentationUrl: 'https://github.com/robinhood-unofficial/pyrh',
    setupInstructions: [
      'Note: Robinhood requires OAuth authentication',
      'You\'ll need to use a third-party tool',
      'Generate an access token using pyrh or similar',
      'Paste your access token here',
      'Token expires periodically and needs renewal',
    ],
  },
];

interface ServiceStatus {
  connected: boolean;
  lastSync?: string;
  error?: string;
  syncing?: boolean;
  accountCount?: number;
  transactionCount?: number;
}

export const APIIntegrationManager = ({ onDataSync }: APIIntegrationManagerProps) => {
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, ServiceStatus>>({});
  const [activeService, setActiveService] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [isConnecting, setIsConnecting] = useState<Record<string, boolean>>({});
  const [syncProgress, setSyncProgress] = useState<Record<string, number>>({});

  // Load saved credentials and check connections on mount
  useEffect(() => {
    loadSavedConnections();
  }, []);

  const loadSavedConnections = async () => {
    const savedCredentials = await SecureCredentialStore.getAllCredentials();
    
    for (const service of SERVICES) {
      const creds = savedCredentials[service.id];
      if (creds) {
        // Test connection
        const api = createAPIService(service.id, creds);
        if (api) {
          const isConnected = await api.testConnection();
          setServiceStatuses(prev => ({
            ...prev,
            [service.id]: {
              connected: isConnected,
              lastSync: localStorage.getItem(`${service.id}_lastSync`) || undefined,
            },
          }));
          
          if (isConnected) {
            APIServiceRegistry.register(service.id, api);
          }
        }
      }
    }
  };

  const createAPIService = (serviceId: string, creds: any) => {
    switch (serviceId) {
      case 'sequence':
        return new SequenceAPIService(creds);
      case 'coinbase':
        return new CoinbaseAPIService(creds);
      case 'robinhood':
        return new RobinhoodAPIService(creds);
      default:
        return null;
    }
  };

  const handleConnect = async (serviceId: string) => {
    setIsConnecting(prev => ({ ...prev, [serviceId]: true }));
    
    try {
      const service = SERVICES.find(s => s.id === serviceId);
      if (!service) return;

      const serviceCreds = credentials[serviceId] || {};
      const api = createAPIService(serviceId, serviceCreds);
      
      if (!api) {
        throw new Error('Failed to create API service');
      }

      // Test authentication
      const isAuthenticated = await api.authenticate();
      
      if (isAuthenticated) {
        // Save credentials securely
        await SecureCredentialStore.saveCredentials(serviceId, serviceCreds);
        
        // Register service
        APIServiceRegistry.register(serviceId, api);
        
        // Update status
        setServiceStatuses(prev => ({
          ...prev,
          [serviceId]: {
            connected: true,
            lastSync: new Date().toISOString(),
          },
        }));
        
        // Initial sync
        await syncServiceData(serviceId);
      } else {
        throw new Error('Authentication failed. Please check your credentials.');
      }
    } catch (error: any) {
      setServiceStatuses(prev => ({
        ...prev,
        [serviceId]: {
          connected: false,
          error: error.message || 'Connection failed',
        },
      }));
    } finally {
      setIsConnecting(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleDisconnect = async (serviceId: string) => {
    // Remove credentials
    await SecureCredentialStore.removeCredentials(serviceId);
    
    // Clear local data
    localStorage.removeItem(`${serviceId}_lastSync`);
    
    // Update status
    setServiceStatuses(prev => ({
      ...prev,
      [serviceId]: {
        connected: false,
      },
    }));
    
    // Clear credentials from state
    setCredentials(prev => {
      const newCreds = { ...prev };
      delete newCreds[serviceId];
      return newCreds;
    });
  };

  const syncServiceData = async (serviceId: string) => {
    setServiceStatuses(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        syncing: true,
        error: undefined,
      },
    }));
    
    setSyncProgress(prev => ({ ...prev, [serviceId]: 0 }));
    
    try {
      const api = APIServiceRegistry.get(serviceId);
      if (!api) throw new Error('Service not registered');

      let syncedData: any = {};
      
      switch (serviceId) {
        case 'sequence':
          const sequenceAPI = api as SequenceAPIService;
          
          // Sync accounts
          setSyncProgress(prev => ({ ...prev, [serviceId]: 20 }));
          const accounts = await sequenceAPI.getAccounts();
          if (accounts.success) {
            syncedData.accounts = accounts.data;
          }
          
          // Sync transactions
          setSyncProgress(prev => ({ ...prev, [serviceId]: 50 }));
          const transactions = await sequenceAPI.getTransactions({
            limit: 100,
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          });
          if (transactions.success) {
            syncedData.transactions = transactions.data;
          }
          
          // Detect subscriptions
          setSyncProgress(prev => ({ ...prev, [serviceId]: 80 }));
          if (transactions.success && transactions.data) {
            const subscriptions = await sequenceAPI.detectSubscriptions(transactions.data);
            syncedData.subscriptions = subscriptions;
          }
          
          break;
          
        case 'coinbase':
          const coinbaseAPI = api as CoinbaseAPIService;
          
          // Sync holdings
          setSyncProgress(prev => ({ ...prev, [serviceId]: 30 }));
          const holdings = await coinbaseAPI.getHoldings();
          if (holdings.success) {
            syncedData.holdings = holdings.data;
          }
          
          // Sync portfolio stats
          setSyncProgress(prev => ({ ...prev, [serviceId]: 60 }));
          const stats = await coinbaseAPI.getPortfolioStats();
          if (stats.success) {
            syncedData.portfolioStats = stats.data;
          }
          
          break;
          
        case 'robinhood':
          const robinhoodAPI = api as RobinhoodAPIService;
          
          // Sync positions
          setSyncProgress(prev => ({ ...prev, [serviceId]: 30 }));
          const positions = await robinhoodAPI.getPositions({ nonzero: true });
          if (positions.success) {
            syncedData.positions = positions.data;
          }
          
          // Sync portfolio stats
          setSyncProgress(prev => ({ ...prev, [serviceId]: 60 }));
          const portfolioStats = await robinhoodAPI.getPortfolioStats();
          if (portfolioStats.success) {
            syncedData.portfolioStats = portfolioStats.data;
          }
          
          break;
      }
      
      setSyncProgress(prev => ({ ...prev, [serviceId]: 100 }));
      
      // Update last sync time
      const now = new Date().toISOString();
      localStorage.setItem(`${serviceId}_lastSync`, now);
      
      setServiceStatuses(prev => ({
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          syncing: false,
          lastSync: now,
          accountCount: syncedData.accounts?.length || syncedData.holdings?.length || syncedData.positions?.results?.length || 0,
          transactionCount: syncedData.transactions?.length || 0,
        },
      }));
      
      // Callback with synced data
      if (onDataSync) {
        onDataSync(serviceId, syncedData);
      }
      
    } catch (error: any) {
      setServiceStatuses(prev => ({
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          syncing: false,
          error: error.message || 'Sync failed',
        },
      }));
    } finally {
      setSyncProgress(prev => ({ ...prev, [serviceId]: 0 }));
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Integrations</h2>
          <p className="text-muted-foreground">
            Connect external services to sync your financial data automatically
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            const allConnected = Object.values(serviceStatuses).filter(s => s.connected);
            for (const service of SERVICES) {
              if (serviceStatuses[service.id]?.connected) {
                await syncServiceData(service.id);
              }
            }
          }}
          disabled={Object.values(serviceStatuses).every(s => !s.connected)}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync All
        </Button>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SERVICES.map((service) => {
          const status = serviceStatuses[service.id] || { connected: false };
          const Icon = service.icon;
          const isLoading = isConnecting[service.id] || status.syncing;
          
          return (
            <Card key={service.id} className={cn(
              "relative overflow-hidden",
              status.connected && "border-green-500/50"
            )}>
              {/* Status indicator */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1",
                status.connected ? "bg-green-500" : "bg-gray-300"
              )} />
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    service.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {status.connected ? (
                    <Badge variant="default" className="gap-1 bg-green-600 text-white">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Not Connected
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Status info */}
                {status.connected && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last sync:</span>
                      <span>{formatLastSync(status.lastSync)}</span>
                    </div>
                    {status.accountCount !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Accounts:</span>
                        <span>{status.accountCount}</span>
                      </div>
                    )}
                    {status.transactionCount !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transactions:</span>
                        <span>{status.transactionCount}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Error message */}
                {status.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{status.error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Sync progress */}
                {status.syncing && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Syncing data...</span>
                    </div>
                    <Progress value={syncProgress[service.id] || 0} />
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2">
                  {status.connected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => syncServiceData(service.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDisconnect(service.id)}
                        disabled={isLoading}
                      >
                        <Unlink className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-full">
                          <Link className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Connect {service.name}</DialogTitle>
                          <DialogDescription>
                            Enter your API credentials to connect {service.name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {/* Setup instructions */}
                          {service.setupInstructions && (
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertTitle>Setup Instructions</AlertTitle>
                              <AlertDescription>
                                <ol className="mt-2 space-y-1 text-sm">
                                  {service.setupInstructions.map((step, index) => (
                                    <li key={index}>{index > 0 && `${index}.`} {step}</li>
                                  ))}
                                </ol>
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {/* Credential inputs */}
                          {service.requiredCredentials.map((cred) => (
                            <div key={cred.key}>
                              <Label htmlFor={`${service.id}_${cred.key}`}>
                                {cred.label}
                              </Label>
                              <div className="relative">
                                <Input
                                  id={`${service.id}_${cred.key}`}
                                  type={showCredentials[`${service.id}_${cred.key}`] ? 'text' : cred.type}
                                  placeholder={cred.placeholder}
                                  value={credentials[service.id]?.[cred.key] || ''}
                                  onChange={(e) => {
                                    setCredentials(prev => ({
                                      ...prev,
                                      [service.id]: {
                                        ...prev[service.id],
                                        [cred.key]: e.target.value,
                                      },
                                    }));
                                  }}
                                />
                                {cred.type === 'password' && (
                                  <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={() => {
                                      setShowCredentials(prev => ({
                                        ...prev,
                                        [`${service.id}_${cred.key}`]: !prev[`${service.id}_${cred.key}`],
                                      }));
                                    }}
                                  >
                                    {showCredentials[`${service.id}_${cred.key}`] ? (
                                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </button>
                                )}
                              </div>
                              {cred.helpText && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {cred.helpText}
                                </p>
                              )}
                            </div>
                          ))}
                          
                          {/* Documentation link */}
                          <div className="flex items-center justify-between">
                            <a
                              href={service.documentationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              View Documentation
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <Button
                              onClick={() => handleConnect(service.id)}
                              disabled={isConnecting[service.id]}
                            >
                              {isConnecting[service.id] ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Connect
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connection summary */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {Object.values(serviceStatuses).filter(s => s.connected).length}
              </div>
              <p className="text-sm text-muted-foreground">Connected Services</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Object.values(serviceStatuses).reduce((sum, s) => sum + (s.accountCount || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Accounts</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Object.values(serviceStatuses).reduce((sum, s) => sum + (s.transactionCount || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Synced Transactions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};