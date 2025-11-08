"use client";

import React from "react";
import { BsCalendar4Week } from "react-icons/bs";
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
        </>
      )}

      {/* Manager or TSM sees only Tasklist and Xend-Mail */}
      {isManagerOrTSM && (
        <>
          {renderButton("Activity", <BsCalendar4Week />, "activity")}
        </>
      )}
    </div>
  );
};

export default Tools;
