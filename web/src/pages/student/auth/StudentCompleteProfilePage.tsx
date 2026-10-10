import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, ArrowRight, Sparkles, Building, Compass } from 'lucide-react';
import { studentService } from '../../../services/studentApi';
import { useStudentAuth } from '../../../context/StudentAuthContext';
import { useToast } from '../../../components/common/Toast';
import { AVATAR_MAP } from '../../../lib/avatarHelper';

export const StudentCompleteProfilePage: React.FC = () => {
  const { student, login, updateProfileState } = useStudentAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState(student?.name || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [gender, setGender] = useState<'male' | 'female' | null>(student?.gender as any || null);
  const [address, setAddress] = useState(student?.address || '');
  const [pincode, setPincode] = useState(student?.pincode || '');
  const [area, setArea] = useState(student?.area || '');
  const [city, setCity] = useState(student?.city || 'Pune');
  const [state, setState] = useState(student?.state || 'Maharashtra');
  const [landmark, setLandmark] = useState(student?.landmark || '');
  const [avatarName, setAvatarName] = useState<string>(student?.avatarName || 'StudyBuddy');
  const [isLoading, setIsLoading] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  // Auto-fetch Area, City, State from 6-digit Indian Pincode
  useEffect(() => {
    if (pincode.trim().length === 6) {
      const fetchPincode = async () => {
        setIsPincodeLoading(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pincode.trim()}`);
          const data = await res.json();
          if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            if (po.District) setCity(po.District);
            if (po.State) setState(po.State);
            if (!area && po.Name) setArea(po.Name);
            toast.info('Location Detected', `${po.District}, ${po.State}`);
          }
        } catch (e) {
          // ignore
        } finally {
          setIsPincodeLoading(false);
        }
      };
      fetchPincode();
    }
  }, [pincode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Name Required', 'Please enter your full name');
      return;
    }

    setIsLoading(true);
    try {
      const email = sessionStorage.getItem('CB_TEMP_STUDENT_EMAIL') || student?.email || '';
      const signUpData = {
        email,
        name: name.trim(),
        phone: phone.trim(),
        gender: gender || undefined,
        address: address.trim() || undefined,
        pincode: pincode.trim() || undefined,
        area: area.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        landmark: landmark.trim() || undefined,
        avatarName,
      };

      const res = await studentService.completeProfile(signUpData);
      if (res?.data?.user) {
        login(res.data.user, res.data.token);
      } else {
        updateProfileState(signUpData);
      }

      const returnUrl = sessionStorage.getItem('CB_STUDENT_RETURN_URL') || '/';
      toast.success('Registration Complete! 🎉', 'Welcome to CoachingBuddy!');
      navigate(returnUrl);
    } catch (e: any) {
      toast.error('Error', e.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl sm:rounded-4xl border border-slate-200/90 p-6 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 p-2 flex items-center justify-center mx-auto shadow-md">
            <img src="/student-logo.png" alt="Student App Logo" className="w-full h-full object-contain" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0d9488] text-xs font-bold border border-teal-200/60 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Your Profile</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to CoachingBuddy</h1>
          <p className="text-xs text-slate-500">Pick your avatar character and tell us about your location.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block text-center">Choose Learning Avatar</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Object.keys(AVATAR_MAP).slice(0, 6).map((key) => {
                const isSelected = avatarName === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAvatarName(key)}
                    className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0d9488] bg-teal-50/60 shadow-xs scale-105'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img src={AVATAR_MAP[key]} alt={key} className="w-10 h-10 object-contain rounded-xl" />
                    <span className="text-[9px] font-bold text-slate-800 line-clamp-1">{key}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kunal Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mobile / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  maxLength={10}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30"
                />
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Gender</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  gender === 'male'
                    ? 'border-[#0d9488] bg-teal-50 text-[#0d9488]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                👨 Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  gender === 'female'
                    ? 'border-[#0d9488] bg-teal-50 text-[#0d9488]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                👩 Female
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Address / Society</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat / Building, Street"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Landmark</label>
              <div className="relative">
                <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Metro / School"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Pincode {isPincodeLoading && <span className="text-[10px] text-teal-600 animate-pulse">...</span>}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="6-digit"
                  maxLength={6}
                  className="w-full pl-8 pr-2 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Area</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Kothrud"
                className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl gradient-teal text-white text-xs sm:text-sm font-bold shadow-teal hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer active:scale-95"
          >
            <span>{isLoading ? 'Saving Profile...' : 'Complete & Start Exploring'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentCompleteProfilePage;
