import { memo } from "react";
import Link from "next/link";
import { MatchWithTeams, MatchMap, MapPlayerStats } from "./types";
import MatchMapsList from "./MatchMapsList";
import { formatDate, getRelativeTime } from "./utils";
import { TeamLogo } from "../shared/TeamLogo";

interface MatchCardProps {
  match: MatchWithTeams;
  isExpanded: boolean;
  isLoadingMaps: boolean;
  maps: MatchMap[];
  expandedMaps: Set<number>;
  loadingStats: Set<number>;
  playerStatsData: Record<number, MapPlayerStats[]>;
  onToggleExpand: (matchId: number) => void;
  onToggleMapExpand: (mapId: number) => void;
}

function MatchCard({
  match,
  isExpanded,
  isLoadingMaps,
  maps,
  expandedMaps,
  loadingStats,
  playerStatsData,
  onToggleExpand,
  onToggleMapExpand,
}: MatchCardProps) {
  const team1Won =
    match.status === "completed" && match.team1_score > match.team2_score;
  const team2Won =
    match.status === "completed" && match.team2_score > match.team1_score;
  const isDraw =
    match.status === "completed" && match.team1_score === match.team2_score;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all duration-200">
      {/* Match Card - Clickable */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-900/70 transition-colors"
        onClick={() => onToggleExpand(match.id)}
      >
        {/* Match Header - Status and Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {match.status === "live" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold uppercase text-xs animate-pulse">
                🔴 Live
              </span>
            )}
            {match.status === "completed" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-bold uppercase text-xs">
                ✅ Completed
              </span>
            )}
            {match.status === "scheduled" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase text-xs">
                📅 Scheduled
              </span>
            )}
            {match.status === "cancelled" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 font-bold uppercase text-xs">
                ❌ Cancelled
              </span>
            )}
            {/* Expand/Collapse Indicator */}
            <span className="text-gray-400 text-sm">
              {isExpanded ? "▼" : "▶"}
            </span>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-sm">
              {formatDate(match.match_date)}
            </div>
            <div className="text-gray-500 text-xs">
              {getRelativeTime(match.match_date)}
            </div>
          </div>
        </div>

        {/* Match Details */}
        <div className="grid grid-cols-7 gap-4 items-center">
          {/* Team 1 */}
          <div className="col-span-3">
            <div
              className="flex items-center space-x-3 group"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/teams/${match.team1_id}`}>
                <div
                  className={`text-4xl transition-transform group-hover:scale-110 ${
                    team1Won ? "animate-bounce" : ""
                  }`}
                >
                  <TeamLogo logo={match.team1?.logo || "❓"} />
                </div>
              </Link>
              <div className="flex-1">
                <Link href={`/teams/${match.team1_id}`}>
                  <div
                    className={`text-xl font-bold hover:text-blue-400 transition-colors ${
                      team1Won
                        ? "text-green-400"
                        : team2Won
                        ? "text-gray-500"
                        : "text-white"
                    }`}
                  >
                    {match.team1?.name || "Unknown Team"}
                  </div>
                </Link>
                {team1Won && (
                  <div className="text-xs text-green-400 font-semibold">
                    🏆 Winner
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="col-span-1 text-center">
            {match.status === "scheduled" ? (
              <div className="text-gray-500 text-lg font-bold">VS</div>
            ) : (
              <div className="space-y-1">
                <div className="text-3xl font-bold text-white">
                  {match.team1_score}
                  <span className="text-gray-600 mx-2">-</span>
                  {match.team2_score}
                </div>
                {isDraw && (
                  <div className="text-xs text-yellow-400 font-semibold">
                    DRAW
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div className="col-span-3">
            <div
              className="flex items-center space-x-3 group flex-row-reverse"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/teams/${match.team2_id}`}>
                <div
                  className={`text-4xl transition-transform group-hover:scale-110 ${
                    team2Won ? "animate-bounce" : ""
                  }`}
                >
                  <TeamLogo logo={match.team2?.logo || "❓"} />
                </div>
              </Link>
              <div className="flex-1 text-right">
                <Link href={`/teams/${match.team2_id}`}>
                  <div
                    className={`text-xl font-bold hover:text-blue-400 transition-colors ${
                      team2Won
                        ? "text-green-400"
                        : team1Won
                        ? "text-gray-500"
                        : "text-white"
                    }`}
                  >
                    {match.team2?.name || "Unknown Team"}
                  </div>
                </Link>
                {team2Won && (
                  <div className="text-xs text-green-400 font-semibold">
                    🏆 Winner
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Maps Section */}
      {isExpanded && (
        <div className="border-t border-gray-800 bg-gray-950/50 p-6">
          <MatchMapsList
            maps={maps}
            team1={match.team1}
            team2={match.team2}
            team1Id={match.team1_id}
            team2Id={match.team2_id}
            isLoading={isLoadingMaps}
            expandedMaps={expandedMaps}
            loadingStats={loadingStats}
            playerStatsData={playerStatsData}
            onToggleMapExpand={onToggleMapExpand}
          />
        </div>
      )}
    </div>
  );
}

export default memo(MatchCard);
