import { Plus, Edit, Trash2, CreditCard, Star, Sparkles } from "lucide-react";
import { useState } from "react";

import type { PaymentCard } from "../types/subscription";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ManageCardsProps {
  cards: PaymentCard[];
  onAddCard: (card: Omit<PaymentCard, "id" | "dateAdded">) => void;
  onEditCard: (card: PaymentCard) => void;
  onDeleteCard: (id: string) => void;
  onSetDefault: (id: string) => void;
}

interface CardFormData {
  nickname: string;
  lastFour: string;
  type: "credit" | "debit" | "other";
  issuer: string;
  color: string;
  isDefault?: boolean;
}

const cardColors = [
  {
    name: "Ocean Blue",
    value: "#3B82F6",
    bgClass: "bg-blue-500",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    name: "Emerald Green",
    value: "#10B981",
    bgClass: "bg-green-500",
    gradient: "from-green-500 to-green-600",
  },
  {
    name: "Royal Purple",
    value: "#8B5CF6",
    bgClass: "bg-purple-500",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    name: "Crimson Red",
    value: "#EF4444",
    bgClass: "bg-red-500",
    gradient: "from-red-500 to-red-600",
  },
  {
    name: "Sunset Orange",
    value: "#F97316",
    bgClass: "bg-orange-500",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    name: "Rose Pink",
    value: "#EC4899",
    bgClass: "bg-pink-500",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    name: "Indigo Blue",
    value: "#6366F1",
    bgClass: "bg-indigo-500",
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    name: "Slate Gray",
    value: "#6B7280",
    bgClass: "bg-gray-500",
    gradient: "from-gray-500 to-gray-600",
  },
];

const cardIssuers = [
  "Visa",
  "Mastercard",
  "American Express",
  "Discover",
  "Chase",
  "Capital One",
  "Bank of America",
  "Wells Fargo",
  "Citi",
  "Apple Card",
  "Other",
];

export const ManageCards = ({
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onSetDefault,
}: ManageCardsProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);
  const [formData, setFormData] = useState<CardFormData>({
    nickname: "",
    lastFour: "",
    type: "credit",
    issuer: "",
    color: cardColors[0].value,
    isDefault: false,
  });

  // Detect dark mode from document class
  const isDarkMode = document.documentElement.classList.contains("dark");

  // Theme-aware glassmorphic styles
  const glassStyles = {
    backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: isDarkMode ? "1px solid rgba(75, 85, 99, 0.3)" : "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: isDarkMode
      ? "0 8px 32px 0 rgba(0, 0, 0, 0.6)"
      : "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  };

  const glassSecondaryStyles = {
    backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.6)" : "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: isDarkMode ? "1px solid rgba(75, 85, 99, 0.2)" : "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: isDarkMode
      ? "0 4px 16px 0 rgba(0, 0, 0, 0.4)"
      : "0 4px 16px 0 rgba(31, 38, 135, 0.2)",
  };

  const glassAccentStyles = {
    backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: isDarkMode ? "1px solid rgba(75, 85, 99, 0.4)" : "1px solid rgba(255, 255, 255, 0.4)",
    boxShadow: isDarkMode
      ? "0 12px 40px 0 rgba(0, 0, 0, 0.8)"
      : "0 12px 40px 0 rgba(31, 38, 135, 0.37)",
  };

  // Theme-aware text colors
  const textPrimary = isDarkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = isDarkMode ? "text-gray-400" : "text-gray-600";
  const textOnGlass = isDarkMode ? "text-gray-100" : "text-gray-900";

  // Theme-aware button styles
  const buttonGlassStyles = isDarkMode
    ? "bg-gray-700/50 hover:bg-gray-600 text-gray-100"
    : "bg-white/50 hover:bg-white/70 text-gray-900";

  const resetForm = () => {
    setFormData({
      nickname: "",
      lastFour: "",
      type: "credit",
      issuer: "",
      color: cardColors[0].value,
      isDefault: false,
    });
    setEditingCard(null);
  };

  const openAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const mapCardTypeToFormType = (cardType?: string): "credit" | "debit" | "other" => {
    if (cardType === "debit") return "debit";
    if (
      cardType === "visa" ||
      cardType === "mastercard" ||
      cardType === "amex" ||
      cardType === "discover" ||
      cardType === "credit"
    ) {
      return "credit";
    }
    return "other";
  };

  const openEditForm = (card: PaymentCard) => {
    setFormData({
      nickname: card.nickname || "",
      lastFour: card.lastFour || "",
      type: mapCardTypeToFormType(card.type),
      issuer: card.issuer || "",
      color: card.color || cardColors[0].value,
      isDefault: card.isDefault || false,
    });
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nickname.trim() || !formData.lastFour.trim()) {
      return;
    }

    if (editingCard) {
      onEditCard({
        ...editingCard,
        ...formData,
        nickname: formData.nickname.trim(),
        lastFour: formData.lastFour.trim(),
      });
    } else {
      onAddCard({
        ...formData,
        nickname: formData.nickname.trim(),
        lastFour: formData.lastFour.trim(),
        isDefault: formData.isDefault || false,
      });
    }

    closeForm();
  };

  const handleDelete = (card: PaymentCard) => {
    if (
      confirm(`Are you sure you want to delete ${card.nickname}? This action cannot be undone.`)
    ) {
      onDeleteCard(card.id);
    }
  };

  const getCardGradient = (color?: string) => {
    const cardColor = cardColors.find((c) => c.value === color);
    return cardColor ? cardColor.gradient : cardColors[0].gradient;
  };

  const getTypeIcon = () => {
    return <CreditCard className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="rounded-2xl p-6 border border-white/10" style={glassSecondaryStyles}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-semibold ${textPrimary} flex items-center gap-2`}>
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Payment Cards
            </h2>
            <p className={`${textMuted} mt-1`}>
              Manage your payment cards for easy subscription assignment
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openAddForm}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-md border-white/20 rounded-3xl"
              style={glassAccentStyles}
              aria-describedby="card-form-description"
            >
              <DialogHeader>
                <DialogTitle className={textOnGlass}>
                  {editingCard ? "Edit Payment Card" : "Add Payment Card"}
                </DialogTitle>
                <DialogDescription id="card-form-description" className={textMuted}>
                  {editingCard
                    ? "Update your payment card information including nickname, last four digits, and visual preferences."
                    : "Add a new payment card to organize your subscriptions. Only the nickname and last 4 digits are stored for security."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nickname" className={textOnGlass}>
                    Card Nickname
                  </Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="e.g., Chase Sapphire, Business Amex"
                    className={`${
                      isDarkMode
                        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-400"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
                    } backdrop-blur-sm mt-2 rounded-lg`}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastFour" className={textOnGlass}>
                    Last 4 Digits
                  </Label>
                  <Input
                    id="lastFour"
                    value={formData.lastFour}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setFormData({ ...formData, lastFour: value });
                    }}
                    placeholder="1234"
                    maxLength={4}
                    className={`${
                      isDarkMode
                        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-400"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
                    } backdrop-blur-sm mt-2 rounded-lg`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className={textOnGlass}>
                      Card Type
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "credit" | "debit" | "other") =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger
                        className={`${
                          isDarkMode
                            ? "bg-gray-700/50 border-gray-600 text-gray-100"
                            : "bg-white/50 border-gray-200 text-gray-900"
                        } backdrop-blur-sm mt-2 rounded-lg`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className="border-white/20 rounded-3xl"
                        style={glassAccentStyles}
                      >
                        <SelectItem value="credit">Credit Card</SelectItem>
                        <SelectItem value="debit">Debit Card</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="issuer" className={textOnGlass}>
                      Issuer
                    </Label>
                    <Select
                      value={formData.issuer}
                      onValueChange={(value) => setFormData({ ...formData, issuer: value })}
                    >
                      <SelectTrigger
                        className={`${
                          isDarkMode
                            ? "bg-gray-700/50 border-gray-600 text-gray-100"
                            : "bg-white/50 border-gray-200 text-gray-900"
                        } backdrop-blur-sm mt-2 rounded-lg`}
                      >
                        <SelectValue placeholder="Select issuer" />
                      </SelectTrigger>
                      <SelectContent
                        className="border-white/20 rounded-3xl"
                        style={glassAccentStyles}
                      >
                        {cardIssuers.map((issuer) => (
                          <SelectItem key={issuer} value={issuer}>
                            {issuer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="color" className={textOnGlass}>
                    Card Color
                  </Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {cardColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`
                          h-10 rounded-md border-2 transition-all duration-300
                          ${
                            formData.color === color.value
                              ? `border-white ring-2 ${isDarkMode ? "ring-white/50" : "ring-gray-400"}`
                              : `${isDarkMode ? "border-gray-600 hover:border-gray-400" : "border-gray-300 hover:border-gray-500"}`
                          }
                          bg-gradient-to-br ${color.gradient}
                        `}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Default Card Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault || false}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className={`w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 ${
                      isDarkMode
                        ? "bg-gray-700/50 border-gray-600"
                        : "bg-white/50 border-gray-200"
                    }`}
                  />
                  <Label htmlFor="isDefault" className={`${textOnGlass} text-sm`}>
                    Set as default payment card
                  </Label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                    className={`${buttonGlassStyles} border-0 rounded-lg`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none rounded-lg"
                  >
                    {editingCard ? "Update Card" : "Add Card"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Cards List */}
      {cards.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center border border-white/10"
          style={glassSecondaryStyles}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={glassAccentStyles}
          >
            <CreditCard className={`w-8 h-8 ${textMuted}`} />
          </div>
          <p className={`${textSecondary} mb-6 text-lg`}>No payment cards added yet.</p>
          <Button
            onClick={openAddForm}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Card
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 group"
              style={{
                ...glassStyles,
                boxShadow: isDarkMode
                  ? "0 8px 32px 0 rgba(0, 0, 0, 0.6)"
                  : "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = isDarkMode
                  ? "0 16px 40px 0 rgba(0, 0, 0, 0.8)"
                  : "0 16px 40px 0 rgba(31, 38, 135, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = isDarkMode
                  ? "0 8px 32px 0 rgba(0, 0, 0, 0.6)"
                  : "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
              }}
            >
              {/* Enhanced shine effect at top */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: isDarkMode
                    ? "linear-gradient(90deg, transparent 0%, rgba(156, 163, 175, 0.3) 50%, transparent 100%)"
                    : "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)",
                }}
              />

              {/* Card Color Header */}
              <div className={`h-3 bg-gradient-to-r ${getCardGradient(card.color)}`} />

              {/* Enhanced Card Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon()}
                    <span className={`font-semibold ${textPrimary}`}>{card.nickname}</span>
                    {card.isDefault && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${buttonGlassStyles} rounded-lg transition-all duration-300`}
                      onClick={() => openEditForm(card)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${
                        isDarkMode
                          ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300"
                          : "bg-red-100/80 hover:bg-red-200/80 text-red-600 hover:text-red-700"
                      } rounded-lg transition-all duration-300`}
                      onClick={() => handleDelete(card)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`${textSecondary} font-mono tracking-wider`}>
                      ****{card.lastFour}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        isDarkMode
                          ? "bg-gray-700/50 border-gray-600 text-gray-300"
                          : "bg-white/50 border-gray-300 text-gray-700"
                      } backdrop-blur-sm rounded-lg`}
                    >
                      {card.type}
                    </Badge>
                  </div>

                  {card.issuer && <div className={`text-sm ${textMuted}`}>{card.issuer}</div>}

                  <div className="pt-3">
                    {!card.isDefault ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full ${buttonGlassStyles} border-0 rounded-lg`}
                        onClick={() => onSetDefault(card.id)}
                      >
                        Set as Default
                      </Button>
                    ) : (
                      <div className="w-full text-center">
                        <Badge
                          variant="secondary"
                          className={`${
                            isDarkMode
                              ? "bg-yellow-500/20 border-yellow-400/30 text-yellow-300"
                              : "bg-yellow-100/80 border-yellow-300/50 text-yellow-700"
                          } backdrop-blur-sm rounded-lg`}
                        >
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Default Card
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced hover shine effect */}
              <div
                className={`absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                  isDarkMode
                    ? "bg-gradient-to-tr from-transparent via-white/3 to-transparent"
                    : "bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                }`}
              ></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
