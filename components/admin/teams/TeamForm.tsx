import { Team, TeamFormData } from "./types";

interface TeamFormProps {
  formData: TeamFormData;
  editingTeam: Team | null;
  onFormDataChange: (data: TeamFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function TeamForm({
  formData,
  editingTeam,
  onFormDataChange,
  onSubmit,
  onCancel,
}: TeamFormProps) {
  const handleNameChange = (name: string) => {
    onFormDataChange({ ...formData, name });
  };

  const handleLogoChange = (logo: string) => {
    onFormDataChange({ ...formData, logo });
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        {editingTeam ? "Edit Team" : "Add New Team"}
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        {editingTeam
          ? "Update team information. Statistics are calculated from match results."
          : "Create a new team. Statistics will be automatically calculated from match results."}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-sm mb-2">
            Team Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter team name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-2">
            Logo Emoji
          </label>
          <input
            type="text"
            placeholder="🔥"
            value={formData.logo}
            onChange={(e) => handleLogoChange(e.target.value)}
            maxLength={2}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div className="mt-4 flex space-x-3">
        <button
          onClick={onSubmit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          {editingTeam ? "Update Team" : "Create Team"}
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

