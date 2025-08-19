import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ArrowRightLeft,
  DollarSign,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Tag,
  FileText
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import type { 
  Transaction, 
  TransactionCategory,
  BudgetPod,
  IncomeSource
} from '../../types/financial';

interface TransactionHistoryProps {
  transactions: Transaction[];
  categories: TransactionCategory[];
  budgetPods: BudgetPod[];
  incomeSources: IncomeSource[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

const TRANSACTION_TYPE_ICONS = {
  income: TrendingUp,
  expense: TrendingDown,
  transfer: ArrowRightLeft,
  investment: DollarSign,
};

const TRANSACTION_TYPE_COLORS = {
  income: 'text-green-600 bg-green-50',
  expense: 'text-red-600 bg-red-50',
  transfer: 'text-blue-600 bg-blue-50',
  investment: 'text-purple-600 bg-purple-50',
};

export const TransactionHistory = ({
  transactions,
  categories,
  budgetPods,
  incomeSources,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onEditTransaction,
}: TransactionHistoryProps) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (filterDateRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (filterDateRange !== 'all') {
        filtered = filtered.filter(t => new Date(t.date) >= startDate);
      }
    }

    // Tab filter
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'pending':
          filtered = filtered.filter(t => t.isPending);
          break;
        case 'recurring':
          filtered = filtered.filter(t => t.isRecurring);
          break;
        case 'unreconciled':
          filtered = filtered.filter(t => !t.isReconciled);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case 'amount':
          aVal = Math.abs(a.amount);
          bVal = Math.abs(b.amount);
          break;
        case 'description':
          aVal = a.description.toLowerCase();
          bVal = b.description.toLowerCase();
          break;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, searchQuery, filterType, filterCategory, filterDateRange, activeTab, sortBy, sortOrder]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const transfers = filteredTransactions
      .filter(t => t.type === 'transfer')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const investments = filteredTransactions
      .filter(t => t.type === 'investment')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      total: filteredTransactions.length,
      income,
      expenses,
      transfers,
      investments,
      netCashFlow: income - expenses,
      pending: filteredTransactions.filter(t => t.isPending).length,
      unreconciled: filteredTransactions.filter(t => !t.isReconciled).length,
    };
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTransactionIcon = (type: string) => {
    const Icon = TRANSACTION_TYPE_ICONS[type as keyof typeof TRANSACTION_TYPE_ICONS] || DollarSign;
    return Icon;
  };

  const getTransactionColor = (type: string) => {
    return TRANSACTION_TYPE_COLORS[type as keyof typeof TRANSACTION_TYPE_COLORS] || 'text-gray-600 bg-gray-50';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const Icon = getTransactionIcon(transaction.type);
    const colorClass = getTransactionColor(transaction.type);
    const isPositive = transaction.type === 'income';
    
    return (
      <Card className="transition-all hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold truncate">{transaction.description}</h4>
                  {transaction.isPending && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {!transaction.isReconciled && (
                    <Badge variant="outline" className="text-xs text-orange-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Unreconciled
                    </Badge>
                  )}
                  {transaction.isRecurring && (
                    <Badge variant="outline" className="text-xs text-blue-600">
                      <ArrowRightLeft className="w-3 h-3 mr-1" />
                      Recurring
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{getCategoryName(transaction.category)}</span>
                  <span>{formatDate(transaction.date)}</span>
                  {transaction.tags && transaction.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{transaction.tags.slice(0, 2).join(', ')}</span>
                      {transaction.tags.length > 2 && <span>+{transaction.tags.length - 2}</span>}
                    </div>
                  )}
                </div>
                
                {transaction.notes && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {transaction.notes}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className={`font-bold text-lg ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {transaction.type}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditTransaction?.(transaction)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Transaction
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {!transaction.isReconciled && (
                    <DropdownMenuItem onClick={() => onUpdateTransaction(transaction.id, { isReconciled: true, reconciledDate: new Date().toISOString() })}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Reconciled
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDeleteTransaction(transaction.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <p className="text-muted-foreground">
            Track and manage all your financial transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => {}}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.income)}
                </div>
                <p className="text-xs text-muted-foreground">Income</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.expenses)}
                </div>
                <p className="text-xs text-muted-foreground">Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={summary.netCashFlow >= 0 ? 'border-green-300' : 'border-red-300'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5" />
              <div>
                <div className={`text-2xl font-bold ${
                  summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.netCashFlow)}
                </div>
                <p className="text-xs text-muted-foreground">Net Cash Flow</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summary.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Order</Label>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({summary.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({summary.pending})</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="unreconciled">Unreconciled ({summary.unreconciled})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Transactions Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterType !== 'all' || filterCategory !== 'all' || filterDateRange !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Start by adding your first transaction'
                  }
                </p>
                <Button onClick={() => {}}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};