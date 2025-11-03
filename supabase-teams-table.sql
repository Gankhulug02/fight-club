-- ============================================
-- Fight Club Tournament - Database Schema
-- ============================================
-- Run this script in Supabase SQL Editor
-- Statistics are calculated client-side from match results

-- ============================================
-- TABLES
-- ============================================

-- Teams table: stores basic team information
CREATE TABLE IF NOT EXISTS teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo TEXT NOT NULL DEFAULT '⚡',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Matches table: stores all match results
CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  team1_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team2_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team1_score INTEGER NOT NULL DEFAULT 0 CHECK (team1_score >= 0),
  team2_score INTEGER NOT NULL DEFAULT 0 CHECK (team2_score >= 0),
  match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT different_teams CHECK (team1_id != team2_id)
);

-- Players table: stores player information
CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  avatar TEXT DEFAULT '👤',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_player_name_per_team UNIQUE (name, team_id)
);

-- Match player stats: stores individual player performance per match
CREATE TABLE IF NOT EXISTS match_player_stats (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  kills INTEGER NOT NULL DEFAULT 0 CHECK (kills >= 0),
  deaths INTEGER NOT NULL DEFAULT 0 CHECK (deaths >= 0),
  assists INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_player_per_match UNIQUE (match_id, player_id)
);

-- ============================================
-- INDEXES (Optimized for common queries)
-- ============================================

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);

-- Matches indexes (optimized for statistics calculation)
CREATE INDEX IF NOT EXISTS idx_matches_team1_status ON matches(team1_id, status) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_matches_team2_status ON matches(team2_id, status) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date DESC);

-- Composite index for team lookups across both teams
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(team1_id, team2_id);

-- Players indexes
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);

-- Match player stats indexes
CREATE INDEX IF NOT EXISTS idx_match_player_stats_match_id ON match_player_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_match_player_stats_player_id ON match_player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_match_player_stats_player_match ON match_player_stats(player_id, match_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to teams table
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to matches table
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to players table
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to match_player_stats table
DROP TRIGGER IF EXISTS update_match_player_stats_updated_at ON match_player_stats;
CREATE TRIGGER update_match_player_stats_updated_at
  BEFORE UPDATE ON match_player_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Statistics are calculated client-side in the frontend
-- No database functions needed for this approach

-- Enable RLS for teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Enable RLS for matches table
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Enable RLS for players table
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Enable RLS for match_player_stats table
ALTER TABLE match_player_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC ACCESS (Free for everyone)
-- ============================================
-- ⚠️ WARNING: This allows anyone to read/write/delete data without authentication
-- Perfect for development/testing, but consider securing for production

CREATE POLICY "Enable all operations for everyone on teams" ON teams
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable all operations for everyone on matches" ON matches
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable all operations for everyone on players" ON players
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable all operations for everyone on match_player_stats" ON match_player_stats
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- ============================================
-- OPTIMIZATION NOTES
-- ============================================
-- 1. Partial indexes on (team_id, status) for faster completed match queries
-- 2. Composite indexes for common join patterns (teams, players, match stats)
-- 3. CTE-based sample data insertion (avoids N subqueries)
-- 4. NOT NULL constraints added where appropriate
-- 5. Proper CASCADE deletion to maintain referential integrity
-- 6. All timestamps have NOT NULL + DEFAULT for consistency
-- 7. Players table with unique constraint on (name, team_id)
-- 8. Match player stats with unique constraint on (match_id, player_id)
-- 9. Optimized indexes for player lookups and KDA statistics aggregation
-- 10. CHECK constraints ensure non-negative values for kills, deaths, assists
