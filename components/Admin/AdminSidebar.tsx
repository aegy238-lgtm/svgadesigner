
import React from 'react';
import { LayoutDashboard, PlusCircle, List, Settings, LogOut, ShoppingBasket, Users, Layers } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExit: () => void;
  isAr: boolean;
  orderCount?: number;
  siteName: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, onExit, isAr, orderCount = 0, siteName }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, labelAr: 'لوحة القيادة', labelEn: 'Dashboard' },
    { id: 'orders', icon: ShoppingBasket, labelAr: 'طلبات العملاء', labelEn: 'Orders', badge: orderCount },
    { id: 'users', icon: Users, labelAr: 'قاعدة المستخدمين', labelEn: 'User Manager' },
    { id: 'categories', icon: Layers, labelAr: 'إدارة الأقسام', labelEn: 'Categories' },
    { id: 'list', icon: List, labelAr: 'إدارة المنتجات', labelEn: 'Product List' },
    { id: 'add', icon: PlusCircle, labelAr: 'إضافة منتج', labelEn: 'Add Product' },
    { id: 'settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings' },
  ];

  return (
    <div className="w-64 bg-[#0a0410] border-l border-white/5 flex flex-col h-full">
      <div className="p-8 text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent truncate">
        {siteName} Admin
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === item.id 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
              : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <item.icon size={18} />
            {isAr ? item.labelAr : item.labelEn}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={onExit}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut size={18} />
          {isAr ? 'خروج من اللوحة' : 'Exit Admin'}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
