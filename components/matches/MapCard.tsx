import { memo } from "react";
import { MatchMap, MapPlayerStats, Team } from "./types";
import PlayerStatsDisplay from "./PlayerStatsDisplay";
import { TeamLogo } from "../shared/TeamLogo";

interface MapCardProps {
  map: MatchMap;
  team1?: Team;
  team2?: Team;
  team1Id: number;
  team2Id: number;
  isExpanded: boolean;
  isLoadingStats: boolean;
  playerStats: MapPlayerStats[];
  onToggleExpand: (mapId: number) => void;
}

function MapCard({
  map,
  team1,
  team2,
  team1Id,
  team2Id,
  isExpanded,
  isLoadingStats,
  playerStats,
  onToggleExpand,
}: MapCardProps) {
  const mapWinnerTeam =
    map.winner_team_id === team1Id
      ? team1
      : map.winner_team_id === team2Id
      ? team2
      : null;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Map Header - Clickable */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => onToggleExpand(map.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
            <span className="text-white font-medium">
              Map {map.map_number}
              {map.map_name && ` - ${map.map_name}`}
            </span>
            {map.status === "live" && (
              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white font-bold">
              {map.team1_score} - {map.team2_score}
            </div>
            {mapWinnerTeam && (
              <div className="text-sm text-green-400 flex items-center space-x-1">
                <TeamLogo logo={mapWinnerTeam.logo} />
                <span>{mapWinnerTeam.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Player Stats */}
      {isExpanded && (
        <div className="border-t border-gray-700 bg-black/30 p-4">
          {isLoadingStats ? (
            <div className="text-center text-gray-400 py-4">
              Loading player statistics...
            </div>
          ) : playerStats.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              No player statistics available for this map.
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-white font-medium text-sm mb-3">
                Player Statistics
              </h4>

              {/* Team 1 Players */}
              <PlayerStatsDisplay
                stats={playerStats}
                teamId={team1Id}
                teamLogo={team1?.logo || ""}
                teamName={team1?.name || ""}
              />

              {/* Team 2 Players */}
              <PlayerStatsDisplay
                stats={playerStats}
                teamId={team2Id}
                teamLogo={team2?.logo || ""}
                teamName={team2?.name || ""}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(MapCard);
