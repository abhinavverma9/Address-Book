import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import Spinner from '../components/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, resetRegistration, clearError } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState(''); // For password mismatch
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error, registrationSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(resetRegistration());
    };
  }, [dispatch]);

  useEffect(() => {
    if (registrationSuccess) {
      alert("Registration successful! Please login.");
      navigate('/');
      dispatch(resetRegistration());
    }
  }, [registrationSuccess, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());

    if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setLocalError("All fields are required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError("Invalid email format");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    dispatch(registerUser({
      fullName: formData.fullName,
      email: formData.email,
      username: formData.username,
      password: formData.password
    }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      
      <AuthLayout title="SIGN UP">
        <form onSubmit={handleRegister} className="w-full flex flex-col items-center">
          <div className="w-full space-y-8 mb-8">
            <InputField 
              type="text" 
              name="fullName" 
              label="Full Name" 
              value={formData.fullName} 
              onChange={handleChange} 
            />
            <InputField 
              type="email" 
              name="email" 
              label="Email ID" 
              value={formData.email} 
              onChange={handleChange} 
            />
            <InputField 
              type="text" 
              name="username" 
              label="Username" 
              value={formData.username} 
              onChange={handleChange} 
            />
            <InputField 
              type="password" 
              name="password" 
              label="Password" 
              value={formData.password} 
              onChange={handleChange} 
            />
            <InputField 
              type="password" 
              name="confirmPassword" 
              label="Confirm Password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
            />
          </div>
          
          {(error || localError) && <p className="text-red-500 text-sm mb-4">{localError || error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-48 py-3 rounded-full border border-[#2d7bc2] text-[#2d7bc2] font-bold text-sm tracking-wider hover:bg-[#2d7bc2] hover:text-white transition-all duration-300 mb-8 uppercase disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Spinner size="small" color="blue" /> : 'REGISTER'}
          </button>
        </form>
      </AuthLayout>
    </div>
  );
};

export default Signup;