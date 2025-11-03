# Setup Instructions - Match & Map System

## ✅ What Changed

The system now supports **flexible match formats**:
- Each **match** can have **2-5 maps** (Best of 2, Best of 3, Best of 5, etc.)
- Map results are tracked individually
- Match scores represent **maps won**, not game points

## 🔧 Required Database Setup

You need to run **TWO SQL migrations** in your Supabase database:

### Step 1: Create the `match_maps` table

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase-match-maps-table.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 2: Add `num_maps` column to `matches` table

1. In the same SQL Editor
2. Click **New Query**
3. Copy and paste the contents of `supabase-matches-add-num-maps.sql`
4. Click **Run**

## ✨ New Features

### For Administrators

1. **Schedule Matches** with flexible formats:
   - Choose number of matches (2-5)
   - Choose maps per match (2-5)
   - Example: Create 3 matches with Best of 5 format = 15 total maps

2. **Edit Match Results**:
   - Edit each map's individual scores
   - System automatically calculates overall match score
   - Winner is determined by maps won

3. **View Match Details**:
   - See map-by-map breakdown in the table
   - Winning team highlighted in green for each map

## 📊 How It Works

### Example: Best of 3 Match

**Creating a Match:**
- Admin schedules 2 matches with 3 maps each
- System creates:
  - 2 match records (with `num_maps = 3`)
  - 6 map records (3 maps per match)

**Entering Results:**
- Match 1:
  - Map 1: Team A 13 - Team B 7 → Winner: Team A
  - Map 2: Team A 13 - Team B 11 → Winner: Team A  
  - Map 3: Team A 8 - Team B 13 → Winner: Team B
- **Overall:** Team A 2 - Team B 1 (Team A won the match)

**Database Updates:**
- Each map stores its own scores
- Match score is automatically calculated: Team A won 2 maps, Team B won 1
- The match table shows: `team1_score = 2, team2_score = 1`

## 🎮 Match Formats Supported

- **Best of 2**: 2 maps per match
- **Best of 3**: 3 maps per match (most common in esports)
- **Best of 4**: 4 maps per match
- **Best of 5**: 5 maps per match (championship format)

## 📁 Files Modified

### Database Schema:
- `supabase-match-maps-table.sql` - New table for map results
- `supabase-matches-add-num-maps.sql` - Add num_maps column

### Frontend:
- `app/admin/matches/page.tsx` - Full match & map management

## 🚀 Next Steps

After running the migrations:

1. ✅ Test creating matches with different formats
2. ✅ Test editing map results
3. ✅ Verify automatic score calculations

Optional improvements:
- Update public match pages to show map details
- Add map names (e.g., "Dust2", "Mirage") 
- Add statistics based on map performance

## 🐛 Troubleshooting

**Error: "Failed to add matches"**
- Make sure you ran both SQL migrations
- Check Supabase logs for specific error messages
- Verify RLS policies allow inserts

**Maps not showing**
- Refresh the page after creating matches
- Check browser console for errors
- Verify `match_maps` table exists in your database

## 📞 Need Help?

Check the browser console (F12) for detailed error messages if something doesn't work.

