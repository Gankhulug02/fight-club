# Fight Club Tournament - Database Setup Guide

## Overview

The database has been redesigned to follow best practices by **calculating statistics from match results** instead of storing them directly in the teams table. This ensures data consistency and eliminates the need to manually update team statistics.

## Database Structure

### 📊 Tables

#### 1. **teams** (Base Table)
Stores team information only (no statistics).

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `name` | TEXT | Team name (unique) |
| `logo` | TEXT | Team logo emoji |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### 2. **matches** (Match Results)
Stores all match results between teams.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `team1_id` | BIGINT | First team (foreign key to teams) |
| `team2_id` | BIGINT | Second team (foreign key to teams) |
| `team1_score` | INTEGER | Rounds won by team 1 |
| `team2_score` | INTEGER | Rounds won by team 2 |
| `match_date` | TIMESTAMP | When the match occurred |
| `status` | TEXT | Match status (scheduled, live, completed, cancelled) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Constraints:**
- `team1_id` and `team2_id` must be different
- Scores must be non-negative
- Cascade delete: deleting a team removes all their matches

### 📊 Statistics Calculation

**Client-Side Calculation:**
- Statistics are calculated in the frontend when data is fetched
- Teams and matches are fetched separately
- JavaScript loops through matches to calculate stats for each team

**Calculation Logic:**
- A team **wins a match** if their score > opponent's score
- A team **loses a match** if their score < opponent's score
- Only **completed** matches count toward statistics
- Scheduled, live, or cancelled matches are excluded

**Benefits:**
- More efficient - no database views or functions needed
- Better control over caching and optimization
- Easier to add custom calculations and filters
- Fresh data on every fetch

## Installation Steps

### 1. Run the SQL Script

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy and paste the contents of `supabase-teams-table.sql`
5. Click **"Run"** or press `Ctrl/Cmd + Enter`

### 2. Configure Row Level Security (RLS)

The script includes RLS policies by default:

**Default Configuration:**
- ✅ Public read access (anyone can view teams and matches)
- 🔒 Authenticated write access (only logged-in users can modify data)

**For Development/Testing:**

If you want to test without authentication, uncomment the "ALTERNATIVE" section in the SQL file to enable public write access.

### 3. Verify Installation

Run these queries to verify the setup:

```sql
-- Check teams
SELECT * FROM teams;

-- Check matches
SELECT * FROM matches;

-- Check if teams have matches
SELECT 
  t.id,
  t.name,
  COUNT(m.id) as match_count
FROM teams t
LEFT JOIN matches m ON (t.id = m.team1_id OR t.id = m.team2_id)
GROUP BY t.id, t.name;

-- Verify completed matches
SELECT 
  t1.name as team1,
  t2.name as team2,
  m.team1_score,
  m.team2_score,
  m.status
FROM matches m
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
WHERE m.status = 'completed';
```

## Usage in the Application

### Fetching Teams with Statistics (Client-Side Calculation)

```typescript
// 1. Fetch teams
const { data: teamsData, error: teamsError } = await supabase
  .from("teams")
  .select("*")
  .order("name");

// 2. Fetch all completed matches
const { data: matchesData, error: matchesError } = await supabase
  .from("matches")
  .select("*")
  .eq("status", "completed");

// 3. Calculate statistics for each team
const teamsWithStats = teamsData.map((team) => {
  const teamMatches = matchesData.filter(
    (match) => match.team1_id === team.id || match.team2_id === team.id
  );

  let matches_won = 0;
  let matches_lost = 0;
  let rounds_won = 0;
  let rounds_lost = 0;

  teamMatches.forEach((match) => {
    const isTeam1 = match.team1_id === team.id;
    const teamScore = isTeam1 ? match.team1_score : match.team2_score;
    const opponentScore = isTeam1 ? match.team2_score : match.team1_score;

    if (teamScore > opponentScore) matches_won++;
    else if (teamScore < opponentScore) matches_lost++;

    rounds_won += teamScore;
    rounds_lost += opponentScore;
  });

  return { ...team, matches_won, matches_lost, rounds_won, rounds_lost };
});

// 4. Sort by matches won
teamsWithStats.sort((a, b) => b.matches_won - a.matches_won);
```

### Adding a New Team

```typescript
// Only provide name and logo
const { error } = await supabase
  .from("teams")
  .insert([{
    name: "New Team",
    logo: "🎯"
  }]);
```

### Adding a Match Result

```typescript
// Add a match to generate statistics
const { error } = await supabase
  .from("matches")
  .insert([{
    team1_id: 1,
    team2_id: 2,
    team1_score: 16,
    team2_score: 10,
    status: "completed"
  }]);
```

### Updating a Team

```typescript
// Only update name and logo (statistics are calculated automatically)
const { error } = await supabase
  .from("teams")
  .update({
    name: "Updated Team Name",
    logo: "🚀"
  })
  .eq("id", teamId);
```

## Benefits of This Approach

### ✅ Advantages

1. **Data Consistency**: Statistics are always accurate and up-to-date
2. **Single Source of Truth**: Match results drive all statistics
3. **Calculated On-Demand**: Stats calculated only when fetched, reducing database load
4. **Client-Side Control**: Full control over caching and optimization
5. **Historical Data**: Complete match history is preserved
6. **Audit Trail**: You can see exactly where stats come from
7. **Flexibility**: Easy to add new calculated metrics or filters
8. **Performance**: Only fetches data when needed, no constant view recalculation
9. **Real-time Updates**: Fresh data on every fetch without cache invalidation issues

### 📊 Calculation Details

When teams are fetched, statistics are calculated client-side:

- **Matches Won**: Count of completed matches where team's score > opponent's score
- **Matches Lost**: Count of completed matches where team's score < opponent's score
- **Rounds Won**: Sum of all rounds scored by the team in completed matches
- **Rounds Lost**: Sum of all rounds scored against the team in completed matches

### ⚡ Performance Optimization Tips

1. **Caching**: Store the calculated results in React state to avoid recalculation
2. **Memoization**: Use `React.useMemo()` to cache calculated statistics
3. **Filtering**: Only fetch completed matches to reduce data transfer
4. **Pagination**: For large datasets, implement pagination on teams
5. **Real-time Updates**: Use Supabase real-time subscriptions to update when matches change
6. **Lazy Loading**: Calculate stats only for visible teams (with virtual scrolling)

## Admin Panel Changes

The admin teams page (`/admin/teams`) has been updated:

### What Changed:
- ✅ Fetches teams and matches separately, calculates stats on-demand
- ✅ Form simplified to only name and logo (no manual stats entry)
- ✅ Add/Edit operations only modify `teams` table
- ✅ Statistics are read-only (calculated from matches on each fetch)
- ✅ Efficient client-side calculation with proper sorting

### What's Next:
To fully utilize this system, you should create:
- **Match Management Page**: To add and edit match results
- **Match History Page**: To view all matches for a team
- **Live Match Updates**: Update match scores in real-time

## Migration from Old Schema

If you previously had a `teams` table with statistics columns, this script will:
1. Create the new schema alongside the old one
2. You'll need to manually migrate data if needed
3. Consider backing up your existing data first

## Troubleshooting

### Issue: Statistics showing zero for all teams
**Solution:** Make sure you have inserted match data and that the matches have `status = 'completed'`.

### Issue: "permission denied for table teams"
**Solution:** Check your RLS policies. For development, use the public access alternative in the SQL file.

### Issue: Can't insert/update teams from frontend
**Solution:** 
1. Check if RLS is blocking you (see RLS policies section)
2. For development, enable public write access
3. For production, implement authentication

### Issue: Teams page loading slowly
**Solution:** 
1. Make sure you're only fetching completed matches
2. Consider implementing pagination for large datasets
3. Add client-side caching to avoid recalculating on every render
4. Use React.useMemo() to memoize the calculated statistics

### Issue: Statistics not updating after adding a match
**Solution:** 
1. Make sure to call `fetchTeams()` after adding/updating matches
2. Verify the match status is set to 'completed'
3. Check browser console for any fetch errors

## Next Steps

1. ✅ Run the SQL script in Supabase
2. ✅ Verify the admin teams page works
3. 📝 Create a matches admin page
4. 📝 Create a match history page
5. 📝 Add real-time match updates
6. 📝 Implement authentication for write operations

## Support

For issues or questions:
- Check Supabase logs in the Dashboard
- Review browser console for frontend errors
- Verify database schema in Supabase Table Editor

