import { MatchWithTeams } from "./types";

interface MatchesTableProps {
  matches: MatchWithTeams[];
  statusFilter: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEdit: (match: MatchWithTeams) => void;
  onDelete: (matchId: number) => void;
}

export default function MatchesTable({
  matches,
  statusFilter,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
}: MatchesTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {statusFilter === "all"
              ? "All Matches"
              : `${
                  statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
                } Matches`}{" "}
            ({matches.length})
          </h2>
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
            {matches.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  {searchQuery
                    ? "No matches found matching your search."
                    : "No matches yet. Schedule one to get started!"}
                </td>
              </tr>
            ) : (
              matches.map((match) => (
                <tr
                  key={match.id}
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{match.team1?.logo}</span>
                        <span className="text-white font-semibold">
                          {match.team1?.name || "Unknown Team"}
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm">vs</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{match.team2?.logo}</span>
                        <span className="text-white font-semibold">
                          {match.team2?.name || "Unknown Team"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">
                      {formatDate(match.match_date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="space-y-2">
                      <div className="text-white font-bold text-lg mb-2">
                        {match.team1_score}-{match.team2_score}
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        {match.maps && match.maps.length > 0 ? (
                          match.maps.map((map) => (
                            <div
                              key={map.id}
                              className="flex justify-center items-center space-x-2"
                            >
                              <span className="text-gray-500">
                                Map {map.map_number}:
                              </span>
                              <span
                                className={
                                  map.winner_team_id === match.team1_id
                                    ? "text-green-400 font-semibold"
                                    : "text-gray-400"
                                }
                              >
                                {map.team1_score}
                              </span>
                              <span className="text-gray-500">-</span>
                              <span
                                className={
                                  map.winner_team_id === match.team2_id
                                    ? "text-green-400 font-semibold"
                                    : "text-gray-400"
                                }
                              >
                                {map.team2_score}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500">No map data</div>
                        )}
                      </div>
                    </div>
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
                      <button
                        onClick={() => onEdit(match)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(match.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

