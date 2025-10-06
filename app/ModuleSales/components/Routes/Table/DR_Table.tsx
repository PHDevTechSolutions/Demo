import React, { useEffect, useState } from "react";
import { FaCrown, FaRibbon } from "react-icons/fa";
import { IoIosRibbon } from "react-icons/io";

interface TableProps {
  posts: any[];
}

const Table: React.FC<TableProps> = ({ posts }) => {
  const [groupedUsers, setGroupedUsers] = useState<any[]>([]);
  const [agentData, setAgentData] = useState<
    Record<string, { profilePicture: string }>
  >({});
  const [totals, setTotals] = useState({
    totalOutbound: 0,
    totalSuccessful: 0,
    totalInbound: 0,
    totalCalls: 0,
  });

  useEffect(() => {
    let totalOutbound = 0;
    let totalSuccessful = 0;
    let totalInbound = 0;
    let totalCalls = 0;

    const grouped = posts.reduce((acc, post) => {
      const key = `${post.AgentFirstname} ${post.AgentLastname}`;
      if (!acc[key]) {
        acc[key] = {
          AgentFirstname: post.AgentFirstname,
          AgentLastname: post.AgentLastname,
          ReferenceID: post.referenceid,
          TotalOutbound: 0,
          Successful: 0,
          InboundCall: 0,
          TotalCalls: 0,
        };
      }

      // Outbound
      if (post.source === "Outbound - Touchbase") {
        acc[key].TotalOutbound += 1;
        acc[key].TotalCalls += 1;
        totalOutbound += 1;
        totalCalls += 1;
      }

      // Inbound
      if (post.typeactivity === "Inbound Call") {
        acc[key].InboundCall += 1;
        totalInbound += 1;
      }

      // Successful
      if (post.callstatus === "Successful") {
        acc[key].Successful += 1;
        totalSuccessful += 1;
      }

      return acc;
    }, {} as Record<string, any>);

    const sortedUsers = Object.values(grouped).sort(
      (a: any, b: any) => b.Successful - a.Successful
    );

    setGroupedUsers(sortedUsers);
    setTotals({ totalOutbound, totalSuccessful, totalInbound, totalCalls });
  }, [posts]);

  // 🔹 Fetch agent profile pictures
  useEffect(() => {
    const fetchAgents = async () => {
      const uniqueIds = Array.from(
        new Set(groupedUsers.map((user) => user.ReferenceID))
      );

      const dataMap: Record<string, { profilePicture: string }> = {};

      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const res = await fetch(`/api/fetchagent?id=${encodeURIComponent(id)}`);
            const data = await res.json();
            dataMap[id] = {
              profilePicture: data.profilePicture || "/taskflow.png",
            };
          } catch {
            dataMap[id] = { profilePicture: "/taskflow.png" };
          }
        })
      );

      setAgentData(dataMap);
    };

    if (groupedUsers.length > 0) fetchAgents();
  }, [groupedUsers]);

  return (
    <div className="overflow-x-auto px-2">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          {
            title: "Successful Calls",
            value: totals.totalSuccessful,
            bg: "bg-red-700",
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`p-4 ${card.bg} text-white shadow rounded-lg text-center`}
          >
            <h3 className="text-xs md:text-sm font-semibold">{card.title}</h3>
            <p className="text-lg md:text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Ranking Table */}
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
            {groupedUsers.length > 0 ? (
              groupedUsers.map((agent, index) => {
                const rank = index + 1;
                const profilePicture =
                  agentData[agent.ReferenceID]?.profilePicture || "/taskflow.png";

                let icon = null;
                if (rank === 1) {
                  icon = (
                    <FaCrown
                      className="text-yellow-500 inline-block mr-1"
                      size={14}
                    />
                  );
                } else if (rank === 2) {
                  icon = (
                    <FaRibbon
                      className="text-gray-400 inline-block mr-1"
                      size={14}
                    />
                  );
                } else if (rank >= 3 && rank <= 10) {
                  icon = (
                    <FaRibbon
                      className="text-yellow-600 inline-block mr-1"
                      size={14}
                    />
                  );
                } else {
                  icon = (
                    <IoIosRibbon
                      className="text-red-600 inline-block mr-1"
                      size={14}
                    />
                  );
                }

                return (
                  <tr key={index} className="border-b whitespace-nowrap">
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
                          className="w-8 h-8 rounded-full object-cover border border-gray-300 shadow-sm"
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
                    <td className="px-5 py-2 text-xs font-bold text-green-700">
                      {agent.Successful}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-xs py-4 border">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
