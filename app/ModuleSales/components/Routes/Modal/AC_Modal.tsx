"use client";

import React from "react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Post {
  companyname: string;
  typeactivity: string;
  remarks: string;
  contactperson: string;
  contactnumber: string;
  date_created: string;
}

interface ModalProps {
  selectedDate: Date;
  selectedPosts: Post[];
  onClose: () => void;
}

const Tools: React.FC<ModalProps> = ({ selectedDate, selectedPosts, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <DialogTitle className="text-white flex items-center gap-2 text-lg font-semibold">
            🕒 Activities on {format(selectedDate, "MMMM dd, yyyy")} ({selectedPosts.length})
          </DialogTitle>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-white hover:text-gray-200 transition text-xl font-bold"
          >
            ×
          </button>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto bg-white">
          {selectedPosts.length > 0 ? (
            selectedPosts.map((post, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {post.companyname}
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    {new Date(post.date_created).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-700 space-y-1">
                  <p>
                    📌 <span className="font-medium">Activity:</span> {post.typeactivity || "N/A"}
                  </p>
                  <p>
                    📝 <span className="font-medium">Remarks:</span> {post.remarks || "None"}
                  </p>
                  <p>
                    📞 <span className="font-medium">Contact:</span> {post.contactperson} ({post.contactnumber})
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm">
              No activities found on this day.
            </p>
          )}
        </div>

        <DialogFooter className="bg-gray-50 px-6 py-3 flex justify-end">
          <Button onClick={onClose} variant="default" size="sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Tools;
