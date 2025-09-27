"use client";

import React from "react";
import { BsListTask, BsCalendar4Week, BsFileEarmarkCheck } from "react-icons/bs";
import { LuNotebookPen } from "react-icons/lu";
import { SiMinutemailer } from "react-icons/si";
import { FaSquareCheck } from "react-icons/fa6";

interface ToolsProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  userDetails: any;
}

const Tools: React.FC<ToolsProps> = ({ activeTab, setActiveTab, userDetails }) => {
  // ✅ Check if role is Territory Sales Manager
  const isTerritoryManager = userDetails?.Role === "Territory Sales Manager";

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="font-bold text-xs">Tools</h3>

      {/* Activity - always visible */}
      <button
        onClick={() => setActiveTab("activity")}
        className="2 rounded-lg flex items-center justify-center gap-2 text-left"
        >
        <BsCalendar4Week />
      </button>

      {/* Tasklist - hidden for Territory Sales Manager */}
      {!isTerritoryManager && (
        <button
          onClick={() => setActiveTab("tasklist")}
          className="2 rounded-lg flex items-center justify-center gap-2 text-left"
        >
          <FaSquareCheck />
        </button>
      )}

      {/* Scheduled - hidden for Territory Sales Manager */}
      {!isTerritoryManager && (
        <button
          onClick={() => setActiveTab("scheduled")}
          className="2 rounded-lg flex items-center justify-center gap-2 text-left"
        >
          <BsListTask />
        </button>
      )}

      {/* Notes - hidden for Territory Sales Manager */}
      {!isTerritoryManager && (
        <button
          onClick={() => setActiveTab("notes")}
          className="2 rounded-lg flex items-center justify-center gap-2 text-left"
        >
          <LuNotebookPen />
        </button>
      )}

      {/* Quote - hidden for Territory Sales Manager */}
      {!isTerritoryManager && (
        <button
          onClick={() => setActiveTab("quote")}
          className="2 rounded-lg flex items-center justify-center gap-2 text-left"
        >
          <BsFileEarmarkCheck />
        </button>
      )}

      {/*
      <button
        onClick={() => setActiveTab("xendmail")}
        className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
          activeTab === "xendmail" ? "bg-orange-400 text-white" : "bg-gray-100"
        }`}
      >
        <SiMinutemailer />
      </button>
      */}
    </div>
  );
};

export default Tools;
