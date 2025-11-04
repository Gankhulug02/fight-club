interface MatchStatsOverviewProps {
  totalMatches: number;
  liveMatches: number;
  scheduledMatches: number;
  completedMatches: number;
}

export default function MatchStatsOverview({
  totalMatches,
  liveMatches,
  scheduledMatches,
  completedMatches,
}: MatchStatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <div className="text-3xl mb-2">⚔️</div>
        <div className="text-2xl font-bold text-white">{totalMatches}</div>
        <div className="text-sm text-gray-400">Total Matches</div>
      </div>
      <div className="bg-red-900/50 backdrop-blur-sm rounded-xl p-6 border border-red-800">
        <div className="text-3xl mb-2">🔴</div>
        <div className="text-2xl font-bold text-red-400">{liveMatches}</div>
        <div className="text-sm text-red-300">Live Now</div>
      </div>
      <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-800">
        <div className="text-3xl mb-2">📅</div>
        <div className="text-2xl font-bold text-blue-400">
          {scheduledMatches}
        </div>
        <div className="text-sm text-blue-300">Scheduled</div>
      </div>
      <div className="bg-green-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-800">
        <div className="text-3xl mb-2">✅</div>
        <div className="text-2xl font-bold text-green-400">
          {completedMatches}
        </div>
        <div className="text-sm text-green-300">Completed</div>
      </div>
    </div>
  );
}

