"use client";

import React from "react";

interface DeleteConfirmationModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-opacity-[10] flex items-center justify-center bg-black/20 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-red-500 to-red-600">
          <h3 className="text-white font-semibold text-lg">Confirm Delete</h3>
          <button
            onClick={onCancel}
            className="text-white hover:text-gray-200 transition text-lg"
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-xs text-gray-700 space-y-2">
          <p>
            Deleting this history will affect on your reports unless if the records is duplicate
          </p>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-xs"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
