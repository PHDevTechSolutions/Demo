"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CompaniesCard from "./Card/CompaniesCard";
import SkipModal from "./Modal/Skip";
import { GoSkip } from 'react-icons/go';

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

const isCompanyDue = (comp: Company): boolean => {
  const lastAddedRaw = comp.id
    ? localStorage.getItem(`lastAdded_${comp.id}`)
    : null;
  if (!lastAddedRaw) return true;

  const lastAdded = new Date(lastAddedRaw);
  const today = new Date();
  const diffDays = Math.floor(
    (+today - +lastAdded) / (1000 * 60 * 60 * 24)
  );

  if (comp.typeclient === "Top 50") return diffDays >= 10;
  if (comp.typeclient === "Next 30" || comp.typeclient === "Balance 20")
    return diffDays >= 30;
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
  // 🆕 Skip modal state
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeSkip, setActiveSkip] = useState<{ startdate: string; enddate: string } | null>(null);

  // Move fetchCompanies outside useEffect so it can be called elsewhere
  const fetchCompanies = async () => {
    if (!userDetails?.ReferenceID) return;

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const todayStr = today.toISOString().split("T")[0];

    // ✅ Skip kapag Sunday
    if (dayOfWeek === 0) {
      setIsSunday(true);
      setCompanies([]);
      setRemainingQuota(0);
      setLoading(false);
      toast.info("No daily quota generated on Sundays.", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    try {
      setLoading(true);

      // ✅ Fetch today’s quota from server
      const quotaRes = await fetch(
        `/api/ModuleSales/Companies/DailyQuota?referenceid=${userDetails.ReferenceID}&date=${todayStr}`
      );
      const quotaData = await quotaRes.json();

      if (quotaData?.error) throw new Error(quotaData.error);

      // 👉 If may existing todayRow → gamitin yun, wag na mag-generate ulit
      if (Array.isArray(quotaData.companies) && quotaData.companies.length > 0) {
        setCompanies(quotaData.companies);
        setRemainingQuota(quotaData.remaining_quota ?? 35);
        return;
      }

      // ✅ Compute today's quota: kahapon naiwan + bagong 35
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let carryOver = 0;

      // Fetch kahapon’s quota para malaman kung ilan naiwan
      const yestRes = await fetch(
        `/api/ModuleSales/Companies/DailyQuota?referenceid=${userDetails.ReferenceID}&date=${yesterdayStr}`
      );
      const yestData = await yestRes.json();
      if (yestData && typeof yestData.remaining_quota === "number") {
        carryOver = yestData.remaining_quota;
      }

      // Today’s total = bagong 35 + carryover
      const todayQuota = 35 + carryOver;


      // ✅ Fetch accounts
      const accountsRes = await fetch(
        `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}`
      );
      const accounts = await accountsRes.json();

      let companiesData: Company[] = [];
      if (Array.isArray(accounts)) companiesData = accounts;
      else if (Array.isArray(accounts?.data)) companiesData = accounts.data;
      else if (Array.isArray(accounts?.companies)) companiesData = accounts.companies;

      if (!companiesData.length) {
        setCompanies([]);
        setRemainingQuota(todayQuota);
        return;
      }

      const eligibleCompanies = companiesData.filter(isCompanyDue);

      const top50 = eligibleCompanies.filter((c) => c.typeclient === "Top 50");
      const next30 = eligibleCompanies.filter((c) => c.typeclient === "Next 30");
      const balance20 = eligibleCompanies.filter((c) => c.typeclient === "Balance 20");
      const tsa = eligibleCompanies.filter((c) => c.typeclient === "TSA Client");
      const csr = eligibleCompanies.filter((c) => c.typeclient === "CSR Client");

      const pickRandom = (arr: Company[], count: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };

      // 🎯 Priority allocation
      let finalCompanies: Company[] = [];
      let remaining = todayQuota;

      const allocate = (source: Company[], count: number) => {
        const needed = Math.min(count, remaining, source.length);
        const picked = pickRandom(source, needed);
        finalCompanies = [...finalCompanies, ...picked];
        remaining -= picked.length;
      };

      // Fixed distribution (with fallback)
      allocate(top50, 15);
      if (remaining > 0) allocate(next30, 10);
      if (remaining > 0) allocate(balance20, 5);
      if (remaining > 0) allocate(csr, 5); // bago: CSR Client fallback
      if (remaining > 0) allocate(tsa, 5);

      // 🧮 Kung kulang pa rin → fill mula sa lahat ng natira
      if (remaining > 0) {
        const pickedIds = new Set(finalCompanies.map((c) => c.id));
        const fillers = eligibleCompanies
          .filter((c) => !pickedIds.has(c.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, remaining);
        finalCompanies = [...finalCompanies, ...fillers];
        remaining -= fillers.length;
      }

      // ✅ Save new daily quota to server
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
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompanies([]);
      setRemainingQuota(35);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userDetails?.ReferenceID]);

  useEffect(() => {
    if (!loading && companies.length !== remainingQuota) {
    }
  }, [loading, companies, remainingQuota]);

  const removeCompany = async (comp: Company, action: "add" | "cancel") => {
    if (!userDetails?.ReferenceID) return;

    // 1. tanggalin muna yung pinili
    let updated = companies.filter((c) => c.id !== comp.id);

    // 2. fetch eligible companies (fresh list)
    const accountsRes = await fetch(
      `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${userDetails.ReferenceID}`
    );
    const accounts = await accountsRes.json();

    let companiesData: Company[] = [];
    if (Array.isArray(accounts)) companiesData = accounts;
    else if (Array.isArray(accounts?.data)) companiesData = accounts.data;
    else if (Array.isArray(accounts?.companies)) companiesData = accounts.companies;

    const eligibleCompanies = companiesData.filter(isCompanyDue);
    const usedIds = new Set(updated.map((c) => c.id));

    // 3. replacement (only if action = cancel)
    if (action === "cancel") {
      let replacements = eligibleCompanies.filter(
        (c) => c.typeclient === comp.typeclient && !usedIds.has(c.id)
      );

      if (replacements.length === 0) {
        replacements = eligibleCompanies.filter((c) => !usedIds.has(c.id));
      }

      if (replacements.length > 0) {
        const randomPick =
          replacements[Math.floor(Math.random() * replacements.length)];
        updated.push(randomPick);
      }
    }

    // 4. deduplicate just in case
    const uniqueCompanies = updated.filter(
      (c, idx, self) => idx === self.findIndex((x) => x.id === c.id)
    );

    // 5. compute new quota (if add = subtract, if cancel = same quota)
    const newQuota =
      action === "add"
        ? Math.max(remainingQuota - 1, 0)
        : remainingQuota;

    setCompanies(uniqueCompanies);
    setRemainingQuota(newQuota);

    // 6. sync to server
    await fetch("/api/ModuleSales/Companies/DailyQuota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceid: userDetails.ReferenceID,
        date: new Date().toISOString().split("T")[0],
        companies: uniqueCompanies,
        remaining_quota: newQuota,
      }),
    });
  };


  const handleAddCompany = (comp: Company) => {
    if (showSkipModal) {
      toast.warn("🚫 Skip period is active. Cannot add companies.");
      return;
    }

    handleSubmit(comp, false);

    // sync with backend
    removeCompany(comp, "add");

    if (comp.id) {
      localStorage.setItem(`lastAdded_${comp.id}`, new Date().toISOString());
    }
  };


  const handleSkipSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
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
      await fetchCompanies(); // 🔄 Refresh div
    } catch (err: any) {
      toast.error(err.message || "Failed to submit skip period");
    }
  };

  const handleCancelSkip = async () => {
    if (!activeSkip) return;

    try {
      const res = await fetch("/api/ModuleSales/Companies/SkipQuota", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceid: userDetails?.ReferenceID,
          startdate: activeSkip.startdate,
          enddate: activeSkip.enddate,
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error);

      toast.success("❌ Skip period cancelled!");
      setActiveSkip(null);

      // 🔄 Refresh companies list
      await fetchCompanies();
    } catch (err: any) {
      console.error("❌ Cancel skip error:", err);
      toast.error(err.message || "Failed to cancel skip");
    }
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      <h3 className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2">
        <span className="flex items-center">
          <span className="mr-1">🏢</span> OB Calls:{" "}
          <span className="ml-1 text-red-500">{remainingQuota}</span>
        </span>

        {/* 🆕 Skip Button */}
        <button
          onClick={() => setShowSkipModal(true)}
          className="px-2 py-1 bg-yellow-500 text-white rounded text-[10px] hover:bg-yellow-600 flex items-center gap-1"
        >
          <GoSkip size={15} /> Skip Generate
        </button>
      </h3>

      {/* 🆕 Active Skip Display (10px margin below button) */}
      {activeSkip && (
        <div className="text-[10px] text-red-600 mt-1 flex items-center justify-between">
          <span>
            🚫 Skipping from {activeSkip.startdate} → {activeSkip.enddate}
          </span>
          <button
            onClick={handleCancelSkip}
            className="ml-2 text-blue-600 underline hover:text-blue-800"
          >
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
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
              onCancel={(c) => removeCompany(c, "cancel")}
            />
          );
        })
      ) : isSunday ? (
        <p className="text-xs text-gray-400 text-center">
          🚫 No daily quota generated on Sundays.
        </p>
      ) : (
        <p className="text-xs text-gray-400">No companies found.</p>
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
