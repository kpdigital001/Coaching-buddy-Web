import axios from 'axios';
import {
  BannerItem,
  StudentCategory,
  StudentInstitute,
  StudentOrder,
  SearchCollegeSuggestion,
} from '../types/student';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://coachingbuddy.co.in/api';
export const STUDENT_AUTH_TOKEN_KEY = 'COACHING_BUDDY_STUDENT_AUTH_TOKEN';
export const STUDENT_USER_STORAGE_KEY = 'COACHING_BUDDY_STUDENT_USER';
export const STUDENT_SAVED_STORAGE_KEY = 'COACHING_BUDDY_STUDENT_SAVED';
export const STUDENT_RECENT_SEARCHES_KEY = 'COACHING_BUDDY_STUDENT_RECENT_SEARCHES';

export const studentApi = axios.create({
  baseURL: SERVER_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

studentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STUDENT_AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export function getImageURI(imagePath: string | null | undefined): string {
  if (!imagePath || typeof imagePath !== 'string') {
    return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80';
  }

  const trimmedPath = imagePath.trim();
  if (!trimmedPath) {
    return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80';
  }

  if (/^https?:\/\//i.test(trimmedPath)) return trimmedPath;

  const cleanServerUrl = SERVER_URL.replace(/\/+$/, '').replace(/\/api$/i, '');
  const cleanImagePath = trimmedPath.replace(/^\/+/, '').replace(/^api\//i, '');

  return `${cleanServerUrl}/${cleanImagePath}`;
}

export function mapCollegeData(item: any): StudentInstitute {
  if (!item) {
    return {
      id: '',
      name: '',
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
  }

  const logoImages = item.images?.logo?.map((i: any) => (typeof i === 'string' ? i : i?.path)).filter(Boolean) || [];
  const galleryImages = item.images?.gallery?.map((i: any) => (typeof i === 'string' ? i : i?.path)).filter(Boolean) || [];
  const bannerImages = item.images?.banner?.map((i: any) => (typeof i === 'string' ? i : i?.path)).filter(Boolean) || [];
  const coverImages = item.images?.cover?.map((i: any) => (typeof i === 'string' ? i : i?.path)).filter(Boolean) || [];

  return {
    id: item.uid || item.id || '',
    name: item.name || '',
    amountPaid: item.amount_paid || item.amountPaid,
    ownerName: item.owner_name || item.ownerName || '',
    shortDescription: stripHtml(item.short_desc || item.shortDescription || ''),
    longDescription: stripHtml(item.long_desc || item.longDescription || ''),
    images: {
      logo: logoImages,
      gallery: galleryImages,
      banner: bannerImages,
      cover: coverImages,
    },
    address: {
      state: item.address?.state || '',
      city: item.address?.city || '',
      area: item.address?.area || '',
      nearBy: item.address?.near_by || item.address?.nearBy || '',
      pincode: item.address?.pincode || '',
    },
    comments:
      item.comments?.map((c: any) => ({
        id: c.uid || c.id || Math.random().toString(),
        rating: Number(c.rating) || 9,
        comment: stripHtml(c.comment || ''),
        reply: c.reply || null,
        createdAt: c.created_at || c.createdAt || 'Recent',
        userName: c.user_name || c.userName || 'Student',
        userId: c.user_id || c.userId || '',
      })) || [],
    categories:
      item.categories?.map((cat: any) => ({
        id: cat.uid || cat.id || '',
        name: cat.name || '',
      })) || [],
    details:
      item.details?.map((d: any) => ({
        type: d.type || 'phone',
        value: d.value || '',
      })) || [],
    courses:
      item.products?.map((p: any) => ({
        id: p.uid || p.id || '',
        name: p.name || '',
        price: p.price || '0',
        sellingPrice: p.selling_price || p.sellingPrice || p.price || '0',
        discount: p.discount || '0',
        shortDescription: stripHtml(p.short_desc || p.shortDescription || ''),
        images: p.images?.map((img: any) => (typeof img === 'string' ? img : img?.path)).filter(Boolean) || [],
        category: p.keywords?.[0]?.keyword || p.category || 'General',
      })) || [],
  };
}

// Student Live API Services
export const studentService = {
  // Auth
  async login(email: string) {
    const res = await studentApi.post('/user/sign-in', { email });
    return res.data;
  },

  async verifyOtp(otp: string, userId: string) {
    const res = await studentApi.post('/user/otp/verify', { otp, userId });
    return res.data;
  },

  async googleLogin(idToken: string) {
    const res = await studentApi.post('/user/google-login', { idToken, type: 'user' });
    return res.data;
  },

  async resendOtp(userId: string) {
    const res = await studentApi.post('/user/otp/resend', { userId });
    return res.data;
  },

  async completeProfile(data: any) {
    const res = await studentApi.post('/user/sign-up/', data);
    return res.data;
  },

  async getAuthUser() {
    const res = await studentApi.get('/user/auth');
    return res.data?.data;
  },

  async updateProfile(userId: string, data: any) {
    const res = await studentApi.put(`/user/update/${userId}`, data);
    return res.data;
  },

  async deleteAccount(userId: string) {
    const res = await studentApi.delete(`/user/delete/${userId}`);
    return res.data;
  },

  // Banners & Categories
  async getMainBanners(): Promise<BannerItem[]> {
    try {
      const res = await studentApi.get('/banner/by-status-type');
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data.map((b: any) => ({
          id: b.id || b.uid,
          title: b.title || '',
          url: getImageURI(b.url || b.image_path),
          link: b.link || '',
        }));
      }
      return [];
    } catch (e) {
      console.error('Failed to load main banners', e);
      return [];
    }
  },

  async getParentCategories(): Promise<StudentCategory[]> {
    try {
      const res = await studentApi.get('/category/parents');
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data.map((c: any) => ({
          id: c.uid || String(c.id),
          name: c.name,
          parentId: c.parent_id,
          imagePath: getImageURI(c.icon_img_path),
          showTag: c.new_tag || 0,
          tag: c.new_tag_text || '',
        }));
      }
      return [];
    } catch (e) {
      console.error('Failed to load parent categories', e);
      return [];
    }
  },

  async getSubCategoriesOrColleges(parentCategoryId: string) {
    try {
      const res = await studentApi.get(`/category/sub-categories-or-stores/${parentCategoryId}`);
      const data = res.data?.data;
      if (data) {
        const categories =
          data.categories?.map((c: any) => ({
            id: c.uid || String(c.id),
            name: c.name,
            parentId: c.parent_id,
            imagePath: getImageURI(c.icon_img_path),
            showTag: c.new_tag || 0,
            tag: c.new_tag_text || '',
          })) || [];

        const colleges = data.colleges?.map(mapCollegeData) || [];
        return { categories, colleges };
      }
    } catch (e) {
      console.error('Failed to load sub categories or colleges', e);
    }
    return { categories: [], colleges: [] };
  },

  // Institutes & Colleges
  async getInstitute(id: string): Promise<StudentInstitute | null> {
    try {
      const res = await studentApi.get(`/store/${id}`);
      if (res.data?.data) {
        return mapCollegeData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to get institute', e);
    }
    return null;
  },

  async getCollegesByCategoryId(categoryId?: string, isPremium: boolean = false): Promise<StudentInstitute[]> {
    try {
      let url = '/store?status=1';
      if (categoryId && categoryId !== 'all') {
        url += `&cid=${categoryId}`;
      }
      if (isPremium) {
        url += '&is_premium=true';
      }
      const res = await studentApi.get(url);
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data.map(mapCollegeData);
      }
    } catch (e) {
      console.error('Failed to load colleges by category', e);
    }
    return [];
  },

  async searchColleges(query: string): Promise<StudentInstitute[]> {
    try {
      const res = await studentApi.get(`/store/search?q=${encodeURIComponent(query)}`);
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data.map(mapCollegeData);
      }
    } catch (e) {
      console.error('Failed to search colleges', e);
    }
    return [];
  },

  async getSearchSuggestions(query: string): Promise<SearchCollegeSuggestion[]> {
    try {
      const res = await studentApi.get(`/store/search/suggestions?q=${encodeURIComponent(query)}`);
      if (res.data?.data) {
        return res.data.data;
      }
    } catch (e) {
      console.error('Failed to get search suggestions', e);
    }
    return [];
  },

  async saveCollege(collegeId: string) {
    try {
      const res = await studentApi.put(`/store/save/${collegeId}`);
      return res.data;
    } catch (e) {
      return { status: true, message: 'Saved successfully' };
    }
  },

  async syncSavedColleges(collegeIds: string[]): Promise<StudentInstitute[]> {
    if (!collegeIds || collegeIds.length === 0) return [];
    try {
      const res = await studentApi.patch('/store/sync-saved', { storeIds: collegeIds });
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data.map(mapCollegeData);
      }
    } catch (e) {
      console.error('Failed to sync saved colleges', e);
    }
    return [];
  },

  async getEvaluationList() {
    try {
      const res = await studentApi.get('/evaluation/list');
      return res.data?.data || [];
    } catch (e) {
      return [];
    }
  },

  // Reviews & Comments
  async addComment(data: { collegeId: string; comment: string; rating: number; parameterRatings?: any[] }) {
    const res = await studentApi.post(`/store/comment/add/${data.collegeId}`, {
      rating: data.rating,
      comment: data.comment,
      parameterRatings: data.parameterRatings,
    });
    return res.data;
  },

  // Enquiries
  async addEnquiry(data: { storeId: string; userId: string; name: string; phone?: string; message: string }) {
    const res = await studentApi.post('/user/enquiry/add', data);
    return res.data;
  },

  // Orders / Bookings
  async placeOrder(courseId: string) {
    const res = await studentApi.post('/user/order/add', { productId: courseId });
    return res.data;
  },

  async getUserOrders(userId: string): Promise<StudentOrder[]> {
    try {
      if (userId && userId !== 'guest_user') {
        const res = await studentApi.get(`/user/orders/${userId}`);
        const data = res.data?.data;
        if (Array.isArray(data)) {
          return data;
        }
        if (data?.orders && Array.isArray(data.orders)) {
          return data.orders;
        }
        if (Array.isArray(res.data)) {
          return res.data;
        }
      }
    } catch (e) {
      console.error('Failed to load user orders', e);
    }

    // Local cached bookings fallback
    try {
      const local = localStorage.getItem('COACHING_BUDDY_STUDENT_ORDERS');
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {}

    return [];
  },

  async cancelOrder(orderId: string) {
    const res = await studentApi.put(`/user/order/${orderId}/status`, { status: 'cancelled' });
    return res.data;
  },

  // Support
  async createSupportRequest(data: { email: string; subject: string; message: string }) {
    const res = await studentApi.post('/support/create', data);
    return res.data;
  },
};
