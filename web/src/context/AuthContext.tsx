import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserType, StoreType } from '../types';
import { setStoredAuthToken, getStoredAuthToken, removeStoredAuthToken } from '../services/api';

interface AuthContextType {
  user: UserType | null;
  store: StoreType | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isVerified: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  login: (userData: UserType, token?: string) => void;
  setStoreData: (storeData: StoreType | null) => void;
  updateStoreStatusState: (newStatus: number) => void;
  completeOnboarding: (storeData: StoreType) => void;
  setVerifiedState: (verified: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(() => {
    const cached = localStorage.getItem('COACHING_BUDDY_MERCHANT_USER');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [store, setStore] = useState<StoreType | null>(() => {
    const cached = localStorage.getItem('COACHING_BUDDY_MERCHANT_STORE');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(getStoredAuthToken());
  });

  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('COACHING_BUDDY_MERCHANT_STORE'));
  });

  const [isVerified, setIsVerified] = useState<boolean>(() => {
    const cachedStore = localStorage.getItem('COACHING_BUDDY_MERCHANT_STORE');
    if (cachedStore) {
      try {
        const parsed = JSON.parse(cachedStore);
        return parsed.status === 1;
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = getStoredAuthToken();
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = useCallback((userData: UserType, token?: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('COACHING_BUDDY_MERCHANT_USER', JSON.stringify(userData));
    if (token) {
      setStoredAuthToken(token);
    }
  }, []);

  const setStoreData = useCallback((storeData: StoreType | null) => {
    setStore(storeData);
    if (storeData) {
      localStorage.setItem('COACHING_BUDDY_MERCHANT_STORE', JSON.stringify(storeData));
      setIsOnboardingComplete(true);
      setIsVerified(storeData.status === 1);
    } else {
      localStorage.removeItem('COACHING_BUDDY_MERCHANT_STORE');
      setIsOnboardingComplete(false);
      setIsVerified(false);
    }
  }, []);

  const updateStoreStatusState = useCallback((newStatus: number) => {
    setStore((prev) => {
      if (!prev) return null;
      const updated = { ...prev, status: newStatus };
      localStorage.setItem('COACHING_BUDDY_MERCHANT_STORE', JSON.stringify(updated));
      setIsVerified(newStatus === 1);
      return updated;
    });
  }, []);

  const completeOnboarding = useCallback((storeData: StoreType) => {
    setStore(storeData);
    localStorage.setItem('COACHING_BUDDY_MERCHANT_STORE', JSON.stringify(storeData));
    setIsOnboardingComplete(true);
    setIsVerified(storeData.status === 1);
  }, []);

  const setVerifiedState = useCallback((verified: boolean) => {
    setIsVerified(verified);
  }, []);

  const logout = useCallback(() => {
    removeStoredAuthToken();
    localStorage.removeItem('COACHING_BUDDY_MERCHANT_USER');
    localStorage.removeItem('COACHING_BUDDY_MERCHANT_STORE');
    setUser(null);
    setStore(null);
    setIsAuthenticated(false);
    setIsOnboardingComplete(false);
    setIsVerified(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        isAuthenticated,
        isOnboardingComplete,
        isVerified,
        isLoading,
        setIsLoading,
        login,
        setStoreData,
        updateStoreStatusState,
        completeOnboarding,
        setVerifiedState,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
