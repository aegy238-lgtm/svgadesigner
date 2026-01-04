
import React, { useState, useRef, useEffect } from 'react';
import { Product, Format, Category } from '../../types';
import { db, collections, onSnapshot } from '../../firebase';
import { Save, Upload, Link, Image as ImageIcon, Video, X, CheckCircle2 } from 'lucide-react';

interface ProductFormProps {
  onSave: (product: Product) => void;
  onCancel: () => void;
  isAr: boolean;
  initialData?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, onCancel, isAr, initialData }) => {
  const availableFormats: Format[] = ['SVGA', 'VAP', 'MP4', 'JSON', 'PAG'];
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState<Partial<Product>>(initialData || {
    id: Math.floor(Math.random() * 100000).toString(),
    name: '',
    nameAr: '',
    price: 0,
    category: 'luxury',
    categoryAr: 'فاخرة',
    previewUrl: '',
    videoUrl: '',
    videoSourceType: 'link',
    formats: ['SVGA', 'VAP'],
    level: 'Luxury',
    tags: []
  });

  useEffect(() => {
    const unsub = onSnapshot(collections.categories, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    });
    return () => unsub();
  }, []);

  const [isUploading, setIsUploading] = useState({ preview: false, video: false });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = (file: File, field: 'previewUrl' | 'videoUrl') => {
    const reader = new FileReader();
    setIsUploading(prev => ({ ...prev, [field === 'previewUrl' ? 'preview' : 'video']: true }));
    reader.onloadend = () => {
      setFormData(prev => ({ 
        ...prev, 
        [field]: reader.result as string,
        ...(field === 'videoUrl' ? { videoSourceType: 'file' } : {})
      }));
      setIsUploading(prev => ({ ...prev, [field === 'previewUrl' ? 'preview' : 'video']: false }));
    };
    reader.readAsDataURL(file);
  };

  const toggleFormat = (format: Format) => {
    const currentFormats = formData.formats || [];
    if (currentFormats.includes(format)) {
      setFormData({ ...formData, formats: currentFormats.filter(f => f !== format) });
    } else {
      setFormData({ ...formData, formats: [...currentFormats, format] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Product);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all";

  return (
    <form onSubmit={handleSubmit} className="bg-[#160a25] border border-white/5 rounded-[2rem] p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cover Image Upload */}
        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
            {isAr ? 'صورة الغلاف (واجهة المنتج)' : 'Cover Image (Front View)'}
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-white/[0.08] transition-all overflow-hidden"
          >
            {formData.previewUrl ? (
              <img src={formData.previewUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors" />
                <span className="text-xs text-slate-500 font-bold">{isUploading.preview ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'اضغط لرفع الصورة' : 'Click to upload image')}</span>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept="image/*" 
              onChange={e => e.target.files?.[0] && handleFileRead(e.target.files[0], 'previewUrl')}
            />
          </div>
        </div>

        {/* Video Upload / Link */}
        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
            {isAr ? 'فيديو المعاينة (الهدية)' : 'Preview Video (Gift)'}
          </label>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-4">
            <button 
              type="button"
              onClick={() => setFormData({...formData, videoSourceType: 'file'})}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${formData.videoSourceType === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
            >
              <Upload size={14} /> {isAr ? 'رفع ملف' : 'Upload File'}
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, videoSourceType: 'link'})}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${formData.videoSourceType === 'link' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
            >
              <Link size={14} /> {isAr ? 'رابط خارجي' : 'External Link'}
            </button>
          </div>

          {formData.videoSourceType === 'file' ? (
            <div 
              onClick={() => videoInputRef.current?.click()}
              className="group relative aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-white/[0.08] transition-all overflow-hidden"
            >
              {formData.videoUrl && formData.videoUrl.startsWith('data:video') ? (
                <div className="flex flex-col items-center gap-2">
                  <Video className="h-8 w-8 text-green-400" />
                  <span className="text-xs font-bold text-slate-300">{isAr ? 'تم اختيار الفيديو' : 'Video Selected'}</span>
                </div>
              ) : (
                <>
                  <Video className="h-8 w-8 text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-xs text-slate-500 font-bold">{isUploading.video ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'ارفع ملف MP4' : 'Upload MP4 File')}</span>
                </>
              )}
              <input 
                type="file" 
                ref={videoInputRef} 
                hidden 
                accept="video/mp4" 
                onChange={e => e.target.files?.[0] && handleFileRead(e.target.files[0], 'videoUrl')}
              />
            </div>
          ) : (
            <input 
              type="text" 
              placeholder={isAr ? 'ضع رابط الفيديو هنا (MP4/Youtube/GIF)...' : 'Paste video URL here...'}
              className={inputClass}
              value={formData.videoUrl}
              onChange={e => setFormData({...formData, videoUrl: e.target.value})}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">{isAr ? 'اسم المنتج (EN)' : 'Name (EN)'}</label>
          <input required type="text" className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">{isAr ? 'اسم المنتج (AR)' : 'Name (AR)'}</label>
          <input required type="text" className={inputClass} value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">{isAr ? 'السعر (USD)' : 'Price (USD)'}</label>
          <input required type="number" className={inputClass} value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">{isAr ? 'القسم' : 'Category'}</label>
          <select 
            className={inputClass} 
            value={formData.category} 
            onChange={e => {
              const selected = categories.find(c => c.id === e.target.value);
              setFormData({
                ...formData, 
                category: e.target.value,
                categoryAr: selected ? selected.nameAr : ''
              });
            }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{isAr ? cat.nameAr : cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Supported Formats Selection Section */}
      <div className="space-y-4">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
          {isAr ? 'تنسيقات الدعم (Manage Formats)' : 'Support Formats'}
        </label>
        <div className="flex flex-wrap gap-3">
          {availableFormats.map(format => (
            <button
              key={format}
              type="button"
              onClick={() => toggleFormat(format)}
              className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                formData.formats?.includes(format)
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              {formData.formats?.includes(format) && <CheckCircle2 size={14} />}
              {format}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-10 border-t border-white/5">
        <button 
          type="submit" 
          className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/20 active:scale-95"
        >
          <Save size={20} />
          {isAr ? 'حفظ البيانات' : 'Save Details'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="px-10 border border-white/10 text-slate-400 rounded-2xl font-bold hover:bg-white/5 transition-all"
        >
          {isAr ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
