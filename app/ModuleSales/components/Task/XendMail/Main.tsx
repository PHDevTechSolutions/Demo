"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LeftColumn from "./Columns/Left";
import Form from "./Form";
import { MdEdit } from 'react-icons/md';

interface UserDetails {
    ReferenceID: string;
    Firstname: string;
    Lastname: string;
    Role: string;
    Email: string;
    ImapHost: string;
    ImapPass: string;
    [key: string]: any;
}

interface EmailData {
    from: { text: string };
    to: string;
    cc: string;
    subject: string;
    date: string;
    messageId: string;
    body: string;
    attachments: {
        filename: string;
        contentType: string;
        content: string;
    }[];
}

interface MainProps {
    userDetails: UserDetails;
}

const PAGE_SIZE = 10;

const Main: React.FC<MainProps> = ({ userDetails }) => {
    const [emails, setEmails] = useState<EmailData[]>([]);
    const [allEmails, setAllEmails] = useState<EmailData[]>([]);
    const [loading, setLoading] = useState(false);
    const [imapPass, setImapPass] = useState(userDetails.ImapPass || "");
    const [fetchedCount, setFetchedCount] = useState(0);
    const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
    const [composeOpen, setComposeOpen] = useState(false);
    const [replyMode, setReplyMode] = useState(false);
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    // Auto-fetch kung may laman ang imapPass
    useEffect(() => {
        if (imapPass) fetchEmails();
    }, [imapPass]);

    const fetchEmails = async () => {
        if (!imapPass) {
            setAllEmails([]);
            setEmails([]);
            setFetchedCount(0);
            return;
        }

        if (!userDetails.ReferenceID || !userDetails.ImapHost || !userDetails.Email)
            return toast.error("ReferenceID, ImapHost, and Email are required.");

        setLoading(true);
        try {
            const updateRes = await fetch("/api/updateImap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    referenceID: userDetails.ReferenceID,
                    imapHost: userDetails.ImapHost,
                    imapPass,
                }),
            });

            if (!updateRes.ok) throw new Error("Failed to update IMAP password");

            const emailRes = await fetch("/api/ModuleSales/Task/XendMail/Fetch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userDetails.Email,
                    imapHost: userDetails.ImapHost,
                    imapPass,
                    imapPort: 993,
                    secure: true,
                }),
            });

            const data: any = await emailRes.json();

            if (!Array.isArray(data)) {
                console.warn("Fetch returned non-array data:", data);
                setAllEmails([]);
                setEmails([]);
                setFetchedCount(0);
                return;
            }

            const sortedData: EmailData[] = data.sort(
                (a: EmailData, b: EmailData) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setAllEmails(sortedData);
            setEmails(sortedData.slice(0, PAGE_SIZE));
            setFetchedCount(Math.min(PAGE_SIZE, sortedData.length));
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Error fetching emails");
            setAllEmails([]);
            setEmails([]);
            setFetchedCount(0);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const nextCount = Math.min(fetchedCount + PAGE_SIZE, allEmails.length);
        setEmails(allEmails.slice(0, nextCount));
        setFetchedCount(nextCount);
    };

    const sendEmail = async () => {
        if (!to || !subject || !body) return toast.error("Please fill in all fields.");

        try {
            const res = await fetch("/api/ModuleSales/Task/XendMail/Send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    from: userDetails.Email,
                    to,
                    subject,
                    message: body,
                    smtpHost: "mail.ecoshiftcorp.com",
                    smtpPort: 465,
                    smtpPass: userDetails.ImapPass,
                    secure: true,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send email");

            toast.success("Email sent successfully!");
            setComposeOpen(false);
            setReplyMode(false);
            setTo("");
            setSubject("");
            setBody("");
        } catch (err: any) {
            console.error("Send error:", err);
            toast.error(err.message || "Error sending email");
        }
    };

    // Reply handler
    const handleReply = () => {
        if (!selectedEmail) return;
        setTo(selectedEmail.from.text);
        setSubject(`Re: ${selectedEmail.subject}`);
        setBody(`\n\n--- Original Message ---\n${selectedEmail.body}`);
        setComposeOpen(true);
        setReplyMode(true);
    };

    const handleDelete = async () => {
        if (!selectedEmail) return toast.error("No email selected to delete.");

        if (!confirm("Are you sure you want to delete this email?")) return;

        try {
            const res = await fetch("/api/ModuleSales/Task/XendMail/Delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userDetails.Email,
                    imapPass: imapPass,
                    messageId: selectedEmail.messageId,
                    imapHost: userDetails.ImapHost, // optional but safer
                    imapPort: 993,                   // optional
                    secure: true                      // optional
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete email");

            toast.success("Email deleted successfully!");
            setSelectedEmail(null);
            fetchEmails(); // refresh email list
        } catch (err: any) {
            console.error("Delete error:", err);
            toast.error(err.message || "Error deleting email");
        }
    };

    return (
        <div className="w-full bg-white">
            <h2 className="text-lg p-4 font-semibold text-black">Xend-Mail</h2>
            <p className="text-sm text-gray-500 px-4 mb-4">
                This section allows you to send, receive, and manage your emails.
            </p>

            <div className="w-full p-4 grid grid-cols-3 border-r border-t">
                <LeftColumn
                    emails={emails}
                    selectedEmail={selectedEmail}
                    setSelectedEmail={setSelectedEmail}
                    imapPass={imapPass}
                    setImapPass={setImapPass}
                    fetchEmails={fetchEmails}
                    fetchedCount={fetchedCount}
                    allEmails={allEmails}
                    loadMore={loadMore}
                    loading={loading}
                />

                <div className="col-span-2 p-4 border-l max-h-[80vh] overflow-y-auto">
                    {/* Compose Button */}
                    <div className="flex justify-between items-center mb-2 border-b">
                        <button
                            className="bg-blue-800 text-white px-3 py-2 rounded hover:bg-blue-900 text-xs mb-2 flex items-center gap-1"
                            onClick={() => { setComposeOpen(!composeOpen); setReplyMode(false); }}
                        >
                            <MdEdit size={20} /> Compose
                        </button>
                    </div>

                    {composeOpen && (
                        <Form
                            from={userDetails.Email}
                            to={to}
                            subject={subject}
                            body={body}
                            setTo={setTo}
                            setSubject={setSubject}
                            setBody={setBody}
                            sendEmail={sendEmail}
                        />
                    )}

                    {!composeOpen && !selectedEmail && (
                        <p className="text-gray-500">Select an email to view its content or click Compose to send a new email.</p>
                    )}

                    {!composeOpen && selectedEmail && (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold mb-2">{selectedEmail.subject}</h3>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
                                        onClick={handleReply}
                                    >
                                        Reply
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                                From: {selectedEmail.from.text} | To: {selectedEmail.to} | CC: {selectedEmail.cc}
                            </p>
                            <p className="text-sm whitespace-pre-wrap">{selectedEmail.body}</p>

                            {/* Attachments */}
                            {selectedEmail.attachments.length > 0 && (
                                <div className="mt-4">
                                    <ul className="text-sm">
                                        {[...selectedEmail.attachments].reverse().map((att, idx) => {
                                            const byteCharacters = atob(att.content);
                                            const byteNumbers = new Array(byteCharacters.length);
                                            for (let i = 0; i < byteCharacters.length; i++) {
                                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                                            }
                                            const byteArray = new Uint8Array(byteNumbers);
                                            const blob = new Blob([byteArray], { type: att.contentType });
                                            const url = URL.createObjectURL(blob);

                                            const isImage = att.contentType.startsWith("image/");
                                            const isPdf = att.contentType === "application/pdf";

                                            return (
                                                <li key={idx} className="mb-2">
                                                    {isImage && (
                                                        <img src={url} alt={att.filename} className="max-w-full max-h-60 mb-1 border" />
                                                    )}
                                                    {isPdf && (
                                                        <embed src={url} type="application/pdf" className="w-full h-60 mb-1 border" />
                                                    )}
                                                    <div>
                                                        <button
                                                            className="text-blue-600 underline hover:text-blue-800 text-sm"
                                                            onClick={() => {
                                                                const link = document.createElement("a");
                                                                link.href = url;
                                                                link.download = att.filename;
                                                                link.click();
                                                                URL.revokeObjectURL(url);
                                                            }}
                                                        >
                                                            {att.filename} (Download)
                                                        </button>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <ToastContainer className="text-xs" autoClose={1000} />
            </div>
        </div>
    );
};

export default Main;
