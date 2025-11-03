interface Team {
  id: number;
  name: string;
  logo: string;
  roundsWon: number;
  roundsLost: number;
}

export default function Home() {
  const teams: Team[] = [
    { id: 1, name: "FaZe Clan", logo: "🔥", roundsWon: 156, roundsLost: 98 },
    {
      id: 2,
      name: "Natus Vincere",
      logo: "⭐",
      roundsWon: 149,
      roundsLost: 102,
    },
    { id: 3, name: "Vitality", logo: "🐝", roundsWon: 145, roundsLost: 110 },
    { id: 4, name: "G2 Esports", logo: "🎮", roundsWon: 142, roundsLost: 115 },
    { id: 5, name: "Team Liquid", logo: "🐴", roundsWon: 138, roundsLost: 118 },
    { id: 6, name: "MOUZ", logo: "🐭", roundsWon: 135, roundsLost: 125 },
    { id: 7, name: "Heroic", logo: "🦁", roundsWon: 128, roundsLost: 130 },
    { id: 8, name: "ENCE", logo: "🦅", roundsWon: 120, roundsLost: 138 },
  ];

  // Sort teams by round difference (descending)
  const sortedTeams = [...teams].sort((a, b) => {
    const diffA = a.roundsWon - a.roundsLost;
    const diffB = b.roundsWon - b.roundsLost;
    return diffB - diffA;
  });

  return (
    <div className="bg-gradient-to-br from-black via-gray-950 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Tournament Leaderboard
          </h2>
          <p className="text-gray-400">Season 2025 - Live Rankings</p>
        </div>

        {/* Leaderboard Card */}
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
                {sortedTeams.map((team, index) => {
                  const roundDiff = team.roundsWon - team.roundsLost;
                  const isPositiveDiff = roundDiff > 0;

                  return (
                    <tr
                      key={team.id}
                      className="hover:bg-gray-800/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-lg font-bold ${
                            index === 0
                              ? "text-yellow-400"
                              : index === 1
                              ? "text-gray-300"
                              : index === 2
                              ? "text-orange-600"
                              : "text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{team.logo}</div>
                          <div className="text-lg font-semibold text-white">
                            {team.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-green-400 font-semibold text-lg">
                          {team.roundsWon}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-red-400 font-semibold text-lg">
                          {team.roundsLost}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-lg ${
                            isPositiveDiff
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {isPositiveDiff ? "+" : ""}
                          {roundDiff}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
            <div className="text-gray-400 text-sm mb-1">Total Teams</div>
            <div className="text-2xl font-bold text-white">{teams.length}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
            <div className="text-gray-400 text-sm mb-1">Total Rounds</div>
            <div className="text-2xl font-bold text-white">
              {teams.reduce(
                (sum, team) => sum + team.roundsWon + team.roundsLost,
                0
              )}
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
            <div className="text-gray-400 text-sm mb-1">Leading Team</div>
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <span>{sortedTeams[0].logo}</span>
              <span>{sortedTeams[0].name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
