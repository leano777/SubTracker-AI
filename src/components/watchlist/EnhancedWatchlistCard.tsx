import { useState } from 'react';
import {
  Star,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  TrendingUp,
  FileText,
  Zap,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import type { FullSubscription } from '../../types/subscription';

interface EnhancedWatchlistCardProps {
  subscription: FullSubscription;
  onEdit: (subscription: FullSubscription) => void;
  onDelete: (id: string) => void;
  onActivate: (subscription: FullSubscription) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export const EnhancedWatchlistCard = ({
  subscription,
  onEdit,
  onDelete,
  onActivate,
  onUpdateNotes,
}: EnhancedWatchlistCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(subscription.watchlistNotes || '');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMonthlyAmount = () => {
    switch (subscription.frequency) {
      case 'yearly':
        return subscription.price / 12;
      case 'quarterly':
        return subscription.price / 3;
      case 'weekly':
        return subscription.price * 4.33;
      case 'daily':
        return subscription.price * 30;
      default:
        return subscription.price;
    }
  };

  const getPriorityColor = () => {
    switch (subscription.priority) {
      case 'high':
      case 'essential':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
      case 'important':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
      case 'nice-to-have':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-gray-300 dark:border-gray-700';
    }
  };

  const getPriorityIcon = () => {
    switch (subscription.priority) {
      case 'high':
      case 'essential':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
      case 'important':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
      case 'nice-to-have':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleSaveNotes = () => {
    onUpdateNotes(subscription.id, tempNotes);
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setTempNotes(subscription.watchlistNotes || '');
    setIsEditingNotes(false);
  };

  // Parse evaluation notes for pros/cons
  const extractProsAndCons = (notes: string) => {
    const pros: string[] = [];
    const cons: string[] = [];
    
    if (notes) {
      const lines = notes.split('\n');
      let currentSection = '';
      
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('pros:') || lowerLine.includes('benefits:') || lowerLine.includes('advantages:')) {
          currentSection = 'pros';
        } else if (lowerLine.includes('cons:') || lowerLine.includes('drawbacks:') || lowerLine.includes('disadvantages:')) {
          currentSection = 'cons';
        } else if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          const item = line.trim().substring(2);
          if (currentSection === 'pros') {
            pros.push(item);
          } else if (currentSection === 'cons') {
            cons.push(item);
          }
        }
      });
    }
    
    return { pros, cons };
  };

  const { pros, cons } = extractProsAndCons(subscription.watchlistNotes || '');

  return (
    <Card className={`transition-all hover:shadow-lg ${getPriorityColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {subscription.favicon ? (
              <img
                src={subscription.favicon}
                alt={subscription.name}
                className="w-10 h-10 rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-gray-500" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{subscription.name}</h3>
                {getPriorityIcon()}
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <Badge variant="outline" className="text-xs">
                  {subscription.category}
                </Badge>
                <div className="flex items-center text-xs text-gray-500">
                  {subscription.subscriptionType === 'business' ? (
                    <>
                      <Briefcase className="w-3 h-3 mr-1" />
                      Business
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Personal
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(subscription)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(subscription.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Pricing Information */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
            <p className="text-xs text-gray-500 mb-1">{subscription.frequency}</p>
            <p className="font-semibold">{formatCurrency(subscription.price)}</p>
          </div>
          <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
            <p className="text-xs text-gray-500 mb-1">Monthly</p>
            <p className="font-semibold">{formatCurrency(getMonthlyAmount())}</p>
          </div>
          <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
            <p className="text-xs text-gray-500 mb-1">Yearly</p>
            <p className="font-semibold">{formatCurrency(getMonthlyAmount() * 12)}</p>
          </div>
        </div>

        {/* Quick Pros/Cons Display */}
        {(pros.length > 0 || cons.length > 0) && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {pros.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-green-600 dark:text-green-400">Pros:</p>
                {pros.slice(0, 2).map((pro, index) => (
                  <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                    • {pro}
                  </p>
                ))}
                {pros.length > 2 && (
                  <p className="text-xs text-gray-400">+{pros.length - 2} more</p>
                )}
              </div>
            )}
            {cons.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">Cons:</p>
                {cons.slice(0, 2).map((con, index) => (
                  <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                    • {con}
                  </p>
                ))}
                {cons.length > 2 && (
                  <p className="text-xs text-gray-400">+{cons.length - 2} more</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Expandable Details Section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="text-sm">View Details & Notes</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-4 space-y-4">
            {/* Evaluation Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Evaluation Notes</Label>
                {!isEditingNotes && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditingNotes ? (
                <div className="space-y-2">
                  <Textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Why are you considering this? What problems will it solve? Pros/Cons?"
                    rows={6}
                    className="text-sm"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline" onClick={handleCancelNotes}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveNotes}>
                      Save Notes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {subscription.watchlistNotes || 'No evaluation notes yet. Click Edit to add your thoughts.'}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Details */}
            {subscription.notes && subscription.notes !== subscription.watchlistNotes && (
              <div>
                <Label className="text-sm font-medium mb-2">Additional Notes</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscription.notes}
                </p>
              </div>
            )}

            {/* Tags */}
            {subscription.tags && subscription.tags.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {subscription.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Added Date */}
            <div className="text-xs text-gray-500">
              Added to watchlist: {new Date(subscription.dateAdded).toLocaleDateString()}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Button */}
        <Button
          className="w-full mt-4"
          onClick={() => onActivate(subscription)}
        >
          <Zap className="w-4 h-4 mr-2" />
          Activate Subscription
        </Button>
      </CardContent>
    </Card>
  );
};

// Add missing import for Label
import { Label } from '../ui/label';