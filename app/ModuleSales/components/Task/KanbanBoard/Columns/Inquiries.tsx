"use client";

import React, { useEffect, useState } from "react";

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
  refreshTrigger: number; // 🔹 prop for automatic refresh
}

const Inquiries: React.FC<InquiriesProps> = ({
  expandedIdx,
  setExpandedIdx,
  handleSubmit,
  userDetails,
  refreshTrigger,
}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    if (!userDetails?.ReferenceID) return;

    try {
      setLoading(true);
      const res = await fetch(
        `/api/ModuleSales/Task/CSRInquiries/FetchInquiries?referenceid=${userDetails.ReferenceID}`
      );
      const data = await res.json();

      let inquiriesData: Inquiry[] = [];
      if (Array.isArray(data)) inquiriesData = data;
      else if (Array.isArray(data?.data)) inquiriesData = data.data;
      else if (Array.isArray(data?.inquiries)) inquiriesData = data.inquiries;

      // Only show endorsed inquiries for this user
      const filtered = inquiriesData.filter(
        (inq) =>
          inq.referenceid === userDetails.ReferenceID &&
          inq.status?.toLowerCase() === "endorsed"
      );

      setInquiries(filtered);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Refetch inquiries when refreshTrigger changes
  useEffect(() => {
    fetchInquiries();
  }, [userDetails?.ReferenceID, refreshTrigger]);

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

      const result = await res.json();
      console.log("✅ Inquiry cancelled:", result);

      alert("Inquiry successfully cancelled as Wrong Tagging");
      // 🔹 no manual setInquiries, will auto-refresh
    } catch (error) {
      console.error("❌ Error cancelling inquiry:", error);
      alert("Failed to cancel inquiry");
    }
  };

  if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                <span className="ml-2 text-xs text-gray-500">Loading data...</span>
            </div>
        );
    }

  return (
    <div>
      <h3 className="text-xs font-bold text-gray-600 mb-2">📋 Inquiries</h3>

      {loading ? (
        <p className="text-sm text-gray-400">Loading inquiries...</p>
      ) : inquiries.length > 0 ? (
        inquiries.map((inq, idx) => {
          const key = `inq-${idx}`;
          const isExpanded = expandedIdx === key;

          return (
            <div
              key={key}
              className="rounded-lg shadow bg-white transition text-[10px] mb-2"
            >
              {/* Header row */}
              <div
                className="cursor-pointer flex justify-between items-center p-3 border-b"
                onClick={() => setExpandedIdx(isExpanded ? null : key)}
              >
                <p className="font-semibold uppercase">{inq.companyname}</p>

                {/* Actions: Add + Cancel + Collapse */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmit(inq, true);
                    }}
                    className="bg-blue-500 text-white py-1 px-2 rounded text-[10px] hover:bg-blue-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(inq);
                    }}
                    className="bg-red-500 text-white py-1 px-2 rounded text-[10px] hover:bg-red-600"
                  >
                    Cancel
                  </button>
                  <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="p-3 space-y-1">
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

              {/* Footer timestamp */}
              <div className="p-2 border-t text-gray-500 text-[9px]">
                {inq.date_created
                  ? new Date(inq.date_created).toLocaleString()
                  : "N/A"}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-gray-400">No inquiries found.</p>
      )}
    </div>
  );
};

export default Inquiries;
