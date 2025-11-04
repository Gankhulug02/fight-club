"use client";

import { useState } from "react";

export default function BuyMeACoffee() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      {/* Buy Me a Coffee Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-yellow-500/50"
      >
        <span className="text-lg">☕</span>
        <span>Buy Me a Coffee</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="w-screen h-screen fixed inset-0 bg-[#2828285b] flex items-center justify-center z-50 p-4 backdrop:blur-2xl"
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
                Support the tournament! Your contribution helps keep the lights
                on.
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
                    onClick={() => handleCopy("88223402", "socialpay")}
                    className="text-yellow-500 hover:text-yellow-400 text-xs transition-colors"
                  >
                    {copiedField === "socialpay" ? "Copied!" : "Copy"}
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
                    onClick={() => handleCopy("2205147374", "golomt")}
                    className="text-yellow-500 hover:text-yellow-400 text-xs transition-colors"
                  >
                    {copiedField === "golomt" ? "Copied!" : "Copy"}
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
    </>
  );
}
