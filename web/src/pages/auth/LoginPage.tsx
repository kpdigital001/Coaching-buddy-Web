import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Modal from '../../components/common/Modal';
import OtpInput from '../../components/common/OtpInput';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { isSeoAdminIdentityAllowed } from '../../lib/seoAdminAccess';

import api from '../../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isSaveEmail, setIsSaveEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Modal dialog states
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const timerRef = useRef<number | null>(null);
  const { login, setVerifiedState } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const GOOGLE_CLIENT_ID = '366859046730-irj1t3j1g4s60ges0okf2qlchfaiug20.apps.googleusercontent.com';
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const shouldReturnToSeoAdmin = (userEmail?: string, _userRole?: string) => {
    const fromPath = String((location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '');
    return fromPath.startsWith('/seo-admin') && isSeoAdminIdentityAllowed(userEmail);
  };

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
      toast.error('Google Sign In Error', 'Could not retrieve credentials from Google');
      return;
    }

    setIsLoading(true);
    setLoadingText('Authenticating with Google...');
    try {
      const res = await api.post('/user/google-login', { idToken, type: 'vendor' });
      const data = res?.data?.data || res?.data;
      if (data && (data.user || data.token)) {
        const userObj = data.user || {
          id: data.userId || 'vendor_user',
          email: email.trim() || 'vendor@institute.com',
          role: 'vendor',
        };
        login(userObj, data.token);
        toast.success('Signed In!', `Welcome, ${userObj.name || userObj.email}`);

        if (shouldReturnToSeoAdmin(userObj.email, userObj.role)) {
          navigate('/seo-admin/login', { replace: true });
          return;
        }

        if (data.isNew || !data.isOnboardingComplete) {
          navigate('/institute/onboard');
        } else if (!data.isVerified) {
          setVerifiedState(false);
          navigate('/institute/success');
        } else {
          setVerifiedState(true);
          navigate('/institute/dashboard');
        }
      } else {
        toast.error('Login Failed', res?.data?.message || 'Google login failed');
      }
    } catch (e: any) {
      toast.error('Google Auth Failed', e.response?.data?.message || 'Failed to authenticate with Google backend.');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // Load saved email
    const savedEmail = localStorage.getItem('saved_vendor_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setIsSaveEmail(true);
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);


  const startResendTimer = (seconds: number = 30) => {
    setResendTimer(seconds);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateEmail = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid institute email address';
    }

    if (!isAgreedToTerms) {
      newErrors.terms = 'Please accept the Terms & Conditions and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors: { [key: string]: string } = {};
    if (!otpCode || otpCode.length !== 4 || !/^\d{4}$/.test(otpCode)) {
      newErrors.otp = 'Please enter a valid 4-digit numeric OTP';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    setLoadingText('Sending OTP code...');

    try {
      if (isSaveEmail) {
        localStorage.setItem('saved_vendor_email', email.trim());
      } else {
        localStorage.removeItem('saved_vendor_email');
      }

      const res = await api.post('/user/sign-in', { email: email.trim(), type: 'vendor' });
      if (res.data?.data?.userId) {
        localStorage.setItem('temp_user_id', res.data.data.userId);
        setIsLoading(false);
        setIsOtpSent(true);
        startResendTimer(30);
        toast.success('OTP Sent Successfully', `Verification code sent to ${email}`);
      } else {
        throw new Error(res.data?.message || 'Failed to send OTP. Please check your email.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setInfoModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.',
      });
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateOtp()) return;

    setIsLoading(true);
    setLoadingText('Verifying & signing in...');

    try {
      const tempUserId = localStorage.getItem('temp_user_id');
      if (!tempUserId) {
        throw new Error('Session expired. Please request a new verification code.');
      }

      const res = await api.post('/user/otp/verify', {
        otp: otpCode,
        userId: tempUserId,
      });

      if (!res.data?.data) {
        throw new Error(res.data?.message || 'Invalid verification code');
      }

      const d = res.data.data;
      const userObj = d.user || {
        id: tempUserId,
        email: email.trim(),
        role: 'vendor',
      };

      login(userObj, d.token);
      setIsLoading(false);
      toast.success('Login Successful', 'Welcome to Coaching Buddy Institute Portal');

      if (shouldReturnToSeoAdmin(userObj.email, userObj.role)) {
        navigate('/seo-admin/login', { replace: true });
        return;
      }

      // Routing logic according to onboarding and verification status
      if (d.isNew || !d.isOnboardingComplete) {
        navigate('/institute/onboard');
      } else if (!d.isVerified) {
        setVerifiedState(false);
        navigate('/institute/success');
      } else {
        setVerifiedState(true);
        navigate('/institute/dashboard');
      }
    } catch (err: any) {
      setIsLoading(false);
      setInfoModal({
        isOpen: true,
        title: 'Verification Failed',
        message: err.response?.data?.message || err.message || 'Invalid OTP code. Please check and try again.',
      });
    }
  };

  const handleGoogleLogin = async () => {
    if (window.google?.accounts?.id) {
      const btn = googleBtnRef.current?.querySelector('div[role="button"]') as HTMLElement;
      if (btn) {
        btn.click();
      } else {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            toast.info('Google Sign-In', 'Please select your Google account in the Google popup.');
          }
        });
      }
    } else {
      toast.error('Google Services Loading', 'Please wait a moment and click again or use Email OTP.');
    }
  };

  return (
    <div className="w-full">
      {/* Brand Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-brand-lg p-6 sm:p-8 relative overflow-hidden">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="w-48 h-20 rounded-2xl  mx-auto mb-3.5 p-2 flex items-center justify-center transform hover:scale-105 transition-transform">
            <img src="/CBWebLogo.png" alt="Coaching Buddy Logo" className="w-full h-full object-contain" />
          </div>

          {/* <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight">Coaching Buddy</h2> */}
          <p className="text-xs sm:text-sm text-[#0d9488] font-semibold mt-0.5">Institute Partner Portal</p>
        </div>

        {/* Form Container */}
        {!isOtpSent ? (
          /* Step 1: Email Form */
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-sm sm:text-base font-bold text-[#1E293B]">Partner Sign In</h3>
              <p className="text-xs text-[#64748B] mt-0.5">Enter your registered institute email to receive OTP</p>
            </div>

            <InputField
              label="Email Address"
              type="email"
              placeholder="director@apexacademy.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              icon={<Mail className="w-4 h-4" />}
              error={errors.email}
              required
              autoFocus
            />

            {/* Checkboxes: Save Email & Terms */}
            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-2.5 text-xs text-[#64748B] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSaveEmail}
                  onChange={(e) => setIsSaveEmail(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0d9488] focus:ring-[#0d9488]/30 cursor-pointer"
                />
                <span>Remember this email for next login</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-[#64748B] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAgreedToTerms}
                  onChange={(e) => {
                    setIsAgreedToTerms(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-[#0d9488] focus:ring-[#0d9488]/30 cursor-pointer mt-0.5"
                />
                <span className="leading-snug">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTermsModalOpen(true);
                    }}
                    className="text-[#0d9488] font-semibold hover:underline"
                  >
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrivacyModalOpen(true);
                    }}
                    className="text-[#0d9488] font-semibold hover:underline"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.terms && <p className="text-xs text-[#EF4444] font-medium">{errors.terms}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="mt-2"
            >
              {isLoading ? (loadingText || 'Sending...') : 'Send Verification OTP'}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#E2E8F0] w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Or Continue With
              </span>
              <div className="border-t border-[#E2E8F0] w-full" />
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[#CBD5E1] hover:bg-slate-50 text-[#1E293B] rounded-xl font-semibold text-sm transition-all shadow-xs active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>Sign in with Google</span>
            </button>
            <div ref={googleBtnRef} className="hidden" />
          </form>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleVerifyOTP} className="space-y-5 animate-scale-up">
            <div className="text-center">
              <h3 className="text-base font-bold text-[#1E293B]">Enter Verification Code</h3>
              <p className="text-xs text-[#64748B] mt-1">
                We sent a 4-digit code to <span className="font-semibold text-[#1E293B]">{email}</span>
              </p>
            </div>

            {/* 4-digit OTP box input */}
            <div className="py-2">
              <OtpInput
                value={otpCode}
                onChange={(code) => {
                  setOtpCode(code);
                  if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                }}
                error={!!errors.otp}
                disabled={isLoading}
              />
              {errors.otp && (
                <p className="text-xs text-[#EF4444] text-center font-medium mt-1">{errors.otp}</p>
              )}
            </div>

            {/* Resend Timer & Actions */}
            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtpCode('');
                  setErrors({});
                }}
                className="text-[#64748B] hover:text-[#1E293B] font-medium flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email</span>
              </button>

              {resendTimer > 0 ? (
                <span className="text-[#64748B] font-medium">
                  Resend in <span className="font-bold text-[#0d9488]">{resendTimer}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOTP()}
                  className="text-[#0d9488] font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              {isLoading ? (loadingText || 'Verifying...') : 'Verify & Sign In'}
            </Button>
          </form>
        )}
      </div>

      {/* Info / Error Modal */}
      <Modal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
        title={infoModal.title}
        maxWidth="sm"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-[#64748B]">{infoModal.message}</p>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => setInfoModal({ ...infoModal, isOpen: false })}
          >
            Okay
          </Button>
        </div>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="Terms & Conditions"
        maxWidth="lg"
      >
        <div className="space-y-3 text-xs sm:text-sm text-[#64748B] max-h-80 overflow-y-auto pr-2">
          <p className="font-semibold text-[#1E293B]">1. Merchant Partnership Agreement</p>
          <p>By registering on Coaching Buddy Institute Portal, you agree to provide authentic course details, pricing, and teacher qualifications.</p>
          <p className="font-semibold text-[#1E293B]">2. Student Admissions & Lead Handling</p>
          <p>Institutes are expected to respond to student inquiries in a timely manner and honor the discounts published on the platform.</p>
          <p className="font-semibold text-[#1E293B]">3. Verification & Compliance</p>
          <p>Coaching Buddy reserves the right to review certificates, addresses, and institute credentials prior to publishing online status.</p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setTermsModalOpen(false)}>
            I Understand
          </Button>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title="Privacy Policy"
        maxWidth="lg"
      >
        <div className="space-y-3 text-xs sm:text-sm text-[#64748B] max-h-80 overflow-y-auto pr-2">
          <p className="font-semibold text-[#1E293B]">Information Collection</p>
          <p>We collect essential institute details including contact phone numbers, location, teacher profiles, and course catalog for student discovery.</p>
          <p className="font-semibold text-[#1E293B]">Data Protection & Security</p>
          <p>All partner data is securely encrypted in transit and at rest. We never share institute administrative data with unauthorized third parties.</p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setPrivacyModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
