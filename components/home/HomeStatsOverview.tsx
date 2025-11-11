import { Team } from "./types";
import { TeamLogo } from "../shared/TeamLogo";

interface HomeStatsOverviewProps {
  teams: Team[];
  leadingTeam: Team | null;
}

export default function HomeStatsOverview({
  teams,
  leadingTeam,
}: HomeStatsOverviewProps) {
  const totalMatches =
    teams.reduce((sum, team) => sum + team.matches_won + team.matches_lost, 0) /
    2;

  const totalRounds =
    teams.reduce((sum, team) => sum + team.rounds_won + team.rounds_lost, 0) /
    2;

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
        <div className="text-gray-400 text-sm mb-1">Total Teams</div>
        <div className="text-2xl font-bold text-white">{teams.length}</div>
      </div>
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
        <div className="text-gray-400 text-sm mb-1">Total Matches</div>
        <div className="text-2xl font-bold text-white">{totalMatches}</div>
      </div>
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
        <div className="text-gray-400 text-sm mb-1">Total Rounds</div>
        <div className="text-2xl font-bold text-white">{totalRounds}</div>
      </div>
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 text-center">
        <div className="text-gray-400 text-sm mb-1">Leading Team</div>
        <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          {leadingTeam ? (
            <>
              <TeamLogo logo={leadingTeam.logo} />
              <span>{leadingTeam.name}</span>
            </>
          ) : (
            <span className="text-gray-500">No teams yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
