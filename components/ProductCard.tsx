
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  lang: 'ar' | 'en';
  onAddToCart: (p: Product) => void;
  onPreview: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, lang, onAddToCart, onPreview }) => {
  const isAr = lang === 'ar';

  return (
    <div className="relative group bg-[#160a25] rounded-xl neon-border overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      {/* Top Header Section */}
      <div className="flex justify-between items-center px-3 py-2 text-[10px] font-bold">
        <span className="text-slate-400">NO.{product.id}</span>
        <span className="bg-orange-600 text-white px-2 py-0.5 rounded-sm">
          {isAr ? 'أحدث هدية' : 'New Gift'}
        </span>
      </div>

      {/* Image Preview Section */}
      <div className="relative aspect-square px-6 py-4 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent pointer-events-none" />
        <img 
          src={product.previewUrl} 
          alt={product.name}
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(168,85,241,0.3)]"
        />
      </div>

      {/* Pricing and Play Action */}
      <div className="px-4 py-4 flex flex-col items-center text-center gap-2">
        <div className="text-slate-200 font-bold text-sm">
          $ {product.price.toFixed(2)}
        </div>
        
        <button 
          onClick={() => onPreview(product)}
          className="play-button text-white px-8 py-1 rounded-full text-xs font-black tracking-widest uppercase hover:brightness-110 transition-all active:scale-95"
        >
          {isAr ? 'تشغيل' : 'PLAY'}
        </button>

        <div className="mt-2">
          <h3 className="text-white text-xs font-bold leading-tight line-clamp-1">
            {isAr ? product.nameAr : product.name}
          </h3>
          {product.brand && (
            <p className="text-slate-400 text-[10px] mt-0.5">{product.brand}</p>
          )}
        </div>
      </div>

      {/* Hover Overlays */}
      <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
      
      {/* Add to Cart hidden utility button */}
      <button 
        onClick={() => onAddToCart(product)}
        className="absolute bottom-4 right-4 bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default ProductCard;
