import React, { useState, useMemo } from "react";
import TableView from "../../Routes/Table/SA_Table";
import Pagination from "../../Routes/Pagination/SA_Pagination";
import GridView from "./GridView";
import CardView from "./CardView";
import Form from "../../Routes/Form/SA_Form";
import PersonalModalForm from "../../Routes/Modal/PM_Modal";

import { FaTable, FaTasks, FaCalendarAlt } from "react-icons/fa";
import { CiSquarePlus } from "react-icons/ci";
import { ToastContainer, toast } from "react-toastify";

interface Post {
    id: string;
    companyname: string;
    contactperson: string;
    contactnumber: string;
    typeclient: string;
    activitystatus: string;
    activityremarks: string;
    ticketreferencenumber: string;
    date_created: string;
    date_updated: string | null;
    activitynumber: string;
}

interface MainCardTableProps {
    posts: Post[];
    userDetails: {
        UserId: string;
        Firstname: string;
        Lastname: string;
        Email: string;
        Role: string;
        Department: string;
        Company: string;
        TargetQuota: string;
        ReferenceID: string;
        Manager: string;
        TSM: string;
    };
    fetchAccount: () => void;
}

const POSTS_PER_PAGE = 20;

const MainCardTable: React.FC<MainCardTableProps> = ({
    posts,
    userDetails,
    fetchAccount,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [view, setView] = useState<"table" | "grid" | "card">("table");
    const [showMainForm, setShowMainForm] = useState(false);
    const [showPersonalForm, setShowPersonalForm] = useState(false);
    const [editUser, setEditUser] = useState<Post | null>(null);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const currentDatePosts = useMemo(() => {
        const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
        const endIndex = startIndex + POSTS_PER_PAGE;
        return posts.slice(startIndex, endIndex);
    }, [posts, currentPage]);

    const handleEdit = (post: Post) => {
        setEditUser(post);
        setShowMainForm(true);
    };

    const confirmDelete = (id: string) => {
        setPostToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!postToDelete) return;
        try {
            const response = await fetch(`/api/ModuleSales/Task/DailyActivity/DeleteActivity`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: postToDelete }),
            });

            if (response.ok) {
                toast.success("Post deleted successfully.");
                fetchAccount();
            } else {
                toast.error("Failed to delete post.");
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post.");
        } finally {
            setShowDeleteModal(false);
            setPostToDelete(null);
        }
    };

    const closePersonalForm = () => {
        setShowPersonalForm(false);
    };

    return (
        <div className="bg-white col-span-3">
            <div className="mb-2 flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                <div className="flex flex-wrap gap-2 text-[10px] justify-center md:justify-start">
                    <button onClick={() => setView("table")}
                        className={`flex items-center gap-1 px-3 py-1 rounded ${view === "table" ? "bg-blue-400 text-white" : "bg-gray-100"}`}>
                        <FaTable size={12} /> Table
                    </button>
                    <button onClick={() => setView("grid")}
                        className={`flex items-center gap-1 px-3 py-1 rounded ${view === "grid" ? "bg-blue-400 text-white" : "bg-gray-100"}`}>
                        <FaTasks size={12} /> Logs
                    </button>
                    <button onClick={() => setView("card")}
                        className={`flex items-center gap-1 px-3 py-1 rounded ${view === "card" ? "bg-blue-400 text-white" : "bg-gray-100"}`}>
                        <FaCalendarAlt size={12} /> Calendar
                    </button>
                    <button
                        className="flex items-center gap-1 bg-green-700 text-white text-[10px] px-4 py-2 shadow-md rounded hover:bg-green-800 transition"
                        onClick={() => setShowMainForm(true)}>
                        <CiSquarePlus size={15} /> Create Activity
                    </button>
                </div>

                <div className="flex items-center justify-center md:justify-end gap-2 text-[10px] text-gray-600">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {showMainForm ? (
                <Form
                    onCancel={() => {
                        setShowMainForm(false);
                        setEditUser(null);
                    }}
                    refreshPosts={fetchAccount}
                    userDetails={{
                        id: editUser ? editUser.id : userDetails.UserId,
                        referenceid: editUser ? (editUser as any).referenceid : userDetails.ReferenceID,
                        manager: editUser ? (editUser as any).manager : userDetails.Manager,
                        tsm: editUser ? (editUser as any).tsm : userDetails.TSM,
                        targetquota: editUser ? (editUser as any).targetquota : userDetails.TargetQuota,
                    }}
                    editUser={editUser}
                />
            ) : (
                <>
                    {view === "table" && (
                        <TableView
                            posts={currentDatePosts}
                            handleEdit={handleEdit}
                            handleDelete={confirmDelete}
                            refreshPosts={fetchAccount}
                        />
                    )}
                    {view === "grid" && (
                        <GridView posts={currentDatePosts} handleEdit={handleEdit} />
                    )}
                    {view === "card" && (
                        <CardView posts={posts} handleEdit={handleEdit} />
                    )}
                </>
            )}

            {showPersonalForm && (
                <PersonalModalForm
                    onClose={closePersonalForm}
                    userDetails={{
                        referenceid: userDetails.ReferenceID,
                        manager: userDetails.Manager,
                        tsm: userDetails.TSM,
                    }}
                />
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[999]">
                    <div className="bg-white rounded-lg p-4 w-[300px]">
                        <h2 className="text-sm font-bold mb-2">Confirm Delete</h2>
                        <p className="text-xs mb-4">
                            Deleting this activity will <strong>not</strong> remove its historical records.
                            Those entries will remain in the archive unless you delete them from the Historical&nbsp;Records
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-3 py-1 text-xs rounded bg-gray-200"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-1 text-xs rounded bg-red-500 text-white"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default MainCardTable;
