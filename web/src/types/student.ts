export type AvatarName = 'EduBee' | 'Quizzy' | 'SmartySpark' | 'StudyBuddy';

export interface StudentUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  area?: string;
  state?: string;
  city?: string;
  pincode?: string;
  landmark?: string;
  avatarName?: AvatarName | string;
  gender?: string | null;
}

export interface BannerItem {
  id: string;
  title: string;
  url: string;
  link: string;
}

export interface StudentCategory {
  id: string;
  name: string;
  parentId?: string;
  imagePath: string;
  showTag: number;
  tag?: string;
}

export interface StudentComment {
  id: string;
  rating: number;
  comment: string;
  reply?: string | null;
  createdAt: string;
  userName: string;
  userId: string;
}

export interface StudentCourse {
  id: string;
  name: string;
  price: string;
  sellingPrice: string;
  discount: string;
  shortDescription: string;
  images: string[];
  category: string;
}

export interface StudentInstitute {
  id: string;
  name: string;
  ownerName: string;
  amountPaid?: string;
  shortDescription: string;
  longDescription: string;
  images: {
    logo: string[];
    gallery: string[];
    banner: string[];
    cover: string[];
  };
  address: {
    state: string;
    city: string;
    area: string;
    nearBy: string;
    pincode: string;
  };
  comments?: StudentComment[];
  categories: {
    id: string;
    name: string;
  }[];
  details: {
    type: 'whatsapp' | 'phone';
    value: string;
  }[];
  courses?: StudentCourse[];
  isSaved?: boolean;
}

export interface StudentOrder {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | string;
  createdAt?: string;
  product: {
    name: string;
    price: string;
    sellingPrice: string;
    discount: string;
    images: string[];
  };
  store: {
    name: string;
    address: {
      state: string;
      city: string;
      area: string;
      nearBy: string;
      pincode: string;
    };
    comments?: {
      id: string;
      rating: number;
    }[];
  };
}

export interface SearchCollegeSuggestion {
  uid: string;
  name: string;
  city: string;
  cover_images?: string[];
}

export interface AdmissionEnquiryData {
  storeId: string;
  userId: string;
  name: string;
  phone?: string;
  message: string;
}

export interface EvaluationParameter {
  uid: string;
  parameter_name: string;
  status: number;
  created_at: string;
}
