"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminSettingsPage() {
  const [tournamentName, setTournamentName] = useState("Fight Club");
  const [season, setSeason] = useState("2025");
  const [status, setStatus] = useState("live");
  const [showLiveIndicator, setShowLiveIndicator] = useState(true);
  const [publicLeaderboard, setPublicLeaderboard] = useState(true);

  return (
    <div className=" min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
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
              Tournament Settings
            </h1>
            <p className="text-gray-400">
              Configure Fight Club Tournament settings and preferences
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            View Site
          </Link>
        </div>

        {/* General Settings */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            General Settings
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">
                Tournament Name
              </label>
              <input
                type="text"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">
                Season
              </label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">
                Tournament Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">
                Tournament Format
              </label>
              <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="round-robin">Round Robin</option>
                <option value="single-elimination">Single Elimination</option>
                <option value="double-elimination">Double Elimination</option>
                <option value="swiss">Swiss System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Display Settings
          </h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="text-white font-semibold mb-1">
                  Show Live Indicator
                </div>
                <div className="text-gray-400 text-sm">
                  Display animated red live indicator in the navbar
                </div>
              </div>
              <button
                onClick={() => setShowLiveIndicator(!showLiveIndicator)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  showLiveIndicator ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    showLiveIndicator ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="text-white font-semibold mb-1">
                  Public Leaderboard
                </div>
                <div className="text-gray-400 text-sm">
                  Make leaderboard and stats visible to public
                </div>
              </div>
              <button
                onClick={() => setPublicLeaderboard(!publicLeaderboard)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  publicLeaderboard ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    publicLeaderboard ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="text-white font-semibold mb-1">
                  Show Player Stats
                </div>
                <div className="text-gray-400 text-sm">
                  Display detailed player statistics on team pages
                </div>
              </div>
              <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-blue-600">
                <span className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform translate-x-8" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="text-white font-semibold mb-1">
                  Enable Match History
                </div>
                <div className="text-gray-400 text-sm">
                  Show match history on team detail pages
                </div>
              </div>
              <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-blue-600">
                <span className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform translate-x-8" />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="text-white font-semibold mb-1">
                  Match Start Notifications
                </div>
                <div className="text-gray-400 text-sm">
                  Notify when matches begin
                </div>
              </div>
              <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-blue-600">
                <span className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform translate-x-8" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="text-white font-semibold mb-1">
                  Match End Notifications
                </div>
                <div className="text-gray-400 text-sm">
                  Notify when matches are completed
                </div>
              </div>
              <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-blue-600">
                <span className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform translate-x-8" />
              </button>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">API Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">
                API Endpoint
              </label>
              <input
                type="text"
                value="https://api.fightclub.gg/v1"
                readOnly
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">
                API Key
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value="sk_live_1234567890abcdef"
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 focus:outline-none"
                />
                <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl border border-red-800 p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-6">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg border border-red-800">
              <div>
                <div className="text-white font-semibold mb-1">
                  Reset All Statistics
                </div>
                <div className="text-red-300 text-sm">
                  This will reset all team and player statistics
                </div>
              </div>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                Reset Stats
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg border border-red-800">
              <div>
                <div className="text-white font-semibold mb-1">
                  Clear All Matches
                </div>
                <div className="text-red-300 text-sm">
                  Delete all match history and schedules
                </div>
              </div>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                Clear Matches
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg border border-red-800">
              <div>
                <div className="text-white font-semibold mb-1">
                  Delete Tournament
                </div>
                <div className="text-red-300 text-sm">
                  Permanently delete this tournament and all data
                </div>
              </div>
              <button className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg transition-colors">
                Delete Tournament
              </button>
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex justify-end space-x-3">
          <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
            Cancel
          </button>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
