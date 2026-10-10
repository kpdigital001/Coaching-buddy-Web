import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';

export const StudentAuthGuard: React.FC = () => {
  const { isAuthenticated } = useStudentAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/student/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
};

export const StudentPublicGuard: React.FC = () => {
  const { isAuthenticated } = useStudentAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default StudentAuthGuard;
