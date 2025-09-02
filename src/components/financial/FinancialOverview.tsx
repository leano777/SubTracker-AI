/**
 * Financial Overview Component
 * Main dashboard for monthly financial data visualization
 */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Car, 
  CreditCard, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  PieChart,
  BarChart3,
  Upload,
  Download,
  Activity,
  Target,
  Settings
} from 'lucide-react';
import { financialService } from '../../services/financialService';
import { TransactionCategory, DebtType, SubscriptionCategory } from '../../types/financialTransactions';

// Define types locally to avoid import issues
interface Transaction {
  id: string;
  date: string;
  name: string;
  amount: number;
  category: TransactionCategory;
  subcategory?: string;
  recurring: boolean;
  notes?: string;
  paymentMethod?: string;
  vendor?: string;
  tags?: string[];
}

interface DebtPayment {
  id: string;
  date: string;
  name: string;
  amount: number;
  type: DebtType;
  creditor: string;
  remainingBalance?: number;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: string;
}

interface SubscriptionPayment {
  id: string;
  date: string;
  name: string;
  serviceName: string;
  amount: number;
  category: SubscriptionCategory;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  isActive: boolean;
  nextPaymentDate?: string;
}

interface CategoryBreakdown {
  category: TransactionCategory;
  displayName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  icon?: string;
  color?: string;
  transactions: Transaction[];
}

interface MonthlyFinancialData {
  month: string;
  year: number;
  totalSpending: number;
  totalIncome: number;
  netAmount: number;
  categories: CategoryBreakdown[];
  transactions: Transaction[];
  debtPayments: DebtPayment[];
  subscriptions: SubscriptionPayment[];
  transportationCosts: number;
  utilityCosts: number;
  debtTotal: number;
  subscriptionTotal: number;
}

interface FinancialSummary {
  totalExternalSpending: number;
  transportation: number;
  debtAndCredit: number;
  utilities: number;
  subscriptions: number;
  other: number;
  savingsRate: number;
  monthOverMonthChange: number;
}
import { ExpenseBreakdown } from './ExpenseBreakdown';
import { CalendarView } from './CalendarView';
import { SubscriptionBreakdown } from './SubscriptionBreakdown';
import { DebtPaymentsView } from './DebtPaymentsView';
import { TransactionModal } from './TransactionModal';
import { ImportExportPanel } from './ImportExportPanel';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { SubscriptionOptimizer } from '../subscription/SubscriptionOptimizer';
import { PreferencesPanel } from '../settings/PreferencesPanel';

interface FinancialOverviewProps {
  className?: string;
}

type ViewMode = 'breakdown' | 'calendar' | 'subscriptions' | 'debt' | 'analytics' | 'optimizer';

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({ className }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('breakdown');
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(8); // August
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    loadFinancialData();
  }, [selectedMonth, selectedYear]);

  const loadFinancialData = () => {
    const data = financialService.getMonthlyData(selectedMonth, selectedYear);
    const financialSummary = financialService.getFinancialSummary(selectedMonth, selectedYear);
    
    setMonthlyData(data);
    setSummary(financialSummary);
  };

  const handleCategoryClick = (category: string, amount: number, transactions: any[]) => {
    setModalData({ category, amount, transactions });
    setIsModalOpen(true);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getMonthName = (month: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  if (!monthlyData || !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 dark:text-gray-400">
          No financial data available for {getMonthName(selectedMonth)} {selectedYear}
        </div>
      </div>
    );
  }

  return (
    <div className={`financial-overview ${className || ''}`}>
      {/* Header */}
      <div className="mb-6 md:mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-4xl font-light text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            {getMonthName(selectedMonth)} {selectedYear} Transaction Analysis
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsPreferencesOpen(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg hover:border-white transition-all duration-200 text-white hover:bg-gray-800 touch-manipulation active:scale-95"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
          </button>
          <button
            onClick={() => setIsImportExportOpen(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg hover:border-white transition-all duration-200 text-white hover:bg-gray-800 touch-manipulation active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import/Export</span>
            <span className="sm:hidden">I/E</span>
          </button>
        </div>
      </div>

      {/* Summary Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gray-900 border border-gray-700 rounded-xl md:rounded-2xl p-4 md:p-6 hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white hover:shadow-2xl touch-manipulation active:scale-95">
          <div className="text-gray-400 text-xs md:text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Total External Spending</span>
            <span className="sm:hidden">Total Spending</span>
          </div>
          <div className="text-xl md:text-3xl font-light text-red-400">
            {formatCurrency(summary.totalExternalSpending)}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl md:rounded-2xl p-4 md:p-6 hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white hover:shadow-2xl touch-manipulation active:scale-95">
          <div className="text-gray-400 text-xs md:text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <Car className="w-4 h-4" />
            Transportation
          </div>
          <div className="text-xl md:text-3xl font-light text-white">
            {formatCurrency(summary.transportation)}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl md:rounded-2xl p-4 md:p-6 hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white hover:shadow-2xl touch-manipulation active:scale-95">
          <div className="text-gray-400 text-xs md:text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Debt & Credit</span>
            <span className="sm:hidden">Debt</span>
          </div>
          <div className="text-xl md:text-3xl font-light text-white">
            {formatCurrency(summary.debtAndCredit)}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl md:rounded-2xl p-4 md:p-6 hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white hover:shadow-2xl touch-manipulation active:scale-95">
          <div className="text-gray-400 text-xs md:text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Utilities
          </div>
          <div className="text-xl md:text-3xl font-light text-white">
            {formatCurrency(summary.utilities)}
          </div>
        </div>
      </div>

      {/* View Toggle - Mobile Optimized */}
      <div className="mb-8">
        {/* Desktop View Toggle */}
        <div className="hidden md:block">
          <div className="inline-flex bg-gray-900 p-2 rounded-xl">
            <button
              onClick={() => setCurrentView('breakdown')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'breakdown'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <PieChart className="w-4 h-4 mr-2 inline" />
              Breakdown
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'calendar'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Calendar
            </button>
            <button
              onClick={() => setCurrentView('subscriptions')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'subscriptions'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Subscriptions
            </button>
            <button
              onClick={() => setCurrentView('debt')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'debt'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2 inline" />
              Debt
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'analytics'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 mr-2 inline" />
              Analytics
            </button>
            <button
              onClick={() => setCurrentView('optimizer')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'optimizer'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4 mr-2 inline" />
              Optimizer
            </button>
          </div>
        </div>
        
        {/* Mobile View Toggle - 3x2 Grid */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCurrentView('breakdown')}
              className={`flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-200 touch-manipulation ${
                currentView === 'breakdown'
                  ? 'bg-white text-black font-medium shadow-lg'
                  : 'bg-gray-900 border border-gray-700 text-gray-400 active:bg-gray-800'
              }`}
            >
              <PieChart className="w-4 h-4 mr-2" />
              <span className="text-sm">Breakdown</span>
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-200 touch-manipulation ${
                currentView === 'calendar'
                  ? 'bg-white text-black font-medium shadow-lg'
                  : 'bg-gray-900 border border-gray-700 text-gray-400 active:bg-gray-800'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">Calendar</span>
            </button>
            <button
              onClick={() => setCurrentView('subscriptions')}
              className={`flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-200 touch-manipulation ${
                currentView === 'subscriptions'
                  ? 'bg-white text-black font-medium shadow-lg'
                  : 'bg-gray-900 border border-gray-700 text-gray-400 active:bg-gray-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="text-sm">Subs</span>
            </button>
            <button
              onClick={() => setCurrentView('debt')}
              className={`flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-200 touch-manipulation ${
                currentView === 'debt'
                  ? 'bg-white text-black font-medium shadow-lg'
                  : 'bg-gray-900 border border-gray-700 text-gray-400 active:bg-gray-800'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              <span className="text-sm">Debt</span>
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-200 touch-manipulation ${
                currentView === 'analytics'
                  ? 'bg-white text-black font-medium shadow-lg'
                  : 'bg-gray-900 border border-gray-700 text-gray-400 active:bg-gray-800'
              }`}
            >
              <Activity className="w-4 h-4 mr-2" />
              <span className="text-sm">Analytics</span>
            </button>
            <button
              onClick={() => setCurrentView('optimizer')}
              className={`flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-200 touch-manipulation ${
                currentView === 'optimizer'
                  ? 'bg-white text-black font-medium shadow-lg'
                  : 'bg-gray-900 border border-gray-700 text-gray-400 active:bg-gray-800'
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              <span className="text-sm">Optimizer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Views */}
      <div className="min-h-[500px]">
        {currentView === 'breakdown' && (
          <ExpenseBreakdown 
            data={monthlyData}
            onCategoryClick={handleCategoryClick}
          />
        )}
        
        {currentView === 'calendar' && (
          <CalendarView 
            month={selectedMonth}
            year={selectedYear}
            onDateClick={(date, transactions) => {
              setModalData({ date, transactions });
              setIsModalOpen(true);
            }}
          />
        )}
        
        {currentView === 'subscriptions' && (
          <SubscriptionBreakdown 
            month={selectedMonth}
            year={selectedYear}
            onSubscriptionClick={(subscription) => {
              setModalData({ subscription });
              setIsModalOpen(true);
            }}
          />
        )}
        
        {currentView === 'debt' && (
          <DebtPaymentsView 
            month={selectedMonth}
            year={selectedYear}
            onDebtClick={(debtType, payments) => {
              setModalData({ debtType, payments });
              setIsModalOpen(true);
            }}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsDashboard 
            month={selectedMonth}
            year={selectedYear}
          />
        )}

        {currentView === 'optimizer' && (
          <SubscriptionOptimizer 
            month={selectedMonth}
            year={selectedYear}
          />
        )}
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalData(null);
          }}
          data={modalData}
        />
      )}

      {/* Import/Export Panel */}
      <ImportExportPanel
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportComplete={(imported) => {
          console.log(`Imported ${imported} transactions`);
          // Optionally reload financial data
          loadFinancialData();
        }}
      />

      {/* Preferences Panel */}
      <PreferencesPanel
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onPreferencesChange={(preferences) => {
          console.log('Preferences updated:', preferences);
          // Optionally reload with new preferences
          loadFinancialData();
        }}
      />
    </div>
  );
};