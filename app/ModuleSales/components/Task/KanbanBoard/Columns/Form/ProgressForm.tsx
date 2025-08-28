"use client";

import React from "react";

interface ProgressFormProps {
  formData: Record<string, string>;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const ProgressForm: React.FC<ProgressFormProps> = ({
  formData,
  handleFormChange,
  handleFormSubmit,
  onClose,
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-lg z-50">
      <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <label className="font-semibold">{key.replace(/([A-Z])/g, " $1")}</label>
              <input
                name={key}
                value={value}
                onChange={handleFormChange}
                className="border px-2 py-1 rounded text-xs"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded text-xs hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgressForm;
