import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  Trash2,
  Gift,
  Clock,
} from 'lucide-react';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../components/common/Toast';

export interface OfferItem {
  id: string;
  offerName: string;
  discountPercentage: string;
  validTill: string;
  applicableCourses: string;
  isActive: boolean;
}

const INITIAL_OFFERS: OfferItem[] = [
  {
    id: 'offer_1',
    offerName: 'Early Bird JEE Main 2027 Scholarship',
    discountPercentage: '25',
    validTill: '2026-10-31',
    applicableCourses: 'IIT-JEE 2-Year Program',
    isActive: true,
  },
  {
    id: 'offer_2',
    offerName: 'Independence Day Special Medical Discount',
    discountPercentage: '15',
    validTill: '2026-09-15',
    applicableCourses: 'NEET-UG Masterclass',
    isActive: true,
  },
  {
    id: 'offer_3',
    offerName: 'Foundation Olympiad Fee Waiver',
    discountPercentage: '30',
    validTill: '2026-08-30',
    applicableCourses: 'Class 9-10 Foundation',
    isActive: false,
  },
];

export const OffersPage: React.FC = () => {
  const toast = useToast();
  const [offers, setOffers] = useState<OfferItem[]>(INITIAL_OFFERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [deleteOfferId, setDeleteOfferId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    offerName: '',
    discountPercentage: '',
    validTill: '2026-12-31',
    applicableCourses: 'All Courses',
    isActive: true,
  });

  const validate = () => {
    const err: { [key: string]: string } = {};
    if (!formData.offerName.trim()) {
      err.offerName = 'Offer name is required';
    }
    const discountNum = Number(formData.discountPercentage);
    if (!formData.discountPercentage || isNaN(discountNum) || discountNum < 1 || discountNum > 100) {
      err.discountPercentage = 'Enter a valid percentage between 1 and 100';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    setTimeout(() => {
      const newOffer: OfferItem = {
        id: 'offer_' + Date.now(),
        ...formData,
      };

      setOffers((prev) => [newOffer, ...prev]);
      setIsSaving(false);
      setIsModalOpen(false);
      toast.success('Offer Created', `"${formData.offerName}" discount is now active`);
      setFormData({
        offerName: '',
        discountPercentage: '',
        validTill: '2026-12-31',
        applicableCourses: 'All Courses',
        isActive: true,
      });
    }, 400);
  };

  const handleToggleOffer = (id: string) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const next = !o.isActive;
          toast.info(next ? 'Offer Activated' : 'Offer Deactivated');
          return { ...o, isActive: next };
        }
        return o;
      })
    );
  };

  const handleDeleteOffer = () => {
    if (!deleteOfferId) return;
    setOffers((prev) => prev.filter((o) => o.id !== deleteOfferId));
    setDeleteOfferId(null);
    toast.success('Offer Deleted', 'The discount voucher was removed');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <Header
        title="Offers & Discounts"
        subtitle="Create seasonal promotional discounts, scholarships, and coupon codes for students"
        rightAction={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setErrors({});
              setIsModalOpen(true);
            }}
          >
            Create New Offer
          </Button>
        }
      />

      {/* Promotional Callout Card */}
      <Card variant="gradient" className="border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#006EFF] text-white flex items-center justify-center shadow-brand shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#1E293B]">Boost Student Admissions with Festive Offers</h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                Active discounts are highlighted with special animated badges on student search feeds.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setErrors({});
              setIsModalOpen(true);
            }}
          >
            Add Discount
          </Button>
        </div>
      </Card>

      {/* Offers Grid */}
      {offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <Card
              key={offer.id}
              className="flex flex-col justify-between p-5 sm:p-6 border border-[#E2E8F0] hover:border-[#006EFF]/30 transition-all"
            >
              <div>
                {/* Top Badge: Discount & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black tracking-wide flex items-center gap-1 shadow-xs">
                    <Percent className="w-3.5 h-3.5" />
                    <span>{offer.discountPercentage}% OFF</span>
                  </span>

                  <Badge variant={offer.isActive ? 'success' : 'neutral'} size="sm" dot>
                    {offer.isActive ? 'Active' : 'Expired'}
                  </Badge>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#1E293B] mt-2 line-clamp-1">
                  {offer.offerName}
                </h3>

                <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 text-xs text-[#64748B]">
                  <div className="flex items-center justify-between">
                    <span>Applicable Courses:</span>
                    <span className="font-semibold text-[#1E293B]">{offer.applicableCourses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Valid Till:</span>
                    </span>
                    <span className="font-semibold text-[#1E293B]">{offer.validTill}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleToggleOffer(offer.id)}
                  className={`text-xs font-bold transition-colors ${
                    offer.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  {offer.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#EF4444] hover:bg-red-50 p-1.5 h-auto"
                  onClick={() => setDeleteOfferId(offer.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Tag className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1E293B]">No Promotional Offers Active</h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto mt-1">
            Create discount vouchers and scholarships to attract more student inquiries.
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
            className="mt-4"
          >
            Create First Offer
          </Button>
        </Card>
      )}

      {/* Create Offer Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Discount"
        description="Add a seasonal scholarship or discount voucher for student applicants"
        maxWidth="md"
      >
        <form onSubmit={handleCreateOffer} className="space-y-4 pt-1">
          <InputField
            label="Offer / Voucher Title"
            placeholder="e.g. Diwali Scholarship 2026"
            value={formData.offerName}
            onChange={(e) => {
              setFormData({ ...formData, offerName: e.target.value });
              if (errors.offerName) setErrors({ ...errors, offerName: '' });
            }}
            error={errors.offerName}
            required
            autoFocus
          />

          <InputField
            label="Discount Percentage (%)"
            type="number"
            placeholder="e.g. 20"
            value={formData.discountPercentage}
            onChange={(e) => {
              setFormData({ ...formData, discountPercentage: e.target.value });
              if (errors.discountPercentage) setErrors({ ...errors, discountPercentage: '' });
            }}
            error={errors.discountPercentage}
            icon={<Percent className="w-4 h-4" />}
            helperText="Direct percentage discount applied at course checkout"
            required
          />

          <InputField
            label="Valid Till Date"
            type="date"
            value={formData.validTill}
            onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
            icon={<Calendar className="w-4 h-4" />}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-[#1E293B]">Applicable Courses</label>
            <select
              value={formData.applicableCourses}
              onChange={(e) => setFormData({ ...formData, applicableCourses: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#006EFF]/20 focus:border-[#006EFF]"
            >
              <option value="All Courses">All Courses</option>
              <option value="IIT-JEE Programs Only">IIT-JEE Programs Only</option>
              <option value="NEET-UG Programs Only">NEET-UG Programs Only</option>
              <option value="Foundation Batches Only">Foundation Batches Only</option>
            </select>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              Publish Offer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Offer Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteOfferId}
        onClose={() => setDeleteOfferId(null)}
        onConfirm={handleDeleteOffer}
        title="Delete Offer?"
        message="Are you sure you want to permanently remove this discount offer?"
        confirmText="Delete Offer"
        variant="danger"
      />
    </div>
  );
};

export default OffersPage;
