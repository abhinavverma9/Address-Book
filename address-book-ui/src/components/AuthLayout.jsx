import React from 'react';
import { RiContactsBook2Fill } from "react-icons/ri";

const AuthLayout = ({ children, title }) => {
  return (
    <div className="flex-1 flex justify-center items-center p-4">
      <div className="flex w-full max-w-[850px] h-[550px] bg-white rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Left Side (Blue Panel) */}
        <div className="w-2/5 bg-[#2d7bc2] flex flex-col justify-center items-center text-white">
           <RiContactsBook2Fill size={140} className="opacity-90" />
        </div>
        
        {/* Right Side (Form) */}
        <div className="w-3/5 p-12 flex flex-col items-center">
          <h2 className="text-[#2d7bc2] text-4xl font-normal mb-10 tracking-wide">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
