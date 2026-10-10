import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Camera,
  Trash2,
  LogOut,
  Save,
  CheckCircle,
  HelpCircle,
  FileText,
  Shield,
} from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useToast } from '../../components/common/Toast';
import { getAvatarUrl, AVATAR_MAP } from '../../lib/avatarHelper';
import { studentService } from '../../services/studentApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Modal from '../../components/common/Modal';

export const StudentProfilePage: React.FC = () => {
  const { student, updateProfileState, logout } = useStudentAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(student?.name || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [city, setCity] = useState(student?.city || '');
  const [area, setArea] = useState(student?.area || '');
  const [state, setState] = useState(student?.state || 'Karnataka');
  const [pincode, setPincode] = useState(student?.pincode || '');
  const [avatarName, setAvatarName] = useState(student?.avatarName || 'EduBee');

  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Name required', 'Please enter your full name');
      return;
    }

    setIsSaving(true);
    try {
      const updateData = { name, phone, city, area, state, pincode, avatarName };
      if (student?.id) {
        await studentService.updateProfile(student.id, updateData);
      }
      updateProfileState(updateData);
      toast.success('Profile Saved', 'Your student account details have been updated!');
    } catch (e) {
      toast.error('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      if (student?.id) {
        await studentService.deleteAccount(student.id);
      }
      logout();
      toast.info('Account Deleted', 'Your student profile has been removed.');
      navigate('/');
    } catch (e) {
      toast.error('Error', 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl sm:rounded-4xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          <img
            src={getAvatarUrl(avatarName)}
            alt="Student Avatar"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover bg-blue-50 border-2 border-white shadow-lg"
          />
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="absolute -bottom-2 -right-2 p-2 rounded-xl gradient-primary text-white shadow-md hover:scale-105 transition-transform"
            title="Change Avatar"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-[#006EFF] text-xs font-bold border border-blue-200/60 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Account</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{student?.name || 'Student Learner'}</h1>
          <p className="text-xs sm:text-sm text-slate-500">{student?.email}</p>
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="text-xs font-bold text-[#006EFF] hover:underline pt-1 inline-block"
          >
            Choose Learning Avatar ({avatarName}) →
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Personal & Academic Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kunal Verma"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address (Read-only)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={student?.email || ''}
                readOnly
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mobile / WhatsApp Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">City</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Area / Locality</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Indiranagar"
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Karnataka"
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 560038"
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl gradient-teal text-white text-xs font-bold shadow-teal hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Support & Legal Links */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Help & Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/contact-support"
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center gap-3 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-[#006EFF]" />
            <div>
              <span className="font-bold text-xs text-slate-900 block">Contact Support</span>
              <span className="text-[10px] text-slate-400">Get help with bookings</span>
            </div>
          </Link>

          <Link
            to="/privacy-policy"
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center gap-3 transition-colors"
          >
            <Shield className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold text-xs text-slate-900 block">Privacy Policy</span>
              <span className="text-[10px] text-slate-400">How we protect data</span>
            </div>
          </Link>

          <Link
            to="/terms"
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center gap-3 transition-colors"
          >
            <FileText className="w-5 h-5 text-amber-600" />
            <div>
              <span className="font-bold text-xs text-slate-900 block">Terms of Service</span>
              <span className="text-[10px] text-slate-400">User terms & rules</span>
            </div>
          </Link>
        </div>
      </div>

      {/* AVATAR SELECTION MODAL */}
      <Modal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} title="Choose Your Avatar" maxWidth="md">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Pick your favorite learning buddy character:</p>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(AVATAR_MAP).map((key) => {
              const isSelected = avatarName === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setAvatarName(key);
                    updateProfileState({ avatarName: key });
                    setIsAvatarModalOpen(false);
                    toast.success('Avatar Updated!', `You selected ${key}`);
                  }}
                  className={`p-4 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${
                    isSelected
                      ? 'border-[#006EFF] bg-blue-50/60 shadow-md scale-102'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <img src={AVATAR_MAP[key]} alt={key} className="w-20 h-20 object-contain rounded-2xl" />
                  <span className="text-xs font-extrabold text-slate-900">{key}</span>
                  {isSelected && (
                    <span className="text-[10px] text-[#006EFF] font-black flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* LOGOUT MODAL */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
          navigate('/');
        }}
        title="Sign Out"
        message="Are you sure you want to sign out of your Coaching Buddy student account?"
        confirmText="Sign Out"
        variant="danger"
      />

      {/* DELETE ACCOUNT MODAL */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Student Account"
        message="Are you sure you want to permanently delete your account? All your admission bookings, saved coaching centers, and profile records will be permanently removed."
        confirmText="Delete Account"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default StudentProfilePage;
