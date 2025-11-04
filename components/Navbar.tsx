"use client";

import Link from "next/link";
import BuyMeACoffee from "./BuyMeACoffee";

export default function Navbar() {
  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Leaderboard
            </Link>
            {/* <Link
              href="/teams"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Teams
            </Link> */}
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
            {/* <Link
              href="/schedule"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Schedule
            </Link> */}
          </div>

          <div className="flex items-center space-x-6">
            {/* Buy Me a Coffee Button */}
            <BuyMeACoffee />
          </div>
        </div>
      </div>
    </nav>
  );
}
