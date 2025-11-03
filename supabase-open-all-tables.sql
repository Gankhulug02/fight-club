-- Open all tables for CRUD operations by everyone (including anonymous users)
-- Run this script to update RLS policies for all existing tables

-- ===================================
-- TEAMS TABLE
-- ===================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all to read teams" ON teams;
DROP POLICY IF EXISTS "Allow all to insert teams" ON teams;
DROP POLICY IF EXISTS "Allow all to update teams" ON teams;
DROP POLICY IF EXISTS "Allow all to delete teams" ON teams;

-- Create new permissive policies
CREATE POLICY "Allow all to read teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Allow all to insert teams" ON teams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update teams" ON teams
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all to delete teams" ON teams
  FOR DELETE USING (true);

-- ===================================
-- PLAYERS TABLE
-- ===================================
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all to read players" ON players;
DROP POLICY IF EXISTS "Allow all to insert players" ON players;
DROP POLICY IF EXISTS "Allow all to update players" ON players;
DROP POLICY IF EXISTS "Allow all to delete players" ON players;

-- Create new permissive policies
CREATE POLICY "Allow all to read players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Allow all to insert players" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update players" ON players
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all to delete players" ON players
  FOR DELETE USING (true);

-- ===================================
-- MATCHES TABLE
-- ===================================
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all to read matches" ON matches;
DROP POLICY IF EXISTS "Allow all to insert matches" ON matches;
DROP POLICY IF EXISTS "Allow all to update matches" ON matches;
DROP POLICY IF EXISTS "Allow all to delete matches" ON matches;

-- Create new permissive policies
CREATE POLICY "Allow all to read matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Allow all to insert matches" ON matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update matches" ON matches
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all to delete matches" ON matches
  FOR DELETE USING (true);

-- ===================================
-- MATCH_MAPS TABLE
-- ===================================
ALTER TABLE match_maps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all to read match_maps" ON match_maps;
DROP POLICY IF EXISTS "Allow all to insert match_maps" ON match_maps;
DROP POLICY IF EXISTS "Allow all to update match_maps" ON match_maps;
DROP POLICY IF EXISTS "Allow all to delete match_maps" ON match_maps;

-- Create new permissive policies
CREATE POLICY "Allow all to read match_maps" ON match_maps
  FOR SELECT USING (true);

CREATE POLICY "Allow all to insert match_maps" ON match_maps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update match_maps" ON match_maps
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all to delete match_maps" ON match_maps
  FOR DELETE USING (true);

-- ===================================
-- MAP_PLAYER_STATS TABLE
-- ===================================
ALTER TABLE map_player_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all to read map_player_stats" ON map_player_stats;
DROP POLICY IF EXISTS "Allow all to insert map_player_stats" ON map_player_stats;
DROP POLICY IF EXISTS "Allow all to update map_player_stats" ON map_player_stats;
DROP POLICY IF EXISTS "Allow all to delete map_player_stats" ON map_player_stats;

-- Create new permissive policies
CREATE POLICY "Allow all to read map_player_stats" ON map_player_stats
  FOR SELECT USING (true);

CREATE POLICY "Allow all to insert map_player_stats" ON map_player_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update map_player_stats" ON map_player_stats
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all to delete map_player_stats" ON map_player_stats
  FOR DELETE USING (true);

-- ===================================
-- Verify policies
-- ===================================
-- Run this query to check all policies:
-- SELECT tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

COMMENT ON TABLE teams IS 'All users have full CRUD access';
COMMENT ON TABLE players IS 'All users have full CRUD access';
COMMENT ON TABLE matches IS 'All users have full CRUD access';
COMMENT ON TABLE match_maps IS 'All users have full CRUD access';
COMMENT ON TABLE map_player_stats IS 'All users have full CRUD access';

