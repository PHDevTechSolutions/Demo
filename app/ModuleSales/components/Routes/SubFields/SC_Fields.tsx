import React, { useEffect, useState } from "react";
import Select from "react-select";
import Area from "./AA_Fields";
import { BsArrowsCollapseVertical, BsArrowsExpandVertical } from "react-icons/bs";

export interface CompanyOption {
  id: string | number;
  companyname: string;
  companygroup: string;
  value: string;
  label: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  typeclient: string;
  address: string;
  deliveryaddress: string;
  area: string;
  status: string;
}

interface SelectCompanyProps {
  referenceid: string;
  companyname: string;
  setcompanyname: (val: string) => void;
  companygroup: string;
  setcompanygroup: (value: string) => void;
  contactperson: string;
  setcontactperson: (val: string) => void;
  contactnumber: string;
  setcontactnumber: (val: string) => void;
  emailaddress: string;
  setemailaddress: (val: string) => void;
  typeclient: string;
  settypeclient: (val: string) => void;
  address: string;
  setaddress: (val: string) => void;
  deliveryaddress: string;
  setdeliveryaddress: (val: string) => void;
  area: string;
  setarea: (val: string) => void;
  status: string;
  setstatus: (val: string) => void;

  editPost?: {
    companyname?: string;
    companygroup: string;
    contactperson: string;
    contactnumber: string;
    emailaddress: string;
    typeclient: string;
    address: string;
    deliveryaddress: string;
    area: string;
    status: string;
  };
}

const SelectCompany: React.FC<SelectCompanyProps> = ({
  referenceid,
  companyname,
  setcompanyname,
  companygroup,
  setcompanygroup,
  contactperson,
  setcontactperson,
  contactnumber,
  setcontactnumber,
  emailaddress,
  setemailaddress,
  typeclient,
  settypeclient,
  address,
  setaddress,
  deliveryaddress,
  setdeliveryaddress,
  area,
  setarea,
  status,
  setstatus,
}) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isManual, setIsManual] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (referenceid) {
      fetch(
        `/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${referenceid}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCompanies(
              data.data.map((c: any) => ({
                ...c,
                value: c.companyname,
                label: c.companyname,
              }))
            );
          } else {
            console.error("Error fetching companies:", data.error);
          }
        })
        .catch((err) => console.error("Error:", err));
    }
  }, [referenceid]);

  const handleCompanySelect = (selected: any) => {
    if (selected?.id) {
      setcompanyname(selected.companyname);
      setcontactperson(selected.contactperson);
      setcontactnumber(selected.contactnumber);
      setemailaddress(selected.emailaddress);
      settypeclient(selected.typeclient);
      setaddress(selected.address);
      setdeliveryaddress(selected.deliveryaddress);
      setcompanygroup(selected.companygroup);
      setarea(selected.area);
      setstatus(selected.status);
    } else {
      setcompanyname("");
      setcontactperson("");
      setcontactnumber("");
      setemailaddress("");
      settypeclient("");
      setaddress("");
      setdeliveryaddress("");
      setcompanygroup("");
      setarea("");
      setstatus("");
    }
  };

  return (
    <div>
      {/* Company Selection */}
      <div className="flex flex-wrap -mx-4 transition-all duration-300 ease-in-out">
        <div className="w-full px-4 mb-4">
          <label className="block text-xs font-bold mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <div className="w-1/2">
              {!isManual ? (
                <Select
                  options={companies}
                  onChange={handleCompanySelect}
                  className="text-[10px] capitalize"
                  placeholder="Select Company"
                  isClearable
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      border: "none",
                      borderBottom: state.isFocused
                        ? "2px solid #3B82F6"
                        : "1px solid #D1D5DB",
                      boxShadow: "none",
                      borderRadius: "0px",
                      minHeight: "3px",
                      fontSize: "12px",
                      backgroundColor: "white",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      fontSize: "12px",
                      zIndex: 5,
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      textTransform: "capitalize",
                    }),
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={companyname ?? ""}
                  onChange={(e) => setcompanyname(e.target.value)}
                  className="w-full text-xs capitalize p-2 border-b"
                />
              )}
            </div>

            {!isManual && (
              <div className="w-1/2">
                <input
                  type="text"
                  value={companyname ?? ""}
                  disabled
                  className="w-full mt-0 text-xs capitalize p-2 border-b"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsManual((prev) => !prev)}
            className="text-[10px] text-blue-500 underline mt-2"
          >
            {isManual
              ? "If Account Exists Switch to Select"
              : "If Account is New Switch to Manual"}
          </button>
        </div>
      </div>

      {/* Expandable Fields */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-bold">Customer / Account Details</h2>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-[10px] text-black border shadow-sm px-2 py-1 rounded-md flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <BsArrowsCollapseVertical /> <span>Hide Fields</span>
            </>
          ) : (
            <>
              <BsArrowsExpandVertical /> <span>Show Fields</span>
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-wrap -mx-4 transition-all duration-300 ease-in-out">
          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <label className="block text-xs font-bold mb-2">Affiliate Name</label>
            <input
              type="text"
              value={companygroup ?? ""}
              onChange={(e) => setcompanygroup(e.target.value)}
              className="w-full px-3 py-2 border-b text-xs capitalize"
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <label className="block text-xs font-bold mb-2">Contact Person</label>
            <input
              type="text"
              value={contactperson ?? ""}
              onChange={(e) => setcontactperson(e.target.value)}
              className="w-full px-3 py-2 border-b text-xs capitalize"
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <label className="block text-xs font-bold mb-2">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactnumber ?? ""}
              onChange={(e) => setcontactnumber(e.target.value)}
              className="w-full px-3 py-2 border-b text-xs"
              required
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <label className="block text-xs font-bold mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={emailaddress ?? ""}
              onChange={(e) => setemailaddress(e.target.value)}
              className="w-full px-3 py-2 border-b text-xs"
              required
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <label className="block text-xs font-bold mb-2">
              Registered Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address ?? ""}
              onChange={(e) => setaddress(e.target.value)}
              className="w-full px-3 py-2 border-b text-xs capitalize"
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <label className="block text-xs font-bold mb-2">Delivery Address</label>
            <input
              type="text"
              value={deliveryaddress ?? ""}
              onChange={(e) => setdeliveryaddress(e.target.value)}
              className="w-full px-3 py-2 border-b text-xs capitalize"
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <label className="block text-xs font-bold mb-2">
              Region <span className="text-red-500">*</span>
            </label>
            <Area area={area} setarea={setarea} />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <label className="block text-xs font-bold mb-2">
              Type of Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={typeclient ?? ""}
              onChange={(e) => settypeclient(e.target.value)}
              className="w-full px-3 py-2 border-b text-xs capitalize bg-white"
              required
            >
              <option value="">Select Client</option>
              <option value="CSR Client">CSR Client</option>
              <option value="TSA Client">TSA Client</option>
            </select>
          </div>

          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <label className="block text-xs font-bold mb-2">
              Customer Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status ?? ""}
              onChange={(e) => setstatus(e.target.value)}
              className="w-full px-3 py-2 border-b text-xs capitalize bg-white"
              required
            >
              <option value="">Select Client</option>
              <option value="Active">Active</option>
              <option value="New Client">New Client</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectCompany;
