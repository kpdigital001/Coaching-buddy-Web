import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle, HelpCircle } from 'lucide-react';
import { studentService } from '../../services/studentApi';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useToast } from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export const ContactSupportPage: React.FC = () => {
  const { student } = useStudentAuth();
  const toast = useToast();

  const [email, setEmail] = useState(student?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !subject.trim() || !message.trim()) {
      toast.warning('Required', 'Please complete all support ticket fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await studentService.createSupportRequest({ email, subject, message });
      setIsSent(true);
      toast.success('Ticket Received', 'Our support team will respond within 24 hours');
    } catch (e) {
      toast.error('Error', 'Failed to send support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <SEO
        title="Help & Student Support Helpdesk"
        description="Contact Coaching Buddy student support for inquiries regarding course enrollments, academy fee payments, or onboarding assistance."
      />
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0d9488] flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Student Support Helpdesk</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have an issue with your course admission, center location, or fee payment? We are here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Cards */}
        <div className="space-y-4 md:col-span-1">
          <a
            href="mailto:support@coachingbuddyapp.com"
            className="block bg-white rounded-3xl border border-slate-200/90 p-5 space-y-1.5 shadow-2xs hover:border-teal-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#0d9488]" />
              <h3 className="font-bold text-xs text-slate-900">Email Support</h3>
            </div>
            <p className="text-xs font-semibold text-slate-700">support@coachingbuddyapp.com</p>
            <p className="text-[10px] text-slate-400">Response within 24 business hours</p>
          </a>

          <a
            href="tel:+919673123006"
            className="block bg-white rounded-3xl border border-slate-200/90 p-5 space-y-1.5 shadow-2xs hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-xs text-slate-900">Helpline Phone</h3>
            </div>
            <p className="text-xs font-semibold text-slate-700">+91 96731 23006</p>
            <p className="text-[10px] text-slate-400">Mon-Sat (9:00 AM – 7:00 PM IST)</p>
          </a>

          <a
            href="https://wa.me/919673123006"
            target="_blank"
            rel="noreferrer"
            className="block bg-white rounded-3xl border border-slate-200/90 p-5 space-y-1.5 shadow-2xs hover:border-green-400 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">WhatsApp Chat</h3>
            </div>
            <p className="text-xs font-semibold text-slate-700">+91 96731 23006</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Click to chat with advisor →</p>
          </a>

          <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Office & Location</h4>
            <p className="text-xs text-slate-200 font-medium">Pune, Maharashtra, India</p>
            <p className="text-[11px] text-slate-400">Serving students across Pune (Bavdhan, Kothrud, Wakad) & nationwide</p>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            {isSent ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">Support Ticket Submitted!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We have registered your ticket. A member of our student care team will email you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSent(false);
                    setSubject('');
                    setMessage('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-extrabold text-sm text-slate-900">Submit an Inquiry or Issue</h2>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Your Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subject / Category</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Question regarding admission confirmation for Allen Academy"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Detailed Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Please provide details about your booking ID, institute name, and question..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 font-medium resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-2xl gradient-teal text-white text-xs font-bold shadow-teal hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportPage;
