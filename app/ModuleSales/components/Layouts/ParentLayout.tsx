"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import AIRightbar from "../AI/Rightbar/AIRightbar";
import GPTRightbar from "../AI/Rightbar/GPTRightbar";

interface ParentLayoutProps {
  children: ReactNode;
}

const ParentLayout: React.FC<ParentLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isRightbarOpen, setRightbarOpen] = useState(false);
  const [isGPTRightbarOpen, setGPTRightbarOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [isDarkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );

  const [deferredPrompt, setDeferredPrompt] =
    useState<any | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Detect beforeinstallprompt (Android / Chrome / Desktop)
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect kung installed na
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      localStorage.setItem("appInstalled", "true");
    });

    // iOS check (Safari Add to Home Screen)
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isInStandaloneMode =
      "standalone" in window.navigator &&
      (window.navigator as any).standalone;

    if (isIOS && !isInStandaloneMode && !localStorage.getItem("appInstalled")) {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
        localStorage.setItem("appInstalled", "true");
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div
      className={`flex relative font-[Comic_Sans_MS] ${
        isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar wrapper with hover detection */}
      <div
        className="relative"
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Main Content */}
      <div
        className={`flex-grow transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <Navbar
          onToggleSidebar={() => {}} // hover lang gamit
          onToggleTheme={() => setDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
        />
        <main className="p-4 min-h-screen">{children}</main>
        <Footer />
      </div>

      {/* Floating Button and Chat Options */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group"
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        {showOptions && (
          <div className="flex flex-col gap-2 mb-2 z-[999]">
            <button
              onClick={() => {
                setRightbarOpen(true);
                setShowOptions(false);
              }}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
            >
              Chat with Tasky
            </button>
          </div>
        )}
      </div>

      {/* Tasky Sidebar */}
      <AIRightbar
        isOpen={isRightbarOpen}
        onClose={() => setRightbarOpen(false)}
      />

      {/* GPT Sidebar */}
      <GPTRightbar
        isOpen={isGPTRightbarOpen}
        onClose={() => setGPTRightbarOpen(false)}
      />

      {/* Install App Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-cyan-600 text-white p-3 flex items-center justify-between shadow-lg z-[1000]">
          <p className="text-sm font-semibold">
            📲 Install this app on your device for a better experience!
          </p>
          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="ml-4 bg-white text-cyan-600 px-3 py-1 rounded shadow hover:bg-gray-200 text-sm"
            >
              Install
            </button>
          ) : (
            <p className="ml-4 text-xs italic">
              Add to Home Screen from your browser menu.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentLayout;
