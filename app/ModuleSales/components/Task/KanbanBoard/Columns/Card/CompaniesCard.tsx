"use client";

import React from "react";
import { FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Company {
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  address?: string;
  next_available_date?: string | null; 
}

interface CompaniesCardProps {
  comp: Company;
  isExpanded: boolean;
  onToggle: () => void;
  onAdd: (comp: Company) => void;
}

const CompaniesCard: React.FC<CompaniesCardProps> = ({
  comp,
  isExpanded,
  onToggle,
  onAdd,
}) => {
  // 🗓 Format date for readability
  const formattedDate = comp.next_available_date
    ? new Date(comp.next_available_date).toISOString().split("T")[0]
    : null;

  const today = new Date().toISOString().split("T")[0];
  const isToday = formattedDate === today;

  return (
    <div
      className={`rounded-lg border shadow transition text-[10px] mb-2 px-2 py-2 ${
        isToday
          ? "bg-green-300 border-green-600"
          : "bg-blue-100 border-blue-300"
      }`}
    >
      {/* Header section */}
      <div
        className="cursor-pointer flex justify-between items-center p-1"
        onClick={onToggle}
      >
        <div>
          <p className="font-semibold uppercase">{comp.companyname}</p>
          <p className="text-[8px] italic text-gray-700">{comp.typeclient}</p>

          {/* ✅ Show follow-up date only if valid */}
          {formattedDate && (
            <p
              className={`text-[8px] mt-0.5 ${
                isToday ? "text-green-700 font-bold" : "text-gray-600"
              }`}
            >
              📅 Follow Up Date:{" "}
              <span className="font-semibold">{formattedDate}</span>
              {isToday && <span className="ml-1">🟢 Today</span>}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(comp);
            }}
            className="bg-blue-500 text-white py-1 px-2 rounded text-[10px] hover:bg-blue-600 flex items-center gap-1"
          >
            <FaPlus size={10} /> Add
          </button>

          <span>
            {isExpanded ? (
              <FaChevronUp size={10} />
            ) : (
              <FaChevronDown size={10} />
            )}
          </span>
        </div>
      </div>

      {/* Expanded section */}
      {isExpanded && (
        <div className="p-1 space-y-1">
          <p>
            <span className="font-semibold capitalize">Contact Person:</span>{" "}
            {comp.contactperson}
          </p>
          <p>
            <span className="font-semibold">Contact #:</span>{" "}
            {comp.contactnumber}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {comp.emailaddress}
          </p>
          <p>
            <span className="font-semibold">Type:</span> {comp.typeclient}
          </p>
          <p>
            <span className="font-semibold capitalize">Address:</span>{" "}
            {comp.address || "N/A"}
          </p>

          {/* ✅ Show only if valid date */}
          {formattedDate && (
            <p>
              <span className="font-semibold">Next Available Date:</span>{" "}
              <span
                className={`${
                  isToday ? "text-green-700 font-bold" : "text-gray-700"
                }`}
              >
                {formattedDate}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CompaniesCard;
