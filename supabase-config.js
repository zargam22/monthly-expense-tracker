// Supabase Configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ✅ CONFIGURED: Your Supabase project credentials
const SUPABASE_URL = 'https://evuabnusstmlbdtjzbio.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dWFibnVzc3RtbGJkdGp6YmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzI4MjQsImV4cCI6MjA3NjAwODgyNH0.v7uBcs9n2LrqQ-ZwNh-7eGEHnbDkw0sy6Y8HI9aaSn8'

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Database table names
export const TABLES = {
  USERS: 'users',
  TRANSACTIONS: 'transactions'
}

// Default user ID for single-user application
export const USER_ID = 'default-user'