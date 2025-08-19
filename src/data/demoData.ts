import type { FullSubscription, FullPaymentCard, WeeklyBudget } from '../types/subscription';
import type { AppNotification } from '../types/constants';
import type { 
  Investment, 
  Bill, 
  FinancialGoal, 
  NotebookEntry, 
  BudgetPod,
  IncomeSource,
  PaycheckAllocation,
  PayCycleSummary
} from '../types/financial';

// Helper to generate dates
const addDays = (date: Date, days: number): string => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
};

const today = new Date();

// Demo Payment Cards
export const demoPaymentCards: FullPaymentCard[] = [
  {
    id: 'card-1',
    name: 'Chase Sapphire',
    lastFour: '4242',
    type: 'visa',
    isDefault: true,
    dateAdded: '2024-01-01',
    color: '#003d82',
  },
  {
    id: 'card-2',
    name: 'Apple Card',
    lastFour: '8888',
    type: 'mastercard',
    isDefault: false,
    dateAdded: '2024-02-15',
    color: '#f5f5f7',
  },
  {
    id: 'card-3',
    name: 'Capital One',
    lastFour: '1234',
    type: 'visa',
    isDefault: false,
    dateAdded: '2024-03-10',
    color: '#d03027',
  },
];

// Demo Active Subscriptions
export const demoSubscriptions: FullSubscription[] = [
  {
    id: 'sub-1',
    name: 'Netflix',
    price: 15.99,
    cost: 15.99,
    frequency: 'monthly',
    billingCycle: 'monthly',
    nextPayment: addDays(today, 3),
    category: 'entertainment',
    status: 'active',
    isActive: true,
    subscriptionType: 'personal',
    website: 'https://netflix.com',
    favicon: 'https://www.google.com/s2/favicons?domain=netflix.com',
    dateAdded: '2023-01-15',
    paymentCardId: 'card-1',
    notes: 'Family plan - sharing with 4 people',
    tags: ['Essential', 'Family', 'Shared'],
  },
  {
    id: 'sub-2',
    name: 'Spotify Premium',
    price: 9.99,
    cost: 9.99,
    frequency: 'monthly',
    billingCycle: 'monthly',
    nextPayment: addDays(today, 7),
    category: 'entertainment',
    status: 'active',
    isActive: true,
    subscriptionType: 'personal',
    website: 'https://spotify.com',
    favicon: 'https://www.google.com/s2/favicons?domain=spotify.com',
    dateAdded: '2023-02-20',
    paymentCardId: 'card-2',
    notes: 'Individual plan',
    tags: ['Personal'],
  },
  {
    id: 'sub-3',
    name: 'Adobe Creative Cloud',
    price: 54.99,
    cost: 54.99,
    frequency: 'monthly',
    billingCycle: 'monthly',
    nextPayment: addDays(today, 1),
    category: 'productivity',
    status: 'active',
    isActive: true,
    subscriptionType: 'business',
    website: 'https://adobe.com',
    favicon: 'https://www.google.com/s2/favicons?domain=adobe.com',
    dateAdded: '2023-03-10',
    paymentCardId: 'card-3',
    businessExpense: true,
    taxDeductible: true,
    notes: 'All Apps plan for design work',
    tags: ['Essential', 'Work'],
  },
  {
    id: 'sub-4',
    name: 'Microsoft 365',
    price: 99.99,
    cost: 99.99,
    frequency: 'yearly',
    billingCycle: 'yearly',
    nextPayment: addDays(today, 45),
    category: 'productivity',
    status: 'active',
    isActive: true,
    subscriptionType: 'business',
    website: 'https://microsoft.com',
    favicon: 'https://www.google.com/s2/favicons?domain=microsoft.com',
    dateAdded: '2023-04-01',
    paymentCardId: 'card-3',
    businessExpense: true,
    taxDeductible: true,
    notes: 'Business plan with 1TB OneDrive',
    tags: ['Essential', 'Work'],
  },
  {
    id: 'sub-5',
    name: 'ChatGPT Plus',
    price: 20.00,
    cost: 20.00,
    frequency: 'monthly',
    billingCycle: 'monthly',
    nextPayment: addDays(today, 0), // Due today!
    category: 'ai_tools',
    status: 'active',
    isActive: true,
    subscriptionType: 'business',
    website: 'https://openai.com',
    favicon: 'https://www.google.com/s2/favicons?domain=openai.com',
    dateAdded: '2023-11-01',
    paymentCardId: 'card-1',
    businessExpense: true,
    notes: 'GPT-4 access for development',
    tags: ['Work', 'Essential'],
  },
  {
    id: 'sub-6',
    name: 'Amazon Prime',
    price: 139.00,
    cost: 139.00,
    frequency: 'yearly',
    billingCycle: 'yearly',
    nextPayment: addDays(today, 180),
    category: 'shopping',
    status: 'active',
    isActive: true,
    subscriptionType: 'personal',
    website: 'https://amazon.com',
    favicon: 'https://www.google.com/s2/favicons?domain=amazon.com',
    dateAdded: '2023-06-01',
    paymentCardId: 'card-2',
    notes: 'Includes Prime Video and free shipping',
    tags: ['Family', 'Shared'],
  },
  {
    id: 'sub-7',
    name: 'Gym Membership',
    price: 49.99,
    cost: 49.99,
    frequency: 'monthly',
    billingCycle: 'monthly',
    nextPayment: addDays(today, 10),
    category: 'health',
    status: 'active',
    isActive: true,
    subscriptionType: 'personal',
    website: '',
    dateAdded: '2023-01-01',
    paymentCardId: 'card-1',
    notes: 'LA Fitness - includes pool and classes',
    tags: ['Personal', 'Health'],
  },
  {
    id: 'sub-8',
    name: 'iCloud+',
    price: 9.99,
    cost: 9.99,
    frequency: 'monthly',
    billingCycle: 'monthly',
    nextPayment: addDays(today, 5),
    category: 'storage',
    status: 'active',
    isActive: true,
    subscriptionType: 'personal',
    website: 'https://apple.com',
    favicon: 'https://www.google.com/s2/favicons?domain=apple.com',
    dateAdded: '2023-07-15',
    paymentCardId: 'card-2',
    notes: '2TB storage plan',
    tags: ['Essential', 'Family'],
  },
];

// Demo Watchlist Items
export const demoWatchlistItems: FullSubscription[] = [
  {
    id: 'watch-1',
    name: 'Notion',
    price: 10.00,
    cost: 10.00,
    frequency: 'monthly',
    billingCycle: 'monthly',
    nextPayment: '',
    category: 'productivity',
    status: 'watchlist',
    isActive: false,
    subscriptionType: 'business',
    website: 'https://notion.so',
    favicon: 'https://www.google.com/s2/favicons?domain=notion.so',
    dateAdded: addDays(today, -10),
    priority: 'high',
    watchlistNotes: 'Could replace current note-taking system. Team collaboration features look great. Need to evaluate API capabilities.',
    notes: 'Considering for team workspace',
    tags: ['Evaluation', 'Work'],
  },
  {
    id: 'watch-2',
    name: 'MasterClass',
    price: 180.00,
    cost: 180.00,
    frequency: 'yearly',
    billingCycle: 'yearly',
    nextPayment: '',
    category: 'education',
    status: 'watchlist',
    isActive: false,
    subscriptionType: 'personal',
    website: 'https://masterclass.com',
    favicon: 'https://www.google.com/s2/favicons?domain=masterclass.com',
    dateAdded: addDays(today, -5),
    priority: 'low',
    watchlistNotes: 'Interesting courses on business and creativity. Wait for Black Friday deal?',
    notes: 'Learning platform',
    tags: ['Personal', 'Education'],
  },
  {
    id: 'watch-3',
    name: 'Grammarly Premium',
    price: 12.00,
    cost: 12.00,
    frequency: 'monthly',
    billingCycle: 'monthly',
    nextPayment: '',
    category: 'productivity',
    status: 'watchlist',
    isActive: false,
    subscriptionType: 'business',
    website: 'https://grammarly.com',
    favicon: 'https://www.google.com/s2/favicons?domain=grammarly.com',
    dateAdded: addDays(today, -3),
    priority: 'medium',
    watchlistNotes: 'Would help with business writing. Free version is limited. Check if tax deductible.',
    notes: 'Writing assistant',
    tags: ['Work', 'Evaluation'],
  },
  {
    id: 'watch-4',
    name: 'Calm',
    price: 69.99,
    cost: 69.99,
    frequency: 'yearly',
    billingCycle: 'yearly',
    nextPayment: '',
    category: 'health',
    status: 'watchlist',
    isActive: false,
    subscriptionType: 'personal',
    website: 'https://calm.com',
    favicon: 'https://www.google.com/s2/favicons?domain=calm.com',
    dateAdded: addDays(today, -7),
    priority: 'medium',
    watchlistNotes: 'Meditation and sleep stories. Could help with stress management. Try free trial first.',
    notes: 'Meditation app',
    tags: ['Personal', 'Health'],
  },
];

// Demo Bills
export const demoBills: Bill[] = [
  {
    id: 'bill-1',
    name: 'Internet - Spectrum',
    price: 79.99,
    cost: 79.99,
    frequency: 'monthly',
    billingCycle: 'monthly',
    billType: 'utility',
    nextPayment: addDays(today, 8),
    category: 'utilities',
    status: 'active',
    isActive: true,
    autopay: true,
    provider: 'Spectrum',
    dateAdded: '2023-01-01',
    dueDay: 15,
    accountNumber: '****4567',
  },
  {
    id: 'bill-2',
    name: 'Electric - ConEd',
    price: 120.00,
    cost: 120.00,
    frequency: 'monthly',
    billingCycle: 'monthly',
    billType: 'utility',
    nextPayment: addDays(today, 12),
    category: 'utilities',
    status: 'active',
    isActive: true,
    autopay: true,
    provider: 'ConEd',
    dateAdded: '2023-01-01',
    dueDay: 20,
    averagePayment: 115.00,
  },
];

// Demo Investments
export const demoInvestments: Investment[] = [
  {
    id: 'inv-1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    quantity: 50,
    purchasePrice: 150.00,
    purchaseDate: '2023-06-15',
    currentPrice: 195.00,
    lastUpdated: today.toISOString(),
    platform: 'robinhood',
    category: 'growth',
    sector: 'Technology',
    conviction: 'high',
    riskLevel: 'medium',
    notes: 'Long-term hold. Strong ecosystem and services growth.',
  },
  {
    id: 'inv-2',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    quantity: 0.5,
    purchasePrice: 30000.00,
    purchaseDate: '2023-01-01',
    currentPrice: 43000.00,
    lastUpdated: today.toISOString(),
    platform: 'coinbase',
    category: 'speculative',
    conviction: 'medium',
    riskLevel: 'very_high',
    notes: 'Digital gold thesis. DCA strategy.',
  },
  {
    id: 'inv-3',
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    type: 'etf',
    quantity: 25,
    purchasePrice: 380.00,
    purchaseDate: '2023-03-01',
    currentPrice: 440.00,
    lastUpdated: today.toISOString(),
    platform: 'vanguard',
    category: 'defensive',
    conviction: 'very_high',
    riskLevel: 'low',
    notes: 'Core portfolio holding. Monthly contributions.',
  },
];

// Demo Financial Goals
export const demoFinancialGoals: FinancialGoal[] = [
  {
    id: 'goal-1',
    title: 'Emergency Fund',
    description: 'Build 6 months of expenses',
    category: 'emergency',
    targetAmount: 30000,
    currentAmount: 18500,
    deadline: addDays(today, 365),
    priority: 'critical',
    status: 'in_progress',
    createdDate: '2023-01-01',
    monthlyContribution: 1000,
    autoContribute: true,
  },
  {
    id: 'goal-2',
    title: 'New Car Down Payment',
    description: 'Save for Tesla Model 3 down payment',
    category: 'purchase',
    targetAmount: 10000,
    currentAmount: 3500,
    deadline: addDays(today, 180),
    priority: 'medium',
    status: 'in_progress',
    createdDate: '2023-10-01',
    monthlyContribution: 500,
    autoContribute: true,
  },
];

// Demo Notifications
export const demoNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'warning',
    title: 'Payment Due Today',
    message: 'ChatGPT Plus payment of $20.00 is due today',
    timestamp: today.toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'info',
    title: 'Upcoming Payment',
    message: 'Adobe Creative Cloud payment of $54.99 due tomorrow',
    timestamp: today.toISOString(),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'success',
    title: 'Savings Opportunity',
    message: 'Switch Microsoft 365 to annual billing and save $20/year',
    timestamp: addDays(today, -1),
    read: false,
  },
];

// Demo Notebook Entries
export const demoNotebookEntries: NotebookEntry[] = [
  {
    id: 'note-1',
    title: 'Q1 2024 Investment Strategy',
    content: `# Investment Focus for Q1 2024

## Key Themes
- AI/ML companies showing real revenue
- Defensive dividend stocks for stability
- Continue DCA into index funds

## Watchlist
1. NVDA - AI chip leader
2. MSFT - Azure growth + AI integration
3. JNJ - Defensive healthcare play

## Action Items
- [ ] Rebalance portfolio (currently 70/30 stocks/bonds)
- [ ] Research emerging AI companies
- [ ] Set up automatic monthly investments`,
    type: 'strategy',
    tags: ['investing', 'quarterly-review'],
    createdDate: addDays(today, -15),
    lastModified: addDays(today, -2),
    isPinned: true,
    isArchived: false,
  },
  {
    id: 'note-2',
    title: 'Subscription Audit Results',
    content: `# Monthly Subscription Audit

## Findings
- Total monthly spend: $285.45
- Unused services: 3 (Coursera, Skillshare, Duolingo)
- Potential savings: $45/month

## Recommendations
1. Cancel unused educational subscriptions
2. Downgrade Dropbox (using only 20% of storage)
3. Switch to annual billing for frequently used services

## Next Steps
- Set calendar reminders for annual renewals
- Negotiate better rates for internet/phone`,
    type: 'review',
    tags: ['subscriptions', 'cost-optimization'],
    createdDate: addDays(today, -7),
    lastModified: addDays(today, -7),
    isPinned: false,
    isArchived: false,
  },
];

// Helper function to populate demo data
// Demo Budget Pods
export const demoBudgetPods: BudgetPod[] = [
  {
    id: 'pod-1',
    name: 'Vehicle Fund',
    type: 'vehicle',
    description: 'Car maintenance, insurance, and fuel',
    monthlyAmount: 400,
    currentAmount: 285.50,
    targetAmount: 2000, // Emergency vehicle fund
    isActive: true,
    autoTransfer: true,
    transferDay: 15,
    linkedSubscriptions: [],
    linkedBills: ['bill-2'], // Car insurance
    linkedGoals: [],
    createdDate: addDays(today, -90),
    lastModified: addDays(today, -5),
    contributions: [
      {
        date: addDays(today, -30),
        amount: 400,
        note: 'Monthly auto-transfer',
      },
      {
        date: addDays(today, -15),
        amount: 50,
        note: 'Extra for upcoming maintenance',
      },
    ],
    withdrawals: [
      {
        date: addDays(today, -10),
        amount: 164.50,
        reason: 'Oil change and tire rotation',
      },
    ],
    color: '#3b82f6',
    icon: '🚗',
    priority: 4,
    rolloverUnused: true,
    warningThreshold: 100,
    notes: 'Keep $2000 target for major repairs. Regular maintenance comes from monthly allocation.',
  },
  {
    id: 'pod-2',
    name: 'Rent & Housing',
    type: 'rent',
    description: 'Rent, utilities, and housing expenses',
    monthlyAmount: 1200,
    currentAmount: 1200,
    isActive: true,
    autoTransfer: true,
    transferDay: 1,
    linkedSubscriptions: [],
    linkedBills: ['bill-1'], // Rent
    linkedGoals: [],
    createdDate: addDays(today, -120),
    lastModified: addDays(today, -1),
    contributions: [
      {
        date: addDays(today, -1),
        amount: 1200,
        note: 'Monthly rent allocation',
      },
    ],
    withdrawals: [],
    color: '#10b981',
    icon: '🏠',
    priority: 5,
    rolloverUnused: false,
    warningThreshold: 1000,
    notes: 'Fixed amount for rent. Any extra goes to emergency fund.',
  },
  {
    id: 'pod-3',
    name: 'Food & Groceries',
    type: 'food',
    description: 'Groceries, dining out, and food delivery',
    monthlyAmount: 450,
    currentAmount: 168.75,
    isActive: true,
    autoTransfer: true,
    transferDay: 15,
    linkedSubscriptions: [],
    linkedBills: [],
    linkedGoals: [],
    createdDate: addDays(today, -60),
    lastModified: addDays(today, -2),
    contributions: [
      {
        date: addDays(today, -15),
        amount: 450,
        note: 'Monthly food budget',
      },
    ],
    withdrawals: [
      {
        date: addDays(today, -12),
        amount: 125.50,
        reason: 'Weekly grocery shopping',
      },
      {
        date: addDays(today, -8),
        amount: 35.75,
        reason: 'Lunch meeting',
      },
      {
        date: addDays(today, -5),
        amount: 120,
        reason: 'Weekly grocery shopping',
      },
    ],
    color: '#f59e0b',
    icon: '🍕',
    priority: 3,
    rolloverUnused: true,
    warningThreshold: 100,
    notes: 'Track weekly grocery trips. Dining out should be limited to special occasions.',
  },
  {
    id: 'pod-4',
    name: 'Subscriptions',
    type: 'subscriptions',
    description: 'All digital subscriptions and services',
    monthlyAmount: 300,
    currentAmount: 125.45,
    isActive: true,
    autoTransfer: true,
    transferDay: 1,
    linkedSubscriptions: ['sub-1', 'sub-2', 'sub-3', 'sub-4'], // Netflix, Spotify, etc.
    linkedBills: [],
    linkedGoals: [],
    createdDate: addDays(today, -45),
    lastModified: addDays(today, -3),
    contributions: [
      {
        date: addDays(today, -1),
        amount: 300,
        note: 'Monthly subscription budget',
      },
    ],
    withdrawals: [
      {
        date: addDays(today, -28),
        amount: 15.99,
        reason: 'Netflix subscription',
        linkedItem: 'sub-1',
      },
      {
        date: addDays(today, -25),
        amount: 9.99,
        reason: 'Spotify Premium',
        linkedItem: 'sub-2',
      },
      {
        date: addDays(today, -20),
        amount: 54.99,
        reason: 'Adobe Creative Suite',
        linkedItem: 'sub-3',
      },
      {
        date: addDays(today, -15),
        amount: 20,
        reason: 'ChatGPT Plus',
        linkedItem: 'sub-5',
      },
    ],
    color: '#8b5cf6',
    icon: '💳',
    priority: 2,
    rolloverUnused: true,
    warningThreshold: 50,
    notes: 'Monitor subscription creep. Cancel unused services quarterly.',
  },
  {
    id: 'pod-5',
    name: 'Emergency Fund',
    type: 'emergency',
    description: 'Emergency savings for unexpected expenses',
    monthlyAmount: 200,
    currentAmount: 1250,
    targetAmount: 3000,
    isActive: true,
    autoTransfer: true,
    transferDay: 1,
    linkedSubscriptions: [],
    linkedBills: [],
    linkedGoals: ['goal-1'], // Emergency fund goal
    createdDate: addDays(today, -180),
    lastModified: addDays(today, -1),
    contributions: [
      {
        date: addDays(today, -1),
        amount: 200,
        note: 'Monthly emergency fund contribution',
      },
      {
        date: addDays(today, -30),
        amount: 200,
        note: 'Monthly emergency fund contribution',
      },
      {
        date: addDays(today, -45),
        amount: 150,
        note: 'Extra from budget surplus',
      },
    ],
    withdrawals: [],
    color: '#ef4444',
    icon: '🛡️',
    priority: 5,
    rolloverUnused: true,
    warningThreshold: 500,
    notes: 'Target is 3 months of expenses. Only use for true emergencies.',
  },
];

// Demo Income Sources for weekly paycheck scenario
export const demoIncomeSources: IncomeSource[] = [
  {
    id: 'income-1',
    name: 'Elite SD Construction - Salary',
    type: 'salary',
    frequency: 'weekly',
    grossAmount: 1250.00, // $5000/month weekly
    netAmount: 875.00,     // ~70% after taxes/deductions
    taxes: 275.00,
    benefits: 75.00,
    retirement: 25.00,
    payDates: [
      addDays(today, 3),   // This Thursday
      addDays(today, 10),  // Next Thursday
      addDays(today, 17),  // Following Thursday
      addDays(today, 24),  // Week after
    ],
    isActive: true,
    employer: 'Elite SD Construction',
    notes: 'Weekly payroll every Thursday. Direct deposit.',
    createdDate: '2024-01-01T00:00:00.000Z',
    lastModified: new Date().toISOString(),
  },
  {
    id: 'income-2',
    name: 'Freelance Consulting',
    type: 'freelance',
    frequency: 'irregular',
    grossAmount: 800.00,  // Variable monthly
    netAmount: 720.00,    // Less taxes since self-employed
    taxes: 80.00,
    payDates: [
      addDays(today, 15),  // Mid-month payment
    ],
    isActive: true,
    employer: 'Various Clients',
    notes: 'Construction consulting projects. Payment varies by project.',
    createdDate: '2024-03-01T00:00:00.000Z',
    lastModified: new Date().toISOString(),
  },
];

// Demo Paycheck Allocations - showing how Marco maps his weekly paycheck to pods
export const demoPaycheckAllocations: PaycheckAllocation[] = [
  {
    id: 'allocation-1',
    incomeSourceId: 'income-1',
    payDate: addDays(today, 3), // This Thursday
    grossAmount: 1250.00,
    netAmount: 875.00,
    podAllocations: [
      { podId: 'pod-2', amount: 300.00, percentage: 34.3 }, // Rent & Housing (priority 1)
      { podId: 'pod-1', amount: 100.00, percentage: 11.4 }, // Vehicle Fund
      { podId: 'pod-3', amount: 125.00, percentage: 14.3 }, // Food & Groceries
      { podId: 'pod-4', amount: 37.50, percentage: 4.3 },   // Subscriptions
      { podId: 'pod-5', amount: 75.00, percentage: 8.6 },   // Emergency Fund
      { podId: 'pod-6', amount: 50.00, percentage: 5.7 },   // Entertainment
    ],
    fixedExpenses: [
      { name: 'Rent', amount: 300.00, category: 'rent' },
      { name: 'Car Insurance', amount: 45.00, category: 'insurance' },
    ],
    remainingAmount: 187.50, // After pod allocations and fixed expenses
    isPlanned: true,
    isProcessed: false,
    notes: 'Standard weekly allocation. Prioritizing rent and vehicle fund.',
  },
  {
    id: 'allocation-2',
    incomeSourceId: 'income-1',
    payDate: addDays(today, 10), // Next Thursday
    grossAmount: 1250.00,
    netAmount: 875.00,
    podAllocations: [
      { podId: 'pod-2', amount: 300.00, percentage: 34.3 }, // Rent & Housing
      { podId: 'pod-1', amount: 100.00, percentage: 11.4 }, // Vehicle Fund
      { podId: 'pod-3', amount: 125.00, percentage: 14.3 }, // Food & Groceries
      { podId: 'pod-4', amount: 37.50, percentage: 4.3 },   // Subscriptions
      { podId: 'pod-5', amount: 75.00, percentage: 8.6 },   // Emergency Fund
      { podId: 'pod-6', amount: 50.00, percentage: 5.7 },   // Entertainment
    ],
    fixedExpenses: [
      { name: 'Phone Bill', amount: 65.00, category: 'utilities' },
      { name: 'Internet', amount: 80.00, category: 'utilities' },
    ],
    remainingAmount: 142.50, // After pod allocations and fixed expenses
    isPlanned: true,
    isProcessed: false,
    notes: 'Utilities week. Adjusted remaining after phone and internet.',
  },
];

// Demo Pay Cycle Summary - Monthly view with weekly breakdown
export const demoPayCycleSummary: PayCycleSummary = {
  period: 'monthly',
  startDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0],
  totalIncome: 4220.00,    // 4 weeks * $875 + freelance
  totalAllocated: 2755.00, // Total allocated to pods
  totalFixedExpenses: 490.00,
  totalRemaining: 975.00,
  paychecks: demoPaycheckAllocations,
  podFunding: [
    {
      podId: 'pod-1',
      targetAmount: 400.00,
      allocatedAmount: 400.00, // Fully funded
      remainingNeeded: 0,
      isFunded: true,
    },
    {
      podId: 'pod-2',
      targetAmount: 1200.00,
      allocatedAmount: 1200.00, // Fully funded
      remainingNeeded: 0,
      isFunded: true,
    },
    {
      podId: 'pod-3',
      targetAmount: 500.00,
      allocatedAmount: 500.00, // Fully funded
      remainingNeeded: 0,
      isFunded: true,
    },
    {
      podId: 'pod-4',
      targetAmount: 150.00,
      allocatedAmount: 150.00, // Fully funded
      remainingNeeded: 0,
      isFunded: true,
    },
    {
      podId: 'pod-5',
      targetAmount: 300.00,
      allocatedAmount: 300.00, // Fully funded
      remainingNeeded: 0,
      isFunded: true,
    },
    {
      podId: 'pod-6',
      targetAmount: 200.00,
      allocatedAmount: 200.00, // Fully funded
      remainingNeeded: 0,
      isFunded: true,
    },
  ],
};

export const initializeDemoData = () => {
  return {
    subscriptions: [...demoSubscriptions, ...demoWatchlistItems],
    paymentCards: demoPaymentCards,
    bills: demoBills,
    investments: demoInvestments,
    financialGoals: demoFinancialGoals,
    notifications: demoNotifications,
    notebookEntries: demoNotebookEntries,
    weeklyBudgets: generateWeeklyBudgets(),
    budgetPods: demoBudgetPods,
    incomeSources: demoIncomeSources,
    paycheckAllocations: demoPaycheckAllocations,
    currentPayCycleSummary: demoPayCycleSummary,
  };
};

// Generate weekly budgets for Thursday pay periods
function generateWeeklyBudgets(): WeeklyBudget[] {
  const budgets: WeeklyBudget[] = [];
  const weeksToGenerate = 8; // Generate 8 weeks of budgets
  
  for (let i = 0; i < weeksToGenerate; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (i * 7) - today.getDay() + 4); // Thursday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // Calculate which subscriptions fall in this week
    const weekSubs = demoSubscriptions.filter(sub => {
      const paymentDate = new Date(sub.nextPayment);
      return paymentDate >= weekStart && paymentDate <= weekEnd;
    });
    
    const weeklyAmount = weekSubs.reduce((total, sub) => {
      const monthlyAmount = sub.frequency === 'yearly' ? sub.price / 12 : sub.price;
      return total + monthlyAmount;
    }, 0);
    
    budgets.push({
      id: `budget-week-${i}`,
      weekLabel: `Week ${i + 1}`,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      allocatedAmount: weeklyAmount,
      subscriptions: weekSubs.map(s => s.id),
      totalBudget: 250, // Weekly budget allocation
      allocated: weeklyAmount,
      remaining: 250 - weeklyAmount,
      isCurrentWeek: i === 0,
      weekNumber: i + 1,
      requiredAmount: weeklyAmount,
    });
  }
  
  return budgets;
}