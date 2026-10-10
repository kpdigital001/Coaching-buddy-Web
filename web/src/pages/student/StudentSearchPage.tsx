import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Clock, Trash2, X, Sparkles } from 'lucide-react';
import { studentService } from '../../services/studentApi';
import { StudentInstitute } from '../../types/student';
import { useStudentAuth } from '../../context/StudentAuthContext';
import InstituteCard from '../../components/student/InstituteCard';
import SEO from '../../components/common/SEO';

export const StudentSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { recentSearches, addRecentSearch, clearRecentSearches } = useStudentAuth();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<StudentInstitute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    addRecentSearch(searchTerm.trim());

    try {
      const data = await studentService.searchColleges(searchTerm);
      setResults(data);
    } catch (e) {
      console.error('Search failed', e);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    setSearchParams({ q: term });
    performSearch(term);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <SEO
        title={initialQuery ? `Search results for "${initialQuery}"` : 'Search Coaching Institutes & Courses'}
        description="Search coaching institutes, courses, locations and available admission information across India."
        robots="noindex, follow"
        url="https://coachingbuddy.co.in/search"
      />
      {/* Search Input Hero */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0d9488] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Academy Search</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Coaching Institutes in Your City
        </h1>

        <form onSubmit={handleSubmit} className="relative mt-4">
          <div className="relative flex items-center bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/90 p-1.5 sm:p-2.5 focus-within:ring-2 focus-within:ring-[#0d9488]/30 focus-within:border-[#0d9488]">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 ml-2.5 sm:ml-4 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search JEE, NEET, Academy Name, Area (e.g. Bavdhan, Kothrud)..."
              className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-600 mr-1 sm:mr-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold text-white gradient-teal hover:opacity-95 shadow-teal transition-all shrink-0 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Recent Searches Chips */}
        {recentSearches.length > 0 && (
          <div className="pt-2 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Recent:
            </span>
            {recentSearches.map((term, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectRecent(term)}
                className="px-2.5 sm:px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold transition-colors flex items-center gap-1 text-[11px] sm:text-xs cursor-pointer"
              >
                <span>{term}</span>
              </button>
            ))}
            <button
              onClick={clearRecentSearches}
              className="text-slate-400 hover:text-red-500 font-medium ml-1 flex items-center gap-1 p-1 cursor-pointer"
              title="Clear search history"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {hasSearched && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Search Results for <span className="text-[#0d9488]">"{query}"</span>
            </p>
            <span className="text-xs font-semibold text-slate-500">{results.length} Institutes</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Searching verified coaching centers...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">No Matching Institutes Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find institutes matching "{query}". Try checking for typos or searching for a broader term like
              "JEE", "NEET", "CET", or "Pune".
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => handleSelectRecent('JEE')}
                className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-[#0d9488] text-xs font-bold cursor-pointer"
              >
                Try "JEE"
              </button>
              <button
                onClick={() => handleSelectRecent('NEET')}
                className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-[#0d9488] text-xs font-bold cursor-pointer"
              >
                Try "NEET"
              </button>
              <button
                onClick={() => handleSelectRecent('Pune')}
                className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-[#0d9488] text-xs font-bold cursor-pointer"
              >
                Try "Pune"
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((inst) => (
              <InstituteCard key={inst.id} institute={inst} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSearchPage;
