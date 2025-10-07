"use client";

import React from "react";
import { FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

interface Company {
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  address?: string;
}

interface CompaniesCardProps {
  comp: Company;
  isExpanded: boolean;
  onToggle: () => void;
  onAdd: (comp: Company) => void;
  onCancel: (comp: Company) => void;
}

const CompaniesCard: React.FC<CompaniesCardProps> = ({
  comp,
  isExpanded,
  onToggle,
  onAdd,
  onCancel,
}) => {
  return (
    <div className="rounded-lg border bg-blue-100 shadow transition text-[10px] mb-2 px-2 py-2">
      <div
        className="cursor-pointer flex justify-between items-center p-1"
        onClick={onToggle}
      >
        <p className="font-semibold uppercase">{comp.companyname}</p>

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

          <span>{isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}</span>
        </div>
      </div>

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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(comp);
            }}
            className="bg-red-500 text-white py-1 px-2 rounded text-[10px] hover:bg-red-600 flex items-center gap-1"
          >
            <MdCancel size={10} /> Replace
          </button>
        </div>
      )}

      <div className="p-1 text-gray-500 text-[9px]">{comp.typeclient}</div>
    </div>
  );
};

export default CompaniesCard;
