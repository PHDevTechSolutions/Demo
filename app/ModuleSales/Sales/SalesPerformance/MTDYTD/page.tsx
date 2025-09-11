"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import AddPostForm from "../../../components/ClientActivityBoard/ListofCompanies/AddUserForm";
import SearchFilters from "../../../components/SalesPerformance/MTDYTD/SearchFilters";
import UsersTable from "../../../components/SalesPerformance/MTDYTD/UsersTable";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ListofUser: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
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

    const [tsaOptions, setTSAOptions] = useState<{ value: string, label: string }[]>([]);
    const [tsmOptions, setTSMOptions] = useState<{ value: string, label: string }[]>([]);
    const [selectedAgent, setSelectedAgent] = useState("");
    const [selectedTSM, setSelectedTSM] = useState("");

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

    const fetchAccount = async () => {
        setLoadingAccounts(true);
        try {
            const response = await fetch("/api/ModuleSales/SalesConversion/FetchSales");
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

    // Fetch TSA options
    useEffect(() => {
        const fetchTSA = async () => {
            try {
                let url = "";

                if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
                    url = `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`;
                } else if (userDetails.Role === "Super Admin" || userDetails.Role === "Manager") {
                    url = `/api/fetchtsadata?Role=Territory Sales Associate`;
                } else {
                    return;
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch agents");

                const data = await response.json();

                const options = data.map((user: any) => ({
                    value: user.ReferenceID,
                    label: `${user.Firstname} ${user.Lastname}`,
                }));

                setTSAOptions(options);
            } catch (error) {
                console.error("Error fetching agents:", error);
            }
        };

        fetchTSA();
    }, [userDetails.ReferenceID, userDetails.Role]);

    // Fetch TSM options (for Manager)
    useEffect(() => {
        const fetchTSM = async () => {
            if (userDetails.Role !== "Manager") return;
            try {
                const response = await fetch(`/api/fetchtsadata?Role=Territory Sales Manager`);
                if (!response.ok) throw new Error("Failed to fetch TSMs");

                const data = await response.json();
                setTSMOptions(data.map((user: any) => ({
                    value: user.ReferenceID,
                    label: `${user.Firstname} ${user.Lastname}`,
                })));
            } catch (err) {
                console.error("Error fetching TSM:", err);
            }
        };

        fetchTSM();
    }, [userDetails.Role]);

    // Filter users by search term (firstname, lastname)
    const filteredAccounts = Array.isArray(posts)
        ? posts
            .filter((post) => {
                const agent = usersList.find((user) => user.ReferenceID === post.referenceid);
                const agentFirstname = agent ? agent.Firstname.toLowerCase() : "";
                const agentLastname = agent ? agent.Lastname.toLowerCase() : "";
                const searchLower = searchTerm.toLowerCase();

                const matchesSearchTerm =
                    agentFirstname.includes(searchLower) || agentLastname.includes(searchLower);

                const matchesClientType = selectedClientType
                    ? post?.typeclient === selectedClientType
                    : true;

                const referenceID = userDetails.ReferenceID;

                const matchesRole =
                    userDetails.Role === "Super Admin" || userDetails.Role === "Special Access"
                        ? true
                        : userDetails.Role === "Territory Sales Associate"
                            ? post?.referenceid === referenceID
                            : userDetails.Role === "Territory Sales Manager"
                                ? post?.tsm === referenceID
                                : userDetails.Role === "Manager"
                                    ? post?.manager === referenceID
                                    : false;

                const matchesAgentFilter = !selectedAgent || post?.referenceid === selectedAgent;
                const matchesTSMFilter = !selectedTSM || post?.tsm === selectedTSM;

                return matchesSearchTerm && matchesClientType && matchesRole && matchesAgentFilter && matchesTSMFilter;
            })
            .map((post) => {
                const agent = usersList.find((user) => user.ReferenceID === post.referenceid);

                return {
                    ...post,
                    AgentFirstname: agent ? agent.Firstname : "Unknown",
                    AgentLastname: agent ? agent.Lastname : "Unknown",
                };
            })
            .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()) // Sorting by date_created
        : [];


    // Handle editing a post
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
                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                                {showForm ? (
                                    <AddPostForm
                                        onCancel={() => {
                                            setShowForm(false);
                                            setEditUser(null);
                                        }}
                                        refreshPosts={fetchAccount}  // Pass the refreshPosts callback
                                        userDetails={{ id: editUser ? editUser.id : userDetails.UserId }}  // Ensure id is passed correctly
                                        editUser={editUser}
                                    />
                                ) : (
                                    <>
                                        <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                            <h2 className="text-lg font-bold mb-2">Agent Sales Performance Overview</h2>
                                            <p className="text-xs text-gray-600 mb-2">
                                                This section provides an overview of each agent’s sales performance, tracking both Month-to-Date (MTD) and Year-to-Date (YTD) sales.
                                                It assesses whether they are meeting sales targets and evaluates their performance based on achievements and overall sales ratings.
                                            </p>

                                            {(userDetails.Role === "Territory Sales Manager" ||
                                                userDetails.Role === "Super Admin" ||
                                                userDetails.Role === "Manager") && (
                                                    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                                        {/* Filter by Agent (TSA) */}
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Filter by Agent (TSA)
                                                            </label>
                                                            <select
                                                                className="w-full border rounded px-3 py-2 text-xs capitalize"
                                                                value={selectedAgent}
                                                                onChange={(e) => setSelectedAgent(e.target.value)}
                                                            >
                                                                <option value="">All Agents</option>
                                                                {tsaOptions.map((agent) => (
                                                                    <option key={agent.value} value={agent.value}>
                                                                        {agent.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Filter by TSM (only for Manager role) */}
                                                        {userDetails.Role === "Manager" && (
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Filter by TSM
                                                                </label>
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
                                                    </div>
                                                )}

                                            <SearchFilters
                                                searchTerm={searchTerm}
                                                setSearchTerm={setSearchTerm}
                                            />
                                            {/* Loader or Table */}
                                            {loading ? (
                                                <div className="flex justify-center items-center py-10">
                                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                                                    <span className="ml-2 text-xs text-gray-500">Loading data...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <UsersTable
                                                        posts={filteredAccounts}
                                                        handleEdit={handleEdit}
                                                        ReferenceID={userDetails.ReferenceID}
                                                        fetchAccount={fetchAccount}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}

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
