import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaTimes, FaCloudUploadAlt, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import Spinner from './Spinner'; // Import Spinner component
import { uploadImage } from '../api/contactService';

const ContactModal = ({ isOpen, onClose, onSubmit, initialData = null, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    address: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    email: '',
    phone: '',
    image: null // Will store the path string
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); // Validation errors
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setFormData({
          title: initialData.title || '',
          firstName: initialData.firstName || '',
          lastName: initialData.lastName || '',
          gender: initialData.gender || '',
          dob: initialData.dob || '',
          address: initialData.address || '',
          street: initialData.street || '',
          city: initialData.city || '',
          state: initialData.state || '',
          pincode: initialData.pincode || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          image: initialData.imagePath || null 
        });
        setPreviewImage(initialData.imagePath || null); 
      } else {
        setFormData({
            title: '',
            firstName: '',
            lastName: '',
            gender: '',
            dob: '',
            address: '',
            street: '',
            city: '',
            state: '',
            pincode: '',
            email: '',
            phone: '',
            image: null
        });
        setPreviewImage(null);
      }
      setSubmitting(false);
      setUploading(false);
      setUploadError('');
      setUploadSuccess(false);
      setErrors({});
    }
  }, [isOpen, isEditMode, initialData]);

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.title) tempErrors.title = "Title is required";
    if (!formData.firstName) tempErrors.firstName = "First Name is required";
    if (!formData.lastName) tempErrors.lastName = "Last Name is required";
    if (!formData.gender) tempErrors.gender = "Gender is required";
    if (!formData.dob) tempErrors.dob = "Date of Birth is required";
    if (!formData.address) tempErrors.address = "Address is required";
    if (!formData.street) tempErrors.street = "Street is required";
    if (!formData.phone) {
        tempErrors.phone = "Phone is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = "Invalid email format";
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      tempErrors.phone = "Phone must be 10 digits";
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      tempErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validation
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
          setUploadError('Invalid file type. Please upload JPG, PNG, or GIF.');
          return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB
          setUploadError('File is too large. Max size is 2MB.');
          return;
      }

      setUploadError('');
      setUploading(true);
      setUploadSuccess(false);

      // Optimistic preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);

      try {
          const response = await uploadImage(file);
          if (response.success) {
              setFormData(prev => ({ ...prev, image: response.path }));
              setUploadSuccess(true);
          } else {
              setUploadError(response.message || 'Upload failed');
              setPreviewImage(null); // Revert preview on fail
          }
      } catch (err) {
          setUploadError('Upload failed. Please try again.');
          setPreviewImage(null);
      } finally {
          setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    if (uploading) return; 
    
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const Label = ({ children }) => (
    <label className="block text-[#2d7bc2] font-bold text-[10px] md:text-xs mb-1 uppercase tracking-wider">
      {children}
    </label>
  );

  const ErrorMsg = ({ children }) => (
    <span className="text-red-500 text-[10px] absolute bottom-[-16px] left-0">{children}</span>
  );

  const InputStyle = (name) => `w-full border-b ${errors[name] ? 'border-red-500' : 'border-gray-300'} py-2 text-sm text-gray-700 focus:outline-none focus:border-[#2d7bc2] bg-transparent placeholder-gray-400 transition-colors`;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-transparent backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Centered Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 
                   transform transition-all duration-300 ease-out
                   ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="bg-white rounded shadow-2xl w-full max-w-[850px] flex flex-col md:flex-row overflow-hidden relative max-h-[85vh]">
          
          {/* Close Button */}
          <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20 focus:outline-none"
          >
              <FaTimes size={20} />
          </button>
              
          {/* Left Side: Form */}
              <div className="w-full md:w-[70%] p-8 md:p-10 overflow-y-auto bg-white max-h-full custom-scrollbar"> 
                  <h2 className="text-[#2d7bc2] text-xl font-bold mb-4 text-center bg-[#daeef7] py-3 uppercase tracking-wider">
                      {isEditMode ? 'Edit Contact' : 'Create Contact'}
                  </h2>
                  
                  <form onSubmit={handleSubmit} noValidate>
                      {/* Personal Contact Section */}
                      <div className="mb-4">
                          <h3 className="text-[#2d7bc2] font-bold border-b-2 border-[#2d7bc2] mb-6 pb-1 text-base md:text-lg">
                              Personal Contact
                          </h3>
                          
                          <div className="flex gap-4 mb-6">
                              {/* Title */}
                              <div className="w-1/4 relative">
                                  <Label>Title *</Label>
                                  <select 
                                      name="title" 
                                      value={formData.title} 
                                      onChange={handleChange}
                                      className={InputStyle('title')}
                                      required
                                  >
                                      <option value=""></option>
                                      <option value="Mr">Mr</option>
                                      <option value="Mrs">Mrs</option>
                                      <option value="Ms">Ms</option>
                                  </select>
                                  {errors.title && <ErrorMsg>{errors.title}</ErrorMsg>}
                              </div>
                              
                              {/* First Name */}
                              <div className="w-1/3 flex-1 relative">
                                  <Label>First Name *</Label>
                                  <input 
                                      type="text" 
                                      name="firstName"
                                      placeholder="First Name"
                                      value={formData.firstName}
                                      onChange={handleChange}
                                      className={InputStyle('firstName')}
                                      required
                                  />
                                  {errors.firstName && <ErrorMsg>{errors.firstName}</ErrorMsg>}
                              </div>
                              
                              {/* Last Name */}
                              <div className="w-1/3 flex-1 relative">
                                  <Label>Last Name *</Label>
                                  <input 
                                      type="text" 
                                      name="lastName"
                                      placeholder="Last Name"
                                      value={formData.lastName}
                                      onChange={handleChange}
                                      className={InputStyle('lastName')}
                                      required
                                  />
                                  {errors.lastName && <ErrorMsg>{errors.lastName}</ErrorMsg>}
                              </div>
                          </div>

                          <div className="flex gap-4 mb-6">
                              {/* Gender */}
                              <div className="w-1/2 relative">
                                  <Label>Gender *</Label>
                                  <select 
                                      name="gender" 
                                      value={formData.gender} 
                                      onChange={handleChange}
                                      className={InputStyle('gender')}
                                      required
                                  >
                                      <option value=""></option>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                  </select>
                                  {errors.gender && <ErrorMsg>{errors.gender}</ErrorMsg>}
                              </div>
                              
                              {/* DOB */}
                              <div className="w-1/2 relative">
                                  <Label>Date Of Birth *</Label>
                                  <input 
                                      type="date" 
                                      name="dob"
                                      value={formData.dob}
                                      onChange={handleChange}
                                      className={InputStyle('dob')}
                                      required
                                  />
                                  {errors.dob && <ErrorMsg>{errors.dob}</ErrorMsg>}
                              </div>
                          </div>

                          {/* Upload Photo */}
                          <div className="mb-4">
                              <Label>Upload Photo</Label>
                              <div className="flex items-center gap-2 mt-3">
                                  <label className={`cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 border border-gray-300 rounded text-xs transition-colors flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                      <FaCloudUploadAlt />
                                      {uploading ? 'Uploading...' : 'Choose File'}
                                      <input 
                                          type="file" 
                                          className="hidden" 
                                          accept="image/*" 
                                          onChange={handleFileChange} 
                                          disabled={uploading}
                                      />
                                  </label>
                                  
                                  {uploading && <Spinner size="small" />}
                                  {uploadSuccess && <FaCheck className="text-green-500" />}
                                  {uploadError && <span className="text-red-500 text-xs flex items-center gap-1"><FaExclamationCircle /> {uploadError}</span>}
                                  
                                  <span className="text-gray-400 text-xs italic truncate max-w-[150px]">
                                      {!uploading && !uploadError && !uploadSuccess && (formData.image ? 'Image Selected' : 'No file chosen')}
                                  </span>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1">Max size: 2MB. Formats: JPG, PNG, GIF</p>
                          </div>
                      </div>

                      {/* Contact Details Section */}
                      <div className="mb-8">
                          <h3 className="text-[#2d7bc2] font-bold border-b-2 border-[#2d7bc2] mb-6 pb-1 text-base md:text-lg">
                              Contact Details
                          </h3>
                          
                          <div className="flex gap-4 mb-6">
                              <div className="w-1/2 relative">
                                  <Label>Address *</Label>
                                  <input 
                                      type="text" 
                                      name="address"
                                      placeholder="Address"
                                      value={formData.address}
                                      onChange={handleChange}
                                      className={InputStyle('address')}
                                      required
                                  />
                                  {errors.address && <ErrorMsg>{errors.address}</ErrorMsg>}
                              </div>
                              <div className="w-1/2 relative">
                                  <Label>Street *</Label>
                                  <input 
                                      type="text" 
                                      name="street"
                                      placeholder="Street Name"
                                      value={formData.street}
                                      onChange={handleChange}
                                      className={InputStyle('street')}
                                      required
                                  />
                                  {errors.street && <ErrorMsg>{errors.street}</ErrorMsg>}
                              </div>
                          </div>
                          
                          <div className="flex gap-4 mb-6">
                              <div className="w-1/3 relative">
                                  <Label>City</Label>
                                  <input 
                                      type="text" 
                                      name="city"
                                      placeholder="City"
                                      value={formData.city}
                                      onChange={handleChange}
                                      className={InputStyle('city')}
                                  />
                              </div>
                              <div className="w-1/3 relative">
                                  <Label>State</Label>
                                  <input 
                                      type="text" 
                                      name="state"
                                      placeholder="State"
                                      value={formData.state}
                                      onChange={handleChange}
                                      className={InputStyle('state')}
                                  />
                              </div>
                              <div className="w-1/3 relative">
                                  <Label>Pincode</Label>
                                  <input 
                                      type="text" 
                                      name="pincode"
                                      placeholder="Pincode"
                                      value={formData.pincode}
                                      onChange={handleChange}
                                      className={InputStyle('pincode')}
                                      maxLength="6"
                                  />
                                  {errors.pincode && <ErrorMsg>{errors.pincode}</ErrorMsg>}
                              </div>
                          </div>

                          <div className="flex gap-4 mb-6">
                              <div className="w-1/2 relative">
                                  <Label>Email</Label>
                                  <input 
                                      type="email" 
                                      name="email"
                                      placeholder="Email"
                                      value={formData.email}
                                      onChange={handleChange}
                                      className={InputStyle('email')}
                                  />
                                  {errors.email && <ErrorMsg>{errors.email}</ErrorMsg>}
                              </div>
                              <div className="w-1/2 relative">
                                  <Label>Phone *</Label>
                                  <input 
                                      type="tel" 
                                      name="phone"
                                      placeholder="Phone"
                                      value={formData.phone}
                                      onChange={handleChange}
                                      className={InputStyle('phone')}
                                      maxLength="10"
                                      required
                                  />
                                  {errors.phone && <ErrorMsg>{errors.phone}</ErrorMsg>}
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-center gap-4 mt-8 pb-4">
                          <button 
                              type="submit" 
                              disabled={submitting || uploading} // Disable button when submitting or uploading
                              className={`min-w-[120px] px-6 py-2 rounded-full bg-[#2d7bc2] text-white font-bold text-sm tracking-wide hover:bg-[#1e6bb8] transition-colors shadow-md uppercase flex items-center justify-center ${submitting || uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                              {submitting ? <Spinner size="small" color="white" /> : (isEditMode ? 'Update' : 'Create')}
                          </button>
                          <button 
                              type="button" 
                              onClick={onClose}
                              disabled={submitting} 
                              className="min-w-[120px] px-6 py-2 rounded-full border border-gray-400 text-gray-500 font-bold text-sm tracking-wide hover:bg-gray-100 transition-colors uppercase"
                          >
                              Cancel
                          </button>
                      </div>
                  </form>
              </div>

              {/* Right Side: Profile Preview */}
              <div className="hidden md:flex w-[30%] bg-[#daeef7] flex-col items-center justify-start border-l border-gray-200 max-h-full"> 
                  <div className="flex flex-col items-center mt-14">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 flex items-center justify-center text-white mb-6 overflow-hidden shadow-lg border-4 border-white">
                          {previewImage ? (
                              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                              <FaUserCircle className="w-full h-full text-gray-400" />
                          )}
                      </div>
                  </div>
              </div>
        </div>
      </div>
    </>
  );
};

export default ContactModal;
