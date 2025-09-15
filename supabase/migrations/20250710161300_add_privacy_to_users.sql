/*
  # Add privacy column to users table

  1. Changes Made
    - Add 'is_private' boolean column to users table with default false
    - Add index on is_private column for efficient queries

  2. Notes
    - Default is false (public), users can set to true for private accounts
    - Private accounts' posts won't be visible in public feeds
*/

-- Add is_private column to users table
ALTER TABLE users ADD COLUMN is_private boolean DEFAULT false;

-- Add index for privacy queries
CREATE INDEX IF NOT EXISTS idx_users_is_private ON users(is_private);
