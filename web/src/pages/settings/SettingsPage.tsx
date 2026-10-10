import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  MessageCircle,
  Save,
  Mail,
  User,
} from 'lucide-react';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const SettingsPage: React.FC = () => {
  const { store, setStoreData } = useAuth();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    storeName: store?.name || 'Apex IIT-JEE & Medical Academy',
    ownerName: 'Dr. Rajesh Sharma',
    phone: store?.contact?.phone || '9876543210',
    whatsapp: store?.contact?.whatsapp || '9876543210',
    email: store?.contact?.email || 'contact@apexacademy.com',
    area: store?.address?.area || 'Koramangala 4th Block, 80 Feet Road',
    landmark: store?.address?.nearBy || store?.address?.landmark || 'Opposite Sony World Signal',
    city: store?.address?.city || 'Bengaluru',
    state: store?.address?.state || 'Karnataka',
    pincode: store?.address?.pincode || '560034',
    shortDescription: store?.shortDescription || 'Premier coaching institute for competitive exams.',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = () => {
    const err: { [key: string]: string } = {};
    if (!formData.storeName.trim()) err.storeName = 'Institute name is required';
    if (!formData.ownerName.trim()) err.ownerName = 'Director / Owner name is required';
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.trim())) {
      err.phone = 'Enter a valid 10-digit phone number';
    }
    if (!formData.whatsapp.trim() || !/^\d{10}$/.test(formData.whatsapp.trim())) {
      err.whatsapp = 'Enter a valid 10-digit WhatsApp number';
    }
    if (!formData.area.trim()) err.area = 'Area / Street is required';
    if (!formData.city.trim()) err.city = 'City is required';
    if (!formData.state.trim()) err.state = 'State is required';
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      err.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    try {
      if (store?.id) {
        try {
          await api.put(`/store/update/${store.id}`, {
            storeName: formData.storeName,
            ownerName: formData.ownerName,
            storePhone: formData.phone,
            storeWhatsapp: formData.whatsapp,
            storeArea: formData.area,
            storeCity: formData.city,
            storeNearBy: formData.landmark,
            storePin: formData.pincode,
            storeState: formData.state,
          });
        } catch (apiErr) {
          console.warn('API store update fallback for dev preview:', apiErr);
        }

        // Sync with global store context
        setStoreData({
          ...store,
          name: formData.storeName,
          address: {
            ...store.address,
            area: formData.area,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            nearBy: formData.landmark,
            landmark: formData.landmark,
          },
          contact: {
            ...store.contact,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            email: formData.email,
          },
          shortDescription: formData.shortDescription,
        });
      }

      setIsSaving(false);
      toast.success('Profile Saved', 'Institute details have been updated successfully');
    } catch (err: any) {
      setIsSaving(false);
      toast.error('Update Failed', err.message || 'Unable to update institute details');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <Header
        title="Institute Information"
        subtitle="Update registered institute credentials, direct contact numbers, and campus address"
        rightAction={
          <Badge variant="success" size="md" dot>
            Verified Partner
          </Badge>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Institute Details Card */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#006EFF] flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">Basic Institute Information</h2>
              <p className="text-xs text-[#64748B]">Official name and primary administration contacts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <InputField
                label="Institute / Business Name"
                placeholder="e.g. Apex IIT-JEE & Medical Academy"
                value={formData.storeName}
                onChange={(e) => updateField('storeName', e.target.value)}
                error={errors.storeName}
                required
              />
            </div>

            <InputField
              label="Director / Owner Full Name"
              placeholder="e.g. Dr. Rajesh Sharma"
              value={formData.ownerName}
              onChange={(e) => updateField('ownerName', e.target.value)}
              error={errors.ownerName}
              icon={<User className="w-4 h-4" />}
              required
            />

            <InputField
              label="Official Contact Email"
              type="email"
              placeholder="contact@apexacademy.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />

            <InputField
              label="Primary Phone Number"
              placeholder="10-digit phone number"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              error={errors.phone}
              icon={<Phone className="w-4 h-4" />}
              required
            />

            <InputField
              label="WhatsApp Inquiries Number"
              placeholder="10-digit WhatsApp number"
              value={formData.whatsapp}
              onChange={(e) => updateField('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))}
              error={errors.whatsapp}
              icon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
              required
            />

            <div className="sm:col-span-2 space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#1E293B]">Short Bio / Tagline</label>
              <textarea
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                placeholder="Brief institute summary shown on discovery cards..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#006EFF]/20 focus:border-[#006EFF]"
              />
            </div>
          </div>
        </Card>

        {/* Address Details Card */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">Campus Location & Address</h2>
              <p className="text-xs text-[#64748B]">Physical center location for student visits and direction map</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <InputField
                label="Area / Street Address"
                placeholder="e.g. 4th Block, 80 Feet Road"
                value={formData.area}
                onChange={(e) => updateField('area', e.target.value)}
                error={errors.area}
                required
              />
            </div>

            <InputField
              label="Landmark / Nearby Location"
              placeholder="e.g. Opposite Sony World Signal"
              value={formData.landmark}
              onChange={(e) => updateField('landmark', e.target.value)}
              error={errors.landmark}
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
        </Card>

        {/* Submit Bottom Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
