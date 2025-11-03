-- Create map_player_stats table for storing individual player performance per map
-- Each map has 10 players (5 per team) with their kills, assists, and deaths

CREATE TABLE IF NOT EXISTS map_player_stats (
  id BIGSERIAL PRIMARY KEY,
  map_id BIGINT NOT NULL REFERENCES match_maps(id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  kills INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(map_id, player_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_map_player_stats_map_id ON map_player_stats(map_id);
CREATE INDEX idx_map_player_stats_player_id ON map_player_stats(player_id);
CREATE INDEX idx_map_player_stats_team_id ON map_player_stats(team_id);

-- Add RLS (Row Level Security) policies - Allow all operations for everyone
ALTER TABLE map_player_stats ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
CREATE POLICY "Allow all to read map_player_stats" ON map_player_stats
  FOR SELECT
  USING (true);

-- Allow everyone to insert
CREATE POLICY "Allow all to insert map_player_stats" ON map_player_stats
  FOR INSERT
  WITH CHECK (true);

-- Allow everyone to update
CREATE POLICY "Allow all to update map_player_stats" ON map_player_stats
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow everyone to delete
CREATE POLICY "Allow all to delete map_player_stats" ON map_player_stats
  FOR DELETE
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_map_player_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_map_player_stats_updated_at
  BEFORE UPDATE ON map_player_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_map_player_stats_updated_at();

COMMENT ON TABLE map_player_stats IS 'Stores individual player performance statistics for each map. Each map has 10 players (5 per team).';
COMMENT ON COLUMN map_player_stats.map_id IS 'Foreign key to match_maps table';
COMMENT ON COLUMN map_player_stats.player_id IS 'Foreign key to players table';
COMMENT ON COLUMN map_player_stats.team_id IS 'Which team the player was on for this map';
COMMENT ON COLUMN map_player_stats.kills IS 'Number of kills by this player in this map';
COMMENT ON COLUMN map_player_stats.assists IS 'Number of assists by this player in this map';
COMMENT ON COLUMN map_player_stats.deaths IS 'Number of deaths by this player in this map';

