"use client";

import React, { useState, ReactNode, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  const [isDarkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );

  // detect mobile
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div
      className={`flex relative font-[Comic_Sans_MS] min-h-screen ${
        isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar Desktop (left side) */}
      {!isMobile && (
        <div
          className="relative hidden md:block"
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
        >
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-grow transition-all duration-300 ${
          !isMobile ? (isSidebarOpen ? "ml-64" : "ml-16") : ""
        }`}
      >
        <Navbar
          onToggleSidebar={() => {}} // desktop hover sidebar
          onToggleTheme={() => setDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
        />
        <main className="p-4">{children}</main>
        <Footer />
      </div>

      {/* Sidebar Mobile (sticky bottom nav) */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[999] border-t shadow-lg">
          <Sidebar
            isOpen={true} // always visible sa mobile bottom
            onClose={() => {}}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Floating Button and Chat Options */}
      <div
        className="fixed bottom-20 right-6 z-[999] flex flex-col items-end gap-2 group"
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        {showOptions && (
          <div className="flex flex-col gap-2 mb-2 z-[9999]">
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
    </div>
  );
};

export default ParentLayout;
