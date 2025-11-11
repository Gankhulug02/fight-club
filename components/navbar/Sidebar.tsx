"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BuyMeACoffee from "./BuyMeACoffee";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Leaderboard", icon: "🏆" },
    { href: "/matches", label: "Matches", icon: "⚔️" },
    { href: "/players", label: "Players", icon: "👥" },
    // { href: "/admin", label: "Admin", icon: "⚙️" },
  ];

  const adminItems = [
    { href: "/admin/matches", label: "Manage Matches", icon: "📋" },
    { href: "/admin/players", label: "Manage Players", icon: "👤" },
    { href: "/admin/teams", label: "Manage Teams", icon: "👊" },
    { href: "/admin/settings", label: "Settings", icon: "🔧" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-950/95 backdrop-blur-lg border-r border-gray-800 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo and Brand */}
        <div className="px-4 py-6 border-b border-gray-800">
          <Link
            href="/"
            className="flex items-center space-x-3"
            onClick={() => onClose()}
          >
            <div className="text-3xl">👊</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Fight Club
              </h1>
              <p className="text-xs text-gray-400">CS2 Tournament</p>
            </div>
          </Link>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Admin Submenu */}
          {isAdminPage && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
                Admin Panel
              </h3>
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose()}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                      pathname === item.href
                        ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Buy Me a Coffee at Bottom */}
        <div className="p-4 border-t border-gray-800">
          <BuyMeACoffee />
        </div>
      </aside>
    </>
  );
}
