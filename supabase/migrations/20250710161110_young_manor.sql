/*
  # Fix RLS policies for user registration and login

  1. Security Updates
    - Update INSERT policy to allow user creation during registration
    - Ensure SELECT policy allows proper user lookup
    - Fix policy conditions to work with auth.uid()

  2. Changes Made
    - Modified "Allow anonymous user registration" policy to work correctly
    - Updated "Users can read all profiles" policy for better functionality
    - Ensured policies align with application flow
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow anonymous user registration" ON users;
DROP POLICY IF EXISTS "Users can read all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new INSERT policy that allows user creation during registration
-- This allows both anonymous users (during registration) and authenticated users to insert
CREATE POLICY "Enable user registration and profile creation"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Create SELECT policy that allows authenticated users to read profiles
CREATE POLICY "Authenticated users can read profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create UPDATE policy for users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create DELETE policy for users to delete their own profile (optional but good practice)
CREATE POLICY "Users can delete own profile"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);