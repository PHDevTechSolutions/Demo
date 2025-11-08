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
  const [isRightbarOpen, setRightbarOpen] = useState(false);
  const [isGPTRightbarOpen, setGPTRightbarOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );

  const [showLogoutReminder, setShowLogoutReminder] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState({
    Firstname: "Task",
    Lastname: "Flow",
    Email: "",
    Department: "",
    Location: "",
    Role: "",
    Position: "",
    Company: "",
    Status: "",
    ReferenceID: "",
    profilePicture: "",
  });

  // Detect mobile screen
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Logout reminder once per day at 4:30 PM Manila time
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const manilaTime = now.toLocaleTimeString("en-PH", {
        timeZone: "Asia/Manila",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      const today = new Date().toLocaleDateString("en-PH", {
        timeZone: "Asia/Manila",
      });

      const lastShownDate = localStorage.getItem("logoutReminderShownDate");

      if (manilaTime === "16:30" && lastShownDate !== today) {
        setShowLogoutReminder(true);
        localStorage.setItem("logoutReminderShownDate", today);
      }
    };

    const interval = setInterval(checkTime, 30000);
    checkTime();

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`flex relative font-[Comic_Sans_MS] min-h-screen ${
        isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar Desktop */}
      {!isMobile && (
        <div className="fixed top-0 left-0 h-screen z-50">
          <Sidebar isOpen={true} onClose={() => {}} isDarkMode={isDarkMode} />
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-grow transition-all duration-300 ${!isMobile ? "ml-64" : ""}`}>
        <Navbar
          onToggleSidebar={() => {}}
          onToggleTheme={() => {
            const newTheme = !isDarkMode ? "dark" : "light";
            localStorage.setItem("theme", newTheme);
            setDarkMode(!isDarkMode);
          }}
          isDarkMode={isDarkMode}
          
        />
        
        <main className="p-4">{children}</main>
        <Footer />
      </div>

      {/* Sidebar Mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[999] border-t shadow-lg">
          <Sidebar isOpen={true} onClose={() => {}} isDarkMode={isDarkMode} />
        </div>
      )}

      {/* Floating Chat Options */}
      <div
        className="fixed bottom-40 right-6 z-[999] flex flex-col items-end gap-2 group"
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

      {/* Tasky Sidebars */}
      <AIRightbar isOpen={isRightbarOpen} onClose={() => setRightbarOpen(false)} />
      <GPTRightbar isOpen={isGPTRightbarOpen} onClose={() => setGPTRightbarOpen(false)} />

      {/* Logout Reminder Modal */}
      {showLogoutReminder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm text-center animate-fadeIn">
            <h2 className="text-lg font-bold mb-2 text-gray-800">
              ⏰ Don’t forget to logout your account!
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              💪 Keep up the great work and happy selling!
            </p>
            <button
              onClick={() => setShowLogoutReminder(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentLayout;
