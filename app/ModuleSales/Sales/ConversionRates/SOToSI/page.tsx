"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import SearchFilters from "../../../components/Routes/Filters/CQ_Filters";
import UsersTable from "../../../components/Routes/Table/SS_Table";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ListofUser: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClientType, setSelectedClientType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [userDetails, setUserDetails] = useState({
        UserId: "", ReferenceID: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "",
    });
    const [usersList, setUsersList] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState<boolean>(true);
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);

    const [tsaOptions, setTSAOptions] = useState<{ value: string, label: string }[]>([]);
    const [tsmOptions, setTSMOptions] = useState<{ value: string, label: string }[]>([]);
    const [selectedAgent, setSelectedAgent] = useState("");
    const [selectedTSM, setSelectedTSM] = useState("");

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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/getUsers");
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
            const response = await fetch("/api/ModuleSales/ConversionRate/FetchSOSI");
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

    // 🔹 Fetch TSA list
    useEffect(() => {
        const fetchTSA = async () => {
            try {
                let url = "";

                if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
                    // TSM → fetch TSA under this TSM
                    url = `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`;
                } else if (userDetails.Role === "Manager" && userDetails.ReferenceID) {
                    // Manager → fetch TSA under this Manager only
                    url = `/api/fetchtsadata?Role=Territory Sales Associate&manager=${userDetails.ReferenceID}`;
                } else if (userDetails.Role === "Super Admin") {
                    // Super Admin → fetch all TSA
                    url = `/api/fetchtsadata?Role=Territory Sales Associate`;
                } else {
                    return;
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch TSA");

                const data = await response.json();

                const options = data.map((user: any) => ({
                    value: user.ReferenceID,
                    label: `${user.Firstname} ${user.Lastname}`,
                }));

                setTSAOptions(options);
            } catch (error) {
                console.error("Error fetching TSA:", error);
            }
        };

        fetchTSA();
    }, [userDetails.ReferenceID, userDetails.Role]);

    // 🔹 Fetch TSM list
    useEffect(() => {
        const fetchTSM = async () => {
            try {
                let url = "";

                if (userDetails.Role === "Manager" && userDetails.ReferenceID) {
                    // Manager → fetch TSM under this Manager only
                    url = `/api/fetchtsadata?Role=Territory Sales Manager&manager=${userDetails.ReferenceID}`;
                } else if (userDetails.Role === "Super Admin") {
                    // Super Admin → fetch all TSM
                    url = `/api/fetchtsadata?Role=Territory Sales Manager`;
                } else if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
                    // TSM → fetch self (optional depende sa gusto mo)
                    url = `/api/fetchtsadata?Role=Territory Sales Manager&tsm=${userDetails.ReferenceID}`;
                } else {
                    return;
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch TSM");

                const data = await response.json();

                const options = data.map((user: any) => ({
                    value: user.ReferenceID,
                    label: `${user.Firstname} ${user.Lastname}`,
                }));

                setTSMOptions(options);
            } catch (error) {
                console.error("Error fetching TSM:", error);
            }
        };

        fetchTSM();
    }, [userDetails.ReferenceID, userDetails.Role]);

    const filteredAccounts = Array.isArray(posts)
        ? posts
            .filter((post) => {
                const agent = usersList.find((user) => user.ReferenceID === post.referenceid);
                const agentFirstname = agent ? agent.Firstname.toLowerCase() : "";
                const agentLastname = agent ? agent.Lastname.toLowerCase() : "";
                const searchLower = searchTerm.toLowerCase();

                const matchesSearchTerm =
                    agentFirstname.includes(searchLower) || agentLastname.includes(searchLower);

                const postDate = post.date_created ? new Date(post.date_created) : null;
                const isWithinDateRange =
                    (!startDate || (postDate && postDate >= new Date(startDate))) &&
                    (!endDate || (postDate && postDate <= new Date(endDate)));

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

                return matchesSearchTerm && isWithinDateRange && matchesClientType && matchesRole && matchesAgentFilter && matchesTSMFilter;
            })
            .map((post) => {
                const agent = usersList.find((user) => user.ReferenceID === post.referenceid);

                return {
                    ...post,
                    AgentFirstname: agent ? agent.Firstname : "Unknown",
                    AgentLastname: agent ? agent.Lastname : "Unknown",
                };
            })
            .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
        : [];

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
                                <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                    <h2 className="text-lg font-bold mb-2">SO To SI</h2>
                                    <p className="text-xs text-gray-600 mb-2">
                                        This section offers a comprehensive overview of each agent's sales performance, tracking both Month-to-Date (MTD) and Year-to-Date (YTD) sales. It highlights the agent’s progress in meeting sales targets and provides a detailed evaluation of their overall performance, including achievements and sales ratings.
                                    </p>

                                    {(userDetails.Role === "Territory Sales Manager" ||
                                        userDetails.Role === "Super Admin" ||
                                        userDetails.Role === "Manager") && (
                                            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
