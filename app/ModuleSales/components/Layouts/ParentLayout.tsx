"use client";

import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  ReactNode,
} from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import AIRightbar from "../AI/Rightbar/AIRightbar";
import GPTRightbar from "../AI/Rightbar/GPTRightbar";

// 🎵 Songs List
const songs = [
  "a-perfect-christmas.mp3",
  "christmas-in-our-hearts.mp3",
  "marys-boy-child.mp3",
  "what-do-you-want-to-do-with.mp3",
];

// ----------------------
// 🎵 Music Context Setup
// ----------------------
interface MusicContextProps {
  isPlaying: boolean;
  currentSongIndex: number;
  isHovered: boolean;
  handlePlay: () => void;
  handleStop: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  setIsHovered: (val: boolean) => void;
  songs: string[];
}

const MusicPlayerContext = createContext<MusicContextProps | null>(null);

const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // auto next song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // update source kapag nagbago index
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = `/music/${songs[currentSongIndex]}`;
      if (isPlaying) {
        audioRef.current.play().catch(() => { });
      }
    }
  }, [currentSongIndex]);

  // Controls
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => { });
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
    <MusicPlayerContext.Provider
      value={{
        isPlaying,
        currentSongIndex,
        isHovered,
        handlePlay,
        handleStop,
        handleNext,
        handlePrev,
        setIsHovered,
        songs,
      }}
    >
      {/* Hidden audio tag na persisted */}
      <audio ref={audioRef} src={`/music/${songs[currentSongIndex]}`} />
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  return ctx;
};

// ----------------------
// 🎵 Parent Layout
// ----------------------
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

  // 🎵 get music context
  const {
    isPlaying,
    currentSongIndex,
    isHovered,
    handlePlay,
    handleStop,
    handleNext,
    handlePrev,
    setIsHovered,
    songs,
  } = useMusicPlayer();

  return (
    <div
      className={`flex relative font-[Comic_Sans_MS] min-h-screen ${isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
    >

      {/* Sidebar Desktop - always fixed */}
      {!isMobile && (
        <div className="fixed top-0 left-0 h-screen z-50">
          <Sidebar isOpen={true} onClose={() => { }} isDarkMode={isDarkMode} />
        </div>
      )}


      {/* Main Content */}
      <div
        className={`flex-grow transition-all duration-300 ${!isMobile ? "ml-64" : ""
          }`}
      >
        <Navbar
          onToggleSidebar={() => { }}
          onToggleTheme={() => setDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
        />
        <main className="p-4">{children}</main>
        <Footer />
      </div>

      {/* Sidebar Mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[999] border-t shadow-lg">
          <Sidebar isOpen={true} onClose={() => { }} isDarkMode={isDarkMode} />
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
      <AIRightbar
        isOpen={isRightbarOpen}
        onClose={() => setRightbarOpen(false)}
      />
      <GPTRightbar
        isOpen={isGPTRightbarOpen}
        onClose={() => setGPTRightbarOpen(false)}
      />
    </div>
  );
};

// Wrap layout with MusicPlayerProvider para hindi nagrereset per page
export default function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <MusicPlayerProvider>
      <ParentLayout>{children}</ParentLayout>
    </MusicPlayerProvider>
  );
}
