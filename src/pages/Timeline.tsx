import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { addEvent, Event } from '../lib/api';
import { format, addDays, startOfDay, subDays, isSameDay, getHours, setHours, setMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import { Plus, X, Share, Sun, Calendar, ListTodo, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export function Timeline() {
  const { user, profile } = useAuth();
  const { space, events, partnerProfile } = useApp();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'me' | 'both'>('both');
  const [activeTab, setActiveTab] = useState<'calendar' | 'overview' | 'us'>('calendar');
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const dateStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll the selected date into the center of the viewport
    if (!dateStripRef.current) return;
    const selectedBtn = dateStripRef.current.querySelector('[data-selected="true"]');
    if (selectedBtn) {
      selectedBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate, activeTab]);

  if (!profile || !space) return null;

  // Generate 180 days strip centered around selectedDate
  const today = startOfDay(new Date());
  const dates = Array.from({ length: 180 }).map((_, i) => addDays(today, i - 90));

  const myTz = profile.timezone;
  const partnerTz = partnerProfile?.timezone || myTz;

  const dayStartAbs = selectedDate.getTime();
  const dayEndAbs = dayStartAbs + 24 * 60 * 60 * 1000;

  const visibleEvents = events.filter(e => e.endTime > dayStartAbs && e.startTime < dayEndAbs);
  
  const selectedDayEvents = events.filter(e => {
    const eStart = new Date(e.startTime);
    const dayStart = new Date(dayStartAbs);
    return isSameDay(eStart, dayStart);
  });

  const getEventStyle = (e: Event) => {
    const startMs = Math.max(e.startTime, dayStartAbs);
    const endMs = Math.min(e.endTime, dayEndAbs);
    
    const topPercent = ((startMs - dayStartAbs) / (24 * 60 * 60 * 1000)) * 100;
    const heightPercent = ((endMs - startMs) / (24 * 60 * 60 * 1000)) * 100;
    
    return {
      top: `${topPercent}%`,
      height: `${heightPercent}%`,
      backgroundColor: e.color || '#FBEAEB',
      borderColor: e.color ? 'rgba(0,0,0,0.05)' : '#E5A5A5',
    };
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(space.id);
    toast.success("邀请码已复制");
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAF8F5] relative pb-20">
      {/* Global Header & Date Strip (Visible in both Calendar & Overview) */}
      {(activeTab === 'calendar' || activeTab === 'overview') && (
        <div className="px-6 py-4 bg-[#FAF8F5]/90 backdrop-blur border-b border-[#EFE8E0] sticky top-0 z-20">
          <div className="flex justify-between items-end mb-4">
            <div className="relative">
              <h1 className="text-3xl font-bold tracking-tight text-[#5C4E4E] font-serif">
                {format(selectedDate, 'yyyy年 M月')}
              </h1>
              <input 
                type="date" 
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-');
                    setSelectedDate(new Date(Number(y), Number(m)-1, Number(d)));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {activeTab === 'calendar' && (
              <div className="flex gap-2">
                <button onClick={() => setViewMode('me')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${viewMode === 'me' ? 'bg-[#5C4E4E] text-[#FFFDF8] shadow-md' : 'bg-white border border-[#EFE8E0] text-[#8C7E7E] hover:bg-[#FDFBF9] shadow-sm'}`}>我</button>
                <button onClick={() => setViewMode('both')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${viewMode === 'both' ? 'bg-[#5C4E4E] text-[#FFFDF8] shadow-md' : 'bg-white border border-[#EFE8E0] text-[#8C7E7E] hover:bg-[#FDFBF9] shadow-sm'}`}>我们</button>
              </div>
            )}
          </div>

          {/* Date Strip - Scrollable */}
          <div ref={dateStripRef} className="flex overflow-x-auto no-scrollbar gap-2 bg-transparent pb-2 -mx-2 px-2 snap-x">
            {dates.map((d, i) => {
              const isSelected = isSameDay(d, selectedDate);
              return (
                <button 
                  key={i} 
                  onClick={() => setSelectedDate(d)}
                  data-selected={isSelected}
                  className={`flex-none flex flex-col items-center justify-center w-12 h-16 rounded-[20px] transition-all snap-center ${
                    isSelected ? 'bg-[#5C4E4E] text-[#FFFDF8] shadow-lg scale-105' : 'bg-white border border-[#EFE8E0] text-[#A99C9C] shadow-sm hover:bg-[#FDFBF9]'
                  }`}
                >
                  <span className={`text-[10px] uppercase mb-1 font-bold ${isSelected ? 'opacity-80' : ''}`}>{format(d, 'E', { locale: zhCN })}</span>
                  <span className="text-sm font-bold">{format(d, 'd')}</span>
                </button>
              )
            })}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <h2 className="text-sm font-bold text-[#5C4E4E]">
              {format(selectedDate, 'M月d日 · EEEE', { locale: zhCN })}
            </h2>
            <span className="text-xs font-medium text-[#8C7E7E] bg-white border border-[#EFE8E0] px-3 py-1.5 rounded-full shadow-sm">
               共 {visibleEvents.length} 个日程
            </span>
          </div>

          {partnerProfile && activeTab === 'calendar' && viewMode === 'both' ? (
             <div className="flex w-full mt-4 pr-2 pl-12 pt-4 border-t border-[#EFE8E0]">
              <div className="flex-1 flex flex-col items-start justify-center gap-0.5">
                <span className="text-[10px] font-bold text-[#6CB2A6] uppercase tracking-widest">{profile.displayName} (我)</span>
                <span className="text-[11px] font-medium text-[#A99C9C]">{formatInTimeZone(new Date(), myTz, 'HH:mm (Tz)')}</span>
              </div>
              <div className="flex-1 flex flex-col items-start justify-center gap-0.5 pl-2">
                <span className="text-[10px] font-bold text-[#D97E8B] uppercase tracking-widest">{partnerProfile.displayName}</span>
                <span className="text-[11px] font-medium text-[#A99C9C]">{formatInTimeZone(new Date(), partnerTz, 'HH:mm (Tz)')}</span>
              </div>
             </div>
          ) : activeTab === 'calendar' && viewMode === 'both' ? (
            <div className="w-full mt-4 p-4 bg-white rounded-3xl border border-dashed border-[#EFE8E0] text-center shadow-sm">
              <p className="text-[13px] text-[#8C7E7E] mb-3 font-medium">还没有伴侣加入空间哦</p>
              <button onClick={copyInviteCode} className="flex items-center justify-center gap-2 mx-auto text-xs px-5 py-2.5 bg-[#FBEAEB] text-[#D97E8B] rounded-full font-bold transition-transform hover:scale-105 shadow-sm">
                <Share className="w-3.5 h-3.5" /> 复制伴侣邀请码
              </button>
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'calendar' && (
      <div className="flex-1 overflow-y-auto relative no-scrollbar pb-32 pt-2">
        <div className="relative bg-[#FAF8F5]" style={{ height: '1440px' }}>
          
          <div className="absolute top-0 bottom-0 left-12 right-0 grid grid-rows-24 pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border-b border-dashed border-[#EFE8E0] flex items-start" style={{ height: '60px' }}>
              </div>
            ))}
          </div>

          <div className="absolute top-0 bottom-0 left-0 w-12 bg-transparent pointer-events-none text-center pr-1 text-[11px] font-bold text-[#A99C9C]">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="flex flex-col justify-start pt-1" style={{ height: '60px', marginTop: '-10px' }}>
                {i.toString().padStart(2, '0')}
              </div>
            ))}
          </div>

          {isSameDay(selectedDate, new Date()) && (
            <div 
              className="absolute left-10 right-0 border-b-2 border-[#D97E8B]/80 border-dashed z-10 flex items-center" 
              style={{ top: `${((new Date().getTime() - dayStartAbs) / (24*60*60*1000)) * 100}%` }}
            >
              <div className="bg-[#FAF8F5] border-2 border-[#D97E8B] text-[#D97E8B] text-[9px] font-bold px-2 py-0.5 rounded-full ml-1 shadow-sm relative -top-1">现在</div>
            </div>
          )}

          <div className="absolute top-0 bottom-0 left-12 right-2 flex">
            <div className="flex-1 border-r border-[#EFE8E0] relative px-1.5">
              {visibleEvents.filter(e => e.userId === user?.uid).map(e => (
                <div 
                  key={e.id}
                  className="absolute left-0.5 right-1.5 rounded-2xl p-2.5 overflow-hidden shadow-sm border border-white/50 backdrop-blur-sm flex flex-col justify-start"
                  style={{
                    ...getEventStyle(e),
                    backgroundColor: e.color || '#FBEAEB',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-[3px] h-3 rounded-full opacity-60 bg-[#5C4E4E]"></span>
                    <p className="text-[10px] font-bold text-[#5C4E4E]/70 leading-none tracking-widest">
                      {formatInTimeZone(e.startTime, myTz, 'HH:mm')}
                    </p>
                  </div>
                  <p className="text-[13px] font-bold text-[#5C4E4E] leading-tight truncate px-1">{e.title}</p>
                </div>
              ))}
            </div>

            {viewMode === 'both' && (
              <div className="flex-1 relative px-1.5">
                {visibleEvents.filter(e => partnerProfile && e.userId !== user?.uid).map(e => (
                  <div 
                    key={e.id}
                    className="absolute left-1.5 right-0.5 rounded-2xl p-2.5 overflow-hidden shadow-sm border border-white/50 backdrop-blur-sm flex flex-col justify-start"
                    style={{
                      ...getEventStyle(e),
                      backgroundColor: e.color || '#E5F2F0',
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-[3px] h-3 rounded-full opacity-60 bg-[#5C4E4E]"></span>
                      <p className="text-[10px] font-bold text-[#5C4E4E]/70 leading-none tracking-widest">
                         {formatInTimeZone(e.startTime, partnerTz, 'HH:mm')}
                      </p>
                    </div>
                    <p className="text-[13px] font-bold text-[#5C4E4E] leading-tight truncate px-1">{e.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {activeTab === 'overview' && (
        <div className="flex-1 px-6 pt-6 pb-32 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#EFE8E0] mb-6">
             <div className="flex justify-between items-center mb-6">
               <h2 className="font-bold text-[#5C4E4E] text-lg">日程概览</h2>
               <div className="p-2 bg-[#FAF8F5] rounded-full text-[#8C7E7E]">
                 <ListTodo className="w-5 h-5" />
               </div>
             </div>
             
             {selectedDayEvents.length > 0 ? (
               <div className="space-y-4">
                 {selectedDayEvents.sort((a,b)=>a.startTime - b.startTime).map(e => (
                   <div key={e.id} className="flex gap-4 items-center">
                     <div className="w-12 text-right">
                       <span className="text-xs font-bold text-[#A99C9C]">{formatInTimeZone(e.startTime, myTz, 'HH:mm')}</span>
                     </div>
                     <div className="flex-1 rounded-2xl p-4 border border-white/50 shadow-sm" style={{ backgroundColor: e.color || '#E8E0EE' }}>
                       <p className="text-sm font-bold text-[#5C4E4E]">{e.title}</p>
                       <p className="text-[10px] text-[#5C4E4E]/60 mt-1 uppercase tracking-wider">{e.userId === user?.uid ? profile.displayName : partnerProfile?.displayName}</p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#EFE8E0]">
                 <p className="text-sm text-[#8C7E7E] font-medium">当天没有安排任何日程~</p>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'us' && (
        <div className="flex-1 px-6 pt-12 pb-32 overflow-y-auto animate-in fade-in">
          <h1 className="text-3xl font-bold tracking-tight text-[#5C4E4E] font-serif mb-8">我们</h1>
          
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#EFE8E0] mb-6 flex items-center justify-between">
             <div className="flex flex-col gap-1">
               <span className="text-xs font-bold text-[#8C7E7E] uppercase tracking-widest">我的账号</span>
               <span className="text-lg font-bold text-[#5C4E4E]">{profile.displayName}</span>
             </div>
             <div className="w-12 h-12 rounded-full bg-[#E8E0EE] border-2 border-white shadow-sm flex items-center justify-center text-[#5C4E4E] font-bold text-xl">
                {profile.displayName.charAt(0).toUpperCase()}
             </div>
          </div>

          {partnerProfile ? (
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#EFE8E0] mb-6 flex items-center justify-between">
               <div className="flex flex-col gap-1">
                 <span className="text-xs font-bold text-[#8C7E7E] uppercase tracking-widest">伴侣账号</span>
                 <span className="text-lg font-bold text-[#5C4E4E]">{partnerProfile.displayName}</span>
               </div>
               <div className="w-12 h-12 rounded-full bg-[#FBEAEB] border-2 border-white shadow-sm flex items-center justify-center text-[#5C4E4E] font-bold text-xl">
                  {partnerProfile.displayName.charAt(0).toUpperCase()}
               </div>
            </div>
          ) : (
            <div className="w-full mt-4 p-6 bg-white rounded-3xl border border-dashed border-[#EFE8E0] text-center shadow-sm mb-6">
              <Heart className="w-6 h-6 text-[#EFA5A5] mx-auto mb-2 opacity-50" />
              <p className="text-sm text-[#8C7E7E] mb-3 font-medium">还没有伴侣加入。</p>
              <button onClick={copyInviteCode} className="flex items-center justify-center gap-2 mx-auto text-xs px-5 py-2.5 bg-[#FAF8F5] text-[#5C4E4E] border border-[#EFE8E0] rounded-full font-bold transition-transform hover:scale-105">
                <Share className="w-3 h-3" /> 复制邀请码
              </button>
            </div>
          )}
          
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#EFE8E0]">
            <span className="text-xs font-bold text-[#8C7E7E] uppercase tracking-widest mb-3 block">空间 ID (用于连接伴侣)</span>
            <div className="font-mono text-xs text-[#5C4E4E] bg-[#FAF8F5] p-3 rounded-2xl break-all">
               {space.id}
            </div>
          </div>
        </div>
      )}

      {/* Action Sheet Backdrop */}
      {actionSheetOpen && (
        <div 
          className="fixed inset-0 bg-[#5C4E4E]/20 backdrop-blur-sm z-40 animate-in fade-in"
          onClick={() => setActionSheetOpen(false)}
        />
      )}

      {/* Action Sheet Menu */}
      <div className={`fixed bottom-28 right-6 flex flex-col gap-3 items-end z-50 transition-all duration-300 ${actionSheetOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => {
            setActionSheetOpen(false);
            toast("待办功能敬请期待", { icon: '🚧' });
          }}
          className="flex items-center gap-3 pr-3 pl-4 py-2 bg-white rounded-full shadow-lg border border-[#EFE8E0] text-[#5C4E4E] font-bold text-sm hover:scale-105 transition-transform"
        >
          添加待办 <ListTodo className="w-4 h-4 text-[#8C7E7E]" />
        </button>
        <button 
          onClick={() => {
            setActionSheetOpen(false);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-3 pr-3 pl-4 py-2 bg-white rounded-full shadow-lg border border-[#EFE8E0] text-[#5C4E4E] font-bold text-sm hover:scale-105 transition-transform"
        >
          新建日程 <Calendar className="w-4 h-4 text-[#EFA5A5]" />
        </button>
      </div>

      {/* FAB - Gradient Button */}
      <button 
        onClick={() => setActionSheetOpen(!actionSheetOpen)}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-[#EFA5A5]/30 hover:scale-105 active:scale-95 transition-all z-50"
        style={{ background: 'linear-gradient(135deg, #EFA5A5 0%, #D97E8B 100%)', transform: actionSheetOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Real Tabs Navbar */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-white/90 backdrop-blur-xl flex items-start pt-4 justify-around px-2 pb-safe border-t border-[#EFE8E0] z-30 rounded-t-[32px] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
         <button onClick={() => { setActiveTab('overview'); setSelectedDate(startOfDay(new Date())); }} className={`flex flex-col items-center transition-colors gap-1.5 pt-0.5 ${activeTab === 'overview' ? 'text-[#EFA5A5]' : 'text-[#8C7E7E] hover:text-[#5C4E4E]'}`}>
           <Sun className={`w-[22px] h-[22px] stroke-[1.5] ${activeTab==='overview'?'stroke-[2] fill-[#EFA5A5]/20':''}`} />
           <span className="text-[10px] font-bold">概览</span>
         </button>
         <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center transition-colors gap-1.5 pt-0.5 ${activeTab === 'calendar' ? 'text-[#EFA5A5]' : 'text-[#8C7E7E] hover:text-[#5C4E4E]'}`}>
           <Calendar className={`w-[22px] h-[22px] stroke-[1.5] ${activeTab==='calendar'?'stroke-[2] fill-[#EFA5A5]/20':''}`} />
           <span className="text-[10px] font-bold">日历</span>
         </button>
         <button onClick={() => setActiveTab('us')} className={`flex flex-col items-center transition-colors gap-1.5 pt-0.5 ${activeTab === 'us' ? 'text-[#EFA5A5]' : 'text-[#8C7E7E] hover:text-[#5C4E4E]'}`}>
           <Heart className={`w-[22px] h-[22px] stroke-[1.5] ${activeTab==='us'?'stroke-[2] fill-[#EFA5A5]/20':''}`} />
           <span className="text-[10px] font-bold">我们</span>
         </button>
      </div>

       {isModalOpen && (
         <AddEventModal 
           onClose={() => setIsModalOpen(false)}
           selectedDate={selectedDate}
           spaceId={space.id}
           myTz={myTz}
           partnerTz={partnerTz}
         />
       )}

    </div>
  );
}

function AddEventModal({ onClose, selectedDate, spaceId, myTz }: { onClose: () => void, selectedDate: Date, spaceId: string, myTz: string, partnerTz: string }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [startClock, setStartClock] = useState('09:00');
  const [endClock, setEndClock] = useState('10:00');
  const [color, setColor] = useState('#E8E0EE'); // soft purple
  const [loading, setLoading] = useState(false);

  const colors = ['#E8E0EE', '#FBEAEB', '#FDF5DD', '#E5F2F0', '#E2EAF4'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;
    
    setLoading(true);

    const [sh, sm] = startClock.split(':').map(Number);
    const [eh, em] = endClock.split(':').map(Number);

    // Calculate absolute timestamp. The input is in user's local time for `selectedDate`
    // We can construct it via startOfDay + hours/mins
    const sDate = setMinutes(setHours(selectedDate, sh), sm);
    const eDate = setMinutes(setHours(selectedDate, eh), em);

    try {
      await addEvent(spaceId, {
        title,
        startTime: sDate.getTime(),
        endTime: eDate.getTime(),
        userId: user.uid,
        color
      });
      toast.success("日程已添加");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "添加失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#5C4E4E]/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in">
      <div className="bg-[#FAF8F5] w-full max-w-sm rounded-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 border border-[#EFE8E0] mb-2 sm:mb-0">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-[#5C4E4E] tracking-tight font-serif">添加日程</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-white shadow-sm text-[#8C7E7E] hover:bg-[#FDFBF9]"><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#8C7E7E] uppercase tracking-widest mb-2">标题</label>
            <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-white border border-[#EFE8E0] focus:ring-2 focus:ring-[#EFA5A5] px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all shadow-sm text-[#5C4E4E]" placeholder="如：吃早餐，开会..."/>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#8C7E7E] uppercase tracking-widest mb-2">开始时间</label>
              <input type="time" required value={startClock} onChange={e=>setStartClock(e.target.value)} className="w-full bg-white border border-[#EFE8E0] focus:ring-2 focus:ring-[#EFA5A5] px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all shadow-sm text-[#5C4E4E]" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#8C7E7E] uppercase tracking-widest mb-2">结束时间</label>
               <input type="time" required value={endClock} onChange={e=>setEndClock(e.target.value)} className="w-full bg-white border border-[#EFE8E0] focus:ring-2 focus:ring-[#EFA5A5] px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all shadow-sm text-[#5C4E4E]" />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-[#8C7E7E] uppercase tracking-widest mb-3">颜色标记</label>
             <div className="flex gap-4">
                {colors.map(c => (
                  <button type="button" key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-full border-[3px] transition-all shadow-sm ${color === c ? 'border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }}></button>
                ))}
             </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 mt-8 bg-[#5C4E4E] shadow-xl text-[#FFFDF8] rounded-full font-bold hover:bg-[#4A3E3E] active:scale-95 transition-all">保存日程</button>
        </form>
      </div>
    </div>
  );
}
