import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../lib/api';
import toast from 'react-hot-toast';

export function Setup() {
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!displayName || !timezone) return toast.error("Please fill all fields");
    
    setLoading(true);
    await saveUserProfile(user.uid, {
      displayName,
      email: user.email || '',
      photoURL: user.photoURL || '',
      timezone,
    });
    await refreshProfile();
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen px-8 pt-12 bg-[#FAF8F5]">
      <h1 className="text-2xl font-bold text-[#5C4E4E] mb-6 tracking-tight font-serif">个人档案</h1>
      
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#8C7E7E] uppercase tracking-widest mb-2">昵称</label>
          <input 
            type="text" 
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#EFE8E0] rounded-2xl focus:ring-2 focus:ring-[#EFA5A5] focus:border-transparent outline-none transition-all text-sm shadow-sm"
            placeholder="我们该如何称呼你？"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#8C7E7E] uppercase tracking-widest mb-2">所在时区</label>
          <select 
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#EFE8E0] rounded-2xl focus:ring-2 focus:ring-[#EFA5A5] focus:border-transparent outline-none transition-all text-sm shadow-sm text-[#5C4E4E]"
          >
            {[
              "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
              "Europe/London", "Europe/Paris", "Asia/Dubai", "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney"
            ].map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          <p className="text-xs text-[#A99C9C] mt-2 font-medium">当前检测到: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 px-4 mt-8 bg-[#EFA5A5] text-white rounded-full font-bold shadow-md hover:bg-[#E59595] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "保存中..." : "继续步入"}
        </button>
      </form>
    </div>
  );
}
