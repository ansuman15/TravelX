-- ============================================
-- FIX: Allow authenticated users to create agencies during onboarding
-- This migration adds INSERT policy for the agencies table
-- ============================================

-- Add INSERT policy for authenticated users to create agencies during onboarding
-- This allows new users who don't have a user record yet to create an agency
CREATE POLICY "Authenticated users can create agency during onboarding" ON agencies
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also need to allow authenticated users to insert their own user record during onboarding
-- Drop and recreate the users insert policy to allow onboarding
-- First, we need a policy that allows a user to insert themselves
CREATE POLICY "Users can insert their own profile during onboarding" ON users
  FOR INSERT 
  WITH CHECK (id = auth.uid());
