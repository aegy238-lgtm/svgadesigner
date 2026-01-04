
import React, { useState, useEffect } from 'react';
import { db, collections, onSnapshot, doc, setDoc, deleteDoc } from '../../firebase';
import { Category } from '../../types';
import { Trash2, Plus, Tag, Layers, Save, X } from 'lucide-react';

interface CategoryManagerProps {
  isAr: boolean;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ isAr }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState({ name: '', nameAr: '', icon: '✨' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collections.categories, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    });
    return () => unsub();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name || !newCat.nameAr) return;

    setLoading(true);
    const id = newCat.name.toLowerCase().replace(/\s+/g, '-');
    try {
      await setDoc(doc(db, "categories", id), {
        ...newCat,
        id: id
      });
      setNewCat({ name: '', nameAr: '', icon: '✨' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد؟ قد يؤثر هذا على عرض المنتجات المرتبطة بهذا القسم.' : 'Are you sure? This might affect products linked to this category.')) {
      try {
        await deleteDoc(doc(db, "categories", id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Add Category Form */}
      <div className="bg-[#160a25] border border-white/5 rounded-[2rem] p-8">
        <h3 className="text-xl font-black flex items-center gap-3 mb-6">
          <Plus size={24} className="text-indigo-500" />
          {isAr ? 'إضافة قسم جديد' : 'Add New Category'}
        </h3>
        <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">{isAr ? 'الاسم (EN)' : 'Name (EN)'}</label>
            <input 
              required
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
              value={newCat.name}
              onChange={e => setNewCat({...newCat, name: e.target.value})}
              placeholder="e.g. Luxury"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">{isAr ? 'الاسم (AR)' : 'Name (AR)'}</label>
            <input 
              required
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
              value={newCat.nameAr}
              onChange={e => setNewCat({...newCat, nameAr: e.target.value})}
              placeholder="مثلاً: فاخرة"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">{isAr ? 'أيقونة/إيموجي' : 'Icon/Emoji'}</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none text-center"
              value={newCat.icon}
              onChange={e => setNewCat({...newCat, icon: e.target.value})}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white h-[46px] rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Save size={18} />
            {isAr ? 'إضافة' : 'ADD'}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-[#160a25] border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center gap-3">
          <Layers className="text-indigo-500" />
          <h3 className="text-xl font-black">{isAr ? 'الأقسام الحالية' : 'Current Categories'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-4">{isAr ? 'الأيقونة' : 'Icon'}</th>
                <th className="px-8 py-4">{isAr ? 'الاسم (AR)' : 'Name (AR)'}</th>
                <th className="px-8 py-4">{isAr ? 'الاسم (EN)' : 'Name (EN)'}</th>
                <th className="px-8 py-4">{isAr ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4 text-2xl">{cat.icon}</td>
                  <td className="px-8 py-4 font-bold text-white">{cat.nameAr}</td>
                  <td className="px-8 py-4 text-slate-400 font-bold">{cat.name}</td>
                  <td className="px-8 py-4">
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
