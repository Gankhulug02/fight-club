"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Player {
  id: number;
  name: string;
  team_id: number;
  role: string;
  avatar: string;
  created_at?: string;
}

interface Team {
  id: number;
  name: string;
  logo: string;
}

interface PlayerStats {
  player: Player;
  team: Team | null;
  kills: number;
  assists: number;
  deaths: number;
  kd_ratio: number;
  maps_played: number;
}

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

      // Fetch all map player stats
      const { data: statsData, error: statsError } = await supabase
        .from("map_player_stats")
        .select("*");

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

  // Filter players based on search
  const filteredPlayers = playerStats.filter(
    (ps) =>
      ps.player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ps.team?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ps.player.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === "kills") return b.kills - a.kills;
    if (sortBy === "kd") return b.kd_ratio - a.kd_ratio;
    if (sortBy === "assists") return b.assists - a.assists;
    return 0;
  });

  // Calculate stats
  const totalKills = playerStats.reduce((sum, ps) => sum + ps.kills, 0);
  const totalAssists = playerStats.reduce((sum, ps) => sum + ps.assists, 0);
  const topPlayer =
    sortBy === "kills"
      ? [...playerStats].sort((a, b) => b.kills - a.kills)[0]
      : sortBy === "kd"
      ? [...playerStats].sort((a, b) => b.kd_ratio - a.kd_ratio)[0]
      : [...playerStats].sort((a, b) => b.assists - a.assists)[0];

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-black via-gray-950 to-black min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading players...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-black via-gray-950 to-black min-h-screen p-8 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-black via-gray-950 to-black min-h-screen p-8">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white">
              {playerStats.length}
            </div>
            <div className="text-sm text-gray-400">Total Players</div>
          </div>
          <div className="bg-green-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-800">
            <div className="text-3xl mb-2">💀</div>
            <div className="text-2xl font-bold text-green-400">
              {totalKills.toLocaleString()}
            </div>
            <div className="text-sm text-green-300">Total Kills</div>
          </div>
          <div className="bg-yellow-900/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-800">
            <div className="text-3xl mb-2">🤝</div>
            <div className="text-2xl font-bold text-yellow-400">
              {totalAssists.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-300">Total Assists</div>
          </div>
          <div className="bg-purple-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-800">
            <div className="text-3xl mb-2">👑</div>
            <div className="text-2xl font-bold text-purple-400 flex items-center gap-2">
              {topPlayer ? (
                <>
                  <span>{topPlayer.player.avatar}</span>
                  <span className="text-lg truncate">
                    {topPlayer.player.name}
                  </span>
                </>
              ) : (
                <span className="text-gray-500 text-sm">No data</span>
              )}
            </div>
            <div className="text-sm text-purple-300">
              Top by {sortBy === "kd" ? "K/D" : sortBy}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search players, teams, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Sort Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("kills")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === "kills"
                    ? "bg-green-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                💀 Kills
              </button>
              <button
                onClick={() => setSortBy("kd")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === "kd"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                📊 K/D
              </button>
              <button
                onClick={() => setSortBy("assists")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === "assists"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                🤝 Assists
              </button>
            </div>
          </div>
        </div>

        {/* Players Grid/List */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/50 border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Maps
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Kills
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Assists
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Deaths
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    K/D
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sortedPlayers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      <div className="text-6xl mb-4">🎮</div>
                      <p className="text-lg">
                        {searchQuery
                          ? "No players found matching your search."
                          : "No players yet. Check back later!"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  sortedPlayers.map((ps, index) => {
                    const isTopThree = index < 3;
                    const rankIcons = ["🥇", "🥈", "🥉"];

                    return (
                      <tr
                        key={ps.player.id}
                        className="hover:bg-gray-800/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-white">
                            {isTopThree ? (
                              <span className="text-2xl">{rankIcons[index]}</span>
                            ) : (
                              <span className="text-gray-400">#{index + 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{ps.player.avatar}</span>
                            <div>
                              <div className="text-lg font-semibold text-white">
                                {ps.player.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {ps.team ? (
                            <Link
                              href={`/teams/${ps.team.id}`}
                              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                            >
                              <span className="text-2xl">{ps.team.logo}</span>
                              <span className="text-white hover:text-blue-400 transition-colors">
                                {ps.team.name}
                              </span>
                            </Link>
                          ) : (
                            <span className="text-gray-500">No team</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-300">{ps.player.role}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-blue-400 font-semibold">
                            {ps.maps_played}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-green-400 font-bold text-lg">
                            {ps.kills}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-yellow-400 font-bold text-lg">
                            {ps.assists}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-red-400 font-bold text-lg">
                            {ps.deaths}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-base ${
                              ps.kd_ratio >= 1.5
                                ? "bg-green-500/20 text-green-400"
                                : ps.kd_ratio >= 1.0
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-orange-500/20 text-orange-400"
                            }`}
                          >
                            {ps.kd_ratio.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

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
