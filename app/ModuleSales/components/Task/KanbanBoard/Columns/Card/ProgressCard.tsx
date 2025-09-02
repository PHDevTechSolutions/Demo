import React, { useState } from "react";
import { FaRegCircle, FaCircle } from "react-icons/fa";
import { PieChart } from "react-minimal-pie-chart";

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
  childrenProgress?: ProgressItem[];
}

interface ProgressCardProps {
  progress: ProgressItem;
  profilePicture: string;
  onAddClick: () => void;
  onDeleteClick?: (progress: ProgressItem) => Promise<void>;
  childrenProgress?: ProgressItem[];
  onDeleteChildClick?: (child: ProgressItem) => Promise<void>;
}

const STATUS_PERCENT: Record<string, number> = {
  "On Progress": 10,
  "Assisted": 20,
  "Quote-Done": 40,
  "SO-Done": 70,
  "Delivered": 100,
};

const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  profilePicture,
  onAddClick,
  onDeleteClick,
  childrenProgress = [],
  onDeleteChildClick,
}) => {
  const [showChildren, setShowChildren] = useState(true);
  const [childrenLoading, setChildrenLoading] = useState(false); // 🔹 Loading per children section
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProgressItem | null>(null);
  const [isChild, setIsChild] = useState(false);

  const computePercent = () => {
    const allItems = [progress, ...childrenProgress];
    const total = allItems.length;
    if (total === 0) return 0;

    const sum = allItems.reduce((acc, item) => {
      return acc + (STATUS_PERCENT[item.activitystatus || "On Progress"] || 0);
    }, 0);

    return Math.round(sum / total);
  };

  const percent = computePercent();

  const handleDeleteClick = (item: ProgressItem, child = false) => {
    setDeleteTarget(item);
    setIsChild(child);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setChildrenLoading(true);

    try {
      if (isChild && onDeleteChildClick) await onDeleteChildClick(deleteTarget);
      else if (!isChild && onDeleteClick) await onDeleteClick(deleteTarget);
    } finally {
      setChildrenLoading(false);
      setShowDeleteModal(false);
      setShowFinalModal(true);
    }
  };

  return (
    <div className="rounded-lg shadow bg-orange-100 overflow-hidden relative p-2">
      {/* Header */}
      <div className="flex items-center mb-2">
        <img src={profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover mr-3" />
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <FaCircle className="text-orange-500 w-2 h-2" />
            <p className="font-semibold text-[10px] uppercase">{progress.companyname}</p>
          </div>
          {progress.activitynumber && <p className="text-[8px] text-gray-600">Activity #: {progress.activitynumber}</p>}
        </div>

        {childrenProgress.length > 0 && (
          <div className="flex items-center ml-auto space-x-2">
            <PieChart
              data={[
                { title: "Progress", value: percent, color: "#34D399" },
                { title: "Remaining", value: 100 - percent, color: "#E5E7EB" },
              ]}
              totalValue={100}
              lineWidth={40}
              animate
              className="w-5 h-5"
            />
            <button onClick={() => setShowChildren(!showChildren)} className="text-[9px] text-blue-600 underline">
              {showChildren ? "Hide" : "Show"} Logs ({childrenProgress.length})
            </button>
          </div>
        )}
      </div>

      {/* Parent details */}
      <div className="pl-2 mb-2 text-[10px]">
        <p><span className="font-semibold">Contact Person:</span> {progress.contactperson}</p>
        <p><span className="font-semibold">Contact #:</span> {progress.contactnumber}</p>
        <p><span className="font-semibold">Email:</span> {progress.emailaddress}</p>
        <p><span className="font-semibold">Type:</span> {progress.typeclient}</p>
        <p className="text-gray-500 text-[8px]">{progress.date_created ? new Date(progress.date_created).toLocaleString() : "N/A"}</p>
      </div>

      {/* Children */}
      {showChildren && (
        <div className="ml-6 relative">
          {childrenLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-50">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          )}
          <div className="absolute top-0 left-3 h-full border-l-2 border-gray-400"></div>
          {childrenProgress.map((child, idx) => (
            <div key={idx} className="relative pl-4 mb-2">
              <div className="absolute top-3 left-0 w-3 border-t-2 border-gray-400"></div>
              <div className="flex items-start space-x-1">
                <FaRegCircle className="text-gray-500 w-2 h-2 mt-1" />
                <div className="p-2 bg-white border border-gray-200 rounded text-[9px] w-full flex flex-col">
                  <div>
                    <p><span className="font-semibold">Type:</span> {child.typeactivity}</p>
                    <p><span className="font-semibold">Quotation Number:</span> {child.quotationnumber}</p>
                    <p><span className="font-semibold">Quotation Amount:</span> {child.quotationamount}</p>
                    <p><span className="font-semibold">Remarks:</span> {child.remarks}</p>
                    <p className="text-gray-500 text-[8px]">{child.date_created ? new Date(child.date_created).toLocaleString() : "N/A"}</p>
                  </div>
                  {onDeleteChildClick && (
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={() => handleDeleteClick(child, true)}
                        className="px-1 py-0.5 bg-red-500 text-white text-[8px] rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add & Delete Buttons */}
      <div className="flex justify-end mt-2 space-x-2">
        <button onClick={onAddClick} className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded hover:bg-blue-600">
          Add
        </button>
        {onDeleteClick && (
          <button
            onClick={() => handleDeleteClick(progress)}
            className="px-2 py-1 bg-red-500 text-white text-[10px] rounded hover:bg-red-600"
          >
            Delete
          </button>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]">
          <div className="bg-white p-4 rounded shadow w-80 text-sm">
            <h3 className="font-semibold mb-2">Confirm Deletion</h3>
            <p>
              Are you sure you want to delete {isChild ? "this log entry" : "this activity"}?
              This action can be undone in the next step.
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Modal - Permanent Deletion */}
      {showFinalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]">
          <div className="bg-white p-4 rounded shadow w-80 text-sm">
            <h3 className="font-semibold mb-2">Delete Permanently</h3>
            <p>
              This action <span className="font-semibold text-red-600">cannot be undone</span>.
              Are you sure you want to delete {isChild ? "this log entry" : "this activity"} permanently?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowFinalModal(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFinalModal(false)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressCard;
