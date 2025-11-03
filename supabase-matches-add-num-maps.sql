-- Add num_maps column to matches table to track how many maps each match has
-- This allows flexibility for best-of-2, best-of-3, best-of-5 formats

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS num_maps INTEGER NOT NULL DEFAULT 3 
CHECK (num_maps >= 2 AND num_maps <= 5);

COMMENT ON COLUMN matches.num_maps IS 'Number of maps in this match (2-5). Determines best-of format.';

