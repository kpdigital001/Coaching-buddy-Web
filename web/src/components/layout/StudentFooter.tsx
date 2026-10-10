import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, ShieldCheck, Award, Instagram, Globe } from 'lucide-react';

export const StudentFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Institute Promotion Banner */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-700 rounded-3xl p-6 sm:p-8 mb-14 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs">
              <Building2 className="w-3.5 h-3.5" />
              <span>For Academy Owners & Educators</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Are you running a Coaching Institute?</h3>
            <p className="text-teal-100 text-xs sm:text-sm max-w-xl">
              Get direct student admissions, manage batch listings, track inquiries, and go online with the CoachingBuddy Partner Portal.
            </p>
          </div>
          <Link
            to="/institute/login"
            className="px-6 py-3 rounded-2xl bg-white text-[#0d9488] font-bold text-sm hover:bg-teal-50 transition-all shadow-md shrink-0 active:scale-95"
          >
            Open Institute Portal →
          </Link>
        </div>

        {/* 4-Column Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                <img src="/student-logo.png" alt="Coaching Buddy Student" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Coaching<span className="text-[#0d9488]">Buddy</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Coaching, Reimagined. Redefined. India's trusted platform to discover, compare, and book verified coaching institutes for JEE, NEET, Boards, Foundation, and Skill Classes.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>1,200+ Verified Academies</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Direct Admission & Best Fee Guarantee</span>
              </div>
            </div>
          </div>

          {/* Col 2: Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Popular Streams</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/explore" className="text-teal-400 font-bold hover:underline">
                  🌟 Explore All Categories →
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-teal-400 transition-colors">
                  IIT-JEE Main & Advanced
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-teal-400 transition-colors">
                  NEET Medical Entrance
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-teal-400 transition-colors">
                  Class 8-10 Foundation & Olympiad
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-teal-400 transition-colors">
                  UPSC, SSC & Civil Services
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-teal-400 transition-colors">
                  Commerce, CA & CS Foundation
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors">
                  Home Discovery
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                  <span>About CoachingBuddy</span>
                  <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-300 text-[10px] rounded font-bold">New</span>
                </Link>
              </li>
              <li>
                <Link to="/contact-support" className="hover:text-teal-400 transition-colors">
                  Contact & Support Helpdesk
                </Link>
              </li>
              <li>
                <Link to="/student/saved" className="hover:text-teal-400 transition-colors">
                  Saved Institutes
                </Link>
              </li>
              <li>
                <Link to="/student/bookings" className="hover:text-teal-400 transition-colors">
                  Track My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contact & Connect</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <a
                href="mailto:support@coachingbuddyapp.com"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="truncate">support@coachingbuddyapp.com</span>
              </a>
              <a
                href="tel:+919673123006"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 96731 23006</span>
              </a>
              <a
                href="https://www.instagram.com/coachingbuddy_official"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <span>@coachingbuddy_official</span>
              </a>
              <a
                href="https://www.coachingbuddy.co.in/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-teal-300 transition-colors"
              >
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>www.coachingbuddy.co.in</span>
              </a>
            </div>
            <div className="pt-2 flex flex-col gap-1.5 text-xs text-slate-400">
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms and Conditions
              </Link>
              <Link to="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CoachingBuddy Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400">
              About
            </Link>
            <span>•</span>
            <Link to="/contact-support" className="hover:text-slate-400">
              Support
            </Link>
            <span>•</span>
            <Link to="/institute/dashboard" className="text-[#0d9488] hover:underline font-semibold">
              Institute Merchant Portal
            </Link>
            <span>•</span>
            <Link to="/privacy-policy" className="hover:text-slate-400">
              Privacy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-400">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StudentFooter;
