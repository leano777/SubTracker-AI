import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Eye, EyeOff, Download, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { processImportFile, ImportPreview, applyImport } from '../utils/importUtils';
import { Subscription, PaymentCard } from '../types/subscription';
import { formatCurrency } from '../utils/helpers';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: { subscriptions: Subscription[]; cards: PaymentCard[] }) => void;
  existingSubscriptions: Subscription[];
  existingCards: PaymentCard[];
}

export function ImportDialog({ 
  open, 
  onOpenChange, 
  onImport, 
  existingSubscriptions, 
  existingCards 
}: ImportDialogProps) {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'replace' | 'keep-both'>('skip');
  const [activeTab, setActiveTab] = useState('upload');

  // Detect dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Glassmorphic styles
  const glassStyles = {
    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: isDarkMode ? '1px solid rgba(75, 85, 99, 0.3)' : '1px solid rgba(255, 255, 255, 0.3)',
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setPreview(null);

    try {
      const importPreview = await processImportFile(file, existingSubscriptions, existingCards);
      setPreview(importPreview);
      
      // Auto-select all valid items
      setSelectedSubscriptions(
        importPreview.subscriptions
          .filter(sub => !sub._errors || sub._errors.length === 0)
          .map(sub => sub._importId)
      );
      setSelectedCards(
        importPreview.cards
          .filter(card => !card._errors || card._errors.length === 0)
          .map(card => card._importId)
      );
      
      if (importPreview.subscriptions.length > 0 || importPreview.cards.length > 0) {
        setActiveTab('preview');
      }
    } catch (error) {
      console.error('Import processing error:', error);
      setPreview({
        subscriptions: [],
        cards: [],
        errors: [`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        duplicates: []
      });
      setActiveTab('preview');
    } finally {
      setIsProcessing(false);
    }
  }, [existingSubscriptions, existingCards]);

  const handleImport = useCallback(async () => {
    if (!preview) return;

    setIsProcessing(true);
    try {
      const { subscriptions, cards, result } = applyImport(
        preview, 
        selectedSubscriptions, 
        selectedCards, 
        duplicateStrategy
      );

      onImport({ subscriptions, cards });
      
      // Reset state
      setPreview(null);
      setSelectedFile(null);
      setSelectedSubscriptions([]);
      setSelectedCards([]);
      setActiveTab('upload');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [preview, selectedSubscriptions, selectedCards, duplicateStrategy, onImport, onOpenChange]);

  const handleReset = () => {
    setPreview(null);
    setSelectedFile(null);
    setSelectedSubscriptions([]);
    setSelectedCards([]);
    setActiveTab('upload');
  };

  const toggleSubscriptionSelection = (importId: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(importId) 
        ? prev.filter(id => id !== importId)
        : [...prev, importId]
    );
  };

  const toggleCardSelection = (importId: string) => {
    setSelectedCards(prev => 
      prev.includes(importId) 
        ? prev.filter(id => id !== importId)
        : [...prev, importId]
    );
  };

  const selectAllSubscriptions = () => {
    const validSubscriptions = preview?.subscriptions
      .filter(sub => !sub._errors || sub._errors.length === 0)
      .map(sub => sub._importId) || [];
    setSelectedSubscriptions(validSubscriptions);
  };

  const deselectAllSubscriptions = () => {
    setSelectedSubscriptions([]);
  };

  const selectAllCards = () => {
    const validCards = preview?.cards
      .filter(card => !card._errors || card._errors.length === 0)
      .map(card => card._importId) || [];
    setSelectedCards(validCards);
  };

  const deselectAllCards = () => {
    setSelectedCards([]);
  };

  const getFileTypeInfo = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.csv')) {
      return {
        type: 'CSV',
        description: 'Comma-separated values file - supports subscription data',
        icon: <FileText className="w-5 h-5 text-green-500" />
      };
    } else if (fileName.toLowerCase().endsWith('.json')) {
      return {
        type: 'JSON',
        description: 'JavaScript Object Notation - supports subscriptions and payment cards',
        icon: <FileText className="w-5 h-5 text-blue-500" />
      };
    }
    return {
      type: 'Unknown',
      description: 'File type will be auto-detected',
      icon: <FileText className="w-5 h-5 text-gray-500" />
    };
  };

  const renderUploadTab = () => (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card style={glassStyles}>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Import Your Subscription Data
            </h3>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload a JSON or CSV file to import your subscriptions and payment cards
            </p>
            
            <div className="relative">
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              <Button 
                size="lg" 
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Information */}
      {selectedFile && (
        <Card style={glassStyles}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {getFileTypeInfo(selectedFile.name).icon}
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedFile.name}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getFileTypeInfo(selectedFile.name).description}
                </p>
              </div>
              <Badge variant="outline">
                {getFileTypeInfo(selectedFile.name).type}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Formats */}
      <Card style={glassStyles}>
        <CardHeader>
          <CardTitle className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Supported Formats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>JSON Files</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Native SubTracker format with full support for subscriptions, payment cards, and settings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>CSV Files</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Comma-separated format for subscription data from other services
                </p>
              </div>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              CSV files should include columns for: name, cost, billing_cycle, next_payment, category. 
              Additional columns will be automatically mapped when possible.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreviewTab = () => {
    if (!preview) return null;

    const validSubscriptions = preview.subscriptions.filter(sub => !sub._errors || sub._errors.length === 0);
    const invalidSubscriptions = preview.subscriptions.filter(sub => sub._errors && sub._errors.length > 0);
    const validCards = preview.cards.filter(card => !card._errors || card._errors.length === 0);

    return (
      <div className="space-y-6">
        {/* Summary */}
        <Card style={glassStyles}>
          <CardHeader>
            <CardTitle className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Import Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{validSubscriptions.length}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Valid Subscriptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{validCards.length}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{preview.errors.length}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{preview.duplicates.length}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duplicates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Errors and Warnings */}
        {(preview.errors.length > 0 || preview.warnings.length > 0) && (
          <Card style={glassStyles}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Issues Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {preview.errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
              {preview.warnings.map((warning, index) => (
                <Alert key={index}>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Duplicates Handling */}
        {preview.duplicates.length > 0 && (
          <Card style={glassStyles}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Duplicate Handling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Found {preview.duplicates.length} potential duplicates. Choose how to handle them:
              </p>
              
              <RadioGroup value={duplicateStrategy} onValueChange={(value: any) => setDuplicateStrategy(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skip" id="skip" />
                  <Label htmlFor="skip">Skip duplicates (recommended)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="replace" />
                  <Label htmlFor="replace">Replace existing with imported</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="keep-both" id="keep-both" />
                  <Label htmlFor="keep-both">Keep both (will rename imported)</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Subscriptions Preview */}
        {validSubscriptions.length > 0 && (
          <Card style={glassStyles}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Subscriptions ({validSubscriptions.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllSubscriptions}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllSubscriptions}>
                    <X className="w-4 h-4 mr-1" />
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {validSubscriptions.map((subscription) => (
                    <div
                      key={subscription._importId}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        selectedSubscriptions.includes(subscription._importId)
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                      }`}
                    >
                      <Checkbox
                        checked={selectedSubscriptions.includes(subscription._importId)}
                        onCheckedChange={() => toggleSubscriptionSelection(subscription._importId)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {subscription.name}
                          </span>
                          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                            {subscription.status}
                          </Badge>
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatCurrency(subscription.cost)} • {subscription.billingCycle} • {subscription.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Payment Cards Preview */}
        {validCards.length > 0 && (
          <Card style={glassStyles}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Payment Cards ({validCards.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllCards}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllCards}>
                    <X className="w-4 h-4 mr-1" />
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {validCards.map((card) => (
                  <div
                    key={card._importId}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedCards.includes(card._importId)
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  >
                    <Checkbox
                      checked={selectedCards.includes(card._importId)}
                      onCheckedChange={() => toggleCardSelection(card._importId)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {card.nickname}
                        </span>
                        {card.isDefault && <Badge variant="secondary">Default</Badge>}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ****{card.lastFour} • {card.type} • {card.issuer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invalid Items */}
        {invalidSubscriptions.length > 0 && (
          <Card style={glassStyles}>
            <CardHeader>
              <CardTitle className={`text-lg text-red-600 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                Invalid Subscriptions ({invalidSubscriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {invalidSubscriptions.map((subscription) => (
                    <div
                      key={subscription._importId}
                      className="p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    >
                      <div className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                        {subscription.name || 'Unnamed Subscription'}
                      </div>
                      {subscription._errors && (
                        <ul className={`text-sm mt-1 list-disc list-inside ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                          {subscription._errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border-0"
        style={{
          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        aria-describedby="import-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className={`text-xl ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Import Subscription Data
          </DialogTitle>
          <DialogDescription id="import-dialog-description" className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Import your subscriptions and payment cards from JSON or CSV files
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="preview" disabled={!preview}>
              Preview & Import
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="upload" className="space-y-4">
              {renderUploadTab()}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <ScrollArea className="h-[500px]">
                {renderPreviewTab()}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Start Over
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            {preview && (
              <Button 
                onClick={handleImport}
                disabled={isProcessing || (selectedSubscriptions.length === 0 && selectedCards.length === 0)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import Selected ({selectedSubscriptions.length + selectedCards.length})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}