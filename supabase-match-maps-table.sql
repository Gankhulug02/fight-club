-- Create match_maps table for storing individual map results within a match
-- Each match can have 2-5 maps (best of 2, best of 3, best of 5, etc.)

CREATE TABLE IF NOT EXISTS match_maps (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  map_number INTEGER NOT NULL CHECK (map_number >= 1 AND map_number <= 5),
  team1_score INTEGER NOT NULL DEFAULT 0,
  team2_score INTEGER NOT NULL DEFAULT 0,
  winner_team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  map_name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(match_id, map_number)
);

-- Create index for faster lookups
CREATE INDEX idx_match_maps_match_id ON match_maps(match_id);
CREATE INDEX idx_match_maps_status ON match_maps(status);
CREATE INDEX idx_match_maps_winner ON match_maps(winner_team_id);

-- Add RLS (Row Level Security) policies - Allow all operations for everyone
ALTER TABLE match_maps ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
CREATE POLICY "Allow all to read match_maps" ON match_maps
  FOR SELECT
  USING (true);

-- Allow everyone to insert
CREATE POLICY "Allow all to insert match_maps" ON match_maps
  FOR INSERT
  WITH CHECK (true);

-- Allow everyone to update
CREATE POLICY "Allow all to update match_maps" ON match_maps
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow everyone to delete
CREATE POLICY "Allow all to delete match_maps" ON match_maps
  FOR DELETE
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_match_maps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_maps_updated_at
  BEFORE UPDATE ON match_maps
  FOR EACH ROW
  EXECUTE FUNCTION update_match_maps_updated_at();

-- Create function to automatically update match score based on map results
CREATE OR REPLACE FUNCTION update_match_score_from_maps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the match scores based on how many maps each team won
  UPDATE matches
  SET 
    team1_score = (
      SELECT COUNT(*) 
      FROM match_maps 
      WHERE match_id = NEW.match_id 
        AND winner_team_id = (SELECT team1_id FROM matches WHERE id = NEW.match_id)
    ),
    team2_score = (
      SELECT COUNT(*) 
      FROM match_maps 
      WHERE match_id = NEW.match_id 
        AND winner_team_id = (SELECT team2_id FROM matches WHERE id = NEW.match_id)
    )
  WHERE id = NEW.match_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_score_after_map_update
  AFTER INSERT OR UPDATE OR DELETE ON match_maps
  FOR EACH ROW
  EXECUTE FUNCTION update_match_score_from_maps();

COMMENT ON TABLE match_maps IS 'Stores individual map results within a match. Each match can have 2-5 maps.';
COMMENT ON COLUMN match_maps.match_id IS 'Foreign key to matches table';
COMMENT ON COLUMN match_maps.map_number IS 'Map number within the match (1-5)';
COMMENT ON COLUMN match_maps.team1_score IS 'Score for team 1 on this specific map';
COMMENT ON COLUMN match_maps.team2_score IS 'Score for team 2 on this specific map';
COMMENT ON COLUMN match_maps.winner_team_id IS 'ID of the team that won this map';
COMMENT ON COLUMN match_maps.map_name IS 'Optional name of the map (e.g., Dust2, Mirage, etc.)';

