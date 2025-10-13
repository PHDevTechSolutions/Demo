"use client";

import React, { useEffect, useState } from "react";
import {
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiMinusCircle,
  FiChevronDown,
  FiChevronUp,
  FiUsers,
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

const Card: React.FC<{ filteredAccounts?: Post[]; userDetails: UserDetails }> = ({
  filteredAccounts,
  userDetails,
}) => {
  const [touchbaseCalls, setTouchbaseCalls] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [tsmList, setTsmList] = useState<any[]>([]);
  const [agentList, setAgentList] = useState<any[]>([]);
  const [openTSM, setOpenTSM] = useState<Record<string, boolean>>({});

  // ✅ ADD: states for toggling company lists
  const [openSuccessful, setOpenSuccessful] = useState(false);
  const [openUnsuccessful, setOpenUnsuccessful] = useState(false);
  const [openNoStatus, setOpenNoStatus] = useState(false);

  // ✅ Fetch TSA (agents)
  useEffect(() => {
    const fetchTSA = async () => {
      try {
        let url = "";
        if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
          url = `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Manager" && userDetails.ReferenceID) {
          url = `/api/fetchtsadata?Role=Territory Sales Associate&manager=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Super Admin") {
          url = `/api/fetchtsadata?Role=Territory Sales Associate`;
        } else return;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch TSA");
        const data = await res.json();
        setAgentList(data);
      } catch (err) {
        console.error("Error fetching TSA:", err);
      }
    };
    fetchTSA();
  }, [userDetails.ReferenceID, userDetails.Role]);

  // ✅ Fetch TSM list
  useEffect(() => {
    const fetchTSM = async () => {
      try {
        let url = "";
        if (userDetails.Role === "Manager" && userDetails.ReferenceID) {
          url = `/api/fetchtsadata?Role=Territory Sales Manager&manager=${userDetails.ReferenceID}`;
        } else if (userDetails.Role === "Super Admin") {
          url = `/api/fetchtsadata?Role=Territory Sales Manager`;
        } else if (userDetails.Role === "Territory Sales Manager") {
          url = `/api/fetchtsadata?Role=Territory Sales Manager&tsm=${userDetails.ReferenceID}`;
        } else return;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch TSM");
        const data = await res.json();
        setTsmList(data);
      } catch (err) {
        console.error("Error fetching TSM:", err);
      }
    };
    fetchTSM();
  }, [userDetails.ReferenceID, userDetails.Role]);

  // ✅ Fetch call data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filteredAccounts, userDetails]);

  // ✅ Filtering logic
  // ✅ Filtering logic (smarter TSA fallback)
  const filteredTouchbaseCalls = touchbaseCalls.filter((call) => {
    if (userDetails.Role === "Territory Sales Associate") {
      // Show only their records if match exists
      if (call.referenceid) {
        return call.referenceid === userDetails.ReferenceID;
      }
      // Fallback: if no referenceid field, still show (avoid empty view)
      return true;
    } else if (userDetails.Role === "Territory Sales Manager") {
      return call.tsm === userDetails.ReferenceID;
    } else if (userDetails.Role === "Manager") {
      // Managers can see all TSM data already grouped
      return true;
    }
    return true;
  });


  // ✅ Company groupings
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

  const successfulCount = successfulCompanies.length;
  const unsuccessfulCount = unsuccessfulCompanies.length;
  const noStatusCount = noStatusCompanies.length;
  const totalTouchbaseCalls = successfulCount + unsuccessfulCount + noStatusCount;

  const headerLabel =
    filteredTouchbaseCalls.length === 0
      ? "Outbound Call - Touchbase (All data over time, no record for today)"
      : "Outbound Call - Touchbase";

  // ✅ Toggle function per TSM
  const toggleTSM = (id: string) => {
    setOpenTSM((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="bg-white shadow-md rounded-lg p-6 select-none space-y-6">
      {/* 🔹 Call Summary */}
      <h2 className="text-sm font-bold text-gray-800 mb-4">{headerLabel}</h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-yellow-100 rounded-lg p-4 shadow flex items-center gap-3">
          <FiPhone className="text-yellow-600 text-3xl" />
          <div>
            <p className="text-xs text-yellow-700 font-semibold">Total Calls</p>
            <p className="text-2xl font-bold text-yellow-800">{totalTouchbaseCalls}</p>
          </div>
        </div>
        <div className="bg-green-100 rounded-lg p-4 shadow flex items-center gap-3">
          <FiCheckCircle className="text-green-600 text-3xl" />
          <div>
            <p className="text-xs text-green-700 font-semibold">Successful</p>
            <p className="text-2xl font-bold text-green-800">{successfulCount}</p>
          </div>
        </div>
        <div className="bg-red-100 rounded-lg p-4 shadow flex items-center gap-3">
          <FiXCircle className="text-red-600 text-3xl" />
          <div>
            <p className="text-xs text-red-700 font-semibold">Unsuccessful</p>
            <p className="text-2xl font-bold text-red-800">{unsuccessfulCount}</p>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 shadow flex items-center gap-3">
          <FiMinusCircle className="text-gray-600 text-3xl" />
          <div>
            <p className="text-xs text-gray-700 font-semibold">No Status</p>
            <p className="text-2xl font-bold text-gray-800">{noStatusCount}</p>
          </div>
        </div>
      </div>

      {/* 🔹 Manager / TSM Summary */}
      {(userDetails.Role === "Manager" || userDetails.Role === "Territory Sales Manager") && (
        <div className="space-y-6">
          {userDetails.Role === "Manager" && (
            <div className="bg-indigo-50 p-4 rounded-lg shadow border">
              <h3 className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-3">
                <FiUsers /> Territory Sales Managers ({tsmList.length})
              </h3>

              {tsmList.length > 0 ? (
                <div className="space-y-2">
                  {tsmList.map((tsm) => (
                    <div key={tsm.ReferenceID} className="bg-white rounded-md shadow border">
                      <button
                        onClick={() => toggleTSM(tsm.ReferenceID)}
                        className="w-full flex justify-between items-center px-4 py-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <span>{tsm.Firstname} {tsm.Lastname}</span>
                        {openTSM[tsm.ReferenceID] ? <FiChevronUp /> : <FiChevronDown />}
                      </button>

                      {/* Agents under this TSM */}
                      {openTSM[tsm.ReferenceID] && (
                        <div className="p-3 border-t bg-gray-50 space-y-2">
                          {agentList
                            .filter((agent) => agent.TSM === tsm.ReferenceID)
                            .map((agent) => {
                              const agentCalls = touchbaseCalls.filter(
                                (c) => c.referenceid === agent.ReferenceID
                              );
                              const success = agentCalls.filter(
                                (c) => c.callstatus === "Successful"
                              ).length;
                              const fail = agentCalls.filter(
                                (c) => c.callstatus === "Unsuccessful"
                              ).length;
                              const noStatus = agentCalls.filter(
                                (c) =>
                                  !c.callstatus ||
                                  (c.callstatus !== "Successful" &&
                                    c.callstatus !== "Unsuccessful")
                              ).length;

                              return (
                                <div
                                  key={agent.ReferenceID}
                                  className="flex justify-between items-center p-2 text-xs capitalize"
                                >
                                  <span className="font-medium text-gray-700">
                                    {agent.Firstname} {agent.Lastname}
                                  </span>
                                  <div className="flex gap-3 text-[11px]">
                                    <span className="text-green-700">✅ {success}</span>
                                    <span className="text-red-700">❌ {fail}</span>
                                    <span className="text-gray-700">➖ {noStatus}</span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No TSM assigned</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 🔹 Company Lists */}
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
              <ul className="list-disc list-inside text-xs text-green-800 max-h-32 uppercase overflow-y-auto mt-2">
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
              <ul className="list-disc list-inside text-xs text-red-800 max-h-32 uppercase overflow-y-auto mt-2">
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
              <ul className="list-disc list-inside text-xs text-gray-600 max-h-32 uppercase overflow-y-auto mt-2">
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
