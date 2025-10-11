"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import UsersTable from "../../../components/Routes/Table/CC_Table";
import SearchFilters from "../../../components/Routes/Filters/CC_Filters";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ListofUser: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClientType, setSelectedClientType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [userDetails, setUserDetails] = useState({
        UserId: "", ReferenceID: "", Manager: "", TSM: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "",
    });
    // Loading states
    const [error, setError] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState<boolean>(true);
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);

    const loading = loadingUser || loadingAccounts;

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
                        Firstname: data.Firstname || "",
                        Lastname: data.Lastname || "",
                        Email: data.Email || "",
                        Role: data.Role || "",
                        Department: data.Department || "",
                        Company: data.Company || "",
                    });
                } catch (err: unknown) {
                    console.error("Error fetching user data:", err);
                    setError("Failed to load user data. Please try again later.");
                } finally {
                    setLoadingUser(false);
                }
            } else {
                setError("User ID is missing.");
                setLoadingUser(false);
            }
        };

        fetchUserData();
    }, []);

    const fetchAccount = async () => {
        setLoadingAccounts(true);
        try {
            const response = await fetch("/api/ModuleSales/Task/CCG");
            const data = await response.json();
            console.log("Fetched data:", data);
            setPosts(data.data);
        } catch (error) {
            toast.error("Error fetching users.");
            console.error("Error Fetching", error);
        } finally {
            setLoadingAccounts(false);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, []);

    const filteredAccounts = Array.isArray(posts)
        ? posts
            .filter((post) => {
                // 🔹 Ensure companyname exists
                if (!post?.companyname) return false;

                // 🔹 Search term filter
                const matchesSearchTerm = post.companyname
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

                // 🔹 Date range filter
                const postDate = post.date_created ? new Date(post.date_created) : null;
                const isWithinDateRange =
                    (!startDate || (postDate && postDate >= new Date(startDate))) &&
                    (!endDate || (postDate && postDate <= new Date(endDate)));

                // 🔹 Client type filter (if typeclient exists in your data)
                const matchesClientType = selectedClientType
                    ? post.typeclient === selectedClientType
                    : true;

                // 🔹 Role-based filtering
                const role = userDetails.Role;
                const refID = String(userDetails.ReferenceID || "");
                let roleMatch = false;

                if (role === "Super Admin" || role === "Special Access") {
                    roleMatch = true; // lahat pwede
                } else if (role === "Manager") {
                    roleMatch = String(post.manager) === refID;
                } else if (role === "Territory Sales Manager") {
                    roleMatch = String(post.tsm) === refID;
                } else if (role === "Territory Sales Associate") {
                    roleMatch = String(post.referenceid) === refID;
                }

                return matchesSearchTerm && isWithinDateRange && matchesClientType && roleMatch;
            })
            .sort((a, b) => {
                // 🔹 Sort by date_created descending
                const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
                const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
                return dateB - dateA;
            })
        : [];

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1">
                                {showForm ? (
                                    <></>
                                ) : (
                                    <>
                                        <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                            <h2 className="text-lg font-bold mb-2">Client Coverage Guide</h2>
                                            <p className="text-xs text-gray-600 mb-4">
                                                The <strong>Client Coverage Guide</strong> provides a comprehensive overview of all transaction histories for each company. It serves as a detailed record of discussions and agreements made with clients, helping to track important conversations, updates, and transactions. By reviewing this guide, users can quickly access relevant information about each client, ensuring efficient management of customer relations and providing a reliable reference for future interactions.
                                            </p>
                                            <SearchFilters
                                                searchTerm={searchTerm}
                                                setSearchTerm={setSearchTerm}
                                            />
                                            {loading ? (
                                                <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                                                    <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
                                                    <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
                                                    <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                                                </div>
                                            ) : (
                                                <>
                                                    <UsersTable
                                                        posts={filteredAccounts}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </>
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
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ListofUser;
