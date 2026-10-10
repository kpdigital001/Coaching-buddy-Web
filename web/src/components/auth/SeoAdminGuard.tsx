import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isSeoAdminSessionUnlocked } from '../../lib/seoAdminAccess';

/**
 * SEO Admin has its own isolated session gate.
 * IMPORTANT: This guard does NOT use Institute AuthContext or StudentAuthContext.
 * Therefore changes here cannot alter the existing Student/Institute login flows.
 */
export const SeoAdminGuard: React.FC = () => {
  const location = useLocation();

  if (!isSeoAdminSessionUnlocked()) {
    return <Navigate to="/seo-admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default SeoAdminGuard;
