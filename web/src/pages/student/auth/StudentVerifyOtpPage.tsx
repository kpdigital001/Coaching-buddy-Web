import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { studentService } from '../../../services/studentApi';
import { useStudentAuth } from '../../../context/StudentAuthContext';
import { useToast } from '../../../components/common/Toast';
import OtpInput from '../../../components/common/OtpInput';

export const StudentVerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const email = sessionStorage.getItem('CB_TEMP_STUDENT_EMAIL') || 'your email';
  const userId = sessionStorage.getItem('CB_TEMP_STUDENT_USER_ID') || '';

  const { login } = useStudentAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length < 4) {
      toast.warning('Invalid OTP', 'Please enter the 4-digit code sent to your email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await studentService.verifyOtp(otp, userId);
      const user = res?.data?.user || res?.data;
      const token = res?.data?.token || res?.token;
      const isNew = Boolean(res?.data?.isNew ?? res?.isNew);

      if (token && user) {
        login(user, token);
      } else if (user) {
        login(user);
      }

      const returnUrl = sessionStorage.getItem('CB_STUDENT_RETURN_URL') || '/';

      if (isNew) {
        toast.success('Welcome to CoachingBuddy!', 'Please complete your student profile.');
        navigate('/student/complete-profile');
      } else {
        toast.success('Welcome back!', `Logged in as ${user?.name || user?.email || 'Student'}`);
        navigate(returnUrl);
      }
    } catch (e: any) {
      toast.error('Verification Failed', e.response?.data?.message || 'Invalid passcode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !userId) return;
    try {
      await studentService.resendOtp(userId);
      setResendTimer(30);
      toast.success('Code Resent', `A new verification code has been sent to ${email}`);
    } catch (e: any) {
      toast.error('Error', e.response?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl sm:rounded-4xl border border-slate-200/90 p-8 sm:p-10 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 p-2 flex items-center justify-center mx-auto shadow-md">
          <img src="/student-logo.png" alt="Student App Logo" className="w-full h-full object-contain" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enter Verification Code</h1>
          <p className="text-xs text-slate-500">
            We sent a 4-digit verification code to <span className="font-bold text-slate-800">{email}</span>
          </p>
        </div>

        <div className="py-2 flex justify-center">
          <OtpInput length={4} value={otp} onChange={setOtp} />
        </div>

        <button
          type="button"
          onClick={() => handleVerify()}
          disabled={isLoading || otp.length < 4}
          className="w-full py-3.5 rounded-2xl gradient-teal text-white text-xs sm:text-sm font-bold shadow-teal hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-xs text-slate-500 pt-2">
          {resendTimer > 0 ? (
            <span>Resend code in {resendTimer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-[#0d9488] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Resend Verification Code</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentVerifyOtpPage;
