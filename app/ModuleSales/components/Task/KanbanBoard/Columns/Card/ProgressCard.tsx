"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { FaChevronDown, FaChevronUp, FaPen, FaTrash } from "react-icons/fa";
import DeleteModal from "../Modal/Delete";
import DoughnutChart from "../Chart/Doughnut";

export interface ProgressItem {
  id: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  typeactivity?: string;
  referenceid: string;
  date_created: string;
  date_updated: string;
  remarks?: string;
  address?: string;
  area?: string;
  deliveryaddress?: string;
  activitynumber: string;
  source?: string;
  activitystatus?: string;
  typecall?: string;
  sonumber?: string;
  soamount?: string;
  callback?: string;
  callstatus?: string;
  quotationnumber?: string;
  quotationamount?: string;
  projectname?: string;
  projectcategory?: string | string[];
  projecttype?: string;
  startdate?: string;
  enddate?: string;
  paymentterm: string;
  actualsales: string;
  deliverydate: string;
  followup_date: string;
  ticketreferencenumber: string;
  drnumber: string;
}

interface ProgressCardProps {
  progress: ProgressItem;
  profilePicture?: string;
  onAddClick: () => void;
  onDeleteClick?: (progress: ProgressItem) => Promise<void>;
}

const STATUS_PERCENT: Record<string, number> = {
  "On Progress": 10,
  Assisted: 20,
  "Quote-Done": 40,
  "SO-Done": 70,
  Delivered: 100,
  Done: 100,
};

const STATUS_BG: Record<string, string> = {
  Assisted: "bg-orange-100",
  Paid: "bg-white",
  Delivered: "bg-green-500",
  Collected: "bg-white",
  "Quote-Done": "bg-blue-200",
  "SO-Done": "bg-yellow-200",
  Cancelled: "bg-red-300",
  Loss: "bg-red-300",
};

const ProgressCardComponent: React.FC<ProgressCardProps> = ({
  progress,
  profilePicture,
  onAddClick,
  onDeleteClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0); // 0 = closed, 1 = step1, 2 = step2
  const [soData, setSoData] = useState<any>(null);

  if (progress.activitystatus === "Done" || progress.activitystatus === "Delivered") return null;

  const percent = STATUS_PERCENT[progress.activitystatus || "On Progress"] || 0;
  const bgColor = STATUS_BG[progress.activitystatus || ""] || "bg-orange-100";

  // Fetch SO / Quotation data based on activitynumber
  useEffect(() => {
    const fetchSOData = async () => {
      if (!progress.activitynumber) return;
      try {
        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchTask?activitynumber=${progress.activitynumber}`
        );
        const data = await res.json();
        setSoData(data);
      } catch (err) {
        console.error("Failed to fetch SO data:", err);
      }
    };
    fetchSOData();
  }, [progress.activitynumber]);

  const projectCategoryStr = Array.isArray(progress.projectcategory)
    ? progress.projectcategory.join(", ")
    : progress.projectcategory || "";

  const handleDeleteClick = () => setDeleteStep(1);

  const confirmDelete = useCallback(async () => {
    if (!onDeleteClick) return;
    try {
      await onDeleteClick(progress);
      setDeleteStep(0);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }, [onDeleteClick, progress]);

  return (
    <div className={`rounded-lg shadow overflow-hidden relative p-2 ${bgColor}`}>
      <div
        className="flex items-center mb-2 cursor-pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <img
          src={profilePicture || "/default-avatar.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover mr-3"
        />
        <div className="flex flex-col flex-grow">
          <div className="flex items-center space-x-1">
            <p className="font-semibold text-[10px] uppercase">
              {progress.companyname}
            </p>
          </div>
          {progress.activitynumber && (
            <p className="text-[8px] text-gray-600">
              {progress.activitystatus} | {progress.ticketreferencenumber}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onAddClick}
            className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded hover:bg-blue-600 flex items-center gap-1"
          >
            <FaPen size={10} /> Update
          </button>
          {isExpanded && <DoughnutChart percent={percent} size="w-5 h-5" />}
          {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
        </div>
      </div>

      {isExpanded && (
        <div className="pl-2 mb-2 text-[10px]">
          <p><span className="font-semibold">Contact Person:</span> {progress.contactperson}</p>
          <p><span className="font-semibold">Contact #:</span> {progress.contactnumber}</p>
          <p><span className="font-semibold">Email:</span> {progress.emailaddress}</p>
          <p><span className="font-semibold">Type:</span> {progress.typeclient}</p>
          <p><span className="font-semibold">Project Category:</span> {projectCategoryStr}</p>

          {soData && (
            <p>
              <span className="font-semibold">SO / Quotation:</span> {soData.sonumber} | {soData.soamount} | {soData.quotationnumber} | {soData.quotationamount}
            </p>
          )}

          {progress.remarks && <p><span className="font-semibold">Remarks:</span> {progress.remarks}</p>}
          <p className="text-gray-500 text-[8px]">{progress.date_updated}</p>

          <div className="flex justify-end mt-2 space-x-1">
            {onDeleteClick && (
              <button
                onClick={handleDeleteClick}
                className="px-2 py-1 bg-red-500 text-white text-[10px] rounded hover:bg-red-600 flex items-center gap-1"
              >
                <FaTrash size={10} /> Delete
              </button>
            )}
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={deleteStep === 1}
        isChild={false}
        deleteTarget={progress}
        step={1}
        onCancel={() => setDeleteStep(0)}
        onContinue={() => setDeleteStep(2)}
      />

      <DeleteModal
        isOpen={deleteStep === 2}
        isChild={false}
        deleteTarget={progress}
        step={2}
        onCancel={() => setDeleteStep(0)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

const ProgressCard = memo(
  ProgressCardComponent,
  (prev, next) => prev.progress.id === next.progress.id
);

export default ProgressCard;
