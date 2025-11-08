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
  referenceid?: string; // para macheck owner ng company
}

interface SelectCompanyProps {
  referenceid: string;
  companyid: string | number;
  setcompanyid: (val: string | number) => void;
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
  companyid,
  setcompanyid,
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
  // Personal company list based on referenceid
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  // For global companies fetched by typed input (manual)
  const [globalCompanies, setGlobalCompanies] = useState<CompanyOption[]>([]);
  // Track typed input in manual mode
  const [typedCompanyName, setTypedCompanyName] = useState("");
  // Whether manual mode is on or off
  const [isManual, setIsManual] = useState(false);
  // Expandable fields toggle
  const [isExpanded, setIsExpanded] = useState(false);
  // Whether to show the “Use” button for new company
  const [showUseButton, setShowUseButton] = useState(false);

  // Fetch personal companies on mount or referenceid change
  useEffect(() => {
    if (referenceid && !isManual) {
      fetch(`/api/ModuleSales/Companies/CompanyAccounts/FetchAccount?referenceid=${referenceid}`)
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
            setCompanies([]);
          }
        })
        .catch((err) => {
          console.error("Error:", err);
          setCompanies([]);
        });
    } else {
      // Clear personal companies if manual mode
      setCompanies([]);
    }
  }, [referenceid, isManual]);

  // Fetch global companies when typing company name in manual mode (debounce recommended for production)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isManual && typedCompanyName.trim().length > 2) {
      setLoading(true);
      fetch(`/api/ModuleSales/Companies/CompanyAccounts/FetchAllCompanies?search=${encodeURIComponent(typedCompanyName)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setGlobalCompanies(data.data);
            const existingOtherOwner = data.data.find(
              (comp: CompanyOption) =>
                comp.companyname.toLowerCase() === typedCompanyName.toLowerCase() &&
                comp.referenceid !== referenceid
            );
            setShowUseButton(!existingOtherOwner);
          } else {
            setGlobalCompanies([]);
            setShowUseButton(false);
          }
        })
        .catch(() => {
          setGlobalCompanies([]);
          setShowUseButton(false);
        })
        .finally(() => setLoading(false));
    } else {
      setGlobalCompanies([]);
      setShowUseButton(false);
      setLoading(false);
    }
  }, [typedCompanyName, isManual, referenceid]);


  // When selecting from dropdown
  const handleCompanySelect = (selected: any) => {
    if (selected?.id) {
      setcompanyid(selected.id);
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
      setIsExpanded(true); // Usually collapse expandable when selecting existing
    } else {
      // Clear all fields
      setcompanyid("");
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
      setIsExpanded(true);
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
                <div className="relative w-full">
                  <input
                    type="text"
                    value={companyname ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setcompanyname(val);
                      setTypedCompanyName(val);

                      if (val.trim() === "") {
                        setIsExpanded(false);
                        setShowUseButton(false);
                      }
                    }}
                    className="w-full text-xs capitalize p-2 border-b pr-8" // extra padding-right para sa spinner
                  />
                  {loading && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      {/* Simple spinner - you can replace with any spinner component or SVG */}
                      <svg
                        className="animate-spin h-4 w-4 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    </div>
                  )}
                </div>


              )}
            </div>

            <div className="w-1/2">
              <input
                type="text"
                value={companyname ?? ""}
                disabled={!isManual}
                className={`w-full mt-0 text-xs capitalize p-2 border-b ${isManual ? "" : "bg-gray-100"}`}
              />
              <button
                type="button"
                onClick={() => {
                  setIsManual((prev) => !prev);
                  setTypedCompanyName("");
                  setShowUseButton(false);
                  setIsExpanded(false);
                }}
                className="text-[10px] text-blue-500 underline mt-2"
              >
                {isManual
                  ? "If Account Exists Switch to Select"
                  : "If Account is New Switch to Manual"}
              </button>
            </div>

          </div>


          {/* Show 'Use' button only if in manual mode, typed company is NOT existing elsewhere */}
          {isManual && showUseButton && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="mt-2 text-xs bg-blue-500 text-white px-3 py-1 rounded"
            >
              Use
            </button>
          )}

          {/* If typed company exists in other owner, show warning */}
          {isManual && !showUseButton && typedCompanyName.trim().length > 2 && (
            <p className="text-red-500 text-xs mt-1">
              Company name already exists and is owned by another user.
            </p>
          )}
        </div>
      </div>

      {/* Expandable Fields */}
      {isExpanded && (
        <div className="flex flex-wrap -mx-4 transition-all duration-300 ease-in-out">
          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <input
              type="hidden"
              value={companyid ?? ""}
              onChange={(e) => setcompanyid(e.target.value)}
              className="w-full px-3 py-2 border-b text-xs capitalize"
            />
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
