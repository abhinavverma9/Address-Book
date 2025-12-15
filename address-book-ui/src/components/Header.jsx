import React from 'react';
import { FaUser, FaSignInAlt } from 'react-icons/fa';
import { RiContactsBook2Fill } from "react-icons/ri";
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-[#1e6bb8] text-white py-3 px-6 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3 font-bold text-lg">
        <RiContactsBook2Fill size={24} />
        <span>ADDRESS BOOK</span>
      </div>
      <div className="flex gap-6 text-sm font-medium">
        <Link to="/signup" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <FaUser />
          <span>Sign Up</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <FaSignInAlt />
          <span>Login</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
