import React from 'react';

const InputField = ({ type, name, label, value, onChange, required = true }) => {
  return (
    <div className="relative z-0 w-full mb-5 group">
      <input 
        type={type} 
        name={name} 
        id={name} 
        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#2d7bc2] peer" 
        placeholder=" " 
        required={required}
        value={value}
        onChange={onChange}
      />
      <label 
        htmlFor={name} 
        className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-[#2d7bc2] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
      >
        {label}
      </label>
    </div>
  );
};

export default InputField;