interface StatusFilterProps {
  statusFilter: string;
  liveMatches: number;
  scheduledMatches: number;
  completedMatches: number;
  onFilterChange: (filter: string) => void;
}

export default function StatusFilter({
  statusFilter,
  liveMatches,
  scheduledMatches,
  completedMatches,
  onFilterChange,
}: StatusFilterProps) {
  return (
    <div className="flex space-x-3">
      <button
        onClick={() => onFilterChange("all")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          statusFilter === "all"
            ? "bg-blue-600 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
      >
        All Matches
      </button>
      <button
        onClick={() => onFilterChange("live")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          statusFilter === "live"
            ? "bg-red-600 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
      >
        Live ({liveMatches})
      </button>
      <button
        onClick={() => onFilterChange("scheduled")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          statusFilter === "scheduled"
            ? "bg-blue-600 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
      >
        Scheduled ({scheduledMatches})
      </button>
      <button
        onClick={() => onFilterChange("completed")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          statusFilter === "completed"
            ? "bg-green-600 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
      >
        Completed ({completedMatches})
      </button>
    </div>
  );
}

