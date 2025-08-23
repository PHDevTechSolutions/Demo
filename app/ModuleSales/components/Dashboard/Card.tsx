"use client";

import React, { useEffect, useState } from "react";
import {
  FiDatabase,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiEye,
  FiDownload,
} from "react-icons/fi";

interface Post {
  companyname: string;
  source: string;
  callstatus?: string;
  referenceid?: string;
  startdate?: string;
  tsm?: string;
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
  const [touchbaseCalls, setTouchbaseCalls] = useState<Post[]>([]);
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let calls: Post[] = [];
        if (filteredAccounts && filteredAccounts.length > 0) {
          calls = filteredAccounts;
        } else {
          const res = await fetch(
            "/api/ModuleSales/Task/DailyActivity/FetchProgress"
          );
          if (!res.ok) throw new Error("Failed to fetch progress");
          const json = await res.json();
          calls = Array.isArray(json) ? json : json.data || [];
        }

        const outboundTouchbaseCalls = calls.filter(
          (item) => item.source === "Outbound - Touchbase"
        );
        setTouchbaseCalls(outboundTouchbaseCalls);

        const companyRes = await fetch(
          "/api/ModuleSales/UserManagement/CompanyAccounts/FetchAccount"
        );
        if (!companyRes.ok) throw new Error("Failed to fetch companies");
        const companyJson = await companyRes.json();
        let companiesArray: Post[] = Array.isArray(companyJson)
          ? companyJson
          : companyJson.data || [];

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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filteredAccounts, userDetails]);

  const filteredTouchbaseCalls = touchbaseCalls.filter((call) => {
    if (userDetails?.Role === "Territory Sales Associate") {
      return call.referenceid === userDetails.ReferenceID;
    } else if (userDetails?.Role === "Territory Sales Manager") {
      return call.tsm === userDetails.ReferenceID;
    }
    return true;
  });

  const totalTouchbaseCalls = filteredTouchbaseCalls.length;
  const successfulCount = filteredTouchbaseCalls.filter(
    (item) => item.callstatus === "Successful"
  ).length;
  const unsuccessfulCount = filteredTouchbaseCalls.filter(
    (item) => item.callstatus === "Unsuccessful"
  ).length;

  const missingStatusCompanies = filteredTouchbaseCalls.filter(
    (item) =>
      !item.callstatus ||
      (item.callstatus !== "Successful" && item.callstatus !== "Unsuccessful")
  );

  const exportToCSV = () => {
    if (missingStatusCompanies.length === 0) return;
    const headers = ["Company Name", "Call Status"];
    const rows = missingStatusCompanies.map((item) => [
      item.companyname,
      item.callstatus || "No Status",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "missing_status_companies.csv";
    link.click();
  };

  if (userDetails?.Role === "Territory Sales Manager") return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);

    // Use UTC getters instead of local ones to prevent timezone shifting.
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // if hour is 0, display as 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    // Use toLocaleDateString with timeZone 'UTC' to format the date portion
    const formattedDateStr = date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Return combined date and time string
    return `${formattedDateStr} ${hours}:${minutesStr} ${ampm}`;
  };

  return (
    <section className="bg-white shadow-md rounded-lg p-6 select-none">
      {loading ? (
        <p className="text-gray-500 text-xs">Loading...</p>
      ) : (
        <>
          <h2 className="text-sm font-bold text-gray-800 mb-4">
            Outbound Call - Touchbase
          </h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-yellow-100 rounded-lg p-4 shadow flex items-center gap-3">
              <FiPhone className="text-yellow-600 text-3xl" />
              <div>
                <p className="text-xs text-yellow-700 font-semibold">
                  Total Calls
                </p>
                <p className="text-2xl font-bold text-yellow-800">
                  {totalTouchbaseCalls}
                </p>
              </div>
            </div>
            <div className="bg-green-100 rounded-lg p-4 shadow flex items-center gap-3">
              <FiCheckCircle className="text-green-600 text-3xl" />
              <div>
                <p className="text-xs text-green-700 font-semibold">
                  Successful
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {successfulCount}
                </p>
              </div>
            </div>
            <div className="bg-red-100 rounded-lg p-4 shadow flex items-center gap-3">
              <FiXCircle className="text-red-600 text-3xl" />
              <div>
                <p className="text-xs text-red-700 font-semibold">
                  Unsuccessful
                </p>
                <p className="text-2xl font-bold text-red-800">
                  {unsuccessfulCount}
                </p>
              </div>
            </div>
          </div>

          {/* Collapsible Missing Status Section */}
          <div className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-t-lg">
              <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                <FiAlertTriangle className="text-orange-500" />
                Companies without Call Status (Successful/Unsuccessful)
              </h2>
              <div className="flex gap-2">
                {missingStatusCompanies.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
                  >
                    <FiDownload /> Export
                  </button>
                )}
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-700 text-white rounded-md shadow hover:bg-gray-800"
                >
                  <FiEye /> {showTable ? "Hide" : "View"}
                </button>
              </div>
            </div>

            {showTable && (
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-2">
                  The following companies have no <b>Successful</b> or{" "}
                  <b>Unsuccessful</b> call status.
                </p>
                {missingStatusCompanies.length > 0 ? (
                  <div className="overflow-y-auto max-h-60 border rounded-lg">
                    <table className="w-full text-xs text-left text-gray-600">
                      <thead className="bg-gray-100 text-gray-700 font-semibold">
                        <tr>
                          <th className="px-4 py-2">Company Name</th>
                          <th className="px-4 py-2">Call Status</th>
                          <th className="px-4 py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {missingStatusCompanies.map((item, idx) => (
                          <tr
                            key={idx}
                            className="border-t hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-2">{item.companyname}</td>
                            <td className="px-4 py-2 italic text-gray-400">
                              {item.callstatus || "No Status"}
                            </td>
                            <td className="px-4 py-2">
                              {item.startdate ? formatDate(new Date(item.startdate).getTime()) : "—"}
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-green-600">
                    ✅ All companies have status.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Total Companies */}
          <h2 className="text-sm font-bold text-gray-800 mt-6 mb-2">
            Official Total Companies
          </h2>
          <div className="bg-blue-100 rounded-lg p-4 shadow flex items-center gap-3">
            <FiDatabase className="text-blue-600 text-3xl" />
            <div>
              <p className="text-xs text-blue-700 font-semibold">
                Total Companies
              </p>
              <p className="text-2xl font-bold text-blue-800">{totalCompanies}</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Card;
