-- Supabase Database Schema for Monthly Expense Tracker
-- Copy and paste this entire file into Supabase SQL Editor

-- Create users table
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  salary BIGINT NOT NULL,
  categories JSONB NOT NULL,
  current_allocation_view TEXT NOT NULL,
  selected_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  allocation TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Row Level Security policies (allow all operations for personal use)
CREATE POLICY "Allow all operations on users" ON public.users 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on transactions" ON public.transactions 
  USING (true) WITH CHECK (true);