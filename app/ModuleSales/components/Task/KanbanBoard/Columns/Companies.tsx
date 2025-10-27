"use client";

import React, { useEffect, useState } from "react";
import CompaniesCard from "./Card/CompaniesCard";

interface Company {
  id?: number;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  address?: string;
  next_available_date?: string | null;
}

interface CompaniesProps {
  expandedIdx: string | null;
  setExpandedIdx: (id: string | null) => void;
  handleSubmit: (data: Partial<Company>, isInquiry: boolean) => void;
  userDetails: { ReferenceID?: string } | null;
}

const Companies: React.FC<CompaniesProps> = ({
  expandedIdx,
  setExpandedIdx,
  handleSubmit,
  userDetails,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [tapCount, setTapCount] = useState(0);
  const [currentCluster, setCurrentCluster] = useState("Top 50");

  const clusterOrder = ["Top 50", "Next 30", "Balance 20", "TSA Client", "CSR Client"];

  const normalizeDate = (value?: string | null): string | null => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  // 🕓 Daily restore progress from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("tapDate");
    const savedCluster = localStorage.getItem("clusterName");

    if (savedDate === today && savedCluster) {
      setCurrentCluster(savedCluster);
      setTapCount(parseInt(localStorage.getItem("tapCount") || "0", 10));
    } else {
      localStorage.setItem("tapDate", today);
      localStorage.setItem("tapCount", "0");
      localStorage.setItem("clusterName", "Top 50");
      setCurrentCluster("Top 50");
      setTapCount(0);
    }
  }, []);

  const fetchCompanies = async () => {
    if (!userDetails?.ReferenceID) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}&_t=${Date.now()}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const response = await res.json();
      if (!response.success || !Array.isArray(response.data)) throw new Error("Invalid data");

      const allCompanies: Company[] = response.data;
      const todayStr = new Date().toISOString().split("T")[0];

      let selectedCluster = "Top 50";
      let finalList: Company[] = [];

      // 🔁 Step 1: Loop through clusters in order
      for (const cluster of clusterOrder) {
        const list = allCompanies.filter((c) => c.typeclient === cluster);

        // ✅ Filter companies with next_available_date = today or null
        const availableTodayOrEmpty = list.filter((c) => {
          const date = normalizeDate(c.next_available_date);
          return date === todayStr || date === null;
        });

        if (availableTodayOrEmpty.length > 0) {
          selectedCluster = cluster;
          finalList = availableTodayOrEmpty;
          break;
        }
      }

      // 🔁 Step 2: If all clusters have no (today/null), show those with next_available_date = today across all clusters
      if (finalList.length === 0) {
        const todayCompanies = allCompanies.filter(
          (c) => normalizeDate(c.next_available_date) === todayStr
        );
        finalList = todayCompanies;
        selectedCluster = "Recycled (Next Available Dates)";
      }

      // ✅ Step 3: Save state
      setCompanies(finalList);
      setCurrentCluster(selectedCluster);
      localStorage.setItem("clusterName", selectedCluster);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID, currentCluster]);

  const handleAddCompany = async (comp: Company) => {
    handleSubmit(comp, false);

    try {
      await fetch(`/api/ModuleSales/Companies/CompanyAccounts/UpdateAvailability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: comp.id, typeclient: comp.typeclient }),
      });
    } catch (err) {
      console.error("Failed to update company availability:", err);
    }

    // Remove clicked company from the list
    setCompanies((prev) => prev.filter((c) => c.id !== comp.id));

    const newCount = tapCount + 1;
    setTapCount(newCount);
    localStorage.setItem("tapCount", newCount.toString());

    // ✅ Move to next cluster if done
    if (companies.length - 1 === 0) {
      const currentIdx = clusterOrder.indexOf(currentCluster);
      if (currentIdx < clusterOrder.length - 1) {
        const nextCluster = clusterOrder[currentIdx + 1];
        setCurrentCluster(nextCluster);
        localStorage.setItem("clusterName", nextCluster);
      } else {
        console.log("🏁 All clusters completed — waiting for next available dates to recycle.");
      }
    }
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      {/* HEADER */}
      <div className="mb-2">
        <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <div className="text-xs font-semibold text-black">
            📞 OB Calls: <span className="text-green-600 font-bold">{tapCount}</span>
          </div>
          <div className="text-[10px] font-semibold italic text-gray-600">
            Active Cluster: <span className="text-blue-600">{currentCluster}</span>
          </div>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="animate-pulse p-4 border rounded bg-gray-50 shadow-sm">
          <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
        </div>
      ) : companies.length > 0 ? (
        companies.map((comp, idx) => {
          const key = `comp-${idx}`;
          const isExpanded = expandedIdx === key;
          const isToday =
            normalizeDate(comp.next_available_date) ===
            new Date().toISOString().split("T")[0];

          return (
            <div
              key={key}
              className={isToday ? "border-l-4 border-green-500 rounded-xl" : ""}
            >
              <CompaniesCard
                comp={comp}
                isExpanded={isExpanded}
                onToggle={() => setExpandedIdx(isExpanded ? null : key)}
                onAdd={() => handleAddCompany(comp)}
              />
            </div>
          );
        })
      ) : (
        <div className="text-center p-4">
          <p className="text-xs text-gray-400 mb-2">
            🚫 No companies available for this cluster today.
          </p>
          <p className="text-[10px] text-gray-500 italic">
            (Only those with next available date = today or empty will appear.)
          </p>
        </div>
      )}
    </div>
  );
};

export default Companies;
