"use client";

import React from "react";
import { BsInfoCircle } from "react-icons/bs";

interface BannerProps {
  show: boolean;
}

const Banner: React.FC<BannerProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="bg-blue-50 border border-blue-300 text-blue-800 px-6 py-4 rounded-xl shadow-md mb-4 relative flex items-start gap-3">
      <div className="mt-1 text-blue-600">
        <BsInfoCircle size={22} />
      </div>
      <div className="flex-1 text-sm leading-relaxed">
        <strong className="font-semibold text-blue-900">Coming Soon:</strong>
        <span> The </span>
        <span className="font-medium">Scheduled Task</span> module will be
        converted into
        <span className="font-medium"> Activity Planner</span>.
        <br />
        <span>
          This will include features such as
          <span className="italic">
            {" "}
            client meetings, outbound calls, follow-ups (callbacks), Personal
            Activities, and CSR inquiries
          </span>
          .
        </span>
        <br />
        <span>
          The new UI will feature a{" "}
          <a
            href="https://www.atlassian.com/agile/kanban/boards"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 underline hover:text-blue-800 transition"
          >
            Kanban Board with Calendar
          </a>{" "}
          view for easier task management.
        </span>
      </div>
    </div>
  );
};

export default Banner;
