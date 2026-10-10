import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Image as ImageIcon,
  Building2,
  Tag,
  Phone,
  MessageCircle,
  Shield,
  FileText,
  LogOut,
  Trash2,
  ChevronRight,
  MapPin,
  TrendingUp,
  Share2,
  CalendarCheck,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Carousel, { CarouselSlide } from '../../components/common/Carousel';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const DashboardPage: React.FC = () => {
  const { store, logout, updateStoreStatusState } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [leads, setLeads] = useState({ phone: 0, whatsapp: 0, share: 0 });
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const isStoreOnline = store?.status === 1;

  useEffect(() => {
    fetchLeads();
  }, [store?.id]);

  const fetchLeads = async () => {
    if (!store?.id) return;
    setIsLeadsLoading(true);

    try {
      const res = await api.get(`/store/leads?store_id=${store.id}&type=whatsapp,share,phone`);
      if (res.data?.data) {
        const phoneLead = res.data.data.find((l: any) => l.type === 'phone')?.leads?.[0]?.total_leads || 0;
        const waLead = res.data.data.find((l: any) => l.type === 'whatsapp')?.leads?.[0]?.total_leads || 0;
        const shareLead = res.data.data.find((l: any) => l.type === 'share')?.leads?.[0]?.total_leads || 0;
        setLeads({ phone: phoneLead, whatsapp: waLead, share: shareLead });
      }
    } catch {
      setLeads({ phone: 0, whatsapp: 0, share: 0 });
    } finally {
      setIsLeadsLoading(false);
    }
  };

  const handleToggleStoreStatus = () => {
    setIsStatusUpdating(true);
    setTimeout(() => {
      const nextStatus = isStoreOnline ? 0 : 1;
      updateStoreStatusState(nextStatus);
      setIsStatusUpdating(false);
      setIsStatusModalOpen(false);
      toast.success(
        nextStatus === 1 ? 'Institute is now Online' : 'Institute is now Offline',
        `Your courses are now ${nextStatus === 1 ? 'live for student discovery' : 'hidden from searches'}`
      );
    }, 400);
  };

  const handleShareInstitute = () => {
    if (navigator.share) {
      navigator.share({
        title: store?.name || 'Coaching Buddy Institute',
        text: `Explore courses and admission details for ${store?.name}`,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast.success('Link Copied', 'Institute shareable link copied to clipboard');
    }
  };

  // Slides for Banner Carousel
  const bannerSlides: CarouselSlide[] = (store?.banner && store.banner.length > 0
    ? store.banner
    : [
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&auto=format&fit=crop&q=80',
      ]
  ).map((url, i) => ({
    id: `banner_${i}`,
    url,
    title: i === 0 ? store?.name || 'Admissions Open 2026' : 'Target Top Ranks with Expert Guidance',
    subtitle: i === 0 ? 'NEET & IIT-JEE Early Bird Batches Starting Soon' : 'Comprehensive Classroom Mock Test Series',
  }));

  const menuItems = [
    {
      title: 'Add / Update Courses',
      description: 'Manage active course catalog, fees, and discounts',
      icon: <GraduationCap className="w-5 h-5 text-[#0d9488]" />,
      action: () => navigate('/courses'),
      badge: '4 Active',
    },
    {
      title: 'Update Logo & Images',
      description: 'Upload promotional banners and campus gallery',
      icon: <ImageIcon className="w-5 h-5 text-indigo-500" />,
      action: () => navigate('/media'),
    },
    {
      title: 'Update Institution Info',
      description: 'Edit institute address, contact phone, and timings',
      icon: <Building2 className="w-5 h-5 text-emerald-600" />,
      action: () => navigate('/settings'),
    },
    {
      title: 'Add Offers & Discounts',
      description: 'Create promotional festival discount vouchers',
      icon: <Tag className="w-5 h-5 text-amber-500" />,
      action: () => navigate('/offers'),
    },
    {
      title: 'Call Partner Support',
      description: 'Speak with dedicated merchant relationship manager',
      icon: <Phone className="w-5 h-5 text-blue-500" />,
      action: () => window.open(`tel:+91${store?.contact?.phone || '9876543210'}`),
    },
    {
      title: 'WhatsApp Partner Desk',
      description: 'Instant chat support for listing assistance',
      icon: <MessageCircle className="w-5 h-5 text-emerald-500" />,
      action: () => window.open(`https://wa.me/91${store?.contact?.whatsapp || '9876543210'}`),
    },
    {
      title: 'Privacy Policy',
      description: 'Merchant data protection guidelines',
      icon: <Shield className="w-5 h-5 text-slate-500" />,
      action: () => setPrivacyModalOpen(true),
    },
    {
      title: 'Terms & Conditions',
      description: 'Partner platform service agreements',
      icon: <FileText className="w-5 h-5 text-slate-500" />,
      action: () => setTermsModalOpen(true),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Banner Carousel */}
      <Carousel slides={bannerSlides} autoScrollInterval={4500} />

      {/* Institution Info & Live Status Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm shrink-0 bg-white">
              <img
                src={store?.logo || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&auto=format&fit=crop&q=80'}
                alt={store?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight">
                  {store?.name || 'Apex IIT-JEE & Medical Academy'}
                </h1>
                <Badge variant={isStoreOnline ? 'success' : 'danger'} dot>
                  {isStoreOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-[#64748B] flex items-center gap-1.5 mt-1.5 line-clamp-1">
                <MapPin className="w-4 h-4 text-[#0d9488] shrink-0" />
                <span>
                  {store?.address
                    ? `${store.address.area}, ${store.address.city}, ${store.address.state} - ${store.address.pincode}`
                    : 'Koramangala 4th Block, Bengaluru, Karnataka - 560034'}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Status Toggle */}
          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Share2 className="w-4 h-4 text-[#0d9488]" />}
              onClick={handleShareInstitute}
            >
              Share Page
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Phone className="w-4 h-4 text-emerald-600" />}
              onClick={() => window.open(`tel:+91${store?.contact?.phone || '9876543210'}`)}
            >
              Call
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageCircle className="w-4 h-4 text-emerald-500" />}
              onClick={() => window.open(`https://wa.me/91${store?.contact?.whatsapp || '9876543210'}`)}
            >
              WhatsApp
            </Button>

            <button
              onClick={() => setIsStatusModalOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isStoreOnline
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isStoreOnline ? 'bg-emerald-600 animate-pulse' : 'bg-red-600'}`} />
              <span>Switch {isStoreOnline ? 'Offline' : 'Online'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Analytics Summary Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0d9488]" />
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">Student Inquiries & Analytics</h2>
          </div>
          <span className="text-xs text-[#64748B]">Last 30 Days</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Calls */}
          <Card className="flex items-center gap-4 bg-white border border-[#E2E8F0] shadow-card hover:shadow-card-hover transition-all">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Phone Inquiries</p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#1E293B] mt-0.5">
                {isLeadsLoading ? '...' : leads.phone}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <span>+12% this month</span>
              </p>
            </div>
          </Card>

          {/* WhatsApp Leads */}
          <Card className="flex items-center gap-4 bg-white border border-[#E2E8F0] shadow-card hover:shadow-card-hover transition-all">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-[#25D366] flex items-center justify-center shrink-0 shadow-inner">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">WhatsApp Chats</p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#1E293B] mt-0.5">
                {isLeadsLoading ? '...' : leads.whatsapp}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <span>+24% this month</span>
              </p>
            </div>
          </Card>

          {/* Shares Count */}
          <Card className="flex items-center gap-4 bg-white border border-[#E2E8F0] shadow-card hover:shadow-card-hover transition-all">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Profile Shares</p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#1E293B] mt-0.5">
                {isLeadsLoading ? '...' : leads.share}
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                <span>Direct student referrals</span>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Bookings Overview Banner Card */}
      <Card variant="gradient" className="border-teal-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0d9488] text-white flex items-center justify-center shadow-teal shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#1E293B]">My Admissions & Bookings</h3>
                <Badge variant="primary" size="sm">12 Active</Badge>
              </div>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                Review new seat reservations, student inquiries, and accept admission requests.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            rightIcon={<ArrowUpRight className="w-4 h-4" />}
            onClick={() => navigate('/bookings')}
          >
            View All Bookings
          </Button>
        </div>
      </Card>

      {/* Management Navigation Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#0d9488]" />
          <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">Management & Tools</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-card hover:shadow-card-hover hover:border-[#0d9488]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  {item.badge && (
                    <Badge variant="primary" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-sm text-[#1E293B] group-hover:text-[#0d9488] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{item.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#0d9488] pt-4 mt-4 border-t border-slate-100">
                <span>Manage</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Safety Actions */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#EF4444] hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Merchant Account</span>
        </button>
      </div>

      {/* Store Online / Offline Confirmation Modal */}
      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleToggleStoreStatus}
        title={isStoreOnline ? 'Turn Institute Offline?' : 'Make Institute Online?'}
        message={
          isStoreOnline
            ? 'When offline, your institute and courses will be temporarily hidden from student searches.'
            : 'When online, students can view your courses, submit inquiries, and book admissions.'
        }
        confirmText={isStoreOnline ? 'Turn Offline' : 'Go Live Online'}
        variant={isStoreOnline ? 'warning' : 'success'}
        isLoading={isStatusUpdating}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
          navigate('/login');
        }}
        title="Sign Out"
        message="Are you sure you want to log out of your Coaching Buddy account?"
        confirmText="Sign Out"
        variant="danger"
      />

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          toast.info(
            'Request Submitted',
            'Your account deletion request has been submitted and will be processed within 3-5 business days.'
          );
          logout();
          navigate('/login');
        }}
        title="Delete Merchant Account?"
        message="Are you sure you want to request account deletion? All listed courses, leads, and store history will be permanently deleted after 3-5 days."
        confirmText="Delete Account"
        variant="danger"
      />

      {/* Terms & Conditions Modal */}
      <Modal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="Terms & Conditions"
        maxWidth="lg"
      >
        <div className="space-y-3 text-xs sm:text-sm text-[#64748B] max-h-80 overflow-y-auto pr-2">
          <p className="font-semibold text-[#1E293B]">1. Merchant Partnership</p>
          <p>Institutes agree to provide authentic course details, fees, and batch schedules.</p>
          <p className="font-semibold text-[#1E293B]">2. Admission Fulfillment</p>
          <p>Bookings made by students must be honored at published discounted prices.</p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setTermsModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title="Privacy Policy"
        maxWidth="lg"
      >
        <div className="space-y-3 text-xs sm:text-sm text-[#64748B] max-h-80 overflow-y-auto pr-2">
          <p className="font-semibold text-[#1E293B]">Data Protection</p>
          <p>All partner data is securely encrypted in transit and at rest.</p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setPrivacyModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
