"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FollowUpCard from "./Card/FollowUpCard";

export const dynamic = "force-dynamic";

interface Inquiry {
  id?: number;
  activitynumber?: string;
  activitystatus?: string;
  typecall?: "Successful" | "Unsuccessful" | "";
  callback?: string;
  tsm?: string;
  manager?: string;

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
  status: string;
  date_created?: string;
  typeactivity?: string;
  followup_date: string;
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

interface FollowUpsProps {
  userDetails: UserDetails | null;
  refreshTrigger: number;
}

const FollowUps: React.FC<FollowUpsProps> = ({ userDetails, refreshTrigger }) => {
  const [followUps, setFollowUps] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [remarks, setRemarks] = useState("");
  const [activitystatus, setActivityStatus] = useState("Ongoing");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeCall, setTypeCall] = useState<"Successful" | "Unsuccessful" | "">("");
  const [activityNumber, setActivityNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [typeClient, setTypeClient] = useState("");
  const [typeActivity, setTypeActivity] = useState("Follow Up");
  const [referenceid, setReferenceid] = useState("");
  const [tsm, setTsm] = useState("");
  const [manager, setManager] = useState("");
  const [localRefresh, setLocalRefresh] = useState(0);

  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const fetchFollowUps = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchFollowUp?referenceid=${userDetails.ReferenceID}`
        );
        const data = await res.json();

        const activities: Inquiry[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        const todayStr = new Date().toISOString().split("T")[0];

        let todayFollowUps: Inquiry[] = [];

        if (userDetails.Role === "Territory Sales Manager") {
          // 🔹 TSM sees only allowed typecalls for their agents
          todayFollowUps = activities
            .filter(
              (act) =>
                act.tsm === userDetails.ReferenceID &&
                ["Sent Quotation - Standard", "Sent Quotation - With Special Price", "Sent Quotation - With SPF"].includes(
                  act.typecall || ""
                )
            )
            .filter((act) => act.followup_date && act.typecall)
            .filter((act) => act.followup_date?.startsWith(todayStr));
        } else {
          // 🔹 Non-TSM sees only their own data
          todayFollowUps = activities
            .filter((act) => act.referenceid === userDetails.ReferenceID)
            .filter((act) => act.followup_date && act.typecall)
            .filter((act) => act.followup_date?.startsWith(todayStr));
        }

        // 🔹 Sort by latest followup_date
        todayFollowUps = todayFollowUps.sort((a, b) =>
          (b.followup_date || "").localeCompare(a.followup_date || "")
        );

        setFollowUps(todayFollowUps);
      } catch (error) {
        console.error("❌ Failed to fetch today's follow-ups:", error);
        setFollowUps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [userDetails?.ReferenceID, userDetails?.Role, refreshTrigger, localRefresh]);

  const openFormDrawer = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setActivityNumber(inq.activitynumber || "");
    setCompanyName(inq.companyname);
    setContactPerson(inq.contactperson);
    setTypeClient(inq.typeclient);
    setRemarks(inq.remarks || "");
    setStartDate(inq.callback?.split("T")[0] || "");
    setEndDate("");
    setActivityStatus(inq.activitystatus === "Done" ? "Done" : "Ongoing");
    setTypeCall(inq.typecall === "Successful" ? "Successful" : "Unsuccessful");
    setTypeActivity(inq.typeactivity || "Follow Up");
    setTsm(inq.tsm || "");
    setManager(inq.manager || "");
    setReferenceid(inq.referenceid);
  };

  const closeFormDrawer = () => setSelectedInquiry(null);

  const handleUpdate = async () => {
    if (!selectedInquiry) return;

    try {
      setUpdating(true);

      const isoStartDate = new Date(startDate).toISOString();
      const isoEndDate = endDate ? new Date(endDate).toISOString() : null;

      const payload = {
        activitynumber: activityNumber,
        companyname: companyName,
        contactperson: contactPerson,
        typeclient: typeClient,
        remarks,
        startdate: isoStartDate,
        enddate: isoEndDate,
        activitystatus: activitystatus || "Done",
        typecall: typeCall,
        typeactivity: typeActivity,
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
        toast.success("✅ Activity updated successfully!");
        setFollowUps((prev) =>
          prev.map((inq) =>
            inq.activitynumber === selectedInquiry.activitynumber
              ? { ...inq, activitystatus: activitystatus || "Done" }
              : inq
          )
        );
        closeFormDrawer();
        setLocalRefresh((prev) => prev + 1);
      } else {
        console.error("❌ Update failed:", data);
        toast.error("Failed to update activity. Please try again.");
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
        <span className="ml-2 text-xs text-gray-500">
          Loading today's follow-ups...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
        <span className="mr-1">📌</span> Follow-Ups: <span className="ml-1 text-orange-500">{followUps.length}</span>
      </h3>

      {followUps.length > 0 ? (
        followUps.map((inq, idx) => (
          <FollowUpCard
            key={idx}
            inq={inq}
            userDetails={userDetails}
            openFormDrawer={openFormDrawer}
          />
        ))
      ) : (
        <p className="text-xs text-gray-400 italic">
          No follow-ups scheduled for today.
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
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-xs mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={endDate}
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
                  value={typeCall}
                  onChange={(e) =>
                    setTypeCall(e.target.value as "Successful" | "Unsuccessful" | "")
                  }
                  className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                >
                  <option value="">Select Call Status</option>
                  <option value="Successful">Successful</option>
                  <option value="Unsuccessful">Unsuccessful</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-semibold shadow disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Update"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default FollowUps;
