"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { TeamLogo, isImageUrl } from "@/components/shared/TeamLogo";

interface Team {
  id: number;
  name: string;
  logo: string;
  rounds_won: number;
  rounds_lost: number;
  matches_won: number;
  matches_lost: number;
  created_at?: string;
}

interface TeamFormData {
  name: string;
  logo: string;
}

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
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Upload image to Supabase storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);

      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = fileName; // Path is relative to bucket root

      // Upload to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from("team-logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // If bucket doesn't exist, try to create it
        if (uploadError.message.includes("Bucket not found")) {
          // Create the bucket (this might require admin privileges)
          const { error: createError } = await supabase.storage.createBucket(
            "team-logos",
            {
              public: true,
              allowedMimeTypes: [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
              ],
            }
          );

          if (createError) {
            console.error("Error creating bucket:", createError);
            throw new Error(
              "Storage bucket not available. Please create 'team-logos' bucket in Supabase Storage."
            );
          }

          // Retry upload after creating bucket
          const { error: retryError, data: retryData } = await supabase.storage
            .from("team-logos")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (retryError) throw retryError;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("team-logos")
            .getPublicUrl(filePath);

          return urlData.publicUrl;
        }
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("team-logos")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: unknown) {
      console.error("Error uploading image:", err);
      // Provide more helpful error messages
      if (
        err instanceof Error &&
        err.message.includes("row-level security policy")
      ) {
        throw new Error(
          "Storage RLS policy error. Please run the SQL script in 'supabase-storage-team-logos-policies.sql' in your Supabase SQL Editor."
        );
      }
      throw new Error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setFormData({ ...formData, logo: imageUrl });
      }
    } catch (err: unknown) {
      console.error("Error handling file:", err);
      if (
        err instanceof Error &&
        err.message.includes("row-level security policy")
      ) {
        alert(
          "Storage RLS policy error. Please run the SQL script in 'supabase-storage-team-logos-policies.sql' in your Supabase SQL Editor to set up the required policies."
        );
      } else {
        alert(
          `Failed to upload image: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
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
      setLogoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
          logo: formData.logo || "⚡",
        })
        .eq("id", editingTeam.id);

      if (error) throw error;

      // Reset form and refresh teams
      setEditingTeam(null);
      setFormData({
        name: "",
        logo: "",
      });
      setLogoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
    // Set preview if it's an image URL
    if (isImageUrl(team.logo)) {
      setLogoPreview(team.logo);
    } else {
      setLogoPreview(null);
    }
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
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Filter teams based on search
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                All Teams ({filteredTeams.length})
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
                    Team
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    W
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    L
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Rounds Won
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Rounds Lost
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Round Diff
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Match Win %
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      {searchQuery
                        ? "No teams found matching your search."
                        : "No teams yet. Add one to get started!"}
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => {
                    const roundDiff = team.rounds_won - team.rounds_lost;
                    const totalMatches = team.matches_won + team.matches_lost;
                    const matchWinRate =
                      totalMatches > 0
                        ? ((team.matches_won / totalMatches) * 100).toFixed(1)
                        : "0.0";
                    const matchRecord = `${team.matches_won}-${team.matches_lost}`;

                    return (
                      <tr
                        key={team.id}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <TeamLogo logo={team.logo} />
                            <div>
                              <div className="text-white font-semibold">
                                {team.name}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {matchRecord}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-green-400 font-semibold text-lg">
                            {team.matches_won}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-red-400 font-semibold text-lg">
                            {team.matches_lost}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-green-400 font-semibold">
                            {team.rounds_won}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-red-400 font-semibold">
                            {team.rounds_lost}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-semibold ${
                              roundDiff > 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {roundDiff > 0 ? "+" : ""}
                            {roundDiff}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-semibold ${
                              parseFloat(matchWinRate) >= 50
                                ? "text-blue-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {matchWinRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Link
                              href={`/teams/${team.id}`}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => startEditTeam(team)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTeam(team.id, team.name)
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

        {/* Add/Edit Team Form */}
        {showAddForm && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingTeam ? "Edit Team" : "Add New Team"}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {editingTeam
                ? "Update team information. Statistics are calculated from match results."
                : "Create a new team. Statistics will be automatically calculated from match results."}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Team Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Team Logo
                </label>
                <div className="space-y-3">
                  {/* Logo Preview */}
                  {(logoPreview ||
                    (formData.logo && !isImageUrl(formData.logo))) && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="text-4xl">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-12 h-12 object-contain rounded"
                          />
                        ) : (
                          <span>{formData.logo || "⚡"}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          Current Logo
                        </div>
                        {isImageUrl(formData.logo) && (
                          <div className="text-gray-400 text-xs">
                            Image uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-center cursor-pointer hover:bg-gray-700 transition-colors ${
                        uploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {uploading ? "Uploading..." : "Upload Image"}
                    </label>
                    <p className="text-gray-500 text-xs mt-1">
                      Max 5MB. Supports JPG, PNG, GIF, WebP
                    </p>
                  </div>

                  {/* Or use emoji */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-900/50 text-gray-500">
                        OR
                      </span>
                    </div>
                  </div>

                  {/* Emoji Input */}
                  <input
                    type="text"
                    placeholder="🔥 (or leave empty for default)"
                    value={isImageUrl(formData.logo) ? "" : formData.logo}
                    onChange={(e) => {
                      if (!isImageUrl(e.target.value)) {
                        setFormData({ ...formData, logo: e.target.value });
                        setLogoPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }
                    }}
                    maxLength={2}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-gray-500 text-xs">
                    Enter an emoji (max 2 characters)
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={editingTeam ? handleUpdateTeam : handleAddTeam}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {editingTeam ? "Update Team" : "Create Team"}
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
