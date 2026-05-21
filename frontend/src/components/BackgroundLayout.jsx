import React from 'react';
import { useLocation } from 'react-router-dom';
import backgroundImage from '../assets/background.png';

const BackgroundLayout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Background image as an <img> tag */}
      <img
        src={backgroundImage}
        alt="background"
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
      />
      {/* Remove or lighten the overlay – set opacity to 0 or remove entirely */}
      {/* <div className="fixed inset-0 bg-black/40 -z-5" /> */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundLayout;