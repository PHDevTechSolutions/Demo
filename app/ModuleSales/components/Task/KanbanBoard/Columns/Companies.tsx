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

  // 🧮 Increment tap count
  const handleAddCompany = (comp: Company) => {
    handleSubmit(comp, false);
    const newCount = tapCount + 1;
    setTapCount(newCount);
    localStorage.setItem("tapCount", newCount.toString());
  };

  // 🔀 Shuffle helper
  const shuffleArray = (array: Company[]): Company[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 🏢 Fetch companies
  const fetchCompanies = async (forceReplace = false) => {
    if (!userDetails?.ReferenceID) {
      setLoading(false);
      return;
    }

    if (forceReplace) setReplacing(true);
    else setLoading(true);

    try {
      const res = await fetch(
        `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${
          userDetails.ReferenceID
        }&_t=${Date.now()}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const response = await res.json();
      if (response.success && Array.isArray(response.data)) {
        const random35 = shuffleArray(response.data).slice(0, 35);
        if (forceReplace) {
          setCompanies([]);
          setTimeout(() => setCompanies(random35), 100);
        } else {
          setCompanies(random35);
        }
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setCompanies([]);
    } finally {
      if (forceReplace) setReplacing(false);
      else setLoading(false);
    }
  };

  // 🧩 First load
  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  // 🔁 Replace button
  const handleReplace = async () => {
    await fetchCompanies(true);
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      {/* Header Section */}
      <div className="mb-2">
        {/* OB Calls Counter */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          {/* Counter & Progress */}
          <div className="flex flex-col w-full sm:w-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black flex items-center gap-1">
                📞 OB Calls:
              </span>
              <span
                className={`text-xs font-bold ${
                  isFull
                    ? "text-red-500"
                    : isNearLimit
                    ? "text-orange-500"
                    : "text-green-600"
                }`}
              >
                {tapCount}{" "}
                <span className="text-[10px] text-gray-500 font-normal">
                  / {limit} Min
                </span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                  isFull
                    ? "bg-red-500"
                    : isNearLimit
                    ? "bg-orange-400"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min((tapCount / limit) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Refresh Button */}
          {!loading && (
            <button
              onClick={handleReplace}
              disabled={replacing}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-all shadow-sm ${
                replacing
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {replacing ? (
                <div className="flex items-center gap-1">
                  <svg
                    className="animate-spin h-3 w-3 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span>Refreshing...</span>
                </div>
              ) : (
                "Refresh"
              )}
            </button>
          )}
        </div>

        {/* Companies Header */}
        <h3 className="flex items-center text-[10px] italic font-bold text-gray-600 border-t border-gray-200 pt-2">
          <span className="mr-1">🏢</span> Showing 35 Random Companies
        </h3>
      </div>

      {/* Company List */}
      {loading ? (
        <p className="text-xs text-gray-400">Loading companies...</p>
      ) : companies.length > 0 ? (
        companies.map((comp, idx) => {
          const key = `comp-${idx}`;
          const isExpanded = expandedIdx === key;
          return (
            <CompaniesCard
              key={key}
              comp={comp}
              isExpanded={isExpanded}
              onToggle={() => setExpandedIdx(isExpanded ? null : key)}
              onAdd={() => handleAddCompany(comp)} // ✅ counted here
              onCancel={() => {}}
            />
          );
        })
      ) : (
        <div className="text-center p-4">
          <p className="text-xs text-gray-400 mb-2">
            🚫 No companies available.
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