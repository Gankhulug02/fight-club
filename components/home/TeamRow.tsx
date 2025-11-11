import Link from "next/link";
import { memo } from "react";
import { Team } from "./types";
import { TeamLogo } from "../shared/TeamLogo";

interface TeamRowProps {
  team: Team;
  rank: number;
  isEliminated?: boolean;
}

function TeamRow({ team, rank, isEliminated = false }: TeamRowProps) {
  const roundDiff = team.rounds_won - team.rounds_lost;
  const isPositiveDiff = roundDiff > 0;
  const totalMatches = team.matches_won + team.matches_lost;
  const winRate =
    totalMatches > 0
      ? ((team.matches_won / totalMatches) * 100).toFixed(0)
      : "0";

  return (
    <tr
      className={`transition-colors duration-150 ${
        isEliminated
          ? "bg-red-950/30 border-l-4 border-l-red-500 hover:bg-red-900/40"
          : "hover:bg-gray-800/30"
      }`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <div
            className={`text-lg font-bold ${
              isEliminated ? "text-red-400" : "text-white"
            }`}
          >
            {rank + 1}
          </div>
          {isEliminated && (
            <span
              className="text-red-500 text-sm"
              title="5th team will be eliminated"
            >
              ⚠️
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          href={`/teams/${team.id}`}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <TeamLogo logo={team.logo} />
          <div>
            <div className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
              {team.name}
            </div>
            <div className="text-xs text-gray-500">{winRate}% win rate</div>
          </div>
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className="text-green-400 font-bold text-lg">
          {team.matches_won}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className="text-red-400 font-bold text-lg">
          {team.matches_lost}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className="text-green-400 font-semibold text-lg">
          {team.rounds_won}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className="text-red-400 font-semibold text-lg">
          {team.rounds_lost}
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
}

export default memo(TeamRow);
