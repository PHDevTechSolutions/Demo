"use client";

import React, { useEffect, useState } from "react";
import ProgressCard from "./Card/ProgressCard";
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
  typeactivity?: string;
  referenceid: string;
  date_created: string;
  remarks?: string;
  address?: string;
  area?: string;
  deliveryaddress?: string;
  activitynumber?: string;
  status?: string;
  source?: string;
  activitystatus?: string;
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

  // Editable fields only
  const [formData, setFormData] = useState({
    status: "",
    source: "",
    typeactivity: "",
  });

  // Hidden fields for submission
  const [hiddenFields, setHiddenFields] = useState({
    referenceid: userDetails?.ReferenceID || "",
    tsm: userDetails?.TSM || "",
    manager: userDetails?.Manager || "",
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

  const handleAddClick = (prog?: ProgressItem) => {
    setHiddenFields({
      referenceid: userDetails?.ReferenceID || "",
      tsm: userDetails?.TSM || "",
      manager: userDetails?.Manager || "",
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
      status: prog?.status || "",
      source: prog?.source || "",
      typeactivity: prog?.typeactivity || "",
    });

    setShowForm(true);
  };

  // Fetch progress
  useEffect(() => {
    if (!userDetails?.ReferenceID) return;

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/ModuleSales/Task/ActivityPlanner/FetchProgress?referenceid=${userDetails.ReferenceID}`
        );
        const data = await res.json();

        const progressData: ProgressItem[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.progress)
              ? data.progress
              : [];

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
      } catch (error) {
        console.error("❌ Error fetching progress:", error);
        setProgress([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userDetails?.ReferenceID, refreshTrigger]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🔹 Update only the specific parent card after adding a child
  const handleAddChild = (activitynumber: string, newChild: ProgressItem) => {
    setProgress((prev) => [...prev, newChild]);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...hiddenFields, ...formData };

    if (!payload.activitynumber) {
      toast.error("Activity number is missing!");
      return;
    }

    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/CreateProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit activity");

      setShowForm(false);
      setFormData({ status: "", source: "", typeactivity: "" });
      toast.success("Activity successfully added!");

      // 🔹 Update only the specific parent card
      handleAddChild(payload.activitynumber, data);
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      toast.error("Failed to submit activity: " + err.message);
    }
  };

  // Delete parent
  const handleDeleteParent = async (item: ProgressItem) => {
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
    }
  };

  // Delete child
  const handleDeleteChild = async (child: ProgressItem) => {
    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/DeleteProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: child.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete log");

      setProgress((prev) => prev.filter((p) => p.id !== child.id));
      toast.success("Log deleted successfully!");
    } catch (err: any) {
      console.error("❌ Delete error:", err);
      toast.error("Failed to delete log: " + err.message);
    }
  };

  // Group by activitynumber for parent-child
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
      <ToastContainer position="top-right" autoClose={3000} />

      {progressWithChildren.length > 0 ? (
        progressWithChildren.map((grp, idx) => (
          <ProgressCard
            key={idx}
            progress={grp.parent}
            childrenProgress={grp.children}
            profilePicture={userDetails?.profilePicture || "/default-avatar.png"}
            onAddClick={() => handleAddClick(grp.parent)}
            onDeleteClick={handleDeleteParent}
            onDeleteChildClick={handleDeleteChild}
          />
        ))
      ) : (
        <p className="text-sm text-gray-400">No progress found.</p>
      )}

      {/* Slide-up form */}
      {showForm && (
        <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-lg z-50">
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <label className="font-semibold">{key.replace(/([A-Z])/g, " $1")}</label>
                  <input
                    name={key}
                    value={value}
                    onChange={handleFormChange}
                    className="border px-2 py-1 rounded text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1 bg-gray-300 rounded text-xs hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
      />
    </div>
  );
};

export default Progress;
