import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RefreshCw, Clock, Phone } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const SuccessPage: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const { isVerified, setVerifiedState } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const res = await api.get('/user/auth');
      const storeData = res.data?.data?.store;
      if (storeData && storeData.status === 1) {
        setVerifiedState(true);
        toast.success('Institute Verified!', 'Your institute has been verified by CBI team.');
        navigate('/institute/dashboard');
        return;
      }
      setInfoModalOpen(true);
    } catch {
      if (isVerified) {
        toast.success('Institute Verified!', 'Your institute has been verified by CBI team.');
        navigate('/institute/dashboard');
      } else {
        setInfoModalOpen(true);
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-brand-lg p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Verification Success Illustration Icon */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-teal-50 border-4 border-teal-100 flex items-center justify-center mx-auto mb-6 shadow-inner animate-scale-up">
          <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-[#0d9488]" />
        </div>

        {/* Headings */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight leading-tight">
          Application Submitted <br className="hidden sm:inline" /> Successfully!
        </h2>

        <p className="text-sm text-[#64748B] max-w-sm mx-auto mt-3 leading-relaxed">
          Thank you for partnering with Coaching Buddy. Your institute application has been received and is currently under review by our verification team.
        </p>

        {/* Status Info Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-6 text-left flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#1E293B]">Verification Timeline: ~24 Hours</h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              We verify documents, addresses, and institute credentials within 24 business hours. You will receive an SMS and email upon activation.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isChecking}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={handleCheckStatus}
          >
            Check Status Again
          </Button>
        </div>

        {/* Contact Support Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <span>Need immediate help?</span>
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-1.5 font-bold text-[#0d9488] hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Partner Desk</span>
          </a>
        </div>
      </div>

      {/* Info Status Modal */}
      <Modal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="Application Under Review"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0d9488] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm text-[#64748B] leading-relaxed">
            If you just applied, please wait up to 24 hours for team approval. If it has been over 24 hours, contact our executive desk for expedited activation.
          </p>
          <div className="flex justify-center pt-2">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => setInfoModalOpen(false)}
            >
              Okay, I Understand
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuccessPage;
