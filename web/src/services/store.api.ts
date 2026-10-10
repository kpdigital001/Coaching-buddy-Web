import api from './api';
import { ApiResponse } from '../types';

export async function getStoreLeads(storeId: string) {
  const res = await api.get<
    ApiResponse<
      {
        type: 'whatsapp' | 'phone' | 'share';
        leads: { total_leads: number }[];
      }[]
    >
  >(`/store/leads?store_id=${storeId}&type=whatsapp,share,phone`);
  return res.data;
}

export interface UpdateStoreDataType {
  storeName: string;
  ownerName: string;
  storePhone: string;
  storeWhatsapp: string;
  storeArea: string;
  storeCity: string;
  storeNearBy: string;
  storePin: string;
  storeState: string;
}

export async function updateStore(storeId: string, data: UpdateStoreDataType) {
  const res = await api.put<ApiResponse<null>>(`/store/update/${storeId}`, data);
  return res.data;
}

export async function updateStoreStatus(storeId: string) {
  const res = await api.put<ApiResponse<null>>(`/store/update/status/${storeId}`);
  return res.data;
}
