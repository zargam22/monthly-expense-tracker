-- Optional Migration: Copy current salary to current month's income
-- This script helps migrate existing users from global salary to monthly income
-- 
-- IMPORTANT: Review this script before running!
-- You can choose to:
--   A) Run this to copy current salary to current month
--   B) Skip this and manually set income for each month
--
-- This does NOT delete any data - it only ADDS records to monthly_income table

-- Step 1: Check what will be migrated (run this first to preview)
SELECT 
  id as user_id,
  salary as current_salary,
  EXTRACT(YEAR FROM CURRENT_DATE) as year,
  EXTRACT(MONTH FROM CURRENT_DATE) as month
FROM public.users
WHERE salary IS NOT NULL AND salary > 0;

-- Step 2: Uncomment and run this to actually migrate
-- This copies the current salary value to the current month only
/*
INSERT INTO public.monthly_income (user_id, year, month, income, created_at, updated_at)
SELECT 
  id as user_id,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as year,
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER as month,
  salary as income,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE salary IS NOT NULL 
  AND salary > 0
  AND NOT EXISTS (
    -- Don't insert if already exists
    SELECT 1 FROM public.monthly_income mi
    WHERE mi.user_id = users.id
      AND mi.year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
      AND mi.month = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
  );
*/

-- Step 3: Verify the migration worked
-- SELECT * FROM public.monthly_income;
