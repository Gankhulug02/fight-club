"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Team {
  id: number;
  name: string;
  logo: string;
  created_at?: string;
  updated_at?: string;
}

interface Match {
  id: number;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  match_date: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

interface MatchWithTeams extends Match {
  team1?: Team;
  team2?: Team;
}

interface MatchMap {
  id: number;
  match_id: number;
  map_number: number;
  team1_score: number;
  team2_score: number;
  winner_team_id: number | null;
  map_name: string | null;
  status: "scheduled" | "live" | "completed" | "cancelled";
}

interface Player {
  id: number;
  name: string;
  avatar: string;
}

interface MapPlayerStats {
  id: number;
  map_id: number;
  player_id: number;
  team_id: number;
  kills: number;
  assists: number;
  deaths: number;
  player?: Player;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedMatches, setExpandedMatches] = useState<Set<number>>(
    new Set()
  );
  const [mapsData, setMapsData] = useState<Record<number, MatchMap[]>>({});
  const [expandedMaps, setExpandedMaps] = useState<Set<number>>(new Set());
  const [playerStatsData, setPlayerStatsData] = useState<
    Record<number, MapPlayerStats[]>
  >({});
  const [loadingMaps, setLoadingMaps] = useState<Set<number>>(new Set());
  const [loadingStats, setLoadingStats] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .order("name");

      if (teamsError) throw teamsError;

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false });

      if (matchesError) throw matchesError;

      // Combine matches with team data
      const matchesWithTeams = (matchesData || []).map((match) => ({
        ...match,
        team1: teamsData?.find((t) => t.id === match.team1_id),
        team2: teamsData?.find((t) => t.id === match.team2_id),
      }));

      setMatches(matchesWithTeams);
      setError(null);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to load matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchMaps = async (matchId: number) => {
    try {
      setLoadingMaps((prev) => new Set(prev).add(matchId));

      const { data: mapsData, error: mapsError } = await supabase
        .from("match_maps")
        .select("*")
        .eq("match_id", matchId)
        .order("map_number");

      if (mapsError) throw mapsError;

      setMapsData((prev) => ({
        ...prev,
        [matchId]: mapsData || [],
      }));
    } catch (err) {
      console.error("Error fetching maps:", err);
    } finally {
      setLoadingMaps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });
    }
  };

  const fetchMapPlayerStats = async (mapId: number) => {
    try {
      setLoadingStats((prev) => new Set(prev).add(mapId));

      const { data: statsData, error: statsError } = await supabase
        .from("map_player_stats")
        .select(
          `
          *,
          player:players(id, name, avatar)
        `
        )
        .eq("map_id", mapId)
        .order("kills", { ascending: false });

      if (statsError) throw statsError;

      setPlayerStatsData((prev) => ({
        ...prev,
        [mapId]: statsData || [],
      }));
    } catch (err) {
      console.error("Error fetching player stats:", err);
    } finally {
      setLoadingStats((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mapId);
        return newSet;
      });
    }
  };

  const toggleMatchExpansion = async (matchId: number) => {
    const isExpanded = expandedMatches.has(matchId);

    if (isExpanded) {
      // Collapse
      setExpandedMatches((prev) => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });
    } else {
      // Expand
      setExpandedMatches((prev) => new Set(prev).add(matchId));

      // Fetch maps if not already fetched
      if (!mapsData[matchId]) {
        await fetchMatchMaps(matchId);
      }
    }
  };

  const toggleMapExpansion = async (mapId: number) => {
    const isExpanded = expandedMaps.has(mapId);

    if (isExpanded) {
      // Collapse
      setExpandedMaps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mapId);
        return newSet;
      });
    } else {
      // Expand
      setExpandedMaps((prev) => new Set(prev).add(mapId));

      // Fetch player stats if not already fetched
      if (!playerStatsData[mapId]) {
        await fetchMapPlayerStats(mapId);
      }
    }
  };

  // Filter matches by status
  const filteredMatches = matches.filter((match) => {
    if (statusFilter === "all") return true;
    return match.status === statusFilter;
  });

  // Group matches by status for quick stats
  const liveMatches = matches.filter((m) => m.status === "live");
  const scheduledMatches = matches.filter((m) => m.status === "scheduled");
  const completedMatches = matches.filter((m) => m.status === "completed");

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get relative time (e.g., "2 hours ago", "in 3 days")
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (Math.abs(diffMins) < 60) {
      return diffMins > 0
        ? `in ${diffMins} min${diffMins !== 1 ? "s" : ""}`
        : `${Math.abs(diffMins)} min${diffMins !== -1 ? "s" : ""} ago`;
    } else if (Math.abs(diffHours) < 24) {
      return diffHours > 0
        ? `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`
        : `${Math.abs(diffHours)} hour${diffHours !== -1 ? "s" : ""} ago`;
    } else {
      return diffDays > 0
        ? `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`
        : `${Math.abs(diffDays)} day${diffDays !== -1 ? "s" : ""} ago`;
    }
  };

  if (loading) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading matches...</div>
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
            All Matches
          </h1>
          <p className="text-gray-400">
            View all tournament matches - live, scheduled, and completed
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">⚔️</div>
            <div className="text-2xl font-bold text-white">
              {matches.length}
            </div>
            <div className="text-sm text-gray-400">Total Matches</div>
          </div>
          <div className="bg-red-900/50 backdrop-blur-sm rounded-xl p-6 border border-red-800">
            <div className="text-3xl mb-2">🔴</div>
            <div className="text-2xl font-bold text-red-400">
              {liveMatches.length}
            </div>
            <div className="text-sm text-red-300">Live Now</div>
          </div>
          <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-800">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-blue-400">
              {scheduledMatches.length}
            </div>
            <div className="text-sm text-blue-300">Scheduled</div>
          </div>
          <div className="bg-green-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-800">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-400">
              {completedMatches.length}
            </div>
            <div className="text-sm text-green-300">Completed</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            All Matches ({matches.length})
          </button>
          <button
            onClick={() => setStatusFilter("live")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "live"
                ? "bg-red-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            🔴 Live ({liveMatches.length})
          </button>
          <button
            onClick={() => setStatusFilter("scheduled")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "scheduled"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            📅 Scheduled ({scheduledMatches.length})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            ✅ Completed ({completedMatches.length})
          </button>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-400 text-lg">
                No matches found in this category.
              </p>
            </div>
          ) : (
            filteredMatches.map((match) => {
              const team1Won =
                match.status === "completed" &&
                match.team1_score > match.team2_score;
              const team2Won =
                match.status === "completed" &&
                match.team2_score > match.team1_score;
              const isDraw =
                match.status === "completed" &&
                match.team1_score === match.team2_score;

              const isMatchExpanded = expandedMatches.has(match.id);
              const matchMaps = mapsData[match.id] || [];
              const isLoadingMaps = loadingMaps.has(match.id);

              return (
                <div
                  key={match.id}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all duration-200"
                >
                  {/* Match Card - Clickable */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-900/70 transition-colors"
                    onClick={() => toggleMatchExpansion(match.id)}
                  >
                    {/* Match Header - Status and Date */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {match.status === "live" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold uppercase text-xs animate-pulse">
                            🔴 Live
                          </span>
                        )}
                        {match.status === "completed" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-bold uppercase text-xs">
                            ✅ Completed
                          </span>
                        )}
                        {match.status === "scheduled" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase text-xs">
                            📅 Scheduled
                          </span>
                        )}
                        {match.status === "cancelled" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 font-bold uppercase text-xs">
                            ❌ Cancelled
                          </span>
                        )}
                        {/* Expand/Collapse Indicator */}
                        <span className="text-gray-400 text-sm">
                          {isMatchExpanded ? "▼" : "▶"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-sm">
                          {formatDate(match.match_date)}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {getRelativeTime(match.match_date)}
                        </div>
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className="grid grid-cols-7 gap-4 items-center">
                      {/* Team 1 */}
                      <div className="col-span-3">
                        <div
                          className="flex items-center space-x-3 group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={`/teams/${match.team1_id}`}>
                            <div
                              className={`text-4xl transition-transform group-hover:scale-110 ${
                                team1Won ? "animate-bounce" : ""
                              }`}
                            >
                              {match.team1?.logo || "❓"}
                            </div>
                          </Link>
                          <div className="flex-1">
                            <Link href={`/teams/${match.team1_id}`}>
                              <div
                                className={`text-xl font-bold hover:text-blue-400 transition-colors ${
                                  team1Won
                                    ? "text-green-400"
                                    : team2Won
                                    ? "text-gray-500"
                                    : "text-white"
                                }`}
                              >
                                {match.team1?.name || "Unknown Team"}
                              </div>
                            </Link>
                            {team1Won && (
                              <div className="text-xs text-green-400 font-semibold">
                                🏆 Winner
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="col-span-1 text-center">
                        {match.status === "scheduled" ? (
                          <div className="text-gray-500 text-lg font-bold">
                            VS
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-3xl font-bold text-white">
                              {match.team1_score}
                              <span className="text-gray-600 mx-2">-</span>
                              {match.team2_score}
                            </div>
                            {isDraw && (
                              <div className="text-xs text-yellow-400 font-semibold">
                                DRAW
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Team 2 */}
                      <div className="col-span-3">
                        <div
                          className="flex items-center space-x-3 group flex-row-reverse"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={`/teams/${match.team2_id}`}>
                            <div
                              className={`text-4xl transition-transform group-hover:scale-110 ${
                                team2Won ? "animate-bounce" : ""
                              }`}
                            >
                              {match.team2?.logo || "❓"}
                            </div>
                          </Link>
                          <div className="flex-1 text-right">
                            <Link href={`/teams/${match.team2_id}`}>
                              <div
                                className={`text-xl font-bold hover:text-blue-400 transition-colors ${
                                  team2Won
                                    ? "text-green-400"
                                    : team1Won
                                    ? "text-gray-500"
                                    : "text-white"
                                }`}
                              >
                                {match.team2?.name || "Unknown Team"}
                              </div>
                            </Link>
                            {team2Won && (
                              <div className="text-xs text-green-400 font-semibold">
                                🏆 Winner
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Maps Section */}
                  {isMatchExpanded && (
                    <div className="border-t border-gray-800 bg-gray-950/50 p-6">
                      {isLoadingMaps ? (
                        <div className="text-center text-gray-400 py-4">
                          Loading maps...
                        </div>
                      ) : matchMaps.length === 0 ? (
                        <div className="text-center text-gray-400 py-4">
                          No maps data available for this match.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                            <span>🗺️</span>
                            <span>Maps Played</span>
                          </h3>
                          {matchMaps.map((map) => {
                            const isMapExpanded = expandedMaps.has(map.id);
                            const mapStats = playerStatsData[map.id] || [];
                            const isLoadingStats = loadingStats.has(map.id);
                            const mapWinnerTeam =
                              map.winner_team_id === match.team1_id
                                ? match.team1
                                : map.winner_team_id === match.team2_id
                                ? match.team2
                                : null;

                            return (
                              <div
                                key={map.id}
                                className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden"
                              >
                                {/* Map Header - Clickable */}
                                <div
                                  className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                  onClick={() => toggleMapExpansion(map.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-gray-400">
                                        {isMapExpanded ? "▼" : "▶"}
                                      </span>
                                      <span className="text-white font-medium">
                                        Map {map.map_number}
                                        {map.map_name && ` - ${map.map_name}`}
                                      </span>
                                      {map.status === "live" && (
                                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                                          LIVE
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <div className="text-white font-bold">
                                        {map.team1_score} - {map.team2_score}
                                      </div>
                                      {mapWinnerTeam && (
                                        <div className="text-sm text-green-400 flex items-center space-x-1">
                                          <span>{mapWinnerTeam.logo}</span>
                                          <span>{mapWinnerTeam.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded Player Stats */}
                                {isMapExpanded && (
                                  <div className="border-t border-gray-700 bg-black/30 p-4">
                                    {isLoadingStats ? (
                                      <div className="text-center text-gray-400 py-4">
                                        Loading player statistics...
                                      </div>
                                    ) : mapStats.length === 0 ? (
                                      <div className="text-center text-gray-400 py-4">
                                        No player statistics available for this
                                        map.
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        <h4 className="text-white font-medium text-sm mb-3">
                                          Player Statistics
                                        </h4>

                                        {/* Team 1 Players */}
                                        <div>
                                          <div className="text-xs text-gray-400 mb-2 flex items-center space-x-2">
                                            <span>{match.team1?.logo}</span>
                                            <span>{match.team1?.name}</span>
                                          </div>
                                          <div className="space-y-2">
                                            {mapStats
                                              .filter(
                                                (stat) =>
                                                  stat.team_id ===
                                                  match.team1_id
                                              )
                                              .map((stat) => (
                                                <div
                                                  key={stat.id}
                                                  className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
                                                >
                                                  <div className="flex items-center space-x-3">
                                                    <div className="text-2xl">
                                                      {stat.player?.avatar ||
                                                        "👤"}
                                                    </div>
                                                    <div>
                                                      <div className="text-white font-medium text-sm">
                                                        {stat.player?.name ||
                                                          "Unknown Player"}
                                                      </div>
                                                      <div className="text-xs text-gray-400">
                                                        K/D:{" "}
                                                        {stat.deaths > 0
                                                          ? (
                                                              stat.kills /
                                                              stat.deaths
                                                            ).toFixed(2)
                                                          : stat.kills}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex space-x-4 text-sm">
                                                    <div className="text-center">
                                                      <div className="text-green-400 font-bold">
                                                        {stat.kills}
                                                      </div>
                                                      <div className="text-xs text-gray-500">
                                                        K
                                                      </div>
                                                    </div>
                                                    <div className="text-center">
                                                      <div className="text-blue-400 font-bold">
                                                        {stat.assists}
                                                      </div>
                                                      <div className="text-xs text-gray-500">
                                                        A
                                                      </div>
                                                    </div>
                                                    <div className="text-center">
                                                      <div className="text-red-400 font-bold">
                                                        {stat.deaths}
                                                      </div>
                                                      <div className="text-xs text-gray-500">
                                                        D
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                          </div>
                                        </div>

                                        {/* Team 2 Players */}
                                        <div>
                                          <div className="text-xs text-gray-400 mb-2 flex items-center space-x-2">
                                            <span>{match.team2?.logo}</span>
                                            <span>{match.team2?.name}</span>
                                          </div>
                                          <div className="space-y-2">
                                            {mapStats
                                              .filter(
                                                (stat) =>
                                                  stat.team_id ===
                                                  match.team2_id
                                              )
                                              .map((stat) => (
                                                <div
                                                  key={stat.id}
                                                  className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
                                                >
                                                  <div className="flex items-center space-x-3">
                                                    <div className="text-2xl">
                                                      {stat.player?.avatar ||
                                                        "👤"}
                                                    </div>
                                                    <div>
                                                      <div className="text-white font-medium text-sm">
                                                        {stat.player?.name ||
                                                          "Unknown Player"}
                                                      </div>
                                                      <div className="text-xs text-gray-400">
                                                        K/D:{" "}
                                                        {stat.deaths > 0
                                                          ? (
                                                              stat.kills /
                                                              stat.deaths
                                                            ).toFixed(2)
                                                          : stat.kills}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex space-x-4 text-sm">
                                                    <div className="text-center">
                                                      <div className="text-green-400 font-bold">
                                                        {stat.kills}
                                                      </div>
                                                      <div className="text-xs text-gray-500">
                                                        K
                                                      </div>
                                                    </div>
                                                    <div className="text-center">
                                                      <div className="text-blue-400 font-bold">
                                                        {stat.assists}
                                                      </div>
                                                      <div className="text-xs text-gray-500">
                                                        A
                                                      </div>
                                                    </div>
                                                    <div className="text-center">
                                                      <div className="text-red-400 font-bold">
                                                        {stat.deaths}
                                                      </div>
                                                      <div className="text-xs text-gray-500">
                                                        D
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Message */}
        {filteredMatches.length > 0 && (
          <div className="text-center text-gray-500 text-sm mt-8">
            Showing {filteredMatches.length} of {matches.length} total matches
          </div>
        )}
      </div>
    </div>
  );
}
