import { PlayerStats } from "./types";

interface StatsOverviewProps {
  totalPlayers: number;
  totalKills: number;
  totalAssists: number;
  topPlayer: PlayerStats | undefined;
  sortBy: "kills" | "kd" | "assists";
}

export default function StatsOverview({
  totalPlayers,
  totalKills,
  totalAssists,
  topPlayer,
  sortBy,
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <div className="text-3xl mb-2">👥</div>
        <div className="text-2xl font-bold text-white">{totalPlayers}</div>
        <div className="text-sm text-gray-400">Total Players</div>
      </div>
      <div className="bg-green-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-800">
        <div className="text-3xl mb-2">💀</div>
        <div className="text-2xl font-bold text-green-400">
          {totalKills.toLocaleString()}
        </div>
        <div className="text-sm text-green-300">Total Kills</div>
      </div>
      <div className="bg-yellow-900/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-800">
        <div className="text-3xl mb-2">🤝</div>
        <div className="text-2xl font-bold text-yellow-400">
          {totalAssists.toLocaleString()}
        </div>
        <div className="text-sm text-yellow-300">Total Assists</div>
      </div>
      <div className="bg-purple-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-800">
        <div className="text-3xl mb-2">👑</div>
        <div className="text-2xl font-bold text-purple-400 flex items-center gap-2">
          {topPlayer ? (
            <>
              <span>{topPlayer.player.avatar}</span>
              <span className="text-lg truncate">{topPlayer.player.name}</span>
            </>
          ) : (
            <span className="text-gray-500 text-sm">No data</span>
          )}
        </div>
        <div className="text-sm text-purple-300">
          Top by {sortBy === "kd" ? "K/D" : sortBy}
        </div>
      </div>
    </div>
  );
}

