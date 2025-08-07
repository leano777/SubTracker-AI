import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { FullSubscription, PaymentCard } from "../types/subscription";
import { getFaviconUrl } from "../utils/faviconUtils";
import { Plus, Trash2, Calendar, DollarSign, CreditCard, AlertCircle, Zap } from "lucide-react";

interface SubscriptionFormProps {
  subscription?: FullSubscription;
  onSave: (subscription: Omit<FullSubscription, "id">) => void;
  onCancel: () => void;
  isWatchlistMode?: boolean;
  cards: PaymentCard[];
  onManageCards: () => void;
}

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

export function SubscriptionForm({
  subscription,
  onSave,
  onCancel,
  isWatchlistMode = false,
  cards,
  onManageCards,
}: SubscriptionFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    billingCycle: "monthly" as "monthly" | "quarterly" | "yearly" | "variable",
    nextPayment: "",
    category: "",
    description: "",
    billingUrl: "",
    subscriptionType: "personal" as "personal" | "business",
    tags: "",
    planType: "paid" as "free" | "paid",
    priority: "medium" as "low" | "medium" | "high",
    watchlistNotes: "",
    cardId: "",
    hasLinkedCard: false,
    automationEnabled: false, // Always defaults to false
    variablePricing: {
      isVariable: false,
      upcomingChanges: [{ date: "", cost: "", description: "" }],
    },
  });

  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name,
        cost: subscription.cost.toString(),
        billingCycle: subscription.billingCycle,
        nextPayment: subscription.nextPayment,
        category: subscription.category,
        description: subscription.description || "",
        billingUrl: subscription.billingUrl || "",
        subscriptionType: subscription.subscriptionType,
        tags: subscription.tags?.join(", ") || "",
        planType: subscription.planType,
        priority: subscription.priority || "medium",
        watchlistNotes: subscription.watchlistNotes || "",
        cardId: subscription.cardId || "",
        hasLinkedCard: subscription.hasLinkedCard ?? Boolean(subscription.cardId),
        automationEnabled: false, // Always defaults to false as requested
        variablePricing: subscription.variablePricing || {
          isVariable: false,
          upcomingChanges: [{ date: "", cost: "", description: "" }],
        },
      });
      setLogoUrl(subscription.logoUrl || "");
    }
  }, [subscription]);

  useEffect(() => {
    if (formData.billingUrl) {
      const favicon = getFaviconUrl(formData.billingUrl);
      if (favicon) {
        setLogoUrl(favicon);
      }
    }
  }, [formData.billingUrl]);

  // Auto-detect card linking status based on card selection
  useEffect(() => {
    const hasCardSelected = Boolean(formData.cardId && formData.cardId.trim() !== "");
    if (formData.hasLinkedCard !== hasCardSelected) {
      setFormData((prev) => ({
        ...prev,
        hasLinkedCard: hasCardSelected,
      }));
    }
  }, [formData.cardId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subscriptionData: Omit<FullSubscription, "id"> = {
      name: formData.name,
      cost: parseFloat(formData.cost),
      billingCycle: formData.billingCycle,
      nextPayment: formData.nextPayment,
      category: formData.category,
      isActive: !isWatchlistMode,
      description: formData.description,
      billingUrl: formData.billingUrl,
      subscriptionType: formData.subscriptionType,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      planType: formData.planType,
      status: isWatchlistMode ? "watchlist" : "active",
      priority: formData.priority,
      dateAdded: subscription?.dateAdded || new Date().toISOString().split("T")[0],
      watchlistNotes: formData.watchlistNotes,
      logoUrl,
      cardId: formData.cardId || undefined,
      hasLinkedCard: formData.hasLinkedCard,
      automationEnabled: formData.automationEnabled,
      variablePricing:
        formData.billingCycle === "variable"
          ? {
              isVariable: true,
              upcomingChanges: formData.variablePricing.upcomingChanges
                .filter((change) => change.date && change.cost)
                .map((change) => ({
                  date: change.date,
                  cost: parseFloat(change.cost),
                  description: change.description,
                })),
            }
          : undefined,
    };

    onSave(subscriptionData);
  };

  const addVariableChange = () => {
    setFormData((prev) => ({
      ...prev,
      variablePricing: {
        ...prev.variablePricing,
        upcomingChanges: [
          ...prev.variablePricing.upcomingChanges,
          { date: "", cost: "", description: "" },
        ],
      },
    }));
  };

  const removeVariableChange = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variablePricing: {
        ...prev.variablePricing,
        upcomingChanges: prev.variablePricing.upcomingChanges.filter((_, i) => i !== index),
      },
    }));
  };

  const updateVariableChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      variablePricing: {
        ...prev.variablePricing,
        upcomingChanges: prev.variablePricing.upcomingChanges.map((change, i) =>
          i === index ? { ...change, [field]: value } : change
        ),
      },
    }));
  };

  const defaultCard = cards.find((card) => card.isDefault);
  const selectedCard = cards.find((card) => card.id === formData.cardId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Netflix, Spotify"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cost">
            {formData.billingCycle === "variable" ? "Current Cost" : "Cost"}
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="29.99"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="billingCycle">Billing Cycle</Label>
          <Select
            value={formData.billingCycle}
            onValueChange={(value: "monthly" | "quarterly" | "yearly" | "variable") =>
              setFormData({ ...formData, billingCycle: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="variable">Variable Pricing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Variable Pricing Configuration */}
      {formData.billingCycle === "variable" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Upcoming Price Changes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Define when your subscription cost will change. This helps with accurate budget
                  planning.
                </p>
              </div>
            </div>

            {formData.variablePricing.upcomingChanges.map((change, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg">
                <div className="col-span-3">
                  <Label>Change Date</Label>
                  <Input
                    type="date"
                    value={change.date}
                    onChange={(e) => updateVariableChange(index, "date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="col-span-3">
                  <Label>New Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      value={change.cost}
                      onChange={(e) => updateVariableChange(index, "cost", e.target.value)}
                      placeholder="44.25"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="col-span-5">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={change.description}
                    onChange={(e) => updateVariableChange(index, "description", e.target.value)}
                    placeholder="e.g., End of promotional pricing"
                  />
                </div>
                <div className="col-span-1">
                  {formData.variablePricing.upcomingChanges.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariableChange(index)}
                      className="p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addVariableChange} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Price Change
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <Label htmlFor="nextPayment">Next Payment Date</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="nextPayment"
            type="date"
            value={formData.nextPayment}
            onChange={(e) => setFormData({ ...formData, nextPayment: e.target.value })}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* Payment Card Selection */}
      {!isWatchlistMode && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="card">Payment Card</Label>
            <Button type="button" variant="outline" size="sm" onClick={onManageCards}>
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Cards
            </Button>
          </div>

          {cards.length === 0 ? (
            <div className="p-4 border border-dashed rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">No payment cards added yet</p>
              <Button type="button" variant="outline" size="sm" onClick={onManageCards}>
                Add Your First Card
              </Button>
            </div>
          ) : (
            <Select
              value={formData.cardId || undefined}
              onValueChange={(value) => {
                const cardId = value || "";
                setFormData({
                  ...formData,
                  cardId,
                  hasLinkedCard: Boolean(cardId && cardId.trim() !== ""),
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment card (optional)" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: card.color }}
                      ></div>
                      <span>{card.nickname}</span>
                      <span className="text-muted-foreground">••••{card.lastFour}</span>
                      {card.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedCard && (
            <div className="mt-2 p-2 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCard.color }}
                ></div>
                <span>{selectedCard.nickname}</span>
                <span className="text-muted-foreground">••••{selectedCard.lastFour}</span>
                <span className="text-muted-foreground">({selectedCard.issuer})</span>
                {selectedCard.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="billingUrl">Billing/Account URL (Optional)</Label>
        <Input
          id="billingUrl"
          type="url"
          value={formData.billingUrl}
          onChange={(e) => setFormData({ ...formData, billingUrl: e.target.value })}
          placeholder="https://example.com/billing"
        />
        {logoUrl && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
            <img src={logoUrl} alt="Service logo" className="w-4 h-4" />
            <span>Logo detected automatically</span>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the service"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subscriptionType">Type</Label>
          <Select
            value={formData.subscriptionType}
            onValueChange={(value: "personal" | "business") =>
              setFormData({ ...formData, subscriptionType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="planType">Plan</Label>
          <Select
            value={formData.planType}
            onValueChange={(value: "free" | "paid") =>
              setFormData({ ...formData, planType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isWatchlistMode && (
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: "low" | "medium" | "high") =>
              setFormData({ ...formData, priority: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Card Linking and Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Status & Automation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="hasLinkedCard"
              checked={formData.hasLinkedCard}
              disabled={true}
              className="cursor-not-allowed"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="hasLinkedCard"
                className="text-sm font-medium leading-none cursor-not-allowed opacity-70"
              >
                Payment card is linked
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically detected when you select a payment card above
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="automationEnabled"
              checked={formData.automationEnabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, automationEnabled: checked as boolean })
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="automationEnabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center space-x-1"
              >
                <Zap className="w-3 h-3" />
                <span>Automation is enabled</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Check this if you have automatic renewal, notifications, or other automation set up
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p>
                These settings help you track which subscriptions have payment methods and
                automation configured, making it easier to manage your services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="tags">Tags (Optional)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="streaming, entertainment, music"
        />
        <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
      </div>

      {isWatchlistMode && (
        <div>
          <Label htmlFor="watchlistNotes">Notes</Label>
          <Textarea
            id="watchlistNotes"
            value={formData.watchlistNotes}
            onChange={(e) => setFormData({ ...formData, watchlistNotes: e.target.value })}
            placeholder="Why are you considering this subscription? Any specific requirements or concerns?"
            rows={3}
          />
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {subscription ? "Update" : "Add"} {isWatchlistMode ? "to Watchlist" : "Subscription"}
        </Button>
      </div>
    </form>
  );
}
