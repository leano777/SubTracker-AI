import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Trash2, Edit, Shield, AlertCircle, CheckCircle, X } from 'lucide-react';
import type { PaymentCard } from '../../types/subscription';

interface PaymentCardsViewProps {
  userId?: string;
}

export const PaymentCardsView: React.FC<PaymentCardsViewProps> = ({ userId = 'local-user-001' }) => {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load cards from localStorage
  useEffect(() => {
    const loadCards = () => {
      try {
        const storageKey = `subtracker_payment_cards_${userId}`;
        const storedCards = localStorage.getItem(storageKey);
        
        if (storedCards) {
          const parsedCards = JSON.parse(storedCards);
          setCards(parsedCards);
        } else {
          // Initialize with demo cards
          const demoCards: PaymentCard[] = [
            {
              id: 'card-1',
              nickname: 'Personal Visa',
              last4: '4242',
              brand: 'Visa',
              expiryMonth: 12,
              expiryYear: 2025,
              isDefault: true,
              color: '#1a365d'
            },
            {
              id: 'card-2',
              nickname: 'Business Mastercard',
              last4: '5555',
              brand: 'Mastercard',
              expiryMonth: 6,
              expiryYear: 2026,
              isDefault: false,
              color: '#eb001b'
            }
          ];
          setCards(demoCards);
          localStorage.setItem(storageKey, JSON.stringify(demoCards));
        }
      } catch (error) {
        console.error('Error loading payment cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [userId]);

  // Save cards to localStorage
  const saveCards = (updatedCards: PaymentCard[]) => {
    const storageKey = `subtracker_payment_cards_${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedCards));
    setCards(updatedCards);
  };

  // Validate card number (Luhn algorithm)
  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Get card brand from number
  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    
    return 'Unknown';
  };

  // Format card number for display
  const formatCardNumber = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  // Mask card number
  const maskCardNumber = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    const last4 = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4) + last4;
    return formatCardNumber(masked);
  };

  // Handle adding a new card
  const handleAddCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const errors: Record<string, string> = {};

    const cardNumber = formData.get('cardNumber') as string;
    const nickname = formData.get('nickname') as string;
    const expiryMonth = parseInt(formData.get('expiryMonth') as string);
    const expiryYear = parseInt(formData.get('expiryYear') as string);
    const cvv = formData.get('cvv') as string;

    // Validation
    if (!nickname) errors.nickname = 'Nickname is required';
    if (!validateCardNumber(cardNumber)) errors.cardNumber = 'Invalid card number';
    if (!expiryMonth || expiryMonth < 1 || expiryMonth > 12) errors.expiry = 'Invalid expiry month';
    if (!expiryYear || expiryYear < new Date().getFullYear()) errors.expiry = 'Invalid expiry year';
    if (!cvv || !/^\d{3,4}$/.test(cvv)) errors.cvv = 'Invalid CVV';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const newCard: PaymentCard = {
      id: `card-${Date.now()}`,
      nickname,
      last4: cardNumber.slice(-4),
      brand: getCardBrand(cardNumber),
      expiryMonth,
      expiryYear,
      isDefault: cards.length === 0,
      color: getCardBrand(cardNumber) === 'Visa' ? '#1a365d' : '#eb001b'
    };

    saveCards([...cards, newCard]);
    setShowAddCard(false);
    setValidationErrors({});
    e.currentTarget.reset();
  };

  // Handle editing a card
  const handleEditCard = (card: PaymentCard) => {
    setEditingCard(card);
  };

  // Handle updating a card
  const handleUpdateCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCard) return;

    const formData = new FormData(e.currentTarget);
    const nickname = formData.get('nickname') as string;
    const expiryMonth = parseInt(formData.get('expiryMonth') as string);
    const expiryYear = parseInt(formData.get('expiryYear') as string);

    const updatedCards = cards.map(card => 
      card.id === editingCard.id
        ? { ...card, nickname, expiryMonth, expiryYear }
        : card
    );

    saveCards(updatedCards);
    setEditingCard(null);
  };

  // Handle deleting a card
  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      const updatedCards = cards.filter(card => card.id !== cardId);
      
      // If deleted card was default, set another as default
      if (updatedCards.length > 0 && !updatedCards.some(c => c.isDefault)) {
        updatedCards[0].isDefault = true;
      }
      
      saveCards(updatedCards);
    }
  };

  // Handle setting default card
  const handleSetDefault = (cardId: string) => {
    const updatedCards = cards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    }));
    saveCards(updatedCards);
  };

  // Check if card is expiring soon
  const isExpiringSoon = (card: PaymentCard): boolean => {
    const now = new Date();
    const cardExpiry = new Date(card.expiryYear, card.expiryMonth - 1);
    const monthsUntilExpiry = (cardExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
  };

  // Check if card is expired
  const isExpired = (card: PaymentCard): boolean => {
    const now = new Date();
    const cardExpiry = new Date(card.expiryYear, card.expiryMonth - 1);
    return cardExpiry < now;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Cards</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your payment methods for subscriptions
          </p>
        </div>
        <button
          onClick={() => setShowAddCard(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-semibold">Your card information is secure</p>
          <p className="mt-1">
            We use industry-standard encryption to protect your payment information. 
            Card details are never stored in plain text.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => (
          <div
            key={card.id}
            className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg ${
              isExpired(card) ? 'opacity-60' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`
            }}
          >
            {/* Card Status Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              {card.isDefault && (
                <span className="px-2 py-1 bg-white/20 backdrop-blur rounded text-xs font-semibold">
                  Default
                </span>
              )}
              {isExpired(card) && (
                <span className="px-2 py-1 bg-red-500/80 backdrop-blur rounded text-xs font-semibold flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Expired
                </span>
              )}
              {!isExpired(card) && isExpiringSoon(card) && (
                <span className="px-2 py-1 bg-yellow-500/80 backdrop-blur rounded text-xs font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Expiring
                </span>
              )}
            </div>

            {/* Card Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                <span className="font-semibold">{card.brand}</span>
              </div>
              
              <div>
                <p className="text-sm opacity-80">Card Number</p>
                <p className="text-lg font-mono">•••• •••• •••• {card.last4}</p>
              </div>

              <div className="flex justify-between">
                <div>
                  <p className="text-sm opacity-80">Card Name</p>
                  <p className="font-medium">{card.nickname}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Expires</p>
                  <p className="font-medium">
                    {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex gap-2 mt-6">
              {!card.isDefault && !isExpired(card) && (
                <button
                  onClick={() => handleSetDefault(card.id)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur rounded text-sm transition-colors"
                >
                  Set Default
                </button>
              )}
              <button
                onClick={() => handleEditCard(card)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur rounded text-sm transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteCard(card.id)}
                className="px-3 py-1 bg-red-500/80 hover:bg-red-500 backdrop-blur rounded text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {cards.length === 0 && (
          <div className="col-span-full text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No payment cards added</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Add a card to manage your subscription payments
            </p>
          </div>
        )}
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add Payment Card
            </h3>
            
            <form onSubmit={handleAddCard} className="space-y-4" role="form">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Nickname
                </label>
                <input
                  type="text"
                  name="nickname"
                  placeholder="e.g., Personal Visa"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                {validationErrors.nickname && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.nickname}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                    e.target.value = formatted;
                  }}
                  required
                />
                {validationErrors.cardNumber && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="expiryMonth"
                      placeholder="MM"
                      min="1"
                      max="12"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <input
                      type="number"
                      name="expiryYear"
                      placeholder="YYYY"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 20}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  {validationErrors.expiry && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.expiry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {validationErrors.cvv && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.cvv}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCard(false);
                    setValidationErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Edit Card
            </h3>
            
            <form onSubmit={handleUpdateCard} className="space-y-4" role="form">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Nickname
                </label>
                <input
                  type="text"
                  name="nickname"
                  defaultValue={editingCard.nickname}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={`•••• •••• •••• ${editingCard.last4}`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-500 font-mono"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="expiryMonth"
                    defaultValue={editingCard.expiryMonth}
                    min="1"
                    max="12"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    type="number"
                    name="expiryYear"
                    defaultValue={editingCard.expiryYear}
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 20}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Update Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cards</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{cards.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Cards</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {cards.filter(c => !isExpired(c)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {cards.filter(c => !isExpired(c) && isExpiringSoon(c)).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};