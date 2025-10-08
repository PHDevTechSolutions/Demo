import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormFields from "../../Routes/FormFields/SA_FormFields";
import HistoricalRecordsTable from "../../Routes/Table/HR_Table";
import EditRecordModal from "../../Routes/Modal/RM_Modal";

import { CiTrash, CiCircleRemove, CiSaveUp1, CiEdit, CiTurnL1 } from "react-icons/ci";

interface AddUserFormProps {
  onCancel: () => void;
  refreshPosts: () => void;
  userDetails: {
    id: string;
    referenceid: string;
    manager: string;
    tsm: string;
    targetquota: string;
  };
  companyData?: {
    companyname: string;
    companygroup: string;
    typeclient: string;
    contactperson: string;
    contactnumber: string;
    emailaddress: string;
    address: string;
    deliveryaddress: string;
    area: string;
  };
  editUser?: any;
}

interface Activity {
  typeactivity: string;
  callback: string;
  callstatus: string;
  typecall: string;
  quotationnumber: string;
  quotationamount: string;
  actualsales: string;
  remarks: string;
  startdate: string;
  enddate: string;
  date_created: string; // Ensure this is a valid date string
}

const PAGE_SIZE = 5;

const AddUserForm: React.FC<AddUserFormProps> = ({ onCancel, refreshPosts, userDetails, editUser, companyData, }) => {
  const [referenceid, setReferenceid] = useState(userDetails.referenceid || "");
  const [manager, setManager] = useState(userDetails.manager || "");
  const [tsm, setTsm] = useState(userDetails.tsm || "");
  const [targetquota, setTargetQuota] = useState(userDetails.targetquota || "");

  const [companyname, setcompanyname] = useState(editUser ? editUser.companyname : companyData?.companyname || "");
  const [companygroup, setcompanygroup] = useState(editUser ? editUser.companygroup : companyData?.companygroup || "");
  const [typeclient, settypeclient] = useState(editUser ? editUser.typeclient : companyData?.typeclient || "");
  const [contactperson, setcontactperson] = useState(editUser ? editUser.contactperson : companyData?.contactperson || "");
  const [contactnumber, setcontactnumber] = useState(editUser ? editUser.contactnumber : companyData?.contactnumber || "");
  const [emailaddress, setemailaddress] = useState(editUser ? editUser.emailaddress : companyData?.emailaddress || "");
  const [address, setaddress] = useState(editUser ? editUser.address : companyData?.address || "");
  const [deliveryaddress, setdeliveryaddress] = useState(editUser ? editUser.deliveryaddress : companyData?.deliveryaddress || "");
  const [area, setarea] = useState(editUser ? editUser.area : companyData?.area || "");

  const [projectname, setprojectname] = useState(editUser ? editUser.projectname : "");
  const [projectcategory, setprojectcategory] = useState(editUser ? editUser.projectcategory : "");
  const [projecttype, setprojecttype] = useState(editUser ? editUser.projecttype : "");
  const [source, setsource] = useState(editUser ? editUser.source : "");

  const [typeactivity, settypeactivity] = useState(editUser ? editUser.typeactivity : "");
  const [remarks, setremarks] = useState(editUser ? editUser.remarks : "");
  const [callback, setcallback] = useState(editUser ? editUser.callback : "");
  const [typecall, settypecall] = useState(editUser ? editUser.typecall : "");
  const [quotationnumber, setquotationnumber] = useState(editUser ? editUser.quotationnumber : "");
  const [quotationamount, setquotationamount] = useState(editUser ? editUser.quotationamount : "");
  const [sonumber, setsonumber] = useState(editUser ? editUser.sonumber : "");
  const [soamount, setsoamount] = useState(editUser ? editUser.soamount : "");
  const [actualsales, setactualsales] = useState(editUser ? editUser.actualsales : "");
  const [callstatus, setcallstatus] = useState(editUser ? editUser.callstatus : "");

  const [startdate, setstartdate] = useState(editUser ? editUser.startdate : "");
  const [enddate, setenddate] = useState(editUser ? editUser.enddate : "");
  const [activitynumber, setactivitynumber] = useState(editUser?.activitynumber || "");
  const [activitystatus, setactivitystatus] = useState(editUser ? editUser.activitystatus : "");
  const [status, setstatus] = useState(editUser ? editUser.status : "");

  const [ticketreferencenumber, setticketreferencenumber] = useState(editUser ? editUser.ticketreferencenumber : "");
  const [wrapup, setwrapup] = useState(editUser ? editUser.wrapup : "");
  const [inquiries, setinquiries] = useState(editUser ? editUser.inquiries : "");
  const [csragent, setcsragent] = useState(editUser ? editUser.csragent : "");

  const [paymentterm, setpaymentterm] = useState(editUser ? editUser.paymentterm : "");
  const [deliverydate, setdeliverydate] = useState(editUser ? editUser.deliverydate : "");

  const [currentPage, setCurrentPage] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalRemarks, setModalRemarks] = useState("");

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // 🟢 ADD
  const [formSummary, setFormSummary] = useState<Record<string, string | number | null>>({});

  const [activityList, setActivityList] = useState<{
    id: number;
    typeactivity: string;
    callback: string;
    callstatus: string;
    typecall: string;
    remarks: string;
    quotationnumber: string;
    quotationamount: string;
    sonumber: string;
    soamount: string;
    actualsales: string;
    activitystatus: string;
    date_created: string;
    startdate: string;
    enddate: string;

    referenceid: string;
    manager: string;
    tsm: string;
    activitynumber: string;
    companyname: string;
    contactperson: string;
    contactnumber: string;
    emailaddress: string;
    typeclient: string;
    address: string;
    deliveryaddress: string;
    area: string;
    projectname: string;
    projectcategory: string;
    projecttype: string;
    source: string;
    targetquota: string;

  }[]>([]);

  type Activity = {
    id: number;
    typeactivity: string;
    callback: string;
    callstatus: string;
    typecall: string;
    remarks: string;
    quotationnumber: string;
    quotationamount: string;
    sonumber: string;
    soamount: string;
    actualsales: string;
    activitystatus: string;
    date_created: string;
    startdate: string;
    enddate: string;

    referenceid: string;
    manager: string;
    tsm: string;
    activitynumber: string;
    companyname: string;
    contactperson: string;
    contactnumber: string;
    emailaddress: string;
    typeclient: string;
    address: string;
    deliveryaddress: string;
    area: string;
    projectname: string;
    projectcategory: string;
    projecttype: string;
    source: string;
    targetquota: string;

  };

  // Fetch progress data when activitynumber change
  useEffect(() => {
    if (editUser?.activitynumber) {
      fetch(`/api/ModuleSales/Task/DailyActivity/FetchActivity?activitynumber=${editUser.activitynumber}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched Activity Data:", data); // 🟨 add this for debugging

          if (data.success && Array.isArray(data.data)) {
            const sortedData = data.data.sort((a: Activity, b: Activity) =>
              new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
            );
            setActivityList(sortedData);
          } else {
            setActivityList([]);
          }
          setCurrentPage(1);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setActivityList([]);
        });
    }
  }, [editUser?.activitynumber]);


  const totalPages = Math.ceil(activityList.length / PAGE_SIZE);
  const currentRecords = activityList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const summary = {
      Company: companyname,
      Contact: contactperson,
      "Contact Number": contactnumber,
      Email: emailaddress,
      "Client Type": typeclient,
      "Activity Type": typeactivity,
      Remarks: remarks,
      Callback: callback,
      "Quotation #": quotationnumber,
      "Quotation Amount": quotationamount,
      "SO #": sonumber,
      "SO Amount": soamount,
      "Actual Sales": actualsales,
      "Start Date": startdate,
      "End Date": enddate,
    };

    setFormSummary(summary);
    setShowConfirmModal(true);
  };

  // ✅ Confirm submit (Create or Edit)
  const handleConfirmProceed = async () => {
    setShowConfirmModal(false);

    const url = editUser
      ? `/api/ModuleSales/Task/DailyActivity/EditUser`
      : `/api/ModuleSales/Task/DailyActivity/CreateUser`;
    const method = editUser ? "PUT" : "POST";

    // 🧹 Convert empty strings to null
    const payload = {
      id: editUser?.id,
      referenceid, manager, tsm, targetquota,
      companyname, companygroup, contactperson, contactnumber, emailaddress,
      typeclient, address, deliveryaddress, area,
      projectname, projectcategory, projecttype, source, typeactivity,
      startdate, enddate, activitynumber, activitystatus, status, remarks,
      callback, typecall, quotationnumber, quotationamount, sonumber, soamount,
      actualsales, callstatus, ticketreferencenumber, wrapup, inquiries, csragent,
      paymentterm, deliverydate,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === "") {
        payload[key as keyof typeof payload] = null as any;
      }
    });

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await response.json();
      console.log("🔍 Server response:", data);

      if (!response.ok || data.success === false) {
        const errorMsg = data.error || "Unknown error occurred";
        console.error("❌ Submit failed:", errorMsg);
        toast.error(`❗ Failed: ${errorMsg}`, { autoClose: 2000 });
        return;
      }

      toast.success(editUser ? "✅ User updated successfully" : "✅ User added successfully", {
        autoClose: 1200,
        onClose: () => {
          onCancel();
          refreshPosts();
        },
      });
    } catch (err) {
      console.error("⚠️ Network or unexpected error:", err);
      toast.error("⚠️ Connection error. Check console for details.", { autoClose: 2000 });
    }
  };

  const handleCancelConfirm = () => setShowConfirmModal(false); // 🟢 ADD

  // Deletes the record after confirmation
  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      const response = await fetch(`/api/ModuleSales/Task/DailyActivity/DeleteProgress`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedId }),
      });

      if (response.ok) {
        toast.success("Post deleted successfully.");
      } else {
        toast.error("Failed to delete post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post.");
    } finally {
      setShowDeleteModal(false);
      setSelectedId(null);
    }
  };

  const handleShowRemarks = (remarks: string) => {
    setModalRemarks(remarks);
    setShowModal(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle input change inside modal
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedActivity((prev) => prev ? { ...prev, [name]: value } : prev);
  };

  // Save edited activity to API
  const handleSaveEdit = async () => {
    if (!selectedActivity) return;

    const originalActivity = activityList.find(a => a.id === selectedActivity.id);
    if (!originalActivity) return;

    const soChanged =
      originalActivity.sonumber !== selectedActivity.sonumber &&
      originalActivity.soamount !== selectedActivity.soamount;

    try {
      if (soChanged) {
        // 1. Update the original activity to RE-SO
        const updatedOriginal = {
          ...selectedActivity,
          soamount: "0",
          activitystatus: "RE-SO",
          sonumber: originalActivity.sonumber, // keep original SO#
        };

        const updateRes = await fetch("/api/ModuleSales/Task/DailyActivity/EditProgress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedOriginal),
        });

        if (!updateRes.ok) throw new Error("Failed to update RE-SO activity");

        // 2. Add a new duplicate with updated SO values
        const newActivity = {
          ...selectedActivity,
          id: undefined,
          date_created: new Date().toISOString(),
        };

        const postRes = await fetch("/api/ModuleSales/Task/DailyActivity/AddProgress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newActivity),
        });

        if (!postRes.ok) throw new Error("Failed to create new activity");

        const created = await postRes.json();

        // Update UI
        const updatedList = activityList
          .map((activity) => (activity.id === selectedActivity.id ? updatedOriginal : activity))
          .concat(created.data); // assuming the API returns { data: newActivity }

        setActivityList(updatedList);
        toast.success("RE-SO recorded and new activity created.");
      } else {
        // Standard update
        const response = await fetch("/api/ModuleSales/Task/DailyActivity/EditProgress", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedActivity),
        });

        if (!response.ok) throw new Error("Standard update failed");

        const updatedList = activityList.map((activity) =>
          activity.id === selectedActivity.id ? selectedActivity : activity
        );
        setActivityList(updatedList);
        toast.success("Activity updated successfully!");
      }

      setIsEditModalOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error("An error occurred while updating.");
    }
  };

  // Close modal
  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedActivity(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white text-xs border-t p-2">
        <div className="flex justify-end gap-2">
          <button type="button" className="hover:bg-gray-100 border text-black px-3 py-2 rounded text-[10px] flex items-center gap-1" onClick={onCancel}><CiTurnL1 size={15} /> Back</button>
        </div>

        <h2 className="text-xs font-bold mb-4 mt-4">
          {editUser ? "Update Activity Information" : "Add New Activity"}
        </h2>
        <p className="text-xs text-gray-600 mb-4">
          The process of <strong>creating</strong> or <strong>editing an activity</strong> involves updating key information associated with a company. When adding or editing an account, fields such as company name, contact details, client type, and status play an essential role in maintaining accurate and up-to-date records. These fields ensure smooth management and tracking of company accounts within the system, allowing for better organization and coordination. Properly updating these details is crucial for improving communication and ensuring the integrity of the data throughout the process.
        </p>
        <FormFields
          referenceid={referenceid} setreferenceid={setReferenceid}
          manager={manager} setmanager={setManager}
          tsm={tsm} settsm={setTsm}
          targetquota={targetquota} settargetquota={setTargetQuota}

          companyname={companyname} setcompanyname={setcompanyname}
          companygroup={companygroup} setcompanygroup={setcompanygroup}
          contactperson={contactperson} setcontactperson={setcontactperson}
          contactnumber={contactnumber} setcontactnumber={setcontactnumber}
          emailaddress={emailaddress} setemailaddress={setemailaddress}
          typeclient={typeclient} settypeclient={settypeclient}
          address={address} setaddress={setaddress}
          deliveryaddress={deliveryaddress} setdeliveryaddress={setdeliveryaddress}
          area={area} setarea={setarea}
          projectname={projectname} setprojectname={setprojectname}
          projectcategory={projectcategory} setprojectcategory={setprojectcategory}
          projecttype={projecttype} setprojecttype={setprojecttype}
          source={source} setsource={setsource}
          typeactivity={typeactivity} settypeactivity={settypeactivity}
          remarks={remarks} setremarks={setremarks}
          callback={callback} setcallback={setcallback}
          typecall={typecall} settypecall={settypecall}
          quotationnumber={quotationnumber} setquotationnumber={setquotationnumber}
          quotationamount={quotationamount} setquotationamount={setquotationamount}
          sonumber={sonumber} setsonumber={setsonumber}
          soamount={soamount} setsoamount={setsoamount}
          actualsales={actualsales} setactualsales={setactualsales}
          callstatus={callstatus} setcallstatus={setcallstatus}
          startdate={startdate} setstartdate={setstartdate}
          enddate={enddate} setenddate={setenddate}
          activitynumber={activitynumber} setactivitynumber={setactivitynumber}
          activitystatus={activitystatus} setactivitystatus={setactivitystatus}
          status={status} setstatus={setstatus}

          ticketreferencenumber={ticketreferencenumber} setticketreferencenumber={setticketreferencenumber}
          wrapup={wrapup} setwrapup={setwrapup}
          inquiries={inquiries} setinquiries={setinquiries}
          csragent={csragent} setcsragent={setcsragent}

          paymentterm={paymentterm} setpaymentterm={setpaymentterm}
          deliverydate={deliverydate} setdeliverydate={setdeliverydate}

          currentRecords={currentRecords}
          editPost={editUser}
        />

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={!typeclient.trim()}
            className={`px-3 py-2 rounded text-[10px] flex items-center gap-1 text-white 
      ${typeclient.trim()
                ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {editUser ? <CiEdit size={15} /> : <CiSaveUp1 size={15} />}
            {editUser ? "Save" : "Submit"}
          </button>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        {/* Historical Records Table */}
        <div className="mt-6">
          <h3 className="text-xs font-bold mb-2">Historical Records</h3>
          <p className="text-xs text-gray-600 mb-4">
            This section displays <strong>Historical Records</strong> of past activities, allowing users to view key details related to calls and related actions. It includes columns such as activity type, callback, call status, and related amounts. The table helps in tracking and reviewing past interactions for better decision-making and analysis.
          </p>

          {/* Desktop View */}
          <div>
            <HistoricalRecordsTable
              records={currentRecords}
              handleShowRemarks={handleShowRemarks}
            />

            {isEditModalOpen && selectedActivity && (
              <EditRecordModal
                selectedActivity={selectedActivity}
                handleInputChange={handleInputChange}
                handleModalClose={handleModalClose}
                handleSaveEdit={handleSaveEdit}
              />
            )}

            {/* Modal for showing full remarks */}
            {showModal && (
              <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-[999]">
                <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg">
                  <h3 className="font-semibold text-lg mb-4">Remarks</h3>
                  <div className="modal-body">
                    <p className="text-sm capitalize break-words">{modalRemarks}</p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="mt-4 text-blue-500 px-4 py-2 border border-blue-500 rounded text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between mt-4">
              <button
                className={`px-4 py-2 text-xs bg-gray-500 text-white rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-xs font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={`px-4 py-2 text-xs bg-blue-500 text-white rounded ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </form>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[2000] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
            <h2 className="font-bold text-sm mb-2">Confirm Submission</h2>
            <p className="text-xs text-gray-600 mb-3">
              Please review the following details before proceeding:
            </p>

            <div className="border rounded p-2 mb-3 max-h-64 overflow-y-auto text-xs">
              {Object.entries(formSummary).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-100 py-1">
                  <span className="font-semibold">{key}</span>
                  <span className="text-gray-700 text-right ml-2">{value || "-"}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={handleConfirmProceed}
                className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700"
              >
                Proceed
              </button>
              <button
                onClick={handleCancelConfirm}
                className="bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-xs hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xs font-bold mb-4">Confirm Deletion</h2>
            <p className="text-xs">Are you sure you want to delete this post?</p>
            <div className="mt-4 flex justify-end">
              <button className="bg-red-500 text-white text-xs px-4 py-2 rounded mr-2 flex items-center gap-1" onClick={confirmDelete}>
                <CiTrash size={20} /> Delete
              </button>
              <button className="bg-gray-300 text-xs px-4 py-2 rounded flex items-center gap-1" onClick={() => setShowDeleteModal(false)}>
                <CiCircleRemove size={20} />Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="text-sm z-[99999]"   // ⬅️ pinakamataas na z-index
        toastClassName={() =>
          "relative flex p-3 rounded-lg justify-between overflow-hidden cursor-pointer bg-white shadow-lg text-gray-800 text-sm"
        }
        progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
      />
    </>
  );
};

export default AddUserForm;
