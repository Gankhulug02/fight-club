import Link from "next/link";

export default function AdminPage() {
  const stats = {
    totalTeams: 8,
    totalPlayers: 40,
    totalMatches: 45,
    liveMatches: 2,
  };

  const adminSections = [
    {
      title: "Teams",
      description: "Manage tournament teams, view stats, and edit team details",
      icon: "👥",
      href: "/admin/teams",
      color: "purple",
    },
    {
      title: "Players",
      description: "Manage player profiles, statistics, and team assignments",
      icon: "🎮",
      href: "/admin/players",
      color: "blue",
    },
    {
      title: "Matches",
      description:
        "Schedule matches, update scores, and manage tournament fixtures",
      icon: "⚔️",
      href: "/admin/matches",
      color: "green",
    },
    {
      title: "Settings",
      description: "Configure tournament settings and general preferences",
      icon: "⚙️",
      href: "/admin/settings",
      color: "purple",
      stats: "Configure",
    },
  ];

  return (
    <div className="bg-gradient min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Manage Fight Club CS2 Tournament - Season 2025
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold"
          >
            View Site →
          </Link>
        </div>

        {/* Management Sections */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Management Sections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminSections.map((section) => {
              const colorClasses = {
                blue: "from-blue-900/30 to-blue-950/30 border-blue-800 hover:border-blue-700",
                green:
                  "from-green-900/30 to-green-950/30 border-green-800 hover:border-green-700",
                purple:
                  "from-purple-900/30 to-purple-950/30 border-purple-800 hover:border-purple-700",
                gray: "from-gray-900/30 to-gray-950/30 border-gray-800 hover:border-gray-700",
              };

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`bg-linear-to-br ${
                    colorClasses[section.color as keyof typeof colorClasses]
                  } backdrop-blur-sm rounded-2xl p-8 border-2 transition-all duration-200 hover:scale-105 group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-6xl group-hover:scale-110 transition-transform">
                      {section.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {section.description}
                  </p>
                  <div className="mt-4 flex items-center text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                    Manage {section.title} →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/teams"
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-3"
            >
              <span className="text-2xl">➕</span>
              <span>Add New Team</span>
            </Link>
            <Link
              href="/admin/players"
              className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-3"
            >
              <span className="text-2xl">🎮</span>
              <span>Add New Player</span>
            </Link>
            <Link
              href="/admin/matches"
              className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-3"
            >
              <span className="text-2xl">📅</span>
              <span>Schedule Match</span>
            </Link>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Tournament Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                  ● Live
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Season</span>
                <span className="text-white font-semibold">2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tournament</span>
                <span className="text-white font-semibold">Fight Club</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
