"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Activity {
  id?: number | string;
  activitynumber: string;
  date_created?: string;
  startdate: string;
  enddate: string;
  typeactivity: string;
  callback?: string;
  callstatus: string;
  typecall: string;
  quotationnumber: string;
  quotationamount: number | string;
  soamount: number | string;
  sonumber: string;
  actualsales: number | string;
  remarks: string;
  activitystatus: string;
}

interface HistoricalRecordsCarouselProps {
  records: Activity[];
  handleShowRemarks: (remarks: string) => void;
}

const HistoricalRecordsCarousel: React.FC<HistoricalRecordsCarouselProps> = ({
  records,
  handleShowRemarks,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.clientWidth / 3; // show 3 cards
      containerRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a.date_created || "").getTime();
    const dateB = new Date(b.date_created || "").getTime();
    return dateB - dateA;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    const formattedDateStr = date.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${formattedDateStr} ${hours}:${minutesStr} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assisted":
        return "bg-blue-400 text-white";
      case "Paid":
        return "bg-green-500 text-white";
      case "Delivered":
        return "bg-cyan-400 text-white";
      case "Collected":
        return "bg-indigo-500 text-white";
      case "Quote-Done":
        return "bg-slate-500 text-white";
      case "SO-Done":
        return "bg-purple-500 text-white";
      case "Cancelled":
        return "bg-red-500 text-white";
      case "Loss":
        return "bg-red-800 text-white";
      default:
        return "bg-slate-200 text-blue-700";
    }
  };

  if (sortedRecords.length === 0) {
    return (
      <div className="text-center py-6 border rounded-lg text-gray-500 bg-gray-50">
        No activities found.
      </div>
    );
  }

  return (
    <div className="relative mt-3 w-full">
      {/* Left Button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow rounded-full p-2"
      >
        <FiChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-hidden scroll-smooth px-10"
      >
        {sortedRecords.map((activity, index) => {
          const start = new Date(activity.startdate);
          const end = new Date(activity.enddate);
          let timeSpent = "Invalid date";
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const diffMs = end.getTime() - start.getTime();
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            timeSpent = `${hours}h ${minutes}m ${seconds}s`;
          }

          return (
            <motion.div
              key={`${activity.activitynumber}-${index}`}
              className="flex-shrink-0 w-1/3 min-w-[300px] border rounded-2xl shadow-sm p-4 bg-white hover:shadow-md transition duration-200"
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(
                    activity.activitystatus
                  )}`}
                >
                  {activity.activitystatus} / {activity.activitynumber}
                </span>
                <span className="text-[10px] text-gray-500">
                  {activity.date_created
                    ? formatDate(new Date(activity.date_created).getTime())
                    : "—"}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-semibold">Activity:</span>{" "}
                  {activity.typeactivity}
                </p>
                <p>
                  <span className="font-semibold">Type:</span>{" "}
                  {activity.typecall}
                </p>
                <p>
                  <span className="font-semibold">Callback:</span>{" "}
                  {activity.callback
                    ? new Date(activity.callback).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—"}
                </p>
                <p>
                  <span className="font-semibold">Call Status:</span>{" "}
                  {activity.callstatus}
                </p>
                <p>
                  <span className="font-semibold">Quotation Summary:</span>{" "}
                  {activity.quotationnumber || "—"} / {activity.quotationamount || "—"}
                </p>
                <p>
                  <span className="font-semibold">SO Summary:</span>{" "}
                  {activity.sonumber || "—"} / {activity.soamount || "—"}
                </p>
                <p>
                  <span className="font-semibold">Actual Sales:</span>{" "}
                  {activity.actualsales || "—"}
                </p>
                <p>
                  <span className="font-semibold">Time Spent:</span>{" "}
                  {timeSpent}
                </p>
                <p
                  className="text-gray-700 mt-1 italic cursor-pointer line-clamp-2 hover:line-clamp-none transition-all"
                  onClick={() => handleShowRemarks(activity.remarks)}
                >
                  “{activity.remarks || "No remarks"}”
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow rounded-full p-2"
      >
        <FiChevronRight className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
};

export default HistoricalRecordsCarousel;
