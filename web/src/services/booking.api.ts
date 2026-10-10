import api from './api';
import { ApiResponse, Booking, BookingStatus } from '../types';

export async function getAllBookingRequest(storeId: string) {
  const res = await api.get<ApiResponse<Booking[]>>(`/orders/list?storeId=${storeId}`);
  return res.data;
}

export async function bookingAcceptReject(status: BookingStatus, id: string) {
  const res = await api.put(`/orders/update/status/${id}`, { status });
  return res.data;
}
