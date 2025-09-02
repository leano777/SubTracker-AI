import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { FullSubscription, PaymentCard as FullPaymentCard } from '../../types/subscription';
import { formatCurrency } from '../../utils/formatters';

interface SubscriptionsViewProps {
  subscriptions: FullSubscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<FullSubscription[]>>;
  paymentCards: FullPaymentCard[];
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  setSubscriptions,
  paymentCards,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    billingCycle: 'monthly',
    category: 'Entertainment',
    nextPayment: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const handleAddSubscription = () => {
    const newSubscription: FullSubscription = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.cost),
      cost: parseFloat(formData.cost),
      frequency: formData.billingCycle as any,
      billingCycle: formData.billingCycle as any,
      nextPayment: formData.nextPayment,
      category: formData.category,
      status: formData.status as any,
      isActive: formData.status === 'active',
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setSubscriptions([...subscriptions, newSubscription]);
    setShowAddForm(false);
    setFormData({
      name: '',
      cost: '',
      billingCycle: 'monthly',
      category: 'Entertainment',
      nextPayment: new Date().toISOString().split('T')[0],
      status: 'active'
    });

    // Save to localStorage
    const localDataKey = `subtracker_data_local-user-001`;
    const storedData = localStorage.getItem(localDataKey);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      parsed.subscriptions = [...subscriptions, newSubscription];
      localStorage.setItem(localDataKey, JSON.stringify(parsed));
    }
  };

  const handleDeleteSubscription = (id: string) => {
    const updated = subscriptions.filter(sub => sub.id !== id);
    setSubscriptions(updated);
    
    // Save to localStorage
    const localDataKey = `subtracker_data_local-user-001`;
    const storedData = localStorage.getItem(localDataKey);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      parsed.subscriptions = updated;
      localStorage.setItem(localDataKey, JSON.stringify(parsed));
    }
  };

  const getDaysUntilPayment = (date: string) => {
    const nextPayment = new Date(date);
    const today = new Date();
    const diffTime = nextPayment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all your subscription services in one place
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Add Subscription Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Netflix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Entertainment">Entertainment</option>
                  <option value="Productivity">Productivity</option>
                  <option value="AI & Tools">AI & Tools</option>
                  <option value="Storage">Storage</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Design">Design</option>
                  <option value="Development">Development</option>
                  <option value="Finance">Finance</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Next Payment
                </label>
                <input
                  type="date"
                  value={formData.nextPayment}
                  onChange={(e) => setFormData({ ...formData, nextPayment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddSubscription}>Add Subscription</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions List */}
      <div className="grid gap-4">
        {subscriptions.map((subscription) => {
          const daysUntil = getDaysUntilPayment(subscription.nextPayment);
          
          return (
            <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      subscription.status === 'active' ? 'bg-green-500' : 
                      subscription.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-lg">{subscription.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="secondary">{subscription.category}</Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {subscription.billingCycle}
                        </span>
                        {daysUntil <= 7 && daysUntil >= 0 && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Due in {daysUntil} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(subscription.cost)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        per {subscription.billingCycle.replace('ly', '')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(subscription.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSubscription(subscription.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionsView;