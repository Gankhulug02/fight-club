import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/navbar/Footer";

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
  description:
    "The ultimate Counter-Strike 2 tournament. Watch the best teams battle it out for glory, bragging rights, and the championship title.",
  keywords: [
    "CS2",
    "Counter-Strike 2",
    "tournament",
    "esports",
    "gaming",
    "fight club",
  ],
  authors: [{ name: "Fight Club Tournament" }],
  openGraph: {
    title: "Fight Club - CS2 Tournament",
    description:
      "The ultimate Counter-Strike 2 tournament. Watch the best teams battle it out for glory, bragging rights, and the championship title.",
    type: "website",
  },
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
        suppressHydrationWarning
      >
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="">
          <div className="bg-gradient-to-top-left h-full">
            <div className="bg-gradient-to-bottom-right h-full">
              <div className="backdrop-blur-2xl h-full">{children}</div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
