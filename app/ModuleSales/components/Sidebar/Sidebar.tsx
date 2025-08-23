"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SidebarMenu from "./SidebarMenu";
import getMenuItems from "./SidebarMenuItems";
import SidebarUserInfo from "./SidebarUserInfo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [collapsed, setCollapsed] = useState(true);
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
    ReferenceID: "" });

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
      return menuItems.filter(item =>
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
      return menuItems.filter(item =>
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
      return menuItems.filter(item =>
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
      return menuItems.filter(item =>
        [ 
          "Session Logs",
          "Sales Performance",
          "Conversion Rates",
          "Customer Database",
          "National",
          "Activities",
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
      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 h-screen transition-all duration-300 flex flex-col shadow-lg
        ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}
        ${isOpen ? "w-64" : "w-16"}`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center p-4">
          <Link
            href={`/ModuleSales/Sales/Dashboard${
              userId ? `?id=${encodeURIComponent(userId)}` : ""
            }`}
          >
            <img
              src={isOpen ? "/taskflow-full.png" : "/taskflow.png"}
              alt="Logo"
              className={`${isOpen ? "w-40" : "w-30"} transition-all`}
            />
          </Link>
        </div>

        {/* Menu Section */}
        <SidebarMenu
          collapsed={!isOpen}
          openSections={openSections}
          handleToggle={handleToggle}
          menuItems={filteredMenuItems}
          userId={userId}
        />

        {/* User Info (only show when expanded) */}
        {isOpen && (
          <div className="text-xs text-left mt-auto p-4">
            <SidebarUserInfo
              collapsed={!isOpen}
              userDetails={userDetails}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
