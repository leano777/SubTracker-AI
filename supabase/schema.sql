-- SubTracker AI Database Schema
-- Version: 1.0.0
-- Date: August 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    subscription_count INTEGER DEFAULT 0,
    total_monthly_spend DECIMAL(10, 2) DEFAULT 0
);

-- Payment Cards
CREATE TABLE IF NOT EXISTS public.payment_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    last_four TEXT NOT NULL,
    brand TEXT,
    color TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, last_four)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_card_id UUID REFERENCES public.payment_cards(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly', 'quarterly', 'lifetime', 'variable')),
    next_billing_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
    category TEXT,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    color TEXT,
    auto_renew BOOLEAN DEFAULT TRUE,
    reminder_days INTEGER DEFAULT 3,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Variable Pricing History
CREATE TABLE IF NOT EXISTS public.variable_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('payment_reminder', 'price_increase', 'renewal', 'cancellation', 'trial_ending')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Categories
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    monthly_limit DECIMAL(10, 2),
    color TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Budget Pods
CREATE TABLE IF NOT EXISTS public.budget_pods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('fixed', 'percentage', 'savings', 'investment', 'debt')),
    amount DECIMAL(10, 2),
    percentage DECIMAL(5, 2),
    balance DECIMAL(10, 2) DEFAULT 0,
    goal_amount DECIMAL(10, 2),
    color TEXT,
    icon TEXT,
    priority INTEGER DEFAULT 1,
    auto_fund BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income Sources
CREATE TABLE IF NOT EXISTS public.income_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'yearly', 'one-time')),
    next_payment_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    budget_pod_id UUID REFERENCES public.budget_pods(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('subscription', 'income', 'expense', 'transfer', 'refund')),
    description TEXT,
    date DATE NOT NULL,
    category TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Snapshots
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_subscriptions INTEGER,
    active_subscriptions INTEGER,
    monthly_spend DECIMAL(10, 2),
    yearly_spend DECIMAL(10, 2),
    top_categories JSONB,
    savings_rate DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_billing ON public.subscriptions(next_billing_date);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_payment_cards_user_id ON public.payment_cards(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_scheduled ON public.notifications(scheduled_for);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_budget_pods_user_id ON public.budget_pods(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variable_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Payment Cards
CREATE POLICY "Users can manage own cards" ON public.payment_cards
    FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can manage own subscriptions" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Variable Pricing
CREATE POLICY "Users can manage variable pricing" ON public.variable_pricing
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions
            WHERE subscriptions.id = variable_pricing.subscription_id
            AND subscriptions.user_id = auth.uid()
        )
    );

-- Notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Budget Categories
CREATE POLICY "Users can manage own categories" ON public.budget_categories
    FOR ALL USING (auth.uid() = user_id);

-- Budget Pods
CREATE POLICY "Users can manage own pods" ON public.budget_pods
    FOR ALL USING (auth.uid() = user_id);

-- Income Sources
CREATE POLICY "Users can manage own income" ON public.income_sources
    FOR ALL USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- Analytics Snapshots
CREATE POLICY "Users can view own analytics" ON public.analytics_snapshots
    FOR SELECT USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_cards_updated_at BEFORE UPDATE ON public.payment_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON public.budget_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_pods_updated_at BEFORE UPDATE ON public.budget_pods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_sources_updated_at BEFORE UPDATE ON public.income_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update subscription count and spend
CREATE OR REPLACE FUNCTION update_user_subscription_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET 
        subscription_count = (
            SELECT COUNT(*) FROM public.subscriptions 
            WHERE user_id = NEW.user_id AND status = 'active'
        ),
        total_monthly_spend = (
            SELECT COALESCE(SUM(
                CASE billing_cycle
                    WHEN 'monthly' THEN cost
                    WHEN 'yearly' THEN cost / 12
                    WHEN 'quarterly' THEN cost / 3
                    WHEN 'weekly' THEN cost * 4.33
                    ELSE cost
                END
            ), 0)
            FROM public.subscriptions
            WHERE user_id = NEW.user_id AND status = 'active'
        )
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_stats_on_insert
    AFTER INSERT ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_user_subscription_stats();

CREATE TRIGGER update_subscription_stats_on_update
    AFTER UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_user_subscription_stats();

CREATE TRIGGER update_subscription_stats_on_delete
    AFTER DELETE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_user_subscription_stats();