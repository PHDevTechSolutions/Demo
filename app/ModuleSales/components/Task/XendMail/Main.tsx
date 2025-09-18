"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdEdit } from "react-icons/md";

import LeftColumn from "./Columns/Left";
import RightColumn from "./Columns/Right";
import Form from "./Form";

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

const PAGE_SIZE = 10;

const Main: React.FC<MainProps> = ({ userDetails }) => {
    const [allEmails, setAllEmails] = useState<EmailData[]>([]);
    const [sentEmails, setSentEmails] = useState<EmailData[]>([]);
    const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");

    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [imapPass, setImapPass] = useState(userDetails.ImapPass || "");
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

    // sort emails
    const sortedInbox = useMemo(
        () =>
            [...allEmails].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
        [allEmails]
    );
    const sortedSent = useMemo(
        () =>
            [...sentEmails].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
        [sentEmails]
    );

    const emails =
        activeTab === "inbox"
            ? sortedInbox.slice(0, fetchedCount) // inbox → may pagination
            : sortedSent; // sent → lahat agad ipakita

    const saveEmailsToDB = useCallback(
        async (emails: EmailData[]) => {
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

                const data = await res.json().catch(async () => ({ error: await res.text() }));

                if (!res.ok) {
                    if (data.error === "No valid emails to insert") return;
                    throw new Error(data.error || "Failed to save emails");
                }

                if (data.insertedCount > 0) {
                    toast.success(`✅ Saved ${data.insertedCount} new emails`);
                }
            } catch (err: any) {
                console.error("Save to DB error:", err);
            }
        },
        [userDetails.ReferenceID]
    );

    const fetchEmails = useCallback(async () => {
        const password = imapPass || userDetails.ImapPass;
        if (!password) {
            console.warn("IMAP password not set. Skipping fetch.");
            setAllEmails([]);
            setFetchedCount(0);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/ModuleSales/Task/XendMail/Fetch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userDetails.Email,
                    imapHost: userDetails.ImapHost,
                    imapPass: password,
                    imapPort: 993,
                    secure: true,
                }),
            });

            const data = await res.json();
            if (!Array.isArray(data)) {
                setAllEmails([]);
                setFetchedCount(0);
                return;
            }

            setAllEmails(data);
            setFetchedCount(Math.min(PAGE_SIZE, data.length));
            await saveEmailsToDB(data);
        } catch (err) {
            console.error("Fetch emails error:", err);
            setAllEmails([]);
            setFetchedCount(0);
        } finally {
            setLoading(false);
        }
    }, [imapPass, userDetails, saveEmailsToDB]);


    const fetchSentEmails = useCallback(async () => {
        try {
            const res = await fetch(
                `/api/ModuleSales/Task/XendMail/GetSent?referenceId=${userDetails.ReferenceID}`
            );
            const result = await res.json();
            if (Array.isArray(result?.data)) setSentEmails(result.data);
        } catch (err) {
            console.error("Fetch sent emails error:", err);
        }
    }, [userDetails.ReferenceID]);

    // ✅ Only fetch if IMAP password exists
    useEffect(() => {
        if (userDetails.ImapPass) {
            fetchEmails();
        }
        fetchSentEmails();
    }, [fetchEmails, fetchSentEmails, userDetails.ImapPass]);

    // Load more emails for pagination
    const loadMore = useCallback(() => {
        const targetLength =
            activeTab === "inbox" ? sortedInbox.length : sortedSent.length;
        setFetchedCount((prev) => Math.min(prev + PAGE_SIZE, targetLength));
    }, [activeTab, sortedInbox.length, sortedSent.length]);

    // 📌 Select email
    const handleSelectEmail = (email: EmailData) => {
        setSelectedEmail(email);
        setReadEmails((prev) => new Set(prev).add(email.messageId));
    };

    // Send email
    const sendEmailWithAttachments = async (files: File[]) => {
        if (!to || !subject || !body) {
            return toast.error("Please fill in all fields.");
        }
        setSending(true);

        try {
            const attachmentsData = await Promise.all(
                files.map(
                    (file) =>
                        new Promise<{ filename: string; content: string; contentType: string }>(
                            (resolve, reject) => {
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
                            }
                        )
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

            const data = await res.json().catch(async () => ({ error: await res.text() }));
            if (!res.ok) throw new Error(data.error || "Failed to send email");

            toast.success("Email sent successfully!");

            // ✅ Save sent email
            const sentEmail: EmailData = {
                from: { text: userDetails.Email },
                to,
                cc,
                subject,
                date: new Date().toISOString(),
                messageId: data.messageId || crypto.randomUUID(),
                body,
                attachments: attachmentsData,
            };

            await saveEmailsToDB([sentEmail]);

            await fetch("/api/ModuleSales/Task/XendMail/SaveSent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    referenceId: userDetails.ReferenceID,
                    emails: [sentEmail],
                }),
            }).catch((err) => console.error("SaveSent error:", err));

            resetCompose();
        } catch (err: any) {
            console.error("Send error:", err);
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

    // Reply to email
    const handleReply = () => {
        if (!selectedEmail) return;
        setSending(true);
        setTimeout(() => {
            setTo(selectedEmail.from.text);
            setRecipients(
                selectedEmail.cc
                    ? selectedEmail.cc.split(",").map((email) => ({ type: "CC" as const, email }))
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

    // Forward email
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
                <div className="flex flex-col">
                    <LeftColumn
                        emails={emails} // ✅ laging gumamit ng computed emails (may slice)
                        selectedEmail={selectedEmail}
                        setSelectedEmail={handleSelectEmail}
                        fetchEmails={fetchEmails}
                        fetchSentEmails={fetchSentEmails}
                        fetchedCount={fetchedCount}
                        allEmails={activeTab === "inbox" ? sortedInbox : sortedSent}
                        loadMore={loadMore}
                        loading={loading}
                        readEmails={readEmails}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                </div>

                <div className="col-span-2 p-4 border-l max-h-[80vh] overflow-y-auto">
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
                            onCancel={() => {
                                setComposeOpen(false);
                                setReplyMode(false);
                                setTo("");
                                setRecipients([]);
                                setSubject("");
                                setBody("");
                                setAttachments([]);
                            }}
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