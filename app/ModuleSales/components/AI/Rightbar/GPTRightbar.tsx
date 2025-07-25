import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GPTRightbarProps {
  isOpen: boolean;
  onClose: () => void;
}

const GPTRightbar: React.FC<GPTRightbarProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([
    "GPT Chat interface here...",
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();

    // Add user's message immediately
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, data.reply || "No reply from GPT."]);
      } else {
        setMessages((prev) => [...prev, `Error: ${data.error || "Unknown error."}`]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, "Error: Failed to contact server."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="gpt-sidebar"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 right-0 w-96 h-full bg-white dark:bg-gray-800 shadow-lg z-[999] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              GPT Chat
            </h2>
            <button
              onClick={onClose}
              className="text-red-500 text-2xl font-bold leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg max-w-[80%] ${
                  i % 2 === 0 ? "bg-blue-600 text-white self-start" : "bg-gray-300 dark:bg-gray-700 self-end"
                }`}
              >
                {msg}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <textarea
                rows={2}
                className="flex-grow resize-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading) handleSend();
                  }
                }}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GPTRightbar;
