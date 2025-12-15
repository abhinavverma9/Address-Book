import React, { useState } from 'react';
import { FaFacebookF, FaGoogle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import { login } from '../api/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      
      if (data.success) {
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      
      <AuthLayout title="LOGIN">
        <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
          <div className="w-full space-y-8 mb-8">
            <InputField 
              type="text" 
              name="floating_username" 
              label="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <InputField 
              type="password" 
              name="floating_password" 
              label="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button 
            type="submit"
            disabled={loading}
            className="w-48 py-3 rounded-full border border-[#2d7bc2] text-[#2d7bc2] font-bold text-sm tracking-wider hover:bg-[#2d7bc2] hover:text-white transition-all duration-300 mb-8 uppercase disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="flex flex-col items-center w-full">
          <span className="text-gray-500 text-sm mb-4">Or Sign In Using</span>
          <div className="flex gap-4 mb-6">
            <button className="w-10 h-10 rounded-full bg-[#3b5998] text-white flex justify-center items-center hover:opacity-90 transition-opacity shadow-sm" type="button">
              <FaFacebookF size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-[#db4437] text-white flex justify-center items-center hover:opacity-90 transition-opacity shadow-sm" type="button">
              <FaGoogle size={18} />
            </button>
          </div>
          
          <div className="text-gray-500 text-xs">
            Don't have an account? <Link to="/signup" className="text-[#2d7bc2] ml-1 hover:underline">Register Here</Link>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
};

export default Login;