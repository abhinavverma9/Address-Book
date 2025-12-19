import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ContactModal from '../components/ContactModal';
import UploadModal from '../components/UploadModal';
import ViewContactModal from '../components/ViewContactModal';
import Spinner from '../components/Spinner';
import { FaFilePdf, FaFileExcel, FaPrint, FaUserCircle, FaCloudUploadAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Redux Actions
import { logoutUser } from '../store/slices/authSlice';
import { 
  fetchContacts, 
  createContact, 
  updateContact, 
  deleteContact,
  resetOperationSuccess 
} from '../store/slices/contactsSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux State
  const { user } = useSelector((state) => state.auth);
  const { items: contacts, loading: contactsLoading, operationSuccess } = useSelector((state) => state.contacts);
  
  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewContact, setViewContact] = useState(null);

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  // Handle operation success (Close modal and re-fetch if needed)
  useEffect(() => {
    if (operationSuccess) {
      handleCloseModal();
      dispatch(fetchContacts()); // Re-fetch to ensure list is up-to-date (especially for creates)
      dispatch(resetOperationSuccess());
    }
  }, [operationSuccess, dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const handleOpenCreateModal = () => {
      setCurrentContact(null);
      setIsEditMode(false);
      setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact) => {
      setCurrentContact(contact);
      setIsEditMode(true);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setCurrentContact(null);
      setIsEditMode(false);
  };

  const handleOpenUploadModal = () => {
      setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
      setIsUploadModalOpen(false);
  };

  const handleOpenViewModal = (contact) => {
      setViewContact(contact);
      setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
      setIsViewModalOpen(false);
      setViewContact(null);
  };

  const handleModalSubmit = async (formData) => {
      // Logic handled by Redux thunks, component waits for operationSuccess effect
      if (isEditMode && currentContact) {
          dispatch(updateContact({ id: currentContact.id, data: formData }));
      } else {
          dispatch(createContact(formData));
      }
  };

  const handleDeleteContact = async (id) => {
      if (window.confirm("Are you sure you want to delete this contact?")) {
          dispatch(deleteContact(id));
      }
  };

  const handleExportPDF = () => {
      const doc = new jsPDF();
      
      const tableColumn = ["Title", "First Name", "Last Name", "Email", "Phone", "City", "State"];
      const tableRows = [];

      contacts.forEach(contact => {
          const contactData = [
              contact.title || '',
              contact.firstName,
              contact.lastName,
              contact.email || '',
              contact.phone || '',
              contact.city || '',
              contact.state || ''
          ];
          tableRows.push(contactData);
      });

      doc.text("Address Book Contacts", 14, 15);
      autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 20,
      });

      doc.save("contacts.pdf");
  };

  const handleExportExcel = () => {
      const workSheet = XLSX.utils.json_to_sheet(contacts.map(contact => ({
          Title: contact.title || '',
          'First Name': contact.firstName,
          'Last Name': contact.lastName,
          Email: contact.email || '',
          Phone: contact.phone || '',
          City: contact.city || '',
          State: contact.state || '',
          Address: contact.address || '',
          Pincode: contact.pincode || '',
          Gender: contact.gender || '',
          DOB: contact.dob || ''
      })));
      
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "Contacts");
      
      XLSX.writeFile(workBook, "contacts.xlsx");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    
    if (!printWindow) {
        alert("Please allow popups to use the print feature.");
        return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Contact List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #2d7bc2; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; color: #333; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Address Book Contacts</h1>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              ${contacts.map(contact => `
                <tr>
                  <td>${contact.title || ''}</td>
                  <td>${contact.firstName} ${contact.lastName}</td>
                  <td>${contact.email || ''}</td>
                  <td>${contact.phone || ''}</td>
                  <td>${contact.city || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Slight delay to ensure content is loaded before printing
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#dcebf6]">
      <Header isAuthenticated={true} onLogout={handleLogout} />
      
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8">
        
        {/* Top White Bar with Export Icons */}
        <div className="bg-white rounded shadow-sm p-4 mb-6 flex justify-end items-center gap-4 h-16">
            <button 
                onClick={handleExportPDF}
                className="text-red-500 hover:opacity-80 transition-opacity"
            >
                <FaFilePdf size={24} />
            </button>
            <button 
                onClick={handleExportExcel}
                className="text-green-600 hover:opacity-80 transition-opacity"
            >
                <FaFileExcel size={24} />
            </button>
            <button 
                onClick={handlePrint}
                className="text-gray-600 hover:opacity-80 transition-opacity"
            >
                <FaPrint size={24} />
            </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Sidebar - Profile Card */}
            <div className="w-full md:w-1/4">
                <div className="bg-white rounded shadow-sm p-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 text-gray-300 mb-4">
                        <FaUserCircle className="w-full h-full" />
                    </div>
                    {/* User info from Redux */}
                    <h2 className="text-[#2d7bc2] text-xl font-bold mb-6">{user?.full_name || 'User'}</h2>
                    
                    <button 
                        onClick={handleOpenCreateModal}
                        className="bg-[#2d7bc2] text-white px-6 py-2 rounded-full font-bold text-sm tracking-wide hover:bg-[#1e6bb8] transition-colors shadow-sm uppercase mb-3 w-full"
                    >
                        Create Contact
                    </button>
                    <button 
                        onClick={handleOpenUploadModal}
                        className="bg-white border border-[#2d7bc2] text-[#2d7bc2] px-6 py-2 rounded-full font-bold text-sm tracking-wide hover:bg-[#daeef7] transition-colors shadow-sm uppercase w-full flex items-center justify-center gap-2"
                    >
                        <FaCloudUploadAlt /> Bulk Upload
                    </button>
                </div>
            </div>

            {/* Right Panel - Contact List */}
            <div className="w-full md:w-3/4">
                <div className="bg-white rounded shadow-sm p-6 min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-4 pl-20 text-[#2d7bc2] font-bold text-xs uppercase tracking-wider w-1/4">Name</th>
                                    <th className="py-4 text-[#2d7bc2] font-bold text-xs uppercase tracking-wider w-1/4">Email ID</th>
                                    <th className="py-4 text-[#2d7bc2] font-bold text-xs uppercase tracking-wider w-1/4">Phone Number</th>
                                    <th className="py-4 w-1/4"></th> 
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {contactsLoading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20">
                                            <Spinner size="large" />
                                        </td>
                                    </tr>
                                ) : contacts.length > 0 ? (
                                    contacts.map((contact) => (
                                        <tr key={contact.id} className="group">
                                            <td className="py-6 pr-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                                                        {contact.imagePath ? (
                                                            <img 
                                                                src={contact.imagePath} 
                                                                alt={contact.name} 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        ) : (
                                                            <FaUserCircle className="w-full h-full text-gray-300" />
                                                        )}
                                                    </div>
                                                    <span className="text-gray-600 font-medium truncate">{contact.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 text-gray-600">
                                                <div className="truncate max-w-[100px] md:max-w-[150px]" title={contact.email}>
                                                    {contact.email}
                                                </div>
                                            </td>
                                            <td className="py-6 text-gray-600">{contact.phone}</td>
                                            <td className="py-6">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleOpenEditModal(contact)}
                                                        className="px-5 py-1 rounded-full border border-[#2d7bc2] text-[#2d7bc2] text-xs font-bold hover:bg-[#2d7bc2] hover:text-white transition-colors uppercase"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteContact(contact.id)}
                                                        className="px-5 py-1 rounded-full border border-[#2d7bc2] text-[#2d7bc2] text-xs font-bold hover:bg-[#2d7bc2] hover:text-white transition-colors uppercase"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenViewModal(contact)}
                                                        className="px-5 py-1 rounded-full border border-[#2d7bc2] text-[#2d7bc2] text-xs font-bold hover:bg-[#2d7bc2] hover:text-white transition-colors uppercase"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">No contacts found. Create one to get started!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>

        <ContactModal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
            onSubmit={handleModalSubmit}
            initialData={currentContact}
            isEditMode={isEditMode}
        />

        <UploadModal
            isOpen={isUploadModalOpen}
            onClose={handleCloseUploadModal}
        />
        
        <ViewContactModal
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            contact={viewContact}
        />

      </main>
    </div>
  );
};

export default Dashboard;