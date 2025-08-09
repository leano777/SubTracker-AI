import { Calendar, DollarSign, CreditCard, AlertCircle, Zap } from "lucide-react";
import { useState } from "react";

import type { FullSubscription, PaymentCard } from "../types/subscription";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

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

export const SubscriptionForm = ({
  subscription,
  onSave,
  onCancel,
  isWatchlistMode = false,
  cards,
  onManageCards,
}: SubscriptionFormProps) => {
  const [formData, setFormData] = useState({
    name: subscription?.name || "",
    cost: subscription?.cost || 0,
    billingCycle: subscription?.billingCycle || "monthly",
    nextPayment: subscription?.nextPayment || "",
    category: subscription?.category || "",
    description: subscription?.description || "",
    billingUrl: subscription?.billingUrl || "",
    subscriptionType: (subscription?.subscriptionType as "personal" | "business") || "personal",
    planType: (subscription?.planType as "free" | "paid" | "trial") || "paid",
    priority: (subscription?.priority as "low" | "medium" | "high") || "medium",
    watchlistNotes: subscription?.watchlistNotes || "",
    cardId: subscription?.cardId || "",
    tags: subscription?.tags?.join(", ") || "",
    automationEnabled: subscription?.automationEnabled || false,
    hasLinkedCard: !!subscription?.cardId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subscriptionData: Omit<FullSubscription, "id"> = {
      name: formData.name,
      cost: formData.cost,
      price: formData.cost, // Add price property for compatibility
      frequency: formData.billingCycle === "yearly" ? "yearly" : "monthly",
      billingCycle: formData.billingCycle,
      nextPayment: formData.nextPayment,
      category: formData.category,
      isActive: !isWatchlistMode,
      description: formData.description,
      billingUrl: formData.billingUrl,
      subscriptionType: formData.subscriptionType,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      planType: formData.planType,
      status: isWatchlistMode ? "watchlist" : "active",
      priority: formData.priority,
      dateAdded: subscription?.dateAdded || new Date().toISOString().split("T")[0],
      watchlistNotes: formData.watchlistNotes,
      logoUrl: subscription?.logoUrl || "",
      cardId: formData.cardId || undefined,
      hasLinkedCard: !!formData.cardId,
      automationEnabled: formData.automationEnabled,
    };

    onSave(subscriptionData);
  };

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
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
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
};
