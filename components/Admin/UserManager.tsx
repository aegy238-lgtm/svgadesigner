
import React, { useState, useEffect } from 'react';
import { db, collections, onSnapshot, doc, updateDoc } from '../../firebase';
import { UserProfile } from '../../types';
import { ShieldAlert, ShieldCheck, Snowflake, Trash2, Mail, User } from 'lucide-react';

interface UserManagerProps {
  isAr: boolean;
}

const UserManager: React.FC<UserManagerProps> = ({ isAr }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collections.users, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateUserStatus = async (uid: string, status: UserProfile['status']) => {
    try {
      await updateDoc(doc(db, "users", uid), { status });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#160a25] border border-white/5 rounded-[2rem] overflow-hidden animate-fade-in">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1a0a2a]">
        <h3 className="text-xl font-black flex items-center gap-3">
          <User className="text-indigo-500" />
          {isAr ? 'إدارة المستخدمين' : 'User Management'}
        </h3>
        <span className="bg-indigo-600/10 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-600/20">
          {users.length} {isAr ? 'عضو مسجل' : 'Registered Members'}
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-right min-w-[800px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'المستخدم' : 'User'}</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'تاريخ الانضمام' : 'Joined'}</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الإجراءات' : 'Control'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{user.displayName}</div>
                  <div className="text-[10px] text-indigo-400 flex items-center gap-1 justify-end">
                    <Mail size={10} />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    user.status === 'active' ? 'bg-green-500/10 text-green-400' : 
                    user.status === 'blocked' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {user.status === 'active' ? (isAr ? 'نشط' : 'Active') : 
                     user.status === 'blocked' ? (isAr ? 'محظور' : 'Blocked') : (isAr ? 'مجمد' : 'Frozen')}
                  </span>
                </td>
                <td className="px-6 py-4 text-[10px] text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    {user.status !== 'active' && (
                      <button 
                        onClick={() => updateUserStatus(user.uid, 'active')}
                        className="p-2 bg-green-600/10 text-green-400 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                        title={isAr ? 'تنشيط' : 'Activate'}
                      >
                        <ShieldCheck size={16} />
                      </button>
                    )}
                    {user.status === 'active' && (
                      <button 
                        onClick={() => updateUserStatus(user.uid, 'frozen')}
                        className="p-2 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                        title={isAr ? 'تجميد' : 'Freeze'}
                      >
                        <Snowflake size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => updateUserStatus(user.uid, 'blocked')}
                      className="p-2 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                      title={isAr ? 'حظر' : 'Block'}
                    >
                      <ShieldAlert size={16} />
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

export default UserManager;
