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

interface Player {
  id: number;
  name: string;
  team_id: number;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

interface MapPlayerStats {
  id?: number;
  map_id: number;
  player_id: number;
  team_id: number;
  kills: number;
  assists: number;
  deaths: number;
  player?: Player;
}

interface MatchMap {
  id: number;
  match_id: number;
  map_number: number;
  team1_score: number;
  team2_score: number;
  winner_team_id: number | null;
  map_name?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string;
  player_stats?: MapPlayerStats[];
}

interface Match {
  id: number;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  match_date: string;
  num_maps: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

interface MatchWithTeams extends Match {
  team1?: Team;
  team2?: Team;
  maps?: MatchMap[];
}

interface MatchFormData {
  team1_id: string;
  team2_id: string;
  team1_score: string;
  team2_score: string;
  match_date: string;
  status: string;
}

interface BulkMatchFormData {
  team1_id: string;
  team2_id: string;
  match_date: string;
  status: string;
  number_of_matches: number;
  maps_per_match: number;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchWithTeams | null>(null);
  const [formData, setFormData] = useState<MatchFormData>({
    team1_id: "",
    team2_id: "",
    team1_score: "0",
    team2_score: "0",
    match_date: "",
    status: "scheduled",
  });
  const [bulkFormData, setBulkFormData] = useState<BulkMatchFormData>({
    team1_id: "",
    team2_id: "",
    match_date: "",
    status: "scheduled",
    number_of_matches: 1,
    maps_per_match: 2,
  });
  const [editingMaps, setEditingMaps] = useState<MatchMap[]>([]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .order("name");

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .order("name");

      if (playersError) throw playersError;
      setPlayers(playersData || []);

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false });

      if (matchesError) throw matchesError;

      // Fetch all match maps
      const { data: mapsData, error: mapsError } = await supabase
        .from("match_maps")
        .select("*")
        .order("map_number");

      if (mapsError) throw mapsError;

      // Fetch all player stats
      const { data: playerStatsData, error: playerStatsError } = await supabase
        .from("map_player_stats")
        .select("*");

      if (playerStatsError) throw playerStatsError;

      // Combine maps with player stats
      const mapsWithStats = (mapsData || []).map((map) => ({
        ...map,
        player_stats: (playerStatsData || [])
          .filter((stat) => stat.map_id === map.id)
          .map((stat) => ({
            ...stat,
            player: playersData?.find((p) => p.id === stat.player_id),
          })),
      }));

      // Combine matches with team data and maps
      const matchesWithTeams = (matchesData || []).map((match) => ({
        ...match,
        team1: teamsData?.find((t) => t.id === match.team1_id),
        team2: teamsData?.find((t) => t.id === match.team2_id),
        maps: mapsWithStats.filter((map) => map.match_id === match.id),
      }));

      setMatches(matchesWithTeams);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add multiple matches (bulk) - same teams, multiple matches
  const handleAddBulkMatches = async () => {
    // Validate teams
    if (!bulkFormData.team1_id || !bulkFormData.team2_id) {
      alert("Please select both teams");
      return;
    }

    if (bulkFormData.team1_id === bulkFormData.team2_id) {
      alert("Teams must be different");
      return;
    }

    if (!bulkFormData.match_date) {
      alert("Please select a match date for all matches");
      return;
    }

    try {
      // Create multiple matches between the same two teams
      const matchesToInsert = Array(bulkFormData.number_of_matches)
        .fill(null)
        .map(() => ({
          team1_id: parseInt(bulkFormData.team1_id),
          team2_id: parseInt(bulkFormData.team2_id),
          team1_score: 0,
          team2_score: 0,
          match_date: bulkFormData.match_date,
          num_maps: bulkFormData.maps_per_match,
          status: "completed",
        }));

      const { data: createdMatches, error: matchError } = await supabase
        .from("matches")
        .insert(matchesToInsert)
        .select();

      if (matchError) throw matchError;

      // Create the specified number of maps for each match
      const mapsToInsert = (createdMatches || []).flatMap((match) =>
        Array(bulkFormData.maps_per_match)
          .fill(null)
          .map((_, index) => ({
            match_id: match.id,
            map_number: index + 1,
            team1_score: 0,
            team2_score: 0,
            winner_team_id: null,
            status: "completed",
          }))
      );

      const { error: mapsError } = await supabase
        .from("match_maps")
        .insert(mapsToInsert);

      if (mapsError) throw mapsError;

      // Reset form
      setBulkFormData({
        team1_id: "",
        team2_id: "",
        match_date: "",
        status: "completed",
        number_of_matches: 1,
        maps_per_match: 3,
      });
      setShowAddForm(false);
      await fetchData();
      alert(
        `${matchesToInsert.length} matches scheduled successfully (${mapsToInsert.length} maps total)!`
      );
    } catch (err) {
      console.error("Error adding matches:", err);
      alert("Failed to add matches. Please try again.");
    }
  };

  // Update match
  const handleUpdateMatch = async () => {
    if (!editingMatch) return;

    setIsUpdating(true);
    try {
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          team1_id: parseInt(formData.team1_id),
          team2_id: parseInt(formData.team2_id),
          match_date: formData.match_date,
          num_maps: editingMaps.length,
          status: "completed",
        })
        .eq("id", editingMatch.id);

      if (matchError) throw matchError;

      // Update each map's scores and determine winner
      for (const map of editingMaps) {
        const winnerId =
          map.team1_score > map.team2_score
            ? parseInt(formData.team1_id)
            : map.team2_score > map.team1_score
            ? parseInt(formData.team2_id)
            : null;

        const { error: mapError } = await supabase
          .from("match_maps")
          .update({
            team1_score: map.team1_score,
            team2_score: map.team2_score,
            winner_team_id: winnerId,
            map_name: map.map_name || null,
            status: "completed",
          })
          .eq("id", map.id);

        if (mapError) throw mapError;

        // Update or insert player stats for this map
        if (map.player_stats && map.player_stats.length > 0) {
          for (const playerStat of map.player_stats) {
            if (playerStat.id) {
              // Update existing stat
              const { error: statError } = await supabase
                .from("map_player_stats")
                .update({
                  kills: playerStat.kills,
                  assists: playerStat.assists,
                  deaths: playerStat.deaths,
                })
                .eq("id", playerStat.id);

              if (statError) throw statError;
            } else {
              // Insert new stat
              const { error: statError } = await supabase
                .from("map_player_stats")
                .insert({
                  map_id: map.id,
                  player_id: playerStat.player_id,
                  team_id: playerStat.team_id,
                  kills: playerStat.kills,
                  assists: playerStat.assists,
                  deaths: playerStat.deaths,
                });

              if (statError) throw statError;
            }
          }
        }
      }

      setEditingMatch(null);
      setEditingMaps([]);
      setFormData({
        team1_id: "",
        team2_id: "",
        team1_score: "0",
        team2_score: "0",
        match_date: "",
        status: "completed",
      });
      setShowAddForm(false);
      await fetchData();
      alert("Match, maps, and player stats updated successfully!");
    } catch (err) {
      console.error("Error updating match:", err);
      alert("Failed to update match. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete match
  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm("Are you sure you want to delete this match?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", matchId);

      if (error) throw error;

      await fetchData();
      alert("Match deleted successfully!");
    } catch (err) {
      console.error("Error deleting match:", err);
      alert("Failed to delete match. Please try again.");
    }
  };

  // Start editing
  const startEditMatch = (match: MatchWithTeams) => {
    setEditingMatch(match);
    setFormData({
      team1_id: match.team1_id.toString(),
      team2_id: match.team2_id.toString(),
      team1_score: match.team1_score.toString(),
      team2_score: match.team2_score.toString(),
      match_date: match.match_date,
      status: match.status,
    });

    // Load map data for editing and initialize player stats if needed
    const mapsWithStats = (match.maps || []).map((map) => {
      // Get players for both teams
      const team1Players = players
        .filter((p) => p.team_id === match.team1_id)
        .slice(0, 5);
      const team2Players = players
        .filter((p) => p.team_id === match.team2_id)
        .slice(0, 5);

      // Initialize player stats if they don't exist
      const existingStats = map.player_stats || [];
      const allPlayerStats: MapPlayerStats[] = [];

      // Add team 1 players
      team1Players.forEach((player) => {
        const existing = existingStats.find((s) => s.player_id === player.id);
        allPlayerStats.push(
          existing || {
            map_id: map.id,
            player_id: player.id,
            team_id: match.team1_id,
            kills: 0,
            assists: 0,
            deaths: 0,
            player,
          }
        );
      });

      // Add team 2 players
      team2Players.forEach((player) => {
        const existing = existingStats.find((s) => s.player_id === player.id);
        allPlayerStats.push(
          existing || {
            map_id: map.id,
            player_id: player.id,
            team_id: match.team2_id,
            kills: 0,
            assists: 0,
            deaths: 0,
            player,
          }
        );
      });

      return {
        ...map,
        player_stats: allPlayerStats,
      };
    });

    setEditingMaps(mapsWithStats);
    setShowAddForm(true);

    // Scroll to bottom after a brief delay to allow form to render
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  // Delete map from match
  const handleDeleteMap = async (mapId: number) => {
    if (editingMaps.length <= 2) {
      alert("Cannot delete map. Minimum 2 maps required per match.");
      return;
    }

    if (!confirm("Are you sure you want to delete this map?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("match_maps")
        .delete()
        .eq("id", mapId);

      if (error) throw error;

      // Remove from local state
      setEditingMaps(editingMaps.filter((map) => map.id !== mapId));
      alert("Map deleted successfully!");
    } catch (err) {
      console.error("Error deleting map:", err);
      alert("Failed to delete map. Please try again.");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingMatch(null);
    setShowAddForm(false);
    setEditingMaps([]);
    setFormData({
      team1_id: "",
      team2_id: "",
      team1_score: "0",
      team2_score: "0",
      match_date: "",
      status: "scheduled",
    });
    setBulkFormData({
      team1_id: "",
      team2_id: "",
      match_date: "",
      status: "scheduled",
      number_of_matches: 1,
      maps_per_match: 2,
    });
  };

  // Filter matches
  const filteredMatches = matches.filter((match) => {
    const matchesStatus =
      statusFilter === "all" || match.status === statusFilter;
    const matchesSearch =
      match.team1?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.team2?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const liveMatches = matches.filter((m) => m.status === "live").length;
  const scheduledMatches = matches.filter(
    (m) => m.status === "scheduled"
  ).length;
  const completedMatches = matches.filter(
    (m) => m.status === "completed"
  ).length;

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

  if (loading) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Link
                href="/admin"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Admin
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Match Management
            </h1>
            <p className="text-gray-400">
              Manage all matches in Fight Club Tournament
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={() => {
                const newShowState = !showAddForm;
                setShowAddForm(newShowState);
                if (editingMatch) cancelEdit();

                // Scroll to bottom when opening the form
                if (newShowState) {
                  setTimeout(() => {
                    window.scrollTo({
                      top: document.documentElement.scrollHeight,
                      behavior: "smooth",
                    });
                  }, 100);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              + Schedule Match
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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
            <div className="text-2xl font-bold text-red-400">{liveMatches}</div>
            <div className="text-sm text-red-300">Live Now</div>
          </div>
          <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-800">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-blue-400">
              {scheduledMatches}
            </div>
            <div className="text-sm text-blue-300">Scheduled</div>
          </div>
          <div className="bg-green-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-800">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-400">
              {completedMatches}
            </div>
            <div className="text-sm text-green-300">Completed</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setStatusFilter("live")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "live"
                ? "bg-red-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            Live ({liveMatches})
          </button>
          <button
            onClick={() => setStatusFilter("scheduled")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "scheduled"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            Scheduled ({scheduledMatches})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            Completed ({completedMatches})
          </button>
        </div>

        {/* Matches Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {statusFilter === "all"
                  ? "All Matches"
                  : `${
                      statusFilter.charAt(0).toUpperCase() +
                      statusFilter.slice(1)
                    } Matches`}{" "}
                ({filteredMatches.length})
              </h2>
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/50 border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Match
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredMatches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      {searchQuery
                        ? "No matches found matching your search."
                        : "No matches yet. Schedule one to get started!"}
                    </td>
                  </tr>
                ) : (
                  filteredMatches.map((match) => (
                    <tr
                      key={match.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{match.team1?.logo}</span>
                            <span className="text-white font-semibold">
                              {match.team1?.name || "Unknown Team"}
                            </span>
                          </div>
                          <div className="text-gray-500 text-sm">vs</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{match.team2?.logo}</span>
                            <span className="text-white font-semibold">
                              {match.team2?.name || "Unknown Team"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">
                          {formatDate(match.match_date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="space-y-2">
                          <div className="text-white font-bold text-lg mb-2">
                            {match.team1_score}-{match.team2_score}
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            {match.maps && match.maps.length > 0 ? (
                              match.maps.map((map) => (
                                <div
                                  key={map.id}
                                  className="flex justify-center items-center space-x-2"
                                >
                                  <span className="text-gray-500">
                                    Map {map.map_number}:
                                  </span>
                                  <span
                                    className={
                                      map.winner_team_id === match.team1_id
                                        ? "text-green-400 font-semibold"
                                        : "text-gray-400"
                                    }
                                  >
                                    {map.team1_score}
                                  </span>
                                  <span className="text-gray-500">-</span>
                                  <span
                                    className={
                                      map.winner_team_id === match.team2_id
                                        ? "text-green-400 font-semibold"
                                        : "text-gray-400"
                                    }
                                  >
                                    {map.team2_score}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500">No map data</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {match.status === "live" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold uppercase text-sm">
                            🔴 Live
                          </span>
                        )}
                        {match.status === "completed" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-bold uppercase text-sm">
                            ✅ Completed
                          </span>
                        )}
                        {match.status === "scheduled" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase text-sm">
                            📅 Scheduled
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => startEditMatch(match)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMatch(match.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule/Edit Match Form */}
        {showAddForm && !editingMatch && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Schedule Match
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Create one or more matches between two teams with 2-5 maps each
            </p>

            {/* Team Selection */}
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Teams</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Team 1 <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={bulkFormData.team1_id}
                    onChange={(e) =>
                      setBulkFormData({
                        ...bulkFormData,
                        team1_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.logo} {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Team 2 <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={bulkFormData.team2_id}
                    onChange={(e) =>
                      setBulkFormData({
                        ...bulkFormData,
                        team2_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.logo} {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Match Day Settings */}
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">
                Match Day Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Number of Matches <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={bulkFormData.number_of_matches}
                    onChange={(e) =>
                      setBulkFormData({
                        ...bulkFormData,
                        number_of_matches: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1 Match</option>
                    <option value={2}>2 Matches</option>
                    <option value={3}>3 Matches</option>
                    <option value={4}>4 Matches</option>
                    <option value={5}>5 Matches</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Maps Per Match <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={bulkFormData.maps_per_match}
                    onChange={(e) =>
                      setBulkFormData({
                        ...bulkFormData,
                        maps_per_match: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={2}>2 Maps (Best of 2) - Default</option>
                    <option value={3}>3 Maps (Best of 3)</option>
                    <option value={4}>4 Maps (Best of 4)</option>
                    <option value={5}>5 Maps (Best of 5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Match Date & Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={bulkFormData.match_date}
                    onChange={(e) =>
                      setBulkFormData({
                        ...bulkFormData,
                        match_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                {/* <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Status
                  </label>
                  <select
                    value={bulkFormData.status}
                    onChange={(e) =>
                      setBulkFormData({
                        ...bulkFormData,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div> */}
              </div>
            </div>

            {/* Preview */}
            {bulkFormData.team1_id && bulkFormData.team2_id && (
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
                <div className="flex flex-col space-y-2 text-blue-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">ℹ️</span>
                    <span>
                      This will create{" "}
                      <strong>
                        {bulkFormData.number_of_matches}{" "}
                        {bulkFormData.number_of_matches === 1
                          ? "match"
                          : "matches"}
                      </strong>{" "}
                      between{" "}
                      <strong>
                        {
                          teams.find(
                            (t) => t.id === parseInt(bulkFormData.team1_id)
                          )?.name
                        }
                      </strong>{" "}
                      and{" "}
                      <strong>
                        {
                          teams.find(
                            (t) => t.id === parseInt(bulkFormData.team2_id)
                          )?.name
                        }
                      </strong>
                    </span>
                  </div>
                  <div className="text-sm ml-7">
                    {bulkFormData.number_of_matches === 1
                      ? "The match"
                      : "Each match"}{" "}
                    will have{" "}
                    <strong>{bulkFormData.maps_per_match} maps</strong> (Best of{" "}
                    {bulkFormData.maps_per_match})
                    <br />
                    Total:{" "}
                    <strong>
                      {bulkFormData.number_of_matches *
                        bulkFormData.maps_per_match}{" "}
                      {bulkFormData.number_of_matches *
                        bulkFormData.maps_per_match ===
                      1
                        ? "map"
                        : "maps"}
                    </strong>{" "}
                    will be created
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleAddBulkMatches}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Create {bulkFormData.number_of_matches}{" "}
                {bulkFormData.number_of_matches === 1 ? "Match" : "Matches"} (
                {bulkFormData.number_of_matches * bulkFormData.maps_per_match}{" "}
                {bulkFormData.number_of_matches *
                  bulkFormData.maps_per_match ===
                1
                  ? "map"
                  : "maps"}{" "}
                total)
              </button>
              <button
                onClick={cancelEdit}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Single Match Form */}
        {showAddForm && editingMatch && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Edit Match & Map Results
            </h3>

            {/* Match Info */}
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">
                Match Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Team 1 <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.team1_id}
                    onChange={(e) =>
                      setFormData({ ...formData, team1_id: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.logo} {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Team 2 <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.team2_id}
                    onChange={(e) =>
                      setFormData({ ...formData, team2_id: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.logo} {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Match Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.match_date}
                    onChange={(e) =>
                      setFormData({ ...formData, match_date: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Match Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Map Results */}
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">
                Map Results (Best of{" "}
                {editingMatch.num_maps || editingMaps.length})
              </h4>
              <div className="space-y-4">
                {editingMaps.map((map, index) => (
                  <div
                    key={map.id}
                    className="bg-gray-900/50 p-4 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white font-semibold">
                        Map {map.map_number}
                      </h5>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-400">
                          Winner:{" "}
                          {map.winner_team_id === parseInt(formData.team1_id)
                            ? teams.find(
                                (t) => t.id === parseInt(formData.team1_id)
                              )?.name
                            : map.winner_team_id === parseInt(formData.team2_id)
                            ? teams.find(
                                (t) => t.id === parseInt(formData.team2_id)
                              )?.name
                            : "TBD"}
                        </span>
                        {editingMaps.length > 2 && (
                          <button
                            onClick={() => handleDeleteMap(map.id)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                            title="Delete this map"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2">
                        Map Name
                      </label>
                      <select
                        value={map.map_name || ""}
                        onChange={(e) => {
                          const newMaps = [...editingMaps];
                          newMaps[index].map_name = e.target.value;
                          setEditingMaps(newMaps);
                        }}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select a map</option>
                        <option value="Ancient">Ancient</option>
                        <option value="Dust 2">Dust 2</option>
                        <option value="Inferno">Inferno</option>
                        <option value="Mirage">Mirage</option>
                        <option value="Nuke">Nuke</option>
                        <option value="Overpass">Overpass</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">
                          {
                            teams.find(
                              (t) => t.id === parseInt(formData.team1_id)
                            )?.logo
                          }{" "}
                          {
                            teams.find(
                              (t) => t.id === parseInt(formData.team1_id)
                            )?.name
                          }{" "}
                          Score
                        </label>
                        <input
                          type="number"
                          value={map.team1_score}
                          onChange={(e) => {
                            const newMaps = [...editingMaps];
                            newMaps[index].team1_score =
                              parseInt(e.target.value) || 0;
                            setEditingMaps(newMaps);
                          }}
                          min="0"
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">
                          {
                            teams.find(
                              (t) => t.id === parseInt(formData.team2_id)
                            )?.logo
                          }{" "}
                          {
                            teams.find(
                              (t) => t.id === parseInt(formData.team2_id)
                            )?.name
                          }{" "}
                          Score
                        </label>
                        <input
                          type="number"
                          value={map.team2_score}
                          onChange={(e) => {
                            const newMaps = [...editingMaps];
                            newMaps[index].team2_score =
                              parseInt(e.target.value) || 0;
                            setEditingMaps(newMaps);
                          }}
                          min="0"
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      {/* <div>
                        <label className="block text-gray-400 text-sm mb-2">
                          Map Status
                        </label>
                        <select
                          value={map.status}
                          onChange={(e) => {
                            const newMaps = [...editingMaps];
                            newMaps[index].status = e.target.value as
                              | "scheduled"
                              | "live"
                              | "completed"
                              | "cancelled";
                            setEditingMaps(newMaps);
                          }}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="completed">Completed</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="live">Live</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div> */}
                    </div>

                    {/* Player Statistics */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h6 className="text-white font-semibold mb-3">
                        Player Statistics
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Team 1 Players */}
                        <div>
                          <h6 className="text-sm font-semibold text-gray-300 mb-2">
                            {
                              teams.find(
                                (t) => t.id === parseInt(formData.team1_id)
                              )?.logo
                            }{" "}
                            {
                              teams.find(
                                (t) => t.id === parseInt(formData.team1_id)
                              )?.name
                            }
                          </h6>
                          <div className="space-y-2">
                            {map.player_stats
                              ?.filter(
                                (stat) =>
                                  stat.team_id === parseInt(formData.team1_id)
                              )
                              .map((stat, statIndex) => {
                                const mapIndex = editingMaps.findIndex(
                                  (m) => m.id === map.id
                                );
                                const statsIndex = editingMaps[
                                  mapIndex
                                ]?.player_stats?.findIndex(
                                  (s) =>
                                    s.player_id === stat.player_id &&
                                    s.team_id === stat.team_id
                                );
                                return (
                                  <div
                                    key={`${stat.player_id}-${statIndex}`}
                                    className="bg-gray-800/50 p-2 rounded"
                                  >
                                    <div className="text-xs text-gray-400 mb-1">
                                      {stat.player?.name ||
                                        `Player ${stat.player_id}`}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-1">
                                      <div className="text-center">Kills</div>
                                      <div className="text-center">Deaths</div>
                                      <div className="text-center">Assists</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <input
                                        type="number"
                                        placeholder="K"
                                        value={stat.kills}
                                        onChange={(e) => {
                                          const newMaps = [...editingMaps];
                                          if (
                                            statsIndex !== undefined &&
                                            statsIndex !== -1
                                          ) {
                                            newMaps[mapIndex].player_stats![
                                              statsIndex
                                            ].kills =
                                              parseInt(e.target.value) || 0;
                                            setEditingMaps(newMaps);
                                          }
                                        }}
                                        min="0"
                                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                        title="Kills"
                                      />
                                      <input
                                        type="number"
                                        placeholder="D"
                                        value={stat.deaths}
                                        onChange={(e) => {
                                          const newMaps = [...editingMaps];
                                          if (
                                            statsIndex !== undefined &&
                                            statsIndex !== -1
                                          ) {
                                            newMaps[mapIndex].player_stats![
                                              statsIndex
                                            ].deaths =
                                              parseInt(e.target.value) || 0;
                                            setEditingMaps(newMaps);
                                          }
                                        }}
                                        min="0"
                                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                        title="Deaths"
                                      />
                                      <input
                                        type="number"
                                        placeholder="A"
                                        value={stat.assists}
                                        onChange={(e) => {
                                          const newMaps = [...editingMaps];
                                          if (
                                            statsIndex !== undefined &&
                                            statsIndex !== -1
                                          ) {
                                            newMaps[mapIndex].player_stats![
                                              statsIndex
                                            ].assists =
                                              parseInt(e.target.value) || 0;
                                            setEditingMaps(newMaps);
                                          }
                                        }}
                                        min="0"
                                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                        title="Assists"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Team 2 Players */}
                        <div>
                          <h6 className="text-sm font-semibold text-gray-300 mb-2">
                            {
                              teams.find(
                                (t) => t.id === parseInt(formData.team2_id)
                              )?.logo
                            }{" "}
                            {
                              teams.find(
                                (t) => t.id === parseInt(formData.team2_id)
                              )?.name
                            }
                          </h6>
                          <div className="space-y-2">
                            {map.player_stats
                              ?.filter(
                                (stat) =>
                                  stat.team_id === parseInt(formData.team2_id)
                              )
                              .map((stat, statIndex) => {
                                const mapIndex = editingMaps.findIndex(
                                  (m) => m.id === map.id
                                );
                                const statsIndex = editingMaps[
                                  mapIndex
                                ]?.player_stats?.findIndex(
                                  (s) =>
                                    s.player_id === stat.player_id &&
                                    s.team_id === stat.team_id
                                );
                                return (
                                  <div
                                    key={`${stat.player_id}-${statIndex}`}
                                    className="bg-gray-800/50 p-2 rounded"
                                  >
                                    <div className="text-xs text-gray-400 mb-1">
                                      {stat.player?.name ||
                                        `Player ${stat.player_id}`}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-1">
                                      <div className="text-center">Kills</div>
                                      <div className="text-center">Deaths</div>
                                      <div className="text-center">Assists</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <input
                                        type="number"
                                        placeholder="K"
                                        value={stat.kills}
                                        onChange={(e) => {
                                          const newMaps = [...editingMaps];
                                          if (
                                            statsIndex !== undefined &&
                                            statsIndex !== -1
                                          ) {
                                            newMaps[mapIndex].player_stats![
                                              statsIndex
                                            ].kills =
                                              parseInt(e.target.value) || 0;
                                            setEditingMaps(newMaps);
                                          }
                                        }}
                                        min="0"
                                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                        title="Kills"
                                      />
                                      <input
                                        type="number"
                                        placeholder="D"
                                        value={stat.deaths}
                                        onChange={(e) => {
                                          const newMaps = [...editingMaps];
                                          if (
                                            statsIndex !== undefined &&
                                            statsIndex !== -1
                                          ) {
                                            newMaps[mapIndex].player_stats![
                                              statsIndex
                                            ].deaths =
                                              parseInt(e.target.value) || 0;
                                            setEditingMaps(newMaps);
                                          }
                                        }}
                                        min="0"
                                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                        title="Deaths"
                                      />
                                      <input
                                        type="number"
                                        placeholder="A"
                                        value={stat.assists}
                                        onChange={(e) => {
                                          const newMaps = [...editingMaps];
                                          if (
                                            statsIndex !== undefined &&
                                            statsIndex !== -1
                                          ) {
                                            newMaps[mapIndex].player_stats![
                                              statsIndex
                                            ].assists =
                                              parseInt(e.target.value) || 0;
                                            setEditingMaps(newMaps);
                                          }
                                        }}
                                        min="0"
                                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                        title="Assists"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        K = Kills, D = Deaths, A = Assists
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Match Score Preview */}
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-blue-300">Overall Match Score:</span>
                <span className="text-white font-bold text-xl">
                  {
                    editingMaps.filter(
                      (m) => m.winner_team_id === parseInt(formData.team1_id)
                    ).length
                  }
                  {" - "}
                  {
                    editingMaps.filter(
                      (m) => m.winner_team_id === parseInt(formData.team2_id)
                    ).length
                  }
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleUpdateMatch}
                disabled={isUpdating}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdating && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {isUpdating ? "Updating..." : "Update Match & Maps"}
              </button>
              <button
                onClick={cancelEdit}
                disabled={isUpdating}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
