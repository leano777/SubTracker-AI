import { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Plus,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { TransactionHistory } from './TransactionHistory';
import { CashFlowCharts } from './CashFlowCharts';
import { AdvancedTransactionFilter } from './AdvancedTransactionFilter';
import type { 
  Transaction,
  TransactionCategory,
  CashFlowPeriod,
  BudgetPod,
  IncomeSource,
  PaycheckAllocation
} from '../../types/financial';

interface TransactionDashboardProps {
  transactions: Transaction[];
  transactionCategories: TransactionCategory[];
  cashFlowHistory: CashFlowPeriod[];
  budgetPods: BudgetPod[];
  incomeSources: IncomeSource[];
  paycheckAllocations: PaycheckAllocation[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

export const TransactionDashboard = ({
  transactions,
  transactionCategories,
  cashFlowHistory,
  budgetPods,
  incomeSources,
  paycheckAllocations,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onEditTransaction,
}: TransactionDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // Calculate comprehensive dashboard metrics
  const metrics = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthTransactions = filteredTransactions.filter(t => 
      new Date(t.date) >= thisMonth
    );

    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= lastMonth && transactionDate < thisMonth;
    });

    // Current month metrics
    const monthlyIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyNetCashFlow = monthlyIncome - monthlyExpenses;

    // Last month metrics for comparison
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate percentage changes
    const incomeChange = lastMonthIncome > 0 ? 
      ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
    const expenseChange = lastMonthExpenses > 0 ? 
      ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

    // Pending and unreconciled counts
    const pendingTransactions = filteredTransactions.filter(t => t.isPending);
    const unreconciledTransactions = filteredTransactions.filter(t => !t.isReconciled);
    const recurringTransactions = filteredTransactions.filter(t => t.isRecurring);

    // Budget pod integration
    const podUtilization = budgetPods.map(pod => {
      const podTransactions = thisMonthTransactions.filter(t => {
        return pod.linkedSubscriptions?.includes(t.subscriptionId || '') ||
               pod.linkedBills?.includes(t.billId || '');
      });

      const spent = podTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const utilization = pod.monthlyAmount > 0 ? (spent / pod.monthlyAmount) * 100 : 0;

      return {
        ...pod,
        spent,
        utilization,
        remaining: Math.max(0, pod.monthlyAmount - spent),
        isOverBudget: spent > pod.monthlyAmount,
      };
    });

    // Income source tracking
    const incomeSourcePerformance = incomeSources.map(source => {
      const sourceTransactions = thisMonthTransactions.filter(t => 
        t.type === 'income' && (
          t.externalAccountId === source.id ||
          t.description.toLowerCase().includes(source.name.toLowerCase())
        )
      );

      const actualIncome = sourceTransactions.reduce((sum, t) => sum + t.amount, 0);
      const expectedIncome = source.isActive ? source.netAmount : 0;

      return {
        ...source,
        actualIncome,
        expectedIncome,
        variance: actualIncome - expectedIncome,
        transactionCount: sourceTransactions.length,
      };
    });

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyNetCashFlow,
      incomeChange,
      expenseChange,
      pendingCount: pendingTransactions.length,
      unreconciledCount: unreconciledTransactions.length,
      recurringCount: recurringTransactions.length,
      totalTransactions: filteredTransactions.length,
      podUtilization,
      incomeSourcePerformance,
    };
  }, [filteredTransactions, transactions, budgetPods, incomeSources]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${Math.round(value * 100) / 100}%`;
  };

  const handleFilterChange = (filtered: Transaction[]) => {
    setFilteredTransactions(filtered);
  };

  const generateMonthlyTransactions = () => {
    // Auto-generate transactions based on income sources and budget pods
    const newTransactions: Omit<Transaction, 'id'>[] = [];

    // Generate income transactions from paycheck allocations
    paycheckAllocations
      .filter(allocation => !allocation.isProcessed && new Date(allocation.payDate) <= new Date())
      .forEach(allocation => {
        const incomeSource = incomeSources.find(s => s.id === allocation.incomeSourceId);
        if (incomeSource) {
          newTransactions.push({
            date: allocation.payDate,
            amount: allocation.netAmount,
            type: 'income',
            category: 'salary',
            description: `${incomeSource.name} - Paycheck`,
            accountId: incomeSource.id,
            isPending: false,
            isRecurring: true,
            isReconciled: false,
            notes: `Auto-generated from paycheck allocation`,
          });

          // Generate pod allocation transactions
          allocation.podAllocations.forEach(podAlloc => {
            const pod = budgetPods.find(p => p.id === podAlloc.podId);
            if (pod) {
              newTransactions.push({
                date: allocation.payDate,
                amount: -podAlloc.amount,
                type: 'transfer',
                category: 'budget_allocation',
                description: `Transfer to ${pod.name}`,
                isPending: false,
                isRecurring: true,
                isReconciled: false,
                notes: `Auto-generated budget pod allocation`,
              });
            }
          });
        }
      });

    return newTransactions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transaction Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive view of your financial transactions and cash flow
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}>
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Advanced Filter */}
      {showAdvancedFilter && (
        <AdvancedTransactionFilter
          transactions={transactions}
          categories={transactionCategories}
          budgetPods={budgetPods}
          incomeSources={incomeSources}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Monthly Income</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.monthlyIncome)}
            </div>
            {metrics.incomeChange !== 0 && (
              <div className={`text-xs ${metrics.incomeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(metrics.incomeChange)} vs last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Monthly Expenses</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(metrics.monthlyExpenses)}
            </div>
            {metrics.expenseChange !== 0 && (
              <div className={`text-xs ${metrics.expenseChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(metrics.expenseChange)} vs last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={metrics.monthlyNetCashFlow >= 0 ? 'border-green-300' : 'border-red-300'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Net Cash Flow</span>
            </div>
            <div className={`text-2xl font-bold ${
              metrics.monthlyNetCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(metrics.monthlyNetCashFlow)}
            </div>
            <div className="text-xs text-muted-foreground">This month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <div className="text-2xl font-bold">{metrics.pendingCount}</div>
            <div className="text-xs text-muted-foreground">Transactions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Unreconciled</span>
            </div>
            <div className="text-2xl font-bold">{metrics.unreconciledCount}</div>
            <div className="text-xs text-muted-foreground">Need review</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Recurring</span>
            </div>
            <div className="text-2xl font-bold">{metrics.recurringCount}</div>
            <div className="text-xs text-muted-foreground">Auto-transactions</div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Pod Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Budget Pod Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.podUtilization.slice(0, 6).map((pod) => (
              <div key={pod.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{pod.icon}</span>
                    <span className="font-medium">{pod.name}</span>
                  </div>
                  {pod.isOverBudget && (
                    <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span>Spent: {formatCurrency(pod.spent)}</span>
                  <span>Budget: {formatCurrency(pod.monthlyAmount)}</span>
                </div>
                <Progress 
                  value={Math.min(pod.utilization, 100)} 
                  className={`h-2 ${pod.isOverBudget ? 'bg-red-100' : ''}`}
                />
                <div className="text-xs text-muted-foreground">
                  {Math.round(pod.utilization)}% utilized
                  {pod.remaining > 0 && ` • ${formatCurrency(pod.remaining)} remaining`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Income Source Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Income Source Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.incomeSourcePerformance
              .filter(source => source.isActive)
              .map((source) => (
                <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {source.transactionCount} transactions this month
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(source.actualIncome)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expected: {formatCurrency(source.expectedIncome)}
                    </div>
                    {source.variance !== 0 && (
                      <div className={`text-xs ${source.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {source.variance > 0 ? '+' : ''}{formatCurrency(source.variance)} variance
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Transactions</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('transactions')}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTransactions
                    .slice(0, 5)
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'income' ? 'bg-green-100 text-green-600' :
                            transaction.type === 'expense' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {transaction.type === 'income' ? <TrendingUp className="w-4 h-4" /> :
                             transaction.type === 'expense' ? <TrendingDown className="w-4 h-4" /> :
                             <ArrowRightLeft className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' :
                          transaction.type === 'expense' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manual Transaction
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Recurring Transactions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate Monthly Transactions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Reconcile All Pending
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistory
            transactions={filteredTransactions}
            categories={transactionCategories}
            budgetPods={budgetPods}
            incomeSources={incomeSources}
            onAddTransaction={onAddTransaction}
            onUpdateTransaction={onUpdateTransaction}
            onDeleteTransaction={onDeleteTransaction}
            onEditTransaction={onEditTransaction}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CashFlowCharts
            transactions={filteredTransactions}
            cashFlowHistory={cashFlowHistory}
            categories={transactionCategories}
            onExportData={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};