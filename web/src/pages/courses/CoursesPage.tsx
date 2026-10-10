import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Edit3,
  Trash2,
  Tag,
} from 'lucide-react';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../components/common/Toast';
import { CourseType } from '../../types';

// Sample initial courses matching mobile app store data
const INITIAL_COURSES: CourseType[] = [
  {
    id: 'course_1',
    courseName: 'IIT-JEE (Main + Advanced) 2-Year Comprehensive Program',
    keywordId: 'kw_iit',
    productType: 'service',
    mrp: '120000',
    discount: '25',
    sellingPrice: '90000.00',
    description: 'Complete physics, chemistry, and mathematics preparation with daily practice problems (DPPs), weekly mock tests, and personalized doubt sessions.',
    isEnabled: true,
  },
  {
    id: 'course_2',
    courseName: 'NEET-UG Medical Masterclass (Target 2027)',
    keywordId: 'kw_neet',
    productType: 'service',
    mrp: '110000',
    discount: '20',
    sellingPrice: '88000.00',
    description: 'NCERT line-by-line biology, organic chemistry mechanisms, and physics problem-solving workshops led by top doctors and master educators.',
    isEnabled: true,
  },
  {
    id: 'course_3',
    courseName: 'Class 9th & 10th Olympiad & Foundation Batch',
    keywordId: 'kw_found',
    productType: 'service',
    mrp: '45000',
    discount: '15',
    sellingPrice: '38250.00',
    description: 'Strong mathematical and scientific foundation building for NTSE, PRMO, and school board toppers.',
    isEnabled: true,
  },
  {
    id: 'course_4',
    courseName: 'Crash Course: JEE Main 60-Day Sprint',
    keywordId: 'kw_crash',
    productType: 'service',
    mrp: '25000',
    discount: '40',
    sellingPrice: '15000.00',
    description: 'High-yield formula revisions, previous 10-year question papers solving, and 15 full-length simulated mock tests.',
    isEnabled: false,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Courses' },
  { id: 'kw_iit', label: 'IIT-JEE' },
  { id: 'kw_neet', label: 'NEET-UG' },
  { id: 'kw_found', label: 'Foundation' },
  { id: 'kw_crash', label: 'Crash Course' },
];

export const CoursesPage: React.FC = () => {
  const toast = useToast();
  const [courses, setCourses] = useState<CourseType[]>(INITIAL_COURSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal form state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Delete modal state
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    courseName: '',
    keywordId: 'kw_iit',
    productType: 'service',
    mrp: '',
    discount: '',
    description: '',
    isEnabled: true,
  });

  // Calculate real-time selling price
  const calculatedSellingPrice = useMemo(() => {
    const mrp = parseFloat(formData.mrp) || 0;
    const discount = parseFloat(formData.discount) || 0;
    if (mrp > 0 && discount >= 0 && discount <= 100) {
      const discountAmount = (mrp * discount) / 100;
      return (mrp - discountAmount).toFixed(2);
    }
    return mrp > 0 ? mrp.toFixed(2) : '0.00';
  }, [formData.mrp, formData.discount]);

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      courseName: '',
      keywordId: 'kw_iit',
      productType: 'service',
      mrp: '',
      discount: '0',
      description: '',
      isEnabled: true,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (course: CourseType) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      keywordId: course.keywordId,
      productType: course.productType,
      mrp: course.mrp,
      discount: course.discount,
      description: course.description,
      isEnabled: course.isEnabled,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const err: { [key: string]: string } = {};
    if (!formData.courseName.trim()) err.courseName = 'Course name is required';
    if (!formData.mrp || isNaN(Number(formData.mrp)) || Number(formData.mrp) <= 0) {
      err.mrp = 'Enter a valid course fee (MRP)';
    }
    if (
      formData.discount &&
      (isNaN(Number(formData.discount)) || Number(formData.discount) < 0 || Number(formData.discount) > 100)
    ) {
      err.discount = 'Discount must be between 0% and 100%';
    }
    if (!formData.description.trim()) {
      err.description = 'Course description is required';
    }

    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);

    setTimeout(() => {
      if (editingCourse) {
        // Update existing
        setCourses((prev) =>
          prev.map((c) =>
            c.id === editingCourse.id
              ? {
                  ...c,
                  ...formData,
                  sellingPrice: calculatedSellingPrice,
                }
              : c
          )
        );
        toast.success('Course Updated', `"${formData.courseName}" has been updated`);
      } else {
        // Add new
        const newCourse: CourseType = {
          id: 'course_' + Date.now(),
          ...formData,
          sellingPrice: calculatedSellingPrice,
        };
        setCourses((prev) => [newCourse, ...prev]);
        toast.success('Course Added', `"${formData.courseName}" added to catalog`);
      }

      setIsSaving(false);
      setIsFormModalOpen(false);
    }, 400);
  };

  const handleToggleStatus = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const next = !c.isEnabled;
          toast.info(
            next ? 'Course Enabled' : 'Course Disabled',
            `Course is now ${next ? 'visible to students' : 'hidden from catalog'}`
          );
          return { ...c, isEnabled: next };
        }
        return c;
      })
    );
  };

  const handleDeleteCourse = () => {
    if (!deleteCourseId) return;
    setCourses((prev) => prev.filter((c) => c.id !== deleteCourseId));
    setDeleteCourseId(null);
    toast.success('Course Deleted', 'The course was removed from your catalog');
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || c.keywordId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <Header
        title="Courses Management"
        subtitle="Create, update, and manage course catalog, batch pricing, and student discounts"
        rightAction={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openAddModal}
          >
            Add New Course
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-card">
        {/* Search Field */}
        <div className="w-full md:max-w-md">
          <InputField
            placeholder="Search courses by name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-[#94A3B8]" />}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#0d9488] text-white shadow-teal'
                  : 'bg-slate-50 text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B] border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filteredCourses.map((course) => {
            const categoryLabel = CATEGORIES.find((cat) => cat.id === course.keywordId)?.label || 'General';

            return (
              <Card
                key={course.id}
                className="flex flex-col justify-between p-5 sm:p-6 hover:border-[#0d9488]/30 transition-all"
              >
                <div>
                  {/* Top Badges & Status Switch */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {categoryLabel}
                      </Badge>
                      <Badge variant={course.isEnabled ? 'success' : 'neutral'} size="sm" dot>
                        {course.isEnabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>

                    {/* Enable/Disable Toggle */}
                    <button
                      onClick={() => handleToggleStatus(course.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        course.isEnabled ? 'bg-[#0d9488]' : 'bg-slate-200'
                      }`}
                      role="switch"
                      aria-checked={course.isEnabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          course.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Course Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-[#1E293B] line-clamp-1">
                    {course.courseName}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Pricing Box */}
                  <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-[#64748B] block uppercase tracking-wider">
                        Admission Fee
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-[#0d9488]">
                          ₹{Number(course.sellingPrice).toLocaleString('en-IN')}
                        </span>
                        {Number(course.discount) > 0 && (
                          <span className="text-xs text-[#94A3B8] line-through">
                            ₹{Number(course.mrp).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {Number(course.discount) > 0 && (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{course.discount}% OFF</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    onClick={() => openEditModal(course)}
                  >
                    Edit Course
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#EF4444] hover:bg-red-50"
                    onClick={() => setDeleteCourseId(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1E293B]">No Courses Found</h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto mt-1">
            {searchQuery
              ? 'No courses match your search criteria. Try a different query.'
              : 'You have not added any courses yet. Add your first course to start receiving student admissions!'}
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openAddModal}
            className="mt-4"
          >
            Create First Course
          </Button>
        </Card>
      )}

      {/* Add / Edit Course Modal Form */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCourse ? 'Edit Course Details' : 'Add New Course'}
        description="Fill in the course syllabus, batch schedule, and admission pricing"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCourse} className="space-y-4 pt-1">
          <InputField
            label="Course / Program Name"
            placeholder="e.g. IIT-JEE 2-Year Target Batch"
            value={formData.courseName}
            onChange={(e) => {
              setFormData({ ...formData, courseName: e.target.value });
              if (formErrors.courseName) setFormErrors({ ...formErrors, courseName: '' });
            }}
            error={formErrors.courseName}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category / Keyword Dropdown */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#1E293B] flex items-center gap-1">
                Course Category <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={formData.keywordId}
                onChange={(e) => setFormData({ ...formData, keywordId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]"
              >
                <option value="kw_iit">IIT-JEE (Main & Advanced)</option>
                <option value="kw_neet">NEET-UG Medical</option>
                <option value="kw_found">Class 9-10 Foundation</option>
                <option value="kw_crash">Crash Course / Fast Track</option>
                <option value="kw_upsc">UPSC & Civil Services</option>
                <option value="kw_code">Coding & STEM Skills</option>
              </select>
            </div>

            {/* Product Type */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#1E293B]">Delivery Type</label>
              <select
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]"
              >
                <option value="service">Classroom Coaching (Offline)</option>
                <option value="online">Live Online Batch</option>
                <option value="hybrid">Hybrid (Classroom + Online)</option>
              </select>
            </div>
          </div>

          {/* Pricing Row: MRP, Discount, Auto Calculated Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <InputField
              label="Original Fee (MRP ₹)"
              placeholder="e.g. 50000"
              type="number"
              value={formData.mrp}
              onChange={(e) => {
                setFormData({ ...formData, mrp: e.target.value });
                if (formErrors.mrp) setFormErrors({ ...formErrors, mrp: '' });
              }}
              error={formErrors.mrp}
              required
            />

            <InputField
              label="Discount (%)"
              placeholder="e.g. 20"
              type="number"
              value={formData.discount}
              onChange={(e) => {
                setFormData({ ...formData, discount: e.target.value });
                if (formErrors.discount) setFormErrors({ ...formErrors, discount: '' });
              }}
              error={formErrors.discount}
            />

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#1E293B]">Auto Selling Price</label>
              <div className="px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-base font-extrabold text-[#0d9488] shadow-xs flex items-center">
                ₹{Number(calculatedSellingPrice).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-[#1E293B] flex items-center gap-1">
              Course Details & Highlights <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Detail faculty experience, study materials, batch timing, and mock test schedule..."
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]"
            />
            {formErrors.description && (
              <p className="text-xs text-[#EF4444] font-medium">{formErrors.description}</p>
            )}
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-teal-50/50 rounded-xl border border-teal-100">
            <div>
              <span className="text-xs font-bold text-[#1E293B] block">Enable for Student Enrollment</span>
              <span className="text-[11px] text-[#64748B]">When active, students can discover and book this course</span>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isEnabled: !formData.isEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.isEnabled ? 'bg-[#0d9488]' : 'bg-slate-200'
              }`}
              role="switch"
              aria-checked={formData.isEnabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  formData.isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteCourseId}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={handleDeleteCourse}
        title="Delete Course?"
        message="Are you sure you want to permanently delete this course? Students will no longer be able to view or enroll in it."
        confirmText="Delete Course"
        variant="danger"
      />
    </div>
  );
};

export default CoursesPage;
