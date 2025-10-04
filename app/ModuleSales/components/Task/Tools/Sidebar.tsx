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
  const isTerritoryManager = userDetails?.Role === "Territory Sales Manager";
  const isManager = userDetails?.Role === "Manager";

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="font-bold text-xs">Tools</h3>

      {/* Activity */}
      <button
        onClick={() => setActiveTab("activity")}
        title="Activity"
        className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
          activeTab === "activity" ? "bg-orange-400 text-white" : "bg-white text-black border shadow"
        }`}
      >
        <BsCalendar4Week />
      </button>

      {/* Tasklist */}
      {!(isTerritoryManager || isManager) && (
        <button
          onClick={() => setActiveTab("tasklist")}
          title="Tasklist"
          className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
            activeTab === "tasklist" ? "bg-orange-400 text-white" : "bg-white text-black border shadow"
          }`}
        >
          <FaSquareCheck />
        </button>
      )}

      {/* Scheduled */}
      {!(isTerritoryManager || isManager) && (
        <button
          onClick={() => setActiveTab("scheduled")}
          title="Scheduled"
          className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
            activeTab === "scheduled" ? "bg-orange-400 text-white" : "bg-white text-black border shadow"
          }`}
        >
          <BsListTask />
        </button>
      )}

      {/* Notes */}
      {!(isTerritoryManager || isManager) && (
        <button
          onClick={() => setActiveTab("notes")}
          title="Notes"
          className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
            activeTab === "notes" ? "bg-orange-400 text-white" : "bg-white text-black border shadow"
          }`}
        >
          <LuNotebookPen />
        </button>
      )}

      {/* Quote */}
      {!(isTerritoryManager || isManager) && (
        <button
          onClick={() => setActiveTab("quote")}
          title="Quote"
          className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
            activeTab === "quote" ? "bg-orange-400 text-white" : "bg-white text-black border shadow"
          }`}
        >
          <BsFileEarmarkCheck />
        </button>
      )}

      {/* XendMail */}
      <button
        onClick={() => setActiveTab("xendmail")}
        title="Xend-Mail"
        className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
          activeTab === "xendmail" ? "bg-orange-400 text-white" : "bg-white text-black border shadow"
        }`}
      >
        <SiMinutemailer />
      </button>
    </div>
  );
};

export default Tools;
