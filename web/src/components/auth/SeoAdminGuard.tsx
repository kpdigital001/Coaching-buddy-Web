import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSeoAdminSession } from '../../lib/seoAdminAccess';

/** SEO-only authenticated route; never uses Student/Institute auth context. */
export const SeoAdminGuard: React.FC = () => {
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    getSeoAdminSession().then((ok) => { if (active) setAllowed(ok); });
    return () => { active = false; };
  }, []);
  if (allowed === null) return <div className="min-h-screen flex items-center justify-center text-slate-600">Checking SEO Admin access…</div>;
  if (!allowed) return <Navigate to="/seo-admin/login" state={{ from: location }} replace />;
  return <Outlet />;
};
export default SeoAdminGuard;
