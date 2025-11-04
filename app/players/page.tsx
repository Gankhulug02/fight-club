"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  StatsOverview,
  LeaderboardControls,
  PlayersTable,
  type PlayerStats,
} from "@/components/players";

export default function PlayersPage() {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"kills" | "kd" | "assists">("kills");

  useEffect(() => {
    fetchPlayerStats();
  }, []);

  const fetchPlayerStats = async () => {
    try {
      setLoading(true);

      // Fetch all players
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .order("name");

      if (playersError) throw playersError;

      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*");

      if (teamsError) throw teamsError;

      // Fetch map player stats only from completed matches
      const { data: statsData, error: statsError } = await supabase
        .from("map_player_stats")
        .select(
          `
          *,
          match_maps!inner (
            id,
            matches!inner (
              status
            )
          )
        `
        )
        .eq("match_maps.status", "completed");

      if (statsError) throw statsError;

      // Aggregate stats for each player
      const playersWithStats: PlayerStats[] = (playersData || []).map(
        (player) => {
          const playerMapStats = (statsData || []).filter(
            (stat) => stat.player_id === player.id
          );

          const totalKills = playerMapStats.reduce(
            (sum, stat) => sum + (stat.kills || 0),
            0
          );
          const totalAssists = playerMapStats.reduce(
            (sum, stat) => sum + (stat.assists || 0),
            0
          );
          const totalDeaths = playerMapStats.reduce(
            (sum, stat) => sum + (stat.deaths || 0),
            0
          );
          const kdRatio =
            totalDeaths > 0 ? totalKills / totalDeaths : totalKills;

          const team = (teamsData || []).find((t) => t.id === player.team_id);

          return {
            player,
            team: team || null,
            kills: totalKills,
            assists: totalAssists,
            deaths: totalDeaths,
            kd_ratio: kdRatio,
            maps_played: playerMapStats.length,
          };
        }
      );

      setPlayerStats(playersWithStats);
      setError(null);
    } catch (err) {
      console.error("Error fetching player stats:", err);
      setError("Failed to load players. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered and sorted players
  const sortedPlayers = useMemo(() => {
    const filtered = playerStats.filter(
      (ps) =>
        ps.player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ps.team?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ps.player.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "kills") return b.kills - a.kills;
      if (sortBy === "kd") return b.kd_ratio - a.kd_ratio;
      if (sortBy === "assists") return b.assists - a.assists;
      return 0;
    });
  }, [playerStats, searchQuery, sortBy]);

  // Memoized aggregate stats
  const stats = useMemo(() => {
    const totalKills = playerStats.reduce((sum, ps) => sum + ps.kills, 0);
    const totalAssists = playerStats.reduce((sum, ps) => sum + ps.assists, 0);

    const topPlayer =
      sortBy === "kills"
        ? [...playerStats].sort((a, b) => b.kills - a.kills)[0]
        : sortBy === "kd"
        ? [...playerStats].sort((a, b) => b.kd_ratio - a.kd_ratio)[0]
        : [...playerStats].sort((a, b) => b.assists - a.assists)[0];

    return { totalKills, totalAssists, topPlayer };
  }, [playerStats, sortBy]);

  if (loading) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading players...</div>
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
    <div className=" min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Player Leaderboard
          </h1>
          <p className="text-gray-400">
            View all players and their tournament statistics
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview
          totalPlayers={playerStats.length}
          totalKills={stats.totalKills}
          totalAssists={stats.totalAssists}
          topPlayer={stats.topPlayer}
          sortBy={sortBy}
        />

        {/* Controls */}
        <LeaderboardControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Players Table */}
        <PlayersTable players={sortedPlayers} searchQuery={searchQuery} />

        {/* Footer */}
        {sortedPlayers.length > 0 && (
          <div className="text-center text-gray-500 text-sm">
            Showing {sortedPlayers.length} of {playerStats.length} total players
          </div>
        )}
      </div>
    </div>
  );
}
