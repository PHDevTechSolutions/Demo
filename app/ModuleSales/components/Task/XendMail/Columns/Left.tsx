{/*
"use client";

import React from "react";
import { AiOutlineReload } from "react-icons/ai";

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

interface LeftProps {
  emails: EmailData[];
  selectedEmail: EmailData | null;
  setSelectedEmail: (email: EmailData) => void;
  fetchEmails: () => void;
  fetchSentEmails: () => void;
  fetchedCount: number;
  allEmails: EmailData[];
  loadMore: () => void;
  loading: boolean;
  readEmails: Set<string>;
  activeTab: "inbox" | "sent";
  setActiveTab: (tab: "inbox" | "sent") => void;
}

const Left: React.FC<LeftProps> = ({
  emails,
  selectedEmail,
  setSelectedEmail,
  fetchEmails,
  fetchSentEmails,
  fetchedCount,
  allEmails,
  loadMore,
  loading,
  readEmails,
  activeTab,
  setActiveTab,
}) => {
  const handleRefresh = () => {
    if (activeTab === "inbox") {
      fetchEmails();
    } else {
      fetchSentEmails();
    }
  };

  return (
    <div className="col-span-1 pr-2 overflow-y-auto max-h-[80vh]">
     
      <div className="mb-2 sticky top-0 bg-white py-2 z-10 border-b">
        <div className="flex justify-between items-center">
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("inbox")}
              className={`px-3 py-1 rounded text-xs font-medium ${
                activeTab === "inbox"
                  ? "bg-blue-800 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Inbox
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-3 py-1 rounded text-xs font-medium ${
                activeTab === "sent"
                  ? "bg-blue-800 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Sent
            </button>
          </div>

         
          <button
            onClick={handleRefresh}
            className="px-2 py-1 bg-gray-500 text-white rounded shadow hover:bg-gray-600 text-xs flex items-center gap-1"
          >
            <AiOutlineReload size={14} />
            Refresh
          </button>
        </div>
      </div>

     
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="ml-2 text-xs text-gray-500">
            Fetching {activeTab} emails...
          </span>
        </div>
      )}

      
      {!loading && emails.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-4">
          No {activeTab} emails found.
        </p>
      )}

      
      {emails.map((mail) => {
        const isNew = !readEmails.has(mail.messageId);
        return (
          <div
            key={mail.messageId}
            className={`p-3 border-b cursor-pointer transition-colors ${
              selectedEmail?.messageId === mail.messageId
                ? "bg-blue-100"
                : isNew
                ? "bg-yellow-100 hover:bg-yellow-200"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedEmail(mail)}
          >
            <p className="text-[10px] text-gray-500">{mail.from?.text || "Unknown"}</p>
            <p className="font-semibold text-sm truncate">{mail.subject || "(No Subject)"}</p>
            <p className="text-[10px] text-gray-400">
              {mail.date ? new Date(mail.date).toLocaleString() : "No Date"}
            </p>
          </div>
        );
      })}

      
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

export default Left;

*/}
