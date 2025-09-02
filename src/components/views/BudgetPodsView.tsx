import React, { useState, useEffect } from 'react';
import { Wallet, Home, Car, ShoppingCart, Heart, Shield, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import type { FullSubscription } from '../../types/subscription';
import { formatCurrency } from '../../utils/formatters';

interface BudgetPod {
  id: string;
  name: string;
  iconName: string;
  color: string;
  allocated: number;
  spent: number;
  remaining: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdrawal';
}

interface BudgetPodsViewProps {
  subscriptions: FullSubscription[];
}

export const BudgetPodsView: React.FC<BudgetPodsViewProps> = ({ subscriptions }) => {
  const [budgetPods, setBudgetPods] = useState<BudgetPod[]>([]);
  const [selectedPod, setSelectedPod] = useState<string | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    description: '',
    amount: '',
    type: 'withdrawal' as 'deposit' | 'withdrawal'
  });

  useEffect(() => {
    // Load budget pods from localStorage or initialize with defaults
    const localDataKey = `subtracker_budgetpods_local-user-001`;
    const storedPods = localStorage.getItem(localDataKey);
    
    if (storedPods) {
      setBudgetPods(JSON.parse(storedPods));
    } else {
      // Initialize default budget pods
      const defaultPods: BudgetPod[] = [
        {
          id: '1',
          name: 'Rent & Utilities',
          iconName: 'Home',
          color: 'bg-blue-500',
          allocated: 2000,
          spent: 1850,
          remaining: 150,
          transactions: [
            { id: '1', description: 'Monthly Rent', amount: 1500, date: '2025-08-01', type: 'withdrawal' },
            { id: '2', description: 'Electric Bill', amount: 120, date: '2025-08-05', type: 'withdrawal' },
            { id: '3', description: 'Internet', amount: 80, date: '2025-08-05', type: 'withdrawal' },
            { id: '4', description: 'Water Bill', amount: 150, date: '2025-08-10', type: 'withdrawal' },
          ]
        },
        {
          id: '2',
          name: 'Vehicle',
          iconName: 'Car',
          color: 'bg-green-500',
          allocated: 800,
          spent: 450,
          remaining: 350,
          transactions: [
            { id: '1', description: 'Gas', amount: 200, date: '2025-08-15', type: 'withdrawal' },
            { id: '2', description: 'Insurance', amount: 150, date: '2025-08-01', type: 'withdrawal' },
            { id: '3', description: 'Maintenance', amount: 100, date: '2025-08-20', type: 'withdrawal' },
          ]
        },
        {
          id: '3',
          name: 'Food & Groceries',
          iconName: 'ShoppingCart',
          color: 'bg-yellow-500',
          allocated: 600,
          spent: 425,
          remaining: 175,
          transactions: [
            { id: '1', description: 'Weekly Groceries', amount: 150, date: '2025-08-07', type: 'withdrawal' },
            { id: '2', description: 'Weekly Groceries', amount: 125, date: '2025-08-14', type: 'withdrawal' },
            { id: '3', description: 'Restaurant', amount: 75, date: '2025-08-18', type: 'withdrawal' },
            { id: '4', description: 'Coffee & Snacks', amount: 75, date: '2025-08-20', type: 'withdrawal' },
          ]
        },
        {
          id: '4',
          name: 'Subscriptions',
          iconName: 'Wallet',
          color: 'bg-purple-500',
          allocated: 300,
          spent: subscriptions.filter(s => s.status === 'active').reduce((sum, s) => {
            if (s.billingCycle === 'monthly') return sum + s.cost;
            if (s.billingCycle === 'yearly') return sum + (s.cost / 12);
            return sum;
          }, 0),
          remaining: 0,
          transactions: subscriptions.filter(s => s.status === 'active').map(s => ({
            id: s.id,
            description: s.name,
            amount: s.billingCycle === 'yearly' ? s.cost / 12 : s.cost,
            date: s.nextPayment,
            type: 'withdrawal' as const
          }))
        },
        {
          id: '5',
          name: 'Emergency Fund',
          iconName: 'Shield',
          color: 'bg-red-500',
          allocated: 500,
          spent: 0,
          remaining: 500,
          transactions: []
        },
        {
          id: '6',
          name: 'Personal & Fun',
          iconName: 'Heart',
          color: 'bg-pink-500',
          allocated: 400,
          spent: 250,
          remaining: 150,
          transactions: [
            { id: '1', description: 'Movie Tickets', amount: 50, date: '2025-08-10', type: 'withdrawal' },
            { id: '2', description: 'Gaming', amount: 60, date: '2025-08-15', type: 'withdrawal' },
            { id: '3', description: 'Books', amount: 40, date: '2025-08-18', type: 'withdrawal' },
            { id: '4', description: 'Gym Membership', amount: 100, date: '2025-08-01', type: 'withdrawal' },
          ]
        }
      ];
      
      // Update remaining amounts
      defaultPods.forEach(pod => {
        pod.remaining = pod.allocated - pod.spent;
      });
      
      setBudgetPods(defaultPods);
      localStorage.setItem(localDataKey, JSON.stringify(defaultPods));
    }
  }, [subscriptions]);

  const handleAddTransaction = () => {
    if (!selectedPod || !transactionForm.description || !transactionForm.amount) return;
    
    const updatedPods = budgetPods.map(pod => {
      if (pod.id === selectedPod) {
        const amount = parseFloat(transactionForm.amount);
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          description: transactionForm.description,
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          type: transactionForm.type
        };
        
        const newSpent = transactionForm.type === 'withdrawal' 
          ? pod.spent + amount 
          : pod.spent - amount;
          
        return {
          ...pod,
          spent: newSpent,
          remaining: pod.allocated - newSpent,
          transactions: [...pod.transactions, newTransaction]
        };
      }
      return pod;
    });
    
    setBudgetPods(updatedPods);
    localStorage.setItem(`subtracker_budgetpods_local-user-001`, JSON.stringify(updatedPods));
    
    setShowAddTransaction(false);
    setTransactionForm({ description: '', amount: '', type: 'withdrawal' });
  };

  const totalAllocated = budgetPods.reduce((sum, pod) => sum + pod.allocated, 0);
  const totalSpent = budgetPods.reduce((sum, pod) => sum + pod.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;

  // Function to get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      Home,
      Car,
      ShoppingCart,
      Wallet,
      Shield,
      Heart,
      Plus
    };
    return icons[iconName] || Wallet;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Pods</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Allocate your monthly budget into targeted spending categories
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalAllocated)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Monthly budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRemaining)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Pods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetPods.map((pod) => {
          const Icon = getIconComponent(pod.iconName);
          const percentage = pod.allocated > 0 ? (pod.spent / pod.allocated) * 100 : 0;
          
          return (
            <Card 
              key={pod.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPod(pod.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${pod.color} bg-opacity-20`}>
                      <Icon className={`w-5 h-5 ${pod.color.replace('bg-', 'text-')}`} />
                    </div>
                    <CardTitle className="text-lg">{pod.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Allocated</span>
                    <span className="font-medium">{formatCurrency(pod.allocated)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Spent</span>
                    <span className="font-medium text-orange-600">{formatCurrency(pod.spent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                    <span className="font-medium text-green-600">{formatCurrency(pod.remaining)}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    {percentage.toFixed(0)}% used
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Pod Details */}
      {selectedPod && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {budgetPods.find(p => p.id === selectedPod)?.name} - Transactions
              </CardTitle>
              <Button onClick={() => setShowAddTransaction(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddTransaction && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Description"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'deposit' | 'withdrawal' })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="withdrawal">Withdrawal</option>
                    <option value="deposit">Deposit</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleAddTransaction}>Add</Button>
                  <Button variant="outline" onClick={() => setShowAddTransaction(false)}>Cancel</Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {budgetPods.find(p => p.id === selectedPod)?.transactions.map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{transaction.date}</p>
                  </div>
                  <div className={`font-semibold ${transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetPodsView;