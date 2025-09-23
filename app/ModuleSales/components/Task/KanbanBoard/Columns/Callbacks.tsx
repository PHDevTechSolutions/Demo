"use client";

import React, { useEffect, useState } from "react";
import CallbackCard from "./Card/CallbackCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Inquiry {
  id?: number;
  tsm: string;
  manager: string;
  ticketreferencenumber: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  address: string;
  wrapup: string;
  inquiries: string;
  typeclient: string;
  remarks?: string;
  referenceid: string;
  activitynumber: string;
  activitystatus: string;
  typecall: string;
  callback?: string;
  typeactivity: string;
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
  [key: string]: any;
}

interface CallbacksProps {
  userDetails: UserDetails | null;
  refreshTrigger: number;
}

const Callbacks: React.FC<CallbacksProps> = ({ userDetails, refreshTrigger }) => {
  const [callbacks, setCallbacks] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [activitynumber, setActivityNumber] = useState("");
  const [companyname, setCompanyName] = useState("");
  const [contactperson, setContactPerson] = useState("");
  const [typeclient, setTypeClient] = useState("");
  const [remarks, setRemarks] = useState("");
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [activitystatus, setActivityStatus] = useState("");
  const [typecall, setTypeCall] = useState<"Successful" | "Unsucessful">("Successful");
  const [typeactivity, setTypeActivity] = useState("");
  const [tsm, setTsm] = useState("");
  const [referenceid, setReferenceid] = useState("");
  const [manager, setManager] = useState("");

  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const fetchCallbacks = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchCallback?referenceid=${userDetails.ReferenceID}`
        );

        const data = await res.json();
        const inquiries: Inquiry[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        // ✅ Define start and end of today
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const todayCallbacks = inquiries
          .filter((inq) => inq.referenceid === userDetails.ReferenceID)
          .filter((inq) => {
            if (!inq.callback) return false;
            const cbDate = new Date(inq.callback);
            return cbDate >= startOfDay && cbDate <= endOfDay;
          })
          .sort((a, b) => (b.callback || "").localeCompare(a.callback || ""));

        setCallbacks(todayCallbacks);
      } catch (error) {
        console.error("❌ Failed to fetch today's callbacks:", error);
        toast.error("Failed to fetch today's callbacks.");
        setCallbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCallbacks();
  }, [userDetails?.ReferenceID, refreshTrigger]);

  const openFormDrawer = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setActivityNumber(inq.activitynumber);
    setCompanyName(inq.companyname);
    setContactPerson(inq.contactperson);
    setTypeClient(inq.typeclient);
    setRemarks(inq.remarks || "");
    setStartDate(inq.callback?.split("T")[0] || "");
    setEndDate("");
    setActivityStatus(inq.activitystatus === "Done" ? "Done" : "Ongoing");
    setTypeCall(inq.typecall === "Successful" ? "Successful" : "Unsucessful");
    setTypeActivity(inq.typeactivity);
    setTsm(inq.tsm);
    setManager(inq.manager);
    setReferenceid(inq.referenceid);
  };

  const closeFormDrawer = () => setSelectedInquiry(null);

  const handleUpdate = async () => {
    if (!selectedInquiry) return;

    try {
      setUpdating(true);

      const isoStartDate = new Date(startdate).toISOString();
      const isoEndDate = enddate ? new Date(enddate).toISOString() : null;

      const payload = {
        activitynumber,
        companyname,
        contactperson,
        typeclient,
        remarks,
        startdate: isoStartDate,
        enddate: isoEndDate,
        activitystatus,
        typecall,
        typeactivity,
        referenceid,
        tsm,
        manager,
      };

      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/UpdateProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Activity updated successfully!");
        closeFormDrawer();
      } else {
        toast.error("Failed to update activity. Please try again.");
        console.error("❌ Update failed:", data);
      }
    } catch (error) {
      console.error("❌ Error updating activity:", error);
      toast.error("An error occurred while updating the activity.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-xs text-gray-500">Loading today's callbacks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
        <span className="mr-1">☎️</span>Total Callbacks: <span className="ml-1 text-red-500">{callbacks.length}</span>
      </h3>

      {callbacks.length > 0 ? (
        callbacks.map((inq) => (
          <CallbackCard
            key={inq.activitynumber || inq.id || Math.random()}
            inq={inq}
            userDetails={userDetails || { ReferenceID: "" }}
            openFormDrawer={openFormDrawer}
          />
        ))
      ) : (
        <p className="text-xs text-gray-400 italic">
          No callbacks scheduled for today.
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
        className={`fixed bottom-0 left-0 w-full z-[9999] bg-white shadow-2xl rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ${selectedInquiry ? "translate-y-0" : "translate-y-full"
          }`}
      >
        {selectedInquiry && (
          <>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-semibold">Update Activity</h3>
              <button
                type="button"
                onClick={closeFormDrawer}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <input type="hidden" value={activitynumber} onChange={(e) => setActivityNumber(e.target.value)} />
              <input type="hidden" value={companyname} onChange={(e) => setCompanyName(e.target.value)} />
              <input type="hidden" value={contactperson} onChange={(e) => setContactPerson(e.target.value)} />
              <input type="hidden" value={typeclient} onChange={(e) => setTypeClient(e.target.value)} />
              <input type="hidden" value={typeactivity} onChange={(e) => setTypeActivity(e.target.value)} />
              <input type="hidden" value={referenceid} onChange={(e) => setReferenceid(e.target.value)} />
              <input type="hidden" value={tsm} onChange={(e) => setTsm(e.target.value)} />
              <input type="hidden" value={manager} onChange={(e) => setManager(e.target.value)} />

              <div className="flex flex-col sm:col-span-2">
                <label className="font-semibold text-xs mb-1">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-xs mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={startdate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-xs mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={enddate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-xs mb-1">Status</label>
                <select
                  value={activitystatus}
                  onChange={(e) => setActivityStatus(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                >
                  <option value="">Select Status</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-xs mb-1">Call Status</label>
                <select
                  value={typecall}
                  onChange={(e) => setTypeCall(e.target.value as "Successful" | "Unsucessful")}
                  className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                >
                  <option value="">Select Call Status</option>
                  <option value="Successful">Successful</option>
                  <option value="Unsucessful">Unsucessful</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-semibold shadow"
              >
                Save Update
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default Callbacks;