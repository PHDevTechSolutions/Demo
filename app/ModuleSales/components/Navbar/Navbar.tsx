"use client";

import React, { useState, useEffect, useRef } from "react";
import { CiBellOn } from "react-icons/ci";
import { BsSliders } from 'react-icons/bs';
import { GrPowerShutdown } from "react-icons/gr";
import { useRouter } from "next/navigation";
import Notification from "./Notification";

interface Notification {
  id: number;
  companyname: string;
  callback: string;
  typeactivity: string;
  typeclient: string;
  date_created: string;
  typecall: string;
  message: string;
  type: string;
  csragent: string;
  agentfullname: string;
  _id: string;
  recepient: string;
  sender: string;
  status: string;
  fullname: string;
}

interface NavbarProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}


const Navbar: React.FC<NavbarProps> = ({ onToggleTheme, isDarkMode
}) => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userReferenceId, setUserReferenceId] = useState("");
  const [TargetQuota, setUserTargetQuota] = useState("");
  const [Role, setUserRole] = useState("");
  const [Department, setDepartment] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [usersList, setUsersList] = useState<any[]>([]);

  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowSidebar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userReferenceId) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `/api/ModuleSales/Task/Callback/FetchCallback?referenceId=${userReferenceId}`
        );
        const data = await res.json();

        if (!data.success) return;
        const today = new Date().setUTCHours(0, 0, 0, 0);
        const validNotifications = data.data
          .filter((notif: any) => {
            switch (notif.type) {
              case "Callback Notification":
                if (notif.callback && notif.referenceid === userReferenceId) {
                  const callbackDate = new Date(notif.callback).setUTCHours(0, 0, 0, 0);
                  return callbackDate <= today;
                }
                return false;

              case "Inquiry Notification":
                if (notif.date_created) {
                  const inquiryDate = new Date(notif.date_created).setUTCHours(0, 0, 0, 0);

                  if ((notif.referenceid === userReferenceId || notif.tsm === userReferenceId) && inquiryDate <= today) {
                    return true;
                  }
                }
                return false;

              case "Follow-Up Notification":
                if (notif.date_created && (notif.referenceid === userReferenceId || notif.tsm === userReferenceId)) {
                  const notificationTime = new Date(notif.date_created);
                  const user = usersList.find((user: any) => user.ReferenceID === notif.referenceid);
                  const fullname = user ? `${user.Firstname} ${user.Lastname}` : "Unknown User";

                  if (notif.message?.includes("Ringing Only")) {
                    notificationTime.setDate(notificationTime.getDate() + 10);
                  } else if (notif.message?.includes("No Requirements")) {
                    notificationTime.setDate(notificationTime.getDate() + 15);
                  } else if (notif.message?.includes("Cannot Be Reached")) {
                    notificationTime.setDate(notificationTime.getDate() + 3);
                  } else if (notif.message?.includes("Not Connected With The Company")) {
                    notificationTime.setMinutes(notificationTime.getMinutes() + 15);
                  } else if (notif.message?.includes("With SPFS")) {
                    notificationTime.setDate(notificationTime.getDate() + 7);
                    const validUntil = new Date(notif.date_created);
                    validUntil.setMonth(validUntil.getMonth() + 2);
                    if (new Date() > validUntil) {
                      return false;
                    }
                  } else if (notif.message?.includes("Sent Quotation - Standard")) {
                    notificationTime.setDate(notificationTime.getDate() + 1);
                  } else if (notif.message?.includes("Sent Quotation - With Special Price")) {
                    notificationTime.setDate(notificationTime.getDate() + 1);
                  } else if (notif.message?.includes("Sent Quotation - With SPF")) {
                    notificationTime.setDate(notificationTime.getDate() + 5);
                  } else if (notif.message?.includes("Waiting for Projects")) {
                    notificationTime.setDate(notificationTime.getDate() + 30);
                  }

                  notif.fullname = fullname;
                  return new Date() >= notificationTime;
                }
                return false;

              default:
                return false;
            }
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.callback || a.date_created).getTime();
            const dateB = new Date(b.callback || b.date_created).getTime();
            return dateB - dateA;
          });

        setNotifications(validNotifications);
        setNotificationCount(validNotifications.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [userReferenceId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");

      if (userId) {
        try {
          const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
          if (!response.ok) throw new Error("Failed to fetch user data");

          const data = await response.json();
          setUserName(data.Firstname);
          setUserEmail(data.Email);
          setUserReferenceId(data.ReferenceID || "");
          setUserTargetQuota(data.TargetQuota || "");
          setUserRole(data.Role || "");
          setDepartment(data.Department || "");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/getUsers");
        const data = await response.json();
        setUsersList(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const inquiryNotif = notifications.find(
      (notif) => notif.status === "Unread" && notif.type === "Inquiry Notification"
    );

    if (inquiryNotif) {
      setSelectedNotif(inquiryNotif);
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [notifications]);

  const totalNotifCount = notifications.filter((notif) => notif.status === "Unread").length;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const audioLogoutRef = useRef<HTMLAudioElement>(null);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    // Play logout sound if available
    if (audioLogoutRef.current) {
      audioLogoutRef.current.currentTime = 0;
      await audioLogoutRef.current.play().catch(() => { });
    }

    await new Promise((resolve) => setTimeout(resolve, 500)); // optional delay for sound

    try {
      await fetch("/api/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,        // <-- use your state here
          department: Department || "",  // <-- use Role or another state for dept
          status: "logout",
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Failed to log logout activity", err);
      // Optional: save to sessionStorage to retry later
      sessionStorage.setItem("pendingLogout", JSON.stringify({
        email: userEmail,
        department: Role || "",
        status: "logout",
        timestamp: new Date().toISOString()
      }));
    }

    // Clear session and redirect
    sessionStorage.clear();
    router.replace("/Login");
  };


  return (
    <div className={`sticky top-0 z-[999] flex justify-between items-center p-4 transition-all duration-300 ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <div
        className="relative flex items-center justify-between w-full text-xs z-[1000]"
        ref={dropdownRef}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition block md:hidden"
            title="Logout"
          >
            <GrPowerShutdown size={18} className="text-red-500" />
          </button>

          <button
            onClick={() => setShowSettingsModal(prev => !prev)}
            title="Settings"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
          >
            <BsSliders size={18} />
          </button>
        </div>

        <button onClick={() => setShowSidebar((prev) => !prev)} className="p-2 relative flex items-center hover:bg-gray-200 hover:rounded-full">
          <CiBellOn size={20} />
          {totalNotifCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
              {totalNotifCount}
            </span>
          )}
        </button>

        <Notification
          totalNotifCount={totalNotifCount}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          sidebarRef={sidebarRef}
          notifications={notifications}
          setNotifications={setNotifications}
        />

        {showSettingsModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[2000]">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-80 shadow-lg flex flex-col gap-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>

              {/* Theme Dropdown */}
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Theme</label>
                <select
                  value={isDarkMode ? "dark" : "light"}
                  onChange={(e) => {
                    if ((e.target.value === "dark") !== isDarkMode) {
                      onToggleTheme(); // zero argument
                    }
                  }}
                  className="mt-1 w-full p-1 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>

              </div>

              <button
                className="mt-4 bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
                onClick={() => setShowSettingsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Navbar;
