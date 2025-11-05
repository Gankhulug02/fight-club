import Link from "next/link";
import { Team } from "./types";

interface TeamRowProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (teamId: number, teamName: string) => void;
}

export function TeamRow({ team, onEdit, onDelete }: TeamRowProps) {
  const roundDiff = team.rounds_won - team.rounds_lost;
  const totalMatches = team.matches_won + team.matches_lost;
  const matchWinRate =
    totalMatches > 0
      ? ((team.matches_won / totalMatches) * 100).toFixed(1)
      : "0.0";
  const matchRecord = `${team.matches_won}-${team.matches_lost}`;

  return (
    <tr className="hover:bg-gray-800/30 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{team.logo}</span>
          <div>
            <div className="text-white font-semibold">{team.name}</div>
            <div className="text-gray-400 text-sm">{matchRecord}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-green-400 font-semibold text-lg">
          {team.matches_won}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-red-400 font-semibold text-lg">
          {team.matches_lost}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-green-400 font-semibold">{team.rounds_won}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-red-400 font-semibold">{team.rounds_lost}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span
          className={`font-semibold ${
            roundDiff > 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {roundDiff > 0 ? "+" : ""}
          {roundDiff}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span
          className={`font-semibold ${
            parseFloat(matchWinRate) >= 50 ? "text-blue-400" : "text-yellow-400"
          }`}
        >
          {matchWinRate}%
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <Link
            href={`/teams/${team.id}`}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
          >
            View
          </Link>
          <button
            onClick={() => onEdit(team)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(team.id, team.name)}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

