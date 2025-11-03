"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Player {
  id: number;
  name: string;
  team_id: number;
  avatar: string;
  created_at?: string;
  updated_at?: string;
}

interface PlayerWithStats extends Player {
  teamName: string;
  teamLogo: string;
  kills: number;
  deaths: number;
  assists: number;
  gamesPlayed: number;
}

interface Team {
  id: number;
  name: string;
  logo: string;
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    team_id: "",
    avatar: "👤",
  });

  // Fetch teams
  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching teams:", error);
      return;
    }

    setTeams(data || []);
  };

  // Fetch players with stats
  const fetchPlayers = async () => {
    setLoading(true);

    // 1. Fetch all players
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("*")
      .order("name");

    if (playersError) {
      console.error("Error fetching players:", playersError);
      setLoading(false);
      return;
    }

    // 2. Fetch all match player stats
    const { data: statsData, error: statsError } = await supabase
      .from("match_player_stats")
      .select("*");

    if (statsError) {
      console.error("Error fetching stats:", statsError);
      setLoading(false);
      return;
    }

    // 3. Fetch teams for player associations
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("*");

    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
      setLoading(false);
      return;
    }

    // 4. Calculate stats for each player
    const playersWithStats: PlayerWithStats[] = (playersData || []).map(
      (player) => {
        const playerStats = (statsData || []).filter(
          (stat) => stat.player_id === player.id
        );

        const kills = playerStats.reduce((sum, stat) => sum + stat.kills, 0);
        const deaths = playerStats.reduce((sum, stat) => sum + stat.deaths, 0);
        const assists = playerStats.reduce(
          (sum, stat) => sum + stat.assists,
          0
        );
        const gamesPlayed = playerStats.length;

        const team = teamsData?.find((t) => t.id === player.team_id);

        return {
          ...player,
          teamName: team?.name || "Unknown",
          teamLogo: team?.logo || "⚡",
          kills,
          deaths,
          assists,
          gamesPlayed,
        };
      }
    );

    setPlayers(playersWithStats);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTeams();
      await fetchPlayers();
    };

    loadData();
  }, []);

  // Add new player
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.team_id) {
      alert("Please fill in all required fields");
      return;
    }

    const { error } = await supabase.from("players").insert([
      {
        name: formData.name,
        team_id: parseInt(formData.team_id),
        avatar: formData.avatar,
      },
    ]);

    if (error) {
      console.error("Error adding player:", error);
      alert("Failed to add player: " + error.message);
      return;
    }

    // Reset form and refresh
    setFormData({ name: "", team_id: "", avatar: "👤" });
    setShowAddForm(false);
    fetchPlayers();
  };

  // Delete player
  const handleDeletePlayer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this player?")) {
      return;
    }

    const { error } = await supabase.from("players").delete().eq("id", id);

    if (error) {
      console.error("Error deleting player:", error);
      alert("Failed to delete player: " + error.message);
      return;
    }

    fetchPlayers();
  };

  // Filter players
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTeam =
      !selectedTeamFilter || player.team_id.toString() === selectedTeamFilter;
    return matchesSearch && matchesTeam;
  });

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-black via-gray-950 to-black min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-black via-gray-950 to-black min-h-screen p-8">
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
              Manage all players in Fight Club Tournament
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
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              {showAddForm ? "Cancel" : "+ Add New Player"}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">🎮</div>
            <div className="text-2xl font-bold text-white">
              {filteredPlayers.length}
            </div>
            <div className="text-sm text-gray-400">Total Players</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">💀</div>
            <div className="text-2xl font-bold text-green-400">
              {filteredPlayers.reduce((sum, p) => sum + p.kills, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Kills</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">🤝</div>
            <div className="text-2xl font-bold text-blue-400">
              {filteredPlayers.reduce((sum, p) => sum + p.assists, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Assists</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-purple-400">
              {filteredPlayers.length > 0
                ? (
                    filteredPlayers.reduce(
                      (sum, p) => sum + (p.deaths > 0 ? p.kills / p.deaths : 0),
                      0
                    ) / filteredPlayers.length
                  ).toFixed(2)
                : "0.00"}
            </div>
            <div className="text-sm text-gray-400">Avg K/D Ratio</div>
          </div>
        </div>

        {/* Players Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">All Players</h2>
              <div className="flex space-x-3">
                <select
                  value={selectedTeamFilter}
                  onChange={(e) => setSelectedTeamFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Teams</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.logo} {team.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
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
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Games
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Kills
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Deaths
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Assists
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
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        {players.length === 0
                          ? "No players found. Add a player to get started!"
                          : "No players match your filters."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player) => {
                    const kd =
                      player.deaths > 0
                        ? (player.kills / player.deaths).toFixed(2)
                        : player.kills.toFixed(2);

                    return (
                      <tr
                        key={player.id}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{player.avatar}</span>
                            <div>
                              <div className="text-white font-semibold">
                                {player.name}
                              </div>
                              <div className="text-gray-400 text-sm">
                                ID: {player.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{player.teamLogo}</span>
                            <span className="text-gray-300">
                              {player.teamName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-300 font-medium">
                            {player.gamesPlayed}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-green-400 font-semibold">
                            {player.kills}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-red-400 font-semibold">
                            {player.deaths}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-blue-400 font-semibold">
                            {player.assists}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-semibold ${
                              parseFloat(kd) >= 1.0
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {kd}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleDeletePlayer(player.id)}
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

        {/* Add Player Form */}
        {showAddForm && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Add New Player
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Stats will be calculated automatically from match results.
            </p>
            <form onSubmit={handleAddPlayer}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter player name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Team *
                  </label>
                  <select
                    value={formData.team_id}
                    onChange={(e) =>
                      setFormData({ ...formData, team_id: e.target.value })
                    }
                    required
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
                    Avatar
                  </label>
                  <input
                    type="text"
                    placeholder="👤"
                    value={formData.avatar}
                    onChange={(e) =>
                      setFormData({ ...formData, avatar: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Create Player
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: "", team_id: "", avatar: "👤" });
                  }}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
