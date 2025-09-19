"use client";

import React, { useState, useRef, useEffect } from "react";
import { GrPowerShutdown } from "react-icons/gr";
import { useRouter } from "next/navigation";

interface SidebarUserInfoProps {
  collapsed: boolean;
  userDetails: {
    Firstname: string;
    Lastname: string;
    Company: string;
    Role: string;
    Position: string;
    Status: string;
    Email: string;
    Department: string;
    profilePicture?: string;
  };
}

interface SessionData {
  email: string;
  status: string;
  timestamp: string;
}

const SidebarUserInfo: React.FC<SidebarUserInfoProps> = ({
  collapsed,
  userDetails,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionData | null>(null);

  const audioTaskflowRef = useRef<HTMLAudioElement>(null);
  const audioBinaryRef = useRef<HTMLAudioElement>(null);

  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `/api/fetchsession?id=${encodeURIComponent(userDetails.Email)}`
        );
        if (!response.ok) throw new Error("Failed to fetch session");
        const logs: SessionData[] = await response.json();

        if (logs.length > 0) {
          const latest = logs[0];
          setSessionInfo(latest);

          if (latest.status === "logout" && !isLoggingOut) {
            handleLogout();
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, [userDetails.Email, isLoggingOut]);

  const statusColor =
    {
      Active: "bg-green-600",
      Inactive: "bg-red-400",
      Locked: "bg-gray-400",
      Busy: "bg-yellow-400",
      "Do not Disturb": "bg-gray-800",
    }[userDetails.Status] || "bg-blue-500";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    if (audioTaskflowRef.current) {
      audioTaskflowRef.current.currentTime = 0;
      await audioTaskflowRef.current.play().catch(() => {});
    }

    setTimeout(() => {
      if (audioBinaryRef.current) {
        audioBinaryRef.current.currentTime = 0;
        audioBinaryRef.current.play().catch(() => {});
      }
    }, 1000);

    await new Promise((resolve) => setTimeout(resolve, 15000));

    try {
      await fetch("/api/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userDetails.Email,
          department: userDetails.Department,
          status: "logout",
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Failed to log logout activity", err);
    }

    sessionStorage.clear();
    router.replace("/Login");
  };

  if (collapsed) return null;

  return (
    <div
      className="relative p-2 dark:bg-gray-900 dark:border-gray-700 flex items-center justify-between flex-shrink-0 overflow-hidden"
      style={{ position: "sticky", bottom: 0, zIndex: 10 }}
    >
      <audio src="/taskflow-logout.mp3" ref={audioTaskflowRef} />
      <audio src="/binary-logout-sfx.mp3" ref={audioBinaryRef} />

      {isLoggingOut && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-20 animate-pulse-slow bg-[radial-gradient(circle,_#00ffff33_1px,_transparent_1px)] bg-[length:20px_20px]" />
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-spin-slow shadow-md shadow-cyan-500/30" />
            <div className="absolute inset-1 rounded-full border border-cyan-300 opacity-40 animate-ping" />
            <span className="text-cyan-300 text-[9px] font-mono z-10">
              Logout...
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 z-10">
        <div className="relative w-12 h-12">
          <img
            src={userDetails.profilePicture || "/taskflow.png"}
            alt="Avatar"
            className="w-12 h-12 object-cover rounded-full"
          />
          <span
            className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${statusColor} animate-pulse`}
            title={userDetails.Status}
          />
        </div>

        <div className="text-[10px] leading-tight">
          <p className="font-bold uppercase">
            {userDetails.Firstname}, {userDetails.Lastname}
          </p>
          <p className="italic">{userDetails.Company}</p>
          {userDetails.Position && (
            <p className="italic">( {userDetails.Position} )</p>
          )}
          {sessionInfo && (
            <p className="italic text-[9px] text-gray-500 capitalize">
              Status: {sessionInfo.status} |{" "}
              {new Date(sessionInfo.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        title="Logout"
        className="ml-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-red-900 transition z-10"
      >
        <GrPowerShutdown size={16} className="text-orange-500" />
      </button>
    </div>
  );
};

export default SidebarUserInfo;