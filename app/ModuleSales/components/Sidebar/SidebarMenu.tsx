"use client";
import React from "react";
import Link from "next/link";
import { RxCaretDown, RxCaretLeft } from "react-icons/rx";
import { FaRegCircle } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";
import { BsSpeedometer2 } from "react-icons/bs";

interface SubItem {
  title: string;
  href: string;
  description?: string;
}

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  subItems: SubItem[];
  isDashboard?: boolean; // ✅ para alam natin special siya
}

interface SidebarMenuProps {
  collapsed: boolean;
  openSections: Record<string, boolean>;
  handleToggle: (title: string) => void;
  menuItems: MenuItem[];
  userId: string | null;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  collapsed,
  openSections,
  handleToggle,
  menuItems,
  userId,
}) => {
  // ✅ Define Dashboard item
  const dashboardItem: MenuItem = {
    title: "Dashboard",
    icon: BsSpeedometer2,
    subItems: [],
    isDashboard: true,
  };

  const myProfileItem: MenuItem = {
    title: "My Profile",
    icon: CiSettings,
    subItems: [
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
    ],
  };

  // ✅ Dashboard always first
  const allItems: MenuItem[] = [dashboardItem, myProfileItem, ...menuItems.filter(i => i.title !== "My Profile")];

  const renderSubItems = (items: SubItem[]) => (
    <div className="flex flex-col bg-gray-100 rounded-md">
      {items.map((subItem, idx) => (
        <Link
          key={idx}
          href={subItem.href}
          className="flex items-center p-3 text-gray-800 hover:bg-orange-400 hover:text-white transition-all"
        >
          <FaRegCircle size={10} className="mr-2 ml-2" />
          <span className="text-[11px]">{subItem.title}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col flex-grow overflow-y-auto text-xs p-2">
      {allItems.map((item, index) => {
        const isOpen = !!openSections[item.title];
        const Icon = item.icon;

        // ✅ Special case: Dashboard = simple link
        if (item.isDashboard) {
          return (
            <div key={index} className="w-full mb-1">
              <Link
                href={`/ModuleSales/Sales/Dashboard${userId ? `?id=${encodeURIComponent(userId)}` : ""}`}
                className={`flex items-center w-full p-4 rounded transition-all duration-300 
                  hover:bg-orange-500 hover:text-white hover:shadow-md active:scale-95 bg-orange-400 text-white
                  ${collapsed ? "justify-center" : "justify-start"}`}
              >
                <Icon size={20} />
                {!collapsed && <span className="ml-2">Dashboard</span>}
              </Link>
            </div>
          );
        }

        // ✅ Other menu items
        return (
          <div key={index} className="w-full relative">
            {/* Parent Row */}
            <button
              onClick={() => handleToggle(item.title)}
              aria-expanded={isOpen}
              className={`flex items-center w-full p-4 rounded transition-all duration-300 
                hover:bg-orange-400 hover:text-white hover:shadow-md active:scale-95
                ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={20} />
              {!collapsed && <span className="ml-2">{item.title}</span>}
              {!collapsed && (
                <span className="ml-auto">
                  {isOpen ? <RxCaretDown size={15} /> : <RxCaretLeft size={15} />}
                </span>
              )}
            </button>

            {/* DESKTOP Submenu */}
            <div
              className={`
                hidden md:block overflow-hidden transition-all duration-300 ease-in-out 
                ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
              `}
            >
              {isOpen && renderSubItems(item.subItems)}
            </div>

            {/* MOBILE Submenu */}
            {isOpen && (
              <button
                className="md:hidden fixed inset-0 bg-black/40 z-[65]"
                onClick={() => handleToggle(item.title)}
                aria-label="Close submenu"
              />
            )}
            <div
              className={`
                md:hidden fixed left-0 right-0 z-[70] 
                transition-transform duration-300 ease-out
                ${isOpen ? "translate-y-0" : "translate-y-[120%]"}
                bottom-14
              `}
            >
              <div className="mx-3 rounded-xl border bg-white dark:bg-gray-900 shadow-lg max-h-[60vh] overflow-y-auto p-2">
                <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                  {item.title}
                </div>
                {renderSubItems(item.subItems)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SidebarMenu;
