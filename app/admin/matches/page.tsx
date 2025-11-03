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

interface MatchFormData {
  team1_id: string;
  team2_id: string;
  team1_score: string;
  team2_score: string;
  match_date: string;
  status: string;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add new match
  const handleAddMatch = async () => {
    if (!formData.team1_id || !formData.team2_id) {
      alert("Please select both teams");
      return;
    }

    if (formData.team1_id === formData.team2_id) {
      alert("Teams must be different");
      return;
    }

    try {
      const { error } = await supabase
        .from("matches")
        .insert([
          {
            team1_id: parseInt(formData.team1_id),
            team2_id: parseInt(formData.team2_id),
            team1_score: parseInt(formData.team1_score) || 0,
            team2_score: parseInt(formData.team2_score) || 0,
            match_date: formData.match_date || new Date().toISOString(),
            status: formData.status,
          },
        ])
        .select();

      if (error) throw error;

      setFormData({
        team1_id: "",
        team2_id: "",
        team1_score: "0",
        team2_score: "0",
        match_date: "",
        status: "scheduled",
      });
      setShowAddForm(false);
      await fetchData();
      alert("Match added successfully!");
    } catch (err) {
      console.error("Error adding match:", err);
      alert("Failed to add match. Please try again.");
    }
  };

  // Update match
  const handleUpdateMatch = async () => {
    if (!editingMatch) return;

    try {
      const { error } = await supabase
        .from("matches")
        .update({
          team1_id: parseInt(formData.team1_id),
          team2_id: parseInt(formData.team2_id),
          team1_score: parseInt(formData.team1_score),
          team2_score: parseInt(formData.team2_score),
          match_date: formData.match_date,
          status: formData.status,
        })
        .eq("id", editingMatch.id);

      if (error) throw error;

      setEditingMatch(null);
      setFormData({
        team1_id: "",
        team2_id: "",
        team1_score: "0",
        team2_score: "0",
        match_date: "",
        status: "scheduled",
      });
      setShowAddForm(false);
      await fetchData();
      alert("Match updated successfully!");
    } catch (err) {
      console.error("Error updating match:", err);
      alert("Failed to update match. Please try again.");
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
    setShowAddForm(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingMatch(null);
    setShowAddForm(false);
    setFormData({
      team1_id: "",
      team2_id: "",
      team1_score: "0",
      team2_score: "0",
      match_date: "",
      status: "scheduled",
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
      <div className="bg-gradient-to-br from-black via-gray-950 to-black min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading matches...</div>
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
                setShowAddForm(!showAddForm);
                if (editingMatch) cancelEdit();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              + Schedule New Match
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
                        <span className="text-white font-bold text-lg">
                          {match.team1_score}-{match.team2_score}
                        </span>
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
        {showAddForm && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingMatch ? "Edit Match" : "Schedule New Match"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  Team 1 Score
                </label>
                <input
                  type="number"
                  value={formData.team1_score}
                  onChange={(e) =>
                    setFormData({ ...formData, team1_score: e.target.value })
                  }
                  min="0"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Team 2 Score
                </label>
                <input
                  type="number"
                  value={formData.team2_score}
                  onChange={(e) =>
                    setFormData({ ...formData, team2_score: e.target.value })
                  }
                  min="0"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
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
                  Status
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
            <div className="mt-4 flex space-x-3">
              <button
                onClick={editingMatch ? handleUpdateMatch : handleAddMatch}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {editingMatch ? "Update Match" : "Schedule Match"}
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
      </div>
    </div>
  );
}
