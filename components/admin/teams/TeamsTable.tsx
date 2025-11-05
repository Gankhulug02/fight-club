import { Team } from "./types";
import { TeamRow } from "./TeamRow";

interface TeamsTableProps {
  teams: Team[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (teamId: number, teamName: string) => void;
}

export function TeamsTable({
  teams,
  searchQuery,
  onSearchChange,
  onEditTeam,
  onDeleteTeam,
}: TeamsTableProps) {
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            All Teams ({filteredTeams.length})
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
                Team
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                W
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                L
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                Rounds Won
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                Rounds Lost
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                Round Diff
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                Match Win %
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                  {searchQuery
                    ? "No teams found matching your search."
                    : "No teams yet. Add one to get started!"}
                </td>
              </tr>
            ) : (
              filteredTeams.map((team) => (
                <TeamRow
                  key={team.id}
                  team={team}
                  onEdit={onEditTeam}
                  onDelete={onDeleteTeam}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

