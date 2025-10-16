# 🚀 Supabase Setup Guide

## Step 1: Create Supabase Project

1. **Go to [Supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up with GitHub/Google** (no credit card needed!)
4. **Create new project:**
   - Organization: Create new or use existing
   - Project name: `expense-tracker`
   - Database password: Create a strong password
   - Region: Choose closest to you
   - Pricing plan: **Free tier** (stays free forever)

## Step 2: Create Database Tables

Once your project is ready:

1. **Go to SQL Editor** (left sidebar)
2. **Open the `database-schema.sql` file** in this folder
3. **Copy and paste the entire content** into the SQL Editor
4. **Click "RUN"** to execute the SQL

**Alternative:** You can also copy this SQL directly:

```sql
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
```

## Step 3: Get Your Project Credentials

1. **Go to Settings → API** (left sidebar)
2. **Copy these values:**
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

## Step 4: Update Configuration

1. **Open `supabase-config.js`**
2. **Replace the placeholders:**

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Step 5: Test Connection

1. **Open your browser's developer console**
2. **Check for any Supabase connection errors**
3. **Your app should now work with Supabase! 🎉**

---

## ✅ What You Get With Supabase Free Tier:

- **Up to 50,000 monthly active users**
- **500MB database storage**
- **1GB file storage** 
- **2GB bandwidth per month**
- **Real-time subscriptions**
- **Built-in authentication** (when needed)
- **Automatic API generation**

## 🛡️ Security Notes:

- **Row Level Security is enabled** but policies allow all access for simplicity
- **For production apps**, implement proper authentication and policies
- **Your API keys are public** by design (anon key is safe to expose)

## 🚀 Next Steps:

- Your expense tracker now uses **Supabase instead of Firebase**
- **No billing required** - free tier is generous
- **Works offline** with real-time sync when online
- **Perfect for Android mobile web apps**

---

**Need help?** Check [Supabase Documentation](https://supabase.com/docs) or ask me!