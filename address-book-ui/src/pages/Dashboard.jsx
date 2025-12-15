import React from 'react';
import Header from '../components/Header';
import { logout } from '../api/authService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      <div className="flex-1 p-10 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-[#2d7bc2] mb-4">Welcome to Address Book</h1>
        <p className="mb-8">You are securely logged in.</p>
        <button 
          onClick={handleLogout}
          className="px-6 py-2 bg-[#2d7bc2] text-white rounded-full hover:bg-blue-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
