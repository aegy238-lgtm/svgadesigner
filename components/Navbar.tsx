
import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  siteName: string;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, onOpenMenu, lang, setLang, siteName }) => {
  const isAr = lang === 'ar';
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-[#0f0518]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left Section: Menu & Logo */}
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={onOpenMenu} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Menu className="h-6 w-6 cursor-pointer text-indigo-400" />
            </button>
            <div className="text-xl md:text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent cursor-default whitespace-nowrap">
              {siteName}
            </div>
            <div className="hidden lg:flex items-center space-x-8 mr-10 space-x-reverse">
              <a href="#" className="text-xs font-black uppercase tracking-widest text-white hover:text-indigo-500 transition-colors">
                {isAr ? 'الرئيسية' : 'Home'}
              </a>
              <a href="#products" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors">
                {isAr ? 'المتجر' : 'Shop'}
              </a>
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2 md:gap-6">
            
            {/* Search - Desktop always visible, Mobile toggle */}
            <div className={`${isSearchMobileOpen ? 'fixed inset-x-0 top-0 h-20 bg-[#0f0518] px-4 flex items-center z-[110]' : 'relative hidden sm:block'}`}>
              <div className="relative w-full">
                <input 
                  type="text" 
                  autoFocus={isSearchMobileOpen}
                  placeholder={isAr ? 'بحث...' : 'Search...'} 
                  className="bg-white/5 border border-white/10 rounded-full px-5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-48 text-white pr-10"
                />
                <Search className={`absolute ${isAr ? 'left-4' : 'right-4'} top-2 h-4 w-4 text-slate-500`} />
              </div>
              {isSearchMobileOpen && (
                <button onClick={() => setIsSearchMobileOpen(false)} className="ml-4 p-2 text-slate-400">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Search Toggle for Mobile */}
            <button 
              onClick={() => setIsSearchMobileOpen(true)}
              className="sm:hidden p-2 text-slate-400 hover:text-white"
            >
              <Search size={22} />
            </button>

            <button 
              onClick={() => setLang(isAr ? 'en' : 'ar')}
              className="text-[10px] font-black bg-white/5 px-2 md:px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors uppercase tracking-widest hidden xs:block"
            >
              {isAr ? 'EN' : 'AR'}
            </button>

            <button onClick={onOpenCart} className="relative p-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-full transition-all group">
              <ShoppingBag className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#0f0518]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
