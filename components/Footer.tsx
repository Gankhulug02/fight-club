export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
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
  );
}

