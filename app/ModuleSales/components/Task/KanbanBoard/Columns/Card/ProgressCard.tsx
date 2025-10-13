"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { FaChevronDown, FaChevronUp, FaPen, FaTrash, FaInfoCircle } from "react-icons/fa";
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
  allProgress?: ProgressItem[];
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
  allProgress,
  profilePicture,
  onAddClick,
  onDeleteClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [showInfo, setShowInfo] = useState(false); // ✅ for duplicate modal
  const [soData, setSoData] = useState<any>(null);

  if (
    progress.activitystatus === "Cold" 
    || progress.activitystatus === "Warm" || progress.activitystatus === "Hot" 
    || progress.activitystatus === "Done" || progress.activitystatus === "Deleted" 
    || progress.activitystatus === "Delivered"
  ) return null;

  const percent = STATUS_PERCENT[progress.activitystatus || "On Progress"] || 0;
  const bgColor = STATUS_BG[progress.activitystatus || ""] || "bg-orange-100";

  // ✅ Find duplicates (same companyname, not done/delivered)
  const duplicates =
    allProgress?.filter(
      (item) =>
        item.companyname === progress.companyname && item.id !== progress.id
    ) || [];


  useEffect(() => {
    const fetchSOData = async () => {
      if (!progress.activitynumber) return;
      try {
        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchQS?activitynumber=${progress.activitynumber}`
        );
        const result = await res.json();
        if (result.success) setSoData(result.data);
      } catch (err) {
        console.error("Failed to fetch SO data:", err);
      }
    };
    fetchSOData();
  }, [progress.activitynumber]);

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
      {/* Header */}
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
          {/* ✅ Info Button */}
          {duplicates.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(true);
              }}
              className="px-2 py-1 bg-purple-500 text-white text-[10px] rounded hover:bg-purple-600 flex items-center gap-1"
              title="Show duplicate transactions"
            >
              <FaInfoCircle size={10} /> Info
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick();
            }}
            className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded hover:bg-blue-600 flex items-center gap-1"
          >
            <FaPen size={10} /> Update
          </button>
          {isExpanded && <DoughnutChart percent={percent} size="w-5 h-5" />}
          {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="pl-2 mb-2 text-[10px]">
          <p><span className="font-semibold">Contact Person:</span> {progress.contactperson}</p>
          <p><span className="font-semibold">Contact #:</span> {progress.contactnumber}</p>
          <p><span className="font-semibold">Email:</span> {progress.emailaddress}</p>
          <p><span className="font-semibold">Type:</span> {progress.typeclient}</p>
          {soData && (
            <>
              <p><span className="font-semibold">Quotation:</span> {soData.quotationnumber} | {soData.quotationamount}</p>
              <p><span className="font-semibold">Sales Order:</span> {soData.sonumber} | {soData.soamount}</p>
            </>
          )}
          {progress.remarks && <p><span className="font-semibold">Remarks:</span> {progress.remarks}</p>}
          <p className="text-gray-500 text-[8px]">{progress.date_updated}</p>
        </div>
      )}

      {/* ✅ Duplicate Info Modal */}
      {showInfo && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[300px] p-3 text-[10px]">
            <h3 className="font-bold text-[11px] mb-2 text-center">
              Duplicate Transactions for {progress.companyname}
            </h3>
            {duplicates.map((dup) => (
              <div
                key={dup.id}
                className="border p-2 mb-1 rounded bg-gray-50"
              >
                <p><span className="font-semibold">Status:</span> {dup.activitystatus}</p>
                <p><span className="font-semibold">Activity #:</span> {dup.activitynumber}</p>
                <p><span className="font-semibold">Remarks:</span> {dup.remarks || "N/A"}</p>
              </div>
            ))}
            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-2 bg-purple-500 hover:bg-purple-600 text-white py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Modals */}
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
