import { MatchMap, MapPlayerStats, Team } from "./types";
import MapCard from "./MapCard";

interface MatchMapsListProps {
  maps: MatchMap[];
  team1?: Team;
  team2?: Team;
  team1Id: number;
  team2Id: number;
  isLoading: boolean;
  expandedMaps: Set<number>;
  loadingStats: Set<number>;
  playerStatsData: Record<number, MapPlayerStats[]>;
  onToggleMapExpand: (mapId: number) => void;
}

export default function MatchMapsList({
  maps,
  team1,
  team2,
  team1Id,
  team2Id,
  isLoading,
  expandedMaps,
  loadingStats,
  playerStatsData,
  onToggleMapExpand,
}: MatchMapsListProps) {
  if (isLoading) {
    return <div className="text-center text-gray-400 py-4">Loading maps...</div>;
  }

  if (maps.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No maps data available for this match.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
        <span>🗺️</span>
        <span>Maps Played</span>
      </h3>
      {maps.map((map) => (
        <MapCard
          key={map.id}
          map={map}
          team1={team1}
          team2={team2}
          team1Id={team1Id}
          team2Id={team2Id}
          isExpanded={expandedMaps.has(map.id)}
          isLoadingStats={loadingStats.has(map.id)}
          playerStats={playerStatsData[map.id] || []}
          onToggleExpand={onToggleMapExpand}
        />
      ))}
    </div>
  );
}

