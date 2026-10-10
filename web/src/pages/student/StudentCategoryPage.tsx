import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  SlidersHorizontal,
  MapPin,
  LayoutGrid,
  List as ListIcon,
  Search,
} from 'lucide-react';
import { studentService } from '../../services/studentApi';
import { StudentCategory, StudentInstitute } from '../../types/student';
import InstituteCard from '../../components/student/InstituteCard';
import SEO from '../../components/common/SEO';
import {
  absoluteUrl,
  buildCategoryPath,
  buildCityPath,
  buildInstitutePath,
  humanizeSlug,
  isAllIndiaCity,
  slugifySeo,
} from '../../lib/seoUrls';
import { categorySeoKey, citySeoKey, normalizeCanonicalUrl } from '../../lib/seoAdmin';
import { useSeoOverride } from '../../hooks/useSeoOverride';

export const StudentCategoryPage: React.FC = () => {
  const { id, citySlug, categorySlug } = useParams<{
    id?: string;
    citySlug?: string;
    categorySlug?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const categoryNameParam = searchParams.get('categoryName');

  const [categories, setCategories] = useState<StudentCategory[]>([]);
  const [institutes, setInstitutes] = useState<StudentInstitute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCity, setFilterCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'fee-asc' | 'fee-desc'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const isAllCategories = (!id && !categorySlug) || id === 'all' || id === 'explore';

  const legacyCategory = id ? categories.find((c) => c.id === id) : undefined;
  const seoCategory = categorySlug
    ? categories.find((c) => slugifySeo(c.name) === slugifySeo(categorySlug))
    : undefined;

  const currentCategory = isAllCategories
    ? {
        id: 'all',
        name: 'All Categories',
        imagePath: '',
        showTag: 0,
      }
    : seoCategory ||
      legacyCategory || {
        id: id || '',
        name: categoryNameParam || humanizeSlug(categorySlug) || 'Coaching Categories',
        imagePath: '',
        showTag: 0,
      };

  useEffect(() => {
    loadCategoryData();
  }, [id, categorySlug]);

  const loadCategoryData = async () => {
    setIsLoading(true);
    try {
      const allCats = await studentService.getParentCategories();
      setCategories(allCats);

      if (isAllCategories) {
        const allColleges = await studentService.getCollegesByCategoryId();
        setInstitutes(allColleges);
        return;
      }

      const resolvedCategoryId = categorySlug
        ? allCats.find((c) => slugifySeo(c.name) === slugifySeo(categorySlug))?.id
        : id;

      if (!resolvedCategoryId) {
        setInstitutes([]);
        return;
      }

      const result = await studentService.getSubCategoriesOrColleges(resolvedCategoryId);
      if (result?.colleges?.length) {
        setInstitutes(result.colleges);
      } else {
        const fetched = await studentService.getCollegesByCategoryId(resolvedCategoryId);
        setInstitutes(fetched);
      }
    } catch (e) {
      console.error('Failed to load category data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!citySlug || isAllIndiaCity(citySlug) || institutes.length === 0) return;

    const matchedCity = institutes
      .map((inst) => inst.address.city)
      .find((city) => slugifySeo(city) === slugifySeo(citySlug));

    if (matchedCity && filterCity !== matchedCity) {
      setFilterCity(matchedCity);
    }
  }, [citySlug, institutes, filterCity]);

  useEffect(() => {
    if (!id || !legacyCategory || categorySlug) return;

    const canonicalPath = buildCategoryPath(legacyCategory.name, 'india');
    if (location.pathname !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [id, legacyCategory, categorySlug, location.pathname, navigate]);

  const routeCitySlug = citySlug && !isAllIndiaCity(citySlug) ? slugifySeo(citySlug) : '';

  // Filter & Sort logic
  const filteredInstitutes = institutes
    .filter((inst) => {
      if (routeCitySlug && slugifySeo(inst.address.city) !== routeCitySlug) {
        return false;
      }
      if (!routeCitySlug && filterCity !== 'all' && inst.address.city.toLowerCase() !== filterCity.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = inst.name.toLowerCase().includes(q);
        const matchArea = inst.address.area.toLowerCase().includes(q);
        const matchDesc = inst.shortDescription.toLowerCase().includes(q);
        if (!matchName && !matchArea && !matchDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        const aRating = a.comments?.reduce((acc, c) => acc + c.rating, 0) || 0;
        const bRating = b.comments?.reduce((acc, c) => acc + c.rating, 0) || 0;
        return bRating - aRating;
      }
      if (sortBy === 'fee-asc') {
        const aFee = Number(a.courses?.[0]?.sellingPrice || 999999);
        const bFee = Number(b.courses?.[0]?.sellingPrice || 999999);
        return aFee - bFee;
      }
      if (sortBy === 'fee-desc') {
        const aFee = Number(a.courses?.[0]?.sellingPrice || 0);
        const bFee = Number(b.courses?.[0]?.sellingPrice || 0);
        return bFee - aFee;
      }
      return 0;
    });

  const availableCities: string[] = Array.from(
    new Set<string>(
      institutes
        .map((i) => String(i.address.city || ''))
        .filter(Boolean)
    )
  );

  const activeCity =
    routeCitySlug
      ? availableCities.find((city) => slugifySeo(city) === routeCitySlug) || humanizeSlug(routeCitySlug)
      : filterCity !== 'all'
        ? filterCity
        : '';

  const cityForLinks = activeCity || 'india';

  const seoTitle = isAllCategories
    ? activeCity
      ? `Best Coaching Institutes in ${activeCity} - Courses, Fees & Reviews`
      : 'Explore Coaching Institutes & Exam Categories in India'
    : activeCity
      ? `Best ${currentCategory.name} Coaching Institutes in ${activeCity}`
      : `Best ${currentCategory.name} Coaching Institutes in India`;

  const seoDescription = isAllCategories
    ? activeCity
      ? `Explore verified coaching institutes in ${activeCity}. Compare available courses, fees, locations and student reviews on Coaching Buddy.`
      : 'Explore verified coaching institutes across India by exam category, city, courses, fees and student reviews on Coaching Buddy.'
    : `Explore verified ${currentCategory.name} coaching institutes${activeCity ? ` in ${activeCity}` : ' across India'}. Compare courses, fees, locations and student reviews.`;

  const canonicalPath = isAllCategories
    ? activeCity
      ? buildCityPath(activeCity)
      : '/explore'
    : buildCategoryPath(currentCategory.name, activeCity || 'india');

  const seoOverrideKey = isAllCategories
    ? activeCity
      ? citySeoKey(activeCity)
      : ''
    : categorySeoKey(activeCity || 'india', currentCategory.name);
  const seoOverride = useSeoOverride(seoOverrideKey);
  const finalSeoTitle = seoOverride?.title || seoTitle;
  const finalSeoDescription = seoOverride?.description || seoDescription;
  const finalCanonicalUrl = normalizeCanonicalUrl(seoOverride?.canonical, canonicalPath);
  const automaticH1 = isAllCategories
    ? activeCity
      ? `Top Coaching Institutes in ${activeCity}`
      : 'Explore All Coaching Categories & Institutes'
    : activeCity
      ? `Top ${currentCategory.name} Coaching Institutes in ${activeCity}`
      : `Top Coaching Institutes for ${currentCategory.name}`;
  const finalH1 = seoOverride?.h1 || automaticH1;
  const automaticIntro = isAllCategories
    ? 'Browse verified academies, programs, expert faculties, fees, and authentic student reviews across all competitive exams.'
    : 'Compare syllabus, classroom programs, faculties, fees, and student reviews across verified coaching centers.';
  const finalIntro = seoOverride?.intro || automaticIntro;
  const faqSchema = seoOverride?.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: seoOverride.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : undefined;

  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: seoTitle,
    itemListElement: filteredInstitutes.slice(0, 50).map((inst, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: inst.name,
      url: absoluteUrl(buildInstitutePath(inst)),
    })),
  };

  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://coachingbuddy.co.in/',
    },
    ...(activeCity
      ? [
          {
            '@type': 'ListItem',
            position: 2,
            name: `Coaching Institutes in ${activeCity}`,
            item: absoluteUrl(buildCityPath(activeCity)),
          },
        ]
      : []),
    ...(!isAllCategories
      ? [
          {
            '@type': 'ListItem',
            position: activeCity ? 3 : 2,
            name: currentCategory.name,
            item: absoluteUrl(canonicalPath),
          },
        ]
      : []),
  ];

  const handleCityChange = (nextCity: string) => {
    setFilterCity(nextCity);

    if (isAllCategories) {
      navigate(nextCity === 'all' ? '/explore' : buildCityPath(nextCity));
      return;
    }

    navigate(buildCategoryPath(currentCategory.name, nextCity === 'all' ? 'india' : nextCity));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <SEO
        title={finalSeoTitle}
        description={finalSeoDescription}
        url={finalCanonicalUrl}
        robots={
          seoOverride?.index === false
            ? 'noindex, follow'
            : !isLoading && filteredInstitutes.length === 0
              ? 'noindex, follow'
              : undefined
        }
        structuredData={[
          listingSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItems,
          },
          ...(faqSchema ? [faqSchema] : []),
        ]}
      />

      {/* Category Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-teal-300 font-semibold">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>{activeCity ? `Coaching in ${activeCity}` : 'Explore'}</span>
            {!isAllCategories && (
              <>
                <span>/</span>
                <span className="text-white">{currentCategory.name}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">{finalH1}</h1>

          <p className="text-xs sm:text-sm text-slate-300">{finalIntro}</p>

          <div className="flex items-center gap-3 pt-2 text-xs text-teal-200">
            <span>✨ {filteredInstitutes.length} Centers Available</span>
            <span>•</span>
            <span>🎯 Verified Faculties & Results</span>
          </div>
        </div>
      </div>

      {/* Visual Category Grid when on Explore/All */}
      {isAllCategories && categories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Browse by Examination & Stream
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={buildCategoryPath(cat.name, cityForLinks)}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 hover:shadow-lg hover:border-teal-500 hover:-translate-y-0.5 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0d9488] p-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {cat.imagePath ? (
                    <img src={cat.imagePath} alt={cat.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-extrabold text-sm">{cat.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-[#0d9488] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  {cat.showTag === 1 && (
                    <span className="inline-block text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded-full">
                      {cat.tag || 'Popular'}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category Switcher Horizontal Pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Link
            to={activeCity ? buildCityPath(activeCity) : '/explore'}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
              isAllCategories
                ? 'bg-[#0d9488] text-white border-[#0d9488] shadow-teal'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>🌟 All Categories</span>
          </Link>
          {categories.map((cat) => {
            const isActive = cat.id === currentCategory.id;
            return (
              <Link
                key={cat.id}
                to={buildCategoryPath(cat.name, cityForLinks)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                  isActive
                    ? 'bg-[#0d9488] text-white border-[#0d9488] shadow-teal'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.name}
                {cat.showTag === 1 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white text-[#0d9488]' : 'bg-red-50 text-red-600 font-extrabold'
                    }`}
                  >
                    {cat.tag || 'Hot'}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Filters & Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Search inside category */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by center name or area..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30"
          />
        </div>

        {/* Filter dropdowns & View Mode */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* City Filter */}
          {availableCities.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 flex-1 sm:flex-initial">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filterCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="all">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 flex-1 sm:flex-initial">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="rating">Top Rated</option>
              <option value="fee-asc">Fee: Low to High</option>
              <option value="fee-desc">Fee: High to Low</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-[#0d9488]' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-[#0d9488]' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Institutes Listing */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading coaching centers...</p>
        </div>
      ) : filteredInstitutes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0d9488] flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-800">No Coaching Institutes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any centers matching your filters. Try resetting the city filter or search query.
          </p>
          <button
            onClick={() => {
              setFilterCity('all');
              setSearchTerm('');
              if (isAllCategories) {
                navigate('/explore');
              } else {
                navigate(buildCategoryPath(currentCategory.name, 'india'));
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-teal shadow-xs cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutes.map((inst) => (
            <InstituteCard key={inst.id} institute={inst} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInstitutes.map((inst) => (
            <InstituteCard key={inst.id} institute={inst} horizontal />
          ))}
        </div>
      )}
      {seoOverride?.faqs?.length ? (
        <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {seoOverride.faqs.map((faq, index) => (
              <div key={`${faq.question}_${index}`} className="py-4">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{faq.question}</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

    </div>
  );
};

export default StudentCategoryPage;
