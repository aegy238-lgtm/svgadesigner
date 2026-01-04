
import React, { useState } from 'react';
import { auth, db, doc, setDoc, getDoc } from '../../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signOut
} from 'firebase/auth';
import { X, Mail, Lock, User, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, isAr }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSwitchOption, setShowSwitchOption] = useState(false);

  // The predefined Master Admin Email
  const ADMIN_EMAIL = 'admin@gother.com';

  if (!isOpen) return null;

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowSwitchOption(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowSwitchOption(false);

    // Pre-submit validation for password length (Firebase requirement)
    if (password.length < 6) {
      setError(isAr ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const targetEmail = email.toLowerCase().trim();

    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, targetEmail, password);
        // Security: Verify status in Firestore
        const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          if (data.status === 'blocked') {
            await signOut(auth);
            throw new Error(isAr ? 'عذراً، هذا الحساب محظور حالياً.' : 'Sorry, this account is currently blocked.');
          }
        }
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, targetEmail, password);
        await updateProfile(userCred.user, { displayName: name });
        
        // Define Role: admin@gother.com is the only 'admin'
        const userRole = targetEmail === ADMIN_EMAIL ? 'admin' : 'user';

        // Create user profile in Firestore
        const profile: UserProfile = {
          uid: userCred.user.uid,
          email: targetEmail,
          displayName: name,
          status: 'active',
          role: userRole,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", userCred.user.uid), profile);
      }
      onClose();
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      let errMsg = err.message;
      
      // Handle Specific Firebase Auth Errors
      if (err.code === 'auth/wrong-password') {
        errMsg = isAr ? 'كلمة المرور غير صحيحة' : 'Wrong password';
      } else if (err.code === 'auth/user-not-found') {
        errMsg = isAr ? 'الحساب غير موجود' : 'User not found';
      } else if (err.code === 'auth/weak-password') {
        errMsg = isAr ? 'كلمة المرور ضعيفة جداً، يجب أن تكون 6 أحرف على الأقل' : 'Password is too weak, must be at least 6 characters';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = isAr ? 'هذا البريد الإلكتروني مسجل بالفعل لدينا.' : 'This email is already registered with us.';
        setShowSwitchOption(true);
      } else if (err.code === 'auth/invalid-email') {
        errMsg = isAr ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = isAr ? 'تم حظر المحاولات مؤقتاً بسبب كثرة الطلبات، حاول لاحقاً' : 'Too many attempts. Try again later.';
      }
      
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#160a25] border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
        
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
             {isLogin ? <Lock className="text-indigo-400" /> : <User className="text-indigo-400" />}
          </div>
          <h2 className="text-2xl font-black mb-2">
            {isLogin 
              ? (isAr ? 'تسجيل الدخول' : 'Welcome Back') 
              : (isAr ? 'إنشاء حساب جديد' : 'Create Account')}
          </h2>
          <p className="text-xs text-slate-400 font-bold">
            {isLogin 
              ? (isAr ? 'سجل دخولك لمتابعة مشترياتك في GoTher' : 'Login to access your gift bag in GoTher') 
              : (isAr ? 'انضم إلى عالم الهدايا الرقمية المذهل' : 'Join the amazing digital gifts world')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-[11px] font-bold">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
            {showSwitchOption && !isLogin && (
              <button 
                onClick={() => { setIsLogin(true); setError(''); setShowSwitchOption(false); }}
                className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase hover:text-white transition-colors pl-7"
              >
                {isAr ? 'تسجيل الدخول بدلاً من ذلك؟' : 'Login instead?'}
                <ArrowRight size={12} className={isAr ? 'rotate-180' : ''} />
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} />
              <input 
                required
                type="text"
                placeholder={isAr ? 'الاسم الكامل' : 'Full Name'}
                className={`w-full bg-white/5 border border-white/10 rounded-xl ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 text-sm focus:border-indigo-500 focus:outline-none transition-all`}
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div className="relative group">
            <Mail className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} />
            <input 
              required
              type="email"
              placeholder={isAr ? 'البريد الإلكتروني' : 'Email Address'}
              className={`w-full bg-white/5 border border-white/10 rounded-xl ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 text-sm focus:border-indigo-500 focus:outline-none transition-all`}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="relative group">
            <Lock className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} />
            <input 
              required
              type="password"
              placeholder={isAr ? 'كلمة المرور' : 'Password'}
              className={`w-full bg-white/5 border border-white/10 rounded-xl ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 text-sm focus:border-indigo-500 focus:outline-none transition-all`}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {isLogin ? (isAr ? 'دخول' : 'LOGIN') : (isAr ? 'إنشاء حساب' : 'REGISTER')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={toggleMode}
            className="text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors"
          >
            {isLogin 
              ? (isAr ? 'لا تملك حساباً؟ سجل الآن مجاناً' : 'New here? Create an account for free') 
              : (isAr ? 'تملك حساباً بالفعل؟ سجل دخولك' : 'Already have an account? Login')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
