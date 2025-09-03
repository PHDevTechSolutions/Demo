"use client";

import React from "react";

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

interface LeftColumnProps {
  emails: EmailData[];
  selectedEmail: EmailData | null;
  setSelectedEmail: (email: EmailData) => void;
  imapPass: string;
  setImapPass: (pass: string) => void;
  fetchEmails: () => void;
  fetchedCount: number;
  allEmails: EmailData[];
  loadMore: () => void;
  loading: boolean; // bagong prop
}

const LeftColumn: React.FC<LeftColumnProps> = ({
  emails,
  selectedEmail,
  setSelectedEmail,
  imapPass,
  setImapPass,
  fetchEmails,
  fetchedCount,
  allEmails,
  loadMore,
  loading,
}) => {
  return (
    <div className="col-span-1 pr-2 overflow-y-auto max-h-[80vh]">
      {/* IMAP Input + Fetch */}
      <div className="mb-4 flex gap-2 sticky top-0 bg-white py-2 z-10">
        <input
          type="text"
          placeholder="Enter IMAP Password"
          value={imapPass}
          onChange={(e) => setImapPass(e.target.value)}
          className="border px-3 py-2 rounded text-xs flex-1"
        />
        <button
          onClick={fetchEmails}
          className="px-3 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 text-xs"
        >
          Fetch
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="ml-2 text-xs text-gray-500">Fetching emails...</span>
        </div>
      )}

      {!imapPass && !loading && (
        <p className="text-xs text-gray-400 text-center">No fetch available. Please enter IMAP password.</p>
      )}

      {/* Email cards */}
      {emails.map((mail, idx) => (
        <div
          key={idx}
          className={`p-3 border-b cursor-pointer transition-colors ${
            selectedEmail === mail ? "bg-blue-100" : "bg-gray-50 hover:bg-gray-100"
          }`}
          onClick={() => setSelectedEmail(mail)}
        >
          <p className="text-[10px] text-gray-500">{mail.from.text}</p>
          <p className="font-semibold text-sm truncate">{mail.subject}</p>
          <p className="text-[10px] text-gray-400">{new Date(mail.date).toLocaleString()}</p>
        </div>
      ))}

      {/* Load More */}
      {fetchedCount < allEmails.length && (
        <button
          onClick={loadMore}
          className="w-full mt-2 px-2 py-2 bg-green-800 text-white rounded hover:bg-green-900 text-xs"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default LeftColumn;
