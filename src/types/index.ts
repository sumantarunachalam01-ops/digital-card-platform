export interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon?: string; // 'globe' | 'github' | 'telegram' | 'discord' | 'tiktok' | 'behance' | 'medium' | 'calendar' | 'custom'
}

export interface ClientData {
  id?: string;
  slug: string;
  fullName: string;
  designation: string;
  companyName: string;
  bio?: string | null;
  profilePhoto?: string | null;
  companyLogo?: string | null;
  coverPhotos?: string | string[] | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  twitter?: string | null;
  companyDescription?: string | null;
  businessCategory?: string | null;
  customLinks?: string | CustomLink[] | null;
  password?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date | string;
  updatedAt?: Date | string;
  analytics?: {
    id: string;
    viewedAt: Date | string;
    deviceType: string;
    referrer?: string | null;
  }[];
  _count?: {
    analytics: number;
  };
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
  clientId?: string;
  slug?: string;
}

export interface ClientStats {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}
