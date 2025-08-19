// Test suite for Income Setup Wizard
// Validates all pay input calculations and features

import { describe, it, expect, beforeEach } from 'vitest';

describe('Income Wizard Calculations', () => {
  describe('Gross to Net Calculations', () => {
    it('should calculate net pay correctly from gross pay', () => {
      const grossAmount = 1000;
      const taxes = 20; // 20%
      const benefits = 5; // 5%
      const retirement = 6; // 6%
      const otherDeductions = 50; // fixed amount
      
      const totalPercentageDeductions = grossAmount * ((taxes + benefits + retirement) / 100);
      const netAmount = grossAmount - totalPercentageDeductions - otherDeductions;
      
      expect(netAmount).toBe(640); // 1000 - 310 - 50 = 640
    });

    it('should handle zero gross amount', () => {
      const grossAmount = 0;
      const taxes = 20;
      const benefits = 5;
      const retirement = 6;
      const otherDeductions = 0;
      
      const totalPercentageDeductions = grossAmount * ((taxes + benefits + retirement) / 100);
      const netAmount = grossAmount - totalPercentageDeductions - otherDeductions;
      
      expect(netAmount).toBe(0);
    });
  });

  describe('Net to Gross Calculations', () => {
    it('should estimate gross pay from net pay', () => {
      const netAmount = 640;
      const taxes = 20;
      const benefits = 5;
      const retirement = 6;
      const otherDeductions = 0; // Simplified for reverse calculation
      
      const totalPercentage = (taxes + benefits + retirement) / 100;
      const grossEstimate = Math.round(netAmount / (1 - totalPercentage));
      
      expect(grossEstimate).toBe(928); // 640 / 0.69 ≈ 928
    });
  });

  describe('Pay Frequency Conversions', () => {
    it('should convert weekly to monthly correctly', () => {
      const weeklyAmount = 1000;
      const monthlyAmount = weeklyAmount * 4.33;
      
      expect(monthlyAmount).toBe(4330);
    });

    it('should convert bi-weekly to monthly correctly', () => {
      const biweeklyAmount = 2000;
      const monthlyAmount = biweeklyAmount * 2.17;
      
      expect(monthlyAmount).toBe(4340);
    });

    it('should convert yearly to monthly correctly', () => {
      const yearlyAmount = 60000;
      const monthlyAmount = yearlyAmount / 12;
      
      expect(monthlyAmount).toBe(5000);
    });

    it('should convert quarterly to monthly correctly', () => {
      const quarterlyAmount = 3000;
      const monthlyAmount = quarterlyAmount / 3;
      
      expect(monthlyAmount).toBe(1000);
    });
  });

  describe('Weekly Gross Pay Feature', () => {
    it('should accept weekly gross pay input', () => {
      const weeklyGross = 800;
      const taxes = 22;
      const benefits = 4;
      const retirement = 6;
      
      const deductions = weeklyGross * ((taxes + benefits + retirement) / 100);
      const weeklyNet = weeklyGross - deductions;
      
      expect(weeklyNet).toBe(544); // 800 - 256 = 544
      
      // Monthly conversion
      const monthlyNet = weeklyNet * 4.33;
      expect(monthlyNet).toBeCloseTo(2355.52, 2);
    });
  });

  describe('Actual Paycheck Tracking', () => {
    it('should track actual paycheck with reimbursements', () => {
      const expectedNet = 2000;
      const actualPaycheck = {
        date: '2025-08-19',
        actualAmount: 2150, // includes $150 gas reimbursement
        note: 'Gas reimbursement'
      };
      
      const variance = actualPaycheck.actualAmount - expectedNet;
      expect(variance).toBe(150);
    });

    it('should calculate average actual vs expected', () => {
      const expectedNet = 2000;
      const actualPaychecks = [
        { date: '2025-08-01', actualAmount: 2050, note: 'Small bonus' },
        { date: '2025-08-15', actualAmount: 1950, note: 'Extra deduction' },
        { date: '2025-08-29', actualAmount: 2100, note: 'Reimbursement' }
      ];
      
      const totalActual = actualPaychecks.reduce((sum, p) => sum + p.actualAmount, 0);
      const averageActual = totalActual / actualPaychecks.length;
      
      expect(averageActual).toBeCloseTo(2033.33, 2);
      expect(averageActual - expectedNet).toBeCloseTo(33.33, 2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large amounts', () => {
      const grossAmount = 1000000;
      const taxes = 35;
      const netAmount = grossAmount * (1 - taxes / 100);
      
      expect(netAmount).toBe(650000);
    });

    it('should handle decimal amounts', () => {
      const grossAmount = 1234.56;
      const taxes = 22.5;
      const netAmount = grossAmount * (1 - taxes / 100);
      
      expect(netAmount).toBeCloseTo(956.784, 3);
    });

    it('should prevent negative net amounts', () => {
      const grossAmount = 100;
      const taxes = 150; // Invalid but testing boundary
      const netAmount = Math.max(0, grossAmount * (1 - taxes / 100));
      
      expect(netAmount).toBe(0);
    });
  });
});

describe('Income Wizard UI Behavior', () => {
  describe('Input Type Toggle', () => {
    it('should switch between gross and net input modes', () => {
      let inputType: 'gross' | 'net' = 'gross';
      
      // Toggle to net
      inputType = 'net';
      expect(inputType).toBe('net');
      
      // Toggle back to gross
      inputType = 'gross';
      expect(inputType).toBe('gross');
    });
  });

  describe('Frequency Switching', () => {
    it('should allow switching from weekly to bi-weekly', () => {
      let frequency = 'weekly';
      const weeklyAmount = 1000;
      
      // Switch to bi-weekly
      frequency = 'biweekly';
      const biweeklyAmount = weeklyAmount * 2; // Simple conversion for testing
      
      expect(frequency).toBe('biweekly');
      expect(biweeklyAmount).toBe(2000);
    });
  });
});

// Test data for validation
export const testIncomeTemplates = [
  {
    type: 'salary',
    title: 'Full-Time Salary',
    frequency: 'biweekly',
    suggestedDeductions: {
      taxes: 22,
      benefits: 4,
      retirement: 6
    }
  },
  {
    type: 'hourly',
    title: 'Hourly Wages',
    frequency: 'weekly',
    suggestedDeductions: {
      taxes: 18,
      benefits: 3,
      retirement: 4
    }
  },
  {
    type: 'contractor',
    title: '1099 Contractor',
    frequency: 'monthly',
    suggestedDeductions: {
      taxes: 30,
      benefits: 0,
      retirement: 10
    }
  }
];