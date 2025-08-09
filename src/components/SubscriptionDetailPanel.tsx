import {
  Calendar,
  CreditCard,
  DollarSign,
  Edit3,
  ExternalLink,
  Save,
  X,
  Zap,
  Star,
  Play,
  Pause,
  Trash2,
  AlertCircle,
  CheckCircle,
  Globe,
  Tag,
  Clock,
  User,
  Building,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

import type { FullSubscription, PaymentCard } from "../types/subscription";
import { subscriptionSchema, type SubscriptionFormData } from "../schemas/subscriptionSchema";
import { formatCurrency } from "../utils/helpers";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

const categories = [
  "Entertainment",
  "Productivity", 
  "Business",
  "Design",
  "Developer Tools",
  "Health & Fitness",
  "Education",
  "News & Media",
  "Music",
  "Gaming",
  "Finance",
  "Security",
  "Storage",
  "Communication",
  "Social Media",
  "AI & Tools",
  "Insurance",
  "Health & Wellness",
];

interface SubscriptionDetailPanelProps {
  subscription: FullSubscription;
  cards: PaymentCard[];
  onEdit: (subscription: FullSubscription) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
  onReactivate: (id: string) => void;
  onActivateFromWatchlist: (id: string) => void;
  onClose: () => void;
}

export const SubscriptionDetailPanel = ({
  subscription,
  cards,
  onEdit,
  onDelete,
  onCancel,
  onReactivate,
  onActivateFromWatchlist,
  onClose,
}: SubscriptionDetailPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: subscription.name,
      cost: subscription.cost,
      billingCycle: subscription.billingCycle,
      nextPayment: subscription.nextPayment,
      category: subscription.category,
      description: subscription.description || "",
      billingUrl: subscription.billingUrl || "",
      subscriptionType: (subscription.subscriptionType || "personal") as "personal" | "business",
      tags: subscription.tags?.join(", ") || "",
      planType: (subscription.planType || "paid") as "free" | "paid" | "trial",
      priority: subscription.priority as any,
      watchlistNotes: subscription.watchlistNotes || "",
      cardId: subscription.cardId || "",
      automationEnabled: subscription.automationEnabled || false,
      variablePricing: subscription.variablePricing ? {
        isVariable: subscription.variablePricing.isVariable || false,
        upcomingChanges: subscription.variablePricing.upcomingChanges || [],
      } : undefined,
    },
  });

  const onSubmit = async (data: SubscriptionFormData) => {
    setIsSubmitting(true);
    try {
      // Transform form data back to FullSubscription format
      const updatedSubscription: FullSubscription = {
        ...subscription,
        name: data.name,
        cost: data.cost,
        price: data.cost, // Sync both fields
        billingCycle: data.billingCycle,
        nextPayment: data.nextPayment,
        category: data.category,
        description: data.description,
        billingUrl: data.billingUrl,
        subscriptionType: data.subscriptionType,
        tags: Array.isArray(data.tags) ? data.tags : typeof data.tags === 'string' ? 
          data.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [],
        planType: data.planType,
        priority: data.priority,
        watchlistNotes: data.watchlistNotes,
        cardId: data.cardId || undefined,
        automationEnabled: data.automationEnabled,
        variablePricing: data.variablePricing?.isVariable ? {
          minPrice: data.cost * 0.8,
          maxPrice: data.cost * 1.2,
          averagePrice: data.cost,
          isVariable: true,
          upcomingChanges: data.variablePricing.upcomingChanges || [],
        } : undefined,
        hasLinkedCard: !!data.cardId,
      };

      onEdit(updatedSubscription);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update subscription:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysUntilPayment = (nextPayment: string | undefined) => {
    if (!nextPayment) return null;
    const paymentDate = new Date(nextPayment);
    const now = new Date();
    const daysUntil = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "watchlist":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const daysUntil = getDaysUntilPayment(subscription.nextPayment);
  const card = cards.find((c) => c.id === subscription.cardId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          {subscription.logoUrl ? (
            <ImageWithFallback
              src={subscription.logoUrl}
              alt={`${subscription.name} logo`}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{subscription.name}</h2>
            <p className="text-sm text-muted-foreground">{subscription.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Netflix, Spotify, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="9.99"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="billingCycle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Cycle</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select cycle" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                  <SelectItem value="variable">Variable</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subscriptionType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="personal">Personal</SelectItem>
                                  <SelectItem value="business">Business</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="nextPayment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Next Payment Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Additional Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What does this subscription provide?"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="billingUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing URL</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="streaming, entertainment, music"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Separate multiple tags with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Payment & Automation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment & Automation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="cardId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Card</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a payment card" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No card selected</SelectItem>
                                {cards.map((card) => (
                                  <SelectItem key={card.id} value={card.id}>
                                    {card.nickname || `****${card.lastFour}`} ({card.type})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="automationEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Automation Enabled</FormLabel>
                              <FormDescription>
                                Enable automatic renewal notifications and management
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key="viewing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-muted-foreground">Cost</span>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(subscription.cost)}</div>
                    <div className="text-sm text-muted-foreground">{subscription.billingCycle}</div>
                  </CardContent>
                </Card>

                {subscription.nextPayment && subscription.status === "active" && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-muted-foreground">Next Payment</span>
                      </div>
                      <div className="text-lg font-bold">
                        {new Date(subscription.nextPayment).toLocaleDateString()}
                      </div>
                      {daysUntil !== null && (
                        <div
                          className={`text-sm ${
                            daysUntil <= 3
                              ? "text-red-600 font-medium"
                              : daysUntil <= 7
                                ? "text-orange-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {daysUntil === 0
                            ? "Due today"
                            : daysUntil === 1
                              ? "Due tomorrow"
                              : `Due in ${daysUntil} days`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Details Grid */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Type
                      </label>
                      <div className="flex items-center gap-1">
                        {subscription.subscriptionType === "business" ? (
                          <Building className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {subscription.subscriptionType || "Personal"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Added
                      </label>
                      <div>{new Date(subscription.dateAdded).toLocaleDateString()}</div>
                    </div>

                    {card && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          Payment Card
                        </label>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {card.nickname || `****${card.lastFour}`}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Automation
                      </label>
                      <div className="flex items-center gap-1">
                        {subscription.automationEnabled ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-orange-600" />
                        )}
                        {subscription.automationEnabled ? "Enabled" : "Manual"}
                      </div>
                    </div>
                  </div>

                  {subscription.description && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="text-sm">{subscription.description}</p>
                      </div>
                    </>
                  )}

                  {subscription.tags && subscription.tags.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {subscription.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {subscription.billingUrl && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(subscription.billingUrl, "_blank")}
                          className="w-full"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Open Billing Page
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Variable Pricing */}
              {subscription.variablePricing?.upcomingChanges &&
                subscription.variablePricing.upcomingChanges.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upcoming Price Changes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {subscription.variablePricing.upcomingChanges.map((change, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                        >
                          <div>
                            <p className="font-medium">
                              {new Date(change.date).toLocaleDateString()}
                            </p>
                            {change.description && (
                              <p className="text-xs text-muted-foreground">
                                {change.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {formatCurrency(parseFloat(change.cost))}
                            </p>
                            <p
                              className={`text-xs ${
                                parseFloat(change.cost) > subscription.cost
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            >
                              {parseFloat(change.cost) > subscription.cost ? "+" : ""}
                              {formatCurrency(parseFloat(change.cost) - subscription.cost)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      {!isEditing && (
        <div className="border-t p-6">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => onEdit(subscription)}
                variant="outline"
                className="w-full"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              
              {subscription.status === "active" && (
                <Button
                  onClick={() => onCancel(subscription.id)}
                  variant="outline"
                  className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}

              {subscription.status === "cancelled" && (
                <Button
                  onClick={() => onReactivate(subscription.id)}
                  variant="outline"
                  className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Reactivate
                </Button>
              )}

              {subscription.status === "watchlist" && (
                <Button
                  onClick={() => onActivateFromWatchlist(subscription.id)}
                  variant="outline"
                  className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              )}
            </div>

            <Button
              onClick={() => onDelete(subscription.id)}
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Subscription
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
