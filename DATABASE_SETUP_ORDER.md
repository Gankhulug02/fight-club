# Database Setup - Correct Order

## 📋 Run SQL Scripts in This Order

Execute these SQL files in your Supabase SQL Editor **in this exact order**:

### 1. Teams Table
**File**: `supabase-teams-table.sql`

Creates the `teams` table with:
- Team name, logo
- Win/loss/draw statistics
- Full CRUD access for everyone

```sql
-- Run first - no dependencies
```

### 2. Players Table
**File**: `supabase-players-table.sql`

Creates the `players` table with:
- Player name, role
- Links to teams table
- Full CRUD access for everyone

```sql
-- Requires: teams table
```

### 3. Matches Table
**File**: `supabase-matches-table.sql`

Creates the `matches` table with:
- Match between two teams
- Match date, status, num_maps
- Team scores (maps won)
- Full CRUD access for everyone

```sql
-- Requires: teams table
```

### 4. Match Maps Table
**File**: `supabase-match-maps-table.sql`

Creates the `match_maps` table with:
- Individual map results (2-5 per match)
- Map scores, winner
- Map status
- Full CRUD access for everyone
- Auto-calculates match scores via trigger

```sql
-- Requires: matches, teams tables
```

### 5. Map Player Stats Table
**File**: `supabase-map-player-stats-table.sql`

Creates the `map_player_stats` table with:
- Player K/A/D statistics per map
- 10 records per map (5 players × 2 teams)
- Full CRUD access for everyone

```sql
-- Requires: match_maps, players, teams tables
```

---

## 🚀 Quick Setup Script

Copy and paste this into Supabase SQL Editor to run all at once:

```sql
-- ==========================================
-- RUN ALL MIGRATIONS IN ORDER
-- ==========================================

-- 1. TEAMS TABLE
\i supabase-teams-table.sql

-- 2. PLAYERS TABLE  
\i supabase-players-table.sql

-- 3. MATCHES TABLE
\i supabase-matches-table.sql

-- 4. MATCH MAPS TABLE
\i supabase-match-maps-table.sql

-- 5. MAP PLAYER STATS TABLE
\i supabase-map-player-stats-table.sql
```

**Note**: The `\i` command may not work in Supabase web editor. You'll need to copy and paste each file's contents manually.

---

## 📊 Dependency Graph

```
teams
  ├── players (depends on teams)
  └── matches (depends on teams)
      └── match_maps (depends on matches, teams)
          └── map_player_stats (depends on match_maps, players, teams)
```

---

## ✅ Verification Queries

After running all migrations, verify everything is set up:

### Check All Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('teams', 'players', 'matches', 'match_maps', 'map_player_stats')
ORDER BY table_name;
```

Expected result: 5 tables

### Check All Policies
```sql
SELECT 
  tablename, 
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

Expected result: Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)

### Check Foreign Keys
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

Should show all foreign key relationships.

---

## 🔄 Already Have Some Tables?

If you already have some tables and just need to update policies or add new tables:

### Option A: Update Existing Policies
Run `supabase-open-all-tables.sql` to update policies on all existing tables.

### Option B: Add Missing Tables
Only run the SQL files for tables you don't have yet.

### Check What You Have
```sql
-- List existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## 🗑️ Start Fresh (Caution!)

To drop all tables and start over:

```sql
-- ⚠️ WARNING: This deletes ALL data!
DROP TABLE IF EXISTS map_player_stats CASCADE;
DROP TABLE IF EXISTS match_maps CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Now run all migrations in order
```

---

## 📁 File Reference

| Order | File | Description |
|-------|------|-------------|
| 1 | `supabase-teams-table.sql` | Teams table |
| 2 | `supabase-players-table.sql` | Players table |
| 3 | `supabase-matches-table.sql` | Matches table |
| 4 | `supabase-match-maps-table.sql` | Match maps table |
| 5 | `supabase-map-player-stats-table.sql` | Player stats table |
| - | `supabase-open-all-tables.sql` | Update all policies (optional) |

---

## 🎯 Common Issues

### Error: relation "teams" does not exist
**Solution**: Run `supabase-teams-table.sql` first

### Error: relation "matches" does not exist
**Solution**: Run `supabase-matches-table.sql` before `supabase-match-maps-table.sql`

### Error: relation "players" does not exist
**Solution**: Run `supabase-players-table.sql` before `supabase-map-player-stats-table.sql`

### Error: column "num_maps" does not exist
**Solution**: You ran old version of matches table. Run `supabase-matches-add-num-maps.sql` or recreate with new version.

---

## ✅ Setup Complete Checklist

- [ ] Ran all 5 SQL migration files in order
- [ ] Verified all 5 tables exist
- [ ] Checked all tables have 4 RLS policies each
- [ ] Tested INSERT operation (no auth required)
- [ ] Tested SELECT operation
- [ ] Tested UPDATE operation
- [ ] Tested DELETE operation
- [ ] Created at least 2 teams
- [ ] Added players to teams (5+ per team)
- [ ] Created a test match

---

**Ready to start using your tournament system!** 🏆

