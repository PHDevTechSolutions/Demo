"use client";

import React, { useEffect, useState } from "react";
import {
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiMinusCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

interface Post {
  companyname: string;
  source: string;
  callstatus?: string;
  referenceid?: string;
  startdate?: string;
  tsm?: string;
  typeactivity: string;
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
  const [loading, setLoading] = useState(true);
  const [totalLoaded, setTotalLoaded] = useState(false);

  const [openSuccessful, setOpenSuccessful] = useState(true);
  const [openUnsuccessful, setOpenUnsuccessful] = useState(true);
  const [openNoStatus, setOpenNoStatus] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTotalLoaded(false);

        let calls: Post[] = [];
        if (filteredAccounts && filteredAccounts.length > 0) {
          calls = filteredAccounts;
        } else {
          const res = await fetch("/api/ModuleSales/Dashboard/FetchCard");
          if (!res.ok) throw new Error("Failed to fetch progress");
          const json = await res.json();
          calls = Array.isArray(json) ? json : json.data || [];
        }

        const outboundTouchbaseCalls = calls.filter(
          (item) =>
            item.typeactivity === "Outbound calls" &&
            item.source === "Outbound - Touchbase"
        );
        setTouchbaseCalls(outboundTouchbaseCalls);
        setTotalLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setTotalLoaded(true);
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

  const successfulCompanies = filteredTouchbaseCalls.filter(
    (item) => item.callstatus === "Successful"
  );
  const unsuccessfulCompanies = filteredTouchbaseCalls.filter(
    (item) => item.callstatus === "Unsuccessful"
  );
  const noStatusCompanies = filteredTouchbaseCalls.filter(
    (item) =>
      !item.callstatus ||
      (item.callstatus !== "Successful" && item.callstatus !== "Unsuccessful")
  );

  const successfulCount = filteredTouchbaseCalls.length > 0
    ? filteredTouchbaseCalls.filter(item => item.callstatus === "Successful").length
    : 0;

  const unsuccessfulCount = filteredTouchbaseCalls.length > 0
    ? filteredTouchbaseCalls.filter(item => item.callstatus === "Unsuccessful").length
    : 0;

  const noStatusCount = filteredTouchbaseCalls.length > 0
    ? filteredTouchbaseCalls.filter(item => !item.callstatus || (item.callstatus !== "Successful" && item.callstatus !== "Unsuccessful")).length
    : 0;

  const totalTouchbaseCalls = filteredTouchbaseCalls.length > 0
    ? successfulCount + unsuccessfulCount + noStatusCount
    : 0;

  if (userDetails?.Role === "Territory Sales Manager") return null;

  let headerLabel = "Outbound Call - Touchbase";
  if (filteredTouchbaseCalls.length === 0) {
    headerLabel = "Outbound Call - Touchbase (All data over time, no record for today)";
  }

  return (
    <section className="bg-white shadow-md rounded-lg p-6 select-none">
      <h2 className="text-sm font-bold text-gray-800 mb-4">
        {headerLabel}
      </h2>

      <div className="grid grid-cols-4 gap-4 mb-4">
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
        <div className="bg-gray-100 rounded-lg p-4 shadow flex items-center gap-3">
          <FiMinusCircle className="text-gray-600 text-3xl" />
          <div>
            <p className="text-xs text-gray-700 font-semibold">No Status</p>
            <p className="text-2xl font-bold text-gray-800">
              {noStatusCount}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {successfulCompanies.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setOpenSuccessful(!openSuccessful)}
            >
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-600" />
                <h3 className="text-xs font-bold text-green-700">
                  Successful Companies ({successfulCompanies.length})
                </h3>
              </div>
              {openSuccessful ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {openSuccessful && (
              <ul className="list-disc list-inside text-xs text-green-800 max-h-32 overflow-y-auto mt-2">
                {successfulCompanies.map((item, idx) => (
                  <li key={idx}>{item.companyname}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {unsuccessfulCompanies.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4 border">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setOpenUnsuccessful(!openUnsuccessful)}
            >
              <div className="flex items-center gap-2">
                <FiXCircle className="text-red-600" />
                <h3 className="text-xs font-bold text-red-700">
                  Unsuccessful Companies ({unsuccessfulCompanies.length})
                </h3>
              </div>
              {openUnsuccessful ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {openUnsuccessful && (
              <ul className="list-disc list-inside text-xs text-red-800 max-h-32 overflow-y-auto mt-2">
                {unsuccessfulCompanies.map((item, idx) => (
                  <li key={idx}>{item.companyname}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {noStatusCompanies.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setOpenNoStatus(!openNoStatus)}
            >
              <div className="flex items-center gap-2">
                <FiMinusCircle className="text-gray-600" />
                <h3 className="text-xs font-bold text-gray-700">
                  Companies with No Status ({noStatusCompanies.length})
                </h3>
              </div>
              {openNoStatus ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {openNoStatus && (
              <ul className="list-disc list-inside text-xs text-gray-600 max-h-32 overflow-y-auto mt-2">
                {noStatusCompanies.map((item, idx) => (
                  <li key={idx}>{item.companyname}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Card;
