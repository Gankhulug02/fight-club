"use client";

import { useState } from "react";
import Link from "next/link";

interface Player {
  id: number;
  name: string;
  teamId: number;
  teamName: string;
  teamLogo: string;
  role: string;
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
  const [players] = useState<Player[]>([
    {
      id: 1,
      name: "karrigan",
      teamId: 1,
      teamName: "FaZe Clan",
      teamLogo: "🔥",
      role: "IGL",
      kills: 245,
      deaths: 198,
      assists: 87,
      gamesPlayed: 15,
    },
    {
      id: 2,
      name: "rain",
      teamId: 1,
      teamName: "FaZe Clan",
      teamLogo: "🔥",
      role: "Rifler",
      kills: 278,
      deaths: 203,
      assists: 65,
      gamesPlayed: 15,
    },
    {
      id: 3,
      name: "Twistzz",
      teamId: 1,
      teamName: "FaZe Clan",
      teamLogo: "🔥",
      role: "Rifler",
      kills: 289,
      deaths: 195,
      assists: 72,
      gamesPlayed: 15,
    },
    {
      id: 4,
      name: "s1mple",
      teamId: 2,
      teamName: "Natus Vincere",
      teamLogo: "⭐",
      role: "AWPer",
      kills: 325,
      deaths: 165,
      assists: 72,
      gamesPlayed: 15,
    },
    {
      id: 5,
      name: "ZywOo",
      teamId: 3,
      teamName: "Vitality",
      teamLogo: "🐝",
      role: "AWPer",
      kills: 310,
      deaths: 170,
      assists: 68,
      gamesPlayed: 15,
    },
    {
      id: 6,
      name: "NiKo",
      teamId: 4,
      teamName: "G2 Esports",
      teamLogo: "🎮",
      role: "Rifler",
      kills: 295,
      deaths: 180,
      assists: 75,
      gamesPlayed: 15,
    },
  ]);

  const teams: Team[] = [
    { id: 1, name: "FaZe Clan", logo: "🔥" },
    { id: 2, name: "Natus Vincere", logo: "⭐" },
    { id: 3, name: "Vitality", logo: "🐝" },
    { id: 4, name: "G2 Esports", logo: "🎮" },
  ];

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
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              + Add New Player
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">🎮</div>
            <div className="text-2xl font-bold text-white">
              {players.length}
            </div>
            <div className="text-sm text-gray-400">Total Players</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">💀</div>
            <div className="text-2xl font-bold text-green-400">
              {players.reduce((sum, p) => sum + p.kills, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Kills</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">🤝</div>
            <div className="text-2xl font-bold text-blue-400">
              {players.reduce((sum, p) => sum + p.assists, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Assists</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-purple-400">
              {(
                players.reduce((sum, p) => sum + p.kills / p.deaths, 0) /
                players.length
              ).toFixed(2)}
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
                <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Role
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
                {players.map((player) => {
                  const kd = (player.kills / player.deaths).toFixed(2);

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-semibold">
                            {player.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            ID: {player.id}
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
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                          {player.role}
                        </span>
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

        {/* Add Player Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Add New Player</h3>
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
              <label className="block text-gray-400 text-sm mb-2">Team</label>
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
              <label className="block text-gray-400 text-sm mb-2">Role</label>
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
              <label className="block text-gray-400 text-sm mb-2">Kills</label>
              <input
                type="number"
                placeholder="0"
                defaultValue="0"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Deaths</label>
              <input
                type="number"
                placeholder="0"
                defaultValue="0"
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
                defaultValue="0"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Games Played
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
              Create Player
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
