"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import StatsOverview from "@/components/admin/matches/StatsOverview";
import StatusFilter from "@/components/admin/matches/StatusFilter";
import MatchesTable from "@/components/admin/matches/MatchesTable";
import ScheduleMatchForm from "@/components/admin/matches/ScheduleMatchForm";
import EditMatchForm from "@/components/admin/matches/EditMatchForm";
import {
  Team,
  Player,
  MatchMap,
  MapPlayerStats,
  MatchWithTeams,
  MatchFormData,
  BulkMatchFormData,
} from "@/components/admin/matches/types";

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
          status: formData.status,
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
            status: formData.status,
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
        <StatsOverview
          totalMatches={matches.length}
          liveMatches={liveMatches}
          scheduledMatches={scheduledMatches}
          completedMatches={completedMatches}
        />

        {/* Filter Buttons */}
        <StatusFilter
          statusFilter={statusFilter}
          liveMatches={liveMatches}
          scheduledMatches={scheduledMatches}
          completedMatches={completedMatches}
          onFilterChange={setStatusFilter}
        />

        {/* Matches Table */}
        <MatchesTable
          matches={filteredMatches}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEdit={startEditMatch}
          onDelete={handleDeleteMatch}
        />

        {/* Schedule Match Form */}
        {showAddForm && !editingMatch && (
          <ScheduleMatchForm
            teams={teams}
            formData={bulkFormData}
            onFormChange={setBulkFormData}
            onSubmit={handleAddBulkMatches}
            onCancel={cancelEdit}
          />
        )}

        {/* Edit Match Form */}
        {showAddForm && editingMatch && (
          <EditMatchForm
            teams={teams}
            formData={formData}
            editingMaps={editingMaps}
            isUpdating={isUpdating}
            onFormChange={setFormData}
            onMapsChange={setEditingMaps}
            onSubmit={handleUpdateMatch}
            onCancel={cancelEdit}
            onDeleteMap={handleDeleteMap}
          />
        )}
      </div>
    </div>
  );
}
