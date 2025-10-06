"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CompaniesCard from "./Card/CompaniesCard";
import SkipModal from "./Modal/Skip";
import { GoSkip } from "react-icons/go";

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

// Simplified company eligibility check (no localStorage)
const isCompanyDue = (comp: Company): boolean => {
  // Simple rule: all companies are eligible
  return true;
};

const Companies: React.FC<CompaniesProps> = ({
  expandedIdx,
  setExpandedIdx,
  handleSubmit,
  userDetails,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [remainingQuota, setRemainingQuota] = useState<number>(0);
  const [isSunday, setIsSunday] = useState(false);

  const [showSkipModal, setShowSkipModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeSkip, setActiveSkip] = useState<{ startdate: string; enddate: string } | null>(null);

  const checkActiveSkip = async () => {
    if (!userDetails?.ReferenceID) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const res = await fetch(
      `/api/ModuleSales/Companies/DailyQuota?referenceid=${userDetails.ReferenceID}&date=${todayStr}`
    );
    const data = await res.json();

    if (data.skipped) {
      setActiveSkip({
        startdate: data?.startdate ?? "N/A",
        enddate: data?.enddate ?? "N/A",
      });
      setCompanies([]);
      setRemainingQuota(0);
      toast.info("🚫 Skip period is active today.");
      return true;
    } else {
      setActiveSkip(null);
      return false;
    }
  };

  const fetchCompanies = async () => {
    if (!userDetails?.ReferenceID) return;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const dayOfWeek = today.getDay(); // 0 = Sunday

    if (dayOfWeek === 0) {
      setIsSunday(true);
      setCompanies([]);
      setRemainingQuota(0);
      toast.info("No daily quota generated on Sundays.");
      return;
    }

    try {
      setLoading(true);

      const isSkipped = await checkActiveSkip();
      if (isSkipped) {
        setLoading(false);
        return;
      }

      const quotaRes = await fetch(
        `/api/ModuleSales/Companies/DailyQuota?referenceid=${userDetails.ReferenceID}&date=${todayStr}`
      );
      const quotaData = await quotaRes.json();

      if (quotaData?.error) throw new Error(quotaData.error);

      if (quotaData.skipped) {
        setCompanies([]);
        setRemainingQuota(0);
        setActiveSkip({
          startdate: quotaData.startdate ?? "N/A",
          enddate: quotaData.enddate ?? "N/A",
        });
        toast.info("🚫 Skipped generation for today.");
        return;
      }

      if (Array.isArray(quotaData.companies) && quotaData.companies.length > 0) {
        setCompanies(quotaData.companies);
        setRemainingQuota(quotaData.remaining_quota ?? 35);
        return;
      }

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const yestRes = await fetch(
        `/api/ModuleSales/Companies/DailyQuota?referenceid=${userDetails.ReferenceID}&date=${yesterdayStr}`
      );
      const yestData = await yestRes.json();

      const carryOver = yestData?.remaining_quota ?? 0;
      const todayQuota = 35 + carryOver;

      const accountsRes = await fetch(
        `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}`
      );
      const accounts = await accountsRes.json();

      const companiesData: Company[] = Array.isArray(accounts)
        ? accounts
        : accounts?.data || accounts?.companies || [];

      const eligibleCompanies = companiesData.filter(isCompanyDue);

      if (!eligibleCompanies.length) {
        setCompanies([]);
        setRemainingQuota(todayQuota);
        return;
      }

      const pickRandom = (arr: Company[], count: number) =>
        [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

      let finalCompanies: Company[] = [];
      let remaining = todayQuota;

      const allocate = (source: Company[], count: number) => {
        const picked = pickRandom(source, Math.min(count, remaining, source.length));
        finalCompanies.push(...picked);
        remaining -= picked.length;
      };

      allocate(eligibleCompanies.filter((c) => c.typeclient === "Top 50"), 15);
      allocate(eligibleCompanies.filter((c) => c.typeclient === "Next 30"), 10);
      allocate(eligibleCompanies.filter((c) => c.typeclient === "Balance 20"), 5);
      allocate(eligibleCompanies.filter((c) => c.typeclient === "CSR Client"), 3);
      allocate(eligibleCompanies.filter((c) => c.typeclient === "TSA Client"), 2);

      if (remaining > 0) {
        const pickedIds = new Set(finalCompanies.map((c) => c.id));
        const fillers = eligibleCompanies
          .filter((c) => !pickedIds.has(c.id))
          .slice(0, remaining);
        finalCompanies.push(...fillers);
      }

      await fetch("/api/ModuleSales/Companies/DailyQuota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceid: userDetails.ReferenceID,
          date: todayStr,
          companies: finalCompanies,
          remaining_quota: todayQuota,
        }),
      });

      setCompanies(finalCompanies);
      setRemainingQuota(todayQuota);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
      setRemainingQuota(35);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  const handleAddCompany = async (comp: Company) => {
    if (activeSkip) {
      toast.warn("🚫 Cannot add companies during skip period.");
      return;
    }

    // Call parent handler
    handleSubmit(comp, false);

    // Update local state immediately
    setCompanies((prev) => prev.filter((c) => c.id !== comp.id));
    setRemainingQuota((prev) => Math.max(prev - 1, 0));

    // Update Supabase daily_quota
    if (!userDetails?.ReferenceID) return;

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/ModuleSales/Companies/DailyQuota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceid: userDetails.ReferenceID,
          date: todayStr,
          companies: companies.filter((c) => c.id !== comp.id), // remove used
          remaining_quota: Math.max(remainingQuota - 1, 0),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to update quota");
    } catch (err: any) {
      console.error("❌ Failed to update quota:", err);
    }
  };

  const handleSkipSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    try {
      const payload = {
        startdate: startDate,
        enddate: endDate,
        status: "skip",
        referenceid: userDetails?.ReferenceID,
      };

      const res = await fetch("/api/ModuleSales/Companies/SkipQuota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error);

      toast.success("✅ Skip period submitted!");
      setShowSkipModal(false);
      setStartDate("");
      setEndDate("");
      await checkActiveSkip();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit skip period");
    }
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2">
        <span className="flex items-center">
          <span className="mr-1">🏢</span> OB Calls:{" "}
          <span className="ml-1 text-red-500">{remainingQuota}</span>
        </span>

        <button
          onClick={() => setShowSkipModal(true)}
          className="px-2 py-1 bg-yellow-500 text-white rounded text-[10px] hover:bg-yellow-600 flex items-center gap-1"
        >
          <GoSkip size={15} /> Skip Generate
        </button>
      </h3>

      {activeSkip && (
        <div className="bg-red-100 border border-red-400 text-red-700 text-[10px] px-2 py-1 rounded-md mb-2 flex justify-between items-center">
          <span>
            🚫 Active Skip: {activeSkip.startdate} → {activeSkip.enddate}
          </span>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : isSunday ? (
        <p className="text-xs text-gray-400 text-center">
          🚫 No daily quota generated on Sundays
        </p>
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
              onCancel={() => { }}
            />
          );
        })
      ) : (
        <p className="text-xs text-gray-400 text-center">
          {activeSkip
            ? "🚫 Generation skipped during this period"
            : "No companies found"}
        </p>
      )}

      <SkipModal
        show={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        handleSkipSubmit={handleSkipSubmit}
      />
    </div>
  );
};

export default Companies;
