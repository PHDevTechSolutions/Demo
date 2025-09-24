"use client";
import React, { useState } from "react";

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail: string;
  onSurveySent: () => void; // ✅ callback to continue form submit
}

const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose, defaultEmail, onSurveySent }) => {
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);

  const sendSurvey = async () => {
    if (!email) return alert("Please provide an email!");
    setSending(true);
    try {
      const res = await fetch("/api/sendSurveyGmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Survey sent successfully!");
        onClose();

        // 👉 after sending survey, continue form submit
        onSurveySent();
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending survey");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">Send Survey</h2>
        <label className="block mb-2 text-sm font-medium">Recipient Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4 text-sm"
          placeholder="Enter email"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={sendSurvey}
            disabled={sending}
            className={`px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 ${sending ? "opacity-50" : ""}`}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyModal;
