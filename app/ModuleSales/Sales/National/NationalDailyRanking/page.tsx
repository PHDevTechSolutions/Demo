"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import SearchFilters from "../../../components/National/DailyCallRanking/SearchFilters";
import Table from "../../../components/National/DailyCallRanking/Table";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ListofUser: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [showImportForm, setShowImportForm] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClientType, setSelectedClientType] = useState("");
    const [startDate, setStartDate] = useState(""); // Default to null
    const [endDate, setEndDate] = useState(""); // Default to null

    const [userDetails, setUserDetails] = useState({
        UserId: "", ReferenceID: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "",
    });
    const [usersList, setUsersList] = useState<any[]>([]);

    // Loading states
    const [error, setError] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState<boolean>(true);
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);

    const loading = loadingUser || loadingAccounts; // 🔑 combined state

    // Fetch user data based on query parameters (user ID)
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
                        UserId: data._id, // Set the user's id here
                        ReferenceID: data.ReferenceID || "",
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

    // Fetch users from MongoDB or PostgreSQL
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/getUsers"); // API endpoint mo
                const data = await response.json();
                setUsersList(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);


    // Fetch all users from the API
    const fetchAccount = async () => {
        setLoadingAccounts(true);
        try {
            const response = await fetch("/api/ModuleSales/National/FetchDailyCallRanking");
            const data = await response.json();
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

    const today = new Date().toISOString().split("T")[0]; // Kunin ang YYYY-MM-DD format ng today

    const filteredAccounts = Array.isArray(posts)
        ? posts.filter((post) => {
            const matchesSearchTerm = post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase());

            const postDate = post.date_created ? new Date(post.date_created).toISOString().split("T")[0] : null;
            const isWithinDateRange =
                postDate &&
                (!startDate || postDate >= startDate) &&
                (!endDate || postDate <= endDate);

            const matchesClientType = selectedClientType ? post?.typeclient === selectedClientType : true;

            const userRole = userDetails.Role;
            const referenceID = userDetails.ReferenceID;

            // Logic for role-based filtering
            const matchesRole =
                userRole === "Super Admin" || // Kita lahat
                userRole === "Special Access" || // Kita lahat
                userRole === "Manager" || // Kita lahat
                userRole === "Territory Sales Manager" || // Kita lahat
                userRole === "Territory Sales Associate" || // Kita lahat
                post?.manager === referenceID; // Filtered by ReferenceID for other roles

            return matchesSearchTerm && isWithinDateRange && matchesClientType && matchesRole;
        }).map((post) => {
            // Hanapin ang Agent na may parehong ReferenceID sa usersList
            const agent = usersList.find((user) => user.ReferenceID === post.referenceid);

            return {
                ...post,
                AgentFirstname: agent ? agent.Firstname : "Unknown",
                AgentLastname: agent ? agent.Lastname : "Unknown",
            };
        })
        : [];

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                                <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                    <h2 className="text-lg font-bold mb-2">National Daily Ranking's</h2>
                                    <p className="text-xs text-gray-600 mb-4">
                                        The National Daily Ranking is a leaderboard that tracks the performance of
                                        <strong> Territory Sales Associates (TSA)</strong> across the Philippines on a daily basis.
                                        Rankings are determined based on the number of <strong>outbound calls, inbound calls,</strong> and
                                        <strong> successful call outcomes</strong>. This ranking covers key regions such as
                                        <strong> Metro Manila, Cebu, Davao,</strong> and <strong>Cagayan de Oro</strong>, highlighting
                                        the TSAs with the highest call volumes and the most successful engagements with clients.
                                    </p>
                                    <SearchFilters
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        startDate={startDate}
                                        setStartDate={setStartDate}
                                        endDate={endDate}
                                        setEndDate={setEndDate}
                                    />
                                    {/* Loader or Table */}
                                    {loading ? (
                                        <div className="flex justify-center items-center py-10">
                                            <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                                            <span className="ml-2 text-xs text-gray-500">Loading data...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Table
                                                posts={filteredAccounts}
                                            />
                                        </>
                                    )}
                                </div>
                                <ToastContainer className="text-xs" autoClose={1000} />
                            </div>
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ListofUser;
