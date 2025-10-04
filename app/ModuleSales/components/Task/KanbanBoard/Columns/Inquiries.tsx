"use client";

import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";
import InquiryModal from "./Modal/Inquiry";

interface Inquiry {
  ticketreferencenumber: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  address: string;
  wrapup: string;
  inquiries: string;
  referenceid: string;
  status: string;
  date_created?: string; // already PH time string from backend
  typeclient: string;
}

interface InquiriesProps {
  expandedIdx: string | null;
  setExpandedIdx: (id: string | null) => void;
  handleSubmit: (data: Partial<Inquiry>, isInquiry: boolean) => void;
  userDetails: { ReferenceID?: string } | null;
  refreshTrigger: number;
}

const ITEMS_PER_PAGE = 5;

const Inquiries: React.FC<InquiriesProps> = ({
  expandedIdx,
  setExpandedIdx,
  handleSubmit,
  userDetails,
  refreshTrigger,
}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // ⏱ elapsed time refresh
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 📌 modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchInquiries = async (referenceId?: string): Promise<Inquiry[]> => {
    if (!referenceId) return [];
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/CSRInquiries/FetchInquiries?referenceid=${referenceId}`
      );
      if (!res.ok) return [];

      const data = await res.json();
      if (Array.isArray(data?.data)) {
        return data.data;
      }
      return [];
    } catch (err) {
      console.error("Unexpected fetch error:", err);
      return [];
    }
  };

  useEffect(() => {
    if (!userDetails?.ReferenceID) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const inquiriesData = await fetchInquiries(userDetails.ReferenceID);
      setInquiries(inquiriesData);
      setLoading(false);
    };

    load();
  }, [userDetails?.ReferenceID, refreshTrigger]);

  // ⏱ elapsed time computation
  const getElapsedTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const created = new Date(dateStr);
    if (isNaN(created.getTime())) return "";

    const diffMs = Date.now() - created.getTime();
    const sec = Math.floor(diffMs / 1000) % 60;
    const min = Math.floor(diffMs / (1000 * 60)) % 60;
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));

    return `${hrs}h ${min}m ${sec}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-xs text-gray-500">Loading data...</span>
      </div>
    );
  }

  const visibleInquiries = inquiries.slice(0, visibleCount);

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
        <span className="mr-1">📋</span>CSR Inquiries:{" "}
        <span className="ml-1 text-orange-500">{inquiries.length}</span>
      </h3>

      {visibleInquiries.length > 0 ? (
        visibleInquiries.map((inq, idx) => {
          const key = `inq-${idx}`;
          const isExpanded = expandedIdx === key;
          return (
            <div
              key={key}
              className="rounded-lg shadow bg-red-100 transition text-[10px] mb-2"
            >
              <div
                className="cursor-pointer flex justify-between items-center p-3"
                onClick={() => setExpandedIdx(isExpanded ? null : key)}
              >
                <div>
                  <p className="font-semibold uppercase">{inq.companyname}</p>
                  <p className="text-[8px] text-gray-600">{inq.typeclient}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmit(inq, true);
                    }}
                    className="bg-blue-500 text-white py-1 px-2 rounded text-[10px] hover:bg-blue-600 flex items-center gap-1"
                  >
                    <FaPlus size={10} /> Add
                  </button>
                  <span>{isExpanded ? <FaChevronUp /> : <FaChevronDown />}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="p-3 space-y-1">
                  <p>
                    <span className="font-semibold">Type:</span>{" "}
                    {inq.typeclient}
                  </p>
                  <p>
                    <span className="font-semibold">Contact Person:</span>{" "}
                    {inq.contactperson}
                  </p>
                  <p>
                    <span className="font-semibold">Contact #:</span>{" "}
                    {inq.contactnumber}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {inq.emailaddress}
                  </p>
                  <p>
                    <span className="font-semibold">Inquiry:</span>{" "}
                    {inq.inquiries}
                  </p>
                  <p>
                    <span className="font-semibold">Wrap-up:</span>{" "}
                    {inq.wrapup || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span>{" "}
                    {inq.address || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    {inq.status}
                  </p>
                </div>
              )}

              <div
                className="p-2 text-gray-500 text-[9px] cursor-pointer hover:text-gray-700"
                onClick={() => {
                  setSelectedInquiry(inq);
                  setShowModal(true);
                }}
              >
                📅 {inq.date_created} | ⏱ {getElapsedTime(inq.date_created)}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-xs italic text-gray-400">No inquiries found.</p>
      )}

      {visibleCount < inquiries.length && (
        <div className="flex justify-center mt-2">
          <button
            className="px-4 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
          >
            View More
          </button>
        </div>
      )}

      <InquiryModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        inquiry={selectedInquiry}
        getElapsedTime={getElapsedTime}
      />
    </div>
  );
};

export default Inquiries;
