"use client";

import { useState } from "react";
import Link from "next/link";

interface Match {
  id: number;
  team1: string;
  team1Logo: string;
  team2: string;
  team2Logo: string;
  date: string;
  map: string;
  status: "scheduled" | "live" | "completed";
  score?: string;
}

interface Team {
  id: number;
  name: string;
  logo: string;
}

export default function AdminMatchesPage() {
  const [matches] = useState<Match[]>([
    {
      id: 1,
      team1: "FaZe Clan",
      team1Logo: "🔥",
      team2: "Natus Vincere",
      team2Logo: "⭐",
      date: "2025-11-04 18:00",
      map: "Mirage",
      status: "scheduled",
    },
    {
      id: 2,
      team1: "Vitality",
      team1Logo: "🐝",
      team2: "G2 Esports",
      team2Logo: "🎮",
      date: "2025-11-03 20:00",
      map: "Inferno",
      status: "live",
      score: "12-10",
    },
    {
      id: 3,
      team1: "FaZe Clan",
      team1Logo: "🔥",
      team2: "Vitality",
      team2Logo: "🐝",
      date: "2025-11-02 16:00",
      map: "Dust II",
      status: "completed",
      score: "16-14",
    },
    {
      id: 4,
      team1: "Team Liquid",
      team1Logo: "🐴",
      team2: "MOUZ",
      team2Logo: "🐭",
      date: "2025-11-02 14:00",
      map: "Nuke",
      status: "completed",
      score: "16-11",
    },
    {
      id: 5,
      team1: "Heroic",
      team1Logo: "🦁",
      team2: "ENCE",
      team2Logo: "🦅",
      date: "2025-11-01 19:00",
      map: "Ancient",
      status: "completed",
      score: "13-16",
    },
    {
      id: 6,
      team1: "Natus Vincere",
      team2Logo: "⭐",
      team2: "G2 Esports",
      team2Logo: "🎮",
      date: "2025-11-05 16:00",
      map: "Vertigo",
      status: "scheduled",
    },
  ]);

  const teams: Team[] = [
    { id: 1, name: "FaZe Clan", logo: "🔥" },
    { id: 2, name: "Natus Vincere", logo: "⭐" },
    { id: 3, name: "Vitality", logo: "🐝" },
    { id: 4, name: "G2 Esports", logo: "🎮" },
    { id: 5, name: "Team Liquid", logo: "🐴" },
    { id: 6, name: "MOUZ", logo: "🐭" },
    { id: 7, name: "Heroic", logo: "🦁" },
    { id: 8, name: "ENCE", logo: "🦅" },
  ];

  const liveMatches = matches.filter((m) => m.status === "live").length;
  const scheduledMatches = matches.filter((m) => m.status === "scheduled")
    .length;
  const completedMatches = matches.filter((m) => m.status === "completed")
    .length;

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
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              + Schedule New Match
            </button>
          </div>
        </div>

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
            <div className="text-2xl font-bold text-red-400">
              {liveMatches}
            </div>
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
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            All Matches
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors">
            Live
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors">
            Scheduled
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors">
            Completed
          </button>
        </div>

        {/* Matches Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">All Matches</h2>
              <input
                type="text"
                placeholder="Search matches..."
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
                    Map
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
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{match.team1Logo}</span>
                          <span className="text-white font-semibold">
                            {match.team1}
                          </span>
                        </div>
                        <div className="text-gray-500 text-sm">vs</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{match.team2Logo}</span>
                          <span className="text-white font-semibold">
                            {match.team2}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 font-medium">
                        {match.map}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{match.date}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-white font-bold text-lg">
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
                        {match.status !== "completed" && (
                          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                            Update Score
                          </button>
                        )}
                        <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                          {match.status === "scheduled" ? "Cancel" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Match Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Schedule New Match
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <label className="block text-gray-400 text-sm mb-2">Map</label>
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
            <div>
              <label className="block text-gray-400 text-sm mb-2">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Time</label>
              <input
                type="time"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Status
              </label>
              <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Schedule Match
            </button>
            <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">▶️</div>
              <div>Start Live Match</div>
              <div className="text-sm text-green-200 mt-1">
                Change match status to live
              </div>
            </button>
            <button className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <div>Update Scores</div>
              <div className="text-sm text-blue-200 mt-1">
                Bulk update match results
              </div>
            </button>
            <button className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">📅</div>
              <div>View Schedule</div>
              <div className="text-sm text-purple-200 mt-1">
                See all upcoming matches
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

