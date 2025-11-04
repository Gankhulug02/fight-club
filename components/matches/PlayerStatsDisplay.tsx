import { MapPlayerStats } from "./types";

interface PlayerStatsDisplayProps {
  stats: MapPlayerStats[];
  teamId: number;
  teamLogo?: string;
  teamName?: string;
}

export default function PlayerStatsDisplay({
  stats,
  teamId,
  teamLogo,
  teamName,
}: PlayerStatsDisplayProps) {
  const teamStats = stats.filter((stat) => stat.team_id === teamId);

  if (teamStats.length === 0) return null;

  return (
    <div>
      <div className="text-xs text-gray-400 mb-2 flex items-center space-x-2">
        <span>{teamLogo}</span>
        <span>{teamName}</span>
      </div>
      <div className="space-y-2">
        {teamStats.map((stat) => (
          <div
            key={stat.id}
            className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{stat.player?.avatar || "👤"}</div>
              <div>
                <div className="text-white font-medium text-sm">
                  {stat.player?.name || "Unknown Player"}
                </div>
                <div className="text-xs text-gray-400">
                  K/D:{" "}
                  {stat.deaths > 0
                    ? (stat.kills / stat.deaths).toFixed(2)
                    : stat.kills}
                </div>
              </div>
            </div>
            <div className="flex space-x-4 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-bold">{stat.kills}</div>
                <div className="text-xs text-gray-500">K</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold">{stat.assists}</div>
                <div className="text-xs text-gray-500">A</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold">{stat.deaths}</div>
                <div className="text-xs text-gray-500">D</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

