import React from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { CalendarHeart } from 'lucide-react';

export function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-screen px-8 bg-[#FAF8F5]">
      <div className="w-16 h-16 bg-[#FBEAEB] rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        <CalendarHeart className="text-[#EFA5A5] w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-[#5C4E4E] mb-2 tracking-tight font-serif">SyncTime</h1>
      <p className="text-[#8C7E7E] mb-10 text-center text-sm font-medium">无论距离多远，与爱人保持同频同心。</p>
      
      <button 
        onClick={signInWithGoogle}
        className="w-full py-4 px-4 bg-[#5C4E4E] text-[#FFFDF8] rounded-full font-bold tracking-wide shadow-md hover:bg-[#4A3E3E] active:scale-95 transition-all text-sm"
      >
        使用 Google 账号登录
      </button>
    </div>
  );
}
