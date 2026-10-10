import api from './api';
import { ApiResponse, Keyword } from '../types';

export async function getAllActiveKeywords() {
  const res = await api.get<ApiResponse<Keyword[]>>('/keywords/active-keyword');
  return res.data;
}
