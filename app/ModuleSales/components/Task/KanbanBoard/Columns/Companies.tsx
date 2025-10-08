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

const DAILY_QUOTA = 35;

const Companies: React.FC<CompaniesProps> = ({
  expandedIdx,
  setExpandedIdx,
  handleSubmit,
  userDetails,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingQuota, setRemainingQuota] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyQuota = async () => {
    if (!userDetails?.ReferenceID) {
      setError("No user reference ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      console.log("🔄 Fetching daily quota for:", userDetails.ReferenceID, todayStr);

      const res = await fetch(
        `/api/ModuleSales/Companies/DailyQuota?referenceid=${userDetails.ReferenceID}&date=${todayStr}`
      );

      console.log("📡 Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }

      const data = await res.json();
      console.log("✅ Daily quota data:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.companies && Array.isArray(data.companies)) {
        setCompanies(data.companies);
        setRemainingQuota(data.remaining_quota || 0);
        console.log(`📊 Loaded ${data.companies.length} companies, remaining quota: ${data.remaining_quota}`);
      } else {
        setCompanies([]);
        setRemainingQuota(0);
        setError("Invalid data format received");
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch daily quota:", err);
      setError(err.message || "Failed to load companies");
      setCompanies([]);
      setRemainingQuota(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyQuota();
  }, [userDetails?.ReferenceID]);

  const handleAddCompany = async (comp: Company) => {
    try {
      // 1. Call the submit handler
      handleSubmit(comp, false);
      
      // 2. Remove company from local state
      const updatedCompanies = companies.filter((c) => c.id !== comp.id);
      setCompanies(updatedCompanies);
      const newRemainingQuota = Math.max(remainingQuota - 1, 0);
      setRemainingQuota(newRemainingQuota);

      // 3. Update the quota in Supabase
      const todayStr = new Date().toISOString().split("T")[0];
      const updateResponse = await fetch("/api/ModuleSales/Companies/DailyQuota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceid: userDetails?.ReferenceID,
          date: todayStr,
          companies: updatedCompanies,
          remaining_quota: newRemainingQuota,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update quota");
      }

      console.log("✅ Company added and quota updated:", comp.companyname);

    } catch (err: any) {
      console.error("❌ Failed to add company:", err);
      // Revert local state if update fails
      await fetchDailyQuota();
    }
  };

  const handleCancelCompany = (comp: Company) => {
    // Simply remove from display without affecting quota
    const updatedCompanies = companies.filter((c) => c.id !== comp.id);
    setCompanies(updatedCompanies);
    console.log("❌ Company cancelled:", comp.companyname);
  };

  const retryFetch = () => {
    fetchDailyQuota();
  };

  const getQuotaColor = () => {
    if (remainingQuota === 0) return "text-red-500";
    if (remainingQuota <= 10) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-2 overflow-y-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🏢</span>
          <div>
            <h3 className="text-sm font-bold text-gray-700">OB Calls</h3>
            <p className="text-xs text-gray-500">Daily Quota</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${getQuotaColor()}`}>
            {remainingQuota}
          </span>
          <p className="text-xs text-gray-500">of {DAILY_QUOTA}</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <div className="animate-pulse flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <p className="text-sm text-gray-500">Loading today's companies...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-sm text-gray-700 mb-2">{error}</p>
          <p className="text-xs text-gray-500 mb-4">Unable to load companies at the moment</p>
          <button 
            onClick={retryFetch}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && companies.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-gray-400 text-3xl mb-3">🏢</div>
          <p className="text-sm text-gray-700 mb-2">No companies available today</p>
          <p className="text-xs text-gray-500 mb-4">
            {remainingQuota === 0 ? 
              "You've completed all your OB calls for today!" : 
              "No companies were generated for today's quota."
            }
          </p>
          <button 
            onClick={retryFetch}
            className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Check Again
          </button>
        </div>
      )}

      {/* Companies List */}
      {!loading && !error && companies.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-2">
            <p className="text-xs text-gray-500">
              Showing {companies.length} companies
            </p>
            {remainingQuota > 0 && (
              <p className="text-xs text-green-600 font-medium">
                {remainingQuota} calls remaining
              </p>
            )}
          </div>
          
          {companies.map((comp, idx) => {
            const key = `comp-${comp.id}-${idx}`;
            const isExpanded = expandedIdx === key;
            
            return (
              <div 
                key={key} 
                className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${
                  isExpanded ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
              >
                <CompaniesCard
                  comp={comp}
                  isExpanded={isExpanded}
                  onToggle={() => setExpandedIdx(isExpanded ? null : key)}
                  onAdd={handleAddCompany}
                  onCancel={handleCancelCompany}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      {!loading && companies.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            💡 <strong>Tip:</strong> Companies are automatically filtered to prevent duplicates within their cooldown periods
          </p>
        </div>
      )}
    </div>
  );
};

export default Companies;