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
  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);

  const limit = 35;
  const isNearLimit = tapCount >= limit * 0.8;
  const isFull = tapCount >= limit;

  // 🕓 Handle daily reset of localStorage counter
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("tapDate");
    const savedCount = localStorage.getItem("tapCount");

    if (savedDate === today && savedCount) {
      setTapCount(parseInt(savedCount, 10));
    } else {
      localStorage.setItem("tapDate", today);
      localStorage.setItem("tapCount", "0");
      setTapCount(0);
    }
  }, []);

  // 🔀 Shuffle helper
  const shuffleArray = (array: Company[]): Company[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const today = new Date().toISOString().split("T")[0];

  const fetchCompanies = async (forceReplace = false) => {
    if (!userDetails?.ReferenceID) {
      setLoading(false);
      setReplacing(false);
      return;
    }

    if (forceReplace) setReplacing(true);
    else setLoading(true);

    try {
      const res = await fetch(
        `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}&_t=${Date.now()}`
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const response = await res.json();

      if (response.success && Array.isArray(response.data)) {
        const today = new Date().toISOString().split("T")[0];
        const validCompanies = response.data.filter((comp: any) => {
          return (
            !comp.next_available_date ||
            comp.next_available_date.split("T")[0] === today
          );
        });

        // 🔀 Shuffle and slice to 35 max
        const random35 = shuffleArray(validCompanies).slice(0, 35);
        setCompanies(random35);
      } else {
        setCompanies([]);
        console.warn("API response not successful:", response);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
      setReplacing(false);
    }
  };


  // 🧩 First load
  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  const handleReplace = async () => {
    // Prevent double clicks
    if (replacing || !userDetails?.ReferenceID || companies.length === 0) {
      setReplacing(false);
      return;
    }

    setReplacing(true);

    const replaceIdx = Math.floor(Math.random() * companies.length);
    setReplacingIdx(replaceIdx);

    try {
      // Fetch fresh companies
      const res = await fetch(
        `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}&_t=${Date.now()}`
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const response = await res.json();

      if (!response.success || !Array.isArray(response.data)) {
        console.warn("No companies fetched");
        return;
      }

      // Filter out existing companies
      const existingIds = new Set(companies.map((c) => c.id));
      const available = response.data.filter((c: Company) => !existingIds.has(c.id));

      if (available.length === 0) {
        console.warn("No unique company available to replace");
        return;
      }

      // Get random new company
      const newCompany = available[Math.floor(Math.random() * available.length)];

      // Update companies array
      setCompanies((current) => {
        const updated = [...current];
        updated[replaceIdx] = newCompany;
        return updated;
      });

    } catch (err) {
      console.error("Failed to replace company:", err);
    } finally {
      setReplacingIdx(null);
      setReplacing(false);
    }
  };

  // 🔁 Add company and refresh list
  const handleAddCompany = async (comp: Company) => {
    // 1️⃣ Submit to inquiry or target handler
    handleSubmit(comp, false);

    try {
      // 2️⃣ Update next_available_date based on typeclient
      await fetch(`/api/ModuleSales/Companies/CompanyAccounts/UpdateAvailability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: comp.id,
          typeclient: comp.typeclient,
        }),
      });
    } catch (err) {
      console.error("Failed to update company availability:", err);
    }

    // 3️⃣ Remove from list (already handled)
    setCompanies((prev) => prev.filter((c) => c.id !== comp.id));

    // 4️⃣ Increment tap count
    const newCount = tapCount + 1;
    setTapCount(newCount);
    localStorage.setItem("tapCount", newCount.toString());

    // 5️⃣ Fetch new company to keep 35 slots full
    if (userDetails?.ReferenceID) {
      try {
        const res = await fetch(
          `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}&_t=${Date.now()}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const response = await res.json();

        if (response.success && Array.isArray(response.data)) {
          const existingIds = new Set(companies.map((c) => c.id).concat(comp.id));
          const available = response.data.filter((c: Company) => !existingIds.has(c.id));
          if (available.length > 0) {
            const needed = 35 - (companies.length - 1);
            const shuffled = shuffleArray(available).slice(0, needed);
            setCompanies((prev) => [...prev, ...shuffled]);
          }
        }
      } catch (err) {
        console.error("Failed to refresh companies after add:", err);
      }
    }
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      {/* Header Section */}
      <div className="mb-2">
        {/* OB Calls Counter */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col w-full sm:w-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black flex items-center gap-1">
                📞 OB Calls:
              </span>
              <span
                className={`text-xs font-bold ${isFull ? "text-red-500" : isNearLimit ? "text-orange-500" : "text-green-600"
                  }`}
              >
                {tapCount}{" "}
                <span className="text-[10px] text-gray-500 font-normal">
                  / {limit} Minimum
                </span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-in-out ${isFull ? "bg-red-500" : isNearLimit ? "bg-orange-400" : "bg-green-500"
                  }`}
                style={{ width: `${Math.min((tapCount / limit) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleReplace}
            disabled={replacing || !userDetails?.ReferenceID || companies.length === 0}
            className={`text-xs px-3 py-1 rounded-md font-medium shadow-sm flex items-center gap-1 ${replacing || !userDetails?.ReferenceID || companies.length === 0
              ? "bg-gray-400 text-white cursor-not-allowed animate-pulse"
              : "bg-green-500 text-white hover:bg-green-600"
              }`}
          >
            {replacing ? (
              <>
                <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Replacing...</span>
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>

        <h3 className="flex items-center text-[10px] italic font-bold text-gray-600 border-t border-gray-200 pt-2">
          <span className="mr-1">🏢</span> Showing 35 Random Companies
        </h3>
      </div>

      {/* Company List */}
      {loading ? (
        <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
          <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
        </div>
      ) : companies.length > 0 ? (
        companies.map((comp, idx) => {
          const key = `comp-${idx}`;
          const isExpanded = expandedIdx === key;
          const isReplacingItem = replacingIdx === idx;
          if (isReplacingItem) return null;
          return (
            <div key={key}>
              <CompaniesCard
                comp={comp}
                isExpanded={isExpanded}
                onToggle={() => setExpandedIdx(isExpanded ? null : key)}
                onAdd={() => handleAddCompany(comp)}
                onCancel={() => { }}
              />
            </div>
          );
        })
      ) : (
        <div className="text-center p-4">
          <p className="text-xs text-gray-400 mb-2">🚫 No companies available.</p>
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
