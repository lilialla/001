import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { createSpace, joinSpace } from '../lib/api';
import toast from 'react-hot-toast';

export function JoinSpace() {
  const { user } = useAuth();
  const { loadSpace } = useApp();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    const spaceId = await createSpace([user.uid]);
    if (spaceId) {
      toast.success("Space created!");
      // Our AppContext snapshot will automatically redirect us
    } else {
      toast.error("Failed to create space");
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;
    setLoading(true);
    try {
      await joinSpace(inviteCode.trim(), user.uid);
      toast.success("Joined space!");
      // Our AppContext snapshot will automatically redirect us
    } catch(err) {
      toast.error("Failed to join. Invalid code?");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen px-8 pt-12 bg-[#FAF8F5]">
      <h1 className="text-2xl font-bold text-[#5C4E4E] mb-8 tracking-tight text-center font-serif">连接时空</h1>
      
      <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-[#EFE8E0] mb-6">
        <h2 className="font-bold text-[#5C4E4E] mb-1 text-lg tracking-tight">创建新空间</h2>
        <p className="text-sm text-[#8C7E7E] mb-5 font-medium">开启全新的时间线并邀请伴侣加入。</p>
        <button 
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-3.5 bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#5C4E4E] rounded-full font-bold transition-all text-sm border border-[#EFE8E0]"
        >
          创建空间
        </button>
      </div>

      <div className="w-full flex items-center gap-4 mb-6 text-[#A99C9C] text-xs font-bold uppercase tracking-widest">
        <div className="h-px bg-[#EFE8E0] flex-1"></div>
        或
        <div className="h-px bg-[#EFE8E0] flex-1"></div>
      </div>

      <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-[#EFE8E0]">
        <h2 className="font-bold text-[#5C4E4E] mb-1 text-lg tracking-tight">加入已有空间</h2>
        <p className="text-sm text-[#8C7E7E] mb-5 font-medium">在此输入伴侣发送的邀请码。</p>
        <form onSubmit={handleJoin} className="flex gap-3">
          <input 
            type="text" 
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#FAF8F5] border border-[#EFE8E0] rounded-2xl focus:ring-2 focus:ring-[#EFA5A5] outline-none text-sm font-medium text-[#5C4E4E]"
            placeholder="粘贴邀请码..."
          />
          <button 
            type="submit"
            disabled={loading || !inviteCode}
            className="px-6 bg-[#EFA5A5] shadow-sm text-white rounded-2xl font-bold hover:bg-[#E59595] active:scale-95 transition-all text-sm disabled:opacity-50"
          >
            加入
          </button>
        </form>
      </div>
    </div>
  );
}
