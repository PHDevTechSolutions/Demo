"use client";

import React, { useEffect, useState, useMemo } from "react";
import { IoSync, IoSearchOutline, IoFilter } from 'react-icons/io5';
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
  searchQuery?: string;
  progress: any[];
  loading: boolean;
}

const ITEMS_PER_PAGE = 10;

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

const Progress: React.FC<ProgressProps> = ({ userDetails }) => {
  const stableUserDetails = useMemo(() => userDetails, [userDetails?.ReferenceID]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cardLoading, dispatchCardLoading] = React.useReducer(cardLoadingReducer, {});
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [listLoading, setListLoading] = useState(false);
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
    projectcategory: [] as string[],
    projecttype: "",
    paymentterm: "",
    actualsales: "",
    deliverydate: "",
    followup_date: "",
    drnumber: "",
    emailaddress: "",
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
      projectcategory: [],
      projecttype: "",
      paymentterm: "",
      actualsales: "",
      deliverydate: "",
      followup_date: "",
      drnumber: "",
      emailaddress: "",
    });

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
      projectcategory: prog?.projectcategory
        ? Array.isArray(prog.projectcategory)
          ? prog.projectcategory
          : [prog.projectcategory]
        : [],
      projecttype: prog?.projecttype || "",
      paymentterm: prog?.paymentterm || "",
      actualsales: prog?.actualsales || "",
      deliverydate: prog?.deliverydate || "",
      followup_date: prog?.followup_date || "",
      drnumber: prog?.drnumber || "",
      emailaddress: prog?.emailaddress || "",
    });

    setShowForm(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProjectCategoryChange = (
    selected: { value: string; label: string }[] | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      projectcategory: selected ? selected.map((s) => s.value) : [],
    }));
  };

  const activityStatuses = ["Quote-Done", "SO-Done", "Assisted", "Paid", "Collected", "On Progress"];
  // Get today's date in YYYY-MM-DD (based on system/server time)
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Filter progress
  const filteredProgress = progress.filter((item) => {
    if (!item.date_updated) return false;

    // Convert item's date_updated
    const itemDate = new Date(item.date_updated).toISOString().split("T")[0];

    // 1️⃣ Status filter
    if (statusFilter && item.activitystatus !== statusFilter) return false;

    if (searchQuery && searchQuery.trim() !== "") {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      return (item.companyname ?? "").toLowerCase().includes(normalizedQuery);
    }

    // 3️⃣ Default: only today's items (based on system/server time)
    return itemDate === today;
  });

  // 🟢 Fetch Progress
  const fetchProgress = async () => {
    if (!stableUserDetails?.ReferenceID) return;
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchInProgress?referenceid=${stableUserDetails.ReferenceID}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setProgress(data?.data || []);
    } catch (err) {
      console.error("❌ Error fetching progress:", err);
      toast.error("Failed to fetch progress");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Run on mount lang (no refreshTrigger)
  useEffect(() => {
    fetchProgress();
  }, [stableUserDetails?.ReferenceID, refreshTrigger]);

  // 🟢 Submit form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: any = { ...hiddenFields, ...formData };

    if (!payload.activitynumber) {
      toast.error("Activity number is missing!");
      setSubmitting(false);
      return;
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === undefined) payload[key] = null;
    });

    ["soamount", "quotationamount", "targetquota", "actualsales"].forEach((field) => {
      payload[field] = payload[field] !== null ? Number(payload[field]) : null;
    });

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

      // 🔥 Show loading state
      setListLoading(true);

      // 🔄 Force refresh
      await fetchProgress();

      // Reset pagination
      setVisibleCount(ITEMS_PER_PAGE);

    } catch (err: any) {
      console.error("❌ Submit error:", err);
      toast.error("Failed to submit activity: " + err.message);
    } finally {
      setSubmitting(false);
      setListLoading(false);
    }
  };

  // 🟢 Refresh button (manual trigger)
  const handleRefresh = async () => {
    setListLoading(true); // start loading
    try {
      await fetchProgress();
      toast.info("Refreshing data...");
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh data");
    } finally {
      setListLoading(false); // stop loading
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
          Total: <span className="text-orange-500">{filteredProgress.length}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs"
            onClick={() => setSearchOpen((prev) => !prev)}
          >
            Search <IoSearchOutline size={15} />
          </button>
          <button
            className="flex items-center gap-1 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs"
            onClick={() => setFilterOpen((prev) => !prev)}
          >
            Filter <IoFilter size={15} />
          </button>
          <button
            className="flex items-center gap-1 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs"
            onClick={handleRefresh}
          >
            {listLoading ? (
              <IoSync size={14} className="animate-spin" />
            ) : (
              <IoSync size={14} />
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <input
          type="text"
          placeholder="Search clients (past, present data) ..."
          className="border border-gray-300 rounded px-2 py-2 text-xs w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      {filterOpen && (
        <select
          className="border border-gray-300 rounded px-2 py-2 text-xs w-full"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {activityStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      )}

      {listLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredProgress.length > 0 ? (
        filteredProgress.slice(0, visibleCount).map((item) => (
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
        <p className="text-xs text-gray-400 italic">No activities for today.</p>
      )}


      {visibleCount < filteredProgress.length && (
        <div className="flex justify-center mt-2">
          <button
            className="px-4 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
          >
            View More
          </button>
        </div>
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
