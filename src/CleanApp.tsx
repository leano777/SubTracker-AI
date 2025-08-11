import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Plus, DollarSign, Calendar, CreditCard } from 'lucide-react';

// Simple subscription interface
interface SimpleSubscription {
  id: string;
  name: string;
  price: number;
  frequency: 'monthly' | 'yearly' | 'quarterly';
  nextPayment: string;
  category: string;
}

// Main app content
const AppContent = () => {
  const { user, loading, signIn, signOut, signUp } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SimpleSubscription[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    price: string;
    frequency: 'monthly' | 'yearly' | 'quarterly';
    nextPayment: string;
    category: string;
  }>({
    name: '',
    price: '',
    frequency: 'monthly',
    nextPayment: '',
    category: 'Entertainment'
  });

  // Authentication form state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('mleano.business@gmail.com');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Load demo data for unauthenticated users
  useEffect(() => {
    if (!user) {
      setSubscriptions([
        {
          id: '1',
          name: 'Netflix',
          price: 15.99,
          frequency: 'monthly',
          nextPayment: '2025-08-15',
          category: 'Entertainment'
        },
        {
          id: '2',
          name: 'Adobe Creative Cloud',
          price: 239.88,
          frequency: 'yearly',
          nextPayment: '2025-12-01',
          category: 'Business'
        }
      ]);
    }
  }, [user]);

  // Calculate monthly total
  const monthlyTotal = subscriptions.reduce((total, sub) => {
    const monthlyAmount = sub.frequency === 'monthly' ? sub.price :
                         sub.frequency === 'yearly' ? sub.price / 12 :
                         sub.frequency === 'quarterly' ? sub.price / 3 : sub.price;
    return total + monthlyAmount;
  }, 0);

  // Add subscription
  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: SimpleSubscription = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      frequency: formData.frequency,
      nextPayment: formData.nextPayment,
      category: formData.category
    };
    
    setSubscriptions(prev => [...prev, newSub]);
    setFormData({
      name: '',
      price: '',
      frequency: 'monthly',
      nextPayment: '',
      category: 'Entertainment'
    });
    setShowAddForm(false);
  };

  // Delete subscription
  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  // Handle authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      if (authMode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, email); // Using email as name for now
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading SubTracker AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">SubTracker AI</h1>
            <p className="mt-2 text-gray-600">Manage your subscriptions efficiently</p>
          </div>
          
          <Card className="p-6">
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {authError && (
                <p className="text-red-600 text-sm">{authError}</p>
              )}
              
              <Button type="submit" className="w-full">
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
              
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="w-full text-sm text-blue-600 hover:underline"
              >
                {authMode === 'signin' ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
              </button>
            </form>
          </Card>

          {/* Demo data for testing */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Demo Features:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Track monthly & yearly subscriptions</p>
              <p>✅ Budget monitoring & alerts</p>
              <p>✅ Payment card management</p>
              <p>✅ Cloud sync across devices</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">SubTracker AI</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <Button variant="outline" onClick={signOut}>Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yearly Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(monthlyTotal * 12).toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add Subscription Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubscription} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Netflix, Spotify, etc."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                    placeholder="15.99"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <select
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({...prev, frequency: e.target.value as 'monthly' | 'yearly' | 'quarterly'}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="nextPayment">Next Payment</Label>
                  <Input
                    id="nextPayment"
                    type="date"
                    value={formData.nextPayment}
                    onChange={(e) => setFormData(prev => ({...prev, nextPayment: e.target.value}))}
                    required
                  />
                </div>
                
                <div className="flex items-end space-x-2">
                  <Button type="submit">Add</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Subscriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No subscriptions yet. Click "Add Subscription" to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Service</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Frequency</th>
                      <th className="text-left py-2">Next Payment</th>
                      <th className="text-left py-2">Monthly Cost</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => {
                      const monthlyAmount = sub.frequency === 'monthly' ? sub.price :
                                           sub.frequency === 'yearly' ? sub.price / 12 :
                                           sub.frequency === 'quarterly' ? sub.price / 3 : sub.price;
                      
                      return (
                        <tr key={sub.id} className="border-b">
                          <td className="py-3 font-medium">{sub.name}</td>
                          <td className="py-3">${sub.price.toFixed(2)}</td>
                          <td className="py-3 capitalize">{sub.frequency}</td>
                          <td className="py-3">{sub.nextPayment}</td>
                          <td className="py-3">${monthlyAmount.toFixed(2)}</td>
                          <td className="py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSubscription(sub.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Toaster />
    </div>
  );
};

// Clean App with AuthProvider
const CleanApp = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default CleanApp;
