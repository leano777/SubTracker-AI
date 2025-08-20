import { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  Filter,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import type { BudgetPod } from '../../../types/financial';
import { format, parseISO, isThisWeek, isThisMonth, startOfDay, endOfDay } from 'date-fns';

interface TransactionHistoryProps {
  budgetPods: BudgetPod[];
}

interface Transaction {
  id: string;
  podId: string;
  podName: string;
  type: 'contribution' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
  balance: number;
}

export const TransactionHistory = ({ budgetPods }: TransactionHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'contribution' | 'withdrawal'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedPod, setSelectedPod] = useState<string>('all');

  // Combine all transactions from all pods
  const transactions = useMemo(() => {
    const allTransactions: Transaction[] = [];
    
    budgetPods.forEach(pod => {
      // Track running balance for this pod
      let runningBalance = pod.currentAmount;
      
      // Add contributions
      pod.contributions?.forEach((contrib, index) => {
        allTransactions.push({
          id: `${pod.id}-contrib-${index}`,
          podId: pod.id,
          podName: pod.name,
          type: 'contribution',
          amount: contrib.amount,
          date: contrib.date,
          description: contrib.note || 'Funds added',
          balance: runningBalance
        });
      });
      
      // Add withdrawals
      pod.withdrawals?.forEach((withdrawal, index) => {
        allTransactions.push({
          id: `${pod.id}-withdraw-${index}`,
          podId: pod.id,
          podName: pod.name,
          type: 'withdrawal',
          amount: withdrawal.amount,
          date: withdrawal.date,
          description: withdrawal.reason,
          balance: runningBalance
        });
      });
    });
    
    // Sort by date (newest first)
    return allTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [budgetPods]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !transaction.podName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filterType !== 'all' && transaction.type !== filterType) {
        return false;
      }
      
      // Pod filter
      if (selectedPod !== 'all' && transaction.podId !== selectedPod) {
        return false;
      }
      
      // Period filter
      const transactionDate = parseISO(transaction.date);
      if (filterPeriod === 'today') {
        const today = new Date();
        if (transactionDate < startOfDay(today) || transactionDate > endOfDay(today)) {
          return false;
        }
      } else if (filterPeriod === 'week' && !isThisWeek(transactionDate)) {
        return false;
      } else if (filterPeriod === 'month' && !isThisMonth(transactionDate)) {
        return false;
      }
      
      return true;
    });
  }, [transactions, searchTerm, filterType, filterPeriod, selectedPod]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const totalContributions = filteredTransactions
      .filter(t => t.type === 'contribution')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = filteredTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netFlow = totalContributions - totalWithdrawals;
    
    return {
      totalContributions,
      totalWithdrawals,
      netFlow,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const exportTransactions = () => {
    const csv = [
      ['Date', 'Pod', 'Type', 'Amount', 'Description', 'Balance'],
      ...filteredTransactions.map(t => [
        format(parseISO(t.date), 'yyyy-MM-dd HH:mm'),
        t.podName,
        t.type,
        t.amount.toString(),
        t.description,
        t.balance.toString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-pod-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
          <p className="text-muted-foreground">
            Start adding or withdrawing funds from your budget pods to see transaction history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Added</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalContributions)}
                </p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalWithdrawals)}
                </p>
              </div>
              <ArrowDownLeft className="w-8 h-8 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Flow</p>
                <p className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(summary.netFlow))}
                </p>
              </div>
              {summary.netFlow >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600 opacity-20" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600 opacity-20" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{summary.transactionCount}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View and filter all budget pod transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={selectedPod} onValueChange={setSelectedPod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pods</SelectItem>
                {budgetPods.map(pod => (
                  <SelectItem key={pod.id} value={pod.id}>
                    {pod.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="contribution">Additions</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={exportTransactions}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {/* Transaction List */}
          <ScrollArea className="h-[400px] pr-4">
            {filteredTransactions.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No transactions match your current filters
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'contribution' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'contribution' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.podName} • {format(parseISO(transaction.date), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.type === 'contribution' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'contribution' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Balance: {formatCurrency(transaction.balance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};