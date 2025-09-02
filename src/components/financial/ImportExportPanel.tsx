/**
 * Import/Export Panel Component
 * Provides UI for importing CSV data and exporting reports
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  Database, 
  AlertCircle, 
  CheckCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { importExportService } from '../../services/importExportService';
import { financialService } from '../../services/financialService';

interface ImportExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (imported: number) => void;
}

type TabType = 'import' | 'export';

export const ImportExportPanel: React.FC<ImportExportPanelProps> = ({ 
  isOpen, 
  onClose, 
  onImportComplete 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('import');
  const [importStatus, setImportStatus] = useState<{
    loading: boolean;
    success: boolean;
    message: string;
    imported?: number;
    errors?: string[];
  }>({ loading: false, success: false, message: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportStatus({
        loading: false,
        success: false,
        message: 'Please select a CSV file',
        errors: ['Only CSV files are supported']
      });
      return;
    }

    setImportStatus({ loading: true, success: false, message: 'Processing file...' });

    try {
      const csvContent = await file.text();
      const result = importExportService.importTransactionsFromCSV(csvContent);
      
      setImportStatus({
        loading: false,
        success: result.success,
        message: result.success 
          ? `Successfully imported ${result.imported} transactions` 
          : 'Import failed',
        imported: result.imported,
        errors: result.errors
      });

      if (result.success && onImportComplete) {
        onImportComplete(result.imported);
      }
    } catch (error) {
      setImportStatus({
        loading: false,
        success: false,
        message: 'Failed to process file',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = (format: 'csv' | 'json', month: number = 8, year: number = 2025) => {
    try {
      const report = importExportService.generateFinancialReport(month, year);
      const filename = `financial-report-${year}-${month.toString().padStart(2, '0')}`;
      
      if (format === 'csv') {
        importExportService.downloadCSV(report.csvData, filename);
      } else {
        importExportService.downloadJSON(report.jsonData, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
        <div 
          className="bg-gray-900 border border-gray-700 rounded-xl md:rounded-2xl p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-light text-white">Import & Export</h2>
              <p className="text-gray-400 mt-1">Manage your financial data</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-6">
            <div className="inline-flex bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('import')}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === 'import'
                    ? 'bg-white text-black font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4 mr-2 inline" />
                Import
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === 'export'
                    ? 'bg-white text-black font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Download className="w-4 h-4 mr-2 inline" />
                Export
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'import' && (
              <div className="space-y-6">
                {/* Import Section */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Import Transactions
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Upload a CSV file with your transaction data. Required columns: Date, Description, Amount, Category
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {!importStatus.loading ? (
                      <div>
                        <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Click to select CSV file
                        </button>
                        <p className="text-gray-500 text-sm mt-2">
                          or drag and drop a file here
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                        <span className="text-gray-400">Processing...</span>
                      </div>
                    )}
                  </div>

                  {/* Import Status */}
                  {importStatus.message && (
                    <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                      importStatus.success 
                        ? 'bg-green-900/20 border border-green-700' 
                        : 'bg-red-900/20 border border-red-700'
                    }`}>
                      {importStatus.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          importStatus.success ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {importStatus.message}
                        </p>
                        {importStatus.errors && importStatus.errors.length > 0 && (
                          <ul className="text-sm text-gray-400 mt-2 space-y-1">
                            {importStatus.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* CSV Format Guide */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Expected CSV Format</h4>
                  <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-300 overflow-x-auto">
                    <div>Date,Description,Amount,Category</div>
                    <div>2025-08-01,"Netflix Subscription",15.99,Entertainment</div>
                    <div>2025-08-02,"Gas Station",45.20,Transportation</div>
                    <div>2025-08-03,"Grocery Store",127.85,Food</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-6">
                {/* Export Section */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Financial Data
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Download your financial data and reports in various formats
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CSV Export */}
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <FileSpreadsheet className="w-8 h-8 text-green-400" />
                        <div>
                          <h4 className="text-white font-medium">CSV Export</h4>
                          <p className="text-gray-400 text-sm">Spreadsheet format</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Download CSV
                      </button>
                    </div>

                    {/* JSON Export */}
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Database className="w-8 h-8 text-blue-400" />
                        <div>
                          <h4 className="text-white font-medium">JSON Export</h4>
                          <p className="text-gray-400 text-sm">Raw data format</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Download JSON
                      </button>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">What's Included</h4>
                  <ul className="text-gray-400 text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      All transactions and categorized expenses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Debt payments and credit transactions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Subscription payments and recurring charges
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Financial summary and analytics
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};