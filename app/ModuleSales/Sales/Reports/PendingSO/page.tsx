"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import Filters from "../../../components/Reports/PendingSO/Filters";
import Table from "../../../components/Reports/PendingSO/Table";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Excel export dependencies
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ListofUser: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [userDetails, setUserDetails] = useState({
        UserId: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "", TargetQuota: "", ReferenceID: "",
    });
    const [tsaOptions, setTSAOptions] = useState<{ value: string, label: string }[]>([]);
    const [selectedAgent, setSelectedAgent] = useState("");

    // Loading states
    const [error, setError] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState<boolean>(true);
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);

    const loading = loadingUser || loadingAccounts; // 🔑 combined state

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
                        Firstname: data.Firstname || "",
                        Lastname: data.Lastname || "",
                        Email: data.Email || "",
                        Role: data.Role || "",
                        Department: data.Department || "",
                        Company: data.Company || "",
                        TargetQuota: data.TargetQuota || "",
                        ReferenceID: data.ReferenceID || "",
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
            const response = await fetch("/api/ModuleSales/Reports/FetchPendingSO");
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

    useEffect(() => {
        const fetchTSA = async () => {
            try {
                let url = "";

                if (userDetails.Role === "Territory Sales Manager" && userDetails.ReferenceID) {
                    url = `/api/fetchtsadata?Role=Territory Sales Associate&tsm=${userDetails.ReferenceID}`;
                } else if (userDetails.Role === "Super Admin") {
                    // Get all TS Associates for Super Admin
                    url = `/api/fetchtsadata?Role=Territory Sales Associate`;
                } else {
                    // Other roles don't fetch TS Associates
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

    const filteredAccounts = Array.isArray(posts)
        ? posts.filter((post) => {
            const matchesSearchTerm = post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase());
            const postDate = post.date_created ? new Date(post.date_created) : null;
            const isWithinDateRange =
                (!startDate || (postDate && postDate >= new Date(startDate))) &&
                (!endDate || (postDate && postDate <= new Date(endDate)));
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
            const isSoDone = post?.activitystatus?.toLowerCase() === "so-done";
            const isOverdue =
                isSoDone &&
                postDate &&
                (new Date().getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24) > 15;
            return (
                matchesSearchTerm &&
                isWithinDateRange &&
                isOverdue &&
                matchesRole &&
                matchesAgentFilter
            );
        }).sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
        : [];

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Pending SO");

        worksheet.columns = [
            { header: "Company Name", key: "companyname", width: 25 },
            { header: "Contact Person", key: "contactperson", width: 20 },
            { header: "SO Number", key: "sonumber", width: 15 },
            { header: "SO Amount", key: "soamount", width: 15 },
            { header: "Status", key: "activitystatus", width: 15 },
            { header: "Remarks", key: "remarks", width: 25 },
            { header: "Date Created", key: "date_created", width: 20 },
        ];

        filteredAccounts.forEach((post) => {
            worksheet.addRow({
                companyname: post.companyname,
                contactperson: post.contactperson,
                sonumber: post.sonumber,
                soamount: post.soamount,
                activitystatus: post.activitystatus,
                remarks: post.remarks,
                date_created: new Date(post.date_created).toLocaleString(),
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Pending_SO_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1">
                                <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                    <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                                        <div className="mb-4 md:mb-0">
                                            <h2 className="text-lg font-bold mb-2">Pending SO</h2>
                                            <p className="text-xs text-gray-600 mb-4">
                                                This section provides an organized overview of <strong>client accounts</strong> handled by the Sales team. It enables users to efficiently monitor account status, track communications, and manage key activities and deliverables.
                                            </p>
                                        </div>
                                    </div>

                                    {(userDetails.Role === "Territory Sales Manager" || userDetails.Role === "Super Admin") && (
                                        <div className="mb-4 flex items-center space-x-4">
                                            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                                Filter by Agent
                                            </label>
                                            <select
                                                className="w-full md:w-1/3 border rounded px-3 py-2 text-xs capitalize"
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
                                            <button
                                                onClick={exportToExcel}
                                                className="bg-green-700 hover:bg-green-800 text-white text-xs px-4 py-2 rounded whitespace-nowrap"
                                            >
                                                Export to Excel
                                            </button>
                                            <h1 className="text-xs bg-orange-500 text-white p-2 rounded shadow-sm">Total Companies: <span className="font-bold">{filteredAccounts.length}</span></h1>
                                        </div>

                                    )}

                                    <Filters
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
                                            <Table posts={filteredAccounts} />
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
