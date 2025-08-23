"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SidebarMenu from "./SidebarMenu";
import getMenuItems from "./SidebarMenuItems";
import SidebarUserInfo from "./SidebarUserInfo";
import { BsSpeedometer2 } from "react-icons/bs";
import { LuSettings2 } from 'react-icons/lu';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);

  const [userDetails, setUserDetails] = useState({
    Firstname: "",
    Lastname: "",
    Email: "",
    Department: "",
    Location: "",
    Role: "",
    Position: "",
    Company: "",
    Status: "",
    profilePicture: "",
    ReferenceID: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUserId(params.get("id"));
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error("Failed to fetch user details");
        const data = await response.json();
        setUserDetails({
          Firstname: data.Firstname || "Leroux ",
          Lastname: data.Lastname || "Xchire",
          Email: data.Email || "taskflow@ecoshiftcorp.com",
          Department: data.Department || "ecoshiftcorp.com",
          Location: data.Location || "Philippines",
          Role: data.Role || "Admin",
          Position: data.Position || "",
          Company: data.Company || "Ecoshift Corporation",
          Status: data.Status || "None",
          ReferenceID: data.ReferenceID,
          profilePicture: data.profilePicture,
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, [userId]);

  const handleToggle = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const menuItems = getMenuItems(userId);

  const filteredMenuItems = (() => {
    const role = userDetails.Role;
    if (role === "Admin" || role === "Super Admin") return menuItems;

    if (role === "Manager") {
      return menuItems.filter((item) =>
        [
          "Session Logs",
          "Sales Performance",
          "Conversion Rates",
          "National",
          "My Team",
          "Client Activity Board",
          "Help Center",
          "Xend Mail",
          "Global Employees",
          "My Profile",
          "What is Taskflow?",
        ].includes(item.title)
      );
    }

    if (role === "Special Access") {
      return menuItems.filter((item) =>
        [
          "Customer Database",
          "Activities",
          "Sales Performance",
          "Conversion Rates",
          "National",
          "My Team",
          "Client Activity Board",
          "Help Center",
          "Xend Mail",
          "Global Employees",
          "My Profile",
          "What is Taskflow?",
        ].includes(item.title)
      );
    }

    if (role === "Territory Sales Manager") {
      return menuItems.filter((item) =>
        [
          "Session Logs",
          "Sales Performance",
          "Conversion Rates",
          "Customer Database",
          "National",
          "My Team",
          "Reports",
          "Help Center",
          "What is Taskflow?",
        ].includes(item.title)
      );
    }

    if (role === "Territory Sales Associate") {
      return menuItems.filter((item) =>
        [
          "Session Logs",
          "Sales Performance",
          "Conversion Rates",
          "Customer Database",
          "National",
          "Work Management",
          "Reports",
          "Help Center",
          "What is Taskflow?",
        ].includes(item.title)
      );
    }

    return [];
  })();

  return (
    <>
      {/* ✅ Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed inset-y-0 left-0 z-50 h-screen transition-all duration-300 flex-col shadow-lg
        ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}
        ${isOpen ? "w-64" : "w-16"}`}
      >
        <div className="flex items-center justify-center p-4">
          <Link
            href={`/ModuleSales/Sales/Dashboard${userId ? `?id=${encodeURIComponent(userId)}` : ""
              }`}
          >
            <img
              src={isOpen ? "/taskflow-full.png" : "/taskflow.png"}
              alt="Logo"
              className={`${isOpen ? "w-40" : "w-10"} transition-all`}
            />
          </Link>
        </div>

        <SidebarMenu
          collapsed={!isOpen}
          openSections={openSections}
          handleToggle={handleToggle}
          menuItems={filteredMenuItems}
          userId={userId}
        />

        {isOpen && (
          <div className="text-xs text-left mt-auto p-4">
            <SidebarUserInfo collapsed={!isOpen} userDetails={userDetails} />
          </div>
        )}
      </div>

      {/* ✅ Mobile Bottom Nav with Dashboard Logo in Center */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[9998] 
  flex items-center shadow-t-lg text-sm relative
  ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} 
  transition-all duration-300`}
      >
        {/* Left Scroll Button */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[10000] 
      p-2 bg-orange-300 hover:bg-orange-400 dark:bg-gray-700 shadow-md h-full"
          onClick={() => {
            const container = document.getElementById("mobileMenuScroll");
            container?.scrollBy({ left: -100, behavior: "smooth" });
          }}
        >
          ◀
        </button>

        {/* Scrollable Menu Items */}
        {/* Scrollable Menu Items */}
        <div
          id="mobileMenuScroll"
          className="flex overflow-x-auto no-scrollbar flex-1 px-12 gap-x-4 items-center"
        >
          {/* ✅ Dashboard as first item */}
          <div className="relative flex-shrink-0 w-20 text-center">
            <Link
              href={`/ModuleSales/Sales/Dashboard${userId ? `?id=${encodeURIComponent(userId)}` : ""}`}
              className="flex flex-col items-center justify-center w-full py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <BsSpeedometer2 className="text-xl mb-1" />
              <span className="text-[11px] truncate">Dashboard</span>
            </Link>
          </div>

          {/* ✅ Other Menu Items */}
          {filteredMenuItems.map((item, idx) => (
            <div key={idx} className="relative flex-shrink-0 w-20 text-center">
              <button
                onClick={() => handleToggle(item.title)}
                className="flex flex-col items-center justify-center w-full py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <span className="text-xl mb-1">{item.icon && <item.icon />}</span>
                <span className="text-[11px] truncate">{item.title}</span>
              </button>

              {/* Submenu */}
              {openSections[item.title] && item.subItems && (
                <div
                  className="fixed bottom-16 left-1/2 -translate-x-1/2 space-y-1
            max-w-[80vw] max-h-[50vh] overflow-y-auto 
            bg-white dark:bg-gray-800 border rounded-lg shadow-xl 
            z-[99999] text-left p-2"
                >
                  {item.subItems.map((sub: any, subIdx: number) => (
                    <Link
                      key={subIdx}
                      href={sub.href || "#"}
                      className="block px-4 py-2 text-xs whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* ✅ My Profile Menu */}
          <div className="relative flex-shrink-0 w-20 text-center">
            <button
              onClick={() => handleToggle("My Profile")}
              className="flex flex-col items-center justify-center w-full py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <span className="text-xl mb-1"><LuSettings2 /></span>
              <span className="text-[11px] truncate">My Profile</span>
            </button>

            {openSections["My Profile"] && (
              <div
                className="fixed bottom-16 left-1/2 -translate-x-1/2 space-y-1
          max-w-[80vw] max-h-[50vh] overflow-y-auto 
          bg-white dark:bg-gray-800 border rounded-lg shadow-xl 
          z-[99999] text-left p-2"
              >
                {[
                  {
                    title: "Update Profile",
                    href: `/ModuleSales/Sales/Profile${userId ? `?id=${encodeURIComponent(userId)}` : ""}`,
                  },
                  {
                    title: "Developers",
                    href: `/ModuleSales/Sales/Profile/Developers${userId ? `?id=${encodeURIComponent(userId)}` : ""}`,
                  },
                  {
                    title: "Session Logs",
                    href: `/ModuleSales/Sales/Profile/SessionLogs${userId ? `?id=${encodeURIComponent(userId)}` : ""}`,
                  },
                ].map((sub, subIdx) => (
                  <Link
                    key={subIdx}
                    href={sub.href || "#"}
                    className="block px-4 py-2 text-xs whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    {sub.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Right Scroll Button */}
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[10000] 
      p-2 bg-orange-300 hover:bg-orange-400 dark:bg-gray-700 shadow-md h-full"
          onClick={() => {
            const container = document.getElementById("mobileMenuScroll");
            container?.scrollBy({ left: 100, behavior: "smooth" });
          }}
        >
          ▶
        </button>
      </div>

    </>
  );
};

export default Sidebar;
