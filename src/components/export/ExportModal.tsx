/**
 * Export Modal Component
 * UI for configuring and downloading data exports
 */

import React, { useState, useEffect } from 'react';
import { Download, FileText, Database, Calendar, Settings, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import exportService, { type ExportOptions } from '@/services/exportService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ExportModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  onClose?: () => void;
}

export function ExportModal({ trigger, defaultOpen = false, onClose }: ExportModalProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [options, setOptions] = useState<ExportOptions>(exportService.getDefaultOptions());
  const [isExporting, setIsExporting] = useState(false);
  const [exportStats, setExportStats] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const presetRanges = exportService.getPresetDateRanges();

  // Load export stats when options change
  useEffect(() => {
    if (isOpen) {
      loadExportStats();
    }
  }, [options, isOpen]);

  const loadExportStats = async () => {
    try {
      const stats = await exportService.getExportStats(options);
      setExportStats(stats);
    } catch (error) {
      console.error('Error loading export stats:', error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (options.format === 'csv') {
        await exportService.downloadCSV(options);
        toast.success('CSV export downloaded successfully!');
      } else if (options.format === 'json') {
        await exportService.downloadJSON(options);
        toast.success('JSON backup downloaded successfully!');
      }
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }));
  };

  const updateIncludeFields = (field: keyof ExportOptions['includeFields'], value: boolean) => {
    setOptions(prev => ({
      ...prev,
      includeFields: {
        ...prev.includeFields,
        [field]: value,
      },
    }));
  };

  const updateDateRange = (range: { start: Date; end: Date }) => {
    setOptions(prev => ({
      ...prev,
      dateRange: range,
    }));
  };

  const handlePresetRange = (preset: keyof typeof presetRanges) => {
    const range = presetRanges[preset];
    updateDateRange({ start: range.start, end: range.end });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
          <DialogDescription>
            Export your subscription data, payment cards, and analytics in various formats.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="options" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="options">Export Options</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="space-y-6">
            {/* Format Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Format</CardTitle>
                <CardDescription>
                  Choose the format for your exported data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={options.format}
                  onValueChange={(value) => updateOptions({ format: value as any })}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="csv" id="csv" />
                    <div className="flex-1">
                      <Label htmlFor="csv" className="flex items-center gap-2 font-medium">
                        <FileText className="h-4 w-4" />
                        CSV Spreadsheet
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Compatible with Excel, Google Sheets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="json" id="json" />
                    <div className="flex-1">
                      <Label htmlFor="json" className="flex items-center gap-2 font-medium">
                        <Database className="h-4 w-4" />
                        JSON Backup
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Complete data backup format
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </CardTitle>
                <CardDescription>
                  Select the time period for your export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(presetRanges).map(([key, range]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetRange(key as any)}
                      className="justify-start"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={format(options.dateRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => updateDateRange({
                        start: new Date(e.target.value),
                        end: options.dateRange.end,
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={format(options.dateRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => updateDateRange({
                        start: options.dateRange.start,
                        end: new Date(e.target.value),
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data to Include</CardTitle>
                <CardDescription>
                  Choose which data to include in your export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="include-subscriptions">Subscriptions</Label>
                      <p className="text-sm text-muted-foreground">
                        All subscription details and costs
                      </p>
                    </div>
                    <Switch
                      id="include-subscriptions"
                      checked={options.includeFields.subscriptions}
                      onCheckedChange={(checked) => updateIncludeFields('subscriptions', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="include-cards">Payment Cards</Label>
                      <p className="text-sm text-muted-foreground">
                        Payment method information
                      </p>
                    </div>
                    <Switch
                      id="include-cards"
                      checked={options.includeFields.paymentCards}
                      onCheckedChange={(checked) => updateIncludeFields('paymentCards', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="include-notifications">Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Payment reminders and alerts
                      </p>
                    </div>
                    <Switch
                      id="include-notifications"
                      checked={options.includeFields.notifications}
                      onCheckedChange={(checked) => updateIncludeFields('notifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="include-analytics">Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Spending analysis and insights
                      </p>
                    </div>
                    <Switch
                      id="include-analytics"
                      checked={options.includeFields.analytics}
                      onCheckedChange={(checked) => updateIncludeFields('analytics', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {exportStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Export Preview</CardTitle>
                  <CardDescription>
                    Review what will be included in your export
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {exportStats.subscriptions}
                      </div>
                      <div className="text-sm text-muted-foreground">Subscriptions</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {exportStats.paymentCards}
                      </div>
                      <div className="text-sm text-muted-foreground">Payment Cards</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {exportStats.notifications}
                      </div>
                      <div className="text-sm text-muted-foreground">Notifications</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {exportStats.estimatedFileSize}
                      </div>
                      <div className="text-sm text-muted-foreground">File Size</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Export Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>Date Range: {exportStats.dateRange}</div>
                      <div>Format: {options.format.toUpperCase()}</div>
                      <div>Include Inactive: {options.includeInactive ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Options
                </CardTitle>
                <CardDescription>
                  Additional export configuration options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-inactive">Include Inactive Subscriptions</Label>
                    <p className="text-sm text-muted-foreground">
                      Include cancelled and paused subscriptions
                    </p>
                  </div>
                  <Switch
                    id="include-inactive"
                    checked={options.includeInactive}
                    onCheckedChange={(checked) => updateOptions({ includeInactive: checked })}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label>File Naming</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Files are automatically named with date range and timestamp
                  </p>
                  <div className="p-3 bg-muted rounded text-sm font-mono">
                    subtracker-export-{format(options.dateRange.start, 'yyyy-MM-dd')}-to-{format(options.dateRange.end, 'yyyy-MM-dd')}-{format(new Date(), 'yyyy-MM-dd-HHmm')}.{options.format}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {exportStats && (
              <Badge variant="secondary">
                {exportStats.subscriptions + exportStats.paymentCards + exportStats.notifications} items
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <span>Exporting...</span>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {options.format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExportModal;