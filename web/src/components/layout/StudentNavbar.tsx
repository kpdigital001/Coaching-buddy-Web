import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  MapPin,
  Heart,
  CalendarCheck,
  Building2,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { getAvatarUrl } from '../../lib/avatarHelper';

const CITIES = ['All Cities', 'Bengaluru', 'Delhi NCR', 'Kota', 'Indore', 'Hyderabad', 'Pune', 'Mumbai'];

export const StudentNavbar: React.FC = () => {
  const { student, isAuthenticated, logout, selectedCity, setSelectedCity, savedInstituteIds, addRecentSearch } =
    useStudentAuth();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <img src="/student-logo.png" alt="Coaching Buddy Student" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                    Coaching<span className="text-[#0d9488]">Buddy</span>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Student Portal
                </span>
              </div>
            </Link>

            {/* City Selector Pill */}
            <div className="relative hidden md:block" ref={cityDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/70 rounded-full transition-colors border border-slate-200/60"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0d9488]" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                  <p className="px-3 py-1 text-[11px] font-bold uppercase text-slate-400">Select City</p>
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedCity === city
                          ? 'bg-teal-50 text-[#0d9488] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {city}
                      {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Center Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search JEE, NEET, coaching institutes, courses..."
                className="w-full pl-10 pr-4 py-2 text-xs font-medium text-slate-800 bg-slate-100/80 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30 focus:border-[#0d9488] focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </form>

          {/* Nav Links & Switcher */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl transition-colors ${
                    isActive ? 'text-[#0d9488] bg-teal-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/explore"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                    isActive || location.pathname.startsWith('/explore') || location.pathname.startsWith('/category')
                      ? 'text-[#0d9488] bg-teal-50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Compass className="w-4 h-4" />
                Explore
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl transition-colors ${
                    isActive ? 'text-[#0d9488] bg-teal-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                About
              </NavLink>

              <NavLink
                to="/student/saved"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors relative ${
                    isActive ? 'text-[#0d9488] bg-teal-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Heart className="w-4 h-4" />
                <span>Saved</span>
                {savedInstituteIds.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center -ml-0.5">
                    {savedInstituteIds.length}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/student/bookings"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                    isActive ? 'text-[#0d9488] bg-teal-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <CalendarCheck className="w-4 h-4" />
                My Bookings
              </NavLink>
            </nav>

            {/* Portal Switcher CTA: For Institutes */}
            <Link
              to="/institute/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-[#0d9488] bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all shadow-2xs hover:shadow-xs group"
              title="Switch to Institute Merchant Portal"
            >
              <Building2 className="w-4 h-4 text-[#0d9488] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Institute Portal</span>
              <span className="sm:hidden">Institute</span>
            </Link>

            {/* User Profile / Auth */}
            {isAuthenticated && student ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <img
                    src={getAvatarUrl(student.avatarName)}
                    alt={student.name || 'Student'}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-blue-50"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{student.name || 'Student'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{student.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/student/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#006EFF] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile & Avatar
                      </Link>
                      <Link
                        to="/student/bookings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#006EFF] transition-colors"
                      >
                        <CalendarCheck className="w-4 h-4 text-slate-400" />
                        My Bookings & Orders
                      </Link>
                      <Link
                        to="/student/saved"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#006EFF] transition-colors"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        Saved Institutes
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/student/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white gradient-teal hover:opacity-95 shadow-teal transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search institutes or courses..."
              className="w-full pl-10 pr-4 py-2 text-xs font-medium text-slate-800 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 focus:bg-white"
            />
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-600">Location:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs font-bold text-[#006EFF] bg-transparent focus:outline-none"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Home
          </Link>
          <Link
            to="/explore"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Explore Categories
          </Link>
          <Link
            to="/student/bookings"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            My Bookings
          </Link>
          <Link
            to="/student/saved"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Saved Institutes ({savedInstituteIds.length})
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            About Us
          </Link>
          <Link
            to="/contact-support"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Help & Support
          </Link>
          <Link
            to="/student/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            My Profile
          </Link>
          <Link
            to="/institute/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-[#0d9488] bg-teal-50 rounded-xl mt-2"
          >
            <Building2 className="w-4 h-4" />
            Go to Institute Merchant Portal
          </Link>
        </div>
      )}
    </header>
  );
};

export default StudentNavbar;
