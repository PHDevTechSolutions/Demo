"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import AddPostForm from "../../../components/Agents/ListSalesAssociate/Form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ----- Types -----
interface UserDetails {
  UserId: string;
  ReferenceID: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Role: string;
  Department: string;
  Company: string;
}

interface User {
  _id: string;
  ReferenceID: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Role: string;
  Manager?: string;
  TSM?: string;
  Department?: string;
  Location?: string;
}

// ----- UsersCard Component -----
interface UsersCardProps {
  users: User[];
  handleEdit: (user: User) => void;
  tsmOptions?: { value: string; label: string }[];
}

const UsersCard: React.FC<UsersCardProps> = ({ users, handleEdit, tsmOptions }) => {
  if (users.length === 0) return <p className="text-xs text-gray-500">No users found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {users.map((user) => (
        <div key={user.ReferenceID} className="border rounded-lg p-4 hover:shadow-lg transition">
          <p className="font-semibold">{user.Firstname} {user.Lastname}</p>
          <p className="text-xs text-gray-500">{user.Email}</p>
          {tsmOptions && (
            <p className="text-xs text-gray-500">
              TSM: {tsmOptions.find((t) => t.value === user.TSM)?.label || "N/A"}
            </p>
          )}
          <button
            className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
            onClick={() => handleEdit(user)}
          >
            View / Edit
          </button>
        </div>
      ))}
    </div>
  );
};

// ----- Main Component -----
const ListofUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"agents" | "tsm">("agents");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userDetails, setUserDetails] = useState<UserDetails>({
    UserId: "",
    ReferenceID: "",
    Firstname: "",
    Lastname: "",
    Email: "",
    Role: "",
    Department: "",
    Company: "",
  });

  const [tsmOptions, setTSMOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedTSM, setSelectedTSM] = useState("");

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // --- Fetch user details ---
  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");
      if (!userId) {
        setLoadingUser(false);
        return;
      }

      try {
        const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserDetails({
          UserId: data._id,
          ReferenceID: data.ReferenceID || "",
          Firstname: data.Firstname || "",
          Lastname: data.Lastname || "",
          Email: data.Email || "",
          Role: data.Role || "",
          Department: data.Department || "",
          Company: data.Company || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user data.");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserData();
  }, []);

  // --- Fetch all users ---
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch("/api/ModuleSales/UserManagement/TerritorySalesAssociates/FetchUser");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        toast.error("Error fetching users.");
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // --- TSM list (for Manager) ---
  useEffect(() => {
    if (userDetails.Role !== "Manager") return;
    const tsmList = users
      .filter((u) => u.Role === "Territory Sales Manager")
      .map((tsm) => ({ value: tsm.ReferenceID, label: `${tsm.Firstname} ${tsm.Lastname}` }));
    setTSMOptions(tsmList);
  }, [users, userDetails.Role]);

  const handleEdit = (user: User) => {
    setEditUser(user);
    setShowForm(true);
  };

  // --- Filtered Agents ---
  const filteredAgents = users.filter((user) => {
    if (user.Role !== "Territory Sales Associate") return false;
    if (userDetails.Role === "Manager" && user.Manager !== userDetails.ReferenceID) return false;
    if (selectedTSM && user.TSM !== selectedTSM) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!user.Firstname.toLowerCase().includes(term) && !user.Lastname.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  // --- Group agents by TSM ---
  const groupedByTSM: Record<string, User[]> = {};
  users
    .filter((user) => user.Role === "Territory Sales Associate")
    .forEach((agent) => {
      const key = agent.TSM || "Unassigned";
      if (!groupedByTSM[key]) groupedByTSM[key] = [];
      groupedByTSM[key].push(agent);
    });

  if (loadingUser || loadingUsers) return <p className="text-xs text-gray-500 p-4">Loading...</p>;

  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {(user) => (
            <div className="mx-auto p-4 text-gray-900">
              {/* Tabs */}
              <div className="flex gap-4 mb-4">
                <button
                  className={`px-4 py-2 rounded text-xs font-bold ${activeTab === "agents" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  onClick={() => setActiveTab("agents")}
                >
                  Agents
                </button>
                {userDetails.Role === "Manager" && (
                  <button
                    className={`px-4 py-2 rounded text-xs font-bold ${activeTab === "tsm" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setActiveTab("tsm")}
                  >
                    TSM
                  </button>
                )}
              </div>

              {showForm ? (
                <AddPostForm
                  onCancel={() => {
                    setShowForm(false);
                    setEditUser(null);
                  }}
                  refreshPosts={() => {}}
                  userName={user?.userName || ""}
                  userDetails={{ id: editUser?._id || userDetails.UserId }}
                  editUser={editUser}
                />
              ) : (
                <>
                  {activeTab === "agents" ? (
                    <>
                      <h2 className="text-lg font-bold mb-2">Agents</h2>
                      <p className="text-xs text-gray-600 mb-4">Agents manage client relationships and drive sales.</p>

                      {userDetails.Role === "Manager" && (
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Filter by TSM</label>
                          <select
                            className="w-full border rounded px-3 py-2 text-xs capitalize"
                            value={selectedTSM}
                            onChange={(e) => setSelectedTSM(e.target.value)}
                          >
                            <option value="">All TSMs</option>
                            {tsmOptions.map((tsm) => (
                              <option key={tsm.value} value={tsm.value}>
                                {tsm.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <UsersCard users={filteredAgents} handleEdit={handleEdit} tsmOptions={tsmOptions} />
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-bold mb-2">Territory Sales Managers</h2>
                      <p className="text-xs text-gray-600 mb-4">See all TSMs and their assigned agents.</p>

                      <div className="space-y-4">
                        {tsmOptions.map((tsm) => (
                          <div key={tsm.value} className="border rounded-lg p-4 bg-gray-50">
                            <p className="font-semibold text-sm mb-2">{tsm.label}</p>
                            <UsersCard users={groupedByTSM[tsm.value] || []} handleEdit={handleEdit} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar theme="colored" />
            </div>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default ListofUser;
