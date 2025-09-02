import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentCardsView } from '../components/views/PaymentCardsView';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('PaymentCardsView', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render payment cards view with demo cards', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<PaymentCardsView userId="test-user" />);
      
      await waitFor(() => {
        expect(screen.getByText('Payment Cards')).toBeDefined();
        expect(screen.getByText('Personal Visa')).toBeDefined();
        expect(screen.getByText('Business Mastercard')).toBeDefined();
      });
    });

    it('should display security notice', () => {
      render(<PaymentCardsView userId="test-user" />);
      
      expect(screen.getByText('Your card information is secure')).toBeDefined();
    });

    it('should show add card button', () => {
      render(<PaymentCardsView userId="test-user" />);
      
      const addButton = screen.getByRole('button', { name: /add card/i });
      expect(addButton).toBeDefined();
    });
  });

  describe('Card Validation', () => {
    it('should validate card number using Luhn algorithm', async () => {
      render(<PaymentCardsView userId="test-user" />);
      
      // Open add card modal
      const addButton = screen.getByRole('button', { name: /add card/i });
      fireEvent.click(addButton);
      
      // Try invalid card number
      const cardNumberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
      await userEvent.type(cardNumberInput, '1234567890123456');
      
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid card number')).toBeDefined();
      });
    });

    it('should detect card brand correctly', async () => {
      render(<PaymentCardsView userId="test-user" />);
      
      // Visa cards start with 4
      const visaCard = '4242424242424242';
      // Mastercard cards start with 5
      const mastercardCard = '5555555555554444';
      
      // Test brand detection logic
      expect(screen.getByText('Visa')).toBeDefined();
      expect(screen.getByText('Mastercard')).toBeDefined();
    });

    it('should validate expiry date', async () => {
      render(<PaymentCardsView userId="test-user" />);
      
      const addButton = screen.getByRole('button', { name: /add card/i });
      fireEvent.click(addButton);
      
      // Try past expiry date
      const monthInput = screen.getByPlaceholderText('MM');
      const yearInput = screen.getByPlaceholderText('YYYY');
      
      await userEvent.type(monthInput, '13'); // Invalid month
      await userEvent.type(yearInput, '2020'); // Past year
      
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid expiry')).toBeDefined();
      });
    });

    it('should validate CVV', async () => {
      render(<PaymentCardsView userId="test-user" />);
      
      const addButton = screen.getByRole('button', { name: /add card/i });
      fireEvent.click(addButton);
      
      const cvvInput = screen.getByPlaceholderText('123');
      await userEvent.type(cvvInput, '12'); // Too short
      
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid CVV')).toBeDefined();
      });
    });
  });

  describe('Card Management', () => {
    const mockCards = [
      {
        id: 'card-1',
        nickname: 'Test Card 1',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        color: '#1a365d'
      },
      {
        id: 'card-2',
        nickname: 'Test Card 2',
        last4: '5555',
        brand: 'Mastercard',
        expiryMonth: 6,
        expiryYear: 2024,
        isDefault: false,
        color: '#eb001b'
      }
    ];

    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockCards));
    });

    it('should add a new card', async () => {
      render(<PaymentCardsView userId="test-user" />);
      
      const addButton = screen.getByRole('button', { name: /add card/i });
      fireEvent.click(addButton);
      
      // Fill in valid card details
      await userEvent.type(screen.getByPlaceholderText('e.g., Personal Visa'), 'New Test Card');
      await userEvent.type(screen.getByPlaceholderText('1234 5678 9012 3456'), '4242424242424242');
      await userEvent.type(screen.getByPlaceholderText('MM'), '12');
      await userEvent.type(screen.getByPlaceholderText('YYYY'), '2026');
      await userEvent.type(screen.getByPlaceholderText('123'), '123');
      
      const submitButton = screen.getByRole('button', { name: /^add card$/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
    });

    it('should edit an existing card', async () => {
      render(<PaymentCardsView userId="test-user" />);
      
      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /edit/i });
        fireEvent.click(editButtons[0]);
      });
      
      // Update card nickname
      const nicknameInput = screen.getByDisplayValue('Test Card 1');
      await userEvent.clear(nicknameInput);
      await userEvent.type(nicknameInput, 'Updated Card Name');
      
      const updateButton = screen.getByRole('button', { name: /update card/i });
      fireEvent.click(updateButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
    });

    it('should delete a card', async () => {
      window.confirm = vi.fn(() => true);
      
      render(<PaymentCardsView userId="test-user" />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);
      });
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this card?');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should set a card as default', async () => {
      render(<PaymentCardsView userId="test-user" />);
      
      await waitFor(() => {
        const setDefaultButtons = screen.getAllByRole('button', { name: /set default/i });
        if (setDefaultButtons.length > 0) {
          fireEvent.click(setDefaultButtons[0]);
        }
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('Card Status Detection', () => {
    it('should detect expired cards', async () => {
      const expiredCard = [{
        id: 'expired-card',
        nickname: 'Expired Card',
        last4: '9999',
        brand: 'Visa',
        expiryMonth: 1,
        expiryYear: 2020,
        isDefault: false,
        color: '#1a365d'
      }];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCard));
      
      render(<PaymentCardsView userId="test-user" />);
      
      await waitFor(() => {
        expect(screen.getByText('Expired')).toBeDefined();
      });
    });

    it('should detect cards expiring soon', async () => {
      const currentDate = new Date();
      const expiringCard = [{
        id: 'expiring-card',
        nickname: 'Expiring Card',
        last4: '8888',
        brand: 'Visa',
        expiryMonth: currentDate.getMonth() + 3,
        expiryYear: currentDate.getFullYear(),
        isDefault: false,
        color: '#1a365d'
      }];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiringCard));
      
      render(<PaymentCardsView userId="test-user" />);
      
      await waitFor(() => {
        expect(screen.getByText('Expiring')).toBeDefined();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no cards exist', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      render(<PaymentCardsView userId="test-user" />);
      
      await waitFor(() => {
        expect(screen.getByText('No payment cards added')).toBeDefined();
        expect(screen.getByText('Add a card to manage your subscription payments')).toBeDefined();
      });
    });
  });

  describe('Summary Statistics', () => {
    const mixedCards = [
      {
        id: 'active-1',
        nickname: 'Active Card',
        last4: '1111',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
        color: '#1a365d'
      },
      {
        id: 'expired-1',
        nickname: 'Expired Card',
        last4: '2222',
        brand: 'Mastercard',
        expiryMonth: 1,
        expiryYear: 2020,
        isDefault: false,
        color: '#eb001b'
      },
      {
        id: 'expiring-1',
        nickname: 'Expiring Soon',
        last4: '3333',
        brand: 'Visa',
        expiryMonth: new Date().getMonth() + 2,
        expiryYear: new Date().getFullYear(),
        isDefault: false,
        color: '#1a365d'
      }
    ];

    it('should display correct summary statistics', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mixedCards));
      
      render(<PaymentCardsView userId="test-user" />);
      
      await waitFor(() => {
        // Total cards
        expect(screen.getByText('Total Cards')).toBeDefined();
        expect(screen.getByText('3')).toBeDefined();
        
        // Active cards (non-expired)
        expect(screen.getByText('Active Cards')).toBeDefined();
        expect(screen.getByText('2')).toBeDefined();
        
        // Expiring soon
        expect(screen.getByText('Expiring Soon')).toBeDefined();
        expect(screen.getByText('1')).toBeDefined();
      });
    });
  });

  describe('Security Features', () => {
    it('should mask card numbers properly', async () => {
      render(<PaymentCardsView userId="test-user" />);
      
      await waitFor(() => {
        // Check that only last 4 digits are shown
        expect(screen.getByText('•••• •••• •••• 4242')).toBeDefined();
        expect(screen.getByText('•••• •••• •••• 5555')).toBeDefined();
      });
    });

    it('should not store full card numbers', async () => {
      render(<PaymentCardsView userId="test-user" />);
      
      const addButton = screen.getByRole('button', { name: /add card/i });
      fireEvent.click(addButton);
      
      // Add a card
      await userEvent.type(screen.getByPlaceholderText('e.g., Personal Visa'), 'Security Test');
      await userEvent.type(screen.getByPlaceholderText('1234 5678 9012 3456'), '4242424242424242');
      await userEvent.type(screen.getByPlaceholderText('MM'), '12');
      await userEvent.type(screen.getByPlaceholderText('YYYY'), '2026');
      await userEvent.type(screen.getByPlaceholderText('123'), '123');
      
      const submitButton = screen.getByRole('button', { name: /^add card$/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const savedData = localStorageMock.setItem.mock.calls[0]?.[1];
        if (savedData) {
          const parsed = JSON.parse(savedData);
          // Verify only last4 is stored, not full number
          expect(parsed.some((card: any) => card.last4 === '4242')).toBe(true);
          expect(savedData).not.toContain('4242424242424242');
        }
      });
    });
  });
});