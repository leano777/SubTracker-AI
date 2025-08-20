/**
 * Export Service - CSV/PDF Data Export
 * Handles data formatting and export functionality
 */

import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import type { FullSubscription, FullPaymentCard } from '@/types/subscription';
import subscriptionService from '@/services/supabase/subscriptionService';
import paymentCardService from '@/services/supabase/paymentCardService';
import notificationService from '@/services/supabase/notificationService';

export interface ExportOptions {
  dateRange: {
    start: Date;
    end: Date;
  };
  includeFields: {
    subscriptions: boolean;
    paymentCards: boolean;
    notifications: boolean;
    analytics: boolean;
  };
  format: 'csv' | 'pdf' | 'json';
  groupBy?: 'category' | 'status' | 'billing_cycle' | 'payment_card';
  includeInactive?: boolean;
}

export interface ExportData {
  subscriptions: SubscriptionExportRow[];
  paymentCards: PaymentCardExportRow[];
  notifications: NotificationExportRow[];
  analytics: AnalyticsExportData;
  metadata: {
    exportDate: string;
    dateRange: string;
    totalSubscriptions: number;
    activeSubscriptions: number;
    monthlyTotal: number;
    yearlyTotal: number;
  };
}

export interface SubscriptionExportRow {
  name: string;
  cost: number;
  billingCycle: string;
  nextPayment: string;
  status: string;
  category: string;
  paymentCard: string;
  dateAdded: string;
  monthlyEquivalent: number;
  yearlyEquivalent: number;
  description?: string;
  website?: string;
  tags?: string;
  notes?: string;
}

export interface PaymentCardExportRow {
  nickname: string;
  lastFour: string;
  isDefault: boolean;
  subscriptionCount: number;
  monthlySpend: number;
  dateAdded: string;
}

export interface NotificationExportRow {
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  subscriptionName?: string;
}

export interface AnalyticsExportData {
  spendingByCategory: { category: string; amount: number; count: number }[];
  spendingByMonth: { month: string; amount: number }[];
  subscriptionsByStatus: { status: string; count: number; amount: number }[];
  paymentCardUsage: { card: string; count: number; amount: number }[];
  topSubscriptions: { name: string; cost: number; category: string }[];
}

class ExportService {
  /**
   * Export data based on options
   */
  async exportData(options: ExportOptions): Promise<ExportData> {
    const [subscriptions, paymentCards, notifications] = await Promise.all([
      subscriptionService.getSubscriptions(),
      paymentCardService.getPaymentCards(),
      notificationService.getNotifications(false),
    ]);

    // Filter data based on options
    const filteredSubscriptions = this.filterSubscriptionsByDate(
      subscriptions,
      options.dateRange.start,
      options.dateRange.end,
      options.includeInactive
    );

    const filteredNotifications = notifications.filter(n => {
      const notifDate = new Date(n.createdAt);
      return notifDate >= options.dateRange.start && notifDate <= options.dateRange.end;
    });

    // Transform data for export
    const exportData: ExportData = {
      subscriptions: this.transformSubscriptions(filteredSubscriptions),
      paymentCards: this.transformPaymentCards(paymentCards, filteredSubscriptions),
      notifications: this.transformNotifications(filteredNotifications),
      analytics: this.generateAnalytics(filteredSubscriptions),
      metadata: this.generateMetadata(filteredSubscriptions, options.dateRange),
    };

    return exportData;
  }

  /**
   * Export as CSV
   */
  async exportAsCSV(options: ExportOptions): Promise<{ filename: string; content: string }> {
    const data = await this.exportData(options);
    let csvContent = '';

    // Add metadata header
    csvContent += this.generateCSVHeader(data.metadata);
    csvContent += '\n\n';

    // Subscriptions
    if (options.includeFields.subscriptions && data.subscriptions.length > 0) {
      csvContent += '"SUBSCRIPTIONS"\n';
      csvContent += this.arrayToCSV(data.subscriptions);
      csvContent += '\n\n';
    }

    // Payment Cards
    if (options.includeFields.paymentCards && data.paymentCards.length > 0) {
      csvContent += '"PAYMENT CARDS"\n';
      csvContent += this.arrayToCSV(data.paymentCards);
      csvContent += '\n\n';
    }

    // Notifications
    if (options.includeFields.notifications && data.notifications.length > 0) {
      csvContent += '"NOTIFICATIONS"\n';
      csvContent += this.arrayToCSV(data.notifications);
      csvContent += '\n\n';
    }

    // Analytics
    if (options.includeFields.analytics) {
      csvContent += '"ANALYTICS - SPENDING BY CATEGORY"\n';
      csvContent += this.arrayToCSV(data.analytics.spendingByCategory);
      csvContent += '\n\n';

      csvContent += '"ANALYTICS - MONTHLY SPENDING"\n';
      csvContent += this.arrayToCSV(data.analytics.spendingByMonth);
      csvContent += '\n\n';

      csvContent += '"ANALYTICS - TOP SUBSCRIPTIONS"\n';
      csvContent += this.arrayToCSV(data.analytics.topSubscriptions);
      csvContent += '\n\n';
    }

    const filename = this.generateFilename('csv', options.dateRange);
    return { filename, content: csvContent };
  }

  /**
   * Download CSV file
   */
  async downloadCSV(options: ExportOptions): Promise<void> {
    const { filename, content } = await this.exportAsCSV(options);
    this.downloadFile(content, filename, 'text/csv');
  }

  /**
   * Export as JSON (for backup purposes)
   */
  async exportAsJSON(options: ExportOptions): Promise<{ filename: string; content: string }> {
    const data = await this.exportData(options);
    const filename = this.generateFilename('json', options.dateRange);
    const content = JSON.stringify(data, null, 2);
    return { filename, content };
  }

  /**
   * Download JSON file
   */
  async downloadJSON(options: ExportOptions): Promise<void> {
    const { filename, content } = await this.exportAsJSON(options);
    this.downloadFile(content, filename, 'application/json');
  }

  /**
   * Get export statistics
   */
  async getExportStats(options: ExportOptions): Promise<{
    subscriptions: number;
    paymentCards: number;
    notifications: number;
    dateRange: string;
    estimatedFileSize: string;
  }> {
    const data = await this.exportData(options);
    const { content } = await this.exportAsCSV(options);
    
    return {
      subscriptions: data.subscriptions.length,
      paymentCards: data.paymentCards.length,
      notifications: data.notifications.length,
      dateRange: `${format(options.dateRange.start, 'MMM dd, yyyy')} - ${format(options.dateRange.end, 'MMM dd, yyyy')}`,
      estimatedFileSize: this.formatFileSize(content.length),
    };
  }

  /**
   * Transform subscriptions for export
   */
  private transformSubscriptions(subscriptions: FullSubscription[]): SubscriptionExportRow[] {
    return subscriptions.map(sub => ({
      name: sub.name,
      cost: sub.cost,
      billingCycle: sub.billingCycle || sub.frequency,
      nextPayment: sub.nextPayment || '',
      status: sub.status,
      category: sub.category || 'Uncategorized',
      paymentCard: sub.paymentCard || 'None',
      dateAdded: sub.dateAdded || '',
      monthlyEquivalent: this.calculateMonthlyEquivalent(sub.cost, sub.billingCycle || sub.frequency),
      yearlyEquivalent: this.calculateYearlyEquivalent(sub.cost, sub.billingCycle || sub.frequency),
      description: sub.description,
      website: sub.websiteUrl || sub.website,
      tags: sub.tags?.join(', '),
      notes: sub.notes,
    }));
  }

  /**
   * Transform payment cards for export
   */
  private transformPaymentCards(
    cards: FullPaymentCard[],
    subscriptions: FullSubscription[]
  ): PaymentCardExportRow[] {
    return cards.map(card => {
      const cardSubscriptions = subscriptions.filter(sub => 
        sub.paymentCard === card.nickname || sub.paymentCardId === card.id
      );
      
      const monthlySpend = cardSubscriptions.reduce((total, sub) => 
        total + this.calculateMonthlyEquivalent(sub.cost, sub.billingCycle || sub.frequency), 0
      );

      return {
        nickname: card.nickname || 'Unnamed Card',
        lastFour: card.lastFour || '',
        isDefault: card.isDefault,
        subscriptionCount: cardSubscriptions.length,
        monthlySpend,
        dateAdded: card.dateAdded || '',
      };
    });
  }

  /**
   * Transform notifications for export
   */
  private transformNotifications(notifications: any[]): NotificationExportRow[] {
    return notifications.map(notif => ({
      type: notif.type,
      title: notif.title,
      message: notif.message,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
      subscriptionName: notif.subscription?.name,
    }));
  }

  /**
   * Generate analytics data
   */
  private generateAnalytics(subscriptions: FullSubscription[]): AnalyticsExportData {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

    // Spending by category
    const categoryMap = new Map<string, { amount: number; count: number }>();
    activeSubscriptions.forEach(sub => {
      const category = sub.category || 'Uncategorized';
      const monthly = this.calculateMonthlyEquivalent(sub.cost, sub.billingCycle || sub.frequency);
      const existing = categoryMap.get(category) || { amount: 0, count: 0 };
      categoryMap.set(category, {
        amount: existing.amount + monthly,
        count: existing.count + 1,
      });
    });

    const spendingByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    })).sort((a, b) => b.amount - a.amount);

    // Generate monthly spending (last 12 months)
    const spendingByMonth = this.generateMonthlySpending(activeSubscriptions);

    // Subscriptions by status
    const statusMap = new Map<string, { count: number; amount: number }>();
    subscriptions.forEach(sub => {
      const monthly = this.calculateMonthlyEquivalent(sub.cost, sub.billingCycle || sub.frequency);
      const existing = statusMap.get(sub.status) || { count: 0, amount: 0 };
      statusMap.set(sub.status, {
        count: existing.count + 1,
        amount: existing.amount + monthly,
      });
    });

    const subscriptionsByStatus = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      amount: data.amount,
    }));

    // Top subscriptions by cost
    const topSubscriptions = activeSubscriptions
      .sort((a, b) => {
        const aMonthly = this.calculateMonthlyEquivalent(a.cost, a.billingCycle || a.frequency);
        const bMonthly = this.calculateMonthlyEquivalent(b.cost, b.billingCycle || b.frequency);
        return bMonthly - aMonthly;
      })
      .slice(0, 10)
      .map(sub => ({
        name: sub.name,
        cost: sub.cost,
        category: sub.category || 'Uncategorized',
      }));

    return {
      spendingByCategory,
      spendingByMonth,
      subscriptionsByStatus,
      paymentCardUsage: [], // Will be populated if needed
      topSubscriptions,
    };
  }

  /**
   * Generate monthly spending data
   */
  private generateMonthlySpending(subscriptions: FullSubscription[]): { month: string; amount: number }[] {
    const monthlyData: { month: string; amount: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = format(date, 'MMM yyyy');
      
      const monthlyAmount = subscriptions.reduce((total, sub) => {
        if (sub.status === 'active') {
          return total + this.calculateMonthlyEquivalent(sub.cost, sub.billingCycle || sub.frequency);
        }
        return total;
      }, 0);

      monthlyData.push({ month: monthStr, amount: monthlyAmount });
    }

    return monthlyData;
  }

  /**
   * Filter subscriptions by date range
   */
  private filterSubscriptionsByDate(
    subscriptions: FullSubscription[],
    startDate: Date,
    endDate: Date,
    includeInactive = false
  ): FullSubscription[] {
    return subscriptions.filter(sub => {
      // Filter by status
      if (!includeInactive && sub.status !== 'active') {
        return false;
      }

      // Filter by date (using dateAdded)
      if (sub.dateAdded) {
        const addedDate = new Date(sub.dateAdded);
        return addedDate >= startDate && addedDate <= endDate;
      }

      // Include if no date info available
      return true;
    });
  }

  /**
   * Generate CSV header with metadata
   */
  private generateCSVHeader(metadata: ExportData['metadata']): string {
    return [
      '"SubTracker AI - Data Export"',
      `"Generated: ${metadata.exportDate}"`,
      `"Date Range: ${metadata.dateRange}"`,
      `"Total Subscriptions: ${metadata.totalSubscriptions}"`,
      `"Active Subscriptions: ${metadata.activeSubscriptions}"`,
      `"Monthly Total: $${metadata.monthlyTotal.toFixed(2)}"`,
      `"Yearly Total: $${metadata.yearlyTotal.toFixed(2)}"`,
    ].join('\n');
  }

  /**
   * Convert array of objects to CSV
   */
  private arrayToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.map(header => `"${this.escapeCsvValue(header)}"`).join(','));

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return `"${this.escapeCsvValue(value)}"`;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Escape CSV values
   */
  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Escape double quotes by doubling them
    return stringValue.replace(/"/g, '""');
  }

  /**
   * Generate metadata
   */
  private generateMetadata(
    subscriptions: FullSubscription[],
    dateRange: { start: Date; end: Date }
  ): ExportData['metadata'] {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    
    const monthlyTotal = activeSubscriptions.reduce((total, sub) =>
      total + this.calculateMonthlyEquivalent(sub.cost, sub.billingCycle || sub.frequency), 0
    );

    return {
      exportDate: format(new Date(), 'MMM dd, yyyy HH:mm:ss'),
      dateRange: `${format(dateRange.start, 'MMM dd, yyyy')} - ${format(dateRange.end, 'MMM dd, yyyy')}`,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      monthlyTotal,
      yearlyTotal: monthlyTotal * 12,
    };
  }

  /**
   * Generate filename
   */
  private generateFilename(format: string, dateRange: { start: Date; end: Date }): string {
    const startStr = format(dateRange.start, 'yyyy-MM-dd');
    const endStr = format(dateRange.end, 'yyyy-MM-dd');
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    return `subtracker-export-${startStr}-to-${endStr}-${timestamp}.${format}`;
  }

  /**
   * Download file
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Calculate monthly equivalent cost
   */
  private calculateMonthlyEquivalent(cost: number, billingCycle: string): number {
    switch (billingCycle) {
      case 'monthly':
        return cost;
      case 'yearly':
        return cost / 12;
      case 'quarterly':
        return cost / 3;
      case 'weekly':
        return cost * 4.33;
      case 'daily':
        return cost * 30;
      default:
        return cost;
    }
  }

  /**
   * Calculate yearly equivalent cost
   */
  private calculateYearlyEquivalent(cost: number, billingCycle: string): number {
    return this.calculateMonthlyEquivalent(cost, billingCycle) * 12;
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get default export options
   */
  getDefaultOptions(): ExportOptions {
    const now = new Date();
    return {
      dateRange: {
        start: startOfYear(now),
        end: endOfYear(now),
      },
      includeFields: {
        subscriptions: true,
        paymentCards: true,
        notifications: false,
        analytics: true,
      },
      format: 'csv',
      includeInactive: false,
    };
  }

  /**
   * Get preset date ranges
   */
  getPresetDateRanges() {
    const now = new Date();
    return {
      thisMonth: {
        start: startOfMonth(now),
        end: endOfMonth(now),
        label: 'This Month',
      },
      thisYear: {
        start: startOfYear(now),
        end: endOfYear(now),
        label: 'This Year',
      },
      lastYear: {
        start: startOfYear(new Date(now.getFullYear() - 1, 0, 1)),
        end: endOfYear(new Date(now.getFullYear() - 1, 11, 31)),
        label: 'Last Year',
      },
      allTime: {
        start: new Date(2020, 0, 1), // Reasonable start date
        end: now,
        label: 'All Time',
      },
    };
  }
}

// Export singleton instance
export const exportService = new ExportService();

export default exportService;