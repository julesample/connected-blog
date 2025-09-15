/*
  # Add pinned column to posts table

  1. Changes Made
    - Add 'pinned' boolean column to posts table with default false
    - Add index on pinned column for efficient queries
    - Update RLS policies if needed (existing policies should suffice as pinned is part of post update)

  2. Notes
    - Only post authors can pin/unpin their posts (enforced by existing UPDATE policy)
    - Application logic will ensure only one post per user is pinned at a time
*/

-- Add pinned column to posts table
ALTER TABLE posts ADD COLUMN pinned boolean DEFAULT false;

-- Add index for pinned posts queries
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(pinned) WHERE pinned = true;
