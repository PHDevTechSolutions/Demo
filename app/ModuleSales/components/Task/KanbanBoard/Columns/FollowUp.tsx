"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FollowUpCard from "./Card/FollowUpCard";
import FollowUpForm from "./Form/FollowupForm";
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
  selectedTSA?: string;
}

const FollowUps: React.FC<FollowUpsProps> = ({ userDetails, refreshTrigger, selectedTSA }) => {
  const [followUps, setFollowUps] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
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
        const result = await res.json();

        const activities: Inquiry[] = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        const todayStr = new Date().toISOString().split("T")[0];

        // 🔹 Filter by role
        let filteredActivities: Inquiry[] = [];
        if (userDetails.Role === "Territory Sales Manager") {
          filteredActivities = activities.filter(
            (act) =>
              (act.tsm === userDetails.ReferenceID || act.manager === userDetails.ReferenceID) &&
              ["Sent Quotation - Standard", "Sent Quotation - With Special Price", "Sent Quotation - With SPF"].includes(act.typecall || "")
          );
        } else {
          filteredActivities = activities.filter((act) => act.referenceid === userDetails.ReferenceID);
        }

        // 🔹 Apply TSA filter if provided
        if (selectedTSA) {
          filteredActivities = filteredActivities.filter((act) => act.referenceid === selectedTSA);
        }

        // 🔹 Only include follow-ups scheduled for today
        const todayFollowUps = filteredActivities.filter(
          (act) => act.followup_date?.startsWith(todayStr)
        );

        // 🔹 Sort by latest followup_date
        todayFollowUps.sort((a, b) => (b.followup_date || "").localeCompare(a.followup_date || ""));

        setFollowUps(todayFollowUps);
      } catch (error) {
        console.error("❌ Failed to fetch today's follow-ups:", error);
        setFollowUps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [userDetails?.ReferenceID, userDetails?.Role, refreshTrigger, localRefresh, selectedTSA]);



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
      <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
        <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
        <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
        <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex items-center text-xs font-bold text-gray-600 mb-2">
        <span className="mr-1">📌</span> Follow-Ups: <span className="ml-1 text-orange-500">{followUps.length}</span>
      </h3>

      {followUps.length > 0 ? (
        <>
          {followUps.slice(0, visibleCount).map((inq, idx) => (
            <FollowUpCard
              key={inq.id || idx}
              inq={inq}
              userDetails={userDetails}
              openFormDrawer={openFormDrawer}
            />
          ))}

          {visibleCount < followUps.length && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="px-4 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                View More
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-400 italic">
          No callbacks scheduled for today.
        </p>
      )}

      {selectedInquiry && (
        <FollowUpForm
          remarks={remarks}
          setRemarks={setRemarks}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          activitystatus={activitystatus}
          setActivityStatus={setActivityStatus}
          typeCall={typeCall}
          setTypeCall={setTypeCall}
          handleUpdate={handleUpdate}
          closeFormDrawer={closeFormDrawer}
          updating={updating}
        />
      )}

    </div>
  );
};

export default FollowUps;
