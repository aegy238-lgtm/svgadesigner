
import React from 'react';
import { Order } from '../../types';
import { CheckCircle, XCircle, Clock, Eye, MessageSquare, Trash2 } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  isAr: boolean;
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onDelete: (id: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, isAr, onUpdateStatus, onDelete }) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-orange-400 bg-orange-400/10';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    if (isAr) {
      switch (status) {
        case 'completed': return 'مكتمل';
        case 'cancelled': return 'ملغى';
        default: return 'قيد الانتظار';
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-[#160a25] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-right min-w-[800px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{isAr ? 'العميل' : 'Customer'}</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{isAr ? 'المنتجات' : 'Items'}</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{isAr ? 'الإجمالي' : 'Total'}</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{isAr ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-bold">
                  {isAr ? 'لا توجد طلبات حالياً' : 'No orders yet'}
                </td>
              </tr>
            ) : (
              orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-sm">{order.customerName}</div>
                    <div className="text-[10px] text-indigo-400 flex items-center gap-1 justify-end">
                      <MessageSquare size={10} />
                      {order.customerWhatsApp}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300 max-w-xs truncate">
                      {order.items.map(i => `${isAr ? i.nameAr : i.name} (x${i.quantity})`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-white text-sm">
                    $ {order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button 
                        title={isAr ? "إتمام" : "Complete"}
                        onClick={() => onUpdateStatus(order.id, 'completed')}
                        className="p-2 bg-green-600/10 text-green-400 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        title={isAr ? "إلغاء" : "Cancel"}
                        onClick={() => onUpdateStatus(order.id, 'cancelled')}
                        className="p-2 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                      >
                        <XCircle size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(order.id)}
                        className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
