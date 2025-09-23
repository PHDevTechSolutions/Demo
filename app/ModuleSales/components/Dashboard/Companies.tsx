"use client";

import React, { useEffect, useState } from "react";
import { FiDatabase, FiEye, FiEyeOff } from "react-icons/fi";

interface Post {
  companyname: string;
  source: string;
  callstatus?: string;
  referenceid?: string;
  startdate?: string;
  tsm?: string;
  typeactivity: string;
  status: string; // ✅ bagong field
  typeclient: string; // ✅ bagong field
}

interface UserDetails {
  ReferenceID: string;
  Role: string;
}

interface SourceProps {
  filteredAccounts?: Post[];
  userDetails: UserDetails;
}

const Card: React.FC<SourceProps> = ({ filteredAccounts, userDetails }) => {
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});
  const [typeClientBreakdown, setTypeClientBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showTotal, setShowTotal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [totalLoaded, setTotalLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTotalLoaded(false);

        const companyRes = await fetch("/api/ModuleSales/Dashboard/FetchDatabase");
        if (!companyRes.ok) throw new Error("Failed to fetch companies");
        const companyJson = await companyRes.json();
        let companiesArray: Post[] = Array.isArray(companyJson)
          ? companyJson
          : companyJson.data || [];

        // ✅ Role-based filtering
        if (userDetails?.Role === "Territory Sales Associate") {
          companiesArray = companiesArray.filter(
            (company) => company.referenceid === userDetails.ReferenceID
          );
        } else if (userDetails?.Role === "Territory Sales Manager") {
          companiesArray = companiesArray.filter(
            (company) => company.tsm === userDetails.ReferenceID
          );
        }

        setTotalCompanies(companiesArray.length || 0);

        // ✅ Breakdown by status
        const statusCount = companiesArray.reduce((acc, curr) => {
          const key = curr.status || "Unknown";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setStatusBreakdown(statusCount);

        // ✅ Breakdown by typeclient
        const typeClientCount = companiesArray.reduce((acc, curr) => {
          const key = curr.typeclient || "Unknown";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setTypeClientBreakdown(typeClientCount);

        setTotalLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setTotalCompanies(0);
        setStatusBreakdown({});
        setTypeClientBreakdown({});
        setTotalLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filteredAccounts, userDetails]);

  if (userDetails?.Role === "Territory Sales Manager" || userDetails?.Role === "Manager")
    return null;

  return (
    <section className="bg-white select-none">
      <div className="flex flex-col gap-4">
        {/* 🔹 Total Companies Card */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 md:w-96">
            <div className="bg-blue-100 rounded-lg p-4 shadow flex items-center justify-between overflow-hidden relative">
              <div className="flex items-center gap-3">
                <FiDatabase className="text-blue-600 text-3xl" />
                <div>
                  <p className="text-xs text-blue-700 font-semibold">
                    Total Companies
                  </p>
                  <div
                    className={`text-2xl font-bold text-blue-800 transition-all duration-700 ease-out ${
                      totalLoaded
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-10"
                    }`}
                  >
                    {showTotal && totalLoaded ? totalCompanies : "***"}
                  </div>
                </div>
              </div>
              <button
                className="p-2 rounded-full hover:bg-blue-200 transition flex items-center gap-1"
                onClick={() => setShowTotal(!showTotal)}
                title={showTotal ? "Hide Total" : "Show Total"}
              >
                <span className="text-xs underline text-blue-600">Show</span>
                {showTotal ? (
                  <FiEyeOff className="text-blue-600 text-xl" />
                ) : (
                  <FiEye className="text-blue-600 text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 🔹 More Info Button */}
        {showTotal && totalLoaded && (
          <div className="flex justify-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "Hide Info" : "More Info"}
            </button>
          </div>
        )}

        {/* 🔹 Breakdown Section */}
        {showMore && (
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Per Status */}
            <div className="bg-green-100 rounded-lg p-4 shadow">
              <h3 className="text-sm font-semibold text-green-700 mb-2">Breakdown by Status</h3>
              <ul className="text-sm text-green-900 space-y-1">
                {Object.entries(statusBreakdown).map(([status, count]) => {
                  const percent = totalCompanies
                    ? ((count / totalCompanies) * 100).toFixed(1)
                    : "0";
                  return (
                    <li key={status} className="flex justify-between">
                      <span>{status}</span>
                      <span className="font-bold">{count} ({percent}%)</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Per TypeClient */}
            <div className="bg-purple-100 rounded-lg p-4 shadow">
              <h3 className="text-sm font-semibold text-purple-700 mb-2">Breakdown by TypeClient</h3>
              <ul className="text-sm text-purple-900 space-y-1">
                {Object.entries(typeClientBreakdown).map(([type, count]) => {
                  const percent = totalCompanies
                    ? ((count / totalCompanies) * 100).toFixed(1)
                    : "0";
                  return (
                    <li key={type} className="flex justify-between">
                      <span>{type}</span>
                      <span className="font-bold">{count} ({percent}%)</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Card;
