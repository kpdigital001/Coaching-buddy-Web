import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
} from 'lucide-react';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { ImageUploadBox, MultiImageUploadGrid } from '../../components/common/ImageUploadBox';
import Card from '../../components/common/Card';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { StoreType } from '../../types';
import api from '../../services/api';

export const OnboardPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { user, completeOnboarding, setVerifiedState } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    businessName: 'Apex IIT-JEE & Medical Academy',
    ownerName: user?.name || 'Dr. Rajesh Sharma',
    phone: user?.phone || '9876543210',
    whatsapp: '9876543210',

    // Step 2: Address
    area: 'Koramangala 4th Block, 80 Feet Road',
    landmark: 'Opposite Sony World Signal',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    country: 'India',

    // Step 3: Verification & Branding
    logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&auto=format&fit=crop&q=80',
    cover: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    certificate: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',

    // Step 4: Descriptions & Gallery
    shortDescription: 'Premier coaching institute for competitive engineering (IIT-JEE) and medical (NEET) entrance exams with high success rates.',
    longDescription: 'Apex Academy provides expert guidance, comprehensive mock test series, and structured learning for NEET, IIT-JEE, and Foundation courses with over 15 years of academic excellence.',
    banners: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    ],
    socialLinks: {
      website: 'https://apexacademy.com',
      instagram: 'https://instagram.com/apexacademy',
      facebook: 'https://facebook.com/apexacademy',
      linkedin: 'https://linkedin.com/company/apexacademy',
    },
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: <Building2 className="w-4 h-4" /> },
    { id: 2, title: 'Address', icon: <MapPin className="w-4 h-4" /> },
    { id: 3, title: 'Verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 4, title: 'Details & Media', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const err: { [key: string]: string } = {};

    if (stepNumber === 1) {
      if (!formData.businessName.trim()) err.businessName = 'Institute name is required';
      if (!formData.ownerName.trim()) err.ownerName = 'Director / Owner name is required';
      if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.trim())) {
        err.phone = 'Enter a valid 10-digit phone number';
      }
      if (!formData.whatsapp.trim() || !/^\d{10}$/.test(formData.whatsapp.trim())) {
        err.whatsapp = 'Enter a valid 10-digit WhatsApp number';
      }
    }

    if (stepNumber === 2) {
      if (!formData.area.trim()) err.area = 'Area / Street is required';
      if (!formData.landmark.trim()) err.landmark = 'Landmark is required';
      if (!formData.city.trim()) err.city = 'City is required';
      if (!formData.state.trim()) err.state = 'State is required';
      if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
        err.pincode = 'Enter a valid 6-digit postal pincode';
      }
    }

    if (stepNumber === 3) {
      if (!formData.logo) err.logo = 'Institute Logo is required';
      if (!formData.cover) err.cover = 'Cover image is required';
      if (!formData.certificate) err.certificate = 'Registration certificate is required for verification';
    }

    if (stepNumber === 4) {
      if (!formData.shortDescription.trim()) err.shortDescription = 'Short description is required';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      const storePayload: StoreType = {
        id: 'store_' + Date.now(),
        name: formData.businessName,
        status: 0, // Pending approval
        address: {
          area: formData.area,
          city: formData.city,
          state: formData.state,
          nearBy: formData.landmark,
          landmark: formData.landmark,
          pincode: formData.pincode,
          country: formData.country,
        },
        contact: {
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: user?.email,
        },
        banner: formData.banners,
        gallery: formData.gallery,
        logo: formData.logo,
        cover: formData.cover,
        certificate: formData.certificate,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
      };

      // API request with local fallback
      try {
        if (user?.id) {
          await api.post(`/user/vendor/${user.id}/stores`, {
            storeName: formData.businessName,
            shortDescription: formData.shortDescription,
            longDescription: formData.longDescription,
            address: {
              area: formData.area,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              landmark: formData.landmark,
            },
            name: formData.ownerName,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            logo: formData.logo,
            cover: formData.cover,
            certificate: formData.certificate,
            banners: formData.banners,
            gallery: formData.gallery,
          });
        }
      } catch (apiErr) {
        console.warn('API store creation fallback for dev preview:', apiErr);
      }

      completeOnboarding(storePayload);
      setVerifiedState(false);
      setIsSubmitting(false);

      toast.success('Registration Submitted!', 'Your institute application is now under review.');
      navigate('/success');
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error('Submission Failed', err.message || 'Please check your information and try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Top Stepper Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-brand p-6 sm:p-8 mb-8">
        <div className="text-center max-w-lg mx-auto mb-8">
          <span className="inline-block px-3 py-1 bg-teal-50 text-[#0d9488] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Step {currentStep} of 4
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Institute Registration
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Complete your institute profile to get listed on the Coaching Buddy student discovery portal.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="relative flex items-center justify-between max-w-2xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 w-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#0d9488] transition-all duration-300 z-0"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm ${
                    isCompleted
                      ? 'bg-[#10B981] text-white shadow-emerald-200'
                      : isCurrent
                      ? 'bg-[#0d9488] text-white ring-4 ring-[#0d9488]/20 shadow-teal'
                      : 'bg-white border border-[#CBD5E1] text-[#94A3B8]'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : step.icon}
                </button>
                <span
                  className={`text-[11px] sm:text-xs font-semibold mt-2 hidden sm:block ${
                    isCurrent ? 'text-[#0d9488]' : isCompleted ? 'text-[#1E293B]' : 'text-[#94A3B8]'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Form Content Container */}
      <Card className="shadow-brand-lg p-6 sm:p-10">
        {/* ================= STEP 1: Basic Information ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-[#E2E8F0] pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#1E293B]">1. Basic Information</h2>
              <p className="text-xs sm:text-sm text-[#64748B]">Provide your official institute name and primary contact details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <InputField
                  label="Institute / Business Name"
                  placeholder="e.g. Apex IIT-JEE Academy"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  error={errors.businessName}
                  required
                />
              </div>

              <InputField
                label="Director / Owner Full Name"
                placeholder="e.g. Dr. Rajesh Sharma"
                value={formData.ownerName}
                onChange={(e) => updateField('ownerName', e.target.value)}
                error={errors.ownerName}
                required
              />

              <InputField
                label="Primary Phone Number"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  updateField('phone', val);
                  if (sameAsPhone) updateField('whatsapp', val);
                }}
                error={errors.phone}
                required
              />

              <div className="sm:col-span-2">
                <InputField
                  label="WhatsApp Inquiries Number"
                  placeholder="10-digit WhatsApp number"
                  value={formData.whatsapp}
                  onChange={(e) => {
                    updateField('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10));
                    setSameAsPhone(false);
                  }}
                  error={errors.whatsapp}
                  required
                  helperText="Students will send admission messages directly to this number"
                />

                <label className="flex items-center gap-2 mt-2 text-xs text-[#64748B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsPhone}
                    onChange={(e) => {
                      setSameAsPhone(e.target.checked);
                      if (e.target.checked) updateField('whatsapp', formData.phone);
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-[#0d9488] focus:ring-[#0d9488]/30 cursor-pointer"
                  />
                  <span>Same as primary phone number</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: Address Details ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-[#E2E8F0] pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#1E293B]">2. Address & Location</h2>
              <p className="text-xs sm:text-sm text-[#64748B]">Help nearby students discover your institute center location.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <InputField
                  label="Area / Street / Building Address"
                  placeholder="e.g. 4th Block, 80 Feet Main Road"
                  value={formData.area}
                  onChange={(e) => updateField('area', e.target.value)}
                  error={errors.area}
                  required
                />
              </div>

              <InputField
                label="Landmark / Nearby Location"
                placeholder="e.g. Opposite Forum Mall"
                value={formData.landmark}
                onChange={(e) => updateField('landmark', e.target.value)}
                error={errors.landmark}
                required
              />

              <InputField
                label="City"
                placeholder="e.g. Bengaluru"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                error={errors.city}
                required
              />

              <InputField
                label="State"
                placeholder="e.g. Karnataka"
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
                error={errors.state}
                required
              />

              <InputField
                label="Postal Pincode"
                placeholder="6-digit pincode"
                value={formData.pincode}
                onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                error={errors.pincode}
                required
              />

              <InputField
                label="Country"
                value="India"
                disabled
              />
            </div>
          </div>
        )}

        {/* ================= STEP 3: Verification & Media ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-[#E2E8F0] pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#1E293B]">3. Verification & Branding</h2>
              <p className="text-xs sm:text-sm text-[#64748B]">Upload your institute logo, campus cover photo, and registration documents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageUploadBox
                label="Institute Logo"
                helperText="1:1 Square"
                value={formData.logo}
                onChange={(dataUrl) => updateField('logo', dataUrl)}
                onRemove={() => updateField('logo', '')}
                aspectRatio="square"
                error={errors.logo}
                required
              />

              <div className="md:col-span-2 space-y-6">
                <ImageUploadBox
                  label="Institute Cover Image"
                  helperText="16:9 Banner"
                  value={formData.cover}
                  onChange={(dataUrl) => updateField('cover', dataUrl)}
                  onRemove={() => updateField('cover', '')}
                  aspectRatio="video"
                  error={errors.cover}
                  required
                />
              </div>

              <div className="md:col-span-3">
                <ImageUploadBox
                  label="Registration Certificate / GST Document / Business License"
                  helperText="Required for instant verification and badge"
                  value={formData.certificate}
                  onChange={(dataUrl) => updateField('certificate', dataUrl)}
                  onRemove={() => updateField('certificate', '')}
                  aspectRatio="banner"
                  error={errors.certificate}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: Additional Details & Gallery ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-[#E2E8F0] pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#1E293B]">4. Additional Details & Gallery</h2>
              <p className="text-xs sm:text-sm text-[#64748B]">Add a detailed description, showcase gallery photos, and link social profiles.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#1E293B]">
                    Short Description <span className="text-[#EF4444]">*</span>
                  </label>
                  <span className="text-[11px] text-[#64748B]">
                    {formData.shortDescription.length}/150 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={150}
                  placeholder="A concise summary of your institute (e.g. Premier coaching for IIT-JEE/NEET since 2010)"
                  value={formData.shortDescription}
                  onChange={(e) => updateField('shortDescription', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]"
                />
                {errors.shortDescription && <p className="text-xs text-[#EF4444] font-medium">{errors.shortDescription}</p>}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#1E293B]">Comprehensive Description & Highlights</label>
                <textarea
                  rows={4}
                  placeholder="Share details regarding faculty qualifications, classroom environment, batch sizes, test series, and past achievements..."
                  value={formData.longDescription}
                  onChange={(e) => updateField('longDescription', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]"
                />
              </div>

              {/* Promotional Banners */}
              <div className="pt-2">
                <MultiImageUploadGrid
                  label="Promotional Banners (Displayed in Top Carousel)"
                  images={formData.banners}
                  onAdd={(img) => updateField('banners', [...formData.banners, img])}
                  onRemove={(idx) => updateField('banners', formData.banners.filter((_, i) => i !== idx))}
                  maxImages={4}
                />
              </div>

              {/* Campus Gallery */}
              <div className="pt-2">
                <MultiImageUploadGrid
                  label="Classroom & Campus Gallery Photos"
                  images={formData.gallery}
                  onAdd={(img) => updateField('gallery', [...formData.gallery, img])}
                  onRemove={(idx) => updateField('gallery', formData.gallery.filter((_, i) => i !== idx))}
                  maxImages={6}
                />
              </div>

              {/* Social Media Links */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Social Profiles & Website</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    placeholder="https://yourwebsite.com"
                    value={formData.socialLinks.website}
                    onChange={(e) =>
                      updateField('socialLinks', { ...formData.socialLinks, website: e.target.value })
                    }
                    icon={<Globe className="w-4 h-4 text-[#0d9488]" />}
                  />
                  <InputField
                    placeholder="Instagram handle / URL"
                    value={formData.socialLinks.instagram}
                    onChange={(e) =>
                      updateField('socialLinks', { ...formData.socialLinks, instagram: e.target.value })
                    }
                    icon={<Instagram className="w-4 h-4 text-pink-500" />}
                  />
                  <InputField
                    placeholder="Facebook page URL"
                    value={formData.socialLinks.facebook}
                    onChange={(e) =>
                      updateField('socialLinks', { ...formData.socialLinks, facebook: e.target.value })
                    }
                    icon={<Facebook className="w-4 h-4 text-blue-600" />}
                  />
                  <InputField
                    placeholder="LinkedIn organization URL"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) =>
                      updateField('socialLinks', { ...formData.socialLinks, linkedin: e.target.value })
                    }
                    icon={<Linkedin className="w-4 h-4 text-blue-700" />}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Actions */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#E2E8F0]">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous Step
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <Button
              type="button"
              variant="success"
              size="lg"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              rightIcon={<Check className="w-5 h-5" />}
            >
              Submit Application
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OnboardPage;
