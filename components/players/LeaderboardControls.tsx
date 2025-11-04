interface LeaderboardControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "kills" | "kd" | "assists";
  onSortChange: (sort: "kills" | "kd" | "assists") => void;
}

export default function LeaderboardControls({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: LeaderboardControlsProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Search players, teams, roles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full md:w-80 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Sort Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onSortChange("kills")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === "kills"
                ? "bg-green-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            💀 Kills
          </button>
          <button
            onClick={() => onSortChange("kd")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === "kd"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            📊 K/D
          </button>
          <button
            onClick={() => onSortChange("assists")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === "assists"
                ? "bg-yellow-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            🤝 Assists
          </button>
        </div>
      </div>
    </div>
  );
}

