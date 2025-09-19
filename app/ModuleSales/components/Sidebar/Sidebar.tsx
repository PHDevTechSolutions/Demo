"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import SidebarMenu from "./SidebarMenu";
import getMenuItems from "./SidebarMenuItems";
import SidebarUserInfo from "./SidebarUserInfo";
import { BsSpeedometer2 } from "react-icons/bs";
import { LuSettings2 } from "react-icons/lu";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState({
    Firstname: "Task",
    Lastname: "Flow",
    Email: "taskflow@ecoshiftcorp.com",
    Department: "ecoshiftcorp.com",
    Location: "Philippines",
    Role: "Admin",
    Position: "",
    Company: "Ecoshift Corporation",
    Status: "None",
    profilePicture: "",
    ReferenceID: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUserId(params.get("id"));
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/user?id=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        setUserDetails(prev => ({
          ...prev,
          Firstname: data.Firstname || prev.Firstname,
          Lastname: data.Lastname || prev.Lastname,
          Email: data.Email || prev.Email,
          Department: data.Department || prev.Department,
          Location: data.Location || prev.Location,
          Role: data.Role || prev.Role,
          Position: data.Position || prev.Position,
          Company: data.Company || prev.Company,
          Status: data.Status || prev.Status,
          ReferenceID: data.ReferenceID || prev.ReferenceID,
          profilePicture: data.profilePicture || prev.profilePicture,
        }));
      })
      .catch(err => console.error(err));
  }, [userId]);

  const handleToggle = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const menuItems = useMemo(() => getMenuItems(userId), [userId]);

  const filteredMenuItems = useMemo(() => {
    const role = userDetails.Role || "Admin";
    const allowed: Record<string, string[]> = {
      "Admin": menuItems.map(m => m.title),
      "Super Admin": menuItems.map(m => m.title),
      "Manager": ["Session Logs","Sales Performance","Conversion Rates","Customer Database","National","My Team","Reports","Help Center","What is Taskflow?"],
      "Special Access": ["Session Logs","Sales Performance","Conversion Rates","Customer Database","National","My Team","Reports","Help Center","What is Taskflow?"],
      "Territory Sales Manager": ["Session Logs","Sales Performance","Conversion Rates","Customer Database","National","My Team","Reports","Help Center","What is Taskflow?"],
      "Territory Sales Associate": ["Session Logs","Sales Performance","Conversion Rates","Customer Database","National","Work Management","Reports","Help Center","What is Taskflow?"]
    };
    return menuItems.filter(item => allowed[role]?.includes(item.title));
  }, [menuItems, userDetails]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex fixed inset-y-0 left-0 z-50 h-screen transition-all duration-300 flex-col shadow-lg
        ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}
        ${isOpen ? "w-64" : "w-16"}`}>
        <div className="flex items-center justify-center p-4">
          <Link href={`/ModuleSales/Sales/Dashboard${userId ? `?id=${encodeURIComponent(userId)}` : ""}`}>
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

      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[9998] flex items-center shadow-t-lg text-sm relative
        ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} transition-all duration-300`}>
        <button className="absolute left-0 top-1/2 -translate-y-1/2 z-[10000] p-2 bg-orange-300 hover:bg-orange-400 dark:bg-gray-700 shadow-md h-full"
          onClick={() => document.getElementById("mobileMenuScroll")?.scrollBy({ left: -100, behavior: "smooth" })}>◀</button>

        <div id="mobileMenuScroll" className="flex overflow-x-auto no-scrollbar flex-1 px-12 gap-x-4 items-center">
          <Link href={`/ModuleSales/Sales/Dashboard${userId ? `?id=${encodeURIComponent(userId)}` : ""}`} className="relative flex-shrink-0 w-20 flex flex-col items-center justify-center py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <BsSpeedometer2 className="text-xl mb-1" />
            <span className="text-[11px] truncate">Dashboard</span>
          </Link>

          {filteredMenuItems.map((item, idx) => (
            <div key={idx} className="relative flex-shrink-0 w-20 text-center">
              <button onClick={() => handleToggle(item.title)} className="flex flex-col items-center justify-center w-full py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <span className="text-xl mb-1">{item.icon && <item.icon />}</span>
                <span className="text-[11px] truncate">{item.title}</span>
              </button>
            </div>
          ))}

          <div className="relative flex-shrink-0 w-20 text-center">
            <button onClick={() => handleToggle("My Profile")} className="flex flex-col items-center justify-center w-full py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <span className="text-xl mb-1"><LuSettings2 /></span>
              <span className="text-[11px] truncate">My Profile</span>
            </button>
          </div>
        </div>

        <button className="absolute right-0 top-1/2 -translate-y-1/2 z-[10000] p-2 bg-orange-300 hover:bg-orange-400 dark:bg-gray-700 shadow-md h-full"
          onClick={() => document.getElementById("mobileMenuScroll")?.scrollBy({ left: 100, behavior: "smooth" })}>▶</button>
      </div>
    </>
  );
};

export default Sidebar;
