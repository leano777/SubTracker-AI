import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { PaymentCard } from "../types/subscription";

interface PaymentCardFormProps {
  card?: PaymentCard;
  onSave: (card: Omit<PaymentCard, "id" | "dateAdded">) => void;
  onCancel: () => void;
}

interface CardFormData {
  nickname: string;
  lastFour: string;
  type: "credit" | "debit" | "other";
  issuer: string;
  color: string;
  isDefault: boolean;
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

export function PaymentCardForm({ card, onSave, onCancel }: PaymentCardFormProps) {
  const [formData, setFormData] = useState<CardFormData>({
    nickname: "",
    lastFour: "",
    type: "credit",
    issuer: "",
    color: cardColors[0].value,
    isDefault: false,
  });

  const [errors, setErrors] = useState<Partial<CardFormData>>({});

  const mapCardTypeToFormType = (cardType?: string): "credit" | "debit" | "other" => {
    if (cardType === "debit") return "debit";
    if (cardType === "visa" || cardType === "mastercard" || cardType === "amex" || cardType === "discover" || cardType === "credit") {
      return "credit";
    }
    return "other";
  };

  // Initialize form data when card prop changes
  useEffect(() => {
    if (card) {
      setFormData({
        nickname: card.nickname || "",
        lastFour: card.lastFour || "",
        type: mapCardTypeToFormType(card.type),
        issuer: card.issuer || "",
        color: card.color || cardColors[0].value,
        isDefault: card.isDefault || false,
      });
    } else {
      setFormData({
        nickname: "",
        lastFour: "",
        type: "credit",
        issuer: "",
        color: cardColors[0].value,
        isDefault: false,
      });
    }
    setErrors({});
  }, [card]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CardFormData> = {};

    if (!formData.nickname.trim()) {
      newErrors.nickname = "Card nickname is required";
    }

    if (!formData.lastFour.trim()) {
      newErrors.lastFour = "Last 4 digits are required";
    } else if (formData.lastFour.length !== 4) {
      newErrors.lastFour = "Must be exactly 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave({
      ...formData,
      nickname: formData.nickname.trim(),
      lastFour: formData.lastFour.trim(),
    });
  };

  const handleLastFourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setFormData({ ...formData, lastFour: value });
    if (errors.lastFour) {
      setErrors({ ...errors, lastFour: undefined });
    }
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, nickname: e.target.value });
    if (errors.nickname) {
      setErrors({ ...errors, nickname: undefined });
    }
  };

  const selectedColor = cardColors.find((c) => c.value === formData.color) || cardColors[0];

  // Glassmorphic styles
  const glassSecondaryStyles = {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.2)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Preview */}
      <div className="rounded-2xl p-6 border border-white/10" style={glassSecondaryStyles}>
        <Label className="text-white/90 mb-3 block">Card Preview</Label>
        <div
          className={`bg-gradient-to-br ${selectedColor.gradient} rounded-2xl p-6 h-40 relative overflow-hidden shadow-lg`}
        >
          {/* Glass overlay effect */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 h-full flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <div className="text-lg font-bold">{formData.nickname || "Card Nickname"}</div>
              <div className="text-xs opacity-80 uppercase tracking-wider">{formData.type}</div>
            </div>
            <div className="space-y-2">
              <div className="text-xl font-mono tracking-wider">
                •••• •••• •••• {formData.lastFour || "••••"}
              </div>
              <div className="text-sm opacity-90">{formData.issuer || "Select Issuer"}</div>
            </div>
          </div>
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50 transform rotate-12 translate-x-[-100%] animate-pulse"></div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="nickname" className="text-white/90">
            Card Nickname *
          </Label>
          <Input
            id="nickname"
            value={formData.nickname}
            onChange={handleNicknameChange}
            placeholder="e.g., Chase Sapphire, Business Amex"
            className={`bg-white/15 backdrop-blur-sm text-white placeholder:text-white/50 border-white/20 focus:border-white/40 mt-2 rounded-lg ${
              errors.nickname ? "border-red-400" : ""
            }`}
          />
          {errors.nickname && <p className="text-sm text-red-400 mt-1">{errors.nickname}</p>}
        </div>

        <div>
          <Label htmlFor="lastFour" className="text-white/90">
            Last 4 Digits *
          </Label>
          <Input
            id="lastFour"
            value={formData.lastFour}
            onChange={handleLastFourChange}
            placeholder="1234"
            maxLength={4}
            className={`bg-white/15 backdrop-blur-sm text-white placeholder:text-white/50 border-white/20 focus:border-white/40 mt-2 rounded-lg ${
              errors.lastFour ? "border-red-400" : ""
            }`}
          />
          {errors.lastFour && <p className="text-sm text-red-400 mt-1">{errors.lastFour}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type" className="text-white/90">
              Card Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: "credit" | "debit" | "other") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="bg-white/15 backdrop-blur-sm text-white border-white/20 focus:border-white/40 mt-2 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-3xl border-white/20" style={glassSecondaryStyles}>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="debit">Debit Card</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="issuer" className="text-white/90">
              Issuer
            </Label>
            <Select
              value={formData.issuer}
              onValueChange={(value) => setFormData({ ...formData, issuer: value })}
            >
              <SelectTrigger className="bg-white/15 backdrop-blur-sm text-white border-white/20 focus:border-white/40 mt-2 rounded-lg">
                <SelectValue placeholder="Select issuer" />
              </SelectTrigger>
              <SelectContent className="rounded-3xl border-white/20" style={glassSecondaryStyles}>
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
          <Label htmlFor="color" className="text-white/90">
            Card Color
          </Label>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {cardColors.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`
                  relative h-12 rounded-xl transition-all duration-300 group
                  ${
                    formData.color === color.value
                      ? "ring-2 ring-white/60 ring-offset-2 ring-offset-transparent scale-105"
                      : "hover:scale-105 hover:ring-1 hover:ring-white/40"
                  }
                  bg-gradient-to-br ${color.gradient}
                `}
                onClick={() => setFormData({ ...formData, color: color.value })}
                title={color.name}
              >
                <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
                {formData.color === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/60 mt-2">Selected: {selectedColor.name}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="bg-white/15 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-lg"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg rounded-lg"
        >
          {card ? "Update Card" : "Add Card"}
        </Button>
      </div>
    </form>
  );
}
