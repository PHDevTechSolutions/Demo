"use client";

import React, { useEffect, useState } from "react";
import CallbackCard from "./Card/CallbackCard";
import CallbackForm from "./Form/Callback";
import { toast } from "react-toastify";
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
  selectedTSA?: string;
}

const Callbacks: React.FC<CallbacksProps> = ({ userDetails, refreshTrigger, selectedTSA }) => {
  const [callbacks, setCallbacks] = useState<Inquiry[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  
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
        const result = await res.json();

        const inquiries: Inquiry[] = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        // Filter by role
        let filtered: Inquiry[] = [];

        switch (userDetails.Role) {
          case "Territory Sales Manager":
            filtered = inquiries.filter(
              (inq) =>
                inq.tsm === userDetails.ReferenceID &&
                ["Ringing Only", "Cannot Be Reached", "Not Connected With The Company"].includes(
                  inq.typecall || ""
                )
            );
            break;

          case "Manager":
            filtered = inquiries.filter((inq) => inq.manager === userDetails.ReferenceID);
            break;

          default:
            filtered = inquiries.filter((inq) => inq.referenceid === userDetails.ReferenceID);
        }

        // ✅ Apply selectedTSA filter if provided
        const tsaFiltered = selectedTSA
          ? filtered.filter((inq) => inq.referenceid === selectedTSA)
          : filtered;

        // Callbacks for today
        const todayCallbacks = tsaFiltered
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
  }, [userDetails?.ReferenceID, userDetails?.Role, refreshTrigger, selectedTSA]);


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
        <>
          {callbacks.slice(0, visibleCount).map((inq, index) => (
            <CallbackCard
              key={inq.id ?? `${inq.activitynumber}-${inq.referenceid}-${index}`}
              inq={inq}
              userDetails={userDetails || { ReferenceID: "" }}
              openFormDrawer={openFormDrawer}
            />
          ))}

          {visibleCount < callbacks.length && (
            <div className="flex justify-center">
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
        <CallbackForm
          selectedInquiry={selectedInquiry}
          handleUpdate={handleUpdate}
          closeFormDrawer={closeFormDrawer}
          activitynumber={activitynumber}
          companyname={companyname}
          contactperson={contactperson}
          typeclient={typeclient}
          typeactivity={typeactivity}
          referenceid={referenceid}
          tsm={tsm}
          manager={manager}
          remarks={remarks}
          startdate={startdate}
          enddate={enddate}
          activitystatus={activitystatus}
          typecall={typecall}
          setActivityNumber={setActivityNumber}
          setCompanyName={setCompanyName}
          setContactPerson={setContactPerson}
          setTypeClient={setTypeClient}
          setTypeActivity={setTypeActivity}
          setReferenceid={setReferenceid}
          setTsm={setTsm}
          setManager={setManager}
          setRemarks={setRemarks}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setActivityStatus={setActivityStatus}
          setTypeCall={setTypeCall}
        />
      )}

    </div>
  );
};

export default Callbacks;