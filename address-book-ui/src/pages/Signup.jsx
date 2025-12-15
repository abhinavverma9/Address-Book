import React, { useState } from 'react';
import Header from '../components/Header';
import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import { register } from '../api/authService';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const data = await register(
        formData.fullName,
        formData.email,
        formData.username,
        formData.password
      );

      if (data.success) {
        alert("Registration successful! Please login.");
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-48 py-3 rounded-full border border-[#2d7bc2] text-[#2d7bc2] font-bold text-sm tracking-wider hover:bg-[#2d7bc2] hover:text-white transition-all duration-300 mb-8 uppercase disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'REGISTER'}
          </button>
        </form>
      </AuthLayout>
    </div>
  );
};

export default Signup;