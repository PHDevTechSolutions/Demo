"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaClone, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

interface ProgressItem {
  id: string;
  companyname: string | null;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  referenceid: string;
  date_created: string;
  date_updated: string;
  activitystatus?: string;
  remarks?: string;
  source?: string;
}

interface UserDetails {
  ReferenceID: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Manager: string;
  TSM: string;
  Role: string;
  profilePicture?: string;
}

interface DuplicationProps {
  userDetails: UserDetails | null;
  hoveredCompany?: string | null;
  setHoveredCompany?: (name: string | null) => void;
}

const Duplication: React.FC<DuplicationProps> = ({
  userDetails,
  hoveredCompany,
}) => {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!userDetails?.ReferenceID) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchInProgress?referenceid=${userDetails.ReferenceID}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setProgress(data?.data || []);
    } catch (err) {
      console.error("Error fetching duplication data:", err);
      toast.error("Failed to fetch duplication data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [userDetails?.ReferenceID]);

  // 🧠 Group companies by name safely
  const duplicateCompanies = useMemo(() => {
    const grouped: Record<string, ProgressItem[]> = {};
    progress.forEach((item) => {
      const name =
        item.companyname?.trim()?.toLowerCase() || "unnamed company";
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(item);
    });

    // Only include companies with more than 1 entry
    return Object.values(grouped).filter((items) => items.length > 1);
  }, [progress]);

  // 🟠 Get duplicates for hovered company (safe)
  const hoveredDuplicates = useMemo(() => {
    if (!hoveredCompany) return [];

    const target = hoveredCompany?.trim()?.toLowerCase();
    if (!target) return [];

    const match = duplicateCompanies.find((group) => {
      const name = group[0]?.companyname?.trim()?.toLowerCase() || "unnamed company";
      return name === target;
    });

    return match || [];
  }, [hoveredCompany, duplicateCompanies]);

  // 🎨 Activity status colors
  const statusColors: Record<string, string> = {
    Assisted: "bg-orange-100",
    Paid: "bg-white",
    Delivered: "bg-green-500 text-white",
    Collected: "bg-white",
    "Quote-Done": "bg-blue-200",
    "SO-Done": "bg-yellow-200",
    Cancelled: "bg-red-300",
    Loss: "bg-red-300",
  };

  return (
    <div className="space-y-2 transition-all duration-200">
      <h2 className="text-xs font-bold text-gray-600">
        {hoveredCompany ? (
          <div className="flex items-center gap-2">
            <FaClone className="text-orange-500 text-sm" />
            <span>
              Duplicates for:{" "}
              <span className="text-orange-500 font-semibold">
                {hoveredCompany}
              </span>
            </span>
          </div>
        ) : (
          <div className="text-xs space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 font-semibold">
              <FaInfoCircle className="text-blue-500 text-[13px]" />
              <span>Duplication Notice</span>
            </div>

            <p className="text-xs font-normal">
              All companies listed here are <b>duplicate entries</b> found in
              the “In Progress” data.
            </p>

            <p className="text-xs font-normal">
              To maintain accurate task counts and reliable quotation or sales
              data, please make sure to close or continue existing transactions
              before creating a new activity.
            </p>

            <p className="flex items-start gap-2">
              <FaExclamationTriangle className="text-red-400 text-[13px] mt-[2px] shrink-0" />
              <span className="text-xs font-normal">
                Duplicate entries may result in <b>inaccurate task numbers</b>,
                <b> mismatched quotation totals</b>, or <b>incorrect sales reports</b>. 👉 Please
                avoid creating activities for companies that already exist in
                progress. Instead, <b>update the previous record</b> to properly close the ongoing transaction.
              </span>
            </p>
          </div>
        )}
      </h2>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse p-3 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
            >
              <div className="h-3 w-1/4 bg-gray-300 rounded mb-2"></div>
              <div className="h-2 w-1/2 bg-gray-200 rounded mb-1"></div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {!hoveredCompany ? (
            duplicateCompanies.length === 0 ? (
              <motion.p
                key="nodup"
                className="text-xs italic text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No duplicates to show.
              </motion.p>
            ) : (
              duplicateCompanies.map((group) => (
                <motion.div
                  key={group[0].companyname || group[0].id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border border-gray-200 rounded-lg p-2 shadow-sm text-xs bg-white"
                >
                  <p className="font-semibold text-gray-700 text-[10px] uppercase">
                    {group[0].companyname || "Unnamed Company"}
                  </p>
                  <p className="text-gray-500 text-[10px]">
                    {group.length} duplicate entries
                  </p>
                </motion.div>
              ))
            )
          ) : hoveredDuplicates.length === 0 ? (
            <motion.p
              key="nodup"
              className="text-xs italic text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No duplicates found for this company.
            </motion.p>
          ) : (
            hoveredDuplicates.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`border border-gray-200 rounded-lg p-2 shadow-sm text-xs ${
                  statusColors[item.activitystatus || ""] || "bg-white"
                }`}
              >
                <p className="font-semibold text-gray-700 text-[10px] uppercase">
                  {item.companyname || "Unnamed Company"}
                </p>
                <p className="text-gray-600">{item.contactperson}</p>
                <p className="text-gray-500 text-[8px]">
                  {item.activitystatus || "—"}
                </p>
                <p className="text-gray-400 text-[8px] italic">
                  Date Created:{" "}
                  {new Date(item.date_created).toLocaleDateString()}
                </p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Duplication;
