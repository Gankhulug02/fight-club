-- Create matches table for storing match information
-- Each match is between two teams and contains 2-5 maps

CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  team1_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team2_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team1_score INTEGER NOT NULL DEFAULT 0,
  team2_score INTEGER NOT NULL DEFAULT 0,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  num_maps INTEGER NOT NULL DEFAULT 3 CHECK (num_maps >= 2 AND num_maps <= 5),
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CHECK (team1_id != team2_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_matches_team1 ON matches(team1_id);
CREATE INDEX idx_matches_team2 ON matches(team2_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);

-- Add RLS (Row Level Security) policies - Allow all operations for everyone
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
CREATE POLICY "Allow all to read matches" ON matches
  FOR SELECT
  USING (true);

-- Allow everyone to insert
CREATE POLICY "Allow all to insert matches" ON matches
  FOR INSERT
  WITH CHECK (true);

-- Allow everyone to update
CREATE POLICY "Allow all to update matches" ON matches
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow everyone to delete
CREATE POLICY "Allow all to delete matches" ON matches
  FOR DELETE
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();

COMMENT ON TABLE matches IS 'Stores match information between two teams. Each match has 2-5 maps. All users have full CRUD access.';
COMMENT ON COLUMN matches.team1_id IS 'First team in the match';
COMMENT ON COLUMN matches.team2_id IS 'Second team in the match';
COMMENT ON COLUMN matches.team1_score IS 'Number of maps won by team 1 (0-5)';
COMMENT ON COLUMN matches.team2_score IS 'Number of maps won by team 2 (0-5)';
COMMENT ON COLUMN matches.match_date IS 'Scheduled date and time of the match';
COMMENT ON COLUMN matches.num_maps IS 'Number of maps in this match (2-5). Determines best-of format.';
COMMENT ON COLUMN matches.status IS 'Current status: scheduled, live, completed, or cancelled';

