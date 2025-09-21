import { Calendar, DollarSign, MoreHorizontal, Edit2, Trash2, Building, User, ExternalLink, Eye, Clock, Gift, AlertTriangle, CreditCard, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FullSubscription } from '../types/subscription';
import { getDisplayDate, getDaysUntil } from '../utils/dateUtils';

interface SubscriptionCardProps {
  subscription: FullSubscription;
  onEdit: (subscription: FullSubscription) => void;
  onDelete: (id: string) => void;
  onViewDetails: (subscription: FullSubscription) => void;
}

export function SubscriptionCard({ subscription, onEdit, onDelete, onViewDetails }: SubscriptionCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    // Use centralized date utility for consistent formatting
    return getDisplayDate(dateString);
  };

  const getBillingCycleText = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return cycle;
    }
  };

  const getDaysUntilPayment = (nextPayment: string) => {
    // Use centralized date utility for consistent calculations
    return getDaysUntil(nextPayment);
  };

  const getDaysUntilTrialEnd = (trialEndDate: string) => {
    // Use centralized date utility for consistent calculations
    return getDaysUntil(trialEndDate);
  };

  const getPlanTypeInfo = () => {
    switch (subscription.planType) {
      case 'free':
        return {
          icon: <Gift className="w-3 h-3" />,
          text: 'Free',
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
        };
      case 'trial':
        const daysLeft = subscription.trialEndDate ? getDaysUntilTrialEnd(subscription.trialEndDate) : 0;
        return {
          icon: <Clock className="w-3 h-3" />,
          text: daysLeft <= 0 ? 'Trial Expired' : `Trial ${daysLeft}d`,
          color: daysLeft <= 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : 
                 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        };
      case 'paid':
        return null;
      default:
        return null;
    }
  };

  const getTypeIcon = () => {
    return subscription.subscriptionType === 'business' ? 
      <Building className="w-3 h-3" /> : 
      <User className="w-3 h-3" />;
  };

  const getTypeColor = () => {
    return subscription.subscriptionType === 'business' ? 
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  };

  const handleBillingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subscription.billingUrl) {
      window.open(subscription.billingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const daysUntilPayment = getDaysUntilPayment(subscription.nextPayment);
  const planTypeInfo = getPlanTypeInfo();
  const isTrialExpiringSoon = subscription.planType === 'trial' && subscription.trialEndDate && 
    getDaysUntilTrialEnd(subscription.trialEndDate) <= 3;

  return (
    <Card 
      className="relative cursor-pointer hover:shadow-md transition-shadow" 
      onClick={() => onViewDetails(subscription)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {subscription.logoUrl ? (
              <ImageWithFallback
                src={subscription.logoUrl}
                alt={`${subscription.name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium truncate min-w-0">{subscription.name}</h3>
                
                {/* Status Badge */}
                <Badge 
                  variant={subscription.isActive ? "default" : "secondary"}
                  className={`text-xs px-2 py-0.5 flex-shrink-0 ${subscription.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}`}
                >
                  {subscription.isActive ? "active" : "inactive"}
                </Badge>
                
                {/* Type Badge */}
                <Badge 
                  className={`text-xs px-2 py-0.5 flex-shrink-0 ${getTypeColor()} flex items-center gap-1`}
                >
                  {getTypeIcon()}
                  <span className="capitalize">{subscription.subscriptionType}</span>
                </Badge>
                
                {/* Plan Type Badge */}
                {planTypeInfo && (
                  <Badge className={`${planTypeInfo.color} flex items-center gap-1 text-xs px-2 py-0.5 flex-shrink-0`}>
                    {planTypeInfo.icon}
                    <span>{planTypeInfo.text}</span>
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{subscription.category}</p>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(subscription); }}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {subscription.billingUrl && (
              <DropdownMenuItem onClick={handleBillingClick}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Billing
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(subscription); }}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(subscription.id); }}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                {subscription.planType === 'free' ? 'Free' : 
                 subscription.planType === 'trial' ? formatCurrency(subscription.cost) : 
                 formatCurrency(subscription.cost)}
              </span>
              {subscription.planType === 'trial' && (
                <span className="text-sm text-muted-foreground">after trial</span>
              )}
            </div>
            {subscription.planType !== 'free' && (
              <Badge variant="secondary">{getBillingCycleText(subscription.billingCycle)}</Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {subscription.planType === 'free' ? 'Free plan - no payments' :
               subscription.planType === 'trial' ? `Trial ends: ${formatDate(subscription.trialEndDate || subscription.nextPayment)}` :
               `Next payment: ${formatDate(subscription.nextPayment)}`}
            </span>
          </div>
          
          {/* Trial expiration warning */}
          {isTrialExpiringSoon && (
            <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
              <AlertTriangle className="w-4 h-4" />
              <span>Trial ending soon! Don't forget to cancel or upgrade.</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              {/* Card linking status badge */}
              <Badge 
                className={`flex items-center space-x-1 text-xs ${
                  (subscription.hasLinkedCard ?? false)
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 stealth-ops:bg-green-900/20 stealth-ops:text-green-400 stealth-ops:border-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 stealth-ops:bg-red-900/20 stealth-ops:text-red-400 stealth-ops:border-red-400'
                }`}
                variant="outline"
              >
                <CreditCard className="w-3 h-3" />
                <span>{(subscription.hasLinkedCard ?? false) ? 'Card' : 'No Card'}</span>
              </Badge>
              
              {/* Automation status badge */}
              <Badge 
                className={`flex items-center space-x-1 text-xs ${
                  (subscription.automationEnabled ?? false)
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 stealth-ops:bg-green-900/20 stealth-ops:text-green-400 stealth-ops:border-green-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 stealth-ops:bg-red-900/20 stealth-ops:text-red-400 stealth-ops:border-red-400'
                }`}
                variant="outline"
              >
                <Zap className="w-3 h-3" />
                <span>{(subscription.automationEnabled ?? false) ? 'Auto' : 'Manual'}</span>
              </Badge>
            </div>
            
            {/* Payment/trial status */}
            {subscription.planType === 'free' ? (
              <Badge variant="outline" className="text-muted-foreground">
                No payments
              </Badge>
            ) : subscription.planType === 'trial' && subscription.trialEndDate ? (
              <Badge 
                variant={getDaysUntilTrialEnd(subscription.trialEndDate) <= 3 ? "destructive" : "outline"}
                className={getDaysUntilTrialEnd(subscription.trialEndDate) <= 3 ? "" : "text-muted-foreground"}
              >
                {getDaysUntilTrialEnd(subscription.trialEndDate) <= 0 ? "Trial ended" : 
                 `${getDaysUntilTrialEnd(subscription.trialEndDate)} days left`}
              </Badge>
            ) : (
              <Badge 
                variant={daysUntilPayment <= 7 ? "destructive" : "outline"}
                className={daysUntilPayment <= 7 ? "" : "text-muted-foreground"}
              >
                {daysUntilPayment <= 0 ? "Due today" : `${daysUntilPayment} days`}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {subscription.tags && subscription.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {subscription.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {subscription.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{subscription.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}