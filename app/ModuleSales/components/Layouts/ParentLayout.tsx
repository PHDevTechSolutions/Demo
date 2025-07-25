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
      


      {/* Tasky Sidebar */}
      <AIRightbar isOpen={isRightbarOpen} onClose={() => setRightbarOpen(false)} />

      {/* GPT Sidebar */}
      <GPTRightbar isOpen={isGPTRightbarOpen} onClose={() => setGPTRightbarOpen(false)} />
    </div>
  );
};

export default ParentLayout;
