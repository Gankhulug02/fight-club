"use client";

import { useState } from "react";
import Link from "next/link";

interface Team {
  id: number;
  name: string;
  logo: string;
  roundsWon: number;
  roundsLost: number;
}

interface Player {
  id: number;
  name: string;
  teamId: number;
  teamName: string;
  role: string;
  kills: number;
  deaths: number;
  assists: number;
}

interface Match {
  id: number;
  team1: string;
  team2: string;
  date: string;
  status: "scheduled" | "live" | "completed";
  score?: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "teams" | "players" | "matches" | "settings"
  >("dashboard");

  // Sample data
  const stats = {
    totalTeams: 8,
    totalPlayers: 40,
    totalMatches: 45,
    liveMatches: 2,
    completedMatches: 35,
    scheduledMatches: 8,
  };

  const teams: Team[] = [
    { id: 1, name: "FaZe Clan", logo: "🔥", roundsWon: 156, roundsLost: 98 },
    { id: 2, name: "Natus Vincere", logo: "⭐", roundsWon: 149, roundsLost: 102 },
    { id: 3, name: "Vitality", logo: "🐝", roundsWon: 145, roundsLost: 110 },
    { id: 4, name: "G2 Esports", logo: "🎮", roundsWon: 142, roundsLost: 115 },
  ];

  const players: Player[] = [
    {
      id: 1,
      name: "karrigan",
      teamId: 1,
      teamName: "FaZe Clan",
      role: "IGL",
      kills: 245,
      deaths: 198,
      assists: 87,
    },
    {
      id: 2,
      name: "rain",
      teamId: 1,
      teamName: "FaZe Clan",
      role: "Rifler",
      kills: 278,
      deaths: 203,
      assists: 65,
    },
    {
      id: 3,
      name: "s1mple",
      teamId: 2,
      teamName: "Natus Vincere",
      role: "AWPer",
      kills: 325,
      deaths: 165,
      assists: 72,
    },
    {
      id: 4,
      name: "ZywOo",
      teamId: 3,
      teamName: "Vitality",
      role: "AWPer",
      kills: 310,
      deaths: 170,
      assists: 68,
    },
  ];

  const matches: Match[] = [
    {
      id: 1,
      team1: "FaZe Clan 🔥",
      team2: "Natus Vincere ⭐",
      date: "2025-11-04 18:00",
      status: "scheduled",
    },
    {
      id: 2,
      team1: "Vitality 🐝",
      team2: "G2 Esports 🎮",
      date: "2025-11-03 20:00",
      status: "live",
      score: "12-10",
    },
    {
      id: 3,
      team1: "FaZe Clan 🔥",
      team2: "Vitality 🐝",
      date: "2025-11-02 16:00",
      status: "completed",
      score: "16-14",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-black via-gray-950 to-black min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Manage Fight Club Tournament - Season 2025
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            View Site
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-2">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "teams", label: "Teams", icon: "👥" },
              { id: "players", label: "Players", icon: "🎮" },
              { id: "matches", label: "Matches", icon: "⚔️" },
              { id: "settings", label: "Settings", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as
                      | "dashboard"
                      | "teams"
                      | "players"
                      | "matches"
                      | "settings"
                  )
                }
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalTeams}
                </div>
                <div className="text-sm text-gray-400">Total Teams</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <div className="text-3xl mb-2">🎮</div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalPlayers}
                </div>
                <div className="text-sm text-gray-400">Total Players</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <div className="text-3xl mb-2">⚔️</div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalMatches}
                </div>
                <div className="text-sm text-gray-400">Total Matches</div>
              </div>
              <div className="bg-red-900/50 backdrop-blur-sm rounded-xl p-6 border border-red-800">
                <div className="text-3xl mb-2">🔴</div>
                <div className="text-2xl font-bold text-red-400">
                  {stats.liveMatches}
                </div>
                <div className="text-sm text-red-300">Live Now</div>
              </div>
              <div className="bg-green-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-800">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-green-400">
                  {stats.completedMatches}
                </div>
                <div className="text-sm text-green-300">Completed</div>
              </div>
              <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-800">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-2xl font-bold text-blue-400">
                  {stats.scheduledMatches}
                </div>
                <div className="text-sm text-blue-300">Scheduled</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                {[
                  {
                    action: "Match completed",
                    detail: "FaZe Clan vs Vitality - 16:14",
                    time: "5 minutes ago",
                  },
                  {
                    action: "Match live",
                    detail: "Vitality vs G2 Esports - Map: Mirage",
                    time: "25 minutes ago",
                  },
                  {
                    action: "Team updated",
                    detail: "FaZe Clan roster updated",
                    time: "1 hour ago",
                  },
                  {
                    action: "Match scheduled",
                    detail: "FaZe Clan vs Natus Vincere - Tomorrow 18:00",
                    time: "2 hours ago",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div>
                      <div className="text-white font-semibold">
                        {activity.action}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {activity.detail}
                      </div>
                    </div>
                    <div className="text-gray-500 text-sm">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === "teams" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Team Management
              </h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                + Add New Team
              </button>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/50 border-b border-gray-800">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                      Team
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                      Rounds Won
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                      Rounds Lost
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                      Diff
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {teams.map((team) => (
                    <tr
                      key={team.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{team.logo}</span>
                          <span className="text-white font-semibold">
                            {team.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-400 font-semibold">
                          {team.roundsWon}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-400 font-semibold">
                          {team.roundsLost}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-semibold ${
                            team.roundsWon - team.roundsLost > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {team.roundsWon - team.roundsLost > 0 ? "+" : ""}
                          {team.roundsWon - team.roundsLost}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Team Form */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Add New Team
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter team name"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Logo Emoji
                  </label>
                  <input
                    type="text"
                    placeholder="🔥"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Rounds Won
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Rounds Lost
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === "players" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Player Management
              </h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                + Add New Player
              </button>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
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
                  {players.map((player) => (
                    <tr
                      key={player.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-white font-semibold">
                          {player.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{player.teamName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                          {player.role}
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
                        <span className="text-purple-400 font-semibold">
                          {(player.kills / player.deaths).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Player Form */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Add New Player
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Player Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter player name"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Team
                  </label>
                  <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Role
                  </label>
                  <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select role</option>
                    <option value="IGL">IGL</option>
                    <option value="AWPer">AWPer</option>
                    <option value="Rifler">Rifler</option>
                    <option value="Support">Support</option>
                    <option value="Entry">Entry Fragger</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Kills
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Deaths
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Assists
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Create Player
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === "matches" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Match Management
              </h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                + Schedule New Match
              </button>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
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
                  {matches.map((match) => (
                    <tr
                      key={match.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">
                          {match.team1} vs {match.team2}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{match.date}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-bold">
                          {match.score || "-"}
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
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                            Update Score
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Schedule Match Form */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Schedule New Match
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Team 1
                  </label>
                  <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
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
                    Team 2
                  </label>
                  <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
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
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm mb-2">
                    Map
                  </label>
                  <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select map</option>
                    <option value="mirage">Mirage</option>
                    <option value="inferno">Inferno</option>
                    <option value="nuke">Nuke</option>
                    <option value="ancient">Ancient</option>
                    <option value="dust2">Dust II</option>
                    <option value="vertigo">Vertigo</option>
                    <option value="anubis">Anubis</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Schedule Match
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              Tournament Settings
            </h2>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                General Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Fight Club"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Season
                  </label>
                  <input
                    type="text"
                    defaultValue="2025"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Tournament Status
                  </label>
                  <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="upcoming">Upcoming</option>
                    <option value="live" selected>
                      Live
                    </option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Display Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">
                      Show Live Indicator
                    </div>
                    <div className="text-gray-400 text-sm">
                      Display red live dot in navbar
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">
                      Public Leaderboard
                    </div>
                    <div className="text-gray-400 text-sm">
                      Make leaderboard visible to public
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Danger Zone
              </h3>
              <div className="space-y-4">
                <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                  Reset All Statistics
                </button>
                <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors ml-4">
                  Delete Tournament
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

