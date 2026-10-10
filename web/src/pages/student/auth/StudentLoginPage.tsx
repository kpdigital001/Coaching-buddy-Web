import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, ArrowRight, Building2 } from 'lucide-react';
import { studentService } from '../../../services/studentApi';
import { useStudentAuth } from '../../../context/StudentAuthContext';
import { useToast } from '../../../components/common/Toast';

const GOOGLE_CLIENT_ID = '366859046730-irj1t3j1g4s60ges0okf2qlchfaiug20.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: any;
  }
}

export const StudentLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const { login } = useStudentAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services
  useEffect(() => {
    const initGoogleGsi = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: '100%',
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGsi();
    } else {
      const timer = setTimeout(initGoogleGsi, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    const idToken = response?.credential;
    if (!idToken) {
      toast.error('Google Sign-In Error', 'Could not retrieve credentials from Google');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const res = await studentService.googleLogin(idToken);
      if ((res?.status || res?.success) && res.data) {
        const { user, token, isNew } = res.data;
        if (token) {
          login(user, token);
        } else {
          login(user);
        }

        if (isNew) {
          sessionStorage.setItem('CB_TEMP_STUDENT_EMAIL', user.email || '');
          sessionStorage.setItem('CB_STUDENT_RETURN_URL', returnUrl);
          toast.success('Welcome!', 'Please complete your student profile.');
          navigate('/student/complete-profile');
        } else {
          toast.success('Signed In!', `Welcome back, ${user.name || user.email}`);
          navigate(returnUrl);
        }
      } else {
        toast.error('Login Failed', res?.message || 'Server failed to authenticate with Google');
      }
    } catch (e: any) {
      toast.error('Google Auth Failed', e.response?.data?.message || 'Failed to authenticate with Google backend.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCustomGoogleClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt was skipped or not displayed, find and click the rendered button
          const btn = googleBtnRef.current?.querySelector('div[role="button"]') as HTMLElement;
          if (btn) {
            btn.click();
          } else {
            toast.info('Google Sign-In', 'Please select your Google Account in the popup');
          }
        }
      });
    } else {
      toast.error('Google Services Loading', 'Please wait a moment and click again or use Email OTP.');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.warning('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await studentService.login(email.trim());
      const userId =
        res?.data?.userId ||
        res?.data?.id ||
        res?.data?.uid ||
        (typeof res?.data === 'string' ? res.data : '') ||
        (res as any)?.userId;

      if (userId) {
        sessionStorage.setItem('CB_TEMP_STUDENT_EMAIL', email.trim());
        sessionStorage.setItem('CB_TEMP_STUDENT_USER_ID', userId);
        sessionStorage.setItem('CB_STUDENT_RETURN_URL', returnUrl);

        toast.success('OTP Sent', `Verification passcode sent to ${email}`);
        navigate('/student/verify-otp');
      } else if (res?.status) {
        sessionStorage.setItem('CB_TEMP_STUDENT_EMAIL', email.trim());
        sessionStorage.setItem('CB_STUDENT_RETURN_URL', returnUrl);
        toast.success('OTP Sent', res.message || 'Passcode sent to your email');
        navigate('/student/verify-otp');
      } else {
        toast.error('Login Failed', res?.message || 'Failed to send OTP to this email');
      }
    } catch (e: any) {
      toast.error('Error', e.response?.data?.message || 'Failed to send OTP. Please check your email address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl sm:rounded-4xl border border-slate-200/90 p-8 sm:p-10 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 p-2 flex items-center justify-center mx-auto shadow-md">
            <img src="/student-logo.png" alt="Student App Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Sign In</h1>
          <p className="text-xs text-slate-500">
            Login or register to book courses, view admission status, and save institutes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30 focus:bg-white"
                autoFocus
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full py-3.5 rounded-2xl bg-[#0B1F3A] hover:bg-[#061325] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{isLoading ? 'Sending Passcode...' : 'Continue with OTP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Or Continue With
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Hidden Container for Rendered GSI Button */}
        <div ref={googleBtnRef} className="hidden" />

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleCustomGoogleClick}
          disabled={isLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isGoogleLoading ? (
            <div className="w-5 h-5 border-2 border-[#006EFF] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        {/* Terms notice */}
        <p className="text-[11px] text-center text-slate-400 leading-relaxed">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-slate-600 underline font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy-policy" className="text-slate-600 underline font-medium">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Institute Switcher Link */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-1.5">
          <p className="text-xs text-slate-400">Are you a Coaching Institute Director?</p>
          <Link
            to="/institute/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d9488] hover:underline"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Go to Institute Merchant Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginPage;
