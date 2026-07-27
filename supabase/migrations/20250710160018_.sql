/*
  # Fix user registration RLS policy

  1. Security Changes
    - Add policy to allow anonymous users to register (INSERT into users table)
    - This enables the createUser function to work for new user registration
    
  2. Notes
    - This policy allows anonymous users to create accounts
    - Once authenticated, users can manage their own data via existing policies
*/

-- Allow anonymous users to register new accounts
CREATE POLICY "Allow anonymous user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);