
import React from 'react';
import { Product } from '../../types';
import { Edit, Trash2, ExternalLink } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  isAr: boolean;
}

const AdminProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, isAr }) => {
  return (
    <div className="bg-[#160a25] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-right min-w-[600px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{isAr ? 'المعانية' : 'Preview'}</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{isAr ? 'اسم المنتج' : 'Name'}</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{isAr ? 'السعر' : 'Price'}</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{isAr ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="h-12 w-12 bg-black rounded-lg overflow-hidden border border-white/10">
                    <img src={product.previewUrl} className="h-full w-full object-contain" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{isAr ? product.nameAr : product.name}</div>
                  <div className="text-[10px] text-slate-500">ID: {product.id}</div>
                </td>
                <td className="px-6 py-4 font-bold text-indigo-400 text-sm">
                  $ {product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => onEdit(product)}
                      className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(product.id)}
                      className="p-2 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductList;
