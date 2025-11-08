"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import Pagination from "../../../components/Routes/Pagination/CA_Pagination";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeletionAccounts: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(12);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [userDetails, setUserDetails] = useState<any>({
    UserId: "",
    ReferenceID: "",
    Manager: "",
    TSM: "",
    Role: "",
  });

  // ✅ Fetch User Details
  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");

      if (userId) {
        try {
          const response = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
          if (!response.ok) throw new Error("Failed to fetch user data");
          const data = await response.json();
          setUserDetails({
            UserId: data._id,
            ReferenceID: data.ReferenceID || "",
            Manager: data.Manager || "",
            TSM: data.TSM || "",
            Role: data.Role || "",
          });
        } catch (err) {
          console.error("Error fetching user data:", err);
          toast.error("Failed to load user data.");
        }
      }
    };

    fetchUserData();
  }, []);

  // ✅ Fetch Accounts
  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "/api/ModuleSales/UserManagement/CompanyAccounts/FetchAccount"
        );
        const data = await response.json();
        console.log("Fetched data:", data);
        setPosts(data.data || []);
      } catch (error) {
        toast.error("Error fetching accounts.");
        console.error("Error Fetching", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  // ✅ Role-based + search filter
  const filteredAccounts = Array.isArray(posts)
    ? posts.filter((post) => {
        const referenceID = userDetails.ReferenceID;

        const matchesRole =
          userDetails.Role === "Super Admin" || userDetails.Role === "Special Access"
            ? true
            : userDetails.Role === "Territory Sales Associate"
            ? post?.referenceid === referenceID
            : userDetails.Role === "Manager"
            ? post?.manager === referenceID
            : userDetails.Role === "Territory Sales Manager"
            ? post?.tsm === referenceID
            : false;

        const matchesSearch = post?.companyname
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

        return matchesRole && matchesSearch;
      })
    : [];

  // ✅ Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredAccounts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredAccounts.length / postsPerPage);

  // ✅ Function to determine badge color based on next_available_date
  const getBadgeColor = (dateString: string) => {
    if (!dateString) return "bg-gray-300 text-gray-800";

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isToday =
      date.toDateString() === today.toDateString();
    const isTomorrow =
      date.toDateString() === tomorrow.toDateString();

    if (isToday) return "bg-green-500 text-white"; // today
    if (isTomorrow) return "bg-yellow-400 text-gray-800"; // tomorrow
    return "bg-orange-400 text-white"; // later
  };

  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {() => (
            <div className="mx-auto p-4 text-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-1">
                <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                  <h2 className="text-lg font-bold mb-4">
                    List of Accounts - OB Calls Follow Up
                  </h2>

                  {/* ✅ Search Bar */}
                  <div className="mb-4 flex items-center">
                    <input
                      type="text"
                      placeholder="Search company name..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                  </div>

                  {loading ? (
                    <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                      <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      {/* ✅ TABLE DISPLAY */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                          <thead className="bg-gray-100">
                            <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
                              <th className="px-6 py-4 font-semibold text-gray-700">
                                Company Name
                              </th>
                              <th className="px-6 py-4 font-semibold text-gray-700">
                                Date Appear on New Task
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentPosts.length > 0 ? (
                              currentPosts.map((post, index) => {
                                const dateValue = post.next_available_date
                                  ? new Date(post.next_available_date).toLocaleDateString()
                                  : "N/A";

                                return (
                                  <tr
                                    key={index}
                                    className="border-b whitespace-nowrap cursor-pointer"
                                  >
                                    <td className="px-6 py-4 text-xs uppercase">
                                      {post.companyname || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                      {post.next_available_date ? (
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(
                                            post.next_available_date
                                          )}`}
                                        >
                                          {dateValue}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">N/A</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td
                                  colSpan={2}
                                  className="text-center py-4 text-gray-500"
                                >
                                  No accounts found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* ✅ PAGINATION */}
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                      />
                    </>
                  )}

                  <div className="text-xs mt-2 text-gray-600">
                    Showing {indexOfFirstPost + 1} to{" "}
                    {Math.min(indexOfLastPost, filteredAccounts.length)} of{" "}
                    {filteredAccounts.length} entries
                  </div>
                </div>

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
            </div>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default DeletionAccounts;
