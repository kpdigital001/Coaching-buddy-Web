import React from 'react';
import { Shield } from 'lucide-react';
import SEO from '../../components/common/SEO';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <SEO
        title="Privacy Policy"
        description="Learn how Coaching Buddy protects student personal information, data safety protocols, and privacy compliance."
      />
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-emerald-600" />
          <span>Privacy Policy</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">Last updated: January 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900">1. Information We Collect</h2>
          <p>
            When you create an account or book an admission on Coaching Buddy, we collect your name, email address, phone number,
            selected exam stream, and geographic location to recommend relevant coaching academies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900">2. How We Use Your Data</h2>
          <p>
            Your information is used strictly to process course reservations, deliver booking confirmations, connect you with
            verified institutes, and provide personalized coaching suggestions. We do not sell personal contact data to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900">3. Sharing with Coaching Academies</h2>
          <p>
            When you submit an admission booking or inquiry, your basic student contact details are shared directly with the chosen
            institute director so they can reserve your seat and schedule classroom orientation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900">4. Data Security</h2>
          <p>
            We implement industry standard encryption and authenticated access controls to safeguard your data. You may request
            account deletion at any time directly through your student profile settings.
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t border-slate-100">
          <h2 className="font-extrabold text-base text-slate-900">5. Grievance Officer & Contact</h2>
          <p>
            For privacy inquiries or data rights requests, reach our Data Protection team at:
          </p>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
            <p><strong>Email:</strong> support@coachingbuddyapp.com</p>
            <p><strong>Phone:</strong> +91 96731 23006</p>
            <p><strong>Website:</strong> <a href="https://www.coachingbuddy.co.in/" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">www.coachingbuddy.co.in</a></p>
            <p><strong>Location:</strong> Pune, Maharashtra, India</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
