/**
 * Subscription Discovery Component
 * Helps users find subscriptions from transaction data or manual entry
 */

import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  Check, 
  X, 
  AlertCircle, 
  FileText, 
  CreditCard,
  Calendar,
  DollarSign,
  Zap,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import userSetupService from '@/services/userSetupService';
import type { FullSubscription } from '@/types/subscription';

interface SubscriptionDiscoveryProps {
  onSubscriptionsFound: (subscriptions: FullSubscription[]) => void;
  onClose: () => void;
}

interface TransactionData {
  date: string;
  description: string;
  amount: number;
  category?: string;
}

interface DetectedSubscription extends FullSubscription {
  confidence: number;
  evidence: string[];
  selected: boolean;
}

export function SubscriptionDiscovery({ onSubscriptionsFound, onClose }: SubscriptionDiscoveryProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [detectedSubscriptions, setDetectedSubscriptions] = useState<DetectedSubscription[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [showRawData, setShowRawData] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    parseCsvData(text);
  };

  const parseCsvData = (csvText: string) => {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const transactions: TransactionData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        
        // Try to map common column names
        const dateIdx = headers.findIndex(h => 
          h.includes('date') || h.includes('transaction') || h.includes('posted')
        );
        const descIdx = headers.findIndex(h => 
          h.includes('description') || h.includes('merchant') || h.includes('name')
        );
        const amountIdx = headers.findIndex(h => 
          h.includes('amount') || h.includes('debit') || h.includes('charge')
        );

        if (dateIdx >= 0 && descIdx >= 0 && amountIdx >= 0) {
          const amount = Math.abs(parseFloat(values[amountIdx]) || 0);
          if (amount > 0) {
            transactions.push({
              date: values[dateIdx],
              description: values[descIdx],
              amount,
              category: headers.includes('category') ? values[headers.indexOf('category')] : undefined,
            });
          }
        }
      }

      setTransactionData(transactions);
      setCsvData(csvText);
      if (transactions.length > 0) {
        setActiveTab('review');
        analyzeTransactions(transactions);
      }
    } catch (error) {
      console.error('CSV parsing error:', error);
      // Handle error - could show a toast
    }
  };

  const handleManualEntry = () => {
    if (csvData.trim()) {
      parseCsvData(csvData);
    }
  };

  const analyzeTransactions = async (transactions: TransactionData[]) => {
    setIsAnalyzing(true);
    try {
      const userId = 'temp-user'; // This would come from auth context
      const result = await userSetupService.importFromTransactions(userId, transactions);
      
      const detected = result.subscriptions.map(sub => ({
        ...sub,
        confidence: result.confidence,
        evidence: [
          `Found ${transactions.filter(t => t.description.toLowerCase().includes(sub.name.toLowerCase())).length} matching transactions`,
          `Detected ${sub.billingCycle} billing pattern`,
          `Average amount: $${sub.cost.toFixed(2)}`,
        ],
        selected: true,
      })) as DetectedSubscription[];

      setDetectedSubscriptions(detected);
    } catch (error) {
      console.error('Transaction analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSubscription = (index: number) => {
    setDetectedSubscriptions(prev => 
      prev.map((sub, i) => 
        i === index ? { ...sub, selected: !sub.selected } : sub
      )
    );
  };

  const handleImportSelected = () => {
    const selectedSubs = detectedSubscriptions
      .filter(sub => sub.selected)
      .map(({ confidence, evidence, selected, ...sub }) => sub);
    
    onSubscriptionsFound(selectedSubs);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-blue-600" />
          Discover Your Subscriptions
        </h2>
        <p className="text-muted-foreground mt-1">
          Import transaction data to automatically detect recurring subscriptions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Transactions</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="review">Review & Import</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Transaction Data
              </CardTitle>
              <CardDescription>
                Upload a CSV file from your bank or credit card provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <h3 className="font-medium">Drop your CSV file here</h3>
                  <p className="text-sm text-muted-foreground">
                    Or click to browse for a file
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="mt-4 max-w-xs mx-auto"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Supported formats:</strong> CSV files with Date, Description, and Amount columns.
                  Your data is processed locally and never sent to external servers.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Expected CSV Format</h4>
                  <div className="text-xs font-mono bg-muted p-2 rounded">
                    Date,Description,Amount<br/>
                    2024-01-15,Netflix,15.99<br/>
                    2024-01-10,Spotify Premium,10.99
                  </div>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">What We Detect</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Recurring payment patterns</li>
                    <li>• Subscription service names</li>
                    <li>• Billing cycles and amounts</li>
                    <li>• Service categories</li>
                  </ul>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Transaction Entry</CardTitle>
              <CardDescription>
                Paste transaction data directly from your bank statement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="csv-data">Transaction Data (CSV Format)</Label>
                <Textarea
                  id="csv-data"
                  placeholder="Date,Description,Amount
2024-01-15,Netflix,15.99
2024-01-10,Spotify Premium,10.99
2024-02-15,Netflix,15.99"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleManualEntry} disabled={!csvData.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Transactions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRawData(!showRawData)}
                >
                  {showRawData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showRawData ? 'Hide' : 'Show'} Preview
                </Button>
              </div>

              {showRawData && transactionData.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Parsed Transactions ({transactionData.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {transactionData.slice(0, 10).map((transaction, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-muted rounded">
                        <span>{transaction.description}</span>
                        <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {transactionData.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{transactionData.length - 10} more transactions
                      </p>
                    )}
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          {isAnalyzing ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Zap className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analyzing Transactions</h3>
                  <p className="text-muted-foreground">
                    Detecting recurring subscription patterns...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : detectedSubscriptions.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Detected Subscriptions</h3>
                  <p className="text-sm text-muted-foreground">
                    Found {detectedSubscriptions.length} potential subscription{detectedSubscriptions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImportSelected}
                    disabled={!detectedSubscriptions.some(sub => sub.selected)}
                  >
                    Import Selected ({detectedSubscriptions.filter(sub => sub.selected).length})
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {detectedSubscriptions.map((subscription, index) => (
                  <Card key={subscription.id} className={`transition-all ${
                    subscription.selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={subscription.selected}
                          onCheckedChange={() => toggleSubscription(index)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{subscription.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                ${subscription.cost}/{subscription.billingCycle}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={getConfidenceColor(subscription.confidence)}
                              >
                                {getConfidenceLabel(subscription.confidence)} Confidence
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Category:</span>
                              <div>{subscription.category}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Billing:</span>
                              <div>{subscription.billingCycle}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Monthly Cost:</span>
                              <div>${subscription.cost.toFixed(2)}</div>
                            </div>
                          </div>

                          <details className="mt-3">
                            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                              Detection Evidence
                            </summary>
                            <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                              {subscription.evidence.map((evidence, i) => (
                                <li key={i}>• {evidence}</li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Subscriptions Detected</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find recurring subscription patterns in your transaction data.
                  </p>
                  <Button onClick={() => setActiveTab('upload')}>
                    Try Different Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SubscriptionDiscovery;