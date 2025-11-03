"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Team {
  id: number;
  name: string;
  logo: string;
  rounds_won: number;
  rounds_lost: number;
  matches_won: number;
  matches_lost: number;
}

interface Match {
  id: number;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  status: string;
}

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamsWithStats();
  }, []);

  const fetchTeamsWithStats = async () => {
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
          (match: Match) =>
            match.team1_id === team.id || match.team2_id === team.id
        );

        let matches_won = 0;
        let matches_lost = 0;
        let rounds_won = 0;
        let rounds_lost = 0;

        teamMatches.forEach((match: Match) => {
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

      setTeams(teamsWithStats);
      setError(null);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Sort teams by round difference (descending)
  const sortedTeams = [...teams].sort((a, b) => {
    const diffA = a.rounds_won - a.rounds_lost;
    const diffB = b.rounds_won - b.rounds_lost;
    return diffB - diffA;
  });

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-black via-gray-950 to-black min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
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
    <div className="bg-gradient-to-br from-black via-gray-950 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Tournament Leaderboard
          </h2>
          <p className="text-gray-400">Season 2025 - Live Rankings</p>
        </div>

        {/* Leaderboard Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/50 border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    W
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    L
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rounds Won
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rounds Lost
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Diff
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sortedTeams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No teams yet. Add teams and matches from the admin panel!
                    </td>
                  </tr>
                ) : (
                  sortedTeams.map((team, index) => {
                    const roundDiff = team.rounds_won - team.rounds_lost;
                    const isPositiveDiff = roundDiff > 0;
                    const totalMatches = team.matches_won + team.matches_lost;
                    const winRate =
                      totalMatches > 0
                        ? ((team.matches_won / totalMatches) * 100).toFixed(0)
                        : "0";

                    return (
                      <tr
                        key={team.id}
                        className="hover:bg-gray-800/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-lg font-bold ${
                              index === 0
                                ? "text-yellow-400"
                                : index === 1
                                ? "text-gray-300"
                                : index === 2
                                ? "text-orange-600"
                                : "text-gray-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/teams/${team.id}`}
                            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                          >
                            <div className="text-3xl">{team.logo}</div>
                            <div>
                              <div className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                                {team.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {winRate}% win rate
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-green-400 font-bold text-lg">
                            {team.matches_won}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-red-400 font-bold text-lg">
                            {team.matches_lost}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-green-400 font-semibold text-lg">
                            {team.rounds_won}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-red-400 font-semibold text-lg">
                            {team.rounds_lost}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-lg ${
                              isPositiveDiff
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {isPositiveDiff ? "+" : ""}
                            {roundDiff}
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

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
            <div className="text-gray-400 text-sm mb-1">Total Teams</div>
            <div className="text-2xl font-bold text-white">{teams.length}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
            <div className="text-gray-400 text-sm mb-1">Total Matches</div>
            <div className="text-2xl font-bold text-white">
              {teams.reduce(
                (sum, team) => sum + team.matches_won + team.matches_lost,
                0
              ) / 2}
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
            <div className="text-gray-400 text-sm mb-1">Total Rounds</div>
            <div className="text-2xl font-bold text-white">
              {teams.reduce(
                (sum, team) => sum + team.rounds_won + team.rounds_lost,
                0
              ) / 2}
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
            <div className="text-gray-400 text-sm mb-1">Leading Team</div>
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              {sortedTeams.length > 0 ? (
                <>
                  <span>{sortedTeams[0].logo}</span>
                  <span>{sortedTeams[0].name}</span>
                </>
              ) : (
                <span className="text-gray-500">No teams yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
