/*
  # Add user registration policy

  1. Security Changes
    - Add policy to allow anonymous users to register (INSERT into users table)
    - This enables user registration while maintaining security for other operations

  2. Notes
    - Anonymous users can only INSERT new records
    - All other operations (SELECT, UPDATE, DELETE) still require authentication
    - This is a standard pattern for user registration flows
*/

-- Allow anonymous users to register (insert new users)
CREATE POLICY "Allow anonymous user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);