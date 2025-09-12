"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";
import { MdEdit } from "react-icons/md";

// Dynamic imports
const LeftColumn = dynamic(() => import("./Columns/Left"), { ssr: false });
const RightColumn = dynamic(() => import("./Columns/Right"), { ssr: false });
const Form = dynamic(() => import("./Form"), { ssr: false });

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

interface RecipientField {
    type: "CC" | "BCC" | "Reply-To" | "Followup-To";
    email: string;
}

interface MainProps {
    userDetails: UserDetails;
}

const PAGE_SIZE = 5;

const Main: React.FC<MainProps> = ({ userDetails }) => {
    const [allEmails, setAllEmails] = useState<EmailData[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [imapPass] = useState(userDetails.ImapPass || "");
    const [fetchedCount, setFetchedCount] = useState(0);
    const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
    const [composeOpen, setComposeOpen] = useState(false);
    const [replyMode, setReplyMode] = useState(false);
    const [readEmails, setReadEmails] = useState<Set<string>>(new Set());

    // Compose fields
    const [to, setTo] = useState("");
    const [recipients, setRecipients] = useState<RecipientField[]>([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);

    // Sort emails
    const sortedEmails = useMemo(() => {
        return [...allEmails].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [allEmails]);

    // Paginate
    const emails = useMemo(
        () => sortedEmails.slice(0, fetchedCount),
        [sortedEmails, fetchedCount]
    );

    const saveEmailsToDB = useCallback(async (emails: EmailData[]) => {
        if (!emails.length) return;

        try {
            const res = await fetch("/api/ModuleSales/Task/XendMail/Save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    referenceId: userDetails.ReferenceID,
                    emails,
                }),
            });

            const data = await res.json().catch(async () => ({
                error: await res.text(),
            }));

            if (!res.ok) throw new Error(data.error || "Failed to save emails");

            console.log("✅ Emails saved to DB:", data);
        } catch (err: any) {
            console.error("Save to DB error:", err);
            toast.error("Error saving emails to database");
        }
    }, [userDetails.ReferenceID]);

    // Fetch emails
    const fetchEmails = useCallback(async () => {
        if (!imapPass) return;
        setLoading(true);

        try {
            const res = await fetch("/api/ModuleSales/Task/XendMail/Fetch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userDetails.Email,
                    imapHost: userDetails.ImapHost,
                    imapPass: userDetails.ImapPass,
                    imapPort: 993,
                    secure: true,
                }),
            });

            const data = await res.json();

            if (!Array.isArray(data)) {
                console.warn("Fetch returned non-array:", data);
                return toast.error("Invalid email data from server");
            }

            setAllEmails(data);
            setFetchedCount(Math.min(PAGE_SIZE, data.length));

            // Save to cache
            localStorage.setItem("cachedEmails", JSON.stringify(data));

            // Save to DB (no duplicates handled server-side)
            saveEmailsToDB(data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Error fetching emails");
        } finally {
            setLoading(false);
        }
    }, [imapPass, userDetails, saveEmailsToDB]);

    // Auto-refresh on mount
    useEffect(() => {
        // Load cache first
        const cached = localStorage.getItem("cachedEmails");
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed)) {
                    setAllEmails(parsed);
                    setFetchedCount(Math.min(PAGE_SIZE, parsed.length));
                }
            } catch (e) {
                console.warn("Invalid cache data");
            }
        }

        // Fetch latest emails after mount
        fetchEmails();
    }, [fetchEmails]);

    // Load more emails
    const loadMore = useCallback(() => {
        setFetchedCount((prev) => Math.min(prev + PAGE_SIZE, allEmails.length));
    }, [allEmails.length]);

    // Select email
    const handleSelectEmail = (email: EmailData) => {
        setSelectedEmail(email);
        setReadEmails((prev) => new Set(prev).add(email.messageId));
    };

    // Send email
    const sendEmailWithAttachments = async (files: File[]) => {
        if (!to || !subject || !body)
            return toast.error("Please fill in all fields.");
        setSending(true);

        try {
            const attachmentsData = await Promise.all(
                files.map(
                    (file) =>
                        new Promise<{
                            filename: string;
                            content: string;
                            contentType: string;
                        }>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const base64Content = (reader.result as string).split(",")[1];
                                resolve({
                                    filename: file.name,
                                    content: base64Content,
                                    contentType: file.type,
                                });
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        })
                )
            );

            const cc = recipients
                .filter((r) => r.type === "CC")
                .map((r) => r.email)
                .join(",");
            const bcc = recipients
                .filter((r) => r.type === "BCC")
                .map((r) => r.email)
                .join(",");
            const replyTo = recipients
                .filter((r) => r.type === "Reply-To")
                .map((r) => r.email)
                .join(",");
            const followupTo = recipients
                .filter((r) => r.type === "Followup-To")
                .map((r) => r.email)
                .join(",");

            const res = await fetch("/api/ModuleSales/Task/XendMail/Send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    from: userDetails.Email,
                    to,
                    cc,
                    bcc,
                    replyTo,
                    followupTo,
                    subject,
                    message: body,
                    smtpHost: "mail.ecoshiftcorp.com",
                    smtpPort: 465,
                    smtpPass: userDetails.ImapPass,
                    secure: true,
                    attachments: attachmentsData,
                }),
            });

            const data = await res.json().catch(async () => ({
                error: await res.text(),
            }));
            if (!res.ok) throw new Error(data.error || "Failed to send email");

            toast.success("Email sent successfully!");
            resetCompose();

            // Refresh after sending
            fetchEmails();
        } catch (err: any) {
            console.error("Send error:", err);
            toast.error(err.message || "Error sending email");
        } finally {
            setSending(false);
        }
    };

    const resetCompose = () => {
        setComposeOpen(false);
        setReplyMode(false);
        setTo("");
        setRecipients([]);
        setSubject("");
        setBody("");
        setAttachments([]);
    };

    // Reply
    const handleReply = () => {
        if (!selectedEmail) return;
        setSending(true);
        setTimeout(() => {
            setTo(selectedEmail.from.text);
            setRecipients(
                selectedEmail.cc
                    ? selectedEmail.cc
                        .split(",")
                        .map((email) => ({ type: "CC" as const, email }))
                    : []
            );
            setSubject(`Re: ${selectedEmail.subject}`);
            setBody(`\n\n--- Original Message ---\n${selectedEmail.body}`);
            setComposeOpen(true);
            setReplyMode(true);
            setAttachments([]);
            setSending(false);
        }, 200);
    };

    // Forward
    const handleForward = () => {
        if (!selectedEmail) return;
        setSending(true);
        setTimeout(() => {
            setTo("");
            setRecipients([]);
            setSubject(`Fwd: ${selectedEmail.subject}`);
            setBody(
                `\n\n--- Forwarded Message ---\nFrom: ${selectedEmail.from.text}\nTo: ${selectedEmail.to}\nCC: ${selectedEmail.cc}\nDate: ${selectedEmail.date}\n\n${selectedEmail.body}`
            );
            setComposeOpen(true);
            setReplyMode(false);
            setAttachments([]);
            setSending(false);
        }, 200);
    };

    return (
        <div className="w-full bg-white relative">
            {sending && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            )}

            <h2 className="text-lg p-4 font-semibold text-black">Xend-Mail</h2>
            <p className="text-sm text-gray-500 px-4 mb-4">
                This section allows you to send, receive, and manage your emails.
            </p>

            <div className="w-full p-4 grid grid-cols-3 border-r border-t">
                <LeftColumn
                    emails={emails}
                    selectedEmail={selectedEmail}
                    setSelectedEmail={handleSelectEmail}
                    fetchEmails={fetchEmails}
                    fetchedCount={fetchedCount}
                    allEmails={allEmails}
                    loadMore={loadMore}
                    loading={loading}
                    readEmails={readEmails}
                />

                <div className="col-span-2 p-4 border-l max-h-[80vh] overflow-y-auto">
                    {/* Compose Button */}
                    <div className="flex justify-between items-center mb-2 border-b">
                        <button
                            className="bg-blue-800 text-white px-3 py-2 rounded hover:bg-blue-900 text-xs mb-2 flex items-center gap-1"
                            onClick={() => {
                                setComposeOpen(!composeOpen);
                                setReplyMode(false);
                            }}
                        >
                            <MdEdit size={20} /> Compose
                        </button>
                    </div>

                    {composeOpen && (
                        <Form
                            from={userDetails.Email}
                            to={to}
                            recipients={recipients}
                            subject={subject}
                            body={body}
                            setTo={setTo}
                            setRecipients={setRecipients}
                            setSubject={setSubject}
                            setBody={setBody}
                            attachments={attachments}
                            setAttachments={setAttachments}
                            sendEmail={sendEmailWithAttachments}
                            onCancel={resetCompose}
                        />
                    )}

                    {!composeOpen && selectedEmail && (
                        <RightColumn
                            email={selectedEmail}
                            handleReply={handleReply}
                            handleForward={handleForward}
                            onCancel={() => setSelectedEmail(null)}
                        />
                    )}
                </div>

                <ToastContainer className="text-xs" autoClose={1000} />
            </div>
        </div>
    );
};

export default Main;
