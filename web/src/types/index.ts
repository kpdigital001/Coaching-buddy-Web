export interface UserType {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
}

export interface StoreAddress {
  area: string;
  city: string;
  state: string;
  nearBy?: string;
  pincode: string;
  street?: string;
  landmark?: string;
  country?: string;
}

export interface StoreContact {
  phone: string;
  whatsapp: string;
  email?: string;
}

export interface StoreType {
  id: string;
  name: string;
  status: number; // 1 = online/active, 0 = offline/inactive
  address: StoreAddress;
  contact: StoreContact;
  banner: string[];
  gallery?: string[];
  logo?: string;
  cover?: string;
  certificate?: string;
  shortDescription?: string;
  longDescription?: string;
}

export interface CourseType {
  id: string;
  courseName: string;
  keywordId: string;
  productType: string;
  mrp: string;
  discount: string;
  sellingPrice: string;
  description: string;
  isEnabled: boolean;
  status?: number;
}

export type BookingStatus = 'initiated' | 'confirmed' | 'rejected' | 'cancelled';

export interface Booking {
  id: string;
  orderId?: string;
  studentName: string;
  studentPhone: string;
  studentEmail?: string;
  courseName: string;
  coursePrice: string;
  bookingDate: string;
  status: BookingStatus;
  notes?: string;
}

export interface Keyword {
  uid: string;
  name: string;
  label: string;
  value: string;
}

export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

export * from './student';
