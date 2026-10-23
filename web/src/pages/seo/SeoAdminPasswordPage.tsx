import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSeoAdminSession, seoAdminLogin } from '../../lib/seoAdminAccess';

/**
 * Standalone SEO Admin login.
 * It intentionally does not use the normal institute/student authentication providers.
 */
export const SeoAdminPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let active = true;
    getSeoAdminSession().then((valid) => {
      if (active && valid) navigate('/seo-admin', { replace: true });
    });
    return () => { active = false; };
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Please enter your SEO Admin email and password.');
      return;
    }

    setIsChecking(true);
    try {
      await seoAdminLogin(normalizedEmail, password);
      navigate('/seo-admin', { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'SEO Admin login failed.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 shadow-xl p-6 sm:p-8">
        <div className="text-center mb-7">
          <div className="w-48 h-20 mx-auto mb-3 p-2 flex items-center justify-center">
            <img src="/CBWebLogo.png" alt="Coaching Buddy Logo" className="w-full h-full object-contain" />
          </div>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">SEO Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500">Private access for the CoachingBuddy SEO dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-700">SEO Admin Email</span>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                autoComplete="username"
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError('');
                }}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                placeholder="Enter SEO Admin email"
                autoFocus
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-700">Password</span>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                autoComplete="current-password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError('');
                }}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 py-3 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                placeholder="Enter SEO Admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isChecking}
            className="w-full rounded-xl bg-teal-600 text-white px-4 py-3 text-sm font-extrabold shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Signing in…' : 'Login to SEO Dashboard'}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
          This login is isolated from Student and Institute login. Their existing authentication flow is unchanged.
        </p>
      </div>
    </div>
  );
};

export default SeoAdminPasswordPage;
