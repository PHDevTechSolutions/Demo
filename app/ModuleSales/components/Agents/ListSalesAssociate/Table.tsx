"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import AddPostForm from "../../../components/Agents/ListSalesAssociate/Form";
import SearchFilters from "../../../components/UserManagement/TerritorySalesAssociates/Filters";
import Pagination from "../../../components/UserManagement/TerritorySalesAssociates/Pagination";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListofUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"agents" | "tsm">("agents");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(12);

  const [userDetails, setUserDetails] = useState({
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
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const loading = loadingUser || loadingAccounts;

  // Fetch user details
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

  // Fetch all users (TSMs + Agents)
  const fetchUsers = async () => {
    setLoadingAccounts(true);
    try {
      const response = await fetch("/api/ModuleSales/UserManagement/TerritorySalesAssociates/FetchUser");
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      toast.error("Error fetching users.");
      console.error(err);
    } finally {
      setLoadingAccounts(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // Get TSM list (for Manager role)
  useEffect(() => {
    if (userDetails.Role !== "Manager") return;
    const tsmList = posts
      .filter((u) => u.Role === "Territory Sales Manager")
      .map((tsm) => ({ value: tsm.ReferenceID, label: `${tsm.Firstname} ${tsm.Lastname}` }));
    setTSMOptions(tsmList);
  }, [posts, userDetails.Role]);

  const handleEdit = (post: any) => {
    setEditUser(post);
    setShowForm(true);
  };

  // Filtered accounts for Agents tab
  const filteredAgents = posts.filter((post) => {
    if (post.Role !== "Territory Sales Associate") return false;
    if (userDetails.Role === "Manager" && post.Manager !== userDetails.ReferenceID) return false;
    if (selectedTSM && post.TSM !== selectedTSM) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!post.Firstname.toLowerCase().includes(term) && !post.Lastname.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  // Group agents by TSM for TSM tab
  const groupedByTSM = posts
    .filter((post) => post.Role === "Territory Sales Associate")
    .reduce((acc: Record<string, any>, agent) => {
      if (!acc[agent.TSM]) acc[agent.TSM] = [];
      acc[agent.TSM].push(agent);
      return acc;
    }, {} as Record<string, any>);

  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {(user) => (
            <div className="mx-auto p-4 text-gray-900">
              {/* Tabs */}
              <div className="flex gap-4 mb-4">
                <button
                  className={`px-4 py-2 rounded text-xs font-bold ${
                    activeTab === "agents" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("agents")}
                >
                  Agents
                </button>
                {userDetails.Role === "Manager" && (
                  <button
                    className={`px-4 py-2 rounded text-xs font-bold ${
                      activeTab === "tsm" ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
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
                  refreshPosts={fetchUsers}
                  userName={user?.userName || ""}
                  userDetails={{ id: editUser?._id || userDetails.UserId }}
                  editUser={editUser}
                />
              ) : (
                <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                  {activeTab === "agents" ? (
                    <>
                      <h2 className="text-lg font-bold mb-2">Agents</h2>
                      <p className="text-xs text-gray-600 mb-4">
                        Agents manage client relationships and drive sales.
                      </p>

                      {["Manager"].includes(userDetails.Role) && (
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
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
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredAgents.map((agent) => (
                          <div
                            key={agent.ReferenceID}
                            className="border rounded-lg p-4 hover:shadow-lg transition"
                          >
                            <p className="font-semibold">{agent.Firstname} {agent.Lastname}</p>
                            <p className="text-xs text-gray-500">{agent.Email}</p>
                            <p className="text-xs text-gray-500">TSM: {tsmOptions.find(t => t.value === agent.TSM)?.label || "N/A"}</p>
                            <button
                              className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
                              onClick={() => handleEdit(agent)}
                            >
                              View / Edit
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-bold mb-2">Territory Sales Managers</h2>
                      <p className="text-xs text-gray-600 mb-4">
                        See all TSMs and their assigned agents.
                      </p>

                      <div className="space-y-4">
                        {tsmOptions.map((tsm) => (
                          <div key={tsm.value} className="border rounded-lg p-4 bg-gray-50">
                            <p className="font-semibold text-sm mb-2">{tsm.label}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {(groupedByTSM[tsm.value] || []).map((agent: any) => (
                                <div
                                  key={agent.ReferenceID}
                                  className="border rounded-lg p-2 hover:shadow-md transition"
                                >
                                  <p className="text-xs font-medium">{agent.Firstname} {agent.Lastname}</p>
                                  <p className="text-[10px] text-gray-500">{agent.Email}</p>
                                  <button
                                    className="mt-1 bg-blue-500 text-white px-1 py-1 rounded text-[10px]"
                                    onClick={() => handleEdit(agent)}
                                  >
                                    View / Edit
                                  </button>
                                </div>
                              ))}
                              {(!groupedByTSM[tsm.value] || groupedByTSM[tsm.value].length === 0) && (
                                <p className="text-xs text-gray-400 col-span-full">No agents assigned</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
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
