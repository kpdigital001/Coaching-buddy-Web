import React from 'react';
import { FileText } from 'lucide-react';
import SEO from '../../components/common/SEO';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <SEO
        title="Terms and Conditions"
        description="Review the terms of service, admission booking policies, and user conduct guidelines for Coaching Buddy."
      />
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-amber-600" />
          <span>Terms and Conditions</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">Effective Date: January 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Coaching Buddy platform (including browsing institutes, submitting reviews, or booking
            course admissions), you agree to comply with and be bound by these Terms and Conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900">2. Institute Listings & Accuracy</h2>
          <p>
            While Coaching Buddy conducts verification of listed centers, course schedules, batch sizes, and faculty details are
            provided and maintained by the respective coaching institutes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900">3. Admission Bookings & Cancellations</h2>
          <p>
            Direct admission bookings placed on Coaching Buddy reserve priority seats. Cancellation terms follow individual institute
            guidelines and must be processed within the allowed cancellation window.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900">4. Community Guidelines for Reviews</h2>
          <p>
            Reviews and ratings posted by students must be truthful, constructive, and based on authentic learning experience.
            Defamatory, fraudulent, or abusive reviews will be moderated and removed immediately.
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t border-slate-100">
          <h2 className="font-extrabold text-base text-slate-900">5. Contact & Inquiries</h2>
          <p>
            For questions regarding these terms or institutional partnerships, please contact CoachingBuddy at:
          </p>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
            <p><strong>Email:</strong> support@coachingbuddyapp.com</p>
            <p><strong>Helpline:</strong> +91 96731 23006</p>
            <p><strong>Official Website:</strong> <a href="https://www.coachingbuddy.co.in/" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">https://www.coachingbuddy.co.in/</a></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
