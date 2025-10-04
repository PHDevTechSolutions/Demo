import React, { useMemo, useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";

interface Post {
  id: string;
  referenceid: string;
  companyname: string;
  typeclient: string;
  actualsales: number | string;
  date_created: string;
  date_updated: string;
  contactperson: string;
  address: string;
  deliveryaddress: string;
  area: string;
  status?: string;
}

interface TableProps {
  updatedUser: Post[];
  handleSelectUser: (userId: string) => void;
  selectedUsers: Set<string>;
  bulkEditMode: boolean;
  bulkChangeMode: boolean;
  bulkEditStatusMode: boolean;
  bulkRemoveMode: boolean;
  Role: string;
  handleEdit: (post: Post) => void;
  formatDate: (timestamp: number) => string;
}

const Table: React.FC<TableProps> = ({
  updatedUser,
  handleSelectUser,
  selectedUsers,
  bulkEditMode,
  bulkChangeMode,
  bulkEditStatusMode,
  bulkRemoveMode,
  Role,
  handleEdit,
  formatDate,
}) => {
  const [agentNames, setAgentNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAgents = async () => {
      const uniqueIds = Array.from(new Set(updatedUser.map((p) => p.referenceid)));
      const nameMap: Record<string, string> = {};

      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const res = await fetch(`/api/fetchagent?id=${encodeURIComponent(id)}`);
            const data = await res.json();
            nameMap[id] = `${data.Lastname || ""}, ${data.Firstname || ""}`.trim();
          } catch (error) {
            console.error(`Error fetching agent for ID ${id}:`, error);
            nameMap[id] = "Unknown";
          }
        })
      );

      setAgentNames(nameMap);
    };

    if (updatedUser.length > 0) {
      fetchAgents();
    }
  }, [updatedUser]);

  const tableRows = useMemo(() => {
    return updatedUser.map((post) => {
      const borderLeftClass =
        post.status === "Active"
          ? "border-l-4 border-green-400"
          : post.status === "Used"
          ? "border-l-4 border-blue-400"
          : post.status === "On Hold"
          ? "border-l-4 border-yellow-400"
          : "";

      const hoverClass =
        post.status === "Active"
          ? "hover:bg-green-100 hover:text-green-900"
          : post.status === "Used"
          ? "hover:bg-blue-100 hover:text-blue-900"
          : post.status === "On Hold"
          ? "hover:bg-yellow-100 hover:text-yellow-900"
          : "";

      return (
        <tr
          key={post.id}
          className={`border-b whitespace-nowrap cursor-pointer ${hoverClass}`}
          onClick={() => handleEdit(post)}
        >
          <td
            className={`px-6 py-4 text-xs ${borderLeftClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            {(bulkEditMode || bulkChangeMode || bulkEditStatusMode || bulkRemoveMode) && (
              <input
                type="checkbox"
                checked={selectedUsers.has(post.id)}
                onChange={() => handleSelectUser(post.id)}
                className="w-4 h-4"
              />
            )}
          </td>

          {Role !== "Special Access" && (
            <td className="px-6 py-4 text-xs" onClick={(e) => e.stopPropagation()}>
              <button
                className="block px-4 py-2 text-[10px] font-bold text-black bg-blue-300 rounded-lg hover:bg-orange-300 hover:rounded-full hover:shadow-md w-full text-left flex items-center gap-1"
                onClick={() => handleEdit(post)}
              >
                <CiEdit /> Edit
              </button>
            </td>
          )}

          <td className="px-6 py-4 text-xs capitalize text-orange-700">
            {agentNames[post.referenceid] || "Loading..."}
          </td>
          <td className="px-6 py-4 text-xs uppercase">{post.companyname}</td>
          <td className="px-6 py-4 text-xs capitalize">{post.contactperson}</td>
          <td className="px-6 py-4 text-xs">{post.typeclient}</td>
          <td className="px-6 py-4 text-xs capitalize">{post.address}</td>
          <td className="px-6 py-4 text-xs capitalize">{post.deliveryaddress}</td>
          <td className="px-6 py-4 text-xs capitalize">{post.area}</td>
          <td className="px-4 py-2 text-xs align-top">
            <div className="flex flex-col gap-1">
              <span className="text-white bg-blue-400 p-2 rounded">
                Creation Date: {post.date_created}
              </span>
              <span className="text-white bg-green-500 p-2 rounded">
                Date of Last Update: {post.date_updated}
              </span>
            </div>
          </td>
        </tr>
      );
    });
  }, [
    updatedUser,
    selectedUsers,
    bulkEditMode,
    bulkChangeMode,
    bulkEditStatusMode,
    bulkRemoveMode,
    Role,
    handleEdit,
    handleSelectUser,
    formatDate,
    agentNames,
  ]);

  return (
    <table className="min-w-full table-auto">
      <thead className="bg-gray-100">
        <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
          <th className="px-6 py-4 font-semibold text-gray-700"></th>
          {Role !== "Special Access" && (
            <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
          )}
          <th className="px-6 py-4 font-semibold text-gray-700">Agent Name</th>
          <th className="px-6 py-4 font-semibold text-gray-700">Company Name</th>
          <th className="px-6 py-4 font-semibold text-gray-700">Contact Person</th>
          <th className="px-6 py-4 font-semibold text-gray-700">Type of Client</th>
          <th className="px-6 py-4 font-semibold text-gray-700">Complete Address</th>
          <th className="px-6 py-4 font-semibold text-gray-700">Delivery Address</th>
          <th className="px-6 py-4 font-semibold text-gray-700">Area</th>
          <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {updatedUser.length > 0 ? (
          tableRows
        ) : (
          <tr>
            <td colSpan={10} className="text-center text-xs py-4 text-gray-500">
              No record available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;
