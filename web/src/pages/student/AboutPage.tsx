import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Users,
  Building2,
  Phone,
  Mail,
  Instagram,
  Compass,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Download,
} from 'lucide-react';
import SEO from '../../components/common/SEO';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <SEO
        title="About Us - Coaching, Reimagined"
        description="Learn about Coaching Buddy's mission to make quality coaching institutes transparent, accessible, and easily discoverable for every student and parent in India."
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-slate-900 to-slate-950 text-white py-16 sm:py-24">
        {/* Glow accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coaching, Reimagined. Redefined.</span>
          </div>

          {/* <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Elevating the Mentor & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-300">
              Student Learning Experience
            </span>
          </h1> */}

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            CoachingBuddy is India’s premier discovery, comparison, and direct admission platform for coaching institutes, tuition centers, competitive exam academies, and hobby classes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/explore"
              className="px-6 py-3.5 rounded-2xl gradient-teal text-white font-bold text-xs sm:text-sm shadow-teal hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Top Institutes</span>
            </Link>
            <Link
              to="/contact-support"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="relative -mt-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-[#0d9488]">1,200+</div>
            <div className="text-xs sm:text-sm font-bold text-slate-700">Verified Academies</div>
            <div className="text-[11px] text-slate-400">Pune & Across India</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-[#006EFF]">50,000+</div>
            <div className="text-xs sm:text-sm font-bold text-slate-700">Students Guided</div>
            <div className="text-[11px] text-slate-400">JEE, NEET & Boards</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-amber-500">98%</div>
            <div className="text-xs sm:text-sm font-bold text-slate-700">Satisfaction Rate</div>
            <div className="text-[11px] text-slate-400">Student & Parent Reviews</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-emerald-600">100%</div>
            <div className="text-xs sm:text-sm font-bold text-slate-700">Transparent Fees</div>
            <div className="text-[11px] text-slate-400">Direct Seat Reservation</div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0d9488] flex items-center justify-center font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Our Mission</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To simplify and democratize access to quality coaching education by bridging the gap between passionate mentors and ambitious learners. We empower students to find the perfect learning environment tailored to their career aspirations, budget, and location.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-[#0d9488]">
              <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
              <span>100% authentic listings & verified faculty profiles</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#006EFF] flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Our Vision</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To become India’s most trusted education marketplace and mentor ecosystem—where every student finds their guiding star and every coaching academy thrives through digital excellence, transparent admissions, and seamless batch management.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-[#006EFF]">
              <CheckCircle2 className="w-4 h-4 text-[#006EFF]" />
              <span>Technology-driven learning ecosystem</span>
            </div>
          </div>
        </div>

        {/* What Sets CoachingBuddy Apart */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Students & Parents Trust CoachingBuddy
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              We eliminate the guesswork in choosing the right coaching center with data-backed transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Verified Centers & Results</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every institute on our platform is thoroughly verified for physical infrastructure, genuine past results, and faculty credentials.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#006EFF] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Direct Inquiries & Call</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Directly connect with center heads, download course prospectuses, and schedule 1-on-1 counseling without middlemen.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Institute Management Portal</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Coaching owners get a powerful dashboard to publish batches, manage student inquiries, track payments, and showcase faculty.
              </p>
            </div>
          </div>
        </div>

        {/* Official Contact & Location Card */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-teal-400 uppercase tracking-wider">Official Contact Information</div>
              <h3 className="text-2xl font-black">CoachingBuddy Headquarters</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Serving students, parents, and educators across Pune (Bavdhan, Kothrud, Wakad) and all major cities in India.
              </p>
            </div>
            <a
              href="https://wa.me/919673123006"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
            >
              Chat on WhatsApp →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <Phone className="w-4 h-4" />
                <span>Call Helpline</span>
              </div>
              <p className="text-white font-extrabold text-sm">+91 96731 23006</p>
              <p className="text-slate-400 text-[11px]">Mon-Sat: 9:00 AM - 7:00 PM</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <Mail className="w-4 h-4" />
                <span>Email Support</span>
              </div>
              <p className="text-white font-extrabold text-sm">support@coachingbuddyapp.com</p>
              <p className="text-slate-400 text-[11px]">Replies within 24 business hours</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <Instagram className="w-4 h-4" />
                <span>Follow on Instagram</span>
              </div>
              <a
                href="https://www.instagram.com/coachingbuddy_official"
                target="_blank"
                rel="noreferrer"
                className="text-white font-extrabold text-sm hover:text-teal-300 transition-colors block underline underline-offset-2"
              >
                @coachingbuddy_official
              </a>
              <p className="text-slate-400 text-[11px]">Tips, exam updates & toppers</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <MapPin className="w-4 h-4" />
                <span>Head Office</span>
              </div>
              <p className="text-white font-extrabold text-sm">Pune, Maharashtra, India</p>
              <p className="text-slate-400 text-[11px]">Website: www.coachingbuddy.co.in</p>
            </div>
          </div>
        </div>

        {/* Download App CTA */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Experience CoachingBuddy on Mobile</h3>
            <p className="text-xs text-slate-500 max-w-md">
              Download our official Android app for instant seat bookings, batch notifications, and direct chat with academy mentors.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.coachingbuddy.user"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Student App</span>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.coachingbuddy.business"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0d9488] font-bold text-xs flex items-center gap-2 border border-teal-200 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>Institute Partner App</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
