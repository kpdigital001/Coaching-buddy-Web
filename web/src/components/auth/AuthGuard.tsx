import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AuthGuard: React.FC = () => {
  const { isAuthenticated, isOnboardingComplete, isVerified } = useAuth();
  const location = useLocation();

  // 1. Not Authenticated -> Redirect to Institute Login
  if (!isAuthenticated) {
    return <Navigate to="/institute/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated but Onboarding not complete -> Redirect to Onboard
  if (!isOnboardingComplete && location.pathname !== '/institute/onboard' && location.pathname !== '/onboard') {
    return <Navigate to="/institute/onboard" replace />;
  }

  // 3. Onboarding complete but not verified -> Redirect to Success / Pending status
  if (!isVerified && location.pathname !== '/institute/success' && location.pathname !== '/success') {
    return <Navigate to="/institute/success" replace />;
  }

  return <Outlet />;
};

export const PublicGuard: React.FC = () => {
  const { isAuthenticated, isOnboardingComplete, isVerified } = useAuth();

  // If already authenticated, redirect according to status
  if (isAuthenticated) {
    if (!isOnboardingComplete) return <Navigate to="/institute/onboard" replace />;
    if (!isVerified) return <Navigate to="/institute/success" replace />;
    return <Navigate to="/institute/dashboard" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
