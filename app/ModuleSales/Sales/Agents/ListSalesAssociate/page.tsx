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
import "react-toastify/dist/ReactToastify.css";

const ListofUser: React.FC = () => {
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

  const [tsaOptions, setTSAOptions] = useState<{ value: string; label: string }[]>([]);
  const [tsmOptions, setTSMOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedTSM, setSelectedTSM] = useState("");

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const loading = loadingUser || loadingAccounts;

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
        console.error("Error fetching user data:", err);
        toast.error("Failed to load user data.");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchTSA = async () => {
      if (!["Territory Sales Manager", "Super Admin", "Manager"].includes(userDetails.Role)) return;
      try {
        const url =
          userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID
            ? `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`
            : `/api/fetchtsadata?Role=Territory Sales Associate`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch agents");

        const data = await response.json();
        setTSAOptions(
          data.map((user: any) => ({ value: user.ReferenceID, label: `${user.Firstname} ${user.Lastname}` }))
        );
      } catch (err) {
        console.error("Error fetching TSA options:", err);
      }
    };
    fetchTSA();
  }, [userDetails.ReferenceID, userDetails.Role]);

  useEffect(() => {
    if (userDetails.Role !== "Manager") return;
    const fetchTSM = async () => {
      try {
        const response = await fetch(`/api/fetchtsadata?Role=Territory Sales Manager`);
        if (!response.ok) throw new Error("Failed to fetch TSMs");
        const data = await response.json();
        setTSMOptions(data.map((user: any) => ({ value: user.ReferenceID, label: `${user.Firstname} ${user.Lastname}` })));
      } catch (err) {
        console.error("Error fetching TSM options:", err);
      }
    };
    fetchTSM();
  }, [userDetails.Role]);

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

  const filteredAccounts = posts.filter((post) => {
    const excludedStatuses = ["Resigned", "Terminated"];
    if (excludedStatuses.includes(post?.Status)) return false;

    const matchesSearchTerm = [post?.Firstname, post?.Lastname].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const referenceID = userDetails.ReferenceID;

    const matchesRole = (() => {
      switch (userDetails.Role) {
        case "Super Admin":
          return post?.Role === "Territory Sales Associate";
        case "Manager":
          return post?.Role === "Territory Sales Associate" && post?.Manager === referenceID;
        case "Territory Sales Manager":
          return post?.Role === "Territory Sales Associate" && post?.TSM === referenceID;
        case "Special Access":
          return true;
        default:
          return false;
      }
    })();

    const matchesAgent = !selectedAgent || post?.referenceid === selectedAgent;
    const matchesTSM = !selectedTSM || post?.TSM === selectedTSM;

    return matchesSearchTerm && matchesRole && matchesAgent && matchesTSM;
  });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredAccounts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredAccounts.length / postsPerPage);

  const handleEdit = (post: any) => {
    setEditUser(post);
    setShowForm(true);
  };

  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {(user) => (
            <div className="mx-auto p-4 text-gray-900">
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
                  <h2 className="text-lg font-bold mb-2">Agents</h2>
                  <p className="text-xs text-gray-600 mb-4">
                    <strong>Agents</strong> manage client relationships, drive sales, and ensure excellent service.
                  </p>

                  {["Territory Sales Manager", "Super Admin", "Manager"].includes(userDetails.Role) && (
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      {userDetails.Role === "Manager" && (
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
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 invisible">Total</label>
                        <h1 className="text-xs bg-orange-500 text-white p-2 rounded shadow-sm text-center">
                          Total Users: <span className="font-bold">{filteredAccounts.length}</span>
                        </h1>
                      </div>
                    </div>
                  )}

                  <SearchFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    postsPerPage={postsPerPage}
                    setPostsPerPage={setPostsPerPage}
                  />

                  {loading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                      <span className="ml-2 text-xs text-gray-500">Loading data...</span>
                    </div>
                  ) : (
                    <UsersTable posts={currentPosts} handleEdit={handleEdit} userDetails={userDetails} />
                  )}

                  <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

                  <div className="text-xs mt-2">
                    Showing {indexOfFirstPost + 1} to {Math.min(indexOfLastPost, filteredAccounts.length)} of{" "}
                    {filteredAccounts.length} entries
                  </div>
                </div>
              )}

              <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                className="text-xs z-[99999]"
                toastClassName="relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-xs"
                progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
              />
            </div>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default ListofUser;