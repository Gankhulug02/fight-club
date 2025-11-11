import { Team } from "./types";
import TeamRow from "./TeamRow";

interface LeaderboardTableProps {
  teams: Team[];
}

export default function LeaderboardTable({ teams }: LeaderboardTableProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black/50 border-b border-gray-800">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                W
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                L
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Rounds Won
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Rounds Lost
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Diff
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {teams.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No teams yet. Add teams and matches from the admin panel!
                </td>
              </tr>
            ) : (
              teams.map((team, index) => (
                <TeamRow
                  key={team.id}
                  team={team}
                  rank={index}
                  isEliminated={index === 4}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
