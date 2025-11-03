import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fight Club - CS2 Tournament",
  description: "Counter-Strike 2 Tournament Leaderboard and Rankings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        {/* Navbar */}
        <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-opacity-80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <div className="text-3xl">👊</div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    Fight Club
                  </h1>
                  <p className="text-xs text-gray-400">CS2 Tournament</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Leaderboard
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Teams
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Matches
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Schedule
                </a>
              </div>

              {/* Live Indicator */}
              <div className="flex items-center space-x-2">
                <div className="relative flex items-center">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="ml-2 text-sm font-semibold text-red-400">
                    LIVE
                  </span>
                </div>
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
                  The ultimate Counter-Strike 2 tournament. Watch the best
                  teams battle it out for glory, bragging rights, and the
                  championship title.
                </p>
                <p className="text-xs text-gray-500 italic">
                  "The first rule of Fight Club is: You do talk about Fight
                  Club." - Because we want everyone to know!
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
      </body>
    </html>
  );
}
