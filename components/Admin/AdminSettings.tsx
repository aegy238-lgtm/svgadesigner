
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Plus, Trash2, Phone, Save, Video, Link as LinkIcon, CheckCircle2, Globe } from 'lucide-react';
import { db, doc, setDoc, deleteDoc, updateDoc } from '../../firebase';

interface AdminSettingsProps {
  banners: {id: string, url: string, link?: string}[];
  storeWhatsApp: string;
  siteName: string;
  isAr: boolean;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ banners, storeWhatsApp, siteName, isAr }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [waNumber, setWaNumber] = useState(storeWhatsApp);
  const [currentSiteName, setCurrentSiteName] = useState(siteName);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  
  // New Banner States
  const [newBannerLink, setNewBannerLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWaNumber(storeWhatsApp);
    setCurrentSiteName(siteName);
  }, [storeWhatsApp, siteName]);

  const isVideo = (url: string) => {
    return url && (url.startsWith('data:video') || url.endsWith('.mp4') || url.includes('video'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadBanner = async () => {
    if (!selectedFile || !filePreview) {
      alert(isAr ? 'يرجى اختيار ملف أولاً' : 'Please select a file first');
      return;
    }

    setIsUploading(true);
    const bannerId = `banner-${Date.now()}`;
    
    try {
      await setDoc(doc(db, "banners", bannerId), {
        url: filePreview,
        link: newBannerLink.trim(),
        createdAt: new Date().toISOString()
      });
      
      // Reset form
      setSelectedFile(null);
      setFilePreview(null);
      setNewBannerLink('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      alert(isAr ? 'تم رفع البنر بنجاح' : 'Banner uploaded successfully');
    } catch (err) {
      console.error("Error adding banner:", err);
      alert(isAr ? 'خطأ في الرفع' : 'Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا البنر؟' : 'Are you sure you want to delete this banner?')) {
      try {
        await deleteDoc(doc(db, "banners", id));
      } catch (err) {
        console.error("Error deleting banner:", err);
      }
    }
  };

  const handleEditBannerLink = async (id: string, currentLink: string) => {
    const newLink = prompt(isAr ? 'تعديل رابط البنر الحالي:' : 'Edit current banner link:', currentLink || '');
    if (newLink !== null) {
      try {
        await updateDoc(doc(db, "banners", id), { link: newLink.trim() });
      } catch (err) {
        console.error("Error updating banner link:", err);
      }
    }
  };

  const saveStoreConfig = async () => {
    setIsSavingConfig(true);
    try {
      await setDoc(doc(db, "settings", "store_config"), { 
        whatsapp: waNumber,
        siteName: currentSiteName.trim() || 'GoTher'
      }, { merge: true });
      alert(isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (err) {
      console.error(err);
      alert(isAr ? 'خطأ في الحفظ' : 'Error saving');
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Store Configuration Section */}
      <div className="bg-[#160a25] border border-white/5 rounded-[2rem] p-8">
        <h3 className="text-xl font-black flex items-center gap-3 mb-6">
          <Globe size={24} className="text-indigo-500" />
          {isAr ? 'إعدادات الهوية والتواصل' : 'Identity & Contact Settings'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
              {isAr ? 'اسم الموقع / المتجر' : 'Site / Store Name'}
            </label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
              value={currentSiteName}
              onChange={e => setCurrentSiteName(e.target.value)}
              placeholder="e.g. GoTher"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
              {isAr ? 'رقم واتساب المتجر' : 'Store WhatsApp Number'}
            </label>
            <input 
              type="text" 
              placeholder="e.g. 201234567890"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
              value={waNumber}
              onChange={e => setWaNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={saveStoreConfig}
            disabled={isSavingConfig}
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black flex items-center gap-3 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {isSavingConfig ? '...' : <Save size={20} />}
            {isAr ? 'حفظ إعدادات الموقع' : 'SAVE SITE SETTINGS'}
          </button>
        </div>
      </div>

      {/* Banner Upload Form */}
      <div className="bg-[#160a25] border border-white/5 rounded-[2rem] p-8 shadow-xl">
        <h3 className="text-xl font-black flex items-center gap-3 mb-8">
          <Plus size={24} className="text-indigo-500" />
          {isAr ? 'إضافة بنر جديد مع الرابط' : 'Add New Banner with Link'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
             <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
              {isAr ? '1. اختر ملف البنر (صورة أو فيديو)' : '1. Choose Banner File (Image/Video)'}
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-[3/1] bg-white/5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${filePreview ? 'border-indigo-500 bg-white/[0.08]' : 'border-white/10 hover:border-indigo-500/50'}`}
            >
              {filePreview ? (
                isVideo(filePreview) || selectedFile?.type.includes('video') ? (
                   <div className="flex flex-col items-center gap-2 text-indigo-400">
                     <Video size={32} />
                     <span className="text-[10px] font-bold uppercase">{selectedFile?.name}</span>
                   </div>
                ) : (
                   <img src={filePreview} className="w-full h-full object-cover" alt="Preview" />
                )
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-slate-500 mb-2" />
                  <span className="text-xs text-slate-500 font-bold">{isAr ? 'اضغط لاختيار ملف' : 'Click to choose file'}</span>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                hidden 
                accept="image/*,video/mp4" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
               <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                {isAr ? '2. ضع الرابط المخصص (اختياري)' : '2. Set Custom Link (Optional)'}
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                <input 
                  type="text" 
                  placeholder={isAr ? 'مثلاً: https://wa.me/2010...' : 'e.g. https://wa.me/...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm focus:border-indigo-500 focus:outline-none"
                  value={newBannerLink}
                  onChange={e => setNewBannerLink(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleUploadBanner}
              disabled={isUploading || !selectedFile}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-30 active:scale-95"
            >
              {isUploading ? <Upload className="animate-bounce" size={20} /> : <CheckCircle2 size={20} />}
              {isAr ? 'تأكيد ورفع البنر الآن' : 'CONFIRM & UPLOAD NOW'}
            </button>
          </div>
        </div>
      </div>

      {/* Banner Management */}
      <div className="bg-[#160a25] border border-white/5 rounded-[2rem] p-8">
        <h3 className="text-xl font-black flex items-center gap-3 mb-8">
          <ImageIcon size={24} className="text-indigo-500" />
          {isAr ? 'البنرات الحالية' : 'Current Banners'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl text-slate-500 font-bold">
              {isAr ? 'لا توجد بنرات مرفوعة حالياً' : 'No banners uploaded yet'}
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-[3/1] bg-black shadow-lg">
                {isVideo(banner.url) ? (
                   <video src={banner.url} className="w-full h-full object-cover opacity-60" muted />
                ) : (
                   <img src={banner.url} className="w-full h-full object-cover opacity-80" alt="Banner" />
                )}
                
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {isVideo(banner.url) && (
                    <div className="bg-indigo-600 text-white p-1.5 rounded shadow-lg">
                      <Video size={14} />
                    </div>
                  )}
                  {banner.link && (
                    <div className="bg-green-600 text-white p-1.5 rounded shadow-lg flex items-center gap-2" title={banner.link}>
                      <LinkIcon size={14} />
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-300">
                  <button 
                    onClick={() => handleEditBannerLink(banner.id, banner.link || '')}
                    className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl"
                  >
                    <LinkIcon size={20} />
                  </button>
                  <button 
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
