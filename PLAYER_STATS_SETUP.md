# Player Statistics System - Setup Guide

## 🎯 Overview

The match system now tracks **individual player performance** for each map. Each team has **5 players**, and for each map, we track:
- **Kills** (K)
- **Assists** (A)
- **Deaths** (D)

## 📊 System Structure

```
MATCH
├── Map 1
│   ├── Team 1 Players (5 players)
│   │   ├── Player 1: K/A/D
│   │   ├── Player 2: K/A/D
│   │   ├── Player 3: K/A/D
│   │   ├── Player 4: K/A/D
│   │   └── Player 5: K/A/D
│   └── Team 2 Players (5 players)
│       ├── Player 1: K/A/D
│       ├── Player 2: K/A/D
│       ├── Player 3: K/A/D
│       ├── Player 4: K/A/D
│       └── Player 5: K/A/D
├── Map 2 (same structure)
└── Map 3 (same structure)
```

## 🔧 Required Database Setup

### Step 1: Run the Player Stats Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase-map-player-stats-table.sql`
5. Click **Run**

This creates the `map_player_stats` table that stores:
- Which map the stats are for
- Which player (linked to `players` table)
- Which team the player was on
- Kills, Assists, Deaths

### Step 2: Verify Tables Exist

Make sure you have all required tables:
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'players', 'matches', 'match_maps', 'map_player_stats');
```

You should see all 5 tables.

## 📋 Database Schema

### `map_player_stats` Table

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Unique identifier |
| map_id | bigint | Foreign key to match_maps |
| player_id | bigint | Foreign key to players |
| team_id | bigint | Which team (for validation) |
| kills | integer | Number of kills |
| assists | integer | Number of assists |
| deaths | integer | Number of deaths |
| created_at | timestamp | When created |
| updated_at | timestamp | Last updated |

### Key Constraints
- **Unique**: One stat record per player per map (`UNIQUE(map_id, player_id)`)
- **Foreign Keys**: Links to match_maps, players, and teams tables
- **CASCADE DELETE**: Stats are deleted when map is deleted

## 🎮 How to Use

### For Administrators

#### Creating a Match
1. Go to `/admin/matches`
2. Click **"+ Schedule Match"**
3. Select teams and configure maps
4. Click **"Create Match"**
5. System creates matches and maps (player stats added when you edit)

#### Editing Match Results
1. Find the match in the table
2. Click **"Edit"** button
3. For each map, you'll see:
   - Map scores (team totals)
   - **Player Statistics section** (NEW!)
     - Team 1 players on the left
     - Team 2 players on the right
     - K/A/D inputs for each player

4. Enter statistics for each player:
   ```
   Example:
   Player Name: John Doe
   K: 25 (kills)
   A: 8  (assists)
   D: 15 (deaths)
   ```

5. Click **"Update Match & Maps"**
6. System saves all player statistics

### Player Stats Display

The edit form shows:
- Each player's name
- Three input fields per player (K/A/D)
- Players grouped by team
- Clear labels and placeholders

## 💡 Features

### Auto-initialization
- When you edit a match, the system automatically:
  - Fetches all players for both teams
  - Creates placeholder stats (0/0/0) for each player
  - Loads existing stats if already saved

### Data Validation
- All stats default to 0
- Minimum value is 0 (can't be negative)
- Each player can only have one stat record per map

### Team Management
- System automatically assigns 5 players per team
- Players are filtered by their team_id
- Stats are organized by team in the UI

## 📊 Example Workflow

### Scenario: Team A vs Team B, Best of 3

**Match Setup:**
- Match created with 3 maps
- Team A has players: Alice, Bob, Charlie, Dave, Eve
- Team B has players: Frank, Grace, Henry, Ivy, Jack

**Map 1 Results:**
```
Team A:
- Alice: 22K / 5A / 18D
- Bob: 18K / 7A / 20D
- Charlie: 15K / 10A / 17D
- Dave: 12K / 8A / 19D
- Eve: 20K / 6A / 16D

Team B:
- Frank: 25K / 4A / 15D
- Grace: 16K / 9A / 18D
- Henry: 19K / 6A / 17D
- Ivy: 14K / 11A / 20D
- Jack: 18K / 8A / 17D

Map Score: Team A 13 - Team B 16 (Team B wins)
```

**Database Records:**
- 1 match record
- 3 map records
- 30 player_stat records (10 players × 3 maps)

## 🔍 Viewing Statistics

Currently, player statistics are:
- ✅ Editable in admin panel
- ✅ Saved to database
- ✅ Retrieved when editing matches
- ⏳ Not yet displayed on public pages (future enhancement)

## 📈 Future Enhancements

Possible additions:
- [ ] Public display of player stats
- [ ] Player leaderboards (most kills, best K/D ratio, etc.)
- [ ] Team averages and comparisons
- [ ] Historical player performance
- [ ] MVP selection based on stats
- [ ] Advanced stats (headshot %, accuracy, etc.)
- [ ] Export stats to CSV/PDF
- [ ] Real-time stat updates during live matches

## 🐛 Troubleshooting

### No players showing in edit form
**Cause**: No players in database or players not assigned to teams

**Solution**:
1. Go to `/admin/players`
2. Add players for both teams
3. Ensure each player has correct `team_id`
4. Each team needs at least 5 players

### Stats not saving
**Cause**: Database table doesn't exist

**Solution**:
1. Run the migration: `supabase-map-player-stats-table.sql`
2. Verify table exists in Supabase dashboard
3. Check RLS policies allow inserts

### Wrong players showing
**Cause**: Players assigned to wrong team

**Solution**:
1. Go to `/admin/players`
2. Check each player's team assignment
3. Update team_id to correct team
4. Refresh match edit form

## ✅ Setup Checklist

Before using player statistics:
- [ ] Run `supabase-map-player-stats-table.sql` migration
- [ ] Verify `map_player_stats` table exists
- [ ] Ensure teams have players assigned
- [ ] Each team has at least 5 players
- [ ] Tested creating and editing a match
- [ ] Verified stats save correctly

## 📁 Related Files

### Database Migrations
- `supabase-map-player-stats-table.sql` - Creates player stats table

### Frontend
- `app/admin/matches/page.tsx` - Admin interface with player stats

### Documentation
- `README_MATCH_SYSTEM.md` - Match & map system overview
- `PLAYER_STATS_SETUP.md` - This file
- `SETUP_INSTRUCTIONS.md` - General setup

---

**Ready to track player performance!** 🎮📊

Each match now provides detailed insights into individual player contributions.

