"use client";

import React, { useState, ReactNode, useEffect, useRef } from "react";
import Sidebar from "../Sidebar/Sidebar";  
import Navbar from "../Navbar/Navbar";    
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
  const [isDarkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );

  // 🎵 Music Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🎵 Auto-play next when song index changes
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      const audio = audioRef.current;
      audio.src = `/music/${songs[currentSongIndex]}`;
      audio.load();

      const handleCanPlay = () => {
        audio.play().catch(() => {});
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
      className={`flex min-h-screen font-[Comic_Sans_MS] ${
        isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(!isSidebarOpen)}
        isDarkMode={isDarkMode}
      />

      {/* Main Content */}
      <div
        className={`flex-grow transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      >
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          onToggleTheme={() => setDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
        />
        <main className="p-4">{children}</main>
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
        {isHovered && (
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
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default ParentLayout;
