
import { Category } from './types';

// Categories are structural UI elements, so we keep them.
export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All', nameAr: 'الكل', icon: '🛍️' },
  { id: 'classic', name: 'Classic', nameAr: 'كلاسيك', icon: '🎩' },
  { id: 'luxury', name: 'Luxury', nameAr: 'فاخرة', icon: '💎' },
  { id: 'events', name: 'Events', nameAr: 'مناسبات', icon: '🎉' },
  { id: 'emojis', name: 'Emojis', nameAr: 'إيموجي', icon: '😍' },
  { id: 'decor', name: 'Decoration', nameAr: 'تزيين', icon: '✨' },
];

// All products and banners will now come from Firestore.
