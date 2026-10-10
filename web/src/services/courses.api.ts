import api from './api';
import { ApiResponse } from '../types';

export async function getCourses(storeId: string) {
  const res = await api.get<ApiResponse<any[]>>(`/product/list/${storeId}`);
  return res.data;
}

export async function courseAdd(data: any) {
  const res = await api.post('/courses/add', data);
  return res.data;
}

export async function courseEdit(data: any, courseUid: string) {
  const res = await api.put(`/courses/update/${courseUid}`, data);
  return res.data;
}
