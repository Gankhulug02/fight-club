# Match & Map System - Complete Guide

## 🎯 System Overview

Your Fight Club tournament now uses a **two-tier structure**:

```
MATCHES
├── Match 1 (Best of 3)
│   ├── Map 1
│   ├── Map 2
│   └── Map 3
├── Match 2 (Best of 5)
│   ├── Map 1
│   ├── Map 2
│   ├── Map 3
│   ├── Map 4
│   └── Map 5
```

### Key Concepts

- **Match** = A series between two teams
- **Map** = Individual game/round within a match
- **Match Score** = Number of maps won by each team (e.g., 2-1)
- **Map Score** = Points/kills within a single map (e.g., 13-7)

---

## 🔧 SETUP REQUIRED

### ⚠️ You MUST run these SQL commands first!

The system won't work until you create the database tables.

#### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)

#### Step 2: Run Migration #1 - Create match_maps table
1. Click **New Query**
2. Copy ALL contents from: `supabase-match-maps-table.sql`
3. Paste into editor
4. Click **Run** button

#### Step 3: Run Migration #2 - Add num_maps column
1. Click **New Query**
2. Copy ALL contents from: `supabase-matches-add-num-maps.sql`
3. Paste into editor
4. Click **Run** button

#### Step 4: Verify Setup
After running both migrations, verify:
```sql
-- Check if match_maps table exists
SELECT * FROM match_maps LIMIT 1;

-- Check if num_maps column exists
SELECT id, team1_id, team2_id, num_maps FROM matches LIMIT 1;
```

---

## 📋 Database Schema

### `matches` Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Unique match ID |
| team1_id | bigint | First team |
| team2_id | bigint | Second team |
| team1_score | integer | Maps won by team 1 (0-5) |
| team2_score | integer | Maps won by team 2 (0-5) |
| match_date | timestamp | When the match is scheduled |
| **num_maps** | **integer** | **Number of maps (2-5)** |
| status | varchar | scheduled/live/completed/cancelled |

### `match_maps` Table (NEW)
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Unique map ID |
| match_id | bigint | Parent match |
| map_number | integer | Map sequence (1-5) |
| team1_score | integer | Team 1 score on this map |
| team2_score | integer | Team 2 score on this map |
| winner_team_id | bigint | Which team won this map |
| map_name | varchar | Optional (e.g., "Dust2") |
| status | varchar | scheduled/live/completed/cancelled |

---

## 🎮 How to Use

### Creating Matches

1. Go to `/admin/matches`
2. Click **"+ Schedule Matches (2-5)"**
3. Fill in the form:
   - **Select both teams**
   - **Number of Matches**: How many matches to create (2-5)
   - **Maps Per Match**: How many maps in each match (2-5)
   - **Match Date**: When the matches will be played
   - **Status**: Usually "Scheduled"

**Example Configuration:**
```
Teams: Phoenix Warriors vs Dragon Slayers
Number of Matches: 3
Maps Per Match: 3 (Best of 3)
Result: Creates 3 matches, each with 3 maps = 9 total maps
```

### Editing Match Results

1. Find the match in the table
2. Click **"Edit"** button
3. You'll see:
   - Match details (teams, date, status)
   - All maps for that match
   - Individual score inputs for each map

4. **Enter scores for each map:**
   ```
   Map 1: Team A: 13, Team B: 7
   Map 2: Team A: 13, Team B: 11
   Map 3: Team A: 8, Team B: 13
   ```

5. Click **"Update Match & Maps"**
6. System automatically calculates:
   - Winner of each map
   - Overall match score (2-1 in this example)

---

## 🔄 Automatic Features

### Auto-calculated Match Scores

The database automatically updates match scores when you save map results:

- **Trigger**: Runs when any map is added/updated/deleted
- **Function**: `update_match_score_from_maps()`
- **Result**: Counts how many maps each team won

**Example:**
```
Map 1: Winner = Team A
Map 2: Winner = Team A
Map 3: Winner = Team B
→ Match Score: Team A: 2, Team B: 1
```

### Winner Detection

For each map:
- If `team1_score > team2_score` → Winner = Team 1
- If `team2_score > team1_score` → Winner = Team 2
- If scores are equal → No winner (NULL)

---

## 🎨 UI Features

### Match Table Display
- **Overall Score**: Shows maps won (e.g., "2-1")
- **Map Breakdown**: Shows each map's score
- **Winner Highlighting**: Winning team's score is **green**

### Create Form
- Dropdown to select teams
- Choose number of matches (2-5)
- Choose maps per match (2-5)
- Live preview of total maps to be created

### Edit Form
- Separate inputs for each map
- Real-time winner calculation
- Overall match score preview
- Individual map status tracking

---

## 📊 Match Formats

| Format | Maps | Win Condition | Use Case |
|--------|------|---------------|----------|
| Best of 2 | 2 | First to 2 or draw | Quick matches |
| **Best of 3** | **3** | **First to 2** | **Most common** |
| Best of 4 | 4 | First to 3 or draw | Extended series |
| Best of 5 | 5 | First to 3 | Finals, championships |

---

## 🐛 Troubleshooting

### Error: "Failed to add matches"

**Cause**: Database tables don't exist

**Solution**: 
1. Run both SQL migration files (see SETUP section)
2. Verify tables exist in Supabase dashboard
3. Check browser console (F12) for detailed error

### Maps not showing up

**Cause**: Maps weren't created or fetch failed

**Solution**:
1. Check browser console for errors
2. Verify `match_maps` table has data:
   ```sql
   SELECT * FROM match_maps;
   ```
3. Refresh the page

### Scores not calculating

**Cause**: Database trigger not working

**Solution**:
1. Verify trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'update_match_score_after_map_update';
   ```
2. Re-run the migration file if missing

### RLS Policy Errors

**Cause**: Row Level Security blocking operations

**Solution**:
The migration includes public policies, but verify:
```sql
SELECT * FROM pg_policies WHERE tablename = 'match_maps';
```

---

## 📁 File Reference

### Database Files
- `supabase-match-maps-table.sql` - Creates match_maps table
- `supabase-matches-add-num-maps.sql` - Adds num_maps column

### Frontend Files
- `app/admin/matches/page.tsx` - Admin match management

### Documentation
- `SETUP_INSTRUCTIONS.md` - Quick setup guide
- `DATABASE_CHANGES_SUMMARY.md` - Technical details
- `README_MATCH_SYSTEM.md` - This file

---

## 🚀 Future Enhancements

Possible improvements:
- [ ] Add map names (Dust2, Mirage, etc.)
- [ ] Track player performance per map
- [ ] Add map selection/ban phase
- [ ] Show map statistics
- [ ] Add live score updates
- [ ] Export match results
- [ ] Match history per team

---

## ✅ Quick Checklist

Before using the system:
- [ ] Ran `supabase-match-maps-table.sql`
- [ ] Ran `supabase-matches-add-num-maps.sql`
- [ ] Verified both tables exist in database
- [ ] Tested creating a match
- [ ] Tested editing map results
- [ ] Verified scores calculate correctly

---

**Need Help?** Check the browser console (F12 → Console tab) for detailed error messages.

