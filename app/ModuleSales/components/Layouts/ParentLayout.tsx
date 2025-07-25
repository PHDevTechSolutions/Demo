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

  return (
    <div
      className={`flex relative font-[Comic_Sans_MS] ${isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
    >
      {/* Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(!isSidebarOpen)}
        isDarkMode={isDarkMode}
      />

      {/* Main Content */}
      <div
        className={`flex-grow transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"
          } md:ml-64`}
      >
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
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
            {/* <button
              onClick={() => {
                setRightbarOpen(true);
                setShowOptions(false);
              }}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
            >
              Chat with Tasky
            </button> */}
            
          </div>
        )}

        {/* Hover Text appears outside the button */}
        <div className="mb-1 pr-1">
          <span className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            Hello there! I’m Tasky, your AI sidekick.
          </span>
        </div>

        {/*<button
          onClick={() => setShowOptions(!showOptions)}
          className="bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition w-20 h-20 flex items-center justify-center animate-bounce"
        >
          <img
            src="/tasky.png"
            alt="Tasky Icon"
            className="w-12 h-12 hover:scale-110 transition-transform duration-300"
          />
        </button>*/}
        
      </div>


      {/* Tasky Sidebar */}
      <AIRightbar isOpen={isRightbarOpen} onClose={() => setRightbarOpen(false)} />

      {/* GPT Sidebar */}
      <GPTRightbar isOpen={isGPTRightbarOpen} onClose={() => setGPTRightbarOpen(false)} />
    </div>
  );
};

export default ParentLayout;
