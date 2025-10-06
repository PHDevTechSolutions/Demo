import React, { useState, useEffect } from "react";
import FormFields from "../FormFields/CA_FormFields";
import { CiSaveUp1, CiEdit, CiTurnL1 } from "react-icons/ci";

interface AddUserFormProps {
  onCancel: () => void;
  refreshPosts: () => void;
  userDetails: {
    id: string;
    referenceid: string;
    manager: string;
    tsm: string;
  };
  editUser?: any;
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  onCancel,
  refreshPosts,
  userDetails,
  editUser,
}) => {
  // ✅ FIX: Added state for id
  const [id, setId] = useState("");

  const [referenceid, setReferenceid] = useState(userDetails.referenceid || "");
  const [manager, setManager] = useState(userDetails.manager || "");
  const [tsm, setTsm] = useState(userDetails.tsm || "");
  const [companyname, setcompanyname] = useState("");
  const [contactperson, setcontactperson] = useState("");
  const [contactnumber, setcontactnumber] = useState("");
  const [emailaddress, setemailaddress] = useState("");
  const [companygroup, setcompanygroup] = useState("");
  const [address, setaddress] = useState("");
  const [deliveryaddress, setdeliveryaddress] = useState("");
  const [area, setarea] = useState("");
  const [status, setstatus] = useState("");

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "">("");

  // ✅ FIX: Ensure editUser loads into state (including id)
  useEffect(() => {
    if (editUser) {
      setId(editUser.id || "");
      setReferenceid(editUser.referenceid || "");
      setManager(editUser.manager || "");
      setTsm(editUser.tsm || "");
      setcompanyname(editUser.companyname || "");
      setcontactperson(editUser.contactperson || "");
      setcontactnumber(editUser.contactnumber || "");
      setemailaddress(editUser.emailaddress || "");
      setcompanygroup(editUser.companygroup || "");
      setaddress(editUser.address || "");
      setdeliveryaddress(editUser.deliveryaddress || "");
      setarea(editUser.area || "");
      setstatus(editUser.status || "");
    }
  }, [editUser]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("🧩 Submitting form, edit mode:", !!editUser);
  console.log("🆔 Editing ID:", id);

  const url = editUser
    ? "/api/ModuleSales/UserManagement/CompanyAccounts/EditUser"
    : "/api/ModuleSales/UserManagement/CompanyAccounts/AddUser"; // just in case

  const method = editUser ? "PUT" : "POST";

  try {
    const payload = {
      id,
      referenceid,
      manager,
      tsm,
      companyname,
      contactperson,
      contactnumber,
      emailaddress,
      companygroup,
      address,
      deliveryaddress,
      area,
      status,
    };

    console.log("📤 Sending payload:", payload);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📥 Response status:", response.status);

    // ✅ Try to get text first (so we can see even invalid JSON)
    const rawText = await response.text();
    console.log("🧾 Raw response:", rawText);

    let resData;
    try {
      resData = JSON.parse(rawText);
    } catch {
      throw new Error(`Invalid JSON response: ${rawText}`);
    }

    if (!response.ok) {
      // Backend returned error (400/500)
      throw new Error(
        resData.error ||
          `Request failed with status ${response.status}: ${rawText}`
      );
    }

    if (!resData.success) {
      throw new Error(resData.error || "Unknown error updating account");
    }

    console.log("✅ Server response data:", resData);

    setAlertMessage(
      editUser
        ? "The account information has been updated successfully."
        : "A new account has been created successfully."
    );
    setAlertType("success");

    refreshPosts();
  } catch (error: any) {
    console.error("❌ Error submitting form:", error);

    // ✅ Display detailed error on-screen
    setAlertMessage(
      `Failed to save account: ${error.message || "Unknown error"}`
    );
    setAlertType("error");
  }

  // reset alert after 3s
  setTimeout(() => {
    setAlertMessage("");
    setAlertType("");
  }, 3000);
};


  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-gray-900 rounded-lg p-4 text-xs transition-all duration-300 w-full"
    >
      <h2 className="text-lg font-bold mb-4 mt-6">
        {editUser ? "Edit Account Information" : "Add New Account"}
      </h2>

      <p className="text-xs text-gray-600 mb-4">
        {editUser
          ? "Update the existing company details below. Ensure all fields are accurate."
          : "Fill out the company details to create a new account record."}
      </p>

      {alertMessage && (
        <div
          className={`mb-4 p-2 rounded border text-xs ${
            alertType === "success"
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-red-100 text-red-800 border-red-300"
          }`}
        >
          {alertMessage}
        </div>
      )}

      <FormFields
        referenceid={referenceid}
        setreferenceid={setReferenceid}
        manager={manager}
        setmanager={setManager}
        tsm={tsm}
        settsm={setTsm}
        companyname={companyname}
        setcompanyname={setcompanyname}
        contactperson={contactperson}
        setcontactperson={setcontactperson}
        contactnumber={contactnumber}
        setcontactnumber={setcontactnumber}
        emailaddress={emailaddress}
        setemailaddress={setemailaddress}
        companygroup={companygroup}
        setcompanygroup={setcompanygroup}
        address={address}
        setaddress={setaddress}
        deliveryaddress={deliveryaddress}
        setdeliveryaddress={setdeliveryaddress}
        area={area}
        setarea={setarea}
        status={status}
        setstatus={setstatus}
       
      />

      <div className="flex justify-end mt-4 gap-1">
        <button
          type="submit"
          className="bg-blue-400 text-white px-4 py-2 rounded text-xs flex items-center gap-1"
        >
          {editUser ? <CiEdit size={15} /> : <CiSaveUp1 size={15} />}
          {editUser ? "Update" : "Submit"}
        </button>

        <button
          type="button"
          className="px-4 py-2 border rounded text-xs flex items-center gap-1"
          onClick={onCancel}
        >
          <CiTurnL1 size={15} /> Back
        </button>
      </div>
    </form>
  );
};

export default AddUserForm;
