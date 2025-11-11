"use client";

import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/navbar/Footer";
import Sidebar from "@/components/navbar/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <html lang="en">
      <head>
        <title>Fight Club - CS2 Tournament</title>
        <meta
          name="description"
          content="The ultimate Counter-Strike 2 tournament. Watch the best teams battle it out for glory, bragging rights, and the championship title."
        />
        <meta
          name="keywords"
          content="CS2, Counter-Strike 2, tournament, esports, gaming, fight club"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
        suppressHydrationWarning
      >
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-30 text-gray-400 hover:text-white transition-colors p-2 bg-gray-900/80 backdrop-blur-lg rounded-lg border border-gray-800"
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

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content with left margin for sidebar on desktop */}
        <main className="lg:ml-64">
          <div className="bg-gradient-to-top-left h-full">
            <div className="bg-gradient-to-bottom-right h-full">
              <div className="backdrop-blur-2xl h-full">{children}</div>
            </div>
          </div>
        </main>

        {/* Footer with left margin for sidebar on desktop */}
        <div className="lg:ml-64">
          <Footer />
        </div>
      </body>
    </html>
  );
}
