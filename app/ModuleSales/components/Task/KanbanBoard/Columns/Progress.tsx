"use client";

import React, { useEffect, useState, useMemo } from "react";
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

type ProgressEntry = ProgressItem;

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

const Progress: React.FC<ProgressProps> = ({ userDetails }) => {
  const stableUserDetails = useMemo(() => userDetails, [userDetails?.ReferenceID]);

  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [listLoading, setListLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
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
    contactnumber: "",
  });

  const [hiddenFields, setHiddenFields] = useState<any>({
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
      contactnumber: "",
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
      ...prog,
      projectcategory: prog?.projectcategory
        ? Array.isArray(prog.projectcategory)
          ? prog.projectcategory
          : [prog.projectcategory]
        : [],
    });

    setShowForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<any>) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProjectCategoryChange = (selected: { value: string }[] | null) => {
    setFormData((prev: any) => ({
      ...prev,
      projectcategory: selected ? selected.map((s) => s.value) : [],
    }));
  };

  const fetchProgress = async () => {
    if (!stableUserDetails?.ReferenceID) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ModuleSales/Task/ActivityPlanner/FetchInProgress?referenceid=${stableUserDetails.ReferenceID}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to fetch progress");

      const data = await res.json();
      setProgress(data?.data || []);
    } catch (err) {
      console.error("❌ Error fetching progress:", err);
      toast.error("Failed to fetch progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [stableUserDetails?.ReferenceID, refreshTrigger]);

  const handleRefresh = async () => {
    setListLoading(true);
    try {
      await fetchProgress();
      toast.info("Refreshing data...");
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh data");
    } finally {
      setListLoading(false);
    }
  };

  const handleDelete = async (item: ProgressItem) => {
    try {
      const res = await fetch(
        "/api/ModuleSales/Task/ActivityPlanner/DeleteProgress",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete activity");

      setProgress((prev) => prev.filter((p) => p.id !== item.id));
      toast.success("Activity deleted successfully!");
    } catch (err: any) {
      console.error("❌ Delete error:", err);
      toast.error("Failed to delete activity: " + err.message);
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 bg-gray-100 p-2 rounded hover:bg-gray-200 text-xs"
            onClick={() => setSearchOpen((prev) => !prev)}
          >
            Search <IoSearchOutline size={15} />
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
          placeholder="Search clients ..."
          className="border border-gray-300 rounded px-2 py-2 text-xs w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : progress.length > 0 ? (
        progress.map((item) => (
          <ProgressCard
            key={item.id}
            progress={item}
            profilePicture={userDetails?.profilePicture || "/taskflow.png"}
            onAddClick={() => handleAddClick(item)}
            onDeleteClick={handleDelete}
          />
        ))
      ) : (
        <p className="text-xs text-gray-400 italic">No activities found.</p>
      )}

      {showForm && (
        <ProgressForm
          formData={formData}
          handleFormChange={handleFormChange}
          handleFormSubmit={(e) => {}}
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
