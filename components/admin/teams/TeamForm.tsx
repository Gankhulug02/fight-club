import { useState } from "react";
import { Team, TeamFormData } from "./types";

interface TeamFormProps {
  formData: TeamFormData;
  editingTeam: Team | null;
  onFormDataChange: (data: TeamFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isUploading?: boolean;
}

export function TeamForm({
  formData,
  editingTeam,
  onFormDataChange,
  onSubmit,
  onCancel,
  isUploading = false,
}: TeamFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleNameChange = (name: string) => {
    onFormDataChange({ ...formData, name });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Store file in formData
      onFormDataChange({ ...formData, logo: file });
    }
  };

  // Determine what to show in preview (only on client to avoid hydration issues)
  const displayUrl =
    previewUrl || (typeof formData.logo === "string" ? formData.logo : null);
  const showPreview = typeof window !== "undefined" && displayUrl;
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
      <div className="space-y-4">
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
            Team Logo <span className="text-red-400">*</span>
          </label>
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:border-blue-500"
              />
              <p className="text-gray-500 text-xs mt-1">
                Upload a team logo (PNG, JPG, GIF, max 5MB)
              </p>
            </div>

            {showPreview && (
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-lg border-2 border-gray-700 overflow-hidden bg-gray-800 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayUrl as string}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex space-x-3">
        <button
          onClick={onSubmit}
          disabled={isUploading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading
            ? "Uploading..."
            : editingTeam
            ? "Update Team"
            : "Create Team"}
        </button>
        <button
          onClick={onCancel}
          disabled={isUploading}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
