"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata moved to separate metadata.ts file since this is now a client component

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
        suppressHydrationWarning
      >
        {/* Navbar */}
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

              {/* Live Indicator & Admin */}
              <div className="flex items-center space-x-6">
                {/* Buy Me a Coffee Button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-yellow-500/50"
                >
                  <span className="text-lg">☕</span>
                  <span>Buy Me a Coffee</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-950 border-t border-gray-800 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* About Section */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">👊</div>
                  <h3 className="text-xl font-bold text-white">Fight Club</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  The ultimate Counter-Strike 2 tournament. Watch the best teams
                  battle it out for glory, bragging rights, and the championship
                  title.
                </p>
                <p className="text-xs text-gray-500 italic">
                  &quot;The first rule of Fight Club is: You do talk about Fight
                  Club.&quot; - Because we want everyone to know!
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                  Quick Links
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Leaderboard
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Teams
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Match Schedule
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Rules & Format
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact & Social */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                  Connect
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center space-x-2"
                    >
                      <span>📺</span>
                      <span>Twitch</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center space-x-2"
                    >
                      <span>🐦</span>
                      <span>Twitter</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center space-x-2"
                    >
                      <span>💬</span>
                      <span>Discord</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center space-x-2"
                    >
                      <span>📧</span>
                      <span>Contact</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-gray-500 text-sm">
                  © 2025 Fight Club Tournament. All rights reserved.
                </p>
                <div className="flex space-x-6 text-sm">
                  <a
                    href="#"
                    className="text-gray-500 hover:text-gray-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-gray-400 transition-colors"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-gray-400 transition-colors"
                  >
                    Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Buy Me a Coffee Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-800 p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
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

              {/* Modal Content */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">☕</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Buy Me a Coffee
                </h2>
                <p className="text-gray-400 text-sm">
                  Support the tournament! Your contribution helps keep the
                  lights on.
                </p>
              </div>

              {/* Bank Information */}
              <div className="space-y-4">
                {/* Socialpay */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">
                      Socialpay
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText("88223402")}
                      className="text-yellow-500 hover:text-yellow-400 text-xs"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-white font-mono text-lg">88223402</p>
                </div>

                {/* Golomt Bank */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">
                      Golomt Bank
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText("2205147374")
                      }
                      className="text-yellow-500 hover:text-yellow-400 text-xs"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-white font-mono text-lg">2205147374</p>
                </div>
              </div>

              {/* Thank You Message */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-center text-gray-400 text-sm">
                  Thank you for your support! 🙏
                </p>
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
