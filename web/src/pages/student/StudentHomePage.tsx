import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ShieldCheck,
  Award,
  Zap,
  Search,
  Star,
} from 'lucide-react';
import { studentService } from '../../services/studentApi';
import { BannerItem, StudentCategory, StudentInstitute } from '../../types/student';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useToast } from '../../components/common/Toast';
import InstituteCard from '../../components/student/InstituteCard';
import SEO from '../../components/common/SEO';
import { buildCategoryPath, buildCityPath } from '../../lib/seoUrls';

export const StudentHomePage: React.FC = () => {
  const { selectedCity, savedInstituteIds, addRecentSearch, isAuthenticated } = useStudentAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [categories, setCategories] = useState<StudentCategory[]>([]);
  const [institutes, setInstitutes] = useState<StudentInstitute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSearch, setHeroSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Banner Auto-play
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleBannerClick = (e: React.MouseEvent, link?: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.info('Login Required', 'Please sign in to explore and enroll in courses');
      navigate(`/student/login?returnUrl=${encodeURIComponent(link || '/search')}`);
      return;
    }
    if (link && link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigate(link || '/search');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedBanners, fetchedCategories, fetchedInstitutes] = await Promise.all([
        studentService.getMainBanners(),
        studentService.getParentCategories(),
        studentService.getCollegesByCategoryId(undefined, true),
      ]);
      setBanners(fetchedBanners);
      setCategories(fetchedCategories);
      if (fetchedInstitutes.length > 0) {
        setInstitutes(fetchedInstitutes);
      } else {
        const allStores = await studentService.getCollegesByCategoryId();
        setInstitutes(allStores);
      }
    } catch (e) {
      console.error('Failed to load homepage data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      addRecentSearch(heroSearch.trim());
      navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  // Filter institutes by city if selected
  const filteredInstitutes =
    selectedCity && selectedCity !== 'All Cities'
      ? institutes.filter((inst) => inst.address.city.toLowerCase().includes(selectedCity.toLowerCase()))
      : institutes;

  // Filter saved institutes
  const savedInstitutes = institutes.filter((inst) => savedInstituteIds.includes(inst.id));

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      <SEO
        title="Find Top Coaching Institutes for JEE, NEET & Boards"
        description="Discover, compare, and book direct admissions in 1,200+ verified coaching academies for IIT-JEE, NEET, Foundation, and School Boards."
      />

      {/* 1. Hero Banner Carousel & Quick Search */}
      <section className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        <div className="relative rounded-2xl sm:rounded-3xl lg:rounded-4xl overflow-hidden shadow-lg bg-slate-100 aspect-[16/7] sm:aspect-[21/8] md:aspect-[21/7] min-h-[180px] sm:min-h-[260px] md:min-h-[320px] max-h-[460px] flex items-center justify-center">
          {banners.length > 0 ? (
            banners.map((slide, idx) => (
              <div
                key={slide.id || idx}
                onClick={(e) => handleBannerClick(e, slide.link || '/search')}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={slide.url}
                  alt={slide.title || 'Banner'}
                  className="w-full h-full object-fill"
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-teal-50">
              <img
                src="/student-logo.png"
                alt="Coaching Buddy"
                className="max-h-24 sm:max-h-32 object-contain opacity-80"
              />
            </div>
          )}

          {/* Carousel Slide Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/30 backdrop-blur-xs px-2.5 py-1.5 rounded-full">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide ? 'w-5 sm:w-6 bg-white' : 'w-1.5 sm:w-2 bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Quick Search Bar */}
        <div className="relative mt-4 sm:mt-6 z-20 max-w-4xl mx-auto px-2 sm:px-4">
          <form
            onSubmit={handleHeroSearch}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/90 p-1.5 sm:p-3 flex items-center gap-2"
          >
            <div className="flex items-center gap-2 sm:gap-3 pl-2.5 sm:pl-4 flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#0d9488] shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search JEE, NEET, CET, Academy Name, Area..."
                className="w-full text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold text-white gradient-teal hover:opacity-95 transition-all shadow-teal shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 2. Top Category Explorer Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d9488]">Target Exams & Streams</span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Browse by Exam Category
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-[#0d9488] hover:underline flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading && categories.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse h-36" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={buildCategoryPath(category.name, selectedCity && selectedCity !== 'All Cities' ? selectedCity : 'india')}
                className="relative group bg-white rounded-3xl p-4 border border-slate-200/80 hover:border-[#0d9488]/50 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
              >
                {/* Tag Badge */}
                {category.showTag === 1 && category.tag && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500 text-white shadow-xs">
                    {category.tag}
                  </span>
                )}

                {/* Category Image Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-teal-50/50 p-2 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <img src={category.imagePath} alt={category.name} className="w-full h-full object-contain rounded-xl" />
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#0d9488] transition-colors line-clamp-1">
                  {category.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">Explore centers</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Featured & Top Ranked Institutes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Academies
              </span>
              {selectedCity !== 'All Cities' && (
                <span className="text-xs font-semibold text-slate-500">in {selectedCity}</span>
              )}
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Top Rated Coaching Institutes
            </h2>
          </div>
          <Link
            to={selectedCity && selectedCity !== 'All Cities' ? buildCityPath(selectedCity) : '/explore'}
            className="text-xs sm:text-sm font-bold text-[#0d9488] hover:underline flex items-center gap-1"
          >
            <span>See All Centers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading && filteredInstitutes.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-80" />
            ))}
          </div>
        ) : filteredInstitutes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
            <p className="font-bold text-slate-800 text-base">No institutes found in {selectedCity}</p>
            <p className="text-xs text-slate-500">Try selecting 'All Cities' to see centers across India.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstitutes.map((inst) => (
              <InstituteCard key={inst.id} institute={inst} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Saved Institutes Section */}
      {savedInstitutes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900">Your Saved Institutes</h3>
                <p className="text-xs text-slate-500 mt-0.5">Quickly view or book courses you have bookmarked</p>
              </div>
              <Link to="/student/saved" className="text-xs font-bold text-[#0d9488] hover:underline">
                Manage Saved ({savedInstitutes.length})
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedInstitutes.map((inst) => (
                <InstituteCard key={`saved-${inst.id}`} institute={inst} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Why Choose Coaching Buddy Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d9488]">Smart Learning Journey</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Why Students Trust CoachingBuddy</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              We eliminate guesswork from competitive exam preparation. Discover the right mentorship with complete transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#0d9488] flex items-center justify-center font-bold mx-auto sm:mx-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">100% Verified Centers</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                All coaching institutes and faculty credentials undergo rigorous quality verification.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mx-auto sm:mx-0">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Direct Contact & WhatsApp</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect directly with center heads, download batch schedules, and schedule counseling.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold mx-auto sm:mx-0">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Authentic Student Reviews</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Read genuine ratings and feedback written by enrolled students and parents.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold mx-auto sm:mx-0">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Exclusive Fee Discounts</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unlock early bird discounts, scholarship tie-ups, and transparent fee schedules.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentHomePage;
