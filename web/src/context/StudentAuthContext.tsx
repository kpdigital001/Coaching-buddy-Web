import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { StudentUser, StudentInstitute } from '../types/student';
import {
  studentService,
  STUDENT_AUTH_TOKEN_KEY,
  STUDENT_USER_STORAGE_KEY,
  STUDENT_SAVED_STORAGE_KEY,
  STUDENT_RECENT_SEARCHES_KEY,
} from '../services/studentApi';

export const STUDENT_SAVED_INSTITUTES_KEY = 'COACHING_BUDDY_STUDENT_SAVED_ITEMS';

interface StudentAuthContextType {
  student: StudentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  savedInstitutes: StudentInstitute[];
  savedInstituteIds: string[];
  recentSearches: string[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  login: (user: StudentUser, token?: string) => void;
  logout: () => void;
  updateProfileState: (data: Partial<StudentUser>) => void;
  toggleSaveInstitute: (institute: StudentInstitute | string) => boolean;
  isInstituteSaved: (instituteId: string) => boolean;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  refreshSavedInstitutes: () => Promise<void>;
  setSavedInstitutesDirectly: (items: StudentInstitute[]) => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export const StudentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentUser | null>(() => {
    const token = localStorage.getItem(STUDENT_AUTH_TOKEN_KEY);
    const cached = localStorage.getItem(STUDENT_USER_STORAGE_KEY);
    if (token && cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(STUDENT_AUTH_TOKEN_KEY));
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Stored saved institute objects
  const [savedInstitutes, setSavedInstitutes] = useState<StudentInstitute[]>(() => {
    const cachedItems = localStorage.getItem(STUDENT_SAVED_INSTITUTES_KEY);
    if (cachedItems) {
      try {
        const parsed = JSON.parse(cachedItems);
        if (Array.isArray(parsed)) {
          return parsed.filter((i) => i && i.id && i.name && !i.id.startsWith('store_10'));
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Stored saved institute IDs - strictly derived from valid saved institutes
  const [savedInstituteIds, setSavedInstituteIds] = useState<string[]>(() => {
    const cachedItems = localStorage.getItem(STUDENT_SAVED_INSTITUTES_KEY);
    if (cachedItems) {
      try {
        const parsed: StudentInstitute[] = JSON.parse(cachedItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((i) => i && i.id && i.name && !i.id.startsWith('store_10'))
            .map((i) => i.id);
        }
      } catch (e) {}
    }
    return [];
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const cached = localStorage.getItem(STUDENT_RECENT_SEARCHES_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync saved institutes with backend
  const refreshSavedInstitutes = useCallback(async () => {
    const token = localStorage.getItem(STUDENT_AUTH_TOKEN_KEY);
    if (!token) return;

    try {
      const cached = localStorage.getItem(STUDENT_SAVED_INSTITUTES_KEY);
      let localItems: StudentInstitute[] = [];
      if (cached) {
        try {
          localItems = JSON.parse(cached).filter((i: any) => i && i.id && !i.id.startsWith('store_10'));
        } catch (e) {}
      }

      const currentIds = localItems.map((i) => i.id).filter(Boolean);
      if (currentIds.length === 0) {
        return;
      }

      const res = await studentService.syncSavedColleges(currentIds);
      if (res && Array.isArray(res) && res.length > 0) {
        setSavedInstitutes(res);
        const newIds = res.map((i) => i.id).filter(Boolean);
        setSavedInstituteIds(newIds);
        localStorage.setItem(STUDENT_SAVED_INSTITUTES_KEY, JSON.stringify(res));
        localStorage.setItem(STUDENT_SAVED_STORAGE_KEY, JSON.stringify(newIds));
      } else if (currentIds.length > 0) {
        // Fetch each individually if sync-saved returned empty
        const fetched = await Promise.all(
          currentIds.map((id: string) => studentService.getInstitute(id))
        );
        const valid = fetched.filter((i): i is StudentInstitute => Boolean(i && i.id && i.name));
        if (valid.length > 0) {
          setSavedInstitutes(valid);
          const validIds = valid.map((i) => i.id);
          setSavedInstituteIds(validIds);
          localStorage.setItem(STUDENT_SAVED_INSTITUTES_KEY, JSON.stringify(valid));
          localStorage.setItem(STUDENT_SAVED_STORAGE_KEY, JSON.stringify(validIds));
        }
      }
    } catch (e) {
      console.error('Error syncing saved institutes', e);
    }
  }, []);

  // Verify auth session on initial load and sync saved list
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem(STUDENT_AUTH_TOKEN_KEY);
      if (token) {
        try {
          const authUser = await studentService.getAuthUser();
          if (authUser) {
            setStudent(authUser);
            setIsAuthenticated(true);
            localStorage.setItem(STUDENT_USER_STORAGE_KEY, JSON.stringify(authUser));
            await refreshSavedInstitutes();
          } else {
            localStorage.removeItem(STUDENT_AUTH_TOKEN_KEY);
            localStorage.removeItem(STUDENT_USER_STORAGE_KEY);
            setStudent(null);
            setIsAuthenticated(false);
          }
        } catch (e) {
          localStorage.removeItem(STUDENT_AUTH_TOKEN_KEY);
          localStorage.removeItem(STUDENT_USER_STORAGE_KEY);
          setStudent(null);
          setIsAuthenticated(false);
        }
      } else {
        setStudent(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, [refreshSavedInstitutes]);

  useEffect(() => {
    localStorage.setItem(STUDENT_SAVED_STORAGE_KEY, JSON.stringify(savedInstituteIds));
  }, [savedInstituteIds]);

  useEffect(() => {
    localStorage.setItem(STUDENT_SAVED_INSTITUTES_KEY, JSON.stringify(savedInstitutes));
  }, [savedInstitutes]);

  useEffect(() => {
    localStorage.setItem(STUDENT_RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const login = useCallback(
    (user: StudentUser, token?: string) => {
      setStudent(user);
      setIsAuthenticated(true);
      localStorage.setItem(STUDENT_USER_STORAGE_KEY, JSON.stringify(user));
      if (token) {
        localStorage.setItem(STUDENT_AUTH_TOKEN_KEY, token);
      }
      setTimeout(() => {
        refreshSavedInstitutes();
      }, 300);
    },
    [refreshSavedInstitutes]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STUDENT_AUTH_TOKEN_KEY);
    localStorage.removeItem(STUDENT_USER_STORAGE_KEY);
    setStudent(null);
    setIsAuthenticated(false);
  }, []);

  const updateProfileState = useCallback((data: Partial<StudentUser>) => {
    setStudent((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem(STUDENT_USER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setSavedInstitutesDirectly = useCallback((items: StudentInstitute[]) => {
    setSavedInstitutes(items);
    const ids = items.map((i) => i.id).filter(Boolean);
    setSavedInstituteIds(ids);
    localStorage.setItem(STUDENT_SAVED_INSTITUTES_KEY, JSON.stringify(items));
    localStorage.setItem(STUDENT_SAVED_STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const toggleSaveInstitute = useCallback(
    (target: StudentInstitute | string): boolean => {
      const instituteId = typeof target === 'string' ? target : target.id;
      let nowSaved = false;

      setSavedInstitutes((prev) => {
        const exists = prev.some((i) => i.id === instituteId);
        let next: StudentInstitute[];
        if (exists) {
          nowSaved = false;
          next = prev.filter((i) => i.id !== instituteId);
        } else {
          nowSaved = true;
          if (typeof target !== 'string') {
            next = [target, ...prev];
          } else {
            // Placeholder object until fetched
            const placeholder: StudentInstitute = {
              id: target,
              name: 'Saved Institute',
              ownerName: '',
              shortDescription: '',
              longDescription: '',
              images: { logo: [], gallery: [], banner: [], cover: [] },
              address: { state: '', city: '', area: '', nearBy: '', pincode: '' },
              comments: [],
              categories: [],
              details: [],
              courses: [],
            };
            next = [placeholder, ...prev];
          }
        }

        const nextIds = next.map((i) => i.id);
        setSavedInstituteIds(nextIds);
        localStorage.setItem(STUDENT_SAVED_STORAGE_KEY, JSON.stringify(nextIds));
        localStorage.setItem(STUDENT_SAVED_INSTITUTES_KEY, JSON.stringify(next));
        return next;
      });

      // Call backend save API
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          await studentService.saveCollege(instituteId);
          const currentIds = JSON.parse(localStorage.getItem(STUDENT_SAVED_STORAGE_KEY) || '[]');
          await studentService.syncSavedColleges(currentIds);
        } catch (e) {
          console.error('Error saving institute to server', e);
        }
      }, 500);

      return nowSaved;
    },
    []
  );

  const isInstituteSaved = useCallback(
    (instituteId: string): boolean => {
      return savedInstituteIds.includes(instituteId);
    },
    [savedInstituteIds]
  );

  const addRecentSearch = useCallback((query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      return [clean, ...filtered].slice(0, 8);
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(STUDENT_RECENT_SEARCHES_KEY);
  }, []);

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        isAuthenticated,
        isLoading,
        savedInstitutes,
        savedInstituteIds,
        recentSearches,
        selectedCity,
        setSelectedCity,
        login,
        logout,
        updateProfileState,
        toggleSaveInstitute,
        isInstituteSaved,
        addRecentSearch,
        clearRecentSearches,
        refreshSavedInstitutes,
        setSavedInstitutesDirectly,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};

export default StudentAuthProvider;
