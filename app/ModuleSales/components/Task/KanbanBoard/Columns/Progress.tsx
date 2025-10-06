"use client";

import React, { useEffect, useState, useMemo, useReducer } from "react";
import { IoSync, IoSearchOutline } from "react-icons/io5";
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
  projectcategory?: string | string[];
  projecttype?: string;
  startdate?: string;
  enddate?: string;
  paymentterm: string;
  actualsales: string;
  deliverydate: string;
  followup_date: string;
  ticketreferencenumber: string;
  drnumber: string;
}

type ProgressEntry = ProgressItem | { id: string; skeleton: true };

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
}

const ITEMS_PER_PAGE = 10;

interface CardLoadingState {
  [id: string]: boolean;
}

type CardLoadingAction = { type: "SET_LOADING"; id: string; value: boolean };

const cardLoadingReducer = (
  state: CardLoadingState,
  action: CardLoadingAction
) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, [action.id]: action.value };
    default:
      return state;
  }
};

const Progress: React.FC<ProgressProps> = ({ userDetails }) => {
  const stableUserDetails = useMemo(() => userDetails, [userDetails?.ReferenceID]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [cardLoading, dispatchCardLoading] = useReducer(cardLoadingReducer, {});
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [formData, setFormData] = useState<any>({});
  const [hiddenFields, setHiddenFields] = useState<any>({});

  const resetForm = () => setFormData({});

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

    setFormData({ ...prog });
    setShowForm(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleProjectCategoryChange = (selected: { value: string; label: string }[] | null) => {
    setFormData((prev: any) => ({
      ...prev,
      projectcategory: selected ? selected.map((s) => s.value) : [],
    }));
  };

  const fetchProgress = async () => {
    if (!stableUserDetails?.ReferenceID) return;
    setLoading(true);
    try {
      setProgress(prev => prev.filter(item => !("skeleton" in item)));

      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchInProgress?referenceid=${stableUserDetails.ReferenceID}`
      );
      if (!res.ok) throw new Error("Failed to fetch progress");
      const data = await res.json();
      setProgress(data?.data || []);
    } catch (err: any) {
      console.error("❌ Error fetching progress:", err);
      toast.error("Failed to fetch progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [stableUserDetails?.ReferenceID, refreshTrigger]);

  const filteredProgress = useMemo(() => {
    return progress
      .filter(item => {
        if ("skeleton" in item) return true;
        if (!searchQuery) return true;
        return item.companyname.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if ("skeleton" in a || "skeleton" in b) return 0;
        return new Date(b.date_updated).getTime() - new Date(a.date_updated).getTime();
      });
  }, [progress, searchQuery]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload: any = { ...hiddenFields, ...formData };

    if (!payload.activitynumber) {
      toast.error("Activity number is missing!");
      setSubmitting(false);
      return;
    }

    Object.keys(payload).forEach(key => {
      if (payload[key] === "" || payload[key] === undefined) payload[key] = null;
    });

    ["soamount", "quotationamount", "targetquota", "actualsales"].forEach(field => {
      payload[field] = payload[field] !== null ? Number(payload[field]) : null;
    });

    const tempId = "temp-" + Date.now();
    setProgress(prev => [{ id: tempId, skeleton: true }, ...prev]);

    try {
      const res = await fetch("/api/ModuleSales/Task/ActivityPlanner/CreateProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit activity");

      toast.success("Activity successfully added/updated!");
      setShowForm(false);
      resetForm();

      setProgress(prev => prev.filter(item => item.id !== tempId));
      if (data?.data?.activity) setProgress(prev => [data.data.activity, ...prev]);

      fetchProgress();
      setVisibleCount(ITEMS_PER_PAGE);
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      toast.error("Failed to submit activity: " + err.message);
      setProgress(prev => prev.filter(item => item.id !== tempId));
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

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

      setProgress(prev => prev.filter(p => p.id !== item.id));
      toast.success("Activity deleted successfully!");
    } catch (err: any) {
      console.error("❌ Delete error:", err);
      toast.error("Failed to delete activity: " + err.message);
    } finally {
      dispatchCardLoading({ type: "SET_LOADING", id: item.id, value: false });
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <span className="text-xs text-gray-600 font-bold">
          Total:{" "}
          <span className="text-orange-500">{filteredProgress.length}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs"
            onClick={() => setSearchOpen(prev => !prev)}
          >
            Search <IoSearchOutline size={15} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <input
          type="text"
          placeholder="Search clients ..."
          className="border border-gray-300 rounded px-2 py-2 text-xs w-full"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      )}

      {filteredProgress.length > 0 ? (
        filteredProgress.slice(0, visibleCount).map(item => (
          <div key={item.id} className="relative">
            {cardLoading[item.id] && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-50">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
            <ProgressCard
              progress={item as ProgressItem}
              profilePicture={userDetails?.profilePicture || "/taskflow.png"}
              onAddClick={() => handleAddClick(item as ProgressItem)}
              onDeleteClick={() => handleDelete(item as ProgressItem)}
            />
          </div>
        ))
      ) : (
        <p className="text-xs text-gray-400 italic">No activities found.</p>
      )}

      {showForm && (
        <ProgressForm
          formData={formData}
          handleFormChange={handleFormChange}
          handleFormSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
          handleProjectCategoryChange={handleProjectCategoryChange}
          setFormData={setFormData}
          companyName={hiddenFields.companyname}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="text-xs z-[99999]"
        toastClassName="relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-xs"
        progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
      />
    </div>
  );
};

export default Progress;
