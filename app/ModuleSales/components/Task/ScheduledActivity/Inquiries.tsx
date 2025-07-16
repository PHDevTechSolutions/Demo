import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InquiriesContainer from "./InquiriesContainer";

interface Post {
    ticketreferencenumber: string;
    status?: string;
    date_created: string;
    wrapup?: string;
    referenceid?: string;
    csragent?: string;
    companyname?: string;
    contactperson?: string;
    contactnumber?: string;
    emailaddress?: string;
    address?: string;
    id: string; // You need an `id` field for keys and expansion
    typeclient?: string;
}

interface InquiriesProps {
    activeTab: string;
    formatDistanceToNow: (date: Date, options?: any) => string;
    CiLocationArrow1: React.ComponentType<any>;
    fetchAccount: () => void;
    TargetQuota: string;
}

const Inquiries: React.FC<InquiriesProps> = ({
    activeTab,
    formatDistanceToNow,
    CiLocationArrow1,
    fetchAccount,
    TargetQuota,
}) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [userDetails, setUserDetails] = useState({
        UserId: "",
        Firstname: "",
        Lastname: "",
        Email: "",
        Role: "",
        Department: "",
        Company: "",
        TargetQuota: "",
        ReferenceID: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [discardId, setDiscardId] = useState<string | null>(null);

    // Fetch user details on mount
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
                    setLoading(false);
                }
            } else {
                setError("User ID is missing.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Fetch inquiries list
    const fetchInquiries = async () => {
        try {
            const response = await fetch("/api/ModuleSales/Task/CSRInquiries/FetchInquiries");
            const data = await response.json();
            setPosts(data.data);
        } catch (error) {
            toast.error("Error fetching inquiries.");
            console.error("Error Fetching", error);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    // Create new inquiry post
    const handlePost = async (post: Post) => {
        try {
            const postData = { ...post, targetquota: TargetQuota };
            const response = await fetch("/api/ModuleSales/Task/CSRInquiries/CreateUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData),
            });
            const result = await response.json();

            if (result.success) {
                toast.success("Post submitted successfully!");
                fetchAccount();
                fetchInquiries();
            } else {
                toast.error(`Failed to submit post: ${result.error}`);
            }
        } catch (error) {
            toast.error("An error occurred while submitting the post.");
        }
    };

    // Discard inquiry
    const doDiscard = async (id: string) => {
        try {
            const response = await fetch(
                "/api/ModuleSales/Task/CSRInquiries/DiscardData",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                }
            );
            const result = await response.json();

            if (result.success) {
                toast.success("Inquiry discarded successfully.");
                await fetchInquiries();
                fetchAccount();
            } else {
                toast.error(`Failed to discard inquiry: ${result.error}`);
            }
        } catch (error) {
            toast.error("An error occurred while discarding the inquiry.");
            console.error(error);
        }
    };

    /* function passed to child – just opens modal */
    const askDiscard = (id: string) => setDiscardId(id);

    /* modal actions */
    const closeModal = () => setDiscardId(null);
    const confirmModal = () => {
        if (discardId) doDiscard(discardId);
        closeModal();
    };


    // Filter and sort posts for display
    const filteredPosts = posts
        .filter(
            (post) =>
                (post.referenceid === userDetails.ReferenceID || userDetails.Role === "Special Access") &&
                post.status !== "Used" && post.status !== "Wrong Tagging"
        )
        .sort(
            (a, b) =>
                new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
        );

    if (loading) return <p>Loading user data...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <>
            <ToastContainer />
            <InquiriesContainer
                filteredPosts={filteredPosts}
                activeTab={activeTab}
                formatDistanceToNow={formatDistanceToNow}
                CiLocationArrow1={CiLocationArrow1}
                handlePost={handlePost}
                handleDiscard={askDiscard}
                userDetails={userDetails}
            />

            {discardId && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg w-[280px] p-4">
                        <h2 className="text-sm font-bold mb-2">Discard Inquiry</h2>
                        <p className="text-xs mb-4">
                            Are you sure you want to discard this inquiry?
                        </p>
                        <div className="flex justify-end gap-2 text-xs">
                            <button className="px-3 py-1 rounded bg-gray-200" onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className="px-3 py-1 rounded bg-red-500 text-white"
                                onClick={confirmModal}
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Inquiries;
