import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, RefreshCw } from 'lucide-react';
import { studentService } from '../../services/studentApi';
import { StudentInstitute } from '../../types/student';
import { useStudentAuth } from '../../context/StudentAuthContext';
import InstituteCard from '../../components/student/InstituteCard';

export const StudentSavedPage: React.FC = () => {
  const {
    savedInstitutes,
    savedInstituteIds,
    isAuthenticated,
    refreshSavedInstitutes,
    setSavedInstitutesDirectly,
  } = useStudentAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/student/login?returnUrl=/student/saved');
      return;
    }
    loadSavedColleges();
  }, [isAuthenticated]);

  const loadSavedColleges = async () => {
    setIsLoading(true);
    try {
      if (savedInstituteIds.length === 0 && savedInstitutes.length === 0) {
        setIsLoading(false);
        return;
      }

      // If we already have saved institutes cached, use them immediately
      if (savedInstitutes.length > 0 && savedInstitutes.every((i) => i && i.name && i.id)) {
        setIsLoading(false);
      }

      // Sync with server
      const currentIds = Array.from(
        new Set([...savedInstituteIds, ...savedInstitutes.map((i) => i.id)])
      ).filter(Boolean);

      if (currentIds.length === 0) {
        setIsLoading(false);
        return;
      }

      const matches = await studentService.syncSavedColleges(currentIds);
      if (matches && matches.length > 0) {
        setSavedInstitutesDirectly(matches);
      } else {
        // Fetch each individually by ID to ensure accurate live cards
        const items = await Promise.all(
          currentIds.map((id) => studentService.getInstitute(id))
        );
        const valid = items.filter((i): i is StudentInstitute => Boolean(i && i.id && i.name));
        setSavedInstitutesDirectly(valid);
      }
    } catch (e) {
      console.error('Failed to load saved colleges', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshSavedInstitutes();
    await loadSavedColleges();
    setIsRefreshing(false);
  };

  const displayedList = savedInstitutes.filter((i) => i && i.id && i.name);
  const displayedCount = displayedList.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            <span>Saved Coaching Centers ({displayedCount})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Institutes you have bookmarked for comparison, reviews, and future batch admissions.
          </p>
        </div>

        {displayedCount > 0 && (
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all w-fit cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Saved'}</span>
          </button>
        )}
      </div>

      {isLoading && displayedCount === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading saved centers...</p>
        </div>
      ) : displayedCount === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">No Saved Institutes Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any institute card or profile to save it here for quick access.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-teal text-white text-xs font-bold shadow-teal mt-2"
          >
            <span>Explore Institutes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedList.map((inst) => (
            <InstituteCard key={inst.id} institute={inst} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentSavedPage;
