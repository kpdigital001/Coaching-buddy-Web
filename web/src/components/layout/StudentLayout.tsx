import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentNavbar from './StudentNavbar';
import StudentFooter from './StudentFooter';
import StudentBottomNav from './StudentBottomNav';

export const StudentLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-[#006EFF] selection:text-white">
      <StudentNavbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <StudentBottomNav />
      <StudentFooter />
    </div>
  );
};

export default StudentLayout;
