import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none -z-10 blur-3xl" />
      <div className="absolute -top-24 right-10 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {children || <Outlet />}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-[#94A3B8]">
        © {new Date().getFullYear()} Coaching Buddy Institute Partner Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
