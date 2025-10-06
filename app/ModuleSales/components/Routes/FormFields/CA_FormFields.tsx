import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

interface FormFieldsProps {
  referenceid: string;
  setreferenceid: (value: string) => void;
  manager: string;
  setmanager: (value: string) => void;
  tsm: string;
  settsm: (value: string) => void;
  companyname: string;
  setcompanyname: (value: string) => void;
  contactperson: string;
  setcontactperson: (value: string) => void;
  contactnumber: string;
  setcontactnumber: (value: string) => void;
  emailaddress: string;
  setemailaddress: (value: string) => void;
  companygroup: string;
  setcompanygroup: (value: string) => void;
  address: string;
  setaddress: (value: string) => void;
  deliveryaddress: string;
  setdeliveryaddress: (value: string) => void;
  area: string;
  setarea: (value: string) => void;
  status: string;
  setstatus: (value: string) => void;
  editPost?: any;
}

const FormFields: React.FC<FormFieldsProps> = (props) => {
  const {
    referenceid,
    setreferenceid,
    manager,
    setmanager,
    tsm,
    settsm,
    companyname,
    setcompanyname,
    contactperson,
    setcontactperson,
    contactnumber,
    setcontactnumber,
    emailaddress,
    setemailaddress,
    companygroup,
    setcompanygroup,
    address,
    setaddress,
    deliveryaddress,
    setdeliveryaddress,
    area,
    setarea,
    status,
    setstatus,
    editPost,
  } = props;

  const [contactPersons, setContactPersons] = useState<string[]>([""]);
  const [contactNumbers, setContactNumbers] = useState<string[]>([""]);
  const [emailAddresses, setEmailAddresses] = useState<string[]>([""]);

  // Sync split values
  useEffect(() => {
    setContactPersons(contactperson ? contactperson.split(", ").filter(Boolean) : [""]);
    setContactNumbers(contactnumber ? contactnumber.split(", ").filter(Boolean) : [""]);
    setEmailAddresses(emailaddress ? emailaddress.split(", ").filter(Boolean) : [""]);
  }, [contactperson, contactnumber, emailaddress]);

  // Load edit data
  useEffect(() => {
    if (editPost) {
      setcompanyname(editPost.companyname || "");
      setaddress(editPost.address || "");
      setarea(editPost.area || "");
      setstatus(editPost.status || "");
      setmanager(editPost.manager || "");
      settsm(editPost.tsm || "");
      setreferenceid(editPost.referenceid || "");
      setContactPersons(editPost.contactperson ? editPost.contactperson.split(", ") : [""]);
      setContactNumbers(editPost.contactnumber ? editPost.contactnumber.split(", ") : [""]);
      setEmailAddresses(editPost.emailaddress ? editPost.emailaddress.split(", ") : [""]);
    }
  }, [editPost]);

  // Update handlers
  const handleContactChange =
    (listSetter: React.Dispatch<React.SetStateAction<string[]>>, setParent: (v: string) => void) =>
      (index: number, value: string) => {
        const updated = [...(listSetter as any)._value];
        updated[index] = value;
        listSetter(updated);
        setParent(updated.join(", "));
      };

  const handleRemove =
    (items: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, setParent: (v: string) => void) =>
      (index: number) => {
        if (items.length > 1) {
          const updated = items.filter((_, i) => i !== index);
          setter(updated);
          setParent(updated.join(", "));
        }
      };

  const addNew = (setter: React.Dispatch<React.SetStateAction<string[]>>) => setter((prev) => [...prev, ""]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Hidden IDs */}
      <input type="hidden" value={referenceid} onChange={(e) => setreferenceid(e.target.value)} />
      <input type="hidden" value={manager} onChange={(e) => setmanager(e.target.value)} />
      <input type="hidden" value={tsm} onChange={(e) => settsm(e.target.value)} />

      {/* Company Name */}
      <div>
        <label className="block text-xs font-bold mb-2">Company Name</label>
        <input
          type="text"
          value={companyname}
          onChange={(e) => setcompanyname(e.target.value)}
          className="w-full px-3 py-2 border-b text-xs capitalize"
          required
        />
      </div>

      {/* Affiliate */}
      <div>
        <label className="block text-xs font-bold mb-2">Affiliate / Group</label>
        <input
          type="text"
          value={companygroup}
          onChange={(e) => setcompanygroup(e.target.value.replace(/[^a-zA-Z0-9,\s]/g, ""))}
          className="w-full px-3 py-2 border-b text-xs uppercase"
        />
      </div>

      {/* Contact Person */}
      <div>
        <label className="block text-xs font-bold mb-2">Contact Person</label>
        {contactPersons.map((person, i) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <input
              type="text"
              value={person}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                const updated = [...contactPersons];
                updated[i] = val;
                setContactPersons(updated);
                setcontactperson(updated.join(", "));
              }}
              className="w-full px-3 py-2 border-b text-xs capitalize"
            />
            {i === 0 ? (
              <button onClick={() => addNew(setContactPersons)} type="button" className="p-2 hover:bg-green-600 rounded-full text-white">
                <FaPlus size={12} />
              </button>
            ) : (
              <button onClick={() => handleRemove(contactPersons, setContactPersons, setcontactperson)(i)} type="button" className="p-2 hover:bg-red-600 rounded-full text-white">
                <FaMinus size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Contact Number */}
      <div>
        <label className="block text-xs font-bold mb-2">Contact Number</label>
        {contactNumbers.map((num, i) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <input
              type="text"
              value={num}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                const updated = [...contactNumbers];
                updated[i] = val;
                setContactNumbers(updated);
                setcontactnumber(updated.join(", "));
              }}
              className="w-full px-3 py-2 border-b text-xs"
            />
            {i === 0 ? (
              <button onClick={() => addNew(setContactNumbers)} type="button" className="p-2 hover:bg-green-600 rounded-full text-white">
                <FaPlus size={12} />
              </button>
            ) : (
              <button onClick={() => handleRemove(contactNumbers, setContactNumbers, setcontactnumber)(i)} type="button" className="p-2 hover:bg-red-600 rounded-full text-white">
                <FaMinus size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Email */}
      {/* Email Address */}
      <div>
        <label className="block text-xs font-bold mb-2">Email Address</label>
        {emailAddresses.map((email, i) => {
          const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          return (
            <div key={i} className="flex gap-2 items-center mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  const updated = [...emailAddresses];
                  updated[i] = val;
                  setEmailAddresses(updated);
                  // ✅ Remove extra spaces and empty values before joining
                  setemailaddress(updated.filter(Boolean).join(", "));
                }}
                className={`w-full px-3 py-2 border-b text-xs ${email && !valid ? "border-red-500" : ""
                  }`}
                placeholder="name@example.com"
              />
              {i === 0 ? (
                <button
                  type="button"
                  onClick={() => addNew(setEmailAddresses)}
                  className="p-2 hover:bg-green-600 bg-green-500 rounded-full text-white"
                >
                  <FaPlus size={12} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleRemove(emailAddresses, setEmailAddresses, setemailaddress)(i)
                  }
                  className="p-2 hover:bg-red-600 bg-red-500 rounded-full text-white"
                >
                  <FaMinus size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>


      {/* Address */}
      <div>
        <label className="block text-xs font-bold mb-2">Registered Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setaddress(e.target.value.replace(/[^a-zA-Z0-9#.,\s]/g, ""))}
          className="w-full px-3 py-2 border-b text-xs capitalize"
        />
      </div>

      {/* Delivery Address */}
      <div>
        <label className="block text-xs font-bold mb-2">Delivery Address</label>
        <input
          type="text"
          value={deliveryaddress}
          onChange={(e) => setdeliveryaddress(e.target.value.replace(/[^a-zA-Z0-9#.,\s]/g, ""))}
          className="w-full px-3 py-2 border-b text-xs capitalize"
        />
      </div>

      {/* Area */}
      <div>
        <label className="block text-xs font-bold mb-2">Area</label>
        <select
          value={area}
          onChange={(e) => setarea(e.target.value)}
          className="w-full px-3 py-2 border-b bg-white text-xs capitalize"
          required
        >
          <option value="">Select Region</option>
          <option value="NCR">NCR</option>
          <option value="Central Luzon">Region III - Central Luzon</option>
          <option value="Calabarzon">Region IV - CALABARZON</option>
          <option value="Davao Region">Region XI - Davao Region</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-bold mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setstatus(e.target.value)}
          className="w-full px-3 py-2 border-b bg-white text-xs capitalize"
          required
        >
          <option value="">Select Status</option>
          <option value="Active">Active</option>
          <option value="New Client">New Client</option>
          <option value="Non-Buying">Non-Buying</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
};

export default FormFields;
