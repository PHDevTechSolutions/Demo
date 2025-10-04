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
  const role = userDetails?.Role;

  const isAssociate = role === "Territory Sales Associate";
  const isManagerOrTSM = role === "Manager" || role === "Territory Sales Manager";

  const renderButton = (title: string, icon: React.ReactNode, tabName: string) => (
    <button
      onClick={() => setActiveTab(tabName)}
      title={title}
      className={`p-2 rounded-lg flex items-center justify-center gap-2 text-left ${
        activeTab === tabName ? "bg-orange-400 text-white" : "bg-white text-black border shadow"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="font-bold text-xs">Tools</h3>

      {/* Territory Sales Associate sees everything */}
      {isAssociate && (
        <>
          {renderButton("Activity", <BsCalendar4Week />, "activity")}
          {renderButton("Tasklist", <FaSquareCheck />, "tasklist")}
          {renderButton("Scheduled", <BsListTask />, "scheduled")}
          {renderButton("Notes", <LuNotebookPen />, "notes")}
          {renderButton("Quote", <BsFileEarmarkCheck />, "quote")}
          {renderButton("Xend-Mail", <SiMinutemailer />, "xendmail")}
        </>
      )}

      {/* Manager or TSM sees only Tasklist and Xend-Mail */}
      {isManagerOrTSM && (
        <>
          {renderButton("Tasklist", <FaSquareCheck />, "tasklist")}
          {renderButton("Xend-Mail", <SiMinutemailer />, "xendmail")}
        </>
      )}
    </div>
  );
};

export default Tools;
