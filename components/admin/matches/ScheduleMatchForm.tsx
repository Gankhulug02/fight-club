import { Team, BulkMatchFormData } from "./types";

interface ScheduleMatchFormProps {
  teams: Team[];
  formData: BulkMatchFormData;
  onFormChange: (data: BulkMatchFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ScheduleMatchForm({
  teams,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
}: ScheduleMatchFormProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Schedule Match</h3>
      <p className="text-gray-400 text-sm mb-6">
        Create one or more matches between two teams with 2-5 maps each
      </p>

      {/* Team Selection */}
      <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-3">Teams</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Team 1 <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.team1_id}
              onChange={(e) =>
                onFormChange({ ...formData, team1_id: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.logo} {team.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Team 2 <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.team2_id}
              onChange={(e) =>
                onFormChange({ ...formData, team2_id: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.logo} {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Match Day Settings */}
      <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-3">
          Match Day Settings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Number of Matches <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.number_of_matches}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  number_of_matches: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value={1}>1 Match</option>
              <option value={2}>2 Matches</option>
              <option value={3}>3 Matches</option>
              <option value={4}>4 Matches</option>
              <option value={5}>5 Matches</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Maps Per Match <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.maps_per_match}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  maps_per_match: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value={2}>2 Maps (Best of 2) - Default</option>
              <option value={3}>3 Maps (Best of 3)</option>
              <option value={4}>4 Maps (Best of 4)</option>
              <option value={5}>5 Maps (Best of 5)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Match Date & Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.match_date}
              onChange={(e) =>
                onFormChange({ ...formData, match_date: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      {formData.team1_id && formData.team2_id && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex flex-col space-y-2 text-blue-300">
            <div className="flex items-center space-x-2">
              <span className="text-lg">ℹ️</span>
              <span>
                This will create{" "}
                <strong>
                  {formData.number_of_matches}{" "}
                  {formData.number_of_matches === 1 ? "match" : "matches"}
                </strong>{" "}
                between{" "}
                <strong>
                  {teams.find((t) => t.id === parseInt(formData.team1_id))?.name}
                </strong>{" "}
                and{" "}
                <strong>
                  {teams.find((t) => t.id === parseInt(formData.team2_id))?.name}
                </strong>
              </span>
            </div>
            <div className="text-sm ml-7">
              {formData.number_of_matches === 1 ? "The match" : "Each match"}{" "}
              will have <strong>{formData.maps_per_match} maps</strong> (Best of{" "}
              {formData.maps_per_match})
              <br />
              Total:{" "}
              <strong>
                {formData.number_of_matches * formData.maps_per_match}{" "}
                {formData.number_of_matches * formData.maps_per_match === 1
                  ? "map"
                  : "maps"}
              </strong>{" "}
              will be created
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={onSubmit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Create {formData.number_of_matches}{" "}
          {formData.number_of_matches === 1 ? "Match" : "Matches"} (
          {formData.number_of_matches * formData.maps_per_match}{" "}
          {formData.number_of_matches * formData.maps_per_match === 1
            ? "map"
            : "maps"}{" "}
          total)
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

