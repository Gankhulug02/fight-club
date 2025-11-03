# Fight Club Tournament - Complete Setup Guide

## 🎯 System Overview

Your Fight Club tournament system now has a complete hierarchy:

```
TOURNAMENTS
└── MATCHES (2-5 matches between same teams)
    └── MAPS (2-5 maps per match)
        └── PLAYER STATS (10 players = 5 per team)
            ├── Kills
            ├── Assists
            └── Deaths
```

## 📋 Database Migrations Required

You need to run **3 SQL migrations** in order:

### 1. Match Maps Table
**File**: `supabase-match-maps-table.sql`
- Creates `match_maps` table
- Stores individual map results (2-5 maps per match)
- Auto-calculates match scores based on maps won

### 2. Add num_maps Column
**File**: `supabase-matches-add-num-maps.sql`
- Adds `num_maps` column to `matches` table
- Tracks how many maps each match has (2-5)

### 3. Player Statistics Table
**File**: `supabase-map-player-stats-table.sql`
- Creates `map_player_stats` table
- Tracks K/A/D for each player on each map
- Links to players, teams, and maps

## 🔧 Setup Steps

### Step 1: Run All Migrations

1. Open Supabase Dashboard → SQL Editor
2. For each migration file:
   - Click **New Query**
   - Copy file contents
   - Paste and **Run**

**Run in this order:**
1. `supabase-match-maps-table.sql`
2. `supabase-matches-add-num-maps.sql`
3. `supabase-map-player-stats-table.sql`

### Step 2: Verify Setup

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'players', 'matches', 'match_maps', 'map_player_stats')
ORDER BY table_name;
```

You should see all 5 tables.

### Step 3: Ensure Players Exist

1. Go to `/admin/players`
2. Make sure each team has at least 5 players
3. Verify players are assigned to correct teams

## 🎮 How It Works

### Creating Matches

1. Go to `/admin/matches`
2. Click **"+ Schedule Match"**
3. Configure:
   - **Teams**: Select 2 teams
   - **Number of Matches**: 1-5
   - **Maps Per Match**: 2-5 (Best of 2/3/4/5)
   - **Date & Time**: When matches occur
   - **Status**: Scheduled/Live/Completed

**Example:**
```
Team A vs Team B
2 matches
3 maps per match (Best of 3)
= 2 matches × 3 maps = 6 total maps
```

### Editing Match Results

1. Find match in table
2. Click **"Edit"**
3. For each map:
   - **Map Scores**: Team totals
   - **Player Statistics**: K/A/D for all 10 players
4. Click **"Update Match & Maps"**

### Automatic Calculations

- **Match Score**: Auto-calculated from maps won
  - Map 1: Team A wins → Match score: 1-0
  - Map 2: Team B wins → Match score: 1-1
  - Map 3: Team A wins → Final: 2-1 (Team A wins)

- **Winner Detection**: Based on map scores
  - Higher score = winner
  - Equal scores = no winner (draw)

## 📊 Data Structure

### Match Example: Team Phoenix vs Team Dragon

```
Match #1 (Best of 3)
├── Map 1: Phoenix 13-11 Dragon ✅ Phoenix
│   ├── Phoenix Players (5):
│   │   ├── Player A: 22K / 5A / 18D
│   │   ├── Player B: 18K / 7A / 20D
│   │   ├── Player C: 15K / 10A / 17D
│   │   ├── Player D: 12K / 8A / 19D
│   │   └── Player E: 20K / 6A / 16D
│   └── Dragon Players (5):
│       ├── Player F: 25K / 4A / 15D
│       ├── Player G: 16K / 9A / 18D
│       ├── Player H: 19K / 6A / 17D
│       ├── Player I: 14K / 11A / 20D
│       └── Player J: 18K / 8A / 17D
├── Map 2: Phoenix 9-13 Dragon ✅ Dragon
│   └── (10 player stats)
└── Map 3: Phoenix 13-8 Dragon ✅ Phoenix
    └── (10 player stats)

Final Match Score: Phoenix 2-1 Dragon
Total Player Stats: 30 records (10 players × 3 maps)
```

## ✨ Features

### Match Management
- Create 1-5 matches between same teams
- Each match has 2-5 maps (flexible format)
- Filter by status (All/Live/Scheduled/Completed)
- Search by team name
- Edit or delete matches

### Map Management
- Track individual map scores
- Record winner for each map
- Set map status independently
- Auto-calculate match winner

### Player Statistics
- 5 players per team per map
- Track Kills, Assists, Deaths
- Historical performance data
- Individual player records

### Admin Interface
- Clean, modern dark UI
- Real-time stats display
- Intuitive forms with validation
- Map-by-map breakdown view
- Player stats grouped by team

## 📈 Match Formats Supported

| Format | Maps | Win Condition | Use Case |
|--------|------|---------------|----------|
| Best of 2 | 2 | First to 2 or draw | Quick matches |
| **Best of 3** | **3** | **First to 2** | **Standard** |
| Best of 4 | 4 | First to 3 or draw | Extended series |
| Best of 5 | 5 | First to 3 | Finals |

## 🔍 UI Elements

### Match Table
- Overall match score (maps won)
- Map-by-map breakdown with scores
- Winner highlighting (green text)
- Team logos and names
- Match date and time
- Status badges (Live/Scheduled/Completed)

### Edit Form
- Match details section
- Map results with scores
- **Player statistics section** (NEW!)
  - Team 1 players (left column)
  - Team 2 players (right column)
  - K/A/D inputs for each player
  - Helper text: "K = Kills, A = Assists, D = Deaths"
- Overall match score preview
- Update or cancel buttons

## 🎯 Typical Workflow

### Day of Tournament

**Before Match:**
1. Create match with scheduled status
2. Set match date/time
3. Configure maps (Best of 3, etc.)

**During Match:**
1. Edit match
2. Change status to "Live"
3. Update map scores as they complete
4. Enter player stats after each map

**After Match:**
1. Edit match
2. Verify all scores and stats
3. Change status to "Completed"
4. System calculates final winner

## 📁 File Reference

### Database Migrations
- `supabase-match-maps-table.sql` - Map results table
- `supabase-matches-add-num-maps.sql` - Add map count field
- `supabase-map-player-stats-table.sql` - Player statistics table

### Frontend
- `app/admin/matches/page.tsx` - Complete match management

### Documentation
- `README_MATCH_SYSTEM.md` - Match & map system details
- `PLAYER_STATS_SETUP.md` - Player statistics guide
- `SETUP_INSTRUCTIONS.md` - Quick setup
- `DATABASE_CHANGES_SUMMARY.md` - Technical details
- `COMPLETE_SETUP_GUIDE.md` - This file

## 🐛 Troubleshooting

### "Failed to add matches"
- **Cause**: Database tables don't exist
- **Solution**: Run all 3 migrations in order

### No players showing
- **Cause**: No players in database
- **Solution**: Add players via `/admin/players`

### Stats not saving
- **Cause**: `map_player_stats` table missing
- **Solution**: Run player stats migration

### Wrong match score
- **Cause**: Map winners not set correctly
- **Solution**: Edit match, verify map scores

## ✅ Pre-Launch Checklist

- [ ] All 3 migrations run successfully
- [ ] Teams exist in database
- [ ] Each team has 5+ players
- [ ] Players assigned to correct teams
- [ ] Test match creation
- [ ] Test match editing
- [ ] Test player stats input
- [ ] Verify score calculations
- [ ] Check winner detection
- [ ] Test all match statuses

## 🚀 You're Ready!

Your tournament system is now complete with:
- ✅ Flexible match formats (Best of 2-5)
- ✅ Individual map tracking
- ✅ Detailed player statistics
- ✅ Automatic score calculations
- ✅ Professional admin interface

**Start by creating your first match!** 🎮🏆

