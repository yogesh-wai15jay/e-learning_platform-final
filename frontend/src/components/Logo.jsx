import React from 'react';
import logo from '../assets/dbp-logo.svg';

const Logo = ({ className = "h-10 w-auto" }) => {
  return (
    <img 
      src={logo} 
      alt="Digital Business People Logo" 
      className={className}
    />
  );
};

export default Logo;