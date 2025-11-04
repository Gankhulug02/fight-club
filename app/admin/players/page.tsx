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

interface PlayerFormData {
  name: string;
  team_id: string;
  role: string;
  avatar: string;
}

export default function AdminPlayersPage() {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<PlayerFormData>({
    name: "",
    team_id: "",
    role: "",
    avatar: "",
  });

  // Fetch players and their stats
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

      setTeams(teamsData || []);

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

      // Sort by kills (descending)
      playersWithStats.sort((a, b) => b.kills - a.kills);

      setPlayerStats(playersWithStats);
      setError(null);
    } catch (err) {
      console.error("Error fetching player stats:", err);
      setError("Failed to load players. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add new player
  const handleAddPlayer = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a player name");
      return;
    }

    if (!formData.team_id) {
      alert("Please select a team");
      return;
    }

    try {
      const { error } = await supabase
        .from("players")
        .insert([
          {
            name: formData.name,
            team_id: parseInt(formData.team_id),
            role: formData.role || "Player",
            avatar: formData.avatar || "👤",
          },
        ])
        .select();

      if (error) throw error;

      // Reset form and refresh players
      setFormData({
        name: "",
        team_id: "",
        role: "",
        avatar: "",
      });
      setShowAddForm(false);
      await fetchPlayerStats();
      alert("Player added successfully!");
    } catch (err) {
      console.error("Error adding player:", err);
      alert("Failed to add player. Please try again.");
    }
  };

  // Update player
  const handleUpdatePlayer = async () => {
    if (!editingPlayer) return;

    try {
      const { error } = await supabase
        .from("players")
        .update({
          name: formData.name,
          team_id: parseInt(formData.team_id),
          role: formData.role,
          avatar: formData.avatar,
        })
        .eq("id", editingPlayer.id);

      if (error) throw error;

      // Reset form and refresh players
      setEditingPlayer(null);
      setFormData({
        name: "",
        team_id: "",
        role: "",
        avatar: "",
      });
      await fetchPlayerStats();
      alert("Player updated successfully!");
    } catch (err) {
      console.error("Error updating player:", err);
      alert("Failed to update player. Please try again.");
    }
  };

  // Delete player
  const handleDeletePlayer = async (playerId: number, playerName: string) => {
    if (!confirm(`Are you sure you want to delete ${playerName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("players")
        .delete()
        .eq("id", playerId);

      if (error) throw error;

      await fetchPlayerStats();
      alert("Player deleted successfully!");
    } catch (err) {
      console.error("Error deleting player:", err);
      alert("Failed to delete player. Please try again.");
    }
  };

  // Edit player - populate form
  const startEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      team_id: player.team_id.toString(),
      role: player.role,
      avatar: player.avatar,
    });
    setShowAddForm(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingPlayer(null);
    setShowAddForm(false);
    setFormData({
      name: "",
      team_id: "",
      role: "",
      avatar: "",
    });
  };

  // Filter players based on search
  const filteredPlayers = playerStats.filter(
    (ps) =>
      ps.player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ps.team?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading players...</div>
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
              Player Management
            </h1>
            <p className="text-gray-400">
              Manage all players and view their statistics
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
                setShowAddForm(!showAddForm);
                if (editingPlayer) cancelEdit();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              + Add New Player
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Players Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                All Players ({filteredPlayers.length})
              </h2>
              <input
                type="text"
                placeholder="Search players or teams..."
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
                    Player
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Team
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Maps
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Kills
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Assists
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Deaths
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    K/D
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      {searchQuery
                        ? "No players found matching your search."
                        : "No players yet. Add one to get started!"}
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((ps) => {
                    return (
                      <tr
                        key={ps.player.id}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{ps.player.avatar}</span>
                            <div>
                              <div className="text-white font-semibold">
                                {ps.player.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {ps.team ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">{ps.team.logo}</span>
                              <span className="text-white">{ps.team.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">No team</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300">
                            {ps.player.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-blue-400 font-semibold">
                            {ps.maps_played}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-green-400 font-semibold text-lg">
                            {ps.kills}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-yellow-400 font-semibold text-lg">
                            {ps.assists}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-red-400 font-semibold text-lg">
                            {ps.deaths}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-semibold ${
                              ps.kd_ratio >= 1.5
                                ? "text-green-400"
                                : ps.kd_ratio >= 1.0
                                ? "text-blue-400"
                                : "text-orange-400"
                            }`}
                          >
                            {ps.kd_ratio.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => startEditPlayer(ps.player)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeletePlayer(ps.player.id, ps.player.name)
                              }
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Player Modal */}
        {showAddForm && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={cancelEdit}
          >
            <div
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">
                  {editingPlayer ? "Edit Player" : "Add New Player"}
                </h3>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                {editingPlayer
                  ? "Update player information."
                  : "Create a new player. Statistics will be automatically calculated from match results."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Player Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter player name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Team <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.team_id}
                    onChange={(e) =>
                      setFormData({ ...formData, team_id: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.logo} {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Duelist, Controller, IGL"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Avatar Emoji
                  </label>
                  <input
                    type="text"
                    placeholder="👤"
                    value={formData.avatar}
                    onChange={(e) =>
                      setFormData({ ...formData, avatar: e.target.value })
                    }
                    maxLength={2}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={editingPlayer ? handleUpdatePlayer : handleAddPlayer}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {editingPlayer ? "Update Player" : "Create Player"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
