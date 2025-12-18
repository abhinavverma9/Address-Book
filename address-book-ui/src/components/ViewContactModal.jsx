import React from "react";
import { FaUser } from "react-icons/fa";

const DetailRow = ({ label, value }) => (
  <div className="flex mb-4">
    <div className="w-32 text-[#2d7bc2] font-semibold text-sm">
      {label}
    </div>
    <div className="w-6 text-[#2d7bc2] font-semibold text-sm">:</div>
    <div className="flex-1 text-gray-700 text-sm">
      {value || "-"}
    </div>
  </div>
);

const ViewContactModal = ({ isOpen, onClose, contact }) => {
  if (!isOpen || !contact) return null;

  // Construct full address
  const fullAddress = [
    contact.address,
    contact.street,
    contact.city,
    contact.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>

      {/* Centered Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 
                   transform transition-all duration-300 ease-out
                   ${
                     isOpen
                       ? "opacity-100 scale-100"
                       : "opacity-0 scale-95 pointer-events-none"
                   }`}
      >
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-[700px] flex">
          {/* Left Side: White Background */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="py-8 px-12 flex justify-center">
              <h2 className="text-[#2d7bc2] text-xl font-bold uppercase tracking-wide bg-[#daeef7] py-2 px-12 rounded">
                Contact Details
              </h2>
            </div>

            {/* Details */}
            <div className="px-8 pb-8">
              <DetailRow 
                label="Name" 
                value={`${contact.title || ''} ${contact.firstName} ${contact.lastName}`.trim()} 
              />
              <DetailRow label="Gender" value={contact.gender} />
              <DetailRow label="Date of Birth" value={contact.dob} />
              <DetailRow label="Address" value={fullAddress} />
              <DetailRow label="Pincode" value={contact.pincode || '-'} />
              <DetailRow label="Email Id" value={contact.email} />
              <DetailRow label="Phone" value={contact.phone} />
            </div>

            {/* Footer Button */}
            <div className="flex justify-center pb-8">
              <button 
                onClick={onClose}
                className="min-w-[140px] px-8 py-2.5 rounded-full bg-[#2d7bc2] text-white font-semibold text-sm tracking-wider hover:bg-[#1e6bb8] transition-colors shadow-md uppercase"
              >
                Close
              </button>
            </div>
          </div>

          {/* Right Side: Light Blue Background with Profile Image */}
          <div className="w-48 bg-[#daeef7] flex items-start justify-center pt-32 px-6">
            <div className="w-32 h-32 rounded bg-white flex items-center justify-center overflow-hidden shadow-md">
              {contact.imagePath ? (
                <img 
                  src={contact.imagePath} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <FaUser className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewContactModal;