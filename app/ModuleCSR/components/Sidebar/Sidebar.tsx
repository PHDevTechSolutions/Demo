"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import SidebarMenu from "./SidebarMenu";
import getMenuItems from "./SidebarMenuItems";
import SidebarUserInfo from "./SidebarUserInfo";

const Sidebar: React.FC<{ isOpen: boolean, onClose: () => void; isDarkMode: boolean; }> = ({ isOpen, onClose, isDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);
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

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleToggle = (section: string) => {
    setOpenSections((prevSections: any) => ({
      ...prevSections,
      [section]: !prevSections[section],
    }));
  };

  const menuItems = getMenuItems(userId);

  const filteredMenuItems = (() => {
    const role = userDetails.Role;
    if (role === "Admin" || role === "Super Admin") return menuItems;

    if (role === "Staff") {
      return menuItems.filter(item =>
        [
          "Inquiries",
          "Customer Database",
          "Reports",
          "Taskflow",
          "Eco Help",
          "Help Center",
          "What is Ecodesk?",
        ].includes(item.title)
      );
    }
    return [];
  })();

  return (
    <>
      {/* Overlay Background (Closes Sidebar on Click) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 h-screen transition-all duration-300 flex flex-col
      ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} 
      ${collapsed ? "w-16" : "w-64"} 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center">
            <img src="/ecodesk.png" alt="Logo" className="h-8 mr-2" />
            <Link href={`/ModuleCSR/CSR/Dashboard${userId ? `?id=${encodeURIComponent(userId)}` : ''}`}>
              <h1 className={`text-md font-bold transition-opacity ${collapsed ? "opacity-0" : "opacity-100"}`}>
                <span>ECODESK </span>
              </h1>
            </Link>
          </div>
        </div>

        {/* Menu Section */}
        <SidebarMenu
          collapsed={collapsed}
          openSections={openSections}
          handleToggle={handleToggle}
          menuItems={filteredMenuItems}
          userId={userId}
        />

        {/* User Details Section */}
        {!collapsed && (
          <div className="text-xs text-left">
            <SidebarUserInfo
              collapsed={collapsed}
              userDetails={userDetails}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
