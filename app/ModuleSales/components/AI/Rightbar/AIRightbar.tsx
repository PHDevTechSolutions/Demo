"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import ReactMarkdown from "react-markdown";

interface AIRightbarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: "user" | "ai";
  content: string;
}

interface UserDetails {
  UserId: string;
  ReferenceID: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Role: string;
  Department: string;
  Company: string;
}

const LOCAL_KEY = "ai-assistant-chat";

const AIRightbar: React.FC<AIRightbarProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) setMessages(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");
      if (!userId) return setError("User ID is missing.");

      try {
        const res = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setUserDetails({
          UserId: data._id,
          ReferenceID: data.ReferenceID || "",
          Firstname: data.Firstname || "",
          Lastname: data.Lastname || "",
          Email: data.Email || "",
          Role: data.Role || "",
          Department: data.Department || "",
          Company: data.Company || "",
        });
      } catch (err) {
        console.error("User fetch error:", err);
        setError("Failed to load user data.");
      }
    };

    fetchUserData();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!userDetails?.ReferenceID) {
      setMessages((prev) => [...prev, { sender: "ai", content: "ReferenceID is missing." }]);
      return;
    }

    const userMsg: Message = { sender: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/assistant?id=${userDetails.ReferenceID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const aiReply: Message = { sender: "ai", content: data.reply || "No reply." };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", content: "Error: no response." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    setMessages([]);
    localStorage.removeItem(LOCAL_KEY);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-[999] transition-all duration-500 transform ${
        isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">AI Tasky</h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleClearData}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md"
            >
              Clear
            </button>
            <button onClick={onClose}>
              <IoClose className="w-5 h-5 text-gray-700 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-gray-900 text-xs capitalize">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-xl transition-all max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-bl-none"
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col gap-2">
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-xs transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRightbar;
