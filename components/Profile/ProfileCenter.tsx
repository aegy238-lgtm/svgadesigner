
import React, { useState, useEffect } from 'react';
import { auth, db, doc, updateDoc, onSnapshot } from '../../firebase';
import { updateProfile } from 'firebase/auth';
import { X, User, Mail, Save, Loader2, Shield } from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfileCenterProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
}

const ProfileCenter: React.FC<ProfileCenterProps> = ({ isOpen, onClose, isAr }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        setName(data.displayName);
      }
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen || !profile) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { displayName: name });
      alert(isAr ? 'تم تحديث البيانات بنجاح' : 'Profile updated successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#160a25] border border-white/10 rounded-3xl p-8 animate-fade-in shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={20}/></button>
        
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4 border-2 border-indigo-500/30">
            <User size={40} className="text-indigo-400" />
          </div>
          <h2 className="text-xl font-black">{isAr ? 'مركز البروفايل' : 'Profile Center'}</h2>
          <div className="flex items-center gap-1.5 mt-1">
             <span className={`h-2 w-2 rounded-full ${profile.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
             <span className="text-[10px] text-slate-500 font-bold uppercase">{profile.status} Account</span>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
              {isAr ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
              <input 
                required
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
              {isAr ? 'البريد الإلكتروني (غير قابل للتغيير)' : 'Email Address (Primary)'}
            </label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                disabled
                type="email"
                className="w-full bg-black/20 border border-white/5 rounded-xl px-12 py-3 text-sm text-slate-500 italic"
                value={profile.email}
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isAr ? 'حفظ التغييرات' : 'UPDATE PROFILE'}
            </button>
            <button 
              type="button"
              onClick={() => auth.signOut()}
              className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors py-2"
            >
              {isAr ? 'تسجيل الخروج' : 'Log Out From Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCenter;
