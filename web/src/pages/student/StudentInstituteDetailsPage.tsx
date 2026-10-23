import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Star,
  Heart,
  Phone,
  MessageCircle,
  Share2,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  X,
  GraduationCap,
  Image as ImageIcon,
  Award,
  BookOpen,
} from 'lucide-react';
import { studentService, getImageURI } from '../../services/studentApi';
import { StudentInstitute, StudentCourse, StudentComment } from '../../types/student';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useToast } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import SEO from '../../components/common/SEO';
import { absoluteUrl, buildCityPath, buildInstitutePath, extractInstituteIdFromSlug } from '../../lib/seoUrls';
import { instituteSeoKey, normalizeCanonicalUrl } from '../../lib/seoAdmin';
import { useSeoOverride } from '../../hooks/useSeoOverride';
import { buildAutoInstituteSeo, instituteImageAlt } from '../../lib/autoSeo';

type DetailTab = 'Description' | 'Courses' | 'Gallery' | 'Review';

export const StudentInstituteDetailsPage: React.FC = () => {
  const { id, instituteSlug } = useParams<{ id?: string; instituteSlug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const resolvedInstituteId = id || extractInstituteIdFromSlug(instituteSlug);
  const toast = useToast();
  const { student, isAuthenticated, isInstituteSaved, toggleSaveInstitute } = useStudentAuth();

  const [institute, setInstitute] = useState<StudentInstitute | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('Description');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseCategory, setSelectedCourseCategory] = useState<string>('All');

  // Modals
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCourseForBooking, setSelectedCourseForBooking] = useState<StudentCourse | null>(null);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState(student?.name || '');
  const [inquiryPhone, setInquiryPhone] = useState(student?.phone || '');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);

  // Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(9);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  const isSaved = institute ? isInstituteSaved(institute.id) : false;
  const seoOverride = useSeoOverride(institute ? instituteSeoKey(institute.id) : '');

  useEffect(() => {
    if (resolvedInstituteId) {
      loadInstituteDetails(resolvedInstituteId);
    }
  }, [resolvedInstituteId]);

  const loadInstituteDetails = async (instituteId: string) => {
    setIsLoading(true);
    try {
      const data = await studentService.getInstitute(instituteId);
      setInstitute(data);
    } catch (e) {
      toast.error('Error', 'Failed to load institute details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!institute) return;

    const canonicalPath = buildInstitutePath(institute);
    if (location.pathname !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [institute, location.pathname, navigate]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: institute?.name,
          text: `Check out ${institute?.name} on Coaching Buddy!`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', 'Institute link copied to your clipboard!');
    }
  };

  const handleToggleSave = () => {
    if (!institute) return;
    if (!isAuthenticated) {
      toast.info('Login Required', 'Please sign in to save coaching centers to your favorites');
      navigate(`/student/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const nowSaved = toggleSaveInstitute(institute);
    if (nowSaved) {
      toast.success('Saved', `${institute.name} saved to your favorites`);
    } else {
      toast.info('Removed', `${institute.name} removed from your favorites`);
    }
  };

  const handleCallCenter = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.info('Login Required', 'Please sign in to contact the institute call center');
      navigate(`/student/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.info('Login Required', 'Please sign in to message the coaching center on WhatsApp');
      navigate(`/student/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  };

  const handleOpenInquiry = () => {
    if (!isAuthenticated) {
      toast.info('Login Required', 'Please sign in to send admission inquiries');
      navigate(`/student/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setIsInquiryModalOpen(true);
  };

  const handleOpenBooking = (course: StudentCourse) => {
    if (!isAuthenticated) {
      toast.info('Login Required', 'Please sign in to book your course admission');
      navigate(`/student/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setSelectedCourseForBooking(course);
    setIsBookingModalOpen(true);
  };

  const handleOpenReview = () => {
    if (!isAuthenticated) {
      toast.info('Login Required', 'Please sign in to rate and review this coaching institute');
      navigate(`/student/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setIsReviewModalOpen(true);
  };

  // Inquiry Submission
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;
    if (!isAuthenticated) {
      toast.info('Login Required', 'Please sign in to submit inquiries');
      navigate(`/student/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!inquiryName.trim() || !inquiryPhone.trim() || !inquiryMessage.trim()) {
      toast.warning('Required Fields', 'Please complete name, phone, and inquiry message.');
      return;
    }

    setIsInquirySubmitting(true);
    try {
      await studentService.addEnquiry({
        storeId: institute.id,
        userId: student?.id || 'guest_user',
        name: inquiryName,
        phone: inquiryPhone,
        message: inquiryMessage,
      });
      toast.success('Inquiry Sent!', `Your message has been sent directly to ${institute.name}.`);
      setIsInquiryModalOpen(false);
      setInquiryMessage('');
    } catch (e) {
      toast.error('Error', 'Failed to send inquiry. Please try again.');
    } finally {
      setIsInquirySubmitting(false);
    }
  };

  // Admission Booking Submission
  const handleConfirmBooking = async () => {
    if (!institute || !selectedCourseForBooking) return;

    if (!isAuthenticated) {
      toast.info('Login Required', 'Please sign in or complete profile to confirm booking');
      navigate(`/student/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsBookingSubmitting(true);
    try {
      const res = await studentService.placeOrder(selectedCourseForBooking.id);

      // Save order to local list for immediate display in My Bookings
      const newOrder = {
        id: res.data?.orderId || 'ord_' + Date.now(),
        status: 'confirmed',
        createdAt: 'Just now',
        product: {
          name: selectedCourseForBooking.name,
          price: selectedCourseForBooking.price,
          sellingPrice: selectedCourseForBooking.sellingPrice,
          discount: selectedCourseForBooking.discount,
          images: selectedCourseForBooking.images,
        },
        store: {
          name: institute.name,
          address: institute.address,
          comments: institute.comments?.map((c) => ({ id: c.id, rating: c.rating })),
        },
      };

      const existingOrders = JSON.parse(localStorage.getItem('COACHING_BUDDY_STUDENT_ORDERS') || '[]');
      localStorage.setItem('COACHING_BUDDY_STUDENT_ORDERS', JSON.stringify([newOrder, ...existingOrders]));

      setIsBookingModalOpen(false);
      toast.success('Admission Booked! 🎉', `Your admission seat has been reserved at ${institute.name}.`);
      navigate('/student/bookings');
    } catch (e) {
      toast.error('Booking Error', 'Could not complete booking. Please try again.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // Review Submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;
    if (!reviewComment.trim()) {
      toast.warning('Review Required', 'Please provide a comment for your review.');
      return;
    }

    setIsReviewSubmitting(true);
    try {
      const newCommentData: StudentComment = {
        id: 'c_' + Date.now(),
        rating: reviewRating,
        comment: reviewComment,
        createdAt: 'Just now',
        userName: student?.name || 'Verified Student',
        userId: student?.id || 'u_guest',
      };

      await studentService.addComment({
        collegeId: institute.id,
        rating: reviewRating,
        comment: reviewComment,
      });

      setInstitute((prev) =>
        prev
          ? {
              ...prev,
              comments: [newCommentData, ...(prev.comments || [])],
            }
          : null
      );

      toast.success('Review Posted!', 'Thank you for sharing your feedback.');
      setIsReviewModalOpen(false);
      setReviewComment('');
    } catch (e) {
      toast.error('Error', 'Failed to submit review');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  if (isLoading || !institute) {
    return (
      <div className="py-24 text-center space-y-4 max-w-xl mx-auto px-4">
        <div className="w-12 h-12 border-4 border-[#006EFF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600">Loading institute profile & courses...</p>
      </div>
    );
  }

  const actualPhoneContact = institute.details?.find((d) => d.type === 'phone')?.value || '';
  const phoneContact = actualPhoneContact || '9876543210';
  const whatsappContact = institute.details?.find((d) => d.type === 'whatsapp')?.value || phoneContact;

  const ratings = institute.comments?.map((c) => c.rating) || [];
  const averageRating =
    ratings.length > 0 ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1) : '9.2';

  const courseCategories = Array.from(new Set(institute.courses?.map((c) => c.category).filter(Boolean) || []));

  const filteredCourses =
    selectedCourseCategory === 'All'
      ? institute.courses || []
      : institute.courses?.filter((c) => c.category === selectedCourseCategory) || [];

  // Every institute—including new user-created listings—gets SEO defaults.
  const automaticSeo = buildAutoInstituteSeo(institute);
  const finalSeoTitle = seoOverride?.title || automaticSeo.title;
  const finalSeoDescription = seoOverride?.description || automaticSeo.description;
  const finalCanonicalUrl = normalizeCanonicalUrl(seoOverride?.canonical, automaticSeo.canonicalPath);
  const finalH1 = seoOverride?.h1 || automaticSeo.h1;
  const finalAboutContent = seoOverride?.intro || automaticSeo.intro;
  const faqSchema = seoOverride?.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: seoOverride.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : undefined;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      <SEO
        title={finalSeoTitle}
        description={finalSeoDescription}
        image={getImageURI(institute.images.cover?.[0] || institute.images.logo?.[0])}
        imageAlt={institute.images.cover?.[0] ? instituteImageAlt(institute, 'cover') : instituteImageAlt(institute, 'logo')}
        url={finalCanonicalUrl}
        robots={seoOverride?.index === false ? 'noindex, follow' : undefined}
        type="profile"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: institute.name,
            url: absoluteUrl(buildInstitutePath(institute)),
            description: institute.shortDescription || institute.longDescription,
            image: getImageURI(institute.images.cover?.[0] || institute.images.logo?.[0]),
            telephone: actualPhoneContact || undefined,
            address: {
              '@type': 'PostalAddress',
              streetAddress: [institute.address.area, institute.address.nearBy].filter(Boolean).join(', '),
              addressLocality: institute.address.city,
              addressRegion: institute.address.state,
              postalCode: institute.address.pincode,
              addressCountry: 'IN',
            },
            aggregateRating:
              ratings.length > 0
                ? {
                    '@type': 'AggregateRating',
                    ratingValue: averageRating,
                    bestRating: '10',
                    ratingCount: ratings.length,
                  }
                : undefined,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://coachingbuddy.co.in/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: institute.address.city || 'Coaching Institutes',
                item: institute.address.city
                  ? absoluteUrl(buildCityPath(institute.address.city))
                  : 'https://coachingbuddy.co.in/explore',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: institute.name,
                item: absoluteUrl(buildInstitutePath(institute)),
              },
            ],
          },
          ...(faqSchema ? [faqSchema] : []),
        ]}
      />

      {/* 1. Header Banner & Quick Action Cards */}
      <div className="bg-white rounded-3xl sm:rounded-4xl border border-slate-200/90 overflow-hidden shadow-sm">
        {/* Cover Hero */}
        <div className="relative h-44 sm:h-72 lg:h-80 bg-slate-900 overflow-hidden">
          <img
            src={getImageURI(institute.images.cover?.[0] || institute.images.banner?.[0])}
            alt={instituteImageAlt(institute, 'cover')}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

          {/* Top Actions: Back, Share, Save */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-10">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/70 text-white text-xs font-bold backdrop-blur-md transition-colors"
            >
              ← Back
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95"
                title="Share Institute"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                className={`p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 ${
                  isSaved ? 'bg-red-500 text-white shadow-md' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
                title={isSaved ? 'Remove from Saved' : 'Save Institute'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Desktop Overlapping Info Header (Hidden on small screens to prevent layout break) */}
          <div className="hidden sm:flex absolute bottom-6 left-6 right-6 sm:items-end justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-xl border border-white shrink-0">
                <img
                  src={getImageURI(institute.images.logo?.[0])}
                  alt={instituteImageAlt(institute, 'logo')}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    <CheckCircle className="w-3 h-3" />
                    Verified Coaching
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-md">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{averageRating}/10</span>
                    <span className="text-[10px] text-slate-300">({ratings.length} reviews)</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">{finalH1}</h1>

                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>
                    {institute.address.area}, {institute.address.city}, {institute.address.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons Desktop */}
            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={`tel:+91${phoneContact}`}
                onClick={handleCallCenter}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Center</span>
              </a>

              <a
                href={`https://wa.me/91${whatsappContact}?text=${encodeURIComponent(
                  `Hi, I saw ${institute.name} on Coaching Buddy and would like to inquire about admissions.`
                )}`}
                onClick={handleWhatsApp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleOpenInquiry}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl gradient-teal text-white font-bold text-xs shadow-teal transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Inquiry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dedicated Info & Quick Actions Header */}
        <div className="sm:hidden p-4 space-y-3.5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md border border-slate-200 shrink-0 -mt-10 z-10">
              <img
                src={getImageURI(institute.images.logo?.[0])}
                alt={instituteImageAlt(institute, 'logo')}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Verified
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{averageRating}/10</span>
                  <span className="text-slate-400">({ratings.length})</span>
                </div>
              </div>
              <h1 className="text-lg font-black text-slate-900 leading-snug">{finalH1}</h1>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">
                  {institute.address.area}, {institute.address.city}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Full Touch Action Buttons on Mobile */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <a
              href={`tel:+91${phoneContact}`}
              onClick={handleCallCenter}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors text-center"
            >
              <Phone className="w-3.5 h-3.5 text-slate-700" />
              <span>Call</span>
            </a>

            <a
              href={`https://wa.me/91${whatsappContact}?text=${encodeURIComponent(
                `Hi, I saw ${institute.name} on Coaching Buddy and would like to inquire about admissions.`
              )}`}
              onClick={handleWhatsApp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors text-center"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleOpenInquiry}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl gradient-teal text-white font-bold text-xs shadow-teal transition-all text-center"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Inquiry</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 px-3 sm:px-6 overflow-x-auto no-scrollbar">
          {(['Description', 'Courses', 'Gallery', 'Review'] as DetailTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-extrabold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                activeTab === tab
                  ? 'border-[#0d9488] text-[#0d9488]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'Description' && <GraduationCap className="w-4 h-4" />}
              {tab === 'Courses' && <BookOpen className="w-4 h-4" />}
              {tab === 'Gallery' && <ImageIcon className="w-4 h-4" />}
              {tab === 'Review' && <Star className="w-4 h-4" />}
              <span>{tab}</span>
              {tab === 'Courses' && institute.courses?.length ? (
                <span className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-teal-50 text-[#0d9488] font-black">
                  {institute.courses.length}
                </span>
              ) : null}
              {tab === 'Review' && (
                <span className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-black">
                  {ratings.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Tab Content Areas */}

      {/* TAB 1: DESCRIPTION / OVERVIEW */}
      {activeTab === 'Description' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900">About {institute.name}</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {finalAboutContent}
              </p>
            </div>

            {/* Highlights Matrix */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Institute Key Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#006EFF] shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Experienced Mentors</span>
                    <span className="text-slate-500 text-[11px]">Top faculties with 10+ years track record</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Structured Mock Drills</span>
                    <span className="text-slate-500 text-[11px]">National level test series & performance analytics</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Personalized Doubt Clinics</span>
                    <span className="text-slate-500 text-[11px]">Daily 1-on-1 problem-solving sessions</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Small Batch Strength</span>
                    <span className="text-slate-500 text-[11px]">Focus on individual student progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Location & Contact */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Address & Contact</h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">{institute.address.area}</span>
                    <span>
                      {institute.address.city}, {institute.address.state} - {institute.address.pincode}
                    </span>
                    {institute.address.nearBy && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Landmark: {institute.address.nearBy}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`tel:+91${phoneContact}`}
                    onClick={handleCallCenter}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Institute Center</span>
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleOpenInquiry}
                  className="w-full py-3 rounded-2xl gradient-teal text-white text-xs font-extrabold shadow-teal hover:opacity-95 transition-all"
                >
                  Send Admission Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('Courses')}
                  className="w-full py-3 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all"
                >
                  View Available Courses & Batches
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURSES & ADMISSIONS */}
      {activeTab === 'Courses' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          {courseCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setSelectedCourseCategory('All')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  selectedCourseCategory === 'All'
                    ? 'bg-[#0d9488] text-white shadow-teal'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Courses ({institute.courses?.length || 0})
              </button>
              {courseCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCourseCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                    selectedCourseCategory === cat
                      ? 'bg-[#0d9488] text-white shadow-teal'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
              <p className="font-extrabold text-slate-800">No courses listed under this category yet</p>
              <p className="text-xs text-slate-500">Contact the institute directly for custom course schedules.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCourses.map((course) => {
                const mrp = Number(course.price);
                const selling = Number(course.sellingPrice);
                const savings = mrp > selling ? mrp - selling : 0;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0d9488] text-[11px] font-bold border border-teal-200/60">
                          {course.category}
                        </span>
                        {savings > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                            Save ₹{savings.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900">{course.name}</h3>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{course.shortDescription}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {mrp > selling && (
                          <span className="text-xs text-slate-400 line-through mr-2 font-medium">
                            ₹{mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="text-lg font-black text-slate-900">₹{selling.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-slate-400 block">Total Admission Fee</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenBooking(course)}
                        className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white gradient-teal hover:opacity-95 shadow-teal transition-all active:scale-95"
                      >
                        Book Admission
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GALLERY LIGHTBOX */}
      {activeTab === 'Gallery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Campus & Classroom Infrastructure</h3>
            <span className="text-xs text-slate-500 font-medium">Click any photo to expand</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(institute.images.gallery || institute.images.banner || []).map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedLightboxImage(getImageURI(imgUrl))}
                className="h-44 sm:h-52 rounded-3xl overflow-hidden bg-slate-100 cursor-pointer group relative shadow-2xs hover:shadow-lg transition-all"
              >
                <img
                  src={getImageURI(imgUrl)}
                  alt={instituteImageAlt(institute, 'gallery', idx + 1)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REVIEWS & RATINGS */}
      {activeTab === 'Review' && (
        <div className="space-y-6">
          {/* Review Score Summary Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-20 h-20 rounded-3xl bg-amber-500 text-white flex flex-col items-center justify-center font-black shadow-lg">
                <span className="text-2xl sm:text-3xl leading-none">{averageRating}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 mt-1">out of 10</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900">Overall Student Satisfaction</h3>
                <p className="text-xs text-slate-500">Based on {ratings.length} student reviews and alumni ratings.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenReview}
              className="px-6 py-3 rounded-2xl gradient-teal text-white text-xs font-bold shadow-teal hover:opacity-95 transition-all shrink-0"
            >
              Write a Review
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {institute.comments && institute.comments.length > 0 ? (
              institute.comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#006EFF] font-extrabold flex items-center justify-center text-sm">
                        {comment.userName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{comment.userName}</h4>
                        <span className="text-[11px] text-slate-400">{comment.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-extrabold border border-amber-200/60">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{comment.rating}/10</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{comment.comment}</p>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
                <p className="font-bold text-slate-800">No reviews yet</p>
                <p className="text-xs text-slate-500">Be the first student to review this coaching academy!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. LIGHTBOX MODAL */}
      {selectedLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedLightboxImage(null)}
              className="absolute -top-12 right-0 text-white p-2 hover:text-slate-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedLightboxImage}
              alt={instituteImageAlt(institute, 'gallery')}
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* 4. ADMISSION BOOKING CONFIRMATION MODAL */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Confirm Admission Booking"
        maxWidth="md"
      >
        {selectedCourseForBooking && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-[#0d9488] uppercase tracking-wider">
                {selectedCourseForBooking.category}
              </span>
              <h4 className="font-extrabold text-base text-slate-900">{selectedCourseForBooking.name}</h4>
              <p className="text-xs text-slate-500">Institute: {institute.name}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Original Fee:</span>
                <span className="line-through">
                  ₹{Number(selectedCourseForBooking.price).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coaching Buddy Privilege Discount:</span>
                <span>
                  -₹
                  {(
                    Number(selectedCourseForBooking.price) - Number(selectedCourseForBooking.sellingPrice)
                  ).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Payable Admission Fee:</span>
                <span className="text-lg text-[#0d9488]">
                  ₹{Number(selectedCourseForBooking.sellingPrice).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-[11px] text-slate-600 leading-relaxed">
              ℹ️ Your admission seat request will be confirmed instantly and sent directly to the coaching director.
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isBookingSubmitting}
                className="px-6 py-2.5 rounded-xl gradient-teal text-white text-xs font-bold shadow-teal hover:opacity-95 disabled:opacity-50"
              >
                {isBookingSubmitting ? 'Confirming...' : 'Confirm & Reserve Seat'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. INQUIRY MODAL */}
      <Modal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        title={`Inquire at ${institute.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleInquirySubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Have questions regarding batch timings, scholarship tests, or faculty? Send an inquiry directly to the center.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Student Name</label>
            <input
              type="text"
              value={inquiryName}
              onChange={(e) => setInquiryName(e.target.value)}
              placeholder="e.g. Kunal Verma"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mobile / WhatsApp Number</label>
            <input
              type="tel"
              value={inquiryPhone}
              onChange={(e) => setInquiryPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Your Message / Questions</label>
            <textarea
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              rows={3}
              placeholder="I would like to know batch starting dates and fee structure for JEE 2026..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 font-medium resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInquiryModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInquirySubmitting}
              className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-brand hover:opacity-95 disabled:opacity-50"
            >
              {isInquirySubmitting ? 'Sending...' : 'Send Inquiry Message'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. WRITE A REVIEW MODAL */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Rate & Review Institute"
        maxWidth="md"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="space-y-2 text-center py-2">
            <span className="text-xs font-bold text-slate-500">Your Rating Score (1 to 10)</span>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setReviewRating(score)}
                  className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                    reviewRating === score
                      ? 'bg-amber-500 text-white scale-110 shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-600 mt-1">
              ★ Selected: {reviewRating} / 10
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Your Feedback / Review</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              placeholder="Describe your classroom experience, study material, faculty support..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006EFF]/30 font-medium resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReviewSubmitting}
              className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-brand hover:opacity-95 disabled:opacity-50"
            >
              {isReviewSubmitting ? 'Posting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>
      {seoOverride?.faqs?.length ? (
        <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {seoOverride.faqs.map((faq, index) => (
              <div key={`${faq.question}_${index}`} className="py-4">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{faq.question}</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

    </div>
  );
};

export default StudentInstituteDetailsPage;
