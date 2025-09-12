"use client";

import React from "react";
import { BsReply, BsArrowRight, BsX } from 'react-icons/bs';

interface Attachment {
    filename: string;
    contentType: string;
    content: string;
}

interface EmailData {
    from: string | { text: string }; // <-- supports both formats
    to: string;
    cc: string;
    subject: string;
    date: string;
    body: string;
    messageId?: string;
    attachments?: Attachment[];
}

interface RightColumnProps {
    email: EmailData;
    handleReply: () => void;
    handleForward: () => void;
    onCancel: () => void;
}

const RightColumn: React.FC<RightColumnProps> = ({ email, handleReply, handleForward, onCancel, }) => {
    const fromText = typeof email.from === "string" ? email.from : email.from.text;
    const attachments = email.attachments || [];

    return (
        <div className="p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold mb-2">{email.subject}</h3>
                <div className="flex gap-2">
                    <button
                        className="bg-white text-black border px-2 py-1 rounded hover:bg-gray-50 text-xs flex items-center gap-1"
                        onClick={handleReply}
                    >
                        <BsReply size={20} /> Reply
                    </button>
                    <button
                        className="bg-white text-black border px-2 py-1 rounded hover:bg-gray-50 text-xs flex items-center gap-1"
                        onClick={handleForward}
                    >
                        <BsArrowRight size={20} /> Forward
                    </button>
                    <button
                        className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs flex items-center gap-1"
                        onClick={onCancel}
                    >
                        <BsX size={16} /> Cancel
                    </button>
                </div>
            </div>

            <p className="text-xs text-gray-500 mb-2">
                From: {fromText} | To: {email.to} | CC: {email.cc}
            </p>

            <p className="text-sm whitespace-pre-wrap">{email.body}</p>

            {/* Attachments */}
            {attachments.length > 0 && (
                <div className="mt-4">
                    <ul className="text-sm">
                        {[...attachments].reverse().map((att, idx) => {
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
        </div>
    );
};

export default RightColumn;
