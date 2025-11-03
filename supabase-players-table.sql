-- Create players table for storing player information
-- Each player belongs to a team

CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role VARCHAR(100),
  avatar VARCHAR(500),
  kills INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_name ON players(name);

-- Add RLS (Row Level Security) policies - Allow all operations for everyone
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
CREATE POLICY "Allow all to read players" ON players
  FOR SELECT
  USING (true);

-- Allow everyone to insert
CREATE POLICY "Allow all to insert players" ON players
  FOR INSERT
  WITH CHECK (true);

-- Allow everyone to update
CREATE POLICY "Allow all to update players" ON players
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow everyone to delete
CREATE POLICY "Allow all to delete players" ON players
  FOR DELETE
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_players_updated_at();

COMMENT ON TABLE players IS 'Stores player information. Each player belongs to a team. All users have full CRUD access.';
COMMENT ON COLUMN players.name IS 'Player name or in-game name';
COMMENT ON COLUMN players.team_id IS 'Foreign key to teams table';
COMMENT ON COLUMN players.role IS 'Player role (e.g., Entry Fragger, IGL, AWPer, Support, Rifler)';
COMMENT ON COLUMN players.avatar IS 'URL to player avatar image';
COMMENT ON COLUMN players.kills IS 'Total career kills across all matches';
COMMENT ON COLUMN players.assists IS 'Total career assists across all matches';
COMMENT ON COLUMN players.deaths IS 'Total career deaths across all matches';
COMMENT ON COLUMN players.matches_played IS 'Total number of matches played';
COMMENT ON COLUMN players.wins IS 'Number of match wins';
COMMENT ON COLUMN players.losses IS 'Number of match losses';

