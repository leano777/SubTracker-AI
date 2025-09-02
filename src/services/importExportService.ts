/**
 * Import/Export Service
 * Handles CSV import, PDF/Excel export functionality
 */

import { MonthlyFinancialData, Transaction, DebtPayment, SubscriptionPayment } from '../types/financialTransactions';
import { financialService } from './financialService';

interface CSVRow {
  [key: string]: string;
}

interface ExportOptions {
  format: 'csv' | 'json';
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
}

export class ImportExportService {
  private static instance: ImportExportService;

  static getInstance(): ImportExportService {
    if (!ImportExportService.instance) {
      ImportExportService.instance = new ImportExportService();
    }
    return ImportExportService.instance;
  }

  // CSV Import Methods
  parseCSV(csvContent: string): CSVRow[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }

    return rows;
  }

  validateTransactionCSV(rows: CSVRow[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredFields = ['Date', 'Description', 'Amount', 'Category'];

    if (rows.length === 0) {
      errors.push('No data rows found');
      return { valid: false, errors };
    }

    // Check if required fields exist
    const firstRow = rows[0];
    const headers = Object.keys(firstRow);
    
    requiredFields.forEach(field => {
      if (!headers.some(h => h.toLowerCase().includes(field.toLowerCase()))) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate data format
    rows.forEach((row, index) => {
      const dateField = headers.find(h => h.toLowerCase().includes('date'));
      const amountField = headers.find(h => h.toLowerCase().includes('amount'));

      if (dateField && row[dateField]) {
        const date = new Date(row[dateField]);
        if (isNaN(date.getTime())) {
          errors.push(`Invalid date format in row ${index + 2}: ${row[dateField]}`);
        }
      }

      if (amountField && row[amountField]) {
        const amount = parseFloat(row[amountField].replace(/[$,]/g, ''));
        if (isNaN(amount)) {
          errors.push(`Invalid amount format in row ${index + 2}: ${row[amountField]}`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }

  importTransactionsFromCSV(csvContent: string): { 
    success: boolean; 
    imported: number; 
    errors: string[] 
  } {
    try {
      const rows = this.parseCSV(csvContent);
      const validation = this.validateTransactionCSV(rows);
      
      if (!validation.valid) {
        return { success: false, imported: 0, errors: validation.errors };
      }

      const transactions: Transaction[] = [];
      const headers = Object.keys(rows[0]);
      
      const dateField = headers.find(h => h.toLowerCase().includes('date')) || 'Date';
      const descField = headers.find(h => h.toLowerCase().includes('description') || h.toLowerCase().includes('name')) || 'Description';
      const amountField = headers.find(h => h.toLowerCase().includes('amount')) || 'Amount';
      const categoryField = headers.find(h => h.toLowerCase().includes('category') || h.toLowerCase().includes('type')) || 'Category';

      rows.forEach((row, index) => {
        try {
          const date = new Date(row[dateField]);
          const amount = Math.abs(parseFloat(row[amountField].replace(/[$,]/g, '')));
          const description = row[descField] || `Transaction ${index + 1}`;
          const category = row[categoryField]?.toLowerCase() || 'other';

          transactions.push({
            id: `imported-${Date.now()}-${index}`,
            date: date.toISOString().split('T')[0],
            name: description,
            amount,
            type: this.categorizeTransaction(category),
            category: this.mapCategory(category),
            source: 'imported'
          });
        } catch (error) {
          console.warn(`Failed to import row ${index + 2}:`, error);
        }
      });

      // Store imported transactions (this would integrate with your existing storage)
      localStorage.setItem('imported_transactions', JSON.stringify(transactions));
      
      return { 
        success: true, 
        imported: transactions.length, 
        errors: [] 
      };
    } catch (error) {
      return { 
        success: false, 
        imported: 0, 
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  // Export Methods
  exportToCSV(data: MonthlyFinancialData, options: ExportOptions = { format: 'csv' }): string {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Type', 'Source'];
    const rows: string[] = [headers.join(',')];

    // Export transactions
    data.transactions.forEach(transaction => {
      const row = [
        transaction.date,
        `"${transaction.name}"`,
        transaction.amount.toString(),
        `"${transaction.category}"`,
        `"${transaction.type}"`,
        `"${transaction.source || 'manual'}"`
      ];
      rows.push(row.join(','));
    });

    // Export debt payments
    data.debtPayments.forEach(payment => {
      const row = [
        payment.date,
        `"${payment.name}"`,
        payment.amount.toString(),
        '"debt"',
        '"debt_payment"',
        '"manual"'
      ];
      rows.push(row.join(','));
    });

    // Export subscriptions
    data.subscriptions.forEach(subscription => {
      const row = [
        subscription.date,
        `"${subscription.serviceName}"`,
        subscription.amount.toString(),
        `"${subscription.category}"`,
        '"subscription"',
        '"manual"'
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }

  exportToJSON(data: MonthlyFinancialData): string {
    return JSON.stringify(data, null, 2);
  }

  generateFinancialReport(month: number, year: number): {
    summary: any;
    csvData: string;
    jsonData: string;
  } {
    const data = financialService.getMonthlyData(month, year);
    const summary = financialService.getFinancialSummary(month, year);

    return {
      summary,
      csvData: this.exportToCSV(data),
      jsonData: this.exportToJSON(data)
    };
  }

  // Helper Methods
  private categorizeTransaction(category: string): string {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('subscription') || lowerCategory.includes('service')) {
      return 'subscription';
    }
    if (lowerCategory.includes('transport') || lowerCategory.includes('gas') || lowerCategory.includes('uber')) {
      return 'transport';
    }
    if (lowerCategory.includes('utility') || lowerCategory.includes('electric') || lowerCategory.includes('water')) {
      return 'utility';
    }
    if (lowerCategory.includes('debt') || lowerCategory.includes('credit') || lowerCategory.includes('loan')) {
      return 'debt';
    }
    
    return 'other';
  }

  private mapCategory(category: string): string {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('business') || lowerCategory.includes('work')) {
      return 'business_tools';
    }
    if (lowerCategory.includes('entertainment') || lowerCategory.includes('streaming')) {
      return 'entertainment';
    }
    if (lowerCategory.includes('personal') || lowerCategory.includes('lifestyle')) {
      return 'personal';
    }
    if (lowerCategory.includes('ai') || lowerCategory.includes('artificial')) {
      return 'ai_services';
    }
    if (lowerCategory.includes('storage') || lowerCategory.includes('cloud')) {
      return 'cloud_storage';
    }
    if (lowerCategory.includes('dev') || lowerCategory.includes('development')) {
      return 'development';
    }
    
    return 'other';
  }

  // File download helpers
  downloadCSV(csvData: string, filename: string) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadJSON(jsonData: string, filename: string) {
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const importExportService = ImportExportService.getInstance();