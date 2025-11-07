import { Team, MatchMap, MatchFormData } from "./types";

interface EditMatchFormProps {
  teams: Team[];
  formData: MatchFormData;
  editingMaps: MatchMap[];
  isUpdating: boolean;
  onFormChange: (data: MatchFormData) => void;
  onMapsChange: (maps: MatchMap[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDeleteMap: (mapId: number) => void;
  onAddMap: () => void;
}

export default function EditMatchForm({
  teams,
  formData,
  editingMaps,
  isUpdating,
  onFormChange,
  onMapsChange,
  onSubmit,
  onCancel,
  onDeleteMap,
  onAddMap,
}: EditMatchFormProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        Edit Match & Map Results
      </h3>

      {/* Match Info */}
      <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-3">Match Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Match Date & Time
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
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Match Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                onFormChange({ ...formData, status: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Results */}
      <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-3">
          Map Results (Best of 3)
        </h4>
        <div className="space-y-4">
          {editingMaps.map((map, index) => {
            return (
              <div
                key={`${map.id}-${index}`}
                className="bg-gray-900/50 p-4 rounded-lg border border-gray-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-white font-semibold">
                    Map {map.map_number}
                  </h5>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-400">
                      Winner:{" "}
                      {map.winner_team_id === parseInt(formData.team1_id)
                        ? teams.find(
                            (t) => t.id === parseInt(formData.team1_id)
                          )?.name
                        : map.winner_team_id === parseInt(formData.team2_id)
                        ? teams.find(
                            (t) => t.id === parseInt(formData.team2_id)
                          )?.name
                        : "TBD"}
                    </span>
                    {editingMaps.length > 2 && (
                      <button
                        onClick={() => onDeleteMap(map.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                        title="Delete this map"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">
                    Map Name
                  </label>
                  <select
                    value={map.map_name || ""}
                    onChange={(e) => {
                      const newMaps = [...editingMaps];
                      newMaps[index].map_name = e.target.value;
                      onMapsChange(newMaps);
                    }}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select a map</option>
                    <option value="Ancient">Ancient</option>
                    <option value="Dust 2">Dust 2</option>
                    <option value="Inferno">Inferno</option>
                    <option value="Mirage">Mirage</option>
                    <option value="Nuke">Nuke</option>
                    <option value="Overpass">Overpass</option>
                    <option value="Null">Null</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      {
                        teams.find((t) => t.id === parseInt(formData.team1_id))
                          ?.logo
                      }{" "}
                      {
                        teams.find((t) => t.id === parseInt(formData.team1_id))
                          ?.name
                      }{" "}
                      Score
                    </label>
                    <input
                      type="number"
                      value={map.team1_score}
                      onChange={(e) => {
                        const newMaps = [...editingMaps];
                        newMaps[index].team1_score =
                          parseInt(e.target.value) || 0;
                        onMapsChange(newMaps);
                      }}
                      min="0"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      {
                        teams.find((t) => t.id === parseInt(formData.team2_id))
                          ?.logo
                      }{" "}
                      {
                        teams.find((t) => t.id === parseInt(formData.team2_id))
                          ?.name
                      }{" "}
                      Score
                    </label>
                    <input
                      type="number"
                      value={map.team2_score}
                      onChange={(e) => {
                        const newMaps = [...editingMaps];
                        newMaps[index].team2_score =
                          parseInt(e.target.value) || 0;
                        onMapsChange(newMaps);
                      }}
                      min="0"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Player Statistics */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h6 className="text-white font-semibold mb-3">
                    Player Statistics
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Team 1 Players */}
                    <div>
                      <h6 className="text-sm font-semibold text-gray-300 mb-2">
                        {
                          teams.find(
                            (t) => t.id === parseInt(formData.team1_id)
                          )?.logo
                        }{" "}
                        {
                          teams.find(
                            (t) => t.id === parseInt(formData.team1_id)
                          )?.name
                        }
                      </h6>
                      <div className="space-y-2">
                        {map.player_stats
                          ?.filter(
                            (stat) =>
                              stat.team_id === parseInt(formData.team1_id)
                          )
                          ?.sort((a, b) => b.kills - a.kills)
                          .map((stat, statIndex) => {
                            const mapIndex = editingMaps.findIndex(
                              (m) => m.id === map.id
                            );
                            const statsIndex = editingMaps[
                              mapIndex
                            ]?.player_stats?.findIndex(
                              (s) =>
                                s.player_id === stat.player_id &&
                                s.team_id === stat.team_id
                            );
                            return (
                              <div
                                key={`${stat.player_id}-${statIndex}`}
                                className="bg-gray-800/50 p-2 rounded"
                              >
                                <div className="text-xs text-gray-400 mb-1">
                                  {stat.player?.name ||
                                    `Player ${stat.player_id}`}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-1">
                                  <div className="text-center">Kills</div>
                                  <div className="text-center">Deaths</div>
                                  <div className="text-center">Assists</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <input
                                    type="number"
                                    placeholder="K"
                                    value={stat.kills}
                                    onChange={(e) => {
                                      const newMaps = [...editingMaps];
                                      if (
                                        statsIndex !== undefined &&
                                        statsIndex !== -1
                                      ) {
                                        newMaps[mapIndex].player_stats![
                                          statsIndex
                                        ].kills = parseInt(e.target.value) || 0;
                                        onMapsChange(newMaps);
                                      }
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                    title="Kills"
                                  />
                                  <input
                                    type="number"
                                    placeholder="D"
                                    value={stat.deaths}
                                    onChange={(e) => {
                                      const newMaps = [...editingMaps];
                                      if (
                                        statsIndex !== undefined &&
                                        statsIndex !== -1
                                      ) {
                                        newMaps[mapIndex].player_stats![
                                          statsIndex
                                        ].deaths =
                                          parseInt(e.target.value) || 0;
                                        onMapsChange(newMaps);
                                      }
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                    title="Deaths"
                                  />
                                  <input
                                    type="number"
                                    placeholder="A"
                                    value={stat.assists}
                                    onChange={(e) => {
                                      const newMaps = [...editingMaps];
                                      if (
                                        statsIndex !== undefined &&
                                        statsIndex !== -1
                                      ) {
                                        newMaps[mapIndex].player_stats![
                                          statsIndex
                                        ].assists =
                                          parseInt(e.target.value) || 0;
                                        onMapsChange(newMaps);
                                      }
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                    title="Assists"
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Team 2 Players */}
                    <div>
                      <h6 className="text-sm font-semibold text-gray-300 mb-2">
                        {
                          teams.find(
                            (t) => t.id === parseInt(formData.team2_id)
                          )?.logo
                        }{" "}
                        {
                          teams.find(
                            (t) => t.id === parseInt(formData.team2_id)
                          )?.name
                        }
                      </h6>
                      <div className="space-y-2">
                        {map.player_stats
                          ?.filter(
                            (stat) =>
                              stat.team_id === parseInt(formData.team2_id)
                          )
                          ?.sort((a, b) => b.kills - a.kills)
                          .map((stat, statIndex) => {
                            const mapIndex = editingMaps.findIndex(
                              (m) => m.id === map.id
                            );
                            const statsIndex = editingMaps[
                              mapIndex
                            ]?.player_stats?.findIndex(
                              (s) =>
                                s.player_id === stat.player_id &&
                                s.team_id === stat.team_id
                            );
                            return (
                              <div
                                key={`${stat.player_id}-${statIndex}`}
                                className="bg-gray-800/50 p-2 rounded"
                              >
                                <div className="text-xs text-gray-400 mb-1">
                                  {stat.player?.name ||
                                    `Player ${stat.player_id}`}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-1">
                                  <div className="text-center">Kills</div>
                                  <div className="text-center">Deaths</div>
                                  <div className="text-center">Assists</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <input
                                    type="number"
                                    placeholder="K"
                                    value={stat.kills}
                                    onChange={(e) => {
                                      const newMaps = [...editingMaps];
                                      if (
                                        statsIndex !== undefined &&
                                        statsIndex !== -1
                                      ) {
                                        newMaps[mapIndex].player_stats![
                                          statsIndex
                                        ].kills = parseInt(e.target.value) || 0;
                                        onMapsChange(newMaps);
                                      }
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                    title="Kills"
                                  />
                                  <input
                                    type="number"
                                    placeholder="D"
                                    value={stat.deaths}
                                    onChange={(e) => {
                                      const newMaps = [...editingMaps];
                                      if (
                                        statsIndex !== undefined &&
                                        statsIndex !== -1
                                      ) {
                                        newMaps[mapIndex].player_stats![
                                          statsIndex
                                        ].deaths =
                                          parseInt(e.target.value) || 0;
                                        onMapsChange(newMaps);
                                      }
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                    title="Deaths"
                                  />
                                  <input
                                    type="number"
                                    placeholder="A"
                                    value={stat.assists}
                                    onChange={(e) => {
                                      const newMaps = [...editingMaps];
                                      if (
                                        statsIndex !== undefined &&
                                        statsIndex !== -1
                                      ) {
                                        newMaps[mapIndex].player_stats![
                                          statsIndex
                                        ].assists =
                                          parseInt(e.target.value) || 0;
                                        onMapsChange(newMaps);
                                      }
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                    title="Assists"
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    K = Kills, D = Deaths, A = Assists
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => onAddMap()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Add map
          </button>
        </div>
      </div>

      {/* Overall Match Score Preview */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-blue-300">Overall Match Score:</span>
          <span className="text-white font-bold text-xl">
            {
              editingMaps.filter(
                (m) => m.winner_team_id === parseInt(formData.team1_id)
              ).length
            }
            {" - "}
            {
              editingMaps.filter(
                (m) => m.winner_team_id === parseInt(formData.team2_id)
              ).length
            }
          </span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onSubmit}
          disabled={isUpdating}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUpdating && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {isUpdating ? "Updating..." : "Update Match & Maps"}
        </button>
        <button
          onClick={onCancel}
          disabled={isUpdating}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
