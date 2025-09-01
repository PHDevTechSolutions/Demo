"use client";

import React, { useState, ReactNode, useEffect, useRef } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import AIRightbar from "../AI/Rightbar/AIRightbar";
import GPTRightbar from "../AI/Rightbar/GPTRightbar";
import Image from "next/image";

interface ParentLayoutProps {
  children: ReactNode;
}

const songs = [
  "a-perfect-christmas.mp3",
  "christmas-in-our-hearts.mp3",
  "marys-boy-child.mp3",
  "what-do-you-want-to-do-with.mp3",
];

const ParentLayout: React.FC<ParentLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isRightbarOpen, setRightbarOpen] = useState(false);
  const [isGPTRightbarOpen, setGPTRightbarOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [isDarkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );

  // 🎵 Music Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // detect mobile
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // 🎵 Auto-play next when song index changes
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      const audio = audioRef.current;
      audio.src = `/music/${songs[currentSongIndex]}`;

      // hintayin mag-load bago mag-play
      audio.load();
      const handleCanPlay = () => {
        audio.play().catch(() => { });
      };

      audio.addEventListener("canplay", handleCanPlay);

      return () => {
        audio.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [currentSongIndex, isPlaying]);


  // 🎵 Setup "ended" listener for auto-next
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => {
      setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    };

    const audioEl = audioRef.current;
    audioEl.addEventListener("ended", handleEnded);
    return () => {
      audioEl.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Controls
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.src = `/music/${songs[currentSongIndex]}`;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentSongIndex((prev) =>
      prev === 0 ? songs.length - 1 : prev - 1
    );
    setIsPlaying(true);
  };

  return (
    <div
      className={`flex relative font-[Comic_Sans_MS] min-h-screen ${isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
    >
      {/* Sidebar Desktop */}
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
        className={`flex-grow transition-all duration-300 ${!isMobile ? (isSidebarOpen ? "ml-64" : "ml-16") : ""
          }`}
      >
        <Navbar
          onToggleSidebar={() => { }} // desktop hover sidebar
          onToggleTheme={() => setDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
        />
        <main className="p-4">{children}</main>
        <Footer />
      </div>

      {/* Sidebar Mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[999] border-t shadow-lg">
          <Sidebar
            isOpen={true}
            onClose={() => { }}
            isDarkMode={isDarkMode}
          />
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

      {/* Floating JMC Image + Music Player */}
      <div
        className="fixed bottom-0 right-0 z-[998] flex flex-col items-center gap-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src="/jmc.png"
          alt="JMC Logo"
          width={60}
          height={60}
          className="rounded cursor-pointer hover:scale-105 transition-transform transform scale-x-[-1]"
        />

        {/* 🎶 Music Player */}
        {isHovered ? (
          // 🔹 Full Player kapag hovered
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs px-3 py-2 rounded-lg shadow flex flex-col items-center gap-2 w-52">
            <p className="text-center capitalize font-semibold truncate">
              {songs[currentSongIndex].replace(".mp3", "").replace(/-/g, " ")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                ⏮
              </button>
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  ▶
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  ⏹
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                ⏭
              </button>
            </div>
          </div>
        ) : null}

      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

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
