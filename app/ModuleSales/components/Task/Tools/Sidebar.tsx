"use client";

import React from "react";
import { BsListTask, BsCalendar4Week } from "react-icons/bs";
import { LuNotebookPen } from "react-icons/lu";
import { SiMinutemailer } from 'react-icons/si';

interface ToolsProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const Tools: React.FC<ToolsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col space-y-2">
      <h3 className="font-bold text-xs">Tools</h3>

      <button
        onClick={() => setActiveTab("scheduled")}
        className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
          activeTab === "scheduled"
            ? "bg-orange-400 text-white"
            : "bg-gray-100"
        }`}
      >
        <BsListTask />
      </button>

      <button
        onClick={() => setActiveTab("notes")}
        className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
          activeTab === "notes"
            ? "bg-orange-400 text-white"
            : "bg-gray-100"
        }`}
      >
        <LuNotebookPen />
      </button>

      <button
        onClick={() => setActiveTab("activity")}
        className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
          activeTab === "activity"
            ? "bg-orange-400 text-white"
            : "bg-gray-100"
        }`}
      >
        <BsCalendar4Week />
      </button>

      <button
        onClick={() => setActiveTab("xendmail")}
        className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
          activeTab === "xendmail"
            ? "bg-orange-400 text-white"
            : "bg-gray-100"
        }`}
      >
        <SiMinutemailer />
      </button>
    </div>
  );
};

export default Tools;
