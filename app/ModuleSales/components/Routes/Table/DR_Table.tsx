"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCrown, FaRibbon, FaMedal } from "react-icons/fa";
import { IoIosRibbon } from "react-icons/io";

interface Post {
  referenceid: string;
  AgentFirstname: string;
  AgentLastname: string;
  date_created: string;
  source?: string;
  typeactivity?: string;
  callstatus?: string;
  tsm?: string;
}

interface Agent {
  ReferenceID: string;
  AgentFirstname: string;
  AgentLastname: string;
  Successful: number;
  TotalOutbound: number;
  InboundCall: number;
  TotalCalls: number;
  DateCreated: string;
}

interface TSMRank {
  tsm: string;
  totalSuccessful: number;
}

interface TableProps {
  posts: Post[];
}

const Table: React.FC<TableProps> = ({ posts }) => {
  const [groupedUsers, setGroupedUsers] = useState<Agent[]>([]);
  const [tsmRanks, setTsmRanks] = useState<TSMRank[]>([]);
  const [tsmData, setTsmData] = useState<Record<string, { name: string; profilePicture: string }>>({});
  const [agentData, setAgentData] = useState<Record<string, { profilePicture: string }>>({});
  const [totals, setTotals] = useState({
    totalOutbound: 0,
    totalSuccessful: 0,
    totalInbound: 0,
    totalCalls: 0,
  });

  // 🔹 Group agents and compute stats
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    let totalOutbound = 0;
    let totalSuccessful = 0;
    let totalInbound = 0;
    let totalCalls = 0;

    const grouped = posts.reduce((acc, post) => {
      const key = post.referenceid;
      if (!acc[key]) {
        acc[key] = {
          ReferenceID: post.referenceid,
          AgentFirstname: post.AgentFirstname,
          AgentLastname: post.AgentLastname,
          Successful: 0,
          TotalOutbound: 0,
          InboundCall: 0,
          TotalCalls: 0,
          DateCreated: post.date_created,
        };
      }

      if (post.source === "Outbound - Touchbase") {
        acc[key].TotalOutbound++;
        acc[key].TotalCalls++;
        totalOutbound++;
        totalCalls++;
      }

      if (post.typeactivity === "Inbound Call") {
        acc[key].InboundCall++;
        totalInbound++;
      }

      if (post.callstatus === "Successful") {
        acc[key].Successful++;
        totalSuccessful++;
      }

      return acc;
    }, {} as Record<string, Agent>);

    const sorted = Object.values(grouped).sort((a, b) => b.Successful - a.Successful);

    setGroupedUsers(sorted);
    setTotals({ totalOutbound, totalSuccessful, totalInbound, totalCalls });

    // 🔹 Compute TSM leaderboard
    const tsmMap: Record<string, number> = {};
    posts.forEach((post) => {
      if (post.tsm && post.callstatus === "Successful") {
        tsmMap[post.tsm] = (tsmMap[post.tsm] || 0) + 1;
      }
    });

    const tsmSorted = Object.entries(tsmMap)
      .map(([tsm, totalSuccessful]) => ({ tsm, totalSuccessful }))
      .sort((a, b) => b.totalSuccessful - a.totalSuccessful);

    setTsmRanks(tsmSorted);
  }, [posts]);

  // 🔹 Fetch profile pictures for agents
  useEffect(() => {
    if (groupedUsers.length === 0) return;

    const fetchAgents = async () => {
      const uniqueIds = Array.from(new Set(groupedUsers.map((u) => u.ReferenceID)));
      const dataMap: Record<string, { profilePicture: string }> = {};

      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const res = await fetch(`/api/fetchagent?id=${encodeURIComponent(id)}`);
            const data = await res.json();
            dataMap[id] = { profilePicture: data.profilePicture || "/taskflow.png" };
          } catch {
            dataMap[id] = { profilePicture: "/taskflow.png" };
          }
        })
      );

      setAgentData(dataMap);
    };

    fetchAgents();
  }, [groupedUsers]);

  // 🔹 Fetch TSM names
  useEffect(() => {
    const fetchTSMInfo = async () => {
      try {
        const res = await fetch(`/api/tsmrank?Roles=Territory Sales Manager`);
        if (!res.ok) throw new Error("Failed to fetch TSM info");

        const data = await res.json();
        const map: Record<string, { name: string; profilePicture: string }> = {};

        data.forEach((tsm: any) => {
          map[tsm.ReferenceID] = {
            name: `${tsm.Firstname} ${tsm.Lastname}`,
            profilePicture: tsm.profilePicture || "/taskflow.png",
          };
        });

        setTsmData(map);
      } catch (err) {
        console.error("Error fetching TSM info:", err);
      }
    };

    fetchTSMInfo();
  }, []);


  // ✅ Compute max successful for progress bar
  const maxSuccessful =
    groupedUsers.length > 0 ? Math.max(...groupedUsers.map((u) => u.Successful)) : 1;

  // 🔹 Podium
  const renderPodium = () => (
    <div className="flex justify-center gap-6 items-end mb-6">
      {groupedUsers.slice(0, 3).map((agent, i) => {
        const profilePicture = agentData[agent.ReferenceID]?.profilePicture || "/taskflow.png";
        const height = i === 0 ? "h-28" : i === 1 ? "h-20" : "h-16";
        const color =
          i === 0
            ? "from-yellow-400 to-yellow-600"
            : i === 1
              ? "from-gray-300 to-gray-500"
              : "from-amber-800 to-amber-500";

        return (
          <motion.div
            key={agent.ReferenceID}
            className="flex flex-col items-center"
            initial={{ y: 30 }}
            animate={{ y: 0 }}
          >
            <motion.img
              src={profilePicture}
              className={`w-14 h-14 rounded-full border-4 border-white shadow-lg ${i === 0 ? "ring-4 ring-yellow-400 animate-pulse" : ""
                }`}
              alt={agent.AgentFirstname}
            />
            <div className="mt-2 text-xs font-bold text-gray-700 capitalize text-center">
              {agent.AgentFirstname}
            </div>
            <motion.div
              className={`w-16 ${height} bg-gradient-to-b ${color} rounded-t-md mt-1 flex items-center justify-center text-white text-xs font-semibold shadow-lg`}
            >
              #{i + 1}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );

  // 🔹 TSM Table
  const renderTSMTable = () => (
    <div className="overflow-x-auto mt-4">
      <h3 className="text-sm font-bold mb-3 text-gray-700 text-center">🏅 Top TSMs</h3>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr className="text-xs text-left whitespace-nowrap">
            <th className="w-[80px] px-4 py-2 font-semibold border-gray-200">Rank</th>
            <th className="w-[240px] px-4 py-2 font-semibold border-gray-200">TSM</th>
            <th className="w-[120px] px-4 py-2 font-semibold border-gray-200 text-right">Successful</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <AnimatePresence>
            {tsmRanks.length > 0 ? (
              tsmRanks.map((item, index) => {
                const rank = index + 1;
                const info = tsmData[item.tsm];
                const pic = info?.profilePicture || "/taskflow.png";
                let medalColor = "";

                if (rank === 1) medalColor = "text-yellow-400";
                else if (rank === 2) medalColor = "text-gray-400";
                else if (rank === 3) medalColor = "text-amber-700";

                return (
                  <motion.tr
                    key={item.tsm}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-yellow-50"
                  >
                    {/* Rank */}
                    <td className="px-4 py-2 border-b border-gray-100 align-middle">
                      <div className="flex items-center gap-1 text-[10px] font-semibold">
                        <FaMedal className={`${medalColor}`} /> Rank {rank}
                      </div>
                    </td>

                    {/* TSM */}
                    <td className="px-4 py-2 border-b border-gray-100 align-middle">
                      <div className="flex items-center gap-2">
                        <img
                          src={pic}
                          alt={info?.name || "TSM"}
                          className="w-7 h-7 rounded-full object-cover border border-gray-300"
                        />
                        <span className="capitalize text-gray-800 text-xs truncate max-w-[160px]">
                          {info?.name || "Unknown"}
                        </span>
                      </div>
                    </td>

                    {/* Successful */}
                    <td className="px-4 py-2 border-b border-gray-100 align-middle text-right text-[10px] font-medium">
                      {item.totalSuccessful}
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center text-gray-500 text-xs py-4 border-b border-gray-200"
                >
                  No TSM data available
                </td>
              </tr>
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );

  // 🔹 Ranking table (agents)
  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr className="text-xs text-left whitespace-nowrap">
            <th className="px-4 py-2 font-semibold text-gray-700">Rank</th>
            <th className="px-4 py-2 font-semibold text-gray-700">Agent</th>
            <th className="px-4 py-2 font-semibold text-gray-700">Successful</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <AnimatePresence>
            {groupedUsers.length > 0 ? (
              groupedUsers.map((agent, index) => {
                const rank = index + 1;
                const profilePicture =
                  agentData[agent.ReferenceID]?.profilePicture || "/taskflow.png";

                let icon = null;
                if (rank === 1)
                  icon = <FaCrown className="text-yellow-500 inline-block mr-1" size={14} />;
                else if (rank === 2)
                  icon = <FaRibbon className="text-gray-400 inline-block mr-1" size={14} />;
                else if (rank >= 3 && rank <= 10)
                  icon = <FaRibbon className="text-yellow-600 inline-block mr-1" size={14} />;
                else icon = <IoIosRibbon className="text-red-600 inline-block mr-1" size={14} />;

                const successRate = maxSuccessful
                  ? (agent.Successful / maxSuccessful) * 100
                  : 0;

                return (
                  <motion.tr
                    key={agent.ReferenceID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-yellow-50"
                  >
                    <td className="px-5 py-2 text-xs font-semibold">
                      <span className="flex items-center gap-1 rounded-lg p-2 text-[10px]">
                        {icon} Rank {rank}
                      </span>
                    </td>

                    <td className="px-5 py-2 text-xs capitalize">
                      <div className="flex items-center gap-2">
                        <img
                          src={profilePicture}
                          alt={`${agent.AgentFirstname} ${agent.AgentLastname}`}
                          className="w-8 h-8 rounded-full object-cover border border-gray-300"
                        />
                        <div>
                          {agent.AgentFirstname} {agent.AgentLastname}
                          <br />
                          <span className="text-gray-900 text-[10px]">
                            ({agent.ReferenceID})
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-2 text-xs">
                      <div className="w-28">
                        <div className="text-[10px] text-gray-500 mb-1">{agent.Successful}</div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-xs py-4 border">
                  No data available
                </td>
              </tr>
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );

  // 🔹 Layout
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
      {/* LEFT COLUMN */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-bold mb-3 text-gray-700 text-center">🏆 Top 3 Agents</h3>
          {renderPodium()}
          {renderTSMTable()}
        </div>

        <div className="p-4 bg-red-700 text-white shadow rounded-xl text-center">
          <h3 className="text-xs md:text-sm font-semibold">Total Successful Calls</h3>
          <p className="text-lg md:text-2xl font-bold">{totals.totalSuccessful}</p>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="bg-white rounded-xl shadow p-4">{renderTable()}</div>
    </div>
  );
};

export default Table;
