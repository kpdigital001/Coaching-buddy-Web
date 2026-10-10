import React, { useState } from 'react';
import Header from '../components/common/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useToast } from '../components/common/Toast';
import {
  Sparkles,
  Phone,
  Mail,
  Lock,
  Info,
  Layers,
  Palette,
  Sliders,
  BellRing,
} from 'lucide-react';
import { COLORS } from '../constants/colors';

export const DesignSystemPreview: React.FC = () => {
  const toast = useToast();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [demoInput, setDemoInput] = useState('');
  const [inputError, setInputError] = useState('');

  const handleTestValidation = () => {
    if (!demoInput) {
      setInputError('This field is required for validation testing');
    } else {
      setInputError('');
      toast.success('Validation Passed!', 'Input has valid content');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Header
        title="Milestone 1: Design System & Core Shell"
        subtitle="Complete responsive foundation, tokens, and reusable components matching mobile CBI design"
        rightAction={
          <Badge variant="success" size="md" dot>
            Milestone 1 Active
          </Badge>
        }
      />

      {/* Overview Banner */}
      <Card variant="gradient" className="border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#006EFF] text-white flex items-center justify-center shadow-brand shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#1E293B]">Design System & Architecture Ready</h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                React 18 + Vite + Tailwind CSS + Fully Responsive Layout Shell with Mobile Bottom Nav and Desktop Sidebar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Toast Test', 'Toast system is operating correctly')}
            >
              Test Toast
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDemoModalOpen(true)}
            >
              Open Modal
            </Button>
          </div>
        </div>
      </Card>

      {/* Color Palette Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[#006EFF]" />
          <h2 className="text-base font-bold text-[#1E293B]">1. Color Palette Tokens</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
            <div className="h-14 rounded-lg bg-[#006EFF] mb-2 shadow-inner" />
            <p className="text-xs font-bold text-[#1E293B]">Primary</p>
            <p className="text-[11px] text-[#64748B]">{COLORS.primary}</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
            <div className="h-14 rounded-lg bg-[#4A90FF] mb-2 shadow-inner" />
            <p className="text-xs font-bold text-[#1E293B]">Primary Light</p>
            <p className="text-[11px] text-[#64748B]">{COLORS.primaryLight}</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
            <div className="h-14 rounded-lg bg-[#0056CC] mb-2 shadow-inner" />
            <p className="text-xs font-bold text-[#1E293B]">Primary Dark</p>
            <p className="text-[11px] text-[#64748B]">{COLORS.primaryDark}</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
            <div className="h-14 rounded-lg bg-[#10B981] mb-2 shadow-inner" />
            <p className="text-xs font-bold text-[#1E293B]">Success</p>
            <p className="text-[11px] text-[#64748B]">{COLORS.success}</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
            <div className="h-14 rounded-lg bg-[#EF4444] mb-2 shadow-inner" />
            <p className="text-xs font-bold text-[#1E293B]">Error / Danger</p>
            <p className="text-[11px] text-[#64748B]">{COLORS.error}</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
            <div className="h-14 rounded-lg bg-[#F59E0B] mb-2 shadow-inner" />
            <p className="text-xs font-bold text-[#1E293B]">Warning</p>
            <p className="text-[11px] text-[#64748B]">{COLORS.warning}</p>
          </div>
        </div>
      </div>

      {/* Buttons Showcase */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-[#006EFF]" />
          <h2 className="text-base font-bold text-[#1E293B]">2. Button Variants & States</h2>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="ghost">Ghost</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              <Button variant="primary" size="sm" leftIcon={<Phone className="w-3.5 h-3.5" />}>
                Call Support (Small)
              </Button>
              <Button variant="primary" size="md" leftIcon={<Mail className="w-4 h-4" />}>
                Email Partner (Medium)
              </Button>
              <Button variant="primary" size="lg" isLoading>
                Loading State
              </Button>
              <Button variant="outline" disabled>
                Disabled Button
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Input Fields Showcase */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-[#006EFF]" />
          <h2 className="text-base font-bold text-[#1E293B]">3. Input Fields & Form Controls</h2>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InputField
              label="Institute Name"
              placeholder="e.g. Apex IIT-JEE Academy"
              value="Apex IIT-JEE & Medical Academy"
              required
            />

            <InputField
              label="Email Address"
              type="email"
              placeholder="vendor@example.com"
              icon={<Mail className="w-4 h-4" />}
              defaultValue="director@apexacademy.com"
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Enter secure password"
              icon={<Lock className="w-4 h-4" />}
              defaultValue="password123"
            />

            <div className="space-y-2">
              <InputField
                label="Validation Test Field"
                placeholder="Type something..."
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                error={inputError}
                required
              />
              <Button variant="outline" size="sm" onClick={handleTestValidation}>
                Trigger Validation
              </Button>
            </div>

            <InputField
              label="Disabled Field"
              value="Permanent Institute UID: #CBI-9821"
              disabled
            />

            <InputField
              label="Contact Phone"
              placeholder="9876543210"
              icon={<Phone className="w-4 h-4" />}
              helperText="Indian 10-digit mobile number"
              defaultValue="9876543210"
            />
          </div>
        </Card>
      </div>

      {/* Badges & Toast Controls */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BellRing className="w-5 h-5 text-[#006EFF]" />
          <h2 className="text-base font-bold text-[#1E293B]">4. Badges, Status Pills & Toast System</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-bold text-sm text-[#1E293B] mb-3">Status Badges</h3>
            <div className="flex flex-wrap gap-2.5">
              <Badge variant="success" dot>Institute Online</Badge>
              <Badge variant="danger" dot>Institute Offline</Badge>
              <Badge variant="warning" dot>Pending Approval</Badge>
              <Badge variant="info" dot>Under Review</Badge>
              <Badge variant="primary">Featured Course</Badge>
              <Badge variant="neutral">Draft</Badge>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-sm text-[#1E293B] mb-3">Trigger Toast Notifications</h3>
            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="success"
                size="sm"
                onClick={() => toast.success('Success!', 'Institute data was updated successfully')}
              >
                Success Toast
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => toast.error('Error!', 'Unable to save course details')}
              >
                Error Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.warning('Warning', 'Your KYC documents are expiring')}
              >
                Warning Toast
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsConfirmModalOpen(true)}
              >
                Test Confirm Dialog
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Reusable Modal Component"
        description="Centered dialog with backdrop-blur and responsive scaling"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#64748B] leading-relaxed">
            This modal is built with smooth entrance animations, full keyboard Escape handling, and responsive max-widths.
          </p>
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#006EFF] shrink-0 mt-0.5" />
            <p className="text-xs text-[#1E293B]">
              In subsequent milestones, this modal structure will be used for Course creation, Booking actions, and Image previews.
            </p>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDemoModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsDemoModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          toast.success('Action Confirmed', 'Confirmation modal action completed');
        }}
        title="Confirm Delete Action?"
        message="This is a demonstration of the reusable ConfirmationModal component with custom variant styling."
        confirmText="Confirm Action"
        variant="warning"
      />
    </div>
  );
};

export default DesignSystemPreview;
