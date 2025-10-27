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
  next_available_date?: string;
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
  const [replacing, setReplacing] = useState(false);
  const [currentCluster, setCurrentCluster] = useState("Top 50");

  const clusterOrder = ["Top 50", "Next 30", "Balance 20", "TSA Client", "CSR Client"];

  const normalizeDate = (value?: string): string | null => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  // 🕓 Daily reset (back to Top 50)
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

      // ✅ Filter only current cluster
      const currentList = allCompanies.filter((c) => c.typeclient === currentCluster);

      // ✅ Prioritize those with next_available_date = today
      const todayCompanies = currentList.filter(
        (c) => normalizeDate(c.next_available_date) === todayStr
      );

      // ✅ Merge both (today first, then the rest)
      const others = currentList.filter(
        (c) => normalizeDate(c.next_available_date) !== todayStr
      );

      let finalList = [...todayCompanies, ...others];

      // 🧹 Remove duplicates
      const seen = new Set<string>();
      finalList = finalList.filter((c) => {
        const key = c.id ? String(c.id) : c.companyname.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setCompanies(finalList);
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

    // Remove clicked company
    setCompanies((prev) => prev.filter((c) => c.id !== comp.id));

    const newCount = tapCount + 1;
    setTapCount(newCount);
    localStorage.setItem("tapCount", newCount.toString());

    // ✅ Check if all companies for current cluster are done
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

  const handleRefresh = async () => {
    if (replacing) return;
    setReplacing(true);
    await fetchCompanies();
    setTimeout(() => setReplacing(false), 300);
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
          <button
            onClick={handleRefresh}
            disabled={replacing}
            className={`text-xs px-3 py-1 rounded-md ${
              replacing ? "bg-gray-400 animate-pulse" : "bg-green-500 hover:bg-green-600"
            } text-white font-medium shadow-sm`}
          >
            {replacing ? "Refreshing..." : "Refresh"}
          </button>
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
            normalizeDate(comp.next_available_date) === new Date().toISOString().split("T")[0];

          return (
            <div key={key} className={isToday ? "border-l-4 border-green-500 rounded-xl" : ""}>
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
            🚫 No companies available for this cluster.
          </p>
          <button
            onClick={() => fetchCompanies()}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Companies;
