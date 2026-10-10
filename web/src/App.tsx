import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import StudentAuthProvider from './context/StudentAuthContext';
import ToastProvider from './components/common/Toast';

// Institute Layout & Pages
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';
import { AuthGuard, PublicGuard } from './components/auth/AuthGuard';
import LoginPage from './pages/auth/LoginPage';
import SuccessPage from './pages/auth/SuccessPage';
import OnboardPage from './pages/onboard/OnboardPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CoursesPage from './pages/courses/CoursesPage';
import BookingsPage from './pages/bookings/BookingsPage';
import MediaPage from './pages/media/MediaPage';
import OffersPage from './pages/offers/OffersPage';
import SettingsPage from './pages/settings/SettingsPage';
import DesignSystemPreview from './pages/DesignSystemPreview';
import SeoAdminPage from './pages/seo/SeoAdminPage';
import SeoAdminPasswordPage from './pages/seo/SeoAdminPasswordPage';
import SeoAdminGuard from './components/auth/SeoAdminGuard';

// Student Layout & Pages
import StudentLayout from './components/layout/StudentLayout';
import { StudentAuthGuard, StudentPublicGuard } from './components/auth/StudentGuard';
import StudentHomePage from './pages/student/StudentHomePage';
import StudentCategoryPage from './pages/student/StudentCategoryPage';
import StudentSearchPage from './pages/student/StudentSearchPage';
import StudentInstituteDetailsPage from './pages/student/StudentInstituteDetailsPage';
import StudentBookingsPage from './pages/student/StudentBookingsPage';
import StudentSavedPage from './pages/student/StudentSavedPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentLoginPage from './pages/student/auth/StudentLoginPage';
import StudentVerifyOtpPage from './pages/student/auth/StudentVerifyOtpPage';
import StudentCompleteProfilePage from './pages/student/auth/StudentCompleteProfilePage';
import ContactSupportPage from './pages/student/ContactSupportPage';
import AboutPage from './pages/student/AboutPage';
import PrivacyPolicyPage from './pages/student/PrivacyPolicyPage';
import TermsPage from './pages/student/TermsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StudentAuthProvider>
          <ToastProvider>
            <Routes>
              {/* ========================================= */}
              {/* 1. STUDENT / LEARNER PORTAL ROUTES        */}
              {/* ========================================= */}
              <Route element={<StudentLayout />}>
                {/* Public Browsing Routes */}
                <Route path="/" element={<StudentHomePage />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/explore" element={<StudentCategoryPage />} />

                {/* SEO-friendly public discovery URLs */}
                <Route path="/coaching-institutes/:citySlug/:categorySlug" element={<StudentCategoryPage />} />
                <Route path="/coaching-institutes/:citySlug" element={<StudentCategoryPage />} />
                <Route path="/institute/:citySlug/:instituteSlug" element={<StudentInstituteDetailsPage />} />

                {/* Legacy URLs kept for backward compatibility */}
                <Route path="/category" element={<StudentCategoryPage />} />
                <Route path="/category/:id" element={<StudentCategoryPage />} />
                <Route path="/search" element={<StudentSearchPage />} />
                <Route path="/institute/:id" element={<StudentInstituteDetailsPage />} />
                {/* Public Auth Guard (Redirects if already logged in) */}
                <Route element={<StudentPublicGuard />}>
                  <Route path="/student/login" element={<StudentLoginPage />} />
                  <Route path="/student/verify-otp" element={<StudentVerifyOtpPage />} />
                  <Route path="/student/complete-profile" element={<StudentCompleteProfilePage />} />
                </Route>

                {/* Protected Student Account Routes (Requires login) */}
                <Route element={<StudentAuthGuard />}>
                  <Route path="/student/saved" element={<StudentSavedPage />} />
                  <Route path="/student/bookings" element={<StudentBookingsPage />} />
                  <Route path="/student/profile" element={<StudentProfilePage />} />
                </Route>

                {/* Helpdesk & Legal */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact-support" element={<ContactSupportPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
              </Route>

              {/* ========================================= */}
              {/* 2. SEO ADMIN (restricted role/email)       */}
              {/* ========================================= */}
              <Route path="/seo-admin/login" element={<SeoAdminPasswordPage />} />
              <Route element={<SeoAdminGuard />}>
                <Route path="/seo-admin" element={<SeoAdminPage />} />
              </Route>

              {/* ========================================= */}
              {/* 3. INSTITUTE MERCHANT PORTAL (PRESERVED)   */}
              {/* ========================================= */}

              {/* Public Merchant Auth */}
              <Route element={<PublicGuard />}>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/institute/login" element={<LoginPage />} />
                </Route>
              </Route>

              {/* Merchant Onboarding Wizard */}
              <Route path="/onboard" element={<OnboardPage />} />
              <Route path="/institute/onboard" element={<OnboardPage />} />

              {/* Merchant Application Success Status */}
              <Route element={<AuthLayout />}>
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/institute/success" element={<SuccessPage />} />
              </Route>

              {/* Protected Institute Merchant Portal Routes */}
              <Route element={<AuthGuard />}>
                <Route element={<DashboardLayout />}>
                  {/* Direct routes */}
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/media" element={<MediaPage />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/design-system" element={<DesignSystemPreview />} />

                  {/* Namespaced /institute/* routes */}
                  <Route path="/institute" element={<Navigate to="/institute/dashboard" replace />} />
                  <Route path="/institute/dashboard" element={<DashboardPage />} />
                  <Route path="/institute/courses" element={<CoursesPage />} />
                  <Route path="/institute/bookings" element={<BookingsPage />} />
                  <Route path="/institute/media" element={<MediaPage />} />
                  <Route path="/institute/offers" element={<OffersPage />} />
                  <Route path="/institute/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Global Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </StudentAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
