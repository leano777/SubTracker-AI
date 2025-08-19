import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Tag, 
  CreditCard, 
  Globe,
  Sparkles,
  User,
  Briefcase,
  Star,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  ChevronDown,
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import type { FullSubscription, FullPaymentCard } from '../../types/subscription';

interface ModernSubscriptionFormProps {
  subscription?: FullSubscription;
  cards: FullPaymentCard[];
  onSave: (data: Partial<FullSubscription>) => void;
  onCancel: () => void;
  isWatchlistMode?: boolean;
  onManageCards?: () => void;
}

// Popular services for quick selection
const POPULAR_SERVICES = [
  { name: 'Netflix', category: 'Entertainment', icon: '🎬', price: 15.99 },
  { name: 'Spotify', category: 'Entertainment', icon: '🎵', price: 9.99 },
  { name: 'Adobe Creative', category: 'Productivity', icon: '🎨', price: 54.99 },
  { name: 'Microsoft 365', category: 'Productivity', icon: '💼', price: 9.99 },
  { name: 'ChatGPT Plus', category: 'AI Tools', icon: '🤖', price: 20.00 },
  { name: 'Amazon Prime', category: 'Shopping', icon: '📦', price: 14.99 },
  { name: 'Gym Membership', category: 'Health', icon: '💪', price: 49.99 },
  { name: 'Cloud Storage', category: 'Storage', icon: '☁️', price: 9.99 },
];

const CATEGORIES = [
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'productivity', label: 'Productivity', icon: '💼' },
  { value: 'health', label: 'Health & Fitness', icon: '💪' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'storage', label: 'Storage', icon: '☁️' },
  { value: 'ai_tools', label: 'AI Tools', icon: '🤖' },
  { value: 'utilities', label: 'Utilities', icon: '🔧' },
  { value: 'other', label: 'Other', icon: '📌' },
];

export const ModernSubscriptionForm = ({
  subscription,
  cards = [],
  onSave,
  onCancel,
  isWatchlistMode = false,
  onManageCards,
}: ModernSubscriptionFormProps) => {
  const [formData, setFormData] = useState<Partial<FullSubscription>>({
    name: '',
    price: 0,
    frequency: 'monthly',
    category: 'other',
    status: isWatchlistMode ? 'watchlist' : 'active',
    nextPayment: new Date().toISOString().split('T')[0],
    subscriptionType: 'personal',
    priority: 'medium',
    notes: '',
    website: '',
    ...subscription,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [annualSavings, setAnnualSavings] = useState(0);
  const [weeklyAmount, setWeeklyAmount] = useState(0);

  // Calculate costs in different timeframes
  useEffect(() => {
    const price = formData.price || 0;
    const frequency = formData.frequency || 'monthly';
    
    let monthlyAmount = price;
    if (frequency === 'yearly') monthlyAmount = price / 12;
    if (frequency === 'quarterly') monthlyAmount = price / 3;
    if (frequency === 'weekly') monthlyAmount = price * 4.33;
    if (frequency === 'daily') monthlyAmount = price * 30;
    
    const yearlyAmount = monthlyAmount * 12;
    setWeeklyAmount(yearlyAmount / 52);
    
    // Calculate potential annual savings
    if (frequency === 'yearly' && price > 0) {
      const monthlyEquivalent = price / 12;
      const typicalMonthlyPrice = monthlyEquivalent * 1.2; // Assume 20% discount for annual
      setAnnualSavings((typicalMonthlyPrice * 12) - price);
    } else {
      setAnnualSavings(0);
    }
  }, [formData.price, formData.frequency]);

  const handleTemplateSelect = (template: typeof POPULAR_SERVICES[0]) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      price: template.price,
      category: template.category.toLowerCase().replace(' & ', '_'),
    }));
    setSelectedTemplate(template.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Templates for Popular Services */}
      {!subscription && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Add Popular Services</Label>
          <div className="grid grid-cols-4 gap-2">
            {POPULAR_SERVICES.slice(0, 8).map((service) => (
              <button
                key={service.name}
                type="button"
                onClick={() => handleTemplateSelect(service)}
                className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                  selectedTemplate === service.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{service.icon}</div>
                <div className="text-xs font-medium truncate">{service.name}</div>
                <div className="text-xs text-gray-500">{formatCurrency(service.price)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Form Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">
            <Zap className="w-4 h-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
          {isWatchlistMode && (
            <TabsTrigger value="evaluation">
              <Star className="w-4 h-4 mr-2" />
              Evaluation
            </TabsTrigger>
          )}
          {!isWatchlistMode && (
            <TabsTrigger value="details">
              <FileText className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Service Name*</Label>
            <div className="relative">
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Netflix, Spotify, Adobe Creative"
                required
                className="pl-10"
              />
              <Tag className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Category Selection with Icons */}
          <div className="space-y-2">
            <Label>Category*</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-3 rounded-lg border transition-all ${
                    formData.category === cat.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Personal vs Business Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              {formData.subscriptionType === 'personal' ? (
                <User className="w-5 h-5 text-blue-500" />
              ) : (
                <Briefcase className="w-5 h-5 text-green-500" />
              )}
              <div>
                <p className="font-medium text-sm">Subscription Type</p>
                <p className="text-xs text-gray-500">
                  {formData.subscriptionType === 'personal' ? 'Personal use' : 'Business expense'}
                </p>
              </div>
            </div>
            <Switch
              checked={formData.subscriptionType === 'business'}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, subscriptionType: checked ? 'business' : 'personal' })
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4 mt-4">
          {/* Price and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price*</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                  className="pl-10"
                />
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Billing Cycle*</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cost Breakdown Card */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Weekly</p>
                <p className="font-semibold">{formatCurrency(weeklyAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Monthly</p>
                <p className="font-semibold">
                  {formatCurrency(
                    formData.frequency === 'monthly' ? formData.price || 0 :
                    formData.frequency === 'yearly' ? (formData.price || 0) / 12 :
                    formData.frequency === 'quarterly' ? (formData.price || 0) / 3 :
                    formData.frequency === 'weekly' ? (formData.price || 0) * 4.33 :
                    (formData.price || 0) * 30
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Yearly</p>
                <p className="font-semibold">
                  {formatCurrency(
                    formData.frequency === 'yearly' ? formData.price || 0 :
                    formData.frequency === 'monthly' ? (formData.price || 0) * 12 :
                    formData.frequency === 'quarterly' ? (formData.price || 0) * 4 :
                    formData.frequency === 'weekly' ? (formData.price || 0) * 52 :
                    (formData.price || 0) * 365
                  )}
                </p>
              </div>
            </div>
            {annualSavings > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                <p className="text-sm text-green-600 dark:text-green-400 text-center">
                  💰 Saving {formatCurrency(annualSavings)}/year with annual billing!
                </p>
              </div>
            )}
          </div>

          {/* Next Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="nextPayment">Next Payment Date</Label>
            <div className="relative">
              <Input
                id="nextPayment"
                type="date"
                value={formData.nextPayment}
                onChange={(e) => setFormData({ ...formData, nextPayment: e.target.value })}
                className="pl-10"
              />
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Payment Method */}
          {cards.length > 0 && (
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                value={formData.paymentCardId || ''}
                onValueChange={(value) => setFormData({ ...formData, paymentCardId: value })}
              >
                {cards.map((card) => (
                  <div key={card.id} className="flex items-center space-x-2 p-2">
                    <RadioGroupItem value={card.id} id={card.id} />
                    <Label htmlFor={card.id} className="flex items-center cursor-pointer">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {card.name || `Card ending in ${card.lastFour}`}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </TabsContent>

        {/* Watchlist Evaluation Tab */}
        {isWatchlistMode && (
          <TabsContent value="evaluation" className="space-y-4 mt-4">
            {/* Priority Level */}
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: priority as any })}
                    className={`p-3 rounded-lg border capitalize transition-all ${
                      formData.priority === priority
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {priority === 'high' && <AlertCircle className="w-4 h-4 mx-auto mb-1 text-red-500" />}
                    {priority === 'medium' && <Clock className="w-4 h-4 mx-auto mb-1 text-yellow-500" />}
                    {priority === 'low' && <CheckCircle className="w-4 h-4 mx-auto mb-1 text-green-500" />}
                    <div className="text-sm font-medium">{priority}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Evaluation Notes */}
            <div className="space-y-2">
              <Label htmlFor="watchlistNotes">Why are you considering this?</Label>
              <Textarea
                id="watchlistNotes"
                value={formData.watchlistNotes || ''}
                onChange={(e) => setFormData({ ...formData, watchlistNotes: e.target.value })}
                placeholder="What problems will this solve? How will it help you personally or professionally?"
                rows={4}
              />
            </div>

            {/* Quick Evaluation Checklist */}
            <div className="space-y-2">
              <Label>Quick Evaluation</Label>
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Essential for work/productivity</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Replaces existing service</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Has free trial available</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Used by team/friends</span>
                </label>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Details Tab (for active subscriptions) */}
        {!isWatchlistMode && (
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Website URL */}
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <div className="relative">
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="pl-10"
                />
                <Globe className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Account details, usage notes, or anything else..."
                rows={3}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {['Essential', 'Work', 'Personal', 'Family', 'Shared', 'Trial'].map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      const currentTags = formData.tags || [];
                      if (currentTags.includes(tag)) {
                        setFormData({ ...formData, tags: currentTags.filter(t => t !== tag) });
                      } else {
                        setFormData({ ...formData, tags: [...currentTags, tag] });
                      }
                    }}
                  >
                    {(formData.tags || []).includes(tag) && '✓ '}
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="space-x-2">
          {onManageCards && (
            <Button type="button" variant="outline" onClick={onManageCards}>
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Cards
            </Button>
          )}
          <Button type="submit">
            {subscription ? 'Update' : isWatchlistMode ? 'Add to Watchlist' : 'Add Subscription'}
          </Button>
        </div>
      </div>
    </form>
  );
};