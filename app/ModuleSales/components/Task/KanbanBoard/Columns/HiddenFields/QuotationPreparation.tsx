"use client";

import React from "react";
import Select from "react-select";

interface QuotationPreparationProps {
  typecall: string;
  quotationnumber: string;
  quotationamount: string;
  projectname: string;
  projectcategory: string;
  projecttype: string;
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleProjectCategoryChange: (value: string) => void;
}

const categoryOptions = [
  { value: "Bollard Light", label: "Bollard Light" },
  { value: "Bulb Light", label: "Bulb Light" },
  { value: "Canopy Light", label: "Canopy Light" },
  { value: "Downlight", label: "Downlight" },
  { value: "Emergency Light", label: "Emergency Light" },
  { value: "Exit Light", label: "Exit Light" },
  { value: "Flood Light", label: "Flood Light" },
  { value: "Garden Light", label: "Garden Light" },
  { value: "High Bay Light", label: "High Bay Light" },
  { value: "Lamp Post", label: "Lamp Post" },
  { value: "Light Fixtures and Housing", label: "Light Fixtures and Housing" },
  { value: "Linear Light", label: "Linear Light" },
  { value: "Louver Light", label: "Louver Light" },
  { value: "Neon Light", label: "Neon Light" },
  { value: "Panel Light", label: "Panel Light" },
  { value: "Pendant Light", label: "Pendant Light" },
  { value: "Power Supply", label: "Power Supply" },
  { value: "Rope Light", label: "Rope Light" },
  { value: "Solar Flood Light", label: "Solar Flood Light" },
  { value: "Solar Light", label: "Solar Light" },
  { value: "Solar Road Light", label: "Solar Road Light" },
  { value: "Solar Street Light", label: "Solar Street Light" },
  { value: "Spotlight", label: "Spotlight" },
  { value: "Street Light", label: "Street Light" },
  { value: "Strip Light", label: "Strip Light" },
  { value: "Swimming Pool Light", label: "Swimming Pool Light" },
  { value: "Track Light", label: "Track Light" },
  { value: "Tube Light", label: "Tube Light" },
  { value: "UV Disinfection Light", label: "UV Disinfection Light" },
  { value: "Wall Light", label: "Wall Light" },
  { value: "Weatherproof Fixture", label: "Weatherproof Fixture" },
  { value: "SPF ( Special Items )", label: "SPF ( Special Items )" },
  { value: "Various Lighting", label: "Various Lighting" },
  { value: "Item Not Carried", label: "Item Not Carried" },
];

const QuotationPreparation: React.FC<QuotationPreparationProps> = ({
  typecall,
  quotationnumber,
  quotationamount,
  projectname,
  projectcategory,
  projecttype,
  handleFormChange,
  handleProjectCategoryChange,
}) => {
  return (
    <>
      {/* 🔹 Project Name */}
      <div className="flex flex-col">
        <label className="font-semibold">Project Name <span className="text-[8px] text-green-700">Optional</span></label>
        <input
          type="text"
          name="projectname"
          value={projectname || ""}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          placeholder="Enter Project Name"
          required
        />
      </div>

      {/* 🔹 Project Category (React Select) */}
      <div className="flex flex-col">
        <label className="font-semibold">Item Category <span className="text-[8px] text-green-700">* Required Fields</span></label>
        <Select
          options={categoryOptions}
          value={categoryOptions.find((opt) => opt.value === projectcategory)}
          onChange={(selected) => {
            const value = selected ? selected.value : "";
            handleProjectCategoryChange(value);

            // ✅ Force update formData
            handleFormChange({
              target: { name: "projectcategory", value },
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          className="text-xs px-3 py-6"
          required
        />

      </div>

      {/* 🔹 Customer Type */}
      <div className="flex flex-col">
        <label className="font-semibold">Customer Type <span className="text-[8px] text-green-700">* Required Fields</span></label>
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

      {/* 🔹 Quotation Number */}
      <div className="flex flex-col">
        <label className="font-semibold">Quotation Number <span className="text-[8px] text-green-700">* Required Fields</span></label>
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

      {/* 🔹 Quotation Amount */}
      <div className="flex flex-col">
        <label className="font-semibold">Quotation Amount <span className="text-[8px] text-green-700">* Required Fields</span></label>
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

      {/* 🔹 Type */}
      <div className="flex flex-col">
        <label className="font-semibold">Type <span className="text-[8px] text-green-700">* Required Fields</span></label>
        <select
          name="typecall"
          value={typecall}
          onChange={handleFormChange}
          className="border-b px-3 py-6 rounded text-xs"
          required
        >
          <option value="">Select Type</option>
          <option value="Sent Quotation - Standard">
            Sent Quotation - Standard
          </option>
          <option value="Sent Quotation - With Special Price">
            Sent Quotation - With Special Price
          </option>
          <option value="Sent Quotation - With SPF">
            Sent Quotation - With SPF
          </option>
          <option value="With SPFS">With SPFS</option>
        </select>
      </div>
    </>
  );
};

export default QuotationPreparation;
