
import React, { useState } from 'react';
import { ViewMode } from '../types';
// Fixed: Added RotateCcw to the imports from lucide-react
import { Tv, Film, PlaySquare, List, Heart, Settings, User, Crown, ShieldCheck, Grid3X3, Calendar, RefreshCw, Activity, Info, RotateCcw } from 'lucide-react';

interface DashboardProps {
  setView: (view: ViewMode) => void;
  playlistCount: number;
  activePlaylistName?: string;
  isPremium: boolean;
  accentColor: 'blue' | 'gold' | 'emerald' | 'rose';
  onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, playlistCount, activePlaylistName, isPremium, accentColor, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getAccentColor = () => {
    switch(accentColor) {
      case 'blue': return 'text-blue-500';
      case 'gold': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'rose': return 'text-rose-500';
      default: return 'text-amber-500';
    }
  };

  const getAccentBg = () => {
    switch(accentColor) {
      case 'blue': return 'bg-blue-600';
      case 'gold': return 'bg-amber-600';
      case 'emerald': return 'bg-emerald-600';
      case 'rose': return 'bg-rose-600';
      default: return 'bg-amber-600';
    }
  };

  return (
    <div className="h-full p-6 lg:p-10 overflow-auto bg-zinc-950">
      <div className="max-w-7xl mx-auto flex flex-col h-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-[2rem] ${getAccentBg()} flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10`}>
              <Tv size={42} className="text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">LUCKY <span className={getAccentColor()}>X PRO</span></h1>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  {activePlaylistName || 'Guest Mode'}
                </span>
                {isPremium && (
                  <div className="flex items-center gap-1 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                    <Crown size={12} /> Lifetime
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className={`p-4 rounded-2xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white transition-all flex items-center gap-2 group ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-amber-500' : 'group-hover:rotate-180 transition-transform duration-500'} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Refresh Data</span>
            </button>
            <div className="flex items-center gap-4 bg-zinc-900/50 p-2 pr-6 rounded-2xl border border-white/5 glass">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                <User size={24} />
              </div>
              <div>
                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">Account Status</p>
                <p className="text-xs font-black uppercase flex items-center gap-1.5">
                  Pro Active <ShieldCheck size={14} className="text-emerald-500" />
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MainTile title="Live TV" sub="Watch Live Streams" icon={<Tv size={64} />} color="bg-amber-600" onClick={() => setView(ViewMode.LIVE_TV)} />
          <MainTile title="Movies" sub="VOD Selection" icon={<Film size={64} />} color="bg-rose-600" onClick={() => setView(ViewMode.VOD)} />
          <MainTile title="Series" sub="Latest Episodes" icon={<PlaySquare size={64} />} color="bg-indigo-600" onClick={() => setView(ViewMode.SERIES)} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mt-6">
          <SubTile title="EPG Guide" icon={<Calendar size={28} />} onClick={() => setView(ViewMode.EPG_GUIDE)} />
          <SubTile title="Favorites" icon={<Heart size={28} />} onClick={() => setView(ViewMode.FAVORITES)} />
          <SubTile title="Multi-View" icon={<Grid3X3 size={28} />} onClick={() => setView(ViewMode.MULTI_VIEW)} />
          <SubTile title="Catch Up" icon={<RotateCcw size={28} />} onClick={() => {}} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mt-4">
          <SubTile title="Playlists" icon={<List size={28} />} onClick={() => setView(ViewMode.PLAYLIST_EDITOR)} />
          <SubTile title="Settings" icon={<Settings size={28} />} onClick={() => setView(ViewMode.SETTINGS)} />
          <SubTile title="Speed Test" icon={<Activity size={28} />} onClick={() => {}} />
          <SubTile title="Account" icon={<Info size={28} />} onClick={() => {}} />
        </div>

        <footer className="mt-auto py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center opacity-40">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Lucky X Premium • Unified IPTV Suite v2.9.0</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <span className="text-[9px] font-black uppercase tracking-widest">Device ID: 9283-X10</span>
             <span className="text-[9px] font-black uppercase tracking-widest">Expiry: Dec 2029</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

const MainTile = ({ title, sub, icon, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className="group relative h-64 rounded-[2.5rem] overflow-hidden transition-all active:scale-95 border border-white/10 shadow-2xl"
  >
    <div className={`absolute inset-0 ${color} opacity-90 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-500`} />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <div className="relative h-full p-8 flex flex-col justify-end">
       <div className="mb-auto text-white group-hover:scale-110 group-focus:scale-110 transition-transform duration-500 drop-shadow-2xl">
         {icon}
       </div>
       <div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">{title}</h3>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{sub}</p>
       </div>
    </div>
    <div className="absolute bottom-8 right-8 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 opacity-0 group-hover:opacity-100 group-focus:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all flex items-center justify-center">
       <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
    </div>
  </button>
);

const SubTile = ({ title, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className="group h-32 bg-zinc-900 rounded-[1.5rem] border border-white/5 hover:border-white/20 transition-all active:scale-95 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="text-zinc-500 group-hover:text-white transition-colors">
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors">{title}</span>
  </button>
);

export default Dashboard;
