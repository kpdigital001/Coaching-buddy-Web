import api from './api';
import { ApiResponse, UserType, StoreType } from '../types';

export async function auth() {
  const res = await api.get<
    ApiResponse<{
      user: UserType;
      store?: StoreType;
      isVerified: boolean;
      isOnboardingComplete: boolean;
    }>
  >('/user/auth');
  return res.data;
}

export async function login(email: string) {
  const res = await api.post<
    ApiResponse<{
      userId: string;
    }>
  >('/user/sign-in', { email, type: 'vendor' });
  return res.data;
}

export async function verifyOTP(otp: string, userId: string) {
  const res = await api.post<
    ApiResponse<{
      isNew: boolean;
      user: UserType;
      store?: StoreType;
      token?: string;
      isVerified: boolean;
      isOnboardingComplete: boolean;
    }>
  >('/user/otp/verify', { otp, userId });
  return res.data;
}

export async function addVendorStore(userId: string, data: any) {
  const res = await api.post(`/user/vendor/${userId}/stores`, data);
  return res.data;
}
