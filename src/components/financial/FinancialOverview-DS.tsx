/**
 * Financial Overview Component - Design System Version
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
import type { TransactionCategory, DebtType, SubscriptionCategory } from '../../types/financialTransactions';

// Design System Components
import { Button } from '../../design-system/primitives/Button/Button';
import { Card } from '../../design-system/primitives/Card/Card';
import { Badge } from '../../design-system/primitives/Badge/Badge';
import { Select } from '../../design-system/primitives/Select/Select';
import { Tabs } from '../../design-system/navigation/Tabs/Tabs';
import { Progress } from '../../design-system/feedback/Progress/Progress';
import { Container } from '../../design-system/layout/Container/Container';
import { Grid, GridItem } from '../../design-system/layout/Grid/Grid';
import { Stack, HStack, VStack } from '../../design-system/layout/Stack/Stack';
import { Table } from '../../design-system/data-display/Table/Table';
import { Alert } from '../../design-system/feedback/Alert/Alert';

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
  monthlyIncome: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

export const FinancialOverviewDS: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [financialData, setFinancialData] = useState<MonthlyFinancialData | null>(null);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalExternalSpending: 0,
    transportation: 0,
    debtAndCredit: 0,
    utilities: 0,
    subscriptions: 0,
    other: 0,
    savingsRate: 0,
    monthlyIncome: 5000,
  });
  const [currentView, setCurrentView] = useState<'breakdown' | 'calendar' | 'subscriptions' | 'debt' | 'analytics'>('breakdown');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    loadFinancialData();
  }, [currentMonth]);

  const loadFinancialData = async () => {
    try {
      const data = await financialService.getMonthlyData(currentMonth);
      setFinancialData(data);
      
      // Calculate summary
      const newSummary: FinancialSummary = {
        totalExternalSpending: data.totalSpending,
        transportation: data.transportationCosts,
        debtAndCredit: data.debtTotal,
        utilities: data.utilityCosts,
        subscriptions: data.subscriptionTotal,
        other: data.totalSpending - (data.transportationCosts + data.debtTotal + data.utilityCosts + data.subscriptionTotal),
        savingsRate: ((data.totalIncome - data.totalSpending) / data.totalIncome) * 100,
        monthlyIncome: data.totalIncome,
      };
      setSummary(newSummary);
    } catch (error) {
      console.error('Failed to load financial data:', error);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    
    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const getMonthName = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const tabItems = [
    { id: 'breakdown', label: 'Breakdown', icon: <PieChart className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'debt', label: 'Debt', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <Container maxWidth="2xl" padding>
      <VStack spacing="lg">
        {/* Header */}
        <Card className="w-full">
          <HStack justify="between" align="center">
            <VStack spacing="xs">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Financial Overview
              </h1>
              <HStack spacing="sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMonthChange('prev')}
                  leftIcon={<TrendingDown className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <span className="text-lg font-medium text-[var(--color-text-primary)]">
                  {getMonthName(currentMonth)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMonthChange('next')}
                  rightIcon={<TrendingUp className="w-4 h-4" />}
                >
                  Next
                </Button>
              </HStack>
            </VStack>
            
            <HStack spacing="md">
              <Button
                variant="secondary"
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={() => setShowImportModal(true)}
              >
                Import
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export
              </Button>
            </HStack>
          </HStack>
        </Card>

        {/* Summary Cards */}
        <Grid cols={{ sm: 1, md: 2, lg: 4 }} gap="md" className="w-full">
          <Card>
            <VStack spacing="sm">
              <HStack spacing="sm">
                <DollarSign className="w-5 h-5 text-[var(--color-feedback-error)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Total Spending
                </span>
              </HStack>
              <span className="text-2xl font-bold text-[var(--color-feedback-error)]">
                {formatCurrency(summary.totalExternalSpending)}
              </span>
            </VStack>
          </Card>

          <Card>
            <VStack spacing="sm">
              <HStack spacing="sm">
                <Car className="w-5 h-5 text-[var(--color-brand-primary)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Transportation
                </span>
              </HStack>
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">
                {formatCurrency(summary.transportation)}
              </span>
            </VStack>
          </Card>

          <Card>
            <VStack spacing="sm">
              <HStack spacing="sm">
                <CreditCard className="w-5 h-5 text-[var(--color-feedback-warning)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Debt & Credit
                </span>
              </HStack>
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">
                {formatCurrency(summary.debtAndCredit)}
              </span>
            </VStack>
          </Card>

          <Card>
            <VStack spacing="sm">
              <HStack spacing="sm">
                <Zap className="w-5 h-5 text-[var(--color-feedback-info)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Utilities
                </span>
              </HStack>
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">
                {formatCurrency(summary.utilities)}
              </span>
            </VStack>
          </Card>
        </Grid>

        {/* Main Content with Tabs */}
        <Card className="w-full">
          <Tabs
            tabs={tabItems.map(item => ({
              ...item,
              content: <TabContent view={item.id as any} financialData={financialData} summary={summary} />
            }))}
            activeTab={currentView}
            onTabChange={(tabId) => setCurrentView(tabId as any)}
            variant="line"
            fullWidth
          />
        </Card>

        {/* Savings Rate */}
        <Card className="w-full">
          <VStack spacing="md">
            <HStack justify="between">
              <span className="text-lg font-medium text-[var(--color-text-primary)]">
                Savings Rate
              </span>
              <Badge variant={summary.savingsRate > 20 ? 'success' : summary.savingsRate > 10 ? 'warning' : 'error'}>
                {summary.savingsRate.toFixed(1)}%
              </Badge>
            </HStack>
            <Progress 
              value={summary.savingsRate} 
              max={100}
              variant={summary.savingsRate > 20 ? 'success' : summary.savingsRate > 10 ? 'warning' : 'error'}
              showLabel
            />
            <Alert variant="info">
              Based on monthly income of {formatCurrency(summary.monthlyIncome)}
            </Alert>
          </VStack>
        </Card>
      </VStack>
    </Container>
  );
};

// Tab Content Component
const TabContent: React.FC<{
  view: 'breakdown' | 'calendar' | 'subscriptions' | 'debt' | 'analytics';
  financialData: MonthlyFinancialData | null;
  summary: FinancialSummary;
}> = ({ view, financialData, summary }) => {
  if (!financialData) {
    return (
      <VStack spacing="lg" align="center" className="py-12">
        <Progress indeterminate />
        <span className="text-[var(--color-text-secondary)]">Loading financial data...</span>
      </VStack>
    );
  }

  switch (view) {
    case 'breakdown':
      return (
        <VStack spacing="lg">
          {financialData.categories.map((category) => (
            <Card key={category.category} variant="bordered">
              <HStack justify="between">
                <VStack spacing="xs">
                  <span className="text-lg font-medium text-[var(--color-text-primary)]">
                    {category.displayName}
                  </span>
                  <Badge variant="outline" size="sm">
                    {category.transactionCount} transactions
                  </Badge>
                </VStack>
                <VStack spacing="xs" align="end">
                  <span className="text-xl font-bold text-[var(--color-text-primary)]">
                    {formatCurrency(category.amount)}
                  </span>
                  <Badge variant="default" size="sm">
                    {category.percentage.toFixed(1)}%
                  </Badge>
                </VStack>
              </HStack>
              <Progress value={category.percentage} max={100} className="mt-4" />
            </Card>
          ))}
        </VStack>
      );

    case 'subscriptions':
      const subscriptionColumns = [
        { key: 'name', header: 'Service', accessor: (item: SubscriptionPayment) => item.serviceName },
        { key: 'amount', header: 'Amount', accessor: (item: SubscriptionPayment) => formatCurrency(item.amount) },
        { key: 'frequency', header: 'Frequency', accessor: (item: SubscriptionPayment) => (
          <Badge variant="outline" size="sm">{item.frequency}</Badge>
        )},
        { key: 'status', header: 'Status', accessor: (item: SubscriptionPayment) => (
          <Badge variant={item.isActive ? 'success' : 'error'} size="sm">
            {item.isActive ? 'Active' : 'Inactive'}
          </Badge>
        )},
      ];

      return (
        <VStack spacing="lg">
          <Table
            data={financialData.subscriptions}
            columns={subscriptionColumns}
            striped
            hoverable
          />
        </VStack>
      );

    case 'debt':
      const debtColumns = [
        { key: 'name', header: 'Creditor', accessor: (item: DebtPayment) => item.creditor },
        { key: 'amount', header: 'Payment', accessor: (item: DebtPayment) => formatCurrency(item.amount) },
        { key: 'balance', header: 'Remaining', accessor: (item: DebtPayment) => 
          item.remainingBalance ? formatCurrency(item.remainingBalance) : 'N/A'
        },
        { key: 'rate', header: 'Interest', accessor: (item: DebtPayment) => 
          item.interestRate ? `${item.interestRate}%` : 'N/A'
        },
      ];

      return (
        <VStack spacing="lg">
          <Table
            data={financialData.debtPayments}
            columns={debtColumns}
            striped
            hoverable
          />
        </VStack>
      );

    default:
      return (
        <Alert variant="info">
          This view is under development.
        </Alert>
      );
  }
};

export default FinancialOverviewDS;