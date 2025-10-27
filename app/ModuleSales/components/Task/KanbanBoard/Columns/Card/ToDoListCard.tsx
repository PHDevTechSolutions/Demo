"use client";
import React, { RefObject } from "react";

interface ToDoListCardProps {
  todo: any;
  editingId: string | null;
  editingValue: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingValue: React.Dispatch<React.SetStateAction<string>>;
  handleUpdateRemarks: (id: string, newVal: string) => void;
  toggleComplete: (id: string, currentStatus: string) => Promise<void>;
  isSiteVisitRemark: (text: string) => boolean;
  extractSiteVisitRemark: (text: string) => string;
  formatToManilaTime: (date: string) => string;
}

const ToDoListCard: React.FC<ToDoListCardProps> = ({
  todo,
  editingId,
  editingValue,
  textareaRef,
  setEditingId,
  setEditingValue,
  handleUpdateRemarks,
  toggleComplete,
  isSiteVisitRemark,
  extractSiteVisitRemark,
  formatToManilaTime,
}) => {
  const showAsSiteVisit =
    todo.typeactivity === "Outbound calls" && isSiteVisitRemark(todo.remarks);

  return (
    <div
      key={todo.id}
      onClick={(e) => {
        if ((e.target as HTMLElement).tagName === "INPUT") return;
        setEditingId(todo.id);
        setEditingValue(todo.remarks);
      }}
      className={`p-2 border rounded-md cursor-pointer transition-all ${
        todo.scheduled_status === "Done"
          ? "bg-green-100"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 relative">
          <p className="text-[11px] font-semibold mb-0.5">
            {showAsSiteVisit
              ? "📅 Site Visit Scheduled"
              : todo.typeactivity}
          </p>

          {editingId === todo.id ? (
            <div className="relative">
              <textarea
                ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
                className="text-[10px] border rounded-md p-1 w-full resize-none pr-12"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() =>
                  handleUpdateRemarks(todo.id, editingValue.trim())
                }
                autoFocus
              />
              <button
                type="button"
                onClick={() =>
                  handleUpdateRemarks(todo.id, editingValue.trim())
                }
                className="absolute bottom-1 right-1 bg-green-600 text-white text-[9px] px-2 py-0.5 rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-gray-600">
              {extractSiteVisitRemark(todo.remarks || "")}
            </p>
          )}

          {/* 🕒 Show start/end only if NOT Site Visit Scheduled */}
          {!(
            todo.typeactivity === "Outbound calls" &&
            isSiteVisitRemark(todo.remarks)
          ) && (
            <p className="text-[9px] text-gray-500">
              {formatToManilaTime(todo.startdate)} →{" "}
              {formatToManilaTime(todo.enddate)}
            </p>
          )}
        </div>

        <input
          type="checkbox"
          checked={todo.scheduled_status === "Done"}
          onChange={() =>
            toggleComplete(todo.id, todo.scheduled_status)
          }
          className="w-4 h-4 accent-green-600 mt-1 ml-2 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ToDoListCard;
