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

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Statistics are calculated client-side in the frontend
-- No database functions needed for this approach

-- Enable RLS for teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Enable RLS for matches table
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample teams
INSERT INTO teams (name, logo) VALUES
  ('FaZe Clan', '🔥'),
  ('Natus Vincere', '⭐'),
  ('Vitality', '🐝'),
  ('G2 Esports', '🎮'),
  ('Team Liquid', '🐴'),
  ('MOUZ', '🐭'),
  ('Heroic', '🦁'),
  ('ENCE', '🦅')
ON CONFLICT (name) DO NOTHING;

-- Insert sample matches using CTE for better performance
-- This approach avoids repeated subqueries for each insert
WITH team_ids AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY name) as rn
  FROM teams
)
INSERT INTO matches (team1_id, team2_id, team1_score, team2_score, status)
SELECT t1.id, t2.id, score1, score2, 'completed'
FROM (VALUES
  -- FaZe Clan matches (team vs opponent, score1, score2)
  ('FaZe Clan', 'Natus Vincere', 16, 10),
  ('FaZe Clan', 'Vitality', 16, 8),
  ('FaZe Clan', 'G2 Esports', 16, 12),
  ('FaZe Clan', 'Team Liquid', 13, 16),
  ('FaZe Clan', 'MOUZ', 16, 9),
  ('FaZe Clan', 'Heroic', 16, 6),
  ('FaZe Clan', 'ENCE', 16, 4),
  ('FaZe Clan', 'Natus Vincere', 8, 16),
  ('FaZe Clan', 'Vitality', 16, 11),
  ('FaZe Clan', 'G2 Esports', 16, 7),
  ('FaZe Clan', 'Team Liquid', 6, 16),
  ('FaZe Clan', 'MOUZ', 16, 5),
  ('FaZe Clan', 'Heroic', 16, 8),
  ('FaZe Clan', 'ENCE', 13, 6),
  ('FaZe Clan', 'Vitality', 0, 0),
  
  -- Natus Vincere matches
  ('Natus Vincere', 'Vitality', 16, 13),
  ('Natus Vincere', 'G2 Esports', 16, 9),
  ('Natus Vincere', 'Team Liquid', 16, 11),
  ('Natus Vincere', 'MOUZ', 13, 16),
  ('Natus Vincere', 'Heroic', 16, 8),
  ('Natus Vincere', 'ENCE', 16, 5),
  ('Natus Vincere', 'Vitality', 16, 10),
  ('Natus Vincere', 'G2 Esports', 12, 16),
  ('Natus Vincere', 'Team Liquid', 16, 6),
  ('Natus Vincere', 'MOUZ', 16, 9),
  ('Natus Vincere', 'Heroic', 16, 7),
  ('Natus Vincere', 'ENCE', 0, 0),
  ('Natus Vincere', 'Team Liquid', 0, 0),
  ('Natus Vincere', 'G2 Esports', 0, 0),
  ('Natus Vincere', 'Heroic', 0, 0),
  
  -- Other team matches
  ('Vitality', 'G2 Esports', 16, 14),
  ('Vitality', 'Team Liquid', 16, 12),
  ('Vitality', 'MOUZ', 13, 16),
  ('Vitality', 'Heroic', 16, 9),
  ('Vitality', 'ENCE', 16, 7),
  ('G2 Esports', 'Team Liquid', 16, 13),
  ('G2 Esports', 'MOUZ', 14, 16),
  ('G2 Esports', 'Heroic', 16, 10),
  ('G2 Esports', 'ENCE', 16, 6),
  ('Team Liquid', 'MOUZ', 16, 12),
  ('Team Liquid', 'Heroic', 16, 8),
  ('Team Liquid', 'ENCE', 16, 5),
  ('MOUZ', 'Heroic', 16, 11),
  ('MOUZ', 'ENCE', 16, 9),
  ('Heroic', 'ENCE', 16, 13)
) AS matches_data(team1_name, team2_name, score1, score2)
JOIN team_ids t1 ON t1.name = matches_data.team1_name
JOIN team_ids t2 ON t2.name = matches_data.team2_name
ON CONFLICT DO NOTHING;

-- ============================================
-- OPTIMIZATION NOTES
-- ============================================
-- 1. Partial indexes on (team_id, status) for faster completed match queries
-- 2. Composite indexes for common join patterns
-- 3. CTE-based sample data insertion (avoids N subqueries)
-- 4. NOT NULL constraints added where appropriate
-- 5. Proper CASCADE deletion to maintain referential integrity
-- 6. All timestamps have NOT NULL + DEFAULT for consistency
