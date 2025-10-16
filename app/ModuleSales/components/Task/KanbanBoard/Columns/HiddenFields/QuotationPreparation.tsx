"use client";

import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import { toast } from "react-toastify";

interface QuotationPreparationProps {
  typecall: string;
  quotationnumber: string;
  quotationamount: string;
  projectname: string;
  projectcategory: string[];
  projecttype: string;
  followup_date: string;
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleProjectCategoryChange: (
    selected: { value: string; label: string }[] | null
  ) => void;
}

interface ShopifyProduct {
  id: number;
  title: string;
  sku: string;
}

// Custom option for react-select
const Option = (props: any) => (
  <components.Option {...props}>
    <div>
      <div>{props.data.title}</div>
      <div style={{ fontSize: "10px", color: "#555" }}>{props.data.sku}</div>
    </div>
  </components.Option>
);

const MultiValueLabel = (props: any) => (
  <components.MultiValueLabel {...props}>
    {props.data.title}
  </components.MultiValueLabel>
);

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
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [useManualList, setUseManualList] = useState(false);

  // Fetch product list from Shopify API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ModuleSales/Shopify/FetchProduct", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        const products: ShopifyProduct[] = json.data;
        const mapped = products.map((p) => ({
          value: p.sku,
          title: p.title.replace(/Super Sale\s*/i, "").trim(),
          sku: p.sku,
          label: `${p.title} | ${p.sku}`,
        }));
        setCategoryOptions(mapped);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load product titles from Shopify");
      }
    })();
  }, []);

  // Auto set follow-up date based on typecall
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
      const formatted = today.toISOString().split("T")[0];
      if (followup_date !== formatted) {
        handleFormChange({
          target: { name: "followup_date", value: formatted },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, [typecall, followup_date, handleFormChange]);

  // Manual categories
  const manualCategories = [
    "Bollard Light",
    "Bulb Light",
    "Canopy Light",
    "Downlight",
    "Emergency Light",
    "Exit Light",
    "Flood Light",
    "Garden Light",
    "High Bay Light",
    "Lamp Post",
    "Light Fixtures and Housing",
    "Linear Light",
    "Louver Light",
    "Neon Light",
    "Panel Light",
    "Pendant Light",
    "Power Supply",
    "Rope Light",
    "Solar Flood Light",
    "Solar Light",
    "Solar Road Light",
    "Solar Street Light",
    "Spotlight",
    "Street Light",
    "Strip Light",
    "Swimming Pool Light",
    "Track Light",
    "Tube Light",
    "UV Disinfection Light",
    "Wall Light",
    "Weatherproof Fixture",
    "SPF ( Special Items )",
    "Various Lighting",
    "Item Not Carried",
  ];

  return (
    <>
      {/* Toggle for data source */}
      <div className="flex justify-between items-center mb-2">
        <label className="font-semibold text-xs">Product Source</label>
        <select
          className="border px-2 py-1 rounded text-xs"
          value={useManualList ? "manual" : "shopify"}
          onChange={(e) => setUseManualList(e.target.value === "manual")}
        >
          <option value="shopify">Shopify List</option>
          <option value="manual">Manual List</option>
        </select>
      </div>

      {/* Project Name */}
      <div className="flex flex-col mb-2">
        <label className="font-semibold">
          Project Name <span className="text-[8px] text-green-700">Optional</span>
        </label>
        <input
          type="text"
          name="projectname"
          value={projectname || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-2 rounded text-xs"
          placeholder="Enter Project Name"
        />
      </div>

      {/* Project Category Selection */}
      {!useManualList ? (
        <div className="flex flex-col mt-2">
          <label className="font-semibold">
            Product Title <span className="text-[8px] text-green-700">* Required</span>
          </label>
          <Select
            options={categoryOptions}
            isMulti
            closeMenuOnSelect={false}
            components={{ Option, MultiValueLabel }}
            value={categoryOptions.filter((opt) =>
              projectcategory.includes(opt.value)
            )}
            onChange={(selected: any) => {
              const values = selected ? selected.map((s: any) => s.value) : [];
              handleProjectCategoryChange(values);
              handleFormChange({
                target: { name: "projectcategory", value: values },
              } as any);
            }}
            className="text-xs px-3 py-1"
            isClearable
            required
          />
        </div>
      ) : (
        <div className="flex flex-col mt-2">
          <label className="font-semibold">
            Project Category <span className="text-[8px] text-green-700">* Required</span>
          </label>
          <select
            name="projectcategory"
            value={projectcategory[0] || ""}
            onChange={(e) => {
              const val = e.target.value;
              handleProjectCategoryChange([{ value: val, label: val }]);
              handleFormChange({
                target: { name: "projectcategory", value: [val] },
              } as any);
            }}
            className="border-b px-3 py-2 rounded text-xs capitalize"
            required
          >
            <option value="">Select Category</option>
            {manualCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Customer Type */}
      <div className="flex flex-col mt-2">
        <label className="font-semibold">
          Customer Type <span className="text-[8px] text-green-700">* Required</span>
        </label>
        <select
          name="projecttype"
          value={projecttype}
          onChange={handleFormChange}
          className="border-b px-3 py-2 rounded text-xs"
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
      {useManualList && (
        <div className="flex flex-col mt-2">
          <label className="font-semibold">
            Quotation Amount{" "}
            <span className="text-[8px] text-green-700">* Required</span>
          </label>
          <input
            type="number"
            name="quotationamount"
            value={quotationamount || ""}
            onChange={handleFormChange}
            className="border-b px-3 py-2 rounded text-xs"
            placeholder="Enter Quotation Amount"
            required
          />
        </div>
      )}
        
      <div className="flex flex-col mt-2">
        <label className="font-semibold">
          Quotation Number <span className="text-[8px] text-green-700">* Required</span>
        </label>
        <input
          type="text"
          name="quotationnumber"
          value={quotationnumber || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-2 rounded text-xs"
          placeholder="Enter Quotation Number"
          required
        />
      </div>

      {/* Quotation Number */}
      {useManualList && (
        <div className="flex flex-col mt-2">
          <label className="font-semibold">
            Quotation Amount{" "}
            <span className="text-[8px] text-green-700">* Required</span>
          </label>
          <input
            type="number"
            name="quotationamount"
            value={quotationamount || ""}
            onChange={handleFormChange}
            className="border-b px-3 py-2 rounded text-xs"
            placeholder="Enter Quotation Amount"
            required
          />
        </div>
      )}

      {/* Type Call */}
      <div className="flex flex-col mt-2">
        <label className="font-semibold">
          Type <span className="text-[8px] text-green-700">* Required</span>
        </label>
        <select
          name="typecall"
          value={typecall}
          onChange={handleFormChange}
          className="border-b px-3 py-2 rounded text-xs"
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
      <div className="flex flex-col mt-2">
        <label className="font-semibold">
          Follow Up Date <span className="text-[8px] text-green-700">* Required</span>
        </label>
        <input
          type="date"
          name="followup_date"
          value={followup_date || ""}
          onChange={handleFormChange}
          min={new Date().toISOString().slice(0, 16)}
          className="border-b px-3 py-2 rounded text-xs"
          required
        />
      </div>
    </>
  );
};

export default QuotationPreparation;
