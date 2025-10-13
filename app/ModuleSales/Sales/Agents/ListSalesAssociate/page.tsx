"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import AddPostForm from "../../../components/Agents/ListSalesAssociate/Form";
import SearchFilters from "../../../components/UserManagement/TerritorySalesAssociates/Filters";
import UsersTable from "../../../components/Agents/ListSalesAssociate/Table";
import Pagination from "../../../components/UserManagement/TerritorySalesAssociates/Pagination";
import { ToastContainer, toast } from "react-toastify";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Menu } from "@headlessui/react";
import "react-toastify/dist/ReactToastify.css";

const ListofUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"agents" | "tsm">("agents");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [tsmList, setTsmList] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(12);
  const [selectedTSM, setSelectedTSM] = useState("");
  const [userDetails, setUserDetails] = useState<any>({});
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTSM, setLoadingTSM] = useState(true);

  const loading = loadingUser || loadingAccounts;

  // 🔹 Fetch logged-in user details
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
        const data = await response.json();
        setUserDetails(data);
      } catch (err) {
        toast.error("Failed to load user data.");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserData();
  }, []);

  // 🔹 Fetch Agents
  const fetchUsers = async () => {
    setLoadingAccounts(true);
    try {
      const response = await fetch(
        "/api/ModuleSales/UserManagement/TerritorySalesAssociates/FetchUser"
      );
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      toast.error("Error fetching users.");
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Fetch Sessions for Logs
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/fetchsession");
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const data = await res.json();
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };
    fetchSessions();
  }, []);

  // 🔹 Fetch TSMs under Manager
  useEffect(() => {
    const fetchTSMList = async () => {
      if (userDetails.Role !== "Manager" || !userDetails.ReferenceID) {
        setLoadingTSM(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/fetchtsadata?Role=Territory Sales Manager&manager=${encodeURIComponent(
            userDetails.ReferenceID
          )}`
        );
        const data = await res.json();
        setTsmList(
          data.filter((tsm: any) => tsm.Manager === userDetails.ReferenceID)
        );
      } catch (err) {
        toast.error("Failed to fetch TSMs under your supervision.");
      } finally {
        setLoadingTSM(false);
      }
    };
    fetchTSMList();
  }, [userDetails]);

  // 🔹 Helpers for session display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getUserLogins = (email: string) => {
    const userSessions = sessions
      .filter((s) => s.email?.toLowerCase() === email?.toLowerCase())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const latestLogin = userSessions
      .filter((s) => s.status === "login")
      .at(-1);
    const latestLogout = userSessions
      .filter((s) => s.status === "logout")
      .at(-1);

    return {
      latestLogin: latestLogin
        ? formatDateTime(latestLogin.timestamp)
        : "No login yet",
      latestLogout: latestLogout
        ? formatDateTime(latestLogout.timestamp)
        : "No logout yet",
    };
  };

  // 🔹 Filter for agents
  const filteredAgents = posts.filter((post) => {
    const excluded = ["Resigned", "Terminated"];
    if (excluded.includes(post?.Status)) return false;

    const matchesSearch = [post?.Firstname, post?.Lastname].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ref = userDetails.ReferenceID;
    const matchesRole =
      (userDetails.Role === "Manager" &&
        post.Role === "Territory Sales Associate" &&
        post.Manager === ref) ||
      (userDetails.Role === "Territory Sales Manager" &&
        post.Role === "Territory Sales Associate" &&
        post.TSM === ref) ||
      (userDetails.Role === "Super Admin" &&
        post.Role === "Territory Sales Associate");

    const matchesTSM = !selectedTSM || post?.TSM === selectedTSM;
    return matchesSearch && matchesRole && matchesTSM;
  });

  const indexOfLast = currentPage * postsPerPage;
  const currentAgents = filteredAgents.slice(indexOfLast - postsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredAgents.length / postsPerPage);

  const handleEdit = (post: any) => {
    setEditUser(post);
    setShowForm(true);
  };

  const handleSelectTSM = (ref: string) => {
    setSelectedTSM(ref);
    setActiveTab("agents");
    toast.info(`Filtering agents under ${ref}`);
  };

  const statusColors: { [key: string]: string } = {
    Active: "bg-green-500",
    Inactive: "bg-red-400",
    Resigned: "bg-red-500",
    Terminated: "bg-yellow-400",
    Locked: "bg-gray-400",
  };

  // ====================== RENDER ======================
  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {() => (
            <div className="mx-auto p-4 text-gray-900">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab("agents")}
                  className={`px-4 py-2 text-xs font-semibold ${activeTab === "agents"
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-500 hover:text-orange-400"
                    }`}
                >
                  Agents
                </button>
                {userDetails.Role === "Manager" && (
                  <button
                    onClick={() => setActiveTab("tsm")}
                    className={`px-4 py-2 text-xs font-semibold ${activeTab === "tsm"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-orange-400"
                      }`}
                  >
                    TSMs
                  </button>
                )}
              </div>

              {activeTab === "agents" ? (
                showForm ? (
                  <AddPostForm
                    onCancel={() => {
                      setShowForm(false);
                      setEditUser(null);
                    }}
                    refreshPosts={fetchUsers}
                    userName=""
                    userDetails={{ id: editUser?._id || userDetails.UserId }}
                    editUser={editUser}
                  />
                ) : (
                  <div className="bg-white shadow-md rounded-lg p-4">
                    <SearchFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      postsPerPage={postsPerPage}
                      setPostsPerPage={setPostsPerPage}
                    />
                    {loading ? (
                      <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                        <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <UsersTable
                        posts={currentAgents}
                        handleEdit={handleEdit}
                        userDetails={userDetails}
                      />
                    )}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                )
              ) : (
                // ====================== TSM CARDS ======================
                <div className="bg-white shadow-md rounded-lg p-4">
                  {loadingTSM ? (
                    <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                      <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                    </div>
                  ) : tsmList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {tsmList.map((tsm, i) => {
                        const userLogins = getUserLogins(tsm.Email);
                        return (
                          <div
                            key={i}
                            className="relative border rounded-xl shadow-lg p-4 flex flex-col bg-white hover:scale-[1.03] hover:shadow-2xl transition-transform duration-300 overflow-hidden"
                          >
                            <div className="absolute top-2 right-2 p-2">
                              <Menu as="div" className="relative inline-block text-left">
                                <div>
                                  <Menu.Button className="p-1 rounded-full hover:bg-gray-100 focus:outline-none">
                                    <BsThreeDotsVertical className="text-gray-500 hover:text-gray-700" size={16} />
                                  </Menu.Button>
                                </div>

                                <Menu.Items className="absolute right-0 mt-1 w-40 p-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                                  <div className="py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedUser(tsm);
                                            setShowModal(true);
                                          }}
                                          className={`${active ? "bg-gray-100" : ""
                                            } block w-full text-left px-4 py-2 text-xs text-gray-700`}
                                        >
                                          View Session Logs
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectTSM(tsm.ReferenceID);
                                          }}
                                          className={`${active ? "bg-gray-100" : ""
                                            } block w-full text-left px-4 py-2 text-xs text-gray-700`}
                                        >
                                          View Agents
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Menu>
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                              <div className="relative">
                                <img
                                  src={tsm.profilePicture ?? "/taskflow.png"}
                                  alt="Avatar"
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <span
                                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[tsm.Status ?? ""] || "bg-gray-400"
                                    }`}
                                />
                              </div>
                              <div>
                                <p className="font-bold text-sm capitalize">
                                  {tsm.Lastname}, {tsm.Firstname}
                                </p>
                                <p className="text-xs text-gray-600">{tsm.Email}</p>
                              </div>
                            </div>

                            <div className="text-xs space-y-1 mb-2">
                              <p>
                                <strong>Email:</strong> {tsm.Email ?? "N/A"}
                              </p>
                              <p className="capitalize">
                                <strong>Role:</strong> {tsm.Position ?? "N/A"}
                              </p>
                              <p>
                                <strong>Reference ID:</strong> {tsm.ReferenceID}
                              </p>
                              <p className="text-green-700">
                                <strong>Latest Login:</strong> {userLogins.latestLogin}
                              </p>
                              <p className="text-red-600">
                                <strong>Latest Logout:</strong> {userLogins.latestLogout}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  ) : (
                    <div className="text-center text-xs text-gray-400 py-6">
                      No TSMs found under your supervision.
                    </div>
                  )}
                </div>
              )}

              {/* 🟦 Session Logs Modal */}
              {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative transform animate-scaleIn">
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                    >
                      ✕
                    </button>
                    <div className="mb-4 border-b pb-3">
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        Session Logs — {selectedUser.Firstname} {selectedUser.Lastname}
                      </h2>
                      <p className="text-xs text-gray-500">{selectedUser.Email}</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                      {sessions
                        .filter(
                          (s) =>
                            s.email?.toLowerCase() ===
                            selectedUser.Email?.toLowerCase()
                        )
                        .sort(
                          (a, b) =>
                            new Date(b.timestamp).getTime() -
                            new Date(a.timestamp).getTime()
                        )
                        .map((s, idx) => (
                          <div
                            key={idx}
                            className={`flex justify-between items-center border rounded-lg p-3 ${s.status === "login"
                              ? "bg-green-50 text-green-700"
                              : s.status === "logout"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-50 text-gray-600"
                              }`}
                          >
                            <span className="text-xs font-medium capitalize">
                              {s.status}
                            </span>
                            <span className="text-xs">
                              {formatDateTime(s.timestamp)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              <ToastContainer position="bottom-right" autoClose={2000} theme="colored" />
            </div>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default ListofUser;
