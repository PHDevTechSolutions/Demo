"use client";

import React, { useState } from "react";
import { FaCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
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
  projectcategory?: string;
  projecttype?: string;
  startdate?: string;
  enddate?: string;
}

interface ProgressCardProps {
  progress: ProgressItem;
  profilePicture: string;
  onAddClick: () => void;
  onDeleteClick?: (progress: ProgressItem) => Promise<void>;
  onUpdateStatus?: (progress: ProgressItem, status: string) => Promise<void>;
}

const STATUS_PERCENT: Record<string, number> = {
  "On Progress": 10,
  Assisted: 20,
  "Quote-Done": 40,
  "SO-Done": 70,
  Delivered: 100,
  Done: 100,
};

const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  profilePicture,
  onAddClick,
  onDeleteClick,
  onUpdateStatus,
}) => {
  if (progress.activitystatus === "Done") return null;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);

  const computePercent = () => {
    return STATUS_PERCENT[progress.activitystatus || "On Progress"] || 0;
  };

  const percent = computePercent();

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!onDeleteClick) return;
    try {
      await onDeleteClick(progress);
      setShowDeleteModal(false);
      setShowFinalModal(true);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDone = async () => {
    try {
      const response = await fetch(
        "/api/ModuleSales/Task/ActivityPlanner/UpdateProgressDone",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: progress.id }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update");

      toast.success("Marked as Done!", { autoClose: 2000 });

      if (onUpdateStatus) {
        onUpdateStatus(progress, "Done");
      }
    } catch (err) {
      toast.error("Failed to update progress", { autoClose: 2000 });
      console.error(err);
    }
  };

  return (
    <div className="rounded-lg shadow bg-orange-100 overflow-hidden relative p-2">
      {/* Header */}
      <div className="flex items-center mb-2">
        <img
          src={profilePicture}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover mr-3"
        />
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <FaCircle className="text-orange-500 w-2 h-2" />
            <p className="font-semibold text-[10px] uppercase">
              {progress.companyname}
            </p>
          </div>
          {progress.activitynumber && (
            <p className="text-[8px] text-gray-600">
              Activity #: {progress.id} | {progress.activitynumber}
            </p>
          )}
        </div>

        <div className="flex items-center ml-auto space-x-2">
          <DoughnutChart percent={percent} size="w-5 h-5" />
        </div>
      </div>

      {/* Parent details */}
      <div className="pl-2 mb-2 text-[10px]">
        <p>
          <span className="font-semibold">Contact Person:</span>{" "}
          {progress.contactperson}
        </p>
        <p>
          <span className="font-semibold">Contact #:</span>{" "}
          {progress.contactnumber}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {progress.emailaddress}
        </p>
        <p>
          <span className="font-semibold">Type:</span> {progress.typeclient}
        </p>
        <p className="text-gray-500 text-[8px]">
          {progress.date_created
            ? new Date(progress.date_created).toLocaleString()
            : "N/A"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-2 space-x-1">
        <button
          onClick={onAddClick}
          className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded hover:bg-blue-600"
        >
          Add
        </button>
        {onDeleteClick && (
          <button
            onClick={handleDeleteClick}
            className="px-2 py-1 bg-red-500 text-white text-[10px] rounded hover:bg-red-600"
          >
            Delete
          </button>
        )}
        <button
          onClick={handleDone}
          className="px-2 py-1 bg-green-500 text-white text-[10px] rounded hover:bg-green-600"
        >
          Done
        </button>
      </div>

      {/* Step 1: Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal && !showFinalModal}
        isChild={false}
        deleteTarget={progress}
        step={1}
        onCancel={() => setShowDeleteModal(false)}
        onContinue={() => {
          setShowDeleteModal(false);
          setShowFinalModal(true);
        }}
      />

      {/* Step 2: Permanently Delete Modal */}
      <DeleteModal
        isOpen={showFinalModal}
        isChild={false}
        deleteTarget={progress}
        step={2}
        onCancel={() => setShowFinalModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ProgressCard;
