-- Migration: Add Monthly Income Support
-- This creates a new table to store income per month instead of global salary
-- Run this in Supabase SQL Editor AFTER testing the code changes

-- Create monthly_income table
CREATE TABLE IF NOT EXISTS public.monthly_income (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  income BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_income_user_id ON public.monthly_income(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_user_year_month ON public.monthly_income(user_id, year, month);

-- Enable Row Level Security
ALTER TABLE public.monthly_income ENABLE ROW LEVEL SECURITY;

-- Row Level Security policy (allow all operations for personal use)
CREATE POLICY "Allow all operations on monthly_income" ON public.monthly_income 
  USING (true) WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.monthly_income IS 'Stores monthly income values for each user, allowing different income per month';
