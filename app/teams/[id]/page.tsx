import Link from "next/link";

interface Player {
  id: number;
  name: string;
  role: string;
  kills: number;
  deaths: number;
  assists: number;
  gamesPlayed: number;
}

interface Match {
  id: number;
  opponent: string;
  opponentLogo: string;
  date: string;
  result: "win" | "loss";
  score: string;
  map: string;
}

interface TeamData {
  id: number;
  name: string;
  logo: string;
  rank: number;
  roundsWon: number;
  roundsLost: number;
  matchesWon: number;
  matchesLost: number;
  players: Player[];
  matches: Match[];
}

// Sample team data - in a real app, this would come from an API or database
const getTeamData = (id: string): TeamData => {
  const teams: { [key: string]: TeamData } = {
    "1": {
      id: 1,
      name: "FaZe Clan",
      logo: "🔥",
      rank: 1,
      roundsWon: 156,
      roundsLost: 98,
      matchesWon: 12,
      matchesLost: 3,
      players: [
        {
          id: 1,
          name: "karrigan",
          role: "IGL",
          kills: 245,
          deaths: 198,
          assists: 87,
          gamesPlayed: 15,
        },
        {
          id: 2,
          name: "rain",
          role: "Rifler",
          kills: 278,
          deaths: 203,
          assists: 65,
          gamesPlayed: 15,
        },
        {
          id: 3,
          name: "Twistzz",
          role: "Rifler",
          kills: 289,
          deaths: 195,
          assists: 72,
          gamesPlayed: 15,
        },
        {
          id: 4,
          name: "ropz",
          role: "Support",
          kills: 264,
          deaths: 189,
          assists: 94,
          gamesPlayed: 15,
        },
        {
          id: 5,
          name: "frozen",
          role: "AWPer",
          kills: 312,
          deaths: 178,
          assists: 58,
          gamesPlayed: 15,
        },
      ],
      matches: [
        {
          id: 1,
          opponent: "Natus Vincere",
          opponentLogo: "⭐",
          date: "Nov 2, 2025",
          result: "win",
          score: "16-14",
          map: "Mirage",
        },
        {
          id: 2,
          opponent: "Vitality",
          opponentLogo: "🐝",
          date: "Nov 1, 2025",
          result: "win",
          score: "16-12",
          map: "Inferno",
        },
        {
          id: 3,
          opponent: "G2 Esports",
          opponentLogo: "🎮",
          date: "Oct 31, 2025",
          result: "loss",
          score: "13-16",
          map: "Ancient",
        },
        {
          id: 4,
          opponent: "Team Liquid",
          opponentLogo: "🐴",
          date: "Oct 30, 2025",
          result: "win",
          score: "16-9",
          map: "Dust II",
        },
        {
          id: 5,
          opponent: "MOUZ",
          opponentLogo: "🐭",
          date: "Oct 29, 2025",
          result: "win",
          score: "16-11",
          map: "Nuke",
        },
      ],
    },
  };

  return (
    teams[id] || {
      id: 1,
      name: "FaZe Clan",
      logo: "🔥",
      rank: 1,
      roundsWon: 156,
      roundsLost: 98,
      matchesWon: 12,
      matchesLost: 3,
      players: [],
      matches: [],
    }
  );
};

export default function TeamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const team = getTeamData(params.id);
  const roundDiff = team.roundsWon - team.roundsLost;
  const winRate = (
    (team.matchesWon / (team.matchesWon + team.matchesLost)) *
    100
  ).toFixed(1);

  return (
    <div className="bg-gradient-to-br from-black via-gray-950 to-black min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Team Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-800 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="text-7xl">{team.logo}</div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {team.name}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                    Rank #{team.rank}
                  </span>
                  <span className="text-gray-400 text-sm">
                    Season 2025
                  </span>
                </div>
              </div>
            </div>

            {/* Team Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {team.matchesWon}
                </div>
                <div className="text-xs text-gray-400 uppercase">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {team.matchesLost}
                </div>
                <div className="text-xs text-gray-400 uppercase">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {winRate}%
                </div>
                <div className="text-xs text-gray-400 uppercase">Win Rate</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    roundDiff > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {roundDiff > 0 ? "+" : ""}
                  {roundDiff}
                </div>
                <div className="text-xs text-gray-400 uppercase">
                  Round Diff
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Players Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">Team Roster</h2>
            <p className="text-gray-400 text-sm mt-1">
              Player statistics and performance
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/50 border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Games
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Kills
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Deaths
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Assists
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    K/D Ratio
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    K/D/A
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {team.players.map((player) => {
                  const kdRatio = (player.kills / player.deaths).toFixed(2);
                  const kda = (
                    (player.kills + player.assists) /
                    player.deaths
                  ).toFixed(2);

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-gray-800/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-white">
                          {player.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-medium">
                          {player.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-gray-300 font-medium">
                          {player.gamesPlayed}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-green-400 font-semibold text-lg">
                          {player.kills}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-red-400 font-semibold text-lg">
                          {player.deaths}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-blue-400 font-semibold text-lg">
                          {player.assists}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`font-bold ${
                            parseFloat(kdRatio) >= 1.0
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {kdRatio}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-purple-400 font-bold">
                          {kda}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Match History Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">Match History</h2>
            <p className="text-gray-400 text-sm mt-1">
              Recent matches and results
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/50 border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Opponent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Map
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {team.matches.map((match) => (
                  <tr
                    key={match.id}
                    className="hover:bg-gray-800/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-400 text-sm">
                        {match.date}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{match.opponentLogo}</span>
                        <span className="text-white font-semibold">
                          {match.opponent}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300 font-medium">
                        {match.map}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-white font-bold text-lg">
                        {match.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {match.result === "win" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-bold uppercase text-sm">
                          Win
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold uppercase text-sm">
                          Loss
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            <span className="mr-2">←</span>
            Back to Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}

