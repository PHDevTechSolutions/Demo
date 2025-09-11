"use client";

import React, { useEffect, useState } from "react";
import ProgressCard from "./Card/ProgressCard";
import ProgressForm from "./Form/ProgressForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const dynamic = "force-dynamic";

interface ProgressItem {
  id: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  referenceid: string;
  date_created: string;
  activitynumber: string;
  typeactivity?: string;
  remarks?: string;
  address?: string;
  area?: string;
  deliveryaddress?: string;
  source?: string;
  activitystatus?: string;
  typecall?: string;
  sonumber?: string;
  soamount?: string;
  callback?: string;
  callstatus?: string;
  quotationnumber?: string;
  quotationamount?: string;
  projectname?: string;
  projectcategory?: string;
  projecttype?: string;
  startdate?: string;
  enddate?: string;
  childrenProgress?: ProgressItem[];
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
  TargetQuota: string;
  [key: string]: any;
}

interface ProgressProps {
  userDetails: UserDetails | null;
  refreshTrigger: number;
}

const EXCLUDED_ACTIVITIES = [
  "Assisting Other Agent Clients",
  "Coordination of SO To Warehouse",
  "Coordination of SO to Orders",
  "Updating Reports",
  "Email and Viber Checking",
  "Documentation",
];

const Progress: React.FC<ProgressProps> = ({ userDetails, refreshTrigger }) => {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cardLoading, setCardLoading] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    activitystatus: "",
    source: "",
    typeactivity: "",
    remarks: "",
    typecall: "",
    sonumber: "",
    soamount: "",
    callback: "",
    callstatus: "",
    startdate: "",
    enddate: "",
    quotationnumber: "",
    quotationamount: "",
    projectname: "",
    projectcategory: "",
    projecttype: "",
  });

  const [hiddenFields, setHiddenFields] = useState({
    referenceid: userDetails?.ReferenceID || "",
    tsm: userDetails?.TSM || "",
    manager: userDetails?.Manager || "",
    targetquota: userDetails?.TargetQuota || "",
    companyname: "",
    contactnumber: "",
    emailaddress: "",
    deliveryaddress: "",
    area: "",
    typeclient: "",
    contactperson: "",
    activitynumber: "",
    address: "",
  });

  /** Reset formData */
  const resetForm = () =>
    setFormData({
      activitystatus: "",
      source: "",
      typeactivity: "",
      remarks: "",
      typecall: "",
      sonumber: "",
      soamount: "",
      callback: "",
      callstatus: "",
      startdate: "",
      enddate: "",
      quotationnumber: "",
      quotationamount: "",
      projectname: "",
      projectcategory: "",
      projecttype: "",
    });

  /** Add button → open form */
  const handleAddClick = (prog?: ProgressItem) => {
    setHiddenFields({
      referenceid: userDetails?.ReferenceID || "",
      tsm: userDetails?.TSM || "",
      manager: userDetails?.Manager || "",
      targetquota: userDetails?.TargetQuota || "",
      companyname: prog?.companyname || "",
      contactnumber: prog?.contactnumber || "",
      emailaddress: prog?.emailaddress || "",
      deliveryaddress: prog?.deliveryaddress || "",
      area: prog?.area || "",
      typeclient: prog?.typeclient || "",
      contactperson: prog?.contactperson || "",
      activitynumber: prog?.activitynumber || "",
      address: prog?.address || "",
    });

    setFormData({
      activitystatus: prog?.activitystatus || "",
      source: prog?.source || "",
      typeactivity: prog?.typeactivity || "",
      remarks: prog?.remarks || "",
      typecall: prog?.typecall || "",
      sonumber: prog?.sonumber || "",
      soamount: prog?.soamount || "",
      callback: prog?.callback || "",
      callstatus: prog?.callstatus || "",
      startdate: prog?.startdate || "",
      enddate: prog?.enddate || "",
      quotationnumber: prog?.quotationnumber || "",
      quotationamount: prog?.quotationamount || "",
      projectname: prog?.projectname || "",
      projectcategory: prog?.projectcategory || "",
      projecttype: prog?.projecttype || "",
    });

    setShowForm(true);
  };

  /** Fetch progress data */
  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const fetchProgress = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails.ReferenceID}`
        );
        const data = await res.json();

        const progressData: ProgressItem[] =
          Array.isArray(data) ? data : data?.data || data?.progress || [];

        const myProgress = progressData.filter(
          (p) =>
            p.referenceid === userDetails.ReferenceID &&
            !EXCLUDED_ACTIVITIES.includes(p.typeactivity || "")
        );

        setProgress(
          myProgress.sort(
            (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
          )
        );
      } catch (err) {
        console.error("❌ Error fetching progress:", err);
        setProgress([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userDetails?.ReferenceID, refreshTrigger]);

  /** Handle form change */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** Handle react-select change */
  const handleProjectCategoryChange = (selected: { value: string; label: string } | null) => {
    setFormData((prev) => ({
      ...prev,
      projectcategory: selected ? selected.value : "",
    }));
  };

  /** Refresh one card */
  const fetchCard = async (activitynumber: string) => {
    setCardLoading((prev) => ({ ...prev, [activitynumber]: true }));
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails?.ReferenceID}`
      );
      const data = await res.json();

      const progressData: ProgressItem[] =
        Array.isArray(data) ? data : data?.data || data?.progress || [];

      const filtered = progressData.filter((p) => p.activitynumber === activitynumber);

      setProgress((prev) => {
        const others = prev.filter((p) => p.activitynumber !== activitynumber);
        return [...others, ...filtered];
      });
    } catch (err) {
      console.error("❌ Error fetching card:", err);
    } finally {
      setCardLoading((prev) => ({ ...prev, [activitynumber]: false }));
    }
  };

  /** Submit form */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: any = { ...hiddenFields, ...formData };

    if (!payload.activitynumber) {
      toast.error("Activity number is missing!");
      return;
    }

    // 🔹 Sanitize numeric fields (convert "" → null, string number → number)
    const numericFields = ["soamount", "quotationamount", "targetquota"];
    numericFields.forEach((field) => {
      if (payload[field] === "" || payload[field] === undefined) {
        payload[field] = null;
      } else {
        payload[field] = Number(payload[field]);
      }
    });

    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/CreateProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit activity");

      setShowForm(false);
      resetForm();

      toast.success("Activity successfully added!");
      await fetchCard(payload.activitynumber);
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      toast.error("Failed to submit activity: " + err.message);
    }
  };

  /** Delete parent activity */
  const handleDeleteParent = async (item: ProgressItem) => {
    setCardLoading((prev) => ({ ...prev, [item.activitynumber || item.id]: true }));
    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/DeleteProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete activity");

      setProgress((prev) => prev.filter((p) => p.id !== item.id));
      toast.success("Activity deleted successfully!");
    } catch (err: any) {
      console.error("❌ Delete error:", err);
      toast.error("Failed to delete activity: " + err.message);
    } finally {
      setCardLoading((prev) => ({ ...prev, [item.activitynumber || item.id]: false }));
    }
  };

  /** Delete child activity */
  const handleDeleteChild = async (child: ProgressItem) => {
    setCardLoading((prev) => ({ ...prev, [child.activitynumber || child.id]: true }));
    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/DeleteProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: child.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete log");

      await fetchCard(child.activitynumber!);
      toast.success("Log deleted successfully!");
    } catch (err: any) {
      console.error("❌ Delete error:", err);
      toast.error("Failed to delete log: " + err.message);
    } finally {
      setCardLoading((prev) => ({ ...prev, [child.activitynumber || child.id]: false }));
    }
  };

  /** Group progress by activitynumber */
  const progressWithChildren = Object.values(
    progress.reduce((acc: Record<string, ProgressItem[]>, item) => {
      if (!item.activitynumber) return acc;
      if (!acc[item.activitynumber]) acc[item.activitynumber] = [];
      acc[item.activitynumber].push(item);
      return acc;
    }, {})
  ).map((group) => ({
    parent: group[0],
    children: group.slice(1),
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-xs text-gray-500">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {progressWithChildren.length > 0 ? (
        progressWithChildren.map((grp, idx) => (
          <div key={idx} className="relative">
            {cardLoading[grp.parent.activitynumber || grp.parent.id] && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-50">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
            <ProgressCard
              progress={grp.parent}
              childrenProgress={grp.children}
              profilePicture={userDetails?.profilePicture || "/taskflow.png"}
              onAddClick={() => handleAddClick(grp.parent)}
              onDeleteClick={handleDeleteParent}
              onDeleteChildClick={handleDeleteChild}
            />
          </div>
        ))
      ) : (
        <p className="text-xs text-gray-400">No progress found.</p>
      )}

      {showForm && (
        <ProgressForm
          formData={formData}
          handleFormChange={handleFormChange}
          handleFormSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
          handleProjectCategoryChange={handleProjectCategoryChange}
          setFormData={setFormData} // 🔹 para sa realtime date update
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default Progress;
