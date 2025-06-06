"use client";
import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";

// Components
import AddPostForm from "../../../components/Companies/CompanyAccounts/AddUserForm";
import SearchFilters from "../../../components/Companies/CompanyAccounts/SearchFilters";
import UsersTable from "../../../components/Companies/CompanyAccounts/UsersTable";
import Pagination from "../../../components/UserManagement/CompanyAccounts/Pagination";

// Toast Notifications
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ExcelJS from "exceljs";

// Icons
import { CiExport, CiSquarePlus, CiImport, CiSaveUp2, CiTurnL1, CiCircleMinus, CiCirclePlus } from "react-icons/ci";

const ListofUser: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [showImportForm, setShowImportForm] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(12);
    const [selectedClientType, setSelectedClientType] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [startDate, setStartDate] = useState(""); // Default to null
    const [endDate, setEndDate] = useState(""); // Default to null

    const [userDetails, setUserDetails] = useState({
        UserId: "", ReferenceID: "", Manager: "", TSM: "", Firstname: "", Lastname: "", Email: "", Role: "", Department: "", Company: "",
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [referenceid, setReferenceID] = useState("");
    const [manager, setManager] = useState("");
    const [tsm, setTsm] = useState("");
    const [status, setstatus] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [jsonData, setJsonData] = useState<any[]>([]);
    const [isMaximized, setIsMaximized] = useState(false);

    // Handle file selection and read data
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = event.target?.result as ArrayBuffer;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(data);
            const worksheet = workbook.worksheets[0];

            const parsedData: any[] = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header row

                parsedData.push({
                    referenceid,
                    tsm,
                    manager,
                    status,
                    companyname: row.getCell(1).value || "",
                    contactperson: row.getCell(2).value || "",
                    contactnumber: row.getCell(3).value || "",
                    emailaddress: row.getCell(4).value || "",
                    typeclient: row.getCell(5).value || "",
                    address: row.getCell(6).value || "",
                    deliveryaddress: row.getCell(7).value || "",
                    area: row.getCell(8).value || "",
                });
            });

            console.log("Parsed Excel Data:", parsedData);
            setJsonData(parsedData);
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    // Handle file upload
    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file || jsonData.length === 0) {
            toast.error("Please upload a valid file.");
            return;
        }

        try {
            const response = await fetch("/api/ModuleSales/UserManagement/CompanyAccounts/ImportAccounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    referenceid,
                    tsm,
                    manager,
                    status,
                    data: jsonData,
                }),
            });

            const result = await response.json();
            if (result.success) {
                toast.success(`${result.insertedCount} records imported successfully!`);
                setFile(null);
                setJsonData([]);
            } else {
                toast.error(result.message || "Import failed.");
            }
        } catch (error) {
            toast.error("Error uploading file.");
        }
    };

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
                } catch (err: unknown) {
                    console.error("Error fetching user data:", err);
                    setError("Failed to load user data. Please try again later.");
                } finally {
                    setLoading(false);
                }
            } else {
                setError("User ID is missing.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Fetch all users from the API
    const fetchAccount = async () => {
        try {
            const response = await fetch("/api/ModuleSales/UserManagement/CompanyAccounts/FetchAccount");
            const data = await response.json();
            console.log("Fetched data:", data); // Debugging line
            setPosts(data.data); // Make sure you're setting `data.data` if API response has `{ success: true, data: [...] }`
        } catch (error) {
            toast.error("Error fetching users.");
            console.error("Error Fetching", error);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, []);

    // Filter users by search term (firstname, lastname)
    const filteredAccounts = Array.isArray(posts)
        ? posts
            .filter((post) => {
                // Only allow Top 50, Next 30, Balance 20
                const validClientTypes = ["Top 50", "Next 30", "Balance 20"];
                const isValidTypeClient = validClientTypes.includes(post?.typeclient);

                const matchesSearchTerm =
                    post?.companyname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post?.typeclient?.toLowerCase().includes(searchTerm.toLowerCase());

                const postDate = post?.date_created ? new Date(post.date_created) : null;

                const isWithinDateRange =
                    (!startDate || (postDate && postDate >= new Date(startDate))) &&
                    (!endDate || (postDate && postDate <= new Date(endDate + "T23:59:59")));

                const matchesClientType = selectedClientType
                    ? selectedClientType === "null"
                        ? !post?.typeclient || post?.typeclient === null || post?.typeclient === ""
                        : post?.typeclient === selectedClientType
                    : true;

                const matchesStatus = selectedStatus
                    ? post?.status?.toLowerCase() === selectedStatus.toLowerCase()
                    : true;

                const referenceID = userDetails.ReferenceID;

                const matchesRole =
                    userDetails.Role === "Super Admin" || userDetails.Role === "Special Access"
                        ? true
                        : userDetails.Role === "Territory Sales Associate" || userDetails.Role === "Territory Sales Manager"
                            ? post?.referenceid === referenceID
                            : false;

                const isActiveOrUsed = post?.status === "Active" || post?.status === "On Hold" || post?.status === "Used";

                return (
                    isValidTypeClient && // ✅ Only allow Top 50, Next 30, Balance 20
                    matchesSearchTerm &&
                    isWithinDateRange &&
                    matchesClientType &&
                    matchesStatus &&
                    matchesRole &&
                    isActiveOrUsed
                );
            })
            .sort((a, b) => {
                const companyNameA = a.companyname?.toLowerCase() || "";
                const companyNameB = b.companyname?.toLowerCase() || "";

                const numFirstA = companyNameA.match(/^\d+/) ? parseInt(companyNameA.match(/^\d+/)[0], 10) : Infinity;
                const numFirstB = companyNameB.match(/^\d+/) ? parseInt(companyNameB.match(/^\d+/)[0], 10) : Infinity;

                if (numFirstA !== numFirstB) {
                    return numFirstA - numFirstB;
                }

                return companyNameA.localeCompare(companyNameB);
            })
        : [];

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredAccounts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredAccounts.length / postsPerPage);

    // Handle editing a post
    const handleEdit = (post: any) => {
        setEditUser(post);
        setShowForm(true);
    };

    const fieldWidthClass = isMaximized ? "w-full sm:w-1/2 px-4 mb-4" : "w-full px-4 mb-4";

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {(user) => (
                        <>
                            <div className="container mx-auto p-4 text-gray-900">
                                <div className="grid grid-cols-1 md:grid-cols-1">
                                    {/* Backdrop overlay */}
                                    {(showForm || showImportForm) && (
                                        <div
                                            className="fixed inset-0 bg-black bg-opacity-50 z-30"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditUser(null);
                                                setShowImportForm(false);
                                            }}
                                        ></div>
                                    )}

                                    <div
                                        className={`fixed top-0 right-0 h-full w-full shadow-lg z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${(showForm || showImportForm) ? "translate-x-0" : "translate-x-full"
                                            }`}
                                    >
                                        {showForm ? (
                                            <AddPostForm
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
                                        ) : showImportForm ? (
                                            <div className={`bg-white text-gray-900 rounded-lg p-4 text-xs mt-20 transition-all duration-300 fixed right-0 w-full ${isMaximized ? "max-w-7xl" : "max-w-md"
                                                }`}>

                                                <form onSubmit={handleFileUpload}>
                                                    {/* Buttons */}
                                                    <div className="flex justify-end mb-4 gap-1">
                                                        <button
                                                            type="button"
                                                            className="px-4 py-2 border rounded text-xs flex gap-1"
                                                            onClick={() => setIsMaximized(!isMaximized)}
                                                        >
                                                            {isMaximized ? <CiCircleMinus size={15} /> : <CiCirclePlus size={15} />}
                                                            {isMaximized ? "Minimize" : "Maximize"}
                                                        </button>
                                                        <button type="submit" className="bg-blue-500 text-xs text-white px-4 py-2 rounded flex items-center gap-1">
                                                            <CiSaveUp2 size={15} /> Upload
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="border text-xs px-4 py-2 rounded flex items-center gap-1"
                                                            onClick={() => setShowImportForm(false)}
                                                        >
                                                            <CiTurnL1 size={15} /> Back
                                                        </button>
                                                    </div>

                                                    <h2 className="text-lg font-bold mb-2">Account Import Section</h2>
                                                    <p className="text-xs text-gray-600 mb-4">
                                                        The <strong>Account Import Section</strong> allows users to upload and integrate bulk account data into the system.
                                                    </p>
                                                    <div className={`flex flex-wrap -mx-4`}>
                                                        {/* Reference Info */}
                                                        <div className={fieldWidthClass}>
                                                            <label className="block text-xs font-bold mb-2">Territory Sales Associate</label>
                                                            <input type="text" id="referenceid" value={referenceid} className="w-full px-3 py-2 border rounded text-xs capitalize" readOnly />
                                                            <input type="hidden" id="manager" value={manager} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                                                            <input type="hidden" id="tsm" value={tsm} className="w-full px-3 py-2 border rounded text-xs capitalize" />
                                                        </div>

                                                        {/* Status */}
                                                        <div className={fieldWidthClass}>
                                                            <label className="block text-xs font-bold mb-2">Status</label>
                                                            <select
                                                                value={status}
                                                                onChange={(e) => setstatus(e.target.value)}
                                                                className="w-full px-3 py-2 border rounded text-xs capitalize"
                                                            >
                                                                <option value="">Select Status</option>
                                                                <option value="Active">Active</option>
                                                            </select>
                                                            <p className="text-xs text-gray-600 mt-2">
                                                                Select the <strong>Status</strong> of the account.
                                                            </p>
                                                        </div>

                                                        {/* File Upload - Excel Only */}
                                                        <div className={fieldWidthClass}>
                                                            <label className="block text-xs font-bold mb-2">Excel File</label>
                                                            <input
                                                                type="file"
                                                                accept=".xls,.xlsx"
                                                                className="w-full px-3 py-2 border rounded text-xs"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const isExcel = file.name.endsWith(".xls") || file.name.endsWith(".xlsx");
                                                                        if (!isExcel) {
                                                                            alert("Only Excel files (.xls, .xlsx) are allowed.");
                                                                            e.target.value = ""; // Reset file input
                                                                            return;
                                                                        }
                                                                        handleFileChange(e);
                                                                    }
                                                                }}
                                                            />
                                                            <p className="text-xs text-gray-600 mt-2">
                                                                Upload an Excel file (.xls, .xlsx) from your device.
                                                            </p>
                                                        </div>

                                                    </div>
                                                </form>

                                                {/* Preview Table */}
                                                {jsonData.length > 0 && (
                                                    <div className="mt-4">
                                                        <h3 className="text-sm font-bold mb-2">Preview Data ({jsonData.length} records)</h3>
                                                        <div className="overflow-auto max-h-64 border rounded-md">
                                                            <table className="min-w-full table-auto">
                                                                <thead className="bg-gray-100">
                                                                    <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
                                                                        <th className="px-6 py-4 font-semibold text-gray-700">Company Name</th>
                                                                        <th className="px-6 py-4 font-semibold text-gray-700">Contact Person</th>
                                                                        <th className="px-6 py-4 font-semibold text-gray-700">Contact Number</th>
                                                                        <th className="px-6 py-4 font-semibold text-gray-700">Email Address</th>
                                                                        <th className="px-6 py-4 font-semibold text-gray-700">Type of Client</th>
                                                                        <th className="px-6 py-4 font-semibold text-gray-700">Complete Address</th>
                                                                        <th className="px-6 py-4 font-semibold text-gray-700">Delivery Address</th>
                                                                        <th className="px-6 py-4 font-semibold text-gray-700">Region</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {jsonData.map((item, index) => (
                                                                        <tr key={index} className="border-b whitespace-nowrap">
                                                                            <td className="px-6 py-4 text-xs uppercase">{item.companyname}</td>
                                                                            <td className="px-6 py-4 text-xs capitalize">{item.contactperson}</td>
                                                                            <td className="px-6 py-4 text-xs">{item.contactnumber}</td>
                                                                            <td className="px-6 py-4 text-xs">{item.emailaddress}</td>
                                                                            <td className="px-6 py-4 text-xs">{item.typeclient}</td>
                                                                            <td className="px-6 py-4 text-xs">{item.address}</td>
                                                                            <td className="px-6 py-4 text-xs">{item.deliveryaddress}</td>
                                                                            <td className="px-6 py-4 text-xs">{item.area}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-1 border bg-white text-black text-xs px-4 py-2 shadow-sm rounded hover:bg-green-600 hover:text-white transition" onClick={() => setShowImportForm(true)}>
                                                <CiImport size={15} /> Import Account
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4 p-4 bg-white shadow-md rounded-lg text-gray-900">
                                        <h2 className="text-lg font-bold mb-2">List of Accounts - Active</h2>
                                        <p className="text-xs text-gray-600 mb-4">
                                            The <strong>Company Accounts Overview</strong> section displays a comprehensive list of all accounts related to various companies. It allows users to filter accounts based on various criteria like client type, date range, and more, ensuring efficient navigation and analysis of company data. The table below showcases the detailed information about each account.
                                        </p>
                                        <SearchFilters
                                            searchTerm={searchTerm}
                                            setSearchTerm={setSearchTerm}
                                            postsPerPage={postsPerPage}
                                            setPostsPerPage={setPostsPerPage}
                                            selectedClientType={selectedClientType}
                                            setSelectedClientType={setSelectedClientType}
                                            selectedStatus={selectedStatus}
                                            setSelectedStatus={setSelectedStatus}
                                            startDate={startDate}
                                            setStartDate={setStartDate}
                                            endDate={endDate}
                                            setEndDate={setEndDate}
                                        />
                                        <UsersTable
                                            posts={currentPosts}
                                            handleEdit={handleEdit}
                                            referenceid={referenceid}
                                            fetchAccount={fetchAccount}
                                            Role={userDetails.Role}
                                        />
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            setCurrentPage={setCurrentPage}
                                        />

                                        <div className="text-xs mt-2">
                                            Showing {indexOfFirstPost + 1} to{" "}
                                            {Math.min(indexOfLastPost, filteredAccounts.length)} of{" "}
                                            {filteredAccounts.length} entries
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ToastContainer className="text-xs" autoClose={1000} />
                        </>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default ListofUser;