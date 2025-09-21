import { ExternalLink, Edit, Trash2, Calendar, DollarSign, Tag, CreditCard, Clock, XCircle, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Subscription } from '../types/subscription';

interface SubscriptionDetailsModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onCancel?: (id: string) => void;
  onReactivate?: (id: string) => void;
}

export function SubscriptionDetailsModal({ 
  subscription, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  onCancel,
  onReactivate
}: SubscriptionDetailsModalProps) {
  // Static accessibility ID to prevent undefined values
  const SUBSCRIPTION_DETAILS_DESCRIPTION_ID = 'subscription-details-description';
  
  if (!subscription) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthlyEquivalent = () => {
    switch (subscription.billingCycle) {
      case 'monthly':
      case 'variable':
        return subscription.cost;
      case 'quarterly':
        return subscription.cost / 3;
      case 'yearly':
        return subscription.cost / 12;
      default:
        return subscription.cost;
    }
  };

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'watchlist':
        return <Badge variant="outline">Watchlist</Badge>;
      default:
        return null;
    }
  };

  const getDaysUntilPayment = () => {
    const today = new Date();
    const paymentDate = new Date(subscription.nextPayment);
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilPayment = getDaysUntilPayment();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={SUBSCRIPTION_DETAILS_DESCRIPTION_ID}>
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {subscription.logoUrl && (
                <img 
                  src={subscription.logoUrl} 
                  alt={`${subscription.name} logo`}
                  className="w-10 h-10 rounded"
                />
              )}
              <div>
                <DialogTitle className="text-xl">{subscription.name}</DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge()}
                  <Badge variant="outline">{subscription.subscriptionType}</Badge>
                  <Badge variant="secondary">{subscription.category}</Badge>
                </div>
              </div>
            </div>
          </div>
          <DialogDescription id={SUBSCRIPTION_DETAILS_DESCRIPTION_ID}>
            View detailed information about your subscription including cost breakdown, payment schedule, and manage subscription settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cost Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Cost Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Billing Amount</div>
                  <div className="text-2xl font-bold">{formatCurrency(subscription.cost)}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {subscription.billingCycle === 'variable' ? 'Variable pricing' : `per ${subscription.billingCycle.replace('ly', '')}`}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Monthly Equivalent</div>
                  <div className="text-2xl font-bold">{formatCurrency(getMonthlyEquivalent())}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>

              {subscription.billingCycle === 'variable' && subscription.variablePricing?.upcomingChanges && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Upcoming Price Changes</div>
                  <div className="space-y-2">
                    {subscription.variablePricing.upcomingChanges.map((change, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <div className="font-medium">{formatCurrency(change.cost)}</div>
                          <div className="text-xs text-muted-foreground">{change.description}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(change.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          {subscription.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Next Payment</div>
                    <div className="font-medium">{formatDate(subscription.nextPayment)}</div>
                    {daysUntilPayment >= 0 && (
                      <div className={`text-sm ${daysUntilPayment <= 7 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        {daysUntilPayment === 0 ? 'Due today' : 
                         daysUntilPayment === 1 ? 'Due tomorrow' : 
                         `Due in ${daysUntilPayment} days`}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancellation Information */}
          {subscription.status === 'cancelled' && subscription.dateCancelled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4" />
                  <span>Cancellation Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="text-sm text-muted-foreground">Date Cancelled</div>
                  <div className="font-medium">{formatDate(subscription.dateCancelled)}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Details */}
          {(subscription.description || subscription.tags?.length) && (
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subscription.description && (
                  <div>
                    <div className="text-sm text-muted-foreground">Description</div>
                    <div>{subscription.description}</div>
                  </div>
                )}
                
                {subscription.tags && subscription.tags.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {subscription.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Watchlist Notes */}
          {subscription.status === 'watchlist' && subscription.watchlistNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Watchlist Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{subscription.watchlistNotes}</p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => onEdit(subscription)} className="flex-1 min-w-[120px]">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>

            {subscription.billingUrl && (
              <Button 
                variant="outline" 
                onClick={() => window.open(subscription.billingUrl, '_blank')}
                className="flex-1 min-w-[120px]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Billing Page
              </Button>
            )}

            {subscription.status === 'active' && onCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1 min-w-[120px] text-orange-600 border-orange-200 hover:bg-orange-50">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel "{subscription.name}"? This will mark it as cancelled and remove it from your active subscriptions. You can reactivate it later if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Active</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => {
                        onCancel(subscription.id);
                        onClose();
                      }}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Cancel Subscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {subscription.status === 'cancelled' && onReactivate && (
              <Button 
                variant="outline" 
                onClick={() => {
                  onReactivate(subscription.id);
                  onClose();
                }}
                className="flex-1 min-w-[120px] text-green-600 border-green-200 hover:bg-green-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reactivate
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 min-w-[120px] text-destructive border-destructive/20 hover:bg-destructive/5">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to permanently delete "{subscription.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      onDelete(subscription.id);
                      onClose();
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}