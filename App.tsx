
import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import AdminDashboard from './components/Admin/AdminDashboard';
import AuthModal from './components/Auth/AuthModal';
import ProfileCenter from './components/Profile/ProfileCenter';
import { Product, CartItem, Order, UserProfile, Category } from './types';
import { db, collections, onSnapshot, doc, setDoc, auth, getDoc } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  ShoppingCart, X, Plus, Minus, MessageCircle, ShoppingBag, 
  ShieldCheck, User, Phone, Globe, Loader2, Package, CheckCircle, Clock, Home, Info, LogIn, LayoutDashboard
} from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<{id: string, url: string, link?: string}[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [storeWhatsApp, setStoreWhatsApp] = useState<string>('');
  const [siteName, setSiteName] = useState<string>('GoTher');
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth & Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserOrders, setShowUserOrders] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', whatsapp: '' });
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const ADMIN_EMAIL = 'admin@gother.com';
  const isAr = lang === 'ar';

  const isVideo = (url: string) => {
    return url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.webm');
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const profileData = userSnap.data() as UserProfile;
          if (profileData.status === 'blocked') {
            await auth.signOut();
            setCurrentUser(null);
            alert(isAr ? 'هذا الحساب محظور' : 'This account is blocked');
          } else {
            setCurrentUser(profileData);
            setCustomerInfo(prev => ({ ...prev, name: profileData.displayName }));
          }
        }
      } else {
        setCurrentUser(null);
        setIsAdminMode(false);
      }
    });

    let productsLoaded = false;
    let ordersLoaded = false;
    let bannersLoaded = false;
    let categoriesLoaded = false;

    const checkLoading = () => {
      if (productsLoaded && ordersLoaded && bannersLoaded && categoriesLoaded) {
        setIsLoading(false);
      }
    };

    const unsubProducts = onSnapshot(collections.products, (snapshot) => {
      const prodsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prodsData);
      productsLoaded = true;
      checkLoading();
    });

    const unsubCategories = onSnapshot(collections.categories, (snapshot) => {
      const catsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(catsData);
      categoriesLoaded = true;
      checkLoading();
    });

    const unsubOrders = onSnapshot(collections.orders, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      ordersLoaded = true;
      checkLoading();
    });

    const unsubBanners = onSnapshot(collections.banners, (snapshot) => {
      const bannersData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        url: doc.data().url,
        link: doc.data().link
      }));
      setBanners(bannersData);
      bannersLoaded = true;
      checkLoading();
    });

    const unsubConfig = onSnapshot(doc(db, "settings", "store_config"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStoreWhatsApp(data.whatsapp || '');
        setSiteName(data.siteName || 'GoTher');
        document.title = `${data.siteName || 'GoTher'} – Live Animated Gifts`;
      }
    });

    return () => {
      unsubAuth(); unsubProducts(); unsubCategories(); unsubOrders(); unsubBanners(); unsubConfig();
    };
  }, [isAr]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const uiCategories = useMemo(() => [
    { id: 'all', name: 'All', nameAr: 'الكل', icon: '🛍️' },
    ...categories
  ], [categories]);

  const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('gother_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const myPurchases = useMemo(() => {
    return orders.filter(o => myOrderIds.includes(o.id));
  }, [orders, myOrderIds]);

  const addToCart = (product: Product) => {
    if (!currentUser) { setIsAuthModalOpen(true); return; }
    if (currentUser.status === 'frozen') {
      alert(isAr ? 'حسابك مجمد حالياً' : 'Account frozen');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = async (method: 'site' | 'whatsapp') => {
    if (!currentUser) { setIsAuthModalOpen(true); return; }
    if (!customerInfo.name || !customerInfo.whatsapp) {
      alert(isAr ? 'يرجى ملء جميع البيانات' : 'Please fill all details');
      return;
    }

    const orderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      customerName: customerInfo.name,
      customerWhatsApp: customerInfo.whatsapp,
      items: cart,
      total: cartTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: method === 'whatsapp' ? 'Ordered via WhatsApp' : 'Ordered via Site'
    };

    try {
      await setDoc(doc(db, "orders", orderId), newOrder);
      const updatedOrderIds = [...myOrderIds, orderId];
      setMyOrderIds(updatedOrderIds);
      localStorage.setItem('gother_orders', JSON.stringify(updatedOrderIds));

      if (method === 'whatsapp') {
        const text = isAr 
          ? `طلب جديد من ${siteName}!\nالاسم: ${customerInfo.name}\nرقم الطلب: ${newOrder.id}\nالمنتجات:\n${cart.map(i => `- ${i.nameAr} (عدد ${i.quantity})`).join('\n')}\nالإجمالي: $${cartTotal.toFixed(2)}`
          : `New Order from ${siteName}!\nName: ${customerInfo.name}\nOrder ID: ${newOrder.id}\nItems:\n${cart.map(i => `- ${i.name} (Qty: ${i.quantity})`).join('\n')}\nTotal: $${cartTotal.toFixed(2)}`;
        const waNumber = storeWhatsApp.replace(/\D/g,'') || '201000000000';
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`);
      }
      
      setCart([]); setShowCheckoutForm(false); setIsCartOpen(false);
      alert(isAr ? 'تم استلام طلبك بنجاح! طلبك الآن قيد المراجعة.' : 'Order received! Your order is now under review.');
    } catch (err) {
      alert(isAr ? 'خطأ في إرسال الطلب' : 'Error placing order');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0518] flex flex-col items-center justify-center text-white">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-bold tracking-widest uppercase animate-pulse">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    );
  }

  const isUserAdmin = currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const getStatusInfo = (status: Order['status']) => {
    switch(status) {
      case 'completed': return {
        label: isAr ? 'تم التأكيد' : 'Confirmed',
        color: 'text-green-400 bg-green-400/10',
        icon: <CheckCircle size={14} className="text-green-400" />
      };
      case 'cancelled': return {
        label: isAr ? 'ملغى' : 'Cancelled',
        color: 'text-red-400 bg-red-400/10',
        icon: <X size={14} className="text-red-400" />
      };
      default: return {
        label: isAr ? 'قيد المراجعة' : 'Under Review',
        color: 'text-orange-400 bg-orange-400/10',
        icon: <Clock size={14} className="text-orange-400" />
      };
    }
  };

  return (
    <div className={`min-h-screen bg-[#0f0518] ${isAr ? 'rtl' : 'ltr'}`}>
      
      {isAdminMode && isUserAdmin && (
        <AdminDashboard 
          products={products} orders={orders} bannerUrl={banners[0]?.url || ''} banners={banners}
          storeWhatsApp={storeWhatsApp} siteName={siteName} onProductsUpdate={() => {}} onOrdersUpdate={() => {}}
          onUpdateBanner={() => {}} onExit={() => setIsAdminMode(false)} isAr={isAr}
        />
      )}

      <Navbar 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)} lang={lang} setLang={setLang} siteName={siteName}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} isAr={isAr} />
      <ProfileCenter isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} isAr={isAr} />

      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className={`relative w-80 bg-[#12071d] h-full shadow-2xl flex flex-col border-r border-white/5 animate-slide-in-${isAr ? 'right' : 'left'}`}>
            <div className="p-8 border-b border-white/5 flex flex-col gap-4 bg-[#1a0a2a]">
              <div className="flex justify-between items-center">
                <div className="text-xl font-black text-indigo-400 uppercase">{siteName} MENU</div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
              </div>
              {currentUser && (
                <div onClick={() => { setIsMenuOpen(false); setIsProfileOpen(true); }} className="mt-4 flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                  <div className="h-10 w-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white truncate max-w-[120px]">{currentUser.displayName}</div>
                    <div className="text-[9px] text-slate-500 truncate max-w-[150px]">{currentUser.email}</div>
                  </div>
                </div>
              )}
            </div>
            <nav className="p-4 space-y-2 flex-1">
              <button onClick={() => { setIsMenuOpen(false); window.scrollTo(0,0); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-300 hover:bg-white/5 font-bold transition-all">
                <Home size={20} className="text-indigo-500" /> {isAr ? 'الرئيسية' : 'Home'}
              </button>
              {!currentUser ? (
                <button onClick={() => { setIsMenuOpen(false); setIsAuthModalOpen(true); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-white hover:bg-indigo-600 font-black transition-all bg-indigo-600/20 border border-indigo-600/30">
                  <LogIn size={20} className="text-indigo-400" /> {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              ) : (
                <>
                  <button onClick={() => { setIsMenuOpen(false); setShowUserOrders(true); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-300 hover:bg-white/5 font-bold transition-all">
                    <Package size={20} className="text-indigo-500" /> {isAr ? 'سجل مشترياتي' : 'Order History'}
                  </button>
                  <button onClick={() => { setIsMenuOpen(false); setIsProfileOpen(true); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-300 hover:bg-white/5 font-bold transition-all">
                    <User size={20} className="text-indigo-500" /> {isAr ? 'مركز البروفايل' : 'Profile Settings'}
                  </button>
                  {isUserAdmin && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <button onClick={() => { setIsMenuOpen(false); setIsAdminMode(true); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-white hover:bg-indigo-600 font-black transition-all bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                        <LayoutDashboard size={20} className="text-white" /> {isAr ? 'لوحة المسؤول' : 'Admin Panel'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Section */}
        {banners.length > 0 ? (
          <section className="mb-12 flex justify-center relative group">
            <div className="relative w-full md:w-[94%] aspect-[16/9] md:aspect-[3/1] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-black/20">
              {banners.map((banner, index) => (
                <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <a href={banner.link || '#'} target={banner.link ? "_blank" : "_self"} rel="noopener noreferrer" className={`block w-full h-full ${!banner.link && 'cursor-default'}`}>
                    {isVideo(banner.url) ? <video src={banner.url} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={banner.url} className="w-full h-full object-cover" alt="Banner" />}
                  </a>
                </div>
              ))}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {banners.map((_, idx) => (
                    <button key={idx} onClick={() => setActiveBannerIndex(idx)} className={`h-1 rounded-full transition-all ${idx === activeBannerIndex ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20'}`} />
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="mb-12 w-full md:w-[94%] mx-auto aspect-[16/9] md:aspect-[3/1] rounded-[1.5rem] md:rounded-[2.5rem] bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-slate-500">
             {isAr ? 'أضف بنرات من لوحة التحكم' : 'Add banners'}
          </div>
        )}

        {/* Products Section */}
        <section id="products">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase">{isAr ? 'أحدث الهدايا المتميزة' : 'PREMIUM GIFTS'}</h2>
            <div className="flex flex-wrap justify-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
              {uiCategories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all border whitespace-nowrap ${activeCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
                  {isAr ? cat.nameAr : cat.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} lang={lang} onAddToCart={addToCart} onPreview={setPreviewProduct} />
            ))}
          </div>
        </section>
      </main>

      {/* User Purchases Drawer */}
      {showUserOrders && (
        <div className="fixed inset-0 z-[160] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowUserOrders(false)} />
          <div className="relative w-full sm:max-w-md bg-[#160a25] h-full shadow-2xl flex flex-col border-l border-white/10 animate-slide-in-right">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1a0a2a]">
              <h3 className="text-lg font-black flex items-center gap-3">
                <Package className="h-5 w-5 text-indigo-500" />
                {isAr ? 'تتبع طلباتي' : 'Order Tracking'}
              </h3>
              <button onClick={() => setShowUserOrders(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {myPurchases.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                  <Package size={64} />
                  <p className="font-bold text-center">{isAr ? 'لا يوجد طلبات حالياً' : 'No orders yet'}</p>
                </div>
              ) : (
                myPurchases.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-all">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">#{order.id.split('-')[1]}</span>
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                       </div>
                       <div className="space-y-2">
                         {order.items.map((item, idx) => (
                           <div key={idx} className="flex justify-between text-xs font-bold text-white/90">
                              <span>{isAr ? item.nameAr : item.name}</span>
                              <span className="text-slate-500">x{item.quantity}</span>
                           </div>
                         ))}
                       </div>
                       <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[10px] text-slate-500">{new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                          <div className="font-black text-indigo-400 text-base">$ {order.total.toFixed(2)}</div>
                       </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsCartOpen(false); setShowCheckoutForm(false); }} />
          <div className="relative w-full sm:max-w-md bg-[#160a25] h-full shadow-2xl flex flex-col border-l border-white/10 animate-slide-in-right">
             <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-black flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-500" />
                {isAr ? 'حقيبة المشتريات' : 'My Bag'}
              </h3>
              <button onClick={() => { setIsCartOpen(false); setShowCheckoutForm(false); }} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {!showCheckoutForm ? (
                cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
                    <ShoppingBag size={64} /><p className="font-bold">{isAr ? 'حقيبتك فارغة' : 'Your bag is empty'}</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 p-3 md:p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="h-16 w-16 md:h-20 md:w-20 bg-black/40 rounded-xl overflow-hidden p-2 flex-shrink-0">
                        <img src={item.previewUrl} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs md:text-sm">{isAr ? item.nameAr : item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-500"><X size={14} /></button>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                           <span className="text-indigo-400 font-bold text-sm">$ {item.price}</span>
                           <div className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-lg px-2 py-1">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white/10 rounded"><Minus size={10} /></button>
                              <span className="text-[10px] md:text-xs font-bold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white/10 rounded"><Plus size={10} /></button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div className="space-y-6 animate-fade-in py-2">
                  <div className="text-center mb-6">
                    <h4 className="text-base md:text-lg font-black mb-1">{isAr ? 'بيانات التواصل' : 'Contact Details'}</h4>
                    <p className="text-[10px] md:text-xs text-slate-400">{isAr ? 'أدخل بياناتك لتأكيد الطلب' : 'Enter your details'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <User className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500`} />
                      <input required type="text" placeholder={isAr ? 'اسمك الكامل' : 'Full Name'} className={`w-full bg-white/5 border border-white/10 rounded-xl ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 md:py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm`} value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                    </div>
                    <div className="relative">
                      <Phone className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500`} />
                      <input required type="tel" placeholder={isAr ? 'رقم الواتساب' : 'WhatsApp Number'} className={`w-full bg-white/5 border border-white/10 rounded-xl ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 md:py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm`} value={customerInfo.whatsapp} onChange={e => setCustomerInfo({...customerInfo, whatsapp: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 md:p-6 bg-black/40 border-t border-white/10">
              <div className="flex justify-between mb-4 md:mb-6">
                <span className="text-slate-400 text-sm">{isAr ? 'الإجمالي' : 'Total'}</span>
                <span className="text-xl md:text-2xl font-black">$ {cartTotal.toFixed(2)}</span>
              </div>
              {!showCheckoutForm ? (
                <button disabled={cart.length === 0} onClick={() => setShowCheckoutForm(true)} className="w-full bg-indigo-600 text-white py-3 md:py-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 text-sm md:text-base">
                  <ShoppingCart size={18} /> {isAr ? 'متابعة الطلب' : 'CONTINUE'}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button onClick={() => handlePlaceOrder('site')} className="w-full bg-white/10 text-white py-3 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all text-sm">
                    <Globe size={18} className="text-indigo-400" /> {isAr ? 'طلب وانتظار المراجعة' : 'Order & Wait for Review'}
                  </button>
                  <button onClick={() => handlePlaceOrder('whatsapp')} className="w-full bg-green-600 text-white py-3 md:py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-green-600/20 active:scale-95 transition-all text-sm">
                    <MessageCircle size={18} /> {isAr ? 'شراء عبر واتساب' : 'Buy via WhatsApp'}
                  </button>
                  <button onClick={() => setShowCheckoutForm(false)} className="text-slate-500 text-xs font-bold hover:text-white transition-colors">{isAr ? 'إلغاء' : 'Cancel'}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setPreviewProduct(null)} />
          <div className="relative bg-[#0f0518] w-full max-w-5xl max-h-[95vh] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl flex flex-col md:flex-row">
            <button onClick={() => setPreviewProduct(null)} className="absolute top-4 right-4 md:top-8 md:right-8 z-30 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white border border-white/10"><X size={24} /></button>
            <div className="w-full md:w-3/5 h-[40vh] md:h-auto bg-black flex items-center justify-center relative group p-4 md:p-12 shrink-0">
              {previewProduct.videoUrl ? <video src={previewProduct.videoUrl} className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_50px_rgba(99,102,241,0.4)]" controls autoPlay loop playsInline /> : <img src={previewProduct.previewUrl} className="max-w-full max-h-full object-contain relative z-10 drop-shadow-[0_0_50px_rgba(99,102,241,0.3)]" />}
            </div>
            <div className="w-full md:w-2/5 p-6 md:p-16 flex flex-col justify-center bg-[#0f0518]">
               <h2 className="text-2xl md:text-5xl font-black mb-3 text-white uppercase tracking-tighter">{isAr ? previewProduct.nameAr : previewProduct.name}</h2>
               <div className="text-2xl md:text-4xl font-black text-white mb-6">$ {previewProduct.price.toFixed(2)}</div>
               <button onClick={() => { addToCart(previewProduct); setPreviewProduct(null); setIsCartOpen(true); }} className="w-full bg-indigo-600 text-white py-3 md:py-5 rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/40 text-base md:text-lg">
                 <ShoppingBag size={20} /> {isAr ? 'إضافة إلى الحقيبة' : 'ADD TO BAG'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
