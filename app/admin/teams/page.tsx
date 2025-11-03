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

export default function AdminTeamsPage() {
  const [teams] = useState<Team[]>([
    { id: 1, name: "FaZe Clan", logo: "🔥", roundsWon: 156, roundsLost: 98 },
    {
      id: 2,
      name: "Natus Vincere",
      logo: "⭐",
      roundsWon: 149,
      roundsLost: 102,
    },
    { id: 3, name: "Vitality", logo: "🐝", roundsWon: 145, roundsLost: 110 },
    { id: 4, name: "G2 Esports", logo: "🎮", roundsWon: 142, roundsLost: 115 },
    { id: 5, name: "Team Liquid", logo: "🐴", roundsWon: 138, roundsLost: 118 },
    { id: 6, name: "MOUZ", logo: "🐭", roundsWon: 135, roundsLost: 125 },
    { id: 7, name: "Heroic", logo: "🦁", roundsWon: 128, roundsLost: 130 },
    { id: 8, name: "ENCE", logo: "🦅", roundsWon: 120, roundsLost: 138 },
  ]);

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
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              + Add New Team
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white">{teams.length}</div>
            <div className="text-sm text-gray-400">Total Teams</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-green-400">
              {teams.filter((t) => t.roundsWon > t.roundsLost).length}
            </div>
            <div className="text-sm text-gray-400">Positive W/L</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-blue-400">
              {teams.reduce((sum, t) => sum + t.roundsWon, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Rounds Won</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">📉</div>
            <div className="text-2xl font-bold text-red-400">
              {teams.reduce((sum, t) => sum + t.roundsLost, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Rounds Lost</div>
          </div>
        </div>

        {/* Teams Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">All Teams</h2>
              <input
                type="text"
                placeholder="Search teams..."
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
                    Rounds Won
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Rounds Lost
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Diff
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Win Rate
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {teams.map((team) => {
                  const diff = team.roundsWon - team.roundsLost;
                  const winRate = (
                    (team.roundsWon / (team.roundsWon + team.roundsLost)) *
                    100
                  ).toFixed(1);

                  return (
                    <tr
                      key={team.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{team.logo}</span>
                          <div>
                            <div className="text-white font-semibold">
                              {team.name}
                            </div>
                            <div className="text-gray-400 text-sm">
                              ID: {team.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-400 font-semibold text-lg">
                          {team.roundsWon}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-400 font-semibold text-lg">
                          {team.roundsLost}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-semibold ${
                            diff > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {diff > 0 ? "+" : ""}
                          {diff}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-blue-400 font-semibold">
                          {winRate}%
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
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Team Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Add New Team</h3>
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
                defaultValue="0"
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
                defaultValue="0"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Create Team
            </button>
            <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

