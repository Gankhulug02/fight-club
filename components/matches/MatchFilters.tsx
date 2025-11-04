interface MatchFiltersProps {
  statusFilter: string;
  onFilterChange: (filter: string) => void;
  counts: {
    all: number;
    live: number;
    scheduled: number;
    completed: number;
  };
}

export default function MatchFilters({
  statusFilter,
  onFilterChange,
  counts,
}: MatchFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onFilterChange("all")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          statusFilter === "all"
            ? "bg-blue-600 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
      >
        All Matches ({counts.all})
      </button>
      <button
        onClick={() => onFilterChange("live")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          statusFilter === "live"
            ? "bg-red-600 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
      >
        🔴 Live ({counts.live})
      </button>
      <button
        onClick={() => onFilterChange("scheduled")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          statusFilter === "scheduled"
            ? "bg-blue-600 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
      >
        📅 Scheduled ({counts.scheduled})
      </button>
      <button
        onClick={() => onFilterChange("completed")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          statusFilter === "completed"
            ? "bg-green-600 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
      >
        ✅ Completed ({counts.completed})
      </button>
    </div>
  );
}

