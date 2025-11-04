"use client";

import { useState, useEffect, use } from "react";
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
  status: string;
}

interface MatchWithOpponent extends Match {
  opponent?: Team;
  isTeam1: boolean;
  result: "win" | "loss" | "draw";
  teamScore: number;
  opponentScore: number;
}

interface TeamStats {
  matches_won: number;
  matches_lost: number;
  rounds_won: number;
  rounds_lost: number;
  rank: number;
}

interface Player {
  id: number;
  name: string;
  team_id: number;
  role: string;
  avatar: string;
}

interface PlayerStats {
  player: Player;
  kills: number;
  assists: number;
  deaths: number;
  kd_ratio: number;
  maps_played: number;
}

interface MatchMap {
  id: number;
  match_id: number;
  map_number: number;
  team1_score: number;
  team2_score: number;
  winner_team_id: number | null;
  status: string;
}

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [team, setTeam] = useState<Team | null>(null);
  const [stats, setStats] = useState<TeamStats>({
    matches_won: 0,
    matches_lost: 0,
    rounds_won: 0,
    rounds_lost: 0,
    rank: 0,
  });
  const [matches, setMatches] = useState<MatchWithOpponent[]>([]);
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const teamId = parseInt(id);

      // Fetch the specific team
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (teamError) throw teamError;
      if (!teamData) throw new Error("Team not found");

      setTeam(teamData);

      // Fetch all teams to calculate rank
      const { data: allTeamsData, error: allTeamsError } = await supabase
        .from("teams")
        .select("*");

      if (allTeamsError) throw allTeamsError;

      // Fetch all completed matches
      const { data: allMatchesData, error: allMatchesError } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "completed");

      if (allMatchesError) throw allMatchesError;

      // Fetch all match maps to get round scores
      const { data: allMapsData, error: allMapsError } = await supabase
        .from("match_maps")
        .select("*");

      if (allMapsError) throw allMapsError;

      // Calculate stats for all teams to determine rank
      const teamsWithStats = (allTeamsData || []).map((t: Team) => {
        const teamMatches = (allMatchesData || []).filter(
          (m: Match) => m.team1_id === t.id || m.team2_id === t.id
        );

        let matches_won = 0;
        let matches_lost = 0;
        let rounds_won = 0;
        let rounds_lost = 0;

        teamMatches.forEach((match: Match) => {
          const isTeam1 = match.team1_id === t.id;
          const teamScore = isTeam1 ? match.team1_score : match.team2_score;
          const opponentScore = isTeam1 ? match.team2_score : match.team1_score;

          if (teamScore > opponentScore) matches_won++;
          else if (teamScore < opponentScore) matches_lost++;

          // Get all maps for this match and sum round scores
          const matchMaps = (allMapsData || []).filter(
            (map: MatchMap) => map.match_id === match.id
          );

          matchMaps.forEach((map: MatchMap) => {
            const mapRoundsWon = isTeam1 ? map.team1_score : map.team2_score;
            const mapRoundsLost = isTeam1 ? map.team2_score : map.team1_score;
            rounds_won += mapRoundsWon;
            rounds_lost += mapRoundsLost;
          });
        });

        return {
          ...t,
          matches_won,
          matches_lost,
          rounds_won,
          rounds_lost,
          round_diff: rounds_won - rounds_lost,
        };
      });

      // Sort by round difference to get rank
      teamsWithStats.sort((a, b) => b.round_diff - a.round_diff);
      const currentTeamStats = teamsWithStats.find((t) => t.id === teamId);
      const rank = teamsWithStats.findIndex((t) => t.id === teamId) + 1;

      if (currentTeamStats) {
        setStats({
          matches_won: currentTeamStats.matches_won,
          matches_lost: currentTeamStats.matches_lost,
          rounds_won: currentTeamStats.rounds_won,
          rounds_lost: currentTeamStats.rounds_lost,
          rank,
        });
      }

      // Fetch matches for this team with opponent details
      const { data: teamMatchesData, error: teamMatchesError } = await supabase
        .from("matches")
        .select("*")
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        .eq("status", "completed")
        .order("match_date", { ascending: false })
        .limit(10);

      if (teamMatchesError) throw teamMatchesError;

      // Enrich matches with opponent data
      const matchesWithOpponents = await Promise.all(
        (teamMatchesData || []).map(async (match: Match) => {
          const isTeam1 = match.team1_id === teamId;
          const opponentId = isTeam1 ? match.team2_id : match.team1_id;
          const teamScore = isTeam1 ? match.team1_score : match.team2_score;
          const opponentScore = isTeam1 ? match.team2_score : match.team1_score;

          const { data: opponentData } = await supabase
            .from("teams")
            .select("*")
            .eq("id", opponentId)
            .single();

          let result: "win" | "loss" | "draw";
          if (teamScore > opponentScore) result = "win";
          else if (teamScore < opponentScore) result = "loss";
          else result = "draw";

          return {
            ...match,
            opponent: opponentData,
            isTeam1,
            result,
            teamScore,
            opponentScore,
          };
        })
      );

      setMatches(matchesWithOpponents);

      // Fetch players for this team
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", teamId)
        .order("name");

      if (playersError) throw playersError;

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

          return {
            player,
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

      setPlayers(playersWithStats);
      setError(null);
    } catch (err) {
      console.error("Error fetching team data:", err);
      setError("Failed to load team data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading team data...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className=" min-h-screen p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl">
            {error || "Team not found"}
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  const roundDiff = stats.rounds_won - stats.rounds_lost;
  const totalMatches = stats.matches_won + stats.matches_lost;
  const winRate =
    totalMatches > 0
      ? ((stats.matches_won / totalMatches) * 100).toFixed(1)
      : "0.0";

  return (
    <div className=" min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Team Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-800 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="text-7xl">{team.logo}</div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {team.name}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                    Rank #{stats.rank || "N/A"}
                  </span>
                  <span className="text-gray-400 text-sm">Season 2025</span>
                </div>
              </div>
            </div>

            {/* Team Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {stats.matches_won}
                </div>
                <div className="text-xs text-gray-400 uppercase">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {stats.matches_lost}
                </div>
                <div className="text-xs text-gray-400 uppercase">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {winRate}%
                </div>
                <div className="text-xs text-gray-400 uppercase">Win Rate</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    roundDiff > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {roundDiff > 0 ? "+" : ""}
                  {roundDiff}
                </div>
                <div className="text-xs text-gray-400 uppercase">
                  Round Diff
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Players Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">Team Roster</h2>
            <p className="text-gray-400 text-sm mt-1">
              Player statistics and performance
            </p>
          </div>

          {players.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No Players Yet
              </h3>
              <p className="text-gray-500">
                This team doesn&apos;t have any players registered yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/50 border-b border-gray-800">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Player
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
                  {players.map((ps) => (
                    <tr
                      key={ps.player.id}
                      className="hover:bg-gray-800/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{ps.player.avatar}</span>
                          <span className="text-white font-semibold text-lg">
                            {ps.player.name}
                          </span>
                        </div>
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
                          className={`inline-flex items-center px-3 py-1 rounded-full font-bold ${
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Match History Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">Match History</h2>
            <p className="text-gray-400 text-sm mt-1">
              Recent matches and results (last 10)
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No Match History
              </h3>
              <p className="text-gray-500">
                This team hasn&apos;t played any completed matches yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/50 border-b border-gray-800">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Opponent
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {matches.map((match) => {
                    const matchDate = new Date(match.match_date);
                    const formattedDate = new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(matchDate);

                    return (
                      <tr
                        key={match.id}
                        className="hover:bg-gray-800/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="text-gray-400 text-sm"
                            suppressHydrationWarning
                          >
                            {formattedDate}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {match.opponent?.logo || "❓"}
                            </span>
                            <span className="text-white font-semibold">
                              {match.opponent?.name || "Unknown Team"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-white font-bold text-lg">
                            {match.teamScore} - {match.opponentScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {match.result === "win" ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-bold uppercase text-sm">
                              Win
                            </span>
                          ) : match.result === "loss" ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold uppercase text-sm">
                              Loss
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 font-bold uppercase text-sm">
                              Draw
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            <span className="mr-2">←</span>
            Back to Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
