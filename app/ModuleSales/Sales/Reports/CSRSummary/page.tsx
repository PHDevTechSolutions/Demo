"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Components
import Form from "../../../components/Routes/Form/CS_Form";
import Filters from "../../../components/Routes/Filters/CS_Filters";
import Table from "../../../components/Routes/Table/CR_Table";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListofUser: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [referenceid, setReferenceID] = useState("");
    const [manager, setManager] = useState("");
    const [tsm, setTsm] = useState("");

    const [userDetails, setUserDetails] = useState({
        UserId: "",
        ReferenceID: "",
        Manager: "",
        TSM: "",
        Firstname: "",
        Lastname: "",
        Email: "",
        Role: "",
        Department: "",
        Company: "",
    });

    const [tsaOptions, setTSAOptions] = useState<{ value: string, label: string }[]>([]);
    const [tsmOptions, setTSMOptions] = useState<{ value: string, label: string }[]>([]);
    const [selectedAgent, setSelectedAgent] = useState("");
    const [selectedTSM, setSelectedTSM] = useState("");
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

                    setReferenceID(data.ReferenceID || "");
                    setManager(data.Manager || "");
                    setTsm(data.TSM || "");
                } catch (err) {
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
            const response = await fetch("/api/ModuleSales/Reports/FetchCSR");
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
                const matchesSearchTerm = post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase());
                const postDate = post.date_created ? new Date(post.date_created) : null;
                const isWithinDateRange =
                    (!startDate || (postDate && postDate >= new Date(startDate))) &&
                    (!endDate || (postDate && postDate <= new Date(endDate)));
                const isFromCSRInquiries =
                    post?.typeclient?.toLowerCase() === "csr inquiries" ||
                    post?.typeclient?.toLowerCase() === "csr client";

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

                return (
                    matchesSearchTerm &&
                    isWithinDateRange &&
                    isFromCSRInquiries &&
                    matchesRole &&
                    matchesAgentFilter &&
                    matchesTSMFilter
                );
            })
            .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
        : [];

    const handleEdit = (post: any) => {
        setEditUser(post);
        setShowForm(true);
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("CSR Inquiries");

        worksheet.columns = [
            { header: "Date Created", key: "date_created", width: 20 },
            { header: "Company Name", key: "companyname", width: 25 },
            { header: "Contact Person", key: "contactperson", width: 25 },
            { header: "Type", key: "typeclient", width: 20 },
            { header: "Status", key: "status", width: 15 },
            { header: "Amount", key: "quotationamount", width: 20 }, // ✅ added
        ];

        filteredAccounts.forEach((item) => {
            worksheet.addRow({
                date_created: item.date_created,
                companyname: item.companyname,
                contactperson: item.contactperson,
                typeclient: item.typeclient,
                status: item.status,
                quotationamount: item.quotationamount || "",
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "csr_inquiries.xlsx");
    };


    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <div className="mx-auto p-4 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-1">
                                {showForm && (
                                    <div
                                        className="fixed inset-0 bg-black bg-opacity-50 z-30"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditUser(null);
                                        }}
                                    ></div>
                                )}
                                <div
                                    className={`fixed top-0 right-0 h-full w-full shadow-lg z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${showForm ? "translate-x-0" : "translate-x-full"}`}
                                >
                                    {showForm && (
                                        <Form
                                            onCancel={() => {
                                                setShowForm(false);
                                                setEditUser(null);
                                            }}
                                            refreshPosts={fetchAccount}
                                            userDetails={{
                                                id: editUser ? editUser.id : userDetails.UserId,
                                                referenceid: editUser ? editUser.referenceid : userDetails.ReferenceID,
                                                manager: editUser ? editUser.manager : userDetails.Manager,
                                                tsm: editUser ? editUser.tsm : userDetails.TSM,
                                            }}
                                            editUser={editUser}
                                        />
                                    )}
                                </div>

                                <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                                    <h2 className="text-lg font-bold mb-2">CSR Inquiry Summary</h2>
                                    <p className="text-xs text-gray-600 mb-4">
                                        This section provides an organized overview of <strong>client accounts</strong> handled by the Sales team. It enables users
                                        to efficiently monitor account status, track communications, and manage key activities and deliverables.
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

                                                <button
                                                    onClick={exportToExcel}
                                                    className="bg-green-700 hover:bg-green-800 text-white text-xs px-4 py-2 rounded whitespace-nowrap"
                                                >
                                                    Export to Excel
                                                </button>
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

                                    {loading ? (
                                        <div className="animate-pulse p-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                                            <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
                                            <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <Table posts={filteredAccounts} handleEdit={handleEdit} />
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
