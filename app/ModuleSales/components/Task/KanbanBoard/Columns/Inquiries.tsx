"use client";

import React, { useEffect, useState, useRef } from "react";

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

const Inquiries: React.FC<InquiriesProps> = ({
  expandedIdx,
  setExpandedIdx,
  handleSubmit,
  userDetails,
  refreshTrigger,
}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Modal states
  const [showModal, setShowModal] = useState(false);
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null);
  const [timeSinceCreated, setTimeSinceCreated] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

      // 🔹 Filter inquiries strictly for this user only
      const myInquiries = inquiriesData.filter(
        (inq) => inq.referenceid === userDetails.ReferenceID
      );

      setInquiries(myInquiries);

      // 🔹 Hanapin kung may inquiry ngayong araw at hindi endorsed
      const today = new Date().toISOString().split("T")[0];
      const todayInquiry = myInquiries.find(
        (inq) =>
          inq.date_created?.startsWith(today) &&
          inq.status?.toLowerCase() !== "endorsed"
      );

      if (todayInquiry) {
        setActiveInquiry(todayInquiry);
        setShowModal(true);
      } else {
        setActiveInquiry(null);
        setShowModal(false);
      }
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

  // 🔹 Handle modal close → re-show after 5 mins if still not endorsed
  const handleCloseModal = () => {
    setShowModal(false);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (activeInquiry && activeInquiry.status?.toLowerCase() !== "endorsed") {
      timerRef.current = setTimeout(() => {
        setShowModal(true);
      }, 5 * 60 * 1000); // 5 minutes
    }
  };

  // 🔹 Track elapsed time since inquiry creation
  useEffect(() => {
    if (!activeInquiry?.date_created) return;

    const interval = setInterval(() => {
      const created = new Date(activeInquiry.date_created!);
      const now = new Date();
      const diffMs = now.getTime() - created.getTime();

      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffSecs = Math.floor((diffMs / 1000) % 60);

      setTimeSinceCreated(`${diffMins}m ${diffSecs}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeInquiry?.date_created]);

  // 🔹 Cancel inquiry action
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
      fetchInquiries(); // refresh list
    } catch (error) {
      console.error("❌ Error cancelling inquiry:", error);
      alert("Failed to cancel inquiry");
    }
  };

  // 🔹 Modal UI
  const InquiryModal = () => {
    if (!activeInquiry) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <h2 className="text-lg font-bold mb-2">📩 New Inquiry</h2>
          <p className="text-sm mb-1">
            <span className="font-semibold">Company:</span>{" "}
            {activeInquiry.companyname}
          </p>
          <p className="text-sm mb-1">
            <span className="font-semibold">Contact:</span>{" "}
            {activeInquiry.contactperson} ({activeInquiry.contactnumber})
          </p>
          <p className="text-sm mb-1">
            <span className="font-semibold">Email:</span>{" "}
            {activeInquiry.emailaddress}
          </p>
          <p className="text-sm mb-1">
            <span className="font-semibold">Inquiry:</span>{" "}
            {activeInquiry.inquiries}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ⏱ Elapsed since created: {timeSinceCreated}
          </p>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleCloseModal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
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

  return (
    <>
      {showModal && <InquiryModal />}

      <div className="space-y-4 overflow-y-auto">
        <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
          <span className="mr-1">📋</span> Inquiries
        </h3>

        {inquiries.length > 0 ? (
          inquiries.map((inq, idx) => {
            const key = `inq-${idx}`;
            const isExpanded = expandedIdx === key;

            return (
              <div
                key={key}
                className="rounded-lg shadow bg-red-100 transition text-[10px] mb-2"
              >
                {/* Header row */}
                <div
                  className="cursor-pointer flex justify-between items-center p-3"
                  onClick={() => setExpandedIdx(isExpanded ? null : key)}
                >
                  <p className="font-semibold uppercase">{inq.companyname}</p>

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
                    <span className="text-gray-400">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

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

                <div className="p-2 text-gray-500 text-[9px]">
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
    </>
  );
};

export default Inquiries;