import { getServiceLogo } from "../utils/faviconUtils";
import { CARD_COLORS } from "../types/constants";
import { FullSubscription, FullPaymentCard } from "../types/subscription";

// Helper function to get dates relative to current date for realistic demo data
const getRelativeDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
};

// Helper function to get a past date for dateAdded
const getPastDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

export const INITIAL_SUBSCRIPTIONS: FullSubscription[] = [
  {
    id: "1",
    name: "ChatGPT Plus",
    price: 20.0,
    frequency: "monthly",
    nextPayment: getRelativeDate(5), // 5 days from now
    category: "AI & Tools",
    status: "active",
    description: "Advanced AI assistant with GPT-4 access",
    website: "https://chat.openai.com",
    dateAdded: getPastDate(45),
    tags: ["AI", "productivity", "business"],
  },
  {
    id: "2",
    name: "YouTube Premium",
    price: 18.99,
    frequency: "monthly",
    nextPayment: getRelativeDate(8), // 8 days from now
    category: "Entertainment",
    status: "active",
    description: "Ad-free YouTube with background play and YouTube Music",
    website: "https://youtube.com/premium",
    dateAdded: getPastDate(60),
    tags: ["entertainment", "music", "video"],
  },
  {
    id: "3",
    name: "Notion Team",
    price: 24.0,
    frequency: "monthly",
    nextPayment: getRelativeDate(12), // 12 days from now
    category: "Productivity",
    status: "active",
    description: "All-in-one workspace for notes, tasks, and collaboration",
    website: "https://notion.so",
    dateAdded: getPastDate(50),
    tags: ["productivity", "collaboration", "notes"],
  },
  {
    id: "4",
    name: "Adobe Creative Cloud",
    price: 599.88,
    frequency: "yearly",
    nextPayment: getRelativeDate(45), // 45 days from now (quarterly-ish)
    category: "Design",
    status: "active",
    description: "Complete suite of creative tools",
    website: "https://adobe.com",
    dateAdded: getPastDate(320), // Nearly a year ago
    tags: ["design", "creativity", "professional"],
  },
  {
    id: "5",
    name: "Spotify Premium",
    price: 9.99,
    frequency: "monthly",
    nextPayment: getRelativeDate(-15), // 15 days ago (cancelled subscription)
    category: "Entertainment",
    status: "cancelled",
    description: "Music streaming service",
    cancelledDate: getPastDate(20),
    website: "https://spotify.com",
    dateAdded: getPastDate(90),
    tags: ["music", "entertainment"],
  },
  {
    id: "6",
    name: "Netflix Premium",
    price: 15.99,
    frequency: "monthly",
    nextPayment: getRelativeDate(3), // 3 days from now (watchlist item)
    category: "Entertainment",
    status: "watchlist",
    description: "Premium streaming service",
    notes: "Considering getting back into Netflix for new shows.",
    website: "https://netflix.com",
    dateAdded: getPastDate(30),
    tags: ["entertainment", "streaming", "tv"],
    priority: "important",
  },
  {
    id: "7",
    name: "Dropbox Pro",
    price: 9.99,
    frequency: "monthly",
    nextPayment: getRelativeDate(15), // 15 days from now
    category: "Storage",
    status: "active",
    description: "Cloud storage service",
    website: "https://dropbox.com",
    dateAdded: getPastDate(120),
    tags: ["storage", "cloud", "sync"],
  },
  {
    id: "8",
    name: "1Password",
    price: 2.99,
    frequency: "monthly",
    nextPayment: getRelativeDate(7), // 7 days from now (next week)
    category: "Security",
    status: "active",
    description: "Password manager",
    website: "https://1password.com",
    dateAdded: getPastDate(200),
    tags: ["security", "passwords", "authentication"],
  },
  {
    id: "9",
    name: "Figma Professional",
    price: 12.0,
    frequency: "monthly",
    nextPayment: getRelativeDate(1), // Tomorrow
    category: "Design",
    status: "active",
    description: "Design and prototyping tool",
    website: "https://figma.com",
    dateAdded: getPastDate(25),
    tags: ["design", "prototyping", "collaboration"],
  },
  {
    id: "10",
    name: "Linear",
    price: 8.0,
    frequency: "monthly",
    nextPayment: getRelativeDate(6), // 6 days from now
    category: "Productivity",
    status: "active",
    description: "Issue tracking and project management",
    website: "https://linear.app",
    dateAdded: getPastDate(15),
    tags: ["productivity", "project-management", "development"],
  },
  {
    id: "11",
    name: "GitHub Pro",
    price: 4.0,
    frequency: "monthly",
    nextPayment: getRelativeDate(22), // 22 days from now (next pay period)
    category: "Development",
    status: "active",
    description: "Git repository hosting and collaboration",
    website: "https://github.com",
    dateAdded: getPastDate(80),
    tags: ["development", "git", "collaboration"],
  },
  {
    id: "12",
    name: "Slack Pro",
    price: 7.25,
    frequency: "monthly",
    nextPayment: getRelativeDate(35), // 35 days from now (5 weeks)
    category: "Productivity",
    status: "active",
    description: "Team communication and collaboration",
    website: "https://slack.com",
    dateAdded: getPastDate(100),
    tags: ["communication", "collaboration", "team"],
  },
];

export const INITIAL_PAYMENT_CARDS: FullPaymentCard[] = [
  {
    id: "1",
    name: "Business Visa",
    lastFourDigits: "4532",
    expiryMonth: 12,
    expiryYear: 2027,
    provider: "visa",
    isDefault: true,
    nickname: "Business Visa",
    color: CARD_COLORS[0],
    dateAdded: getPastDate(365),
  },
  {
    id: "2",
    name: "Personal Mastercard",
    lastFourDigits: "8821",
    expiryMonth: 8,
    expiryYear: 2026,
    provider: "mastercard",
    isDefault: false,
    nickname: "Personal Mastercard",
    color: CARD_COLORS[1],
    dateAdded: getPastDate(300),
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "1",
    type: "trial" as const,
    title: "AI Detected Price Increase",
    message: "Netflix plans to increase prices by $2/month starting next quarter",
    timestamp: new Date().toISOString(),
    read: false,
    subscriptionId: "6",
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Optimization Opportunity",
    message: "You could save $45/month by bundling Adobe and Figma services",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
  {
    id: "3",
    type: "info" as const,
    title: "Smart Automation Active",
    message: "Budget guardian prevented overspend - Adobe renewal moved to next payday",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: false,
  },
  {
    id: "4",
    type: "reminder" as const,
    title: "Payment Due Soon",
    message: "Figma Professional payment due tomorrow ($12.00)",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    subscriptionId: "9",
  },
];

export const INITIAL_APP_SETTINGS = {
  notifications: {
    upcomingPayments: true,
    highSpending: true,
    weeklyReports: false,
    trialExpirations: true,
  },
  thresholds: {
    highSpendingAmount: 200,
    upcomingPaymentDays: 7,
    trialReminderDays: 3,
  },
  preferences: {
    defaultView: "dashboard" as const,
    showCancelled: true,
    groupByCategory: false,
    darkMode: false,
    showFavicons: true,
    theme: "light" as const,
  },
};
