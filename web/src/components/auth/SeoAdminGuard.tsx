import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSeoAdminSession } from '../../lib/seoAdminAccess';

/** Completely independent of StudentAuthContext and Institute AuthContext. */
export const SeoAdminGuard: React.FC = () => {
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let current = true;
    getSeoAdminSession().then(ok => { if (current) setAllowed(ok); })
      .catch(() => { if (current) setAllowed(false); });
    return () => { current = false; };
  }, [location.pathname]);

  if (allowed === null) return <div className="min-h-screen flex items-center justify-center text-slate-500">Checking SEO Admin session…</div>;
  if (!allowed) return <Navigate to="/seo-admin/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export default SeoAdminGuard;