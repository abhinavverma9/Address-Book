import React, { useState } from "react";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaFileExcel,
  FaDownload,
  FaCheck,
  FaExclamationCircle,
} from "react-icons/fa";
import Spinner from "./Spinner";
import * as XLSX from "xlsx";
import { useDispatch } from "react-redux";
import { bulkCreateContacts } from "../store/slices/contactsSlice";

const UploadModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [stats, setStats] = useState({ total: 0 });

  const resetState = () => {
    setFile(null);
    setPreviewData([]);
    setError(null);
    setSuccessMessage(null);
    setStats({ total: 0 });
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "Title",
      "First Name",
      "Last Name",
      "Gender",
      "DOB",
      "Address",
      "Street",
      "City",
      "State",
      "Pincode",
      "Email",
      "Phone",
    ];
    const data = [
      {
        Title: "Mr",
        "First Name": "John",
        "Last Name": "Doe",
        Gender: "Male",
        DOB: "1990-01-01",
        Address: "123 Main St",
        Street: "Broadway",
        City: "New York",
        State: "NY",
        Pincode: "10001",
        Email: "john@example.com",
        Phone: "1234567890",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "contact_upload_template.xlsx");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Reset previous state
    setError(null);
    setSuccessMessage(null);
    setPreviewData([]);

    // Validate type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      setError("Invalid file type. Please upload an Excel file (.xlsx, .xls).");
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setError("The uploaded file is empty.");
          return;
        }

        // Map and validate
        const mappedData = data.map((row) => ({
          title: row["Title"] || "",
          firstName: row["First Name"],
          lastName: row["Last Name"],
          gender: row["Gender"] || "",
          dob: row["DOB"] || "",
          address: row["Address"] || "",
          street: row["Street"] || "",
          city: row["City"] || "",
          state: row["State"] || "",
          pincode: row["Pincode"] || "",
          email: row["Email"] || "",
          phone: String(row["Phone"] || ""), // Ensure phone is string
        }));

        // Basic check for required fields
        const validRows = mappedData.filter(
          (d) => d.firstName && d.lastName && d.phone
        );

        if (validRows.length === 0) {
          setError(
            "No valid contacts found. Please check the template format. First Name, Last Name and Phone are required."
          );
        } else {
          setPreviewData(mappedData);
          setStats({ total: mappedData.length });
        }
      } catch (err) {
        console.error(err);
        setError(
          "Failed to parse file. Please ensure it is a valid Excel file."
        );
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (previewData.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const resultAction = await dispatch(bulkCreateContacts(previewData));
      if (bulkCreateContacts.fulfilled.match(resultAction)) {
        setSuccessMessage(
          resultAction.payload || "Contacts uploaded successfully!"
        );
        setTimeout(() => {
          handleClose();
        }, 4000);
      } else {
        setError(resultAction.payload || "Upload failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-transparent backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={handleClose}
      ></div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 
                        transform transition-all duration-300 ease-out
                        ${
                          isOpen
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95 pointer-events-none"
                        }`}
      >
        <div className="bg-white rounded shadow-2xl w-full max-w-[600px] overflow-hidden relative">
          <div className="bg-[#daeef7] py-4 px-6 flex justify-between items-center">
            <h2 className="text-[#2d7bc2] text-xl font-bold uppercase tracking-wider">
              Bulk Upload Contacts
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-8">
            <div className="mb-8 border-b border-gray-100 pb-6">
              <h3 className="text-[#2d7bc2] font-bold text-sm uppercase mb-2">
                Step 1: Get the Template
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Download the Excel template to ensure your data is formatted
                correctly.
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded hover:bg-green-50 transition-colors text-sm font-bold"
              >
                <FaFileExcel /> Download Excel Template
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-[#2d7bc2] font-bold text-sm uppercase mb-2">
                Step 2: Upload File
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Select your filled Excel file to upload.
              </p>

              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                  error ? "border-red-300" : "border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaCloudUploadAlt className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">XLSX or XLS files</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {file && (
              <div className="mb-6 bg-blue-50 p-4 rounded text-sm text-[#2d7bc2]">
                <p className="font-bold flex items-center gap-2">
                  <FaFileExcel /> {file.name}
                </p>
                {previewData.length > 0 && (
                  <p className="mt-1 text-xs">
                    Found {stats.total} contacts to process.
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 p-3 rounded text-sm text-red-600 flex items-start gap-2">
                <FaExclamationCircle className="mt-1 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-6 bg-green-50 p-3 rounded text-sm text-green-600 flex items-center gap-2">
                <FaCheck />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-500 font-bold text-sm hover:bg-gray-100 transition-colors uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !file || previewData.length === 0}
                className={`px-6 py-2 rounded-full bg-[#2d7bc2] text-white font-bold text-sm tracking-wide hover:bg-[#1e6bb8] transition-colors shadow-md uppercase flex items-center gap-2 ${
                  loading || !file || previewData.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading && <Spinner size="small" color="white" />}
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadModal;
