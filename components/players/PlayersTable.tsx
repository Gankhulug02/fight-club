import PlayerRow from "./PlayerRow";
import { PlayerStats } from "./types";

interface PlayersTableProps {
  players: PlayerStats[];
  searchQuery: string;
}

export default function PlayersTable({
  players,
  searchQuery,
}: PlayersTableProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black/50 border-b border-gray-800">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Maps
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Kills
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Assists
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Deaths
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                K/D
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {players.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  <div className="text-6xl mb-4">🎮</div>
                  <p className="text-lg">
                    {searchQuery
                      ? "No players found matching your search."
                      : "No players yet. Check back later!"}
                  </p>
                </td>
              </tr>
            ) : (
              players.map((ps, index) => (
                <PlayerRow key={ps.player.id} playerStats={ps} rank={index} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

