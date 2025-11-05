"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  TeamsTable,
  TeamForm,
  Team,
  TeamFormData,
} from "@/components/admin/teams";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    logo: "",
  });

  // Fetch teams from Supabase
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
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

      // Calculate statistics for each team
      const teamsWithStats = (teamsData || []).map((team) => {
        const teamMatches = (matchesData || []).filter(
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

          // Count match result
          if (teamScore > opponentScore) {
            matches_won++;
          } else if (teamScore < opponentScore) {
            matches_lost++;
          }

          // Count rounds
          rounds_won += teamScore;
          rounds_lost += opponentScore;
        });

        return {
          ...team,
          matches_won,
          matches_lost,
          rounds_won,
          rounds_lost,
        };
      });

      // Sort by matches won (descending)
      teamsWithStats.sort((a, b) => b.matches_won - a.matches_won);

      setTeams(teamsWithStats);
      setError(null);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add new team
  const handleAddTeam = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a team name");
      return;
    }

    try {
      const { error } = await supabase
        .from("teams")
        .insert([
          {
            name: formData.name,
            logo: formData.logo || "⚡",
          },
        ])
        .select();

      if (error) throw error;

      // Reset form and refresh teams
      setFormData({
        name: "",
        logo: "",
      });
      setShowAddForm(false);
      await fetchTeams();
      alert("Team added successfully! Add matches to generate statistics.");
    } catch (err) {
      console.error("Error adding team:", err);
      alert("Failed to add team. Please try again.");
    }
  };

  // Update team
  const handleUpdateTeam = async () => {
    if (!editingTeam) return;

    try {
      const { error } = await supabase
        .from("teams")
        .update({
          name: formData.name,
          logo: formData.logo,
        })
        .eq("id", editingTeam.id);

      if (error) throw error;

      // Reset form and refresh teams
      setEditingTeam(null);
      setFormData({
        name: "",
        logo: "",
      });
      await fetchTeams();
      alert("Team updated successfully!");
    } catch (err) {
      console.error("Error updating team:", err);
      alert("Failed to update team. Please try again.");
    }
  };

  // Delete team
  const handleDeleteTeam = async (teamId: number, teamName: string) => {
    if (!confirm(`Are you sure you want to delete ${teamName}?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("teams").delete().eq("id", teamId);

      if (error) throw error;

      await fetchTeams();
      alert("Team deleted successfully!");
    } catch (err) {
      console.error("Error deleting team:", err);
      alert("Failed to delete team. Please try again.");
    }
  };

  // Edit team - populate form
  const startEditTeam = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      logo: team.logo,
    });
    setShowAddForm(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTeam(null);
    setShowAddForm(false);
    setFormData({
      name: "",
      logo: "",
    });
  };

  if (loading) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading teams...</div>
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
              Team Management
            </h1>
            <p className="text-gray-400">
              Manage all teams in Fight Club Tournament
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
                if (editingTeam) cancelEdit();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              + Add New Team
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Teams Table */}
        <TeamsTable
          teams={teams}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEditTeam={startEditTeam}
          onDeleteTeam={handleDeleteTeam}
        />

        {/* Add/Edit Team Form */}
        {showAddForm && (
          <TeamForm
            formData={formData}
            editingTeam={editingTeam}
            onFormDataChange={setFormData}
            onSubmit={editingTeam ? handleUpdateTeam : handleAddTeam}
            onCancel={cancelEdit}
          />
        )}
      </div>
    </div>
  );
}
