import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  Plus,
  Save,
  Bookmark,
  Calendar,
  DollarSign,
  Tag,
  User,
  Building,
  CreditCard,
  Target,
  ChevronDown,
  ChevronUp,
  RefreshCw,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import type { 
  Transaction,
  TransactionCategory,
  BudgetPod,
  IncomeSource
} from '../../types/financial';

interface TransactionFilter {
  id: string;
  name: string;
  description?: string;
  filters: FilterCriteria;
  isDefault?: boolean;
  createdDate: string;
}

interface FilterCriteria {
  searchQuery?: string;
  types?: string[];
  categories?: string[];
  amountRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
    preset?: string;
  };
  status?: {
    pending?: boolean;
    reconciled?: boolean;
    recurring?: boolean;
  };
  linkedItems?: {
    budgetPods?: string[];
    incomeSources?: string[];
    subscriptions?: string[];
  };
  tags?: string[];
}

interface AdvancedTransactionFilterProps {
  transactions: Transaction[];
  categories: TransactionCategory[];
  budgetPods: BudgetPod[];
  incomeSources: IncomeSource[];
  onFilterChange: (filteredTransactions: Transaction[], filterCriteria: FilterCriteria) => void;
  savedFilters?: TransactionFilter[];
  onSaveFilter?: (filter: TransactionFilter) => void;
  onDeleteFilter?: (filterId: string) => void;
}

const TRANSACTION_TYPES = [
  { value: 'income', label: 'Income', icon: DollarSign },
  { value: 'expense', label: 'Expense', icon: DollarSign },
  { value: 'transfer', label: 'Transfer', icon: DollarSign },
  { value: 'investment', label: 'Investment', icon: Target },
];

const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

export const AdvancedTransactionFilter = ({
  transactions,
  categories,
  budgetPods,
  incomeSources,
  onFilterChange,
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter,
}: AdvancedTransactionFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCriteria>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  // All available tags from transactions
  const availableTags = Array.from(
    new Set(
      transactions
        .flatMap(t => t.tags || [])
        .filter(tag => tag.trim().length > 0)
    )
  ).sort();

  // Apply filters to transactions
  useEffect(() => {
    let filtered = transactions;

    // Text search
    if (activeFilter.searchQuery) {
      const query = activeFilter.searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.notes?.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (activeFilter.types && activeFilter.types.length > 0) {
      filtered = filtered.filter(t => activeFilter.types!.includes(t.type));
    }

    // Category filter
    if (activeFilter.categories && activeFilter.categories.length > 0) {
      filtered = filtered.filter(t => activeFilter.categories!.includes(t.category));
    }

    // Amount range filter
    if (activeFilter.amountRange) {
      const { min, max } = activeFilter.amountRange;
      filtered = filtered.filter(t => {
        const amount = Math.abs(t.amount);
        return (!min || amount >= min) && (!max || amount <= max);
      });
    }

    // Date range filter
    if (activeFilter.dateRange) {
      const { start, end, preset } = activeFilter.dateRange;
      
      if (preset && preset !== 'custom') {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;

        switch (preset) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'yesterday':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            break;
          case 'this_week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            break;
          case 'last_week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 1);
            break;
          case 'this_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'last_month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
          default:
            startDate = now;
        }

        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      } else if (start || end) {
        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.date);
          return (!start || transactionDate >= new Date(start)) &&
                 (!end || transactionDate <= new Date(end));
        });
      }
    }

    // Status filters
    if (activeFilter.status) {
      const { pending, reconciled, recurring } = activeFilter.status;
      if (pending !== undefined) {
        filtered = filtered.filter(t => t.isPending === pending);
      }
      if (reconciled !== undefined) {
        filtered = filtered.filter(t => t.isReconciled === reconciled);
      }
      if (recurring !== undefined) {
        filtered = filtered.filter(t => t.isRecurring === recurring);
      }
    }

    // Linked items filters
    if (activeFilter.linkedItems) {
      const { budgetPods: podIds, incomeSources: incomeIds, subscriptions: subIds } = activeFilter.linkedItems;
      
      if (podIds && podIds.length > 0) {
        filtered = filtered.filter(t => 
          podIds.some(podId => 
            budgetPods.find(pod => pod.id === podId && 
              (pod.linkedSubscriptions?.includes(t.subscriptionId || '') || 
               pod.linkedBills?.includes(t.billId || ''))
            )
          )
        );
      }
      
      if (incomeIds && incomeIds.length > 0) {
        filtered = filtered.filter(t => 
          incomeIds.includes(t.externalAccountId || '') ||
          (t.type === 'income' && incomeIds.some(id => t.description.includes(id)))
        );
      }
    }

    // Tags filter
    if (activeFilter.tags && activeFilter.tags.length > 0) {
      filtered = filtered.filter(t => 
        t.tags?.some(tag => activeFilter.tags!.includes(tag))
      );
    }

    onFilterChange(filtered, activeFilter);
  }, [activeFilter, transactions, budgetPods, onFilterChange]);

  const handleFilterUpdate = (key: keyof FilterCriteria, value: any) => {
    setActiveFilter(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setActiveFilter({});
  };

  const loadSavedFilter = (filter: TransactionFilter) => {
    setActiveFilter(filter.filters);
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim() || !onSaveFilter) return;

    const newFilter: TransactionFilter = {
      id: `filter-${Date.now()}`,
      name: filterName.trim(),
      description: filterDescription.trim() || undefined,
      filters: activeFilter,
      createdDate: new Date().toISOString(),
    };

    onSaveFilter(newFilter);
    setShowSaveDialog(false);
    setFilterName('');
    setFilterDescription('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilter.searchQuery) count++;
    if (activeFilter.types?.length) count++;
    if (activeFilter.categories?.length) count++;
    if (activeFilter.amountRange?.min || activeFilter.amountRange?.max) count++;
    if (activeFilter.dateRange?.start || activeFilter.dateRange?.end || activeFilter.dateRange?.preset) count++;
    if (Object.values(activeFilter.status || {}).some(Boolean)) count++;
    if (Object.values(activeFilter.linkedItems || {}).some(arr => arr?.length)) count++;
    if (activeFilter.tags?.length) count++;
    return count;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="default" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Saved Filters</Label>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map((filter) => (
                    <div key={filter.id} className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadSavedFilter(filter)}
                        className="h-7 text-xs"
                      >
                        <Bookmark className="w-3 h-3 mr-1" />
                        {filter.name}
                      </Button>
                      {onDeleteFilter && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteFilter(filter.id)}
                          className="h-7 w-7 p-0 text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="amount">Amount & Date</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Basic Filters */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search transactions..."
                        value={activeFilter.searchQuery || ''}
                        onChange={(e) => handleFilterUpdate('searchQuery', e.target.value || undefined)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Transaction Types */}
                  <div className="space-y-2">
                    <Label>Transaction Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {TRANSACTION_TYPES.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type.value}`}
                            checked={activeFilter.types?.includes(type.value) || false}
                            onCheckedChange={(checked) => {
                              const currentTypes = activeFilter.types || [];
                              if (checked) {
                                handleFilterUpdate('types', [...currentTypes, type.value]);
                              } else {
                                handleFilterUpdate('types', currentTypes.filter(t => t !== type.value));
                              }
                            }}
                          />
                          <Label htmlFor={`type-${type.value}`} className="text-sm">
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 8).map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={activeFilter.categories?.includes(category.id) || false}
                          onCheckedChange={(checked) => {
                            const currentCategories = activeFilter.categories || [];
                            if (checked) {
                              handleFilterUpdate('categories', [...currentCategories, category.id]);
                            } else {
                              handleFilterUpdate('categories', currentCategories.filter(c => c !== category.id));
                            }
                          }}
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Amount & Date Filters */}
              <TabsContent value="amount" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Amount Range */}
                  <div className="space-y-2">
                    <Label>Amount Range</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={activeFilter.amountRange?.min || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          handleFilterUpdate('amountRange', {
                            ...activeFilter.amountRange,
                            min: value,
                          });
                        }}
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={activeFilter.amountRange?.max || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          handleFilterUpdate('amountRange', {
                            ...activeFilter.amountRange,
                            max: value,
                          });
                        }}
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Select
                      value={activeFilter.dateRange?.preset || ''}
                      onValueChange={(value) => {
                        handleFilterUpdate('dateRange', {
                          ...activeFilter.dateRange,
                          preset: value,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATE_PRESETS.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Date Range */}
                {activeFilter.dateRange?.preset === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={activeFilter.dateRange?.start || ''}
                        onChange={(e) => {
                          handleFilterUpdate('dateRange', {
                            ...activeFilter.dateRange,
                            start: e.target.value || undefined,
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={activeFilter.dateRange?.end || ''}
                        onChange={(e) => {
                          handleFilterUpdate('dateRange', {
                            ...activeFilter.dateRange,
                            end: e.target.value || undefined,
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Status Filters */}
              <TabsContent value="status" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pending">Pending Transactions</Label>
                    <Switch
                      id="pending"
                      checked={activeFilter.status?.pending || false}
                      onCheckedChange={(checked) => {
                        handleFilterUpdate('status', {
                          ...activeFilter.status,
                          pending: checked,
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="reconciled">Reconciled</Label>
                    <Switch
                      id="reconciled"
                      checked={activeFilter.status?.reconciled || false}
                      onCheckedChange={(checked) => {
                        handleFilterUpdate('status', {
                          ...activeFilter.status,
                          reconciled: checked,
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="recurring">Recurring</Label>
                    <Switch
                      id="recurring"
                      checked={activeFilter.status?.recurring || false}
                      onCheckedChange={(checked) => {
                        handleFilterUpdate('status', {
                          ...activeFilter.status,
                          recurring: checked,
                        });
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Filters */}
              <TabsContent value="advanced" className="space-y-4">
                {/* Tags */}
                {availableTags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.slice(0, 10).map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={activeFilter.tags?.includes(tag) || false}
                            onCheckedChange={(checked) => {
                              const currentTags = activeFilter.tags || [];
                              if (checked) {
                                handleFilterUpdate('tags', [...currentTags, tag]);
                              } else {
                                handleFilterUpdate('tags', currentTags.filter(t => t !== tag));
                              }
                            }}
                          />
                          <Label htmlFor={`tag-${tag}`} className="text-sm">
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget Pods */}
                <div className="space-y-2">
                  <Label>Related Budget Pods</Label>
                  <div className="flex flex-wrap gap-2">
                    {budgetPods.slice(0, 6).map((pod) => (
                      <div key={pod.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pod-${pod.id}`}
                          checked={activeFilter.linkedItems?.budgetPods?.includes(pod.id) || false}
                          onCheckedChange={(checked) => {
                            const currentPods = activeFilter.linkedItems?.budgetPods || [];
                            if (checked) {
                              handleFilterUpdate('linkedItems', {
                                ...activeFilter.linkedItems,
                                budgetPods: [...currentPods, pod.id],
                              });
                            } else {
                              handleFilterUpdate('linkedItems', {
                                ...activeFilter.linkedItems,
                                budgetPods: currentPods.filter(p => p !== pod.id),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`pod-${pod.id}`} className="text-sm">
                          {pod.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Save Filter */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
              </div>
              
              {onSaveFilter && getActiveFilterCount() > 0 && (
                <Popover open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="filter-name">Filter Name</Label>
                        <Input
                          id="filter-name"
                          placeholder="My Custom Filter"
                          value={filterName}
                          onChange={(e) => setFilterName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="filter-description">Description (optional)</Label>
                        <Input
                          id="filter-description"
                          placeholder="Brief description of this filter"
                          value={filterDescription}
                          onChange={(e) => setFilterDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveCurrentFilter} disabled={!filterName.trim()}>
                          Save Filter
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};