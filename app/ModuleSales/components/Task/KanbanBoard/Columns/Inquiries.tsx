"use client";

import React, { useEffect, useState, useRef } from "react";
import { MdCancel } from "react-icons/md";
import { FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";

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
  date_created?: string;
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
  const [showModal, setShowModal] = useState(false);
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null);
  const [timeSinceCreated, setTimeSinceCreated] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatPHDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        hour12: false,
      });
    } catch {
      return "Invalid date";
    }
  };

  const fetchInquiries = async (referenceId?: string): Promise<Inquiry[]> => {
    if (!referenceId) return [];
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/CSRInquiries/FetchInquiries?referenceid=${referenceId}`
      );
      if (!res.ok) return [];

      const data = await res.json();
      let inquiries: Inquiry[] = [];

      if (Array.isArray(data)) inquiries = data;
      else if (Array.isArray(data?.data)) inquiries = data.data;
      else if (Array.isArray(data?.inquiries)) inquiries = data.inquiries;

      // Filter by referenceId and sort by latest date_created first
      const myInquiries = inquiries
        .filter((inq) => inq.referenceid === referenceId)
        .sort((a, b) => {
          const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
          const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
          return dateB - dateA; // latest first
        });

      return myInquiries;
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

    const loadInquiries = async () => {
      setLoading(true);
      const inquiriesData = await fetchInquiries(userDetails.ReferenceID);

      const myInquiries = inquiriesData.filter(
        (inq) => inq.referenceid === userDetails.ReferenceID
      );

      setInquiries(myInquiries);

      if (myInquiries.length === 0) {
        setActiveInquiry(null);
        setShowModal(false);
      } else {
        const todayPH = new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
        );

        const todayInquiry = myInquiries.find((inq) => {
          if (!inq.date_created) return false;
          const inquiryPH = new Date(
            new Date(inq.date_created).toLocaleString("en-US", { timeZone: "Asia/Manila" })
          );
          return (
            inquiryPH.getFullYear() === todayPH.getFullYear() &&
            inquiryPH.getMonth() === todayPH.getMonth() &&
            inquiryPH.getDate() === todayPH.getDate() &&
            inq.status?.toLowerCase() !== "endorsed"
          );
        });

        setActiveInquiry(todayInquiry || null);
        setShowModal(!!todayInquiry);
      }
      setLoading(false);
    };

    loadInquiries();
  }, [userDetails?.ReferenceID, refreshTrigger]);

  const handleCloseModal = () => {
    setShowModal(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (activeInquiry && activeInquiry.status?.toLowerCase() !== "endorsed") {
      timerRef.current = setTimeout(() => {
        setShowModal(true);
      }, 5 * 60 * 1000);
    }
  };

  useEffect(() => {
    if (!activeInquiry?.date_created) return;

    const createdDate = new Date(activeInquiry.date_created);
    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - createdDate.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffSecs = Math.floor((diffMs / 1000) % 60);
      setTimeSinceCreated(`${diffMins}m ${diffSecs}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeInquiry?.date_created]);

  const handleCancel = async (inq: Inquiry) => {
    if (!userDetails?.ReferenceID) return;
    try {
      const res = await fetch("/api/ModuleSales/CSRInquiries/DiscardData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketreferencenumber: inq.ticketreferencenumber,
          referenceid: userDetails.ReferenceID,
          status: "cancelled",
        }),
      });
      if (!res.ok) throw new Error("Failed to cancel inquiry");
      alert("Inquiry successfully cancelled as Wrong Tagging");

      const refreshed = await fetchInquiries(userDetails.ReferenceID);
      setInquiries(
        refreshed.filter((i) => i.referenceid === userDetails.ReferenceID)
      );
    } catch (error) {
      console.error("❌ Error cancelling inquiry:", error);
      alert("Failed to cancel inquiry");
    }
  };

  const InquiryModal = () => {
    if (!activeInquiry) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <h2 className="text-lg font-bold mb-2">📩 New Inquiry</h2>
          <p className="text-sm mb-1"><span className="font-semibold">Company:</span> {activeInquiry.companyname}</p>
          <p className="text-sm mb-1"><span className="font-semibold">Contact:</span> {activeInquiry.contactperson} ({activeInquiry.contactnumber})</p>
          <p className="text-sm mb-1"><span className="font-semibold">Email:</span> {activeInquiry.emailaddress}</p>
          <p className="text-sm mb-1"><span className="font-semibold">Inquiry:</span> {activeInquiry.inquiries}</p>
          <p className="text-xs text-gray-500 mt-2">⏱ Elapsed since created: {timeSinceCreated}</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleCloseModal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >Close</button>
          </div>
        </div>
      </div>
    );
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
    <>
      {showModal && <InquiryModal />}
      <div className="space-y-1 overflow-y-auto">
        <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
          <span className="mr-1">📋</span> Inquiries: <span className="ml-1 text-orange-500">{inquiries.length}</span>
        </h3>

        {visibleInquiries.length > 0 ? (
          visibleInquiries.map((inq, idx) => {
            const key = `inq-${idx}`;
            const isExpanded = expandedIdx === key;
            return (
              <div key={key} className="rounded-lg shadow bg-red-100 transition text-[10px] mb-2">
                <div
                  className="cursor-pointer flex justify-between items-center p-3"
                  onClick={() => setExpandedIdx(isExpanded ? null : key)}
                >
                  <p className="font-semibold uppercase">{inq.companyname}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSubmit(inq, true); }}
                      className="bg-blue-500 text-white py-1 px-2 rounded text-[10px] hover:bg-blue-600 flex items-center gap-1"
                    ><FaPlus size={10} /> Add</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCancel(inq); }}
                      className="bg-red-500 text-white py-1 px-2 rounded text-[10px] hover:bg-red-600 flex items-center gap-1"
                    ><MdCancel size={10} /> Cancel</button>
                    <span>{isExpanded ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="p-3 space-y-1">
                    <p><span className="font-semibold">Contact Person:</span> {inq.contactperson}</p>
                    <p><span className="font-semibold">Contact #:</span> {inq.contactnumber}</p>
                    <p><span className="font-semibold">Email:</span> {inq.emailaddress}</p>
                    <p><span className="font-semibold">Inquiry:</span> {inq.inquiries}</p>
                    <p><span className="font-semibold">Wrap-up:</span> {inq.wrapup || "N/A"}</p>
                    <p><span className="font-semibold">Address:</span> {inq.address || "N/A"}</p>
                    <p><span className="font-semibold">Status:</span> {inq.status}</p>
                  </div>
                )}
                <div className="p-2 text-gray-500 text-[9px]">{formatPHDate(inq.date_created)}</div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400">No inquiries found.</p>
        )}

        {/* View More Button */}
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
      </div>
    </>
  );
};

export default Inquiries;
