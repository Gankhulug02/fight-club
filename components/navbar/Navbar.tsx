"use client";

import Link from "next/link";
import BuyMeACoffee from "./BuyMeACoffee";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu Button - Mobile */}
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Toggle sidebar"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo and Title */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="text-3xl">👊</div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Fight Club
                </h1>
                <p className="text-xs text-gray-400">CS2 Tournament</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Hidden on mobile since we have sidebar */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Leaderboard
            </Link>
            <Link
              href="/matches"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Matches
            </Link>
            <Link
              href="/players"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Players
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {/* Buy Me a Coffee Button - Hidden on mobile, shown in sidebar */}
            <div className="hidden lg:block">
              <BuyMeACoffee />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
