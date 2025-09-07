import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, DollarSign, Pause, Play, Trash2, Edit2, 
  TrendingUp, AlertCircle, Filter, X, ChevronDown
} from 'lucide-react';
import type { FullSubscription, PaymentCard as FullPaymentCard } from '../../types/subscription';
import { formatCurrency } from '../../utils/formatters';
import { calculateMonthlyAmount } from '../../utils/helpers';

interface SubscriptionsViewProps {
  subscriptions: FullSubscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<FullSubscription[]>>;
  paymentCards: FullPaymentCard[];
}

// Quick-add popular subscriptions
const POPULAR_SERVICES = [
  { name: 'Netflix', cost: 15.99, category: 'Entertainment' },
  { name: 'Spotify', cost: 9.99, category: 'Entertainment' },
  { name: 'ChatGPT Plus', cost: 20.00, category: 'AI & Tools' },
  { name: 'Microsoft 365', cost: 6.99, category: 'Productivity' },
  { name: 'Amazon Prime', cost: 14.99, category: 'Shopping' },
  { name: 'Disney+', cost: 7.99, category: 'Entertainment' },
];

export const OptimizedSubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  setSubscriptions,
  paymentCards,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'cost' | 'name' | 'date'>('cost');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [compactView, setCompactView] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    billingCycle: 'monthly',
    category: 'Entertainment',
    nextPayment: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    const monthlyTotal = active.reduce((sum, sub) => {
      return sum + calculateMonthlyAmount(sub.price, sub.frequency);
    }, 0);
    
    const highCostSubs = active.filter(sub => {
      const monthly = calculateMonthlyAmount(sub.price, sub.frequency);
      return monthly >= 25;
    });

    return {
      monthlyTotal,
      annualTotal: monthlyTotal * 12,
      activeCount: active.length,
      totalCount: subscriptions.length,
      highCostCount: highCostSubs.length,
      maxMonthly: Math.max(...active.map(s => calculateMonthlyAmount(s.price, s.frequency)), 0)
    };
  }, [subscriptions]);

  // Filter and sort subscriptions
  const processedSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter(sub => {
      const matchesSearch = !searchTerm || 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'cost':
          const aCost = calculateMonthlyAmount(a.price, a.frequency);
          const bCost = calculateMonthlyAmount(b.price, b.frequency);
          return bCost - aCost; // Highest first
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [subscriptions, searchTerm, sortBy, filterStatus]);

  // Get cost tier for visual indicators
  const getCostTier = (subscription: FullSubscription) => {
    const monthly = calculateMonthlyAmount(subscription.price, subscription.frequency);
    if (monthly >= 25) return { level: 'high', color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-800' };
    if (monthly >= 10) return { level: 'medium', color: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-800' };
    return { level: 'low', color: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-800' };
  };

  const handleAddSubscription = () => {
    if (!formData.name || !formData.cost) return;

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

    if (editingId) {
      setSubscriptions(subscriptions.map(sub => 
        sub.id === editingId ? { ...sub, ...newSubscription, id: editingId } : sub
      ));
      setEditingId(null);
    } else {
      setSubscriptions([...subscriptions, newSubscription]);
    }

    // Reset form
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
      parsed.subscriptions = editingId 
        ? subscriptions.map(sub => sub.id === editingId ? { ...sub, ...newSubscription, id: editingId } : sub)
        : [...subscriptions, newSubscription];
      localStorage.setItem(localDataKey, JSON.stringify(parsed));
    }
  };

  const handleQuickAdd = (service: typeof POPULAR_SERVICES[0]) => {
    const newSubscription: FullSubscription = {
      id: Date.now().toString(),
      name: service.name,
      price: service.cost,
      cost: service.cost,
      frequency: 'monthly',
      billingCycle: 'monthly',
      nextPayment: new Date().toISOString().split('T')[0],
      category: service.category,
      status: 'active',
      isActive: true,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setSubscriptions([...subscriptions, newSubscription]);
    setShowQuickAdd(false);

    // Save to localStorage
    const localDataKey = `subtracker_data_local-user-001`;
    const storedData = localStorage.getItem(localDataKey);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      parsed.subscriptions = [...subscriptions, newSubscription];
      localStorage.setItem(localDataKey, JSON.stringify(parsed));
    }
  };

  const handleToggleStatus = (id: string) => {
    setSubscriptions(subscriptions.map(sub => {
      if (sub.id === id) {
        const newStatus = sub.status === 'active' ? 'paused' : 'active';
        return { ...sub, status: newStatus, isActive: newStatus === 'active' };
      }
      return sub;
    }));
  };

  const handleDelete = (id: string) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    
    // Save to localStorage
    const localDataKey = `subtracker_data_local-user-001`;
    const storedData = localStorage.getItem(localDataKey);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      parsed.subscriptions = subscriptions.filter(sub => sub.id !== id);
      localStorage.setItem(localDataKey, JSON.stringify(parsed));
    }
  };

  const handleEdit = (subscription: FullSubscription) => {
    setEditingId(subscription.id);
    setFormData({
      name: subscription.name,
      cost: subscription.price.toString(),
      billingCycle: subscription.frequency,
      category: subscription.category || 'Entertainment',
      nextPayment: subscription.nextPayment,
      status: subscription.status
    });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-secondary border border-primary rounded-lg p-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">Subscriptions</h2>
            <p className="text-muted mt-1">Manage your recurring payments</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(stats.monthlyTotal)}</p>
              <p className="text-xs text-muted">Monthly</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{formatCurrency(stats.annualTotal)}</p>
              <p className="text-xs text-muted">Annual</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{stats.activeCount}</p>
              <p className="text-xs text-muted">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-error">{stats.highCostCount}</p>
              <p className="text-xs text-muted">High Cost</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-secondary border border-primary rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary placeholder-muted"
            />
          </div>

          {/* Sort & Filter */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-surface border border-primary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="cost">Cost ↓</option>
              <option value="name">Name</option>
              <option value="date">Due Date</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-surface border border-primary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => setCompactView(!compactView)}
              className={`px-3 py-2 border border-primary rounded-lg hover:bg-hover transition-colors ${
                compactView ? 'bg-primary text-primary-text' : 'bg-surface text-primary'
              }`}
              title="Toggle compact view"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Add Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="px-4 py-2 bg-surface border border-primary text-primary rounded-lg hover:bg-hover transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Quick Add
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-primary text-primary-text rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Custom
            </button>
          </div>
        </div>

        {/* Quick Add Panel */}
        {showQuickAdd && (
          <div className="mt-4 p-4 bg-surface rounded-lg border border-primary">
            <h3 className="font-semibold text-primary mb-3">Popular Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_SERVICES.map((service) => (
                <button
                  key={service.name}
                  onClick={() => handleQuickAdd(service)}
                  className="p-3 bg-secondary border border-primary rounded-lg hover:bg-hover transition-colors text-left"
                >
                  <p className="font-medium text-primary">{service.name}</p>
                  <p className="text-sm text-muted">{formatCurrency(service.cost)}/mo</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subscriptions List */}
      <div className="space-y-3">
        {processedSubscriptions.map((subscription) => {
          const monthlyCost = calculateMonthlyAmount(subscription.price, subscription.frequency);
          const costTier = getCostTier(subscription);
          const costPercentage = stats.maxMonthly > 0 ? (monthlyCost / stats.maxMonthly) * 100 : 0;

          return (
            <div
              key={subscription.id}
              className={`bg-secondary border rounded-lg transition-all hover:shadow-md ${costTier.color}`}
            >
              {compactView ? (
                // Compact View
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      subscription.status === 'active' ? 'bg-success' :
                      subscription.status === 'paused' ? 'bg-warning' : 'bg-muted'
                    }`} />
                    <div className="flex-1">
                      <p className="font-semibold text-primary truncate">{subscription.name}</p>
                      <p className="text-xs text-muted">{subscription.category} • {subscription.frequency}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(monthlyCost)}</p>
                    <p className="text-xs text-muted">/month</p>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleStatus(subscription.id)}
                      className="p-1.5 hover:bg-hover rounded transition-colors"
                      title={subscription.status === 'active' ? 'Pause' : 'Resume'}
                    >
                      {subscription.status === 'active' ? 
                        <Pause className="w-4 h-4 text-warning" /> : 
                        <Play className="w-4 h-4 text-success" />
                      }
                    </button>
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="p-1.5 hover:bg-hover rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(subscription.id)}
                      className="p-1.5 hover:bg-hover rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-error" />
                    </button>
                  </div>
                </div>
              ) : (
                // Full View
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          subscription.status === 'active' ? 'bg-success' :
                          subscription.status === 'paused' ? 'bg-warning' : 'bg-muted'
                        }`} />
                        <h3 className="text-lg font-semibold text-primary">{subscription.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${costTier.badge}`}>
                          {costTier.level.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-secondary mb-3">
                        <span>{subscription.category}</span>
                        <span>{subscription.frequency}</span>
                        <span>Next: {new Date(subscription.nextPayment).toLocaleDateString()}</span>
                      </div>

                      {/* Cost Bar */}
                      <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            costTier.level === 'high' ? 'bg-error' :
                            costTier.level === 'medium' ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${costPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Cost Display */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyCost)}</p>
                      <p className="text-sm text-muted">/month</p>
                      <p className="text-xs text-secondary mt-1">
                        {formatCurrency(subscription.price)}/{subscription.frequency.replace('ly', '')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2">
                      <button
                        onClick={() => handleToggleStatus(subscription.id)}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                          subscription.status === 'active' 
                            ? 'bg-warning/20 text-warning hover:bg-warning/30' 
                            : 'bg-success/20 text-success hover:bg-success/30'
                        }`}
                      >
                        {subscription.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subscription.id)}
                        className="p-2 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {processedSubscriptions.length === 0 && (
          <div className="text-center py-12 bg-secondary rounded-lg border border-primary">
            <DollarSign className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary mb-2">No subscriptions found</h3>
            <p className="text-muted mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by adding your first subscription'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-primary text-primary-text rounded-lg hover:opacity-90 transition-opacity"
            >
              Add Your First Subscription
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center p-4 z-50">
          <div className="bg-secondary rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary">
                  {editingId ? 'Edit' : 'Add'} Subscription
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      cost: '',
                      billingCycle: 'monthly',
                      category: 'Entertainment',
                      nextPayment: new Date().toISOString().split('T')[0],
                      status: 'active'
                    });
                  }}
                  className="text-muted hover:text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddSubscription(); }} className="space-y-4">
                {/* Essential Fields Only */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                    placeholder="e.g. Netflix"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Cost *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                      placeholder="9.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Frequency *
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                {/* Optional fields - collapsible */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-muted hover:text-primary flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    Advanced Options
                  </summary>
                  <div className="mt-3 space-y-3 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                      >
                        <option value="Entertainment">Entertainment</option>
                        <option value="Productivity">Productivity</option>
                        <option value="AI & Tools">AI & Tools</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Health">Health</option>
                        <option value="Education">Education</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">
                        Next Payment
                      </label>
                      <input
                        type="date"
                        value={formData.nextPayment}
                        onChange={(e) => setFormData({ ...formData, nextPayment: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                      />
                    </div>
                  </div>
                </details>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setFormData({
                        name: '',
                        cost: '',
                        billingCycle: 'monthly',
                        category: 'Entertainment',
                        nextPayment: new Date().toISOString().split('T')[0],
                        status: 'active'
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-text rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {editingId ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedSubscriptionsView;