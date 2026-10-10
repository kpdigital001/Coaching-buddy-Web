import {
  CalendarCheck,
  ChevronRight,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Phone,
  Settings,
  Tag,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../common/ConfirmationModal';
import { useToast } from '../common/Toast';

export const DashboardLayout: React.FC = () => {
  const { user, store, logout, updateStoreStatusState } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const isStoreOnline = store?.status === 1;

  const handleToggleStoreStatus = () => {
    setIsStatusUpdating(true);
    setTimeout(() => {
      const nextStatus = isStoreOnline ? 0 : 1;
      updateStoreStatusState(nextStatus);
      setIsStatusUpdating(false);
      setIsStatusModalOpen(false);
      toast.success(
        nextStatus === 1 ? 'Store is now Online' : 'Store is now Offline',
        `Your institute is now ${nextStatus === 1 ? 'visible to students' : 'hidden from student searches'}`
      );
    }, 400);
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Courses', path: '/courses', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'My Bookings', path: '/bookings', icon: <CalendarCheck className="w-5 h-5" /> },
    { label: 'Media & Gallery', path: '/media', icon: <ImageIcon className="w-5 h-5" /> },
    { label: 'Offers & Discounts', path: '/offers', icon: <Tag className="w-5 h-5" /> },
    { label: 'Institute Info', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans">
      {/* Mobile Top App Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#1E293B] hover:bg-slate-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-xs">
              <img src="/logo.png" alt="CB" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#1E293B] leading-tight line-clamp-1">{store?.name || 'Coaching Buddy'}</h2>
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${isStoreOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {isStoreOnline ? '● Online' : '○ Offline'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsStatusModalOpen(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isStoreOnline
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
            }`}
        >
          {isStoreOnline ? 'Live' : 'Offline'}
        </button>
      </header>

      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
          }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Institute Header */}
          <div className="p-6 border-b border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-2xs">
                  <img src="/logo.png" alt="Coaching Buddy" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="font-extrabold text-base text-[#1E293B] tracking-tight">Coaching Buddy</h1>
                  <p className="text-xs text-[#0d9488] font-medium">Institute Portal</p>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden text-[#64748B] hover:text-[#1E293B] p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Institute Store Profile Card & Status Switch */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mt-2">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-xs text-[#1E293B] truncate">{store?.name || 'My Institute'}</h3>
                  <p className="text-[11px] text-[#64748B] truncate">📍 {store?.address.city || 'India'}</p>
                </div>
              </div>

              {/* Status Switcher Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-xs font-medium text-[#64748B]">Institute Status:</span>
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${isStoreOnline
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isStoreOnline ? 'bg-emerald-600 animate-pulse' : 'bg-red-600'}`} />
                  {isStoreOnline ? 'Online' : 'Offline'}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Navigation</p>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                    ? 'bg-[#0d9488] text-white shadow-teal font-semibold'
                    : 'text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-[#0d9488] flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name ? user.name.charAt(0) : 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1E293B] truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-[#64748B] truncate">{user?.email || 'admin@coaching.com'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Merchant</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <div className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-[#64748B] hover:text-[#1E293B] p-2"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-[#64748B]">Welcome back,</span>
            <span className="text-base font-bold text-[#1E293B]">{store?.name || 'Apex Academy'}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Switch to Student Portal */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0d9488] bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-2xs"
              title="View Public Student Website"
            >
              <span>← Student Portal</span>
            </Link>

            {/* Quick Live Toggle in Topbar */}
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-medium text-[#64748B]">Store Status:</span>
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${isStoreOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isStoreOnline ? 'bg-emerald-600' : 'bg-red-600'}`} />
                {isStoreOnline ? 'Online' : 'Offline'}
              </button>
            </div>

            {/* Quick Contact buttons */}
            <a
              href={`tel:+91${store?.contact.phone}`}
              className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:text-[#0d9488] hover:border-[#0d9488] transition-colors"
              title="Call Support"
            >
              <Phone className="w-4 h-4" />
            </a>

            <a
              href={`https://wa.me/91${store?.contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:text-emerald-600 hover:border-emerald-500 transition-colors"
              title="WhatsApp Support"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Page Viewport Container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2 py-2 flex items-center justify-around shadow-lg">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${isActive ? 'text-[#0d9488] font-bold' : 'text-[#94A3B8]'
                }`}
            >
              <span className="p-1">{item.icon}</span>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 text-[#94A3B8] hover:text-[#1E293B]"
        >
          <span className="p-1"><Menu className="w-5 h-5" /></span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">More</span>
        </button>
      </div>

      {/* Store Online / Offline Confirmation Modal */}
      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleToggleStoreStatus}
        title={isStoreOnline ? 'Turn Institute Offline?' : 'Make Institute Online?'}
        message={
          isStoreOnline
            ? 'When offline, students will not be able to find your institute or submit new booking inquiries.'
            : 'When online, students can view your courses, submit inquiries, and book admissions.'
        }
        confirmText={isStoreOnline ? 'Go Offline' : 'Go Online'}
        variant={isStoreOnline ? 'warning' : 'success'}
        isLoading={isStatusUpdating}
      />

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
          navigate('/login');
        }}
        title="Sign Out"
        message="Are you sure you want to log out of Coaching Buddy Merchant Portal?"
        confirmText="Log Out"
        variant="danger"
      />
    </div>
  );
};

export default DashboardLayout;
