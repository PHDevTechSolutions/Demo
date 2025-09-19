"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";

interface QuotationPreparationProps {
  typecall: string;
  quotationnumber: string;
  quotationamount: string;
  projectname: string;
  projectcategory: string;
  projecttype: string;
  followup_date: string;
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleProjectCategoryChange: (value: string) => void;
}

interface ShopifyProduct {
  id: number;
  title: string;
  sku: string;
}

const QuotationPreparation: React.FC<QuotationPreparationProps> = ({
  typecall,
  quotationnumber,
  quotationamount,
  projectname,
  projectcategory,
  projecttype,
  followup_date,
  handleFormChange,
  handleProjectCategoryChange,
}) => {
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // 🔹 Fetch Shopify products (SKU + Title)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ModuleSales/Shopify/FetchProduct");
        const json = await res.json();

        if (!json.success) throw new Error(json.error);

        const products: ShopifyProduct[] = json.data;

        // Map SKU + Title for select
        const mapped = products.map((p) => ({
          value: `${p.sku} | ${p.title}`,
          label: `${p.sku} | ${p.title}`,
        }));

        setCategoryOptions(mapped);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load product titles from Shopify");
      }
    })();
  }, []);

  // 🔹 Auto-set followup_date based on typecall
  useEffect(() => {
    let daysToAdd = 0;

    if (!typecall) {
      if (followup_date !== "") {
        handleFormChange({
          target: { name: "followup_date", value: "" },
        } as React.ChangeEvent<HTMLInputElement>);
      }
      return;
    }

    switch (typecall) {
      case "Sent Quotation - Standard":
      case "Sent Quotation - With Special Price":
        daysToAdd = 1;
        break;
      case "Sent Quotation - With SPF":
        daysToAdd = 5;
        break;
      case "With SPFS":
        daysToAdd = 7;
        break;
    }

    if (daysToAdd > 0) {
      const today = new Date();
      today.setDate(today.getDate() + daysToAdd);
      const formattedDate = today.toISOString().split("T")[0];

      if (followup_date !== formattedDate) {
        handleFormChange({
          target: { name: "followup_date", value: formattedDate },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, [typecall, followup_date, handleFormChange]);

  return (
    <>
      {/* Project Name */}
      <div className="flex flex-col">
        <label className="font-semibold">
          Project Name <span className="text-[8px] text-green-700">Optional</span>
        </label>
        <input
          type="text"
          name="projectname"
          value={projectname || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          placeholder="Enter Project Name"
        />
      </div>

      {/* Product Category (SKU | Title) */}
      <div className="flex flex-col">
        <label className="font-semibold">
          Product Title <span className="text-[8px] text-green-700">* Required</span>
        </label>
        <Select
          options={categoryOptions}
          value={categoryOptions.find((opt) => opt.value === projectcategory)}
          onChange={(selected) => {
            const value = selected ? selected.value : "";
            handleProjectCategoryChange(value);
            handleFormChange({
              target: { name: "projectcategory", value },
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          className="text-xs px-3 py-6"
          isClearable
          required
        />
      </div>

      {/* Customer Type */}
      <div className="flex flex-col">
        <label className="font-semibold">
          Customer Type <span className="text-[8px] text-green-700">* Required</span>
        </label>
        <select
          name="projecttype"
          value={projecttype}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          required
        >
          <option value="">Customer Type</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
          <option value="B2G">B2G</option>
          <option value="Gentrade">Gentrade</option>
          <option value="Modern Trade">Modern Trade</option>
        </select>
      </div>

      {/* Quotation Number */}
      <div className="flex flex-col">
        <label className="font-semibold">
          Quotation Number <span className="text-[8px] text-green-700">* Required</span>
        </label>
        <input
          type="text"
          name="quotationnumber"
          value={quotationnumber || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          placeholder="Enter Quotation Number"
          required
        />
      </div>

      {/* Quotation Amount */}
      <div className="flex flex-col">
        <label className="font-semibold">
          Quotation Amount <span className="text-[8px] text-green-700">* Required</span>
        </label>
        <input
          type="number"
          name="quotationamount"
          value={quotationamount || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          placeholder="Enter Quotation Amount"
          required
        />
      </div>

      {/* Type */}
      <div className="flex flex-col">
        <label className="font-semibold">
          Type <span className="text-[8px] text-green-700">* Required</span>
        </label>
        <select
          name="typecall"
          value={typecall}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          required
        >
          <option value="">Select Type</option>
          <option value="Sent Quotation - Standard">Sent Quotation - Standard</option>
          <option value="Sent Quotation - With Special Price">Sent Quotation - With Special Price</option>
          <option value="Sent Quotation - With SPF">Sent Quotation - With SPF</option>
          <option value="With SPFS">With SPFS</option>
        </select>
      </div>

      {/* Follow Up Date */}
      <div className="flex flex-col">
        <label className="font-semibold">
          Follow Up Date <span className="text-[8px] text-green-700">* Required</span>
        </label>
        <input
          type="date"
          name="followup_date"
          value={followup_date || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          required
        />
      </div>
    </>
  );
};

export default QuotationPreparation;
