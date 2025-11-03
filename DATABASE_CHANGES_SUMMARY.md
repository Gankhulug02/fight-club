# Database Changes Summary - Map-Based Match System

## Overview
The match system has been restructured so that **1 match = 3 map plays**. This is a common format in esports tournaments (best of 3).

## Database Structure

### New Table: `match_maps`
Each match now has 3 individual map records that track the scores for each map play.

**Schema:**
```sql
- id: Unique identifier for the map
- match_id: Foreign key to matches table
- map_number: 1, 2, or 3
- team1_score: Score for team 1 on this specific map
- team2_score: Score for team 2 on this specific map
- winner_team_id: ID of the team that won this map (NULL if tie)
- map_name: Optional name of the map
- status: scheduled, live, completed, or cancelled
```

### Updated Table: `matches`
The `team1_score` and `team2_score` in the matches table now represent:
- **Number of maps won** (0-3), not individual game scores
- These are automatically calculated based on the `match_maps` results via database triggers

## How It Works

1. **Creating Matches**: When you create matches (2-5 matches between the same teams), the system automatically creates 3 map records for each match.

2. **Editing Matches**: When editing a match, you can now:
   - Edit match details (teams, date, status)
   - Edit individual map scores (3 maps per match)
   - The overall match score is automatically calculated based on which team won more maps

3. **Automatic Score Calculation**: 
   - Database triggers automatically update the match score when map results are saved
   - If Team A wins maps 1 & 2, the match score becomes 2-0 (or 2-1 if Team B wins map 3)

## Files Created/Modified

### Created:
- `supabase-match-maps-table.sql` - Database schema for the new table

### Modified:
- `app/admin/matches/page.tsx` - Updated to handle map-based scoring

## Next Steps

### Required: Apply Database Migration
You need to run the SQL migration to create the `match_maps` table:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase-match-maps-table.sql`
4. Run the SQL script

### Optional: Update Other Pages
If you have other pages that display matches, you may want to update them to show the map-level details:
- `app/matches/page.tsx` - Public matches view
- `app/teams/[id]/page.tsx` - Team detail pages
- `app/page.tsx` - Home page

## Features

### Admin Match Management
- ✅ Create multiple matches (each with 3 maps automatically)
- ✅ Edit individual map scores
- ✅ View map-by-map results in the matches table
- ✅ Automatic calculation of overall match scores
- ✅ Winner highlighting for each map

### Display Features
- Map-by-map score breakdown in the matches table
- Visual indication of which team won each map (green highlight)
- Overall match score shows maps won (e.g., 2-1)
- Detailed editing form with all 3 maps

## Example Match Flow

1. Admin schedules 3 matches between Team A vs Team B
2. System creates:
   - 3 match records
   - 9 map records (3 maps per match)
3. Admin enters map results:
   - Match 1, Map 1: Team A 13 - Team B 7 → Winner: Team A
   - Match 1, Map 2: Team A 13 - Team B 11 → Winner: Team A
   - Match 1, Map 3: Team A 8 - Team B 13 → Winner: Team B
4. Overall Match 1 score: Team A 2 - Team B 1 (Team A won the match)

## Technical Details

### Database Triggers
- `update_match_score_from_maps()` - Automatically recalculates match scores when map results change
- Runs after INSERT, UPDATE, or DELETE on `match_maps` table

### Type Safety
All TypeScript interfaces have been updated to include:
- `MatchMap` interface for individual maps
- `MatchWithTeams` now includes `maps?: MatchMap[]`

