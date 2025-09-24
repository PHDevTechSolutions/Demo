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
  status: string;
  typeclient: string;
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
      <div className="w-full sm:w-96 ml-auto">
        <div className="bg-blue-100 rounded-lg p-4 shadow overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
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

          {/* Breakdown Info */}
          {showTotal && totalLoaded && (
            <div className="mt-4">
              <button
                className="mb-3 px-3 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-xs"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Hide Breakdown" : "Show Breakdown"}
              </button>

              {showMore && (
                <div className="space-y-4">
                  {/* Per Status */}
                  <div>
                    <h3 className="text-xs font-semibold text-green-700 mb-2">
                      Breakdown by Status
                    </h3>
                    <ul className="text-xs text-green-900 space-y-1">
                      {Object.entries(statusBreakdown).map(([status, count]) => {
                        const percent = totalCompanies
                          ? ((count / totalCompanies) * 100).toFixed(1)
                          : "0";
                        return (
                          <li key={status} className="flex justify-between capitalize">
                            <span>{status}</span>
                            <span className="font-bold">
                              {count} ({percent}%)
                            </span>
                          </li>
                        );
                      })}
                      <li className="flex justify-between font-semibold border-t border-green-300 pt-1">
                        <span>Total</span>
                        <span>{totalCompanies}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Per TypeClient */}
                  <div>
                    <h3 className="text-xs font-semibold text-purple-700 mb-2">
                      Breakdown by Type of Client
                    </h3>
                    <ul className="text-xs text-purple-900 space-y-1">
                      {Object.entries(typeClientBreakdown).map(([type, count]) => {
                        const percent = totalCompanies
                          ? ((count / totalCompanies) * 100).toFixed(1)
                          : "0";
                        return (
                          <li key={type} className="flex justify-between">
                            <span>{type}</span>
                            <span className="font-bold">
                              {count} ({percent}%)
                            </span>
                          </li>
                        );
                      })}
                      <li className="flex justify-between font-semibold border-t border-purple-300 pt-1">
                        <span>Total</span>
                        <span>{totalCompanies}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Card;
