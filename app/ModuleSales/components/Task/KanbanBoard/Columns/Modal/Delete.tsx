"use client";

import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  isChild: boolean;
  deleteTarget: { companyname?: string; activitynumber?: string } | null;
  step: 1 | 2; // step 1 = confirmation, step 2 = permanent
  onCancel: () => void;
  onContinue?: () => void; // step 1 button
  onConfirm?: () => void; // step 2 button
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  isChild,
  deleteTarget,
  step,
  onCancel,
  onContinue,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="bg-white p-4 rounded-lg shadow-md w-80">
        {step === 1 ? (
          <>
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              {isChild ? "Confirm Delete Child Log" : "Confirm Delete Parent Activity"}
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              {isChild
                ? "Are you sure you want to delete this child log?"
                : "Are you sure you want to delete this parent activity (including all its logs)?"}
              <br />
              <span className="font-bold">
                {deleteTarget?.companyname || deleteTarget?.activitynumber}
              </span>
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={onCancel}
                className="px-3 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={onContinue}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-red-600 mb-2">
              {isChild ? "Permanently Delete Child Log" : "Permanently Delete Parent Activity"}
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              {isChild
                ? "This action cannot be undone. Do you want to permanently delete this child log?"
                : "Warning: This will delete the parent activity and may affect all related logs. Do you want to proceed?"}
              <br />
              <span className="font-bold">
                {deleteTarget?.companyname || deleteTarget?.activitynumber}
              </span>
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={onCancel}
                className="px-3 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Permanently Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteModal;
