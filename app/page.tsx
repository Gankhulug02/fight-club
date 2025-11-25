"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  HomeStatsOverview,
  LeaderboardTable,
  type Team,
  type Match,
  type MatchMap,
} from "@/components/home";

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamsWithStats();
  }, []);

  const fetchTeamsWithStats = async () => {
    try {
      setLoading(true);

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .order("name");

      if (teamsError) throw teamsError;

      // Fetch all completed matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "completed");

      if (matchesError) throw matchesError;

      // Fetch all match maps
      const { data: mapsData, error: mapsError } = await supabase
        .from("match_maps")
        .select("*");

      if (mapsError) throw mapsError;

      // Calculate statistics for each team
      const teamsWithStats = (teamsData || []).map((team) => {
        const teamMatches = (matchesData || []).filter(
          (match: Match) =>
            match.team1_id === team.id || match.team2_id === team.id
        );

        let matches_won = 0;
        let matches_lost = 0;
        let rounds_won = 0;
        let rounds_lost = 0;

        teamMatches.forEach((match: Match) => {
          const isTeam1 = match.team1_id === team.id;
          const teamMapsWon = isTeam1 ? match.team1_score : match.team2_score;
          const opponentMapsWon = isTeam1
            ? match.team2_score
            : match.team1_score;

          // Count match result (based on maps won)
          if (teamMapsWon > opponentMapsWon) {
            matches_won++;
          } else if (teamMapsWon < opponentMapsWon) {
            matches_lost++;
          }

          // Count rounds from individual maps for this match
          const matchMaps = (mapsData || []).filter(
            (map: MatchMap) => map.match_id === match.id
          );

          matchMaps.forEach((map: MatchMap) => {
            const teamRounds = isTeam1 ? map.team1_score : map.team2_score;
            const opponentRounds = isTeam1 ? map.team2_score : map.team1_score;

            rounds_won += teamRounds;
            rounds_lost += opponentRounds;
          });
        });

        return {
          ...team,
          matches_won,
          matches_lost,
          rounds_won,
          rounds_lost,
        };
      });

      setTeams(teamsWithStats);
      setError(null);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Memoized sorted teams by matches won first, then round difference (descending)
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      // First sort by matches won (descending)
      if (b.matches_won !== a.matches_won) {
        return b.matches_won - a.matches_won;
      }
      // Then sort by round difference (descending)
      const diffA = a.rounds_won - a.rounds_lost;
      const diffB = b.rounds_won - b.rounds_lost;
      return diffB - diffA;
    });
  }, [teams]);

  if (loading) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className=" p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Tournament Leaderboard
          </h2>
          <p className="text-gray-400">Season 2025 - Live Rankings</p>
        </div>

        {/* Leaderboard Card */}
        <LeaderboardTable teams={sortedTeams} />

        {/* Stats Summary */}
        <HomeStatsOverview
          teams={teams}
          leadingTeam={sortedTeams.length > 0 ? sortedTeams[0] : null}
        />
      </div>
    </div>
  );
}
