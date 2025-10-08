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

const isCompanyDue = (comp: Company) => {
  const lastAdded = comp.id ? localStorage.getItem(`lastAdded_${comp.id}`) : null;
  if (!lastAdded) return true;
  const diffDays = Math.floor(
    (Date.now() - new Date(lastAdded).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (comp.typeclient === "Top 50") return diffDays >= 10;
  if (comp.typeclient === "Next 30" || comp.typeclient === "Balance 20") return diffDays >= 30;
  return true;
};

const DAILY_QUOTA = 35;

const Companies: React.FC<CompaniesProps> = ({
  expandedIdx,
  setExpandedIdx,
  handleSubmit,
  userDetails,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingQuota, setRemainingQuota] = useState(DAILY_QUOTA);

  // Function to get today's date key for localStorage
  const getTodayKey = () => {
    const today = new Date();
    return `companies_date_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  // Function to shuffle array randomly
  const shuffleArray = (array: Company[]): Company[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchCompanies = async () => {
    if (!userDetails?.ReferenceID) {
      setLoading(false);
      return;
    }

    // Check if we already generated companies for today
    const todayKey = getTodayKey();
    const storedCompanies = localStorage.getItem(todayKey);
    const storedQuota = localStorage.getItem(`${todayKey}_quota`);

    if (storedCompanies && storedQuota) {
      // Use stored companies for today
      const parsedCompanies = JSON.parse(storedCompanies);
      const parsedQuota = parseInt(storedQuota, 10);
      
      setCompanies(parsedCompanies);
      setRemainingQuota(parsedQuota);
      setLoading(false);
      console.log("Using stored companies for today:", parsedCompanies.length);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching companies from FetchAccount API...");

      const res = await fetch(
        `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const response = await res.json();
      console.log("API Response:", response);

      if (response.success && Array.isArray(response.data)) {
        // Shuffle companies randomly and take only DAILY_QUOTA
        const shuffledCompanies = shuffleArray(response.data);
        const todaysCompanies = shuffledCompanies.slice(0, DAILY_QUOTA);
        
        // Store in localStorage for today
        localStorage.setItem(todayKey, JSON.stringify(todaysCompanies));
        localStorage.setItem(`${todayKey}_quota`, DAILY_QUOTA.toString());
        
        setCompanies(todaysCompanies);
        setRemainingQuota(DAILY_QUOTA);
        console.log("Random companies set for today:", todaysCompanies.length);
      } else {
        console.log("No data found or invalid response structure");
        setCompanies([]);
        setRemainingQuota(0);
      }
    } catch (err: any) {
      console.error("Failed to fetch companies:", err);
      setCompanies([]);
      setRemainingQuota(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  const handleAddCompany = (comp: Company) => {
    handleSubmit(comp, false);
    const updated = companies.filter((c) => c.id !== comp.id);
    
    // Update localStorage with remaining companies and quota
    const todayKey = getTodayKey();
    const newQuota = remainingQuota - 1;
    
    setCompanies(updated);
    setRemainingQuota(newQuota);
    
    localStorage.setItem(todayKey, JSON.stringify(updated));
    localStorage.setItem(`${todayKey}_quota`, newQuota.toString());

    if (comp.id) localStorage.setItem(`lastAdded_${comp.id}`, new Date().toISOString());
  };

  const handleCancelCompany = (comp: Company) => {
    let updated = companies.filter((c) => c.id !== comp.id);
    setCompanies(updated);
    setRemainingQuota(remainingQuota);
  };

  const retryFetch = () => {
    fetchCompanies();
  };

  // Function to manually reset daily quota (for testing/debugging)
  const resetDailyQuota = () => {
    const todayKey = getTodayKey();
    localStorage.removeItem(todayKey);
    localStorage.removeItem(`${todayKey}_quota`);
    fetchCompanies();
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2">
        <span className="flex items-center">
          <span className="mr-1">🏢</span> OB Calls:{" "}
          <span className="ml-1 text-red-500">{remainingQuota}</span>
        </span>
        <div className="flex gap-2">
          {!loading && companies.length === 0 && (
            <button 
              onClick={retryFetch}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          )}
          {/* Debug button - remove in production */}
          <button 
            onClick={resetDailyQuota}
            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs"
            title="Reset daily quota"
          >
            🔄
          </button>
        </div>
      </h3>

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
              onAdd={handleAddCompany}
              onCancel={handleCancelCompany}
            />
          );
        })
      ) : (
        <div className="text-center p-4">
          <p className="text-xs text-gray-400 mb-2">
            🚫 No companies available for today.
          </p>
          <button 
            onClick={retryFetch}
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