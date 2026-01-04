
export type Format = 'SVGA' | 'VAP' | 'MP4' | 'JSON' | 'PAG';

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  price: number;
  previewUrl: string;
  videoUrl?: string;
  videoSourceType?: 'file' | 'link';
  formats: Format[];
  tags: string[];
  level: 'Classic' | 'Premium' | 'Luxury' | 'Elite';
  brand?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerWhatsApp: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  status: 'active' | 'blocked' | 'frozen';
  role: 'user' | 'admin';
  createdAt: string;
}
