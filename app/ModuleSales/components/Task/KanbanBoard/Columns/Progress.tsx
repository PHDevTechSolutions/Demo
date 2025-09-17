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
  date_updated: string;
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
  paymentterm: string;
  actualsales: string;
  deliverydate: string;
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

interface CardLoadingState {
  [id: string]: boolean;
}

type CardLoadingAction =
  | { type: "SET_LOADING"; id: string; value: boolean };

const cardLoadingReducer = (state: CardLoadingState, action: CardLoadingAction) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, [action.id]: action.value };
    default:
      return state;
  }
};

const Progress: React.FC<ProgressProps> = ({ userDetails, refreshTrigger }) => {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cardLoading, dispatchCardLoading] = React.useReducer(
    cardLoadingReducer,
    {}
  );


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
    paymentterm: "",
    actualsales: "",
    deliverydate: "",
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
      paymentterm: "",
      actualsales: "",
      deliverydate: "",
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
      paymentterm: prog?.paymentterm || "",
      actualsales: prog?.actualsales || "",
      deliverydate: prog?.deliverydate || "",
    });

    setShowForm(true);
  };

  /** Fetch progress data */
  const fetchProgress = async () => {
    if (!userDetails?.ReferenceID) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchInProgress?referenceid=${userDetails.ReferenceID}`
      );
      const data = await res.json();
      const progressData: ProgressItem[] =
        Array.isArray(data) ? data : data?.data || data?.progress || [];

      const myProgress = progressData.filter(
        (p) => p.referenceid === userDetails.ReferenceID
      );

      // 🔹 Sort by latest of date_updated or date_created
      setProgress(
        myProgress.sort((a, b) => {
          const dateA_updated = a.date_updated ? new Date(a.date_updated).getTime() : 0;
          const dateA_created = a.date_created ? new Date(a.date_created).getTime() : 0;
          const dateA = Math.max(dateA_updated, dateA_created);

          const dateB_updated = b.date_updated ? new Date(b.date_updated).getTime() : 0;
          const dateB_created = b.date_created ? new Date(b.date_created).getTime() : 0;
          const dateB = Math.max(dateB_updated, dateB_created);

          return dateB - dateA; // 🔹 latest first
        })
      );

    } catch (err) {
      console.error("❌ Error fetching progress:", err);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProgress();
  }, [userDetails?.ReferenceID, refreshTrigger]);

  /** Handle form change */
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** Handle react-select change */
  const handleProjectCategoryChange = (
    selected: { value: string; label: string } | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      projectcategory: selected ? selected.value : "",
    }));
  };

  /** Submit form */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...hiddenFields, ...formData };

    if (!payload.activitynumber) {
      toast.error("Activity number is missing!");
      return;
    }

    // Sanitize numeric fields
    const numericFields = ["soamount", "quotationamount", "targetquota", "actualsales"];
    numericFields.forEach((field) => {
      payload[field] =
        payload[field] === "" || payload[field] === undefined
          ? null
          : Number(payload[field]);
    });

    // 🔹 Start per-card loading if editing existing card
    if (payload.id) dispatchCardLoading({ type: "SET_LOADING", id: payload.id, value: true });

    try {
      const res = await fetch(
        "/api/ModuleSales/Task/ActivityPlanner/CreateProgress",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit activity");

      setShowForm(false);
      resetForm();
      toast.success("Activity successfully added/updated!");

      // Update only the modified card
      if (data?.id) {
        setProgress((prev) => {
          const exists = prev.some((p) => p.id === data.id);
          if (exists) {
            return prev.map((p) => (p.id === data.id ? data : p));
          } else {
            return [data, ...prev];
          }
        });
      }
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      toast.error("Failed to submit activity: " + err.message);
    } finally {
      if (payload.id) dispatchCardLoading({ type: "SET_LOADING", id: payload.id, value: false });
    }
  };

  /** Delete activity */
  const handleDelete = async (item: ProgressItem) => {
    dispatchCardLoading({ type: "SET_LOADING", id: item.id, value: true });
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
      dispatchCardLoading({ type: "SET_LOADING", id: item.id, value: false });
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
    <div className="space-y-4 relative">
      {progress.length > 0 ? (
        progress.map((item) => (
          <div key={item.id} className="relative">
            {cardLoading[item.id] && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-50">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
            <ProgressCard
              progress={item}
              profilePicture={userDetails?.profilePicture || "/taskflow.png"}
              onAddClick={() => handleAddClick(item)}
              onDeleteClick={handleDelete}
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
          setFormData={setFormData}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default Progress;
