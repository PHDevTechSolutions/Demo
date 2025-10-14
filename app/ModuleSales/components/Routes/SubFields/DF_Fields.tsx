import React, { useState, useEffect } from "react";

interface DeliveryFieldsProps {
  actualsales: string; setactualsales: (value: string) => void;
  emailaddress: string; setemailaddress: (value: string) => void;
  deliverydate: string; setdeliverydate: (value: string) => void;
  activitystatus: string; setactivitystatus: (value: string) => void;
  paymentterm: string; setpaymentterm: (value: string) => void;
  drnumber: string; setdrnumber: (value: string) => void;
}

const EMAIL_STORAGE_KEY = "recentEmails";

const DeliveryFields: React.FC<DeliveryFieldsProps> = ({
  actualsales, setactualsales,
  emailaddress, setemailaddress,
  deliverydate, setdeliverydate,
  activitystatus, setactivitystatus,
  paymentterm, setpaymentterm,
  drnumber, setdrnumber
}) => {

  const [isSending, setIsSending] = useState(false);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);

  useEffect(() => {
    const savedEmails = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (savedEmails) {
      setRecentEmails(JSON.parse(savedEmails));
    }
  }, []);

  const handlePaymentTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setpaymentterm(e.target.value);
  };

  return (
    <>
      {activitystatus === "Delivered" && (
        <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4 relative">
          <label className="block text-xs font-bold mb-2">Payment Terms <span className="text-red-500">*</span></label>
          <select
            value={paymentterm}
            onChange={handlePaymentTermChange}
            className="w-full px-3 py-2 border-b text-xs bg-white capitalize"
            required
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
      )}

      <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
        <label htmlFor="actualsales" className="block text-xs font-bold mb-2">SI (Actual Sales) <span className="text-red-500">*</span></label>
        <input
          id="actualsales"
          type="text"
          inputMode="decimal"
          value={actualsales}
          onChange={(e) => {
            const inputValue = e.target.value;
            const formattedValue = inputValue
              .replace(/[^0-9.]/g, "")
              .replace(/(\..*)\./g, "$1");
            setactualsales(formattedValue);
          }}
          className="w-full px-3 py-2 border-b text-xs"
          required
          placeholder="Enter actual sales amount"
          disabled={isSending}
          aria-describedby="actualsales-desc"
        />
      </div>

      <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
        <label htmlFor="actualsales" className="block text-xs font-bold mb-2">Delivery Date <span className="text-red-500">*</span></label>
        <input
          id="deliverydate"
          type="date"
          value={deliverydate}
          onChange={(e) => setdeliverydate(e.target.value)}
          className="w-full px-3 py-2 border-b text-xs"
          required
          placeholder="Enter actual sales amount"
          disabled={isSending}
          aria-describedby="actualsales-desc"
        />
      </div>

      <div className="w-full sm:w-1/2 md:w-1/2 px-4 mb-4">
        <label htmlFor="drnumber" className="block text-xs font-bold mb-2">DR Number <span className="text-red-500">*</span></label>
        <input
          id="drnumber"
          type="text"
          value={drnumber}
          onChange={(e) => setdrnumber(e.target.value)}
          className="w-full px-3 py-2 border-b text-xs"
          required
          disabled={isSending}
          aria-describedby="actualsales-desc"
        />
      </div>
    </>
  );
};

export default DeliveryFields;
