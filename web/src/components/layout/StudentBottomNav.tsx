import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, CalendarCheck, User } from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';

export const StudentBottomNav: React.FC = () => {
  const { savedInstituteIds } = useStudentAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { label: 'Explore', path: '/explore', icon: <Compass className="w-5 h-5" /> },
    {
      label: 'Saved',
      path: '/student/saved',
      icon: (
        <div className="relative">
          <Heart className="w-5 h-5" />
          {savedInstituteIds.length > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
              {savedInstituteIds.length}
            </span>
          )}
        </div>
      ),
    },
    { label: 'Bookings', path: '/student/bookings', icon: <CalendarCheck className="w-5 h-5" /> },
    { label: 'Profile', path: '/student/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-[#0d9488] font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <span className="p-0.5">{item.icon}</span>
          <span className="text-[10px] font-bold tracking-tight mt-0.5">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default StudentBottomNav;
