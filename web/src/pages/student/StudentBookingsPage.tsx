import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, MapPin, XCircle, CheckCircle, Clock } from 'lucide-react';
import { studentService } from '../../services/studentApi';
import { StudentOrder } from '../../types/student';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useToast } from '../../components/common/Toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export const StudentBookingsPage: React.FC = () => {
  const { student } = useStudentAuth();
  const toast = useToast();

  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [student?.id]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await studentService.getUserOrders(student?.id || 'guest_user');
      setOrders(data);
    } catch (e) {
      toast.error('Error', 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    setIsCancelling(true);
    try {
      await studentService.cancelOrder(cancelOrderId);
      setOrders((prev) =>
        prev.map((ord) => (ord.id === cancelOrderId ? { ...ord, status: 'cancelled' } : ord))
      );
      toast.success('Cancelled', 'Your admission booking has been cancelled.');
      setIsCancelModalOpen(false);
      setCancelOrderId(null);
    } catch (e) {
      toast.error('Error', 'Could not cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <CalendarCheck className="w-7 h-7 text-[#0d9488]" />
          <span>My Admission Bookings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track course enrollment status, admission confirmations, and seat reservations.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading your bookings...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0d9488] flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800">No Admission Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't reserved admission in any coaching courses yet. Browse top institutes and reserve your seat.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl gradient-teal text-white text-xs font-bold shadow-teal hover:opacity-95 transition-all mt-2"
          >
            <span>Explore Coaching Centers</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => {
            const orderIdStr = String(order.id || idx);
            const statusStr = String(order.status || 'pending').toLowerCase();
            const isCancelled = statusStr === 'cancelled';
            const isConfirmed = statusStr === 'confirmed';
            const productName = order.product?.name || 'Course Admission';
            const storeName = order.store?.name || 'Coaching Institute';
            const city = order.store?.address?.city || 'Location';
            const price = Number(order.product?.sellingPrice || order.product?.price || 0);

            return (
              <div
                key={orderIdStr}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                    <img src="/student-logo.png" alt="Coaching Buddy" className="w-full h-full object-contain" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Booking ID: #{orderIdStr.slice(0, 10).toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isCancelled
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isConfirmed && <CheckCircle className="w-3 h-3" />}
                        {isCancelled && <XCircle className="w-3 h-3" />}
                        {!isConfirmed && !isCancelled && <Clock className="w-3 h-3" />}
                        <span>{statusStr.toUpperCase()}</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                      {productName}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{storeName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Payable Fee</span>
                    <span className="text-base sm:text-lg font-black text-slate-900">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => {
                        setCancelOrderId(orderIdStr);
                        setIsCancelModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Admission Booking?"
        message="Are you sure you want to cancel this admission reservation? Your seat at the coaching center will be released."
        confirmText="Yes, Cancel Booking"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
};

export default StudentBookingsPage;
