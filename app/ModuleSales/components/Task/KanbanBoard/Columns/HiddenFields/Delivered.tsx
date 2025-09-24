import React, { useState } from "react";

interface DeliveredProps {
  formData: any;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const Delivered: React.FC<DeliveredProps> = ({ formData, handleFormChange }) => {
  const [sending, setSending] = useState(false);

  const sendSurvey = async () => {
    if (!formData.emailaddress) return alert("Email address is missing!");

    setSending(true);
    try {
      const res = await fetch("/api/sendSurveyGmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.emailaddress }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Survey sent successfully!");
      } else {
        alert("Failed to send survey: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending survey");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Existing Delivered fields */}
      <div className="flex flex-col">
        <label className="font-semibold">
          Payment Terms <span className="text-[8px] text-red-700">* Required Fields</span>
        </label>
        <select
          name="paymentterm"
          value={formData.paymentterm || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs resize-none h-20"
        >
          <option value="">Select Payment Term</option>
          <option value="COD">COD</option>
          <option value="Check">Check</option>
          <option value="Cash">Cash</option>
          <option value="Bank Deposit">Bank Deposit</option>
          <option value="GCash">GCash</option>
          <option value="Terms">Terms</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="font-semibold">
          SI (Actual Sales) <span className="text-[8px] text-red-700">* Required Fields</span>
        </label>
        <input
          type="number"
          name="actualsales"
          value={formData.actualsales || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs resize-none h-20"
          required
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold">
          DR Number <span className="text-[8px] text-red-700">* Required Fields</span>
        </label>
        <input
          type="text"
          name="drnumber"
          value={formData.drnumber || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs resize-none h-20"
          required
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold">
          Delivery Date <span className="text-[8px] text-red-700">* Required Fields</span>
        </label>
        <input
          type="date"
          name="deliverydate"
          value={formData.deliverydate || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs resize-none h-20"
          required
        />
      </div>

      {/* Send Survey Button */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={sendSurvey}
          className={`px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600 ${sending ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send Survey"}
        </button>
      </div>
    </>
  );
};

export default Delivered;
