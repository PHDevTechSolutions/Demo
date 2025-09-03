"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LeftColumn from "./Columns/Left";
import RightColumn from "./Columns/Right";
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

interface RecipientField {
    type: "CC" | "BCC" | "Reply-To" | "Followup-To";
    email: string;
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

    // Fields for composing email
    const [to, setTo] = useState("");
    const [recipients, setRecipients] = useState<RecipientField[]>([]); // multiple recipient types
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);

    // Auto-fetch emails if IMAP password exists
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

        if (!userDetails.ReferenceID || !userDetails.ImapHost || !userDetails.Email) {
            return toast.error("ReferenceID, ImapHost, and Email are required.");
        }

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
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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

    // Send email with multiple recipient types
    const sendEmailWithAttachments = async (files: File[]) => {
        if (!to || !subject || !body) return toast.error("Please fill in all fields.");

        try {
            const attachmentsData = await Promise.all(
                files.map(file =>
                    new Promise<{ filename: string; content: string; contentType: string }>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64Content = (reader.result as string).split(",")[1];
                            resolve({ filename: file.name, content: base64Content, contentType: file.type });
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    })
                )
            );

            // Separate recipients by type
            const cc = recipients.filter(r => r.type === "CC").map(r => r.email).join(",");
            const bcc = recipients.filter(r => r.type === "BCC").map(r => r.email).join(",");
            const replyTo = recipients.filter(r => r.type === "Reply-To").map(r => r.email).join(",");
            const followupTo = recipients.filter(r => r.type === "Followup-To").map(r => r.email).join(",");

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

            let data;
            try {
                data = await res.json();
            } catch (jsonErr) {
                throw new Error(`Server returned invalid JSON: ${await res.text()}`);
            }

            if (!res.ok) throw new Error(data.error || "Failed to send email");

            toast.success("Email sent successfully!");
            setComposeOpen(false);
            setReplyMode(false);
            setTo("");
            setRecipients([]);
            setSubject("");
            setBody("");
            setAttachments([]);
        } catch (err: any) {
            console.error("Send error:", err);
            toast.error(err.message || "Error sending email");
        }
    };

    const handleReply = () => {
        if (!selectedEmail) return;
        setTo(selectedEmail.from.text);
        setRecipients(selectedEmail.cc ? selectedEmail.cc.split(",").map(email => ({ type: "CC" as const, email })) : []);
        setSubject(`Re: ${selectedEmail.subject}`);
        setBody(`\n\n--- Original Message ---\n${selectedEmail.body}`);
        setComposeOpen(true);
        setReplyMode(true);
        setAttachments([]);
    };

    const handleForward = () => {
        if (!selectedEmail) return;
        setTo("");
        setRecipients([]);
        setSubject(`Fwd: ${selectedEmail.subject}`);
        setBody(
            `\n\n--- Forwarded Message ---\nFrom: ${selectedEmail.from.text}\nTo: ${selectedEmail.to}\nCC: ${selectedEmail.cc}\nDate: ${selectedEmail.date}\n\n${selectedEmail.body}`
        );
        setComposeOpen(true);
        setReplyMode(false);
        setAttachments([]);
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
                            email={selectedEmail}       // <-- this must be a single EmailData object
                            handleReply={handleReply}
                            handleForward={handleForward}
                        />
                    )}
                </div>

                <ToastContainer className="text-xs" autoClose={1000} />
            </div>
        </div>
    );
};

export default Main;
