import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Phone,
  MessageCircle,
  Mail,
  User,
  GraduationCap,
  Calendar,
  Check,
  X,
} from 'lucide-react';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Badge from '../../components/common/Badge';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../components/common/Toast';
import { Booking, BookingStatus } from '../../types';

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk_101',
    orderId: 'ORD-98214',
    studentName: 'Aarav Sharma',
    studentPhone: '9812345678',
    studentEmail: 'aarav.sharma@gmail.com',
    courseName: 'IIT-JEE (Main + Advanced) 2-Year Comprehensive Program',
    coursePrice: '90000',
    bookingDate: '2026-09-01 14:30',
    status: 'initiated',
    notes: 'Interested in offline classroom batch starting this Monday. Father would like to visit the campus.',
  },
  {
    id: 'bk_102',
    orderId: 'ORD-98215',
    studentName: 'Ananya Verma',
    studentPhone: '9876501234',
    studentEmail: 'ananya.v@outlook.com',
    courseName: 'NEET-UG Medical Masterclass (Target 2027)',
    coursePrice: '88000',
    bookingDate: '2026-09-01 11:15',
    status: 'initiated',
    notes: 'Looking for morning batch timing (8 AM to 12 PM) with hostel accommodation guidance.',
  },
  {
    id: 'bk_103',
    orderId: 'ORD-98189',
    studentName: 'Rohan Deshmukh',
    studentPhone: '9123456780',
    studentEmail: 'rohan.d@gmail.com',
    courseName: 'Class 9th & 10th Olympiad & Foundation Batch',
    coursePrice: '38250',
    bookingDate: '2026-08-30 16:45',
    status: 'confirmed',
    notes: 'Seat confirmed. Registration deposit paid at counter.',
  },
  {
    id: 'bk_104',
    orderId: 'ORD-98150',
    studentName: 'Priya Sundaram',
    studentPhone: '9988776655',
    studentEmail: 'priya.s@yahoo.com',
    courseName: 'Crash Course: JEE Main 60-Day Sprint',
    coursePrice: '15000',
    bookingDate: '2026-08-28 10:00',
    status: 'confirmed',
    notes: 'Student attending online live classes.',
  },
  {
    id: 'bk_105',
    orderId: 'ORD-98099',
    studentName: 'Vikram Malhotra',
    studentPhone: '9765432109',
    studentEmail: 'vikram.m@gmail.com',
    courseName: 'IIT-JEE (Main + Advanced) 2-Year Comprehensive Program',
    coursePrice: '90000',
    bookingDate: '2026-08-25 15:20',
    status: 'rejected',
    notes: 'Seats full in desired evening batch schedule.',
  },
  {
    id: 'bk_106',
    orderId: 'ORD-98012',
    studentName: 'Sneha Patel',
    studentPhone: '9845123456',
    studentEmail: 'sneha.p@gmail.com',
    courseName: 'NEET-UG Medical Masterclass (Target 2027)',
    coursePrice: '88000',
    bookingDate: '2026-08-20 18:10',
    status: 'cancelled',
    notes: 'Student relocated to another city.',
  },
];

type StatusFilter = 'all' | BookingStatus;

export const BookingsPage: React.FC = () => {
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Action Confirmation Modals
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    bookingId: string;
    type: 'confirmed' | 'rejected';
    studentName: string;
  }>({
    isOpen: false,
    bookingId: '',
    type: 'confirmed',
    studentName: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Status metrics counts
  const counts = useMemo(() => {
    return {
      all: bookings.length,
      initiated: bookings.filter((b) => b.status === 'initiated').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      rejected: bookings.filter((b) => b.status === 'rejected').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };
  }, [bookings]);

  const tabs: { id: StatusFilter; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Requests', count: counts.all, icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'initiated', label: 'Pending', count: counts.initiated, icon: <Clock className="w-4 h-4 text-amber-500" /> },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
    { id: 'rejected', label: 'Rejected', count: counts.rejected, icon: <XCircle className="w-4 h-4 text-red-500" /> },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled, icon: <Ban className="w-4 h-4 text-slate-400" /> },
  ];

  const handleUpdateStatus = () => {
    if (!confirmAction.bookingId) return;

    setIsProcessing(true);

    setTimeout(() => {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === confirmAction.bookingId
            ? { ...b, status: confirmAction.type }
            : b
        )
      );

      setIsProcessing(false);
      const isConfirmed = confirmAction.type === 'confirmed';

      if (isConfirmed) {
        toast.success('Admission Confirmed', `Seat confirmed for ${confirmAction.studentName}`);
      } else {
        toast.error('Booking Rejected', `Inquiry rejected for ${confirmAction.studentName}`);
      }

      setConfirmAction({ isOpen: false, bookingId: '', type: 'confirmed', studentName: '' });
    }, 400);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'initiated':
        return <Badge variant="warning" dot>Pending Review</Badge>;
      case 'confirmed':
        return <Badge variant="success" dot>Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="danger" dot>Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="neutral" dot>Cancelled</Badge>;
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesTab = activeTab === 'all' || b.status === activeTab;
      const matchesSearch =
        b.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.studentPhone.includes(searchQuery) ||
        b.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.orderId && b.orderId.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <Header
        title="Bookings & Admissions"
        subtitle="Manage student seat reservations, admission confirmations, and direct inquiries"
        rightAction={
          counts.initiated > 0 ? (
            <Badge variant="warning" size="md" dot>
              {counts.initiated} Action Required
            </Badge>
          ) : undefined
        }
      />

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Inquiries</span>
            <CalendarCheck className="w-4 h-4 text-[#0d9488]" />
          </div>
          <p className="text-2xl font-black text-[#1E293B] mt-1">{counts.all}</p>
        </Card>

        <Card className="p-4 bg-white border border-amber-200/80 shadow-card bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1">{counts.initiated}</p>
        </Card>

        <Card className="p-4 bg-white border border-emerald-200/80 shadow-card bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{counts.confirmed}</p>
        </Card>

        <Card className="p-4 bg-white border border-red-200/80 shadow-card bg-red-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-700 mt-1">{counts.rejected}</p>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0d9488] text-white shadow-teal'
                  : 'bg-white text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B] border border-[#E2E8F0]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#64748B]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-card">
          <InputField
            placeholder="Search by student name, phone number, order UID or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-[#94A3B8]" />}
          />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id}
              className="p-5 sm:p-6 border border-[#E2E8F0] hover:border-[#0d9488]/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Left: Student & Course Details */}
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Top Line: Order ID, Date, Status */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold text-[#0d9488] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                      {booking.orderId || '#BK-' + booking.id}
                    </span>
                    <span className="text-xs text-[#64748B] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{booking.bookingDate}</span>
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* Student Name & Course */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1E293B] flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0d9488]" />
                      <span>{booking.studentName}</span>
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-[#64748B] flex items-center gap-1.5 mt-1">
                      <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{booking.courseName}</span>
                    </p>
                  </div>

                  {/* Notes / Special Message */}
                  {booking.notes && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-[#64748B] leading-relaxed">
                      <span className="font-semibold text-[#1E293B]">Student Note: </span>
                      {booking.notes}
                    </div>
                  )}

                  {/* Fee & Contact Info Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-1">
                    <div className="flex items-center gap-1 font-bold text-sm text-[#1E293B]">
                      <span>Fee:</span>
                      <span className="text-[#0d9488]">₹{Number(booking.coursePrice).toLocaleString('en-IN')}</span>
                    </div>

                    <a
                      href={`tel:+91${booking.studentPhone}`}
                      className="inline-flex items-center gap-1 text-[#0d9488] font-semibold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>+91 {booking.studentPhone}</span>
                    </a>

                    {booking.studentEmail && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{booking.studentEmail}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap lg:flex-col items-center justify-end gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  {/* Direct Contact Buttons */}
                  <div className="flex items-center gap-2 w-full lg:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Phone className="w-3.5 h-3.5 text-emerald-600" />}
                      onClick={() => window.open(`tel:+91${booking.studentPhone}`)}
                      className="flex-1 lg:flex-none"
                    >
                      Call Student
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />}
                      onClick={() =>
                        window.open(
                          `https://wa.me/91${booking.studentPhone}?text=Hello%20${encodeURIComponent(
                            booking.studentName
                          )},%20thank%20you%20for%20your%20inquiry%20at%20our%20institute%20regarding%20${encodeURIComponent(
                            booking.courseName
                          )}.`
                        )
                      }
                      className="flex-1 lg:flex-none"
                    >
                      WhatsApp
                    </Button>
                  </div>

                  {/* Accept / Reject Buttons for Pending Inquiries */}
                  {booking.status === 'initiated' && (
                    <div className="flex items-center gap-2 w-full lg:w-auto mt-1">
                      <Button
                        variant="success"
                        size="sm"
                        leftIcon={<Check className="w-4 h-4" />}
                        onClick={() =>
                          setConfirmAction({
                            isOpen: true,
                            bookingId: booking.id,
                            type: 'confirmed',
                            studentName: booking.studentName,
                          })
                        }
                        className="flex-1 lg:flex-none"
                      >
                        Confirm Admission
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<X className="w-4 h-4" />}
                        onClick={() =>
                          setConfirmAction({
                            isOpen: true,
                            bookingId: booking.id,
                            type: 'rejected',
                            studentName: booking.studentName,
                          })
                        }
                        className="flex-1 lg:flex-none"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CalendarCheck className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1E293B]">No Bookings Found</h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto mt-1">
            {searchQuery
              ? 'No admission requests match your search criteria.'
              : `There are currently no ${activeTab !== 'all' ? activeTab : ''} booking inquiries.`}
          </p>
        </Card>
      )}

      {/* Confirmation Modal for Accept / Reject */}
      <ConfirmationModal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction({ isOpen: false, bookingId: '', type: 'confirmed', studentName: '' })}
        onConfirm={handleUpdateStatus}
        title={confirmAction.type === 'confirmed' ? 'Confirm Student Admission?' : 'Reject Admission Inquiry?'}
        message={
          confirmAction.type === 'confirmed'
            ? `Are you sure you want to confirm the seat reservation for ${confirmAction.studentName}? The student will be notified immediately.`
            : `Are you sure you want to decline this inquiry from ${confirmAction.studentName}?`
        }
        confirmText={confirmAction.type === 'confirmed' ? 'Confirm Admission' : 'Reject Inquiry'}
        variant={confirmAction.type === 'confirmed' ? 'success' : 'danger'}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default BookingsPage;
