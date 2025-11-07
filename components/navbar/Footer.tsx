import Link from "next/link";

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
            {[
              { href: "/", label: "Leaderboard" },
              { href: "/", label: "Teams" },
              { href: "/matches", label: "Match Schedule" },
              { href: "/rules", label: "Rules & Format" },
            ].map((link, index) => (
              <ul className="space-y-2" key={link.label + index}>
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              </ul>
            ))}
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Connect
            </h4>
            <ul className="space-y-2">
              {[
                {
                  href: "https://discord.gg/GTkjP5UR",
                  icon: "💬",
                  label: "Discord",
                },
                {
                  href: "https://www.youtube.com/@ANDDOTA2",
                  icon: "🎥",
                  label: "Youtube",
                },
              ].map((social) => (
                <li key={social.label}>
                  <Link
                    href={social.href}
                    target="_blank"
                    className="text-gray-400 hover:text-white text-sm transition-colors flex items-center space-x-2"
                  >
                    <span>{social.icon}</span>
                    <span>{social.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © 2025 Fight Club Tournament. All rights reserved.
              <span className="ml-2">
                | Developed by{" "}
                <Link
                  href="https://www.instagram.com/etoyaa02/"
                  className="text-gray-400 hover:text-white underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Etoyaa
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
