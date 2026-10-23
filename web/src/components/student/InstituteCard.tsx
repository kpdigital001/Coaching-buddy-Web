import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Heart, CheckCircle, ChevronRight } from 'lucide-react';
import { StudentInstitute } from '../../types/student';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useToast } from '../common/Toast';
import { getImageURI } from '../../services/studentApi';
import { buildInstitutePath } from '../../lib/seoUrls';
import { instituteImageAlt } from '../../lib/autoSeo';

interface InstituteCardProps {
  institute: StudentInstitute;
  horizontal?: boolean;
}

export const InstituteCard: React.FC<InstituteCardProps> = ({ institute, horizontal = false }) => {
  const { isInstituteSaved, toggleSaveInstitute, isAuthenticated } = useStudentAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const isSaved = isInstituteSaved(institute.id);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Login Required', 'Please sign in to save coaching institutes to your favorites');
      navigate(`/student/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const savedNow = toggleSaveInstitute(institute);
    if (savedNow) {
      toast.success('Institute Saved', `${institute.name} has been added to your saved list`);
    } else {
      toast.info('Institute Removed', `${institute.name} removed from your saved list`);
    }
  };

  const ratings = institute.comments?.map((c) => c.rating) || [];
  const averageRating =
    ratings.length > 0 ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1) : '9.0';

  const coverImage = getImageURI(
    institute.images.cover?.[0] || institute.images.banner?.[0] || institute.images.gallery?.[0]
  );
  const logoImage = getImageURI(institute.images.logo?.[0]);

  if (horizontal) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-blue-300/80 transition-all duration-300 flex flex-col sm:flex-row group">
        {/* Image */}
        <div className="sm:w-64 h-48 sm:h-auto relative overflow-hidden shrink-0 bg-slate-100">
          <img
            src={coverImage}
            alt={instituteImageAlt(institute, 'cover')}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <button
            type="button"
            onClick={handleToggleSave}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
              isSaved ? 'bg-red-500 text-white shadow-md' : 'bg-black/30 text-white hover:bg-black/50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle className="w-3 h-3" />
                Verified Academy
              </span>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md text-amber-700 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{averageRating}/10</span>
                <span className="text-[10px] text-slate-400 font-medium">({ratings.length || 12})</span>
              </div>
            </div>

            <Link to={buildInstitutePath(institute)}>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-[#0d9488] transition-colors line-clamp-1">
                {institute.name}
              </h3>
            </Link>

            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {institute.shortDescription || institute.longDescription}
            </p>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-3">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">
                {institute.address.area}, {institute.address.city}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Starting from</span>
              <span className="text-sm font-extrabold text-[#0d9488]">
                {institute.courses?.[0] ? `₹${Number(institute.courses[0].sellingPrice).toLocaleString('en-IN')}` : 'Contact for Fees'}
              </span>
            </div>

            <Link
              to={buildInstitutePath(institute)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white gradient-teal hover:opacity-95 transition-all shadow-teal"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-teal-300/80 transition-all duration-300 flex flex-col group h-full">
      {/* Cover Header */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={instituteImageAlt(institute, 'cover')}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Save Bookmark Button */}
        <button
          type="button"
          onClick={handleToggleSave}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 z-10 ${
            isSaved ? 'bg-red-500 text-white shadow-md' : 'bg-black/30 text-white hover:bg-black/50'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save Institute'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500/95 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-xs">
          <Star className="w-3.5 h-3.5 fill-white text-white" />
          <span>{averageRating}/10</span>
        </div>

        {/* Institute Logo overlapping header */}
        <div className="absolute bottom-3 left-3 w-12 h-12 rounded-2xl bg-white p-1 shadow-md overflow-hidden border border-white">
          <img src={logoImage} alt={instituteImageAlt(institute, 'logo')} className="w-full h-full object-contain rounded-xl" />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mb-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verified Institute</span>
          </div>

          <Link to={buildInstitutePath(institute)}>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#0d9488] transition-colors line-clamp-1 leading-snug">
              {institute.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {institute.shortDescription || institute.longDescription}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-3">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate">
              {institute.address.area}, {institute.address.city}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Admission Fee</span>
            <span className="text-sm font-extrabold text-slate-900">
              {institute.courses?.[0] ? `₹${Number(institute.courses[0].sellingPrice).toLocaleString('en-IN')}` : 'Flexible'}
            </span>
          </div>

          <Link
            to={buildInstitutePath(institute)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0d9488] bg-teal-50 hover:bg-[#0d9488] hover:text-white transition-all shadow-2xs"
          >
            <span>Explore</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstituteCard;
