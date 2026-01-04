
import React, { useState, useEffect } from 'react';
import { Channel, EPGProgram, Playlist } from '../types';
import { X, Play, Heart, Globe, Tag, Hash, Link as LinkIcon, Calendar, Clock, Loader2, ShieldCheck, Activity, Timer } from 'lucide-react';
import { fetchChannelEPG } from '../services/xtreamCodes';

interface ChannelDetailProps {
  channel: Channel;
  xtreamConfig?: Playlist['xtreamConfig'];
  onClose: () => void;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: () => void;
  accentColor: 'blue' | 'gold' | 'emerald' | 'rose';
}

const ChannelDetail: React.FC<ChannelDetailProps> = ({ channel, xtreamConfig, onClose, onPlay, onToggleFavorite, accentColor }) => {
  const [epgData, setEpgData] = useState<EPGProgram[]>([]);
  const [loadingEpg, setLoadingEpg] = useState(false);

  useEffect(() => {
    if (xtreamConfig && channel.streamId) {
      setLoadingEpg(true);
      fetchChannelEPG(xtreamConfig, channel.streamId).then(data => {
        setEpgData(data);
        setLoadingEpg(false);
      });
    }
  }, [channel.id, xtreamConfig]);

  const getAccentText = () => {
    switch(accentColor) {
      case 'blue': return 'text-blue-500';
      case 'gold': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'rose': return 'text-rose-500';
      default: return 'text-blue-500';
    }
  };

  const getAccentBg = () => {
    switch(accentColor) {
      case 'blue': return 'bg-blue-600';
      case 'gold': return 'bg-amber-600';
      case 'emerald': return 'bg-emerald-600';
      case 'rose': return 'bg-rose-600';
      default: return 'bg-blue-600';
    }
  };

  const getAccentBorder = () => {
    switch(accentColor) {
      case 'blue': return 'border-blue-500/50';
      case 'gold': return 'border-amber-500/50';
      case 'emerald': return 'border-emerald-500/50';
      case 'rose': return 'border-rose-500/50';
      default: return 'border-blue-500/50';
    }
  };

  const getAccentBtn = () => {
    switch(accentColor) {
      case 'blue': return 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30';
      case 'gold': return 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30';
      case 'rose': return 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30';
      default: return 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30';
    }
  };

  const getProgress = (start?: number, end?: number) => {
    if (!start || !end) return 0;
    const now = Date.now() / 1000;
    const total = end - start;
    const current = now - start;
    return Math.min(100, Math.max(0, (current / total) * 100));
  };

  const getTimeRemaining = (end?: number) => {
    if (!end) return null;
    const now = Date.now() / 1000;
    const remainingSeconds = end - now;
    if (remainingSeconds <= 0) return 'Ending now';
    const minutes = Math.floor(remainingSeconds / 60);
    return `${minutes} min left`;
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-zinc-900 w-full max-w-4xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        <div className="w-full lg:w-80 bg-zinc-950 p-8 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="w-48 h-48 bg-zinc-900 rounded-3xl p-6 shadow-2xl flex items-center justify-center border border-white/5 group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             {channel.logo ? (
                <img 
                  src={channel.logo} 
                  alt={channel.name} 
                  className="max-w-full max-h-full object-contain relative z-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${channel.id}/200/200`;
                  }}
                />
             ) : (
                <div className="text-4xl font-black text-zinc-700 uppercase tracking-widest">{channel.name.substring(0, 2)}</div>
             )}
          </div>
          
          <button 
            onClick={onToggleFavorite}
            className={`mt-8 flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
              channel.isFavorite 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <Heart size={14} fill={channel.isFavorite ? "currentColor" : "none"} />
            {channel.isFavorite ? 'In Favorites' : 'Add to Favorites'}
          </button>

          <div className="mt-8 w-full space-y-3">
             <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5"><ShieldCheck size={12} /> SECURE FEED</p>
             </div>
             <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Stream Type</p>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-tight">{channel.url.split('.').pop()?.toUpperCase() || 'MPEG-TS'}</p>
             </div>
          </div>
        </div>

        <div className="flex-1 p-8 lg:p-10 flex flex-col max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase leading-tight">{channel.name}</h2>
              <p className={`${getAccentText()} font-black uppercase tracking-[0.2em] text-[10px]`}>{channel.group || 'UNGROUPED'}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8 flex-1">
             <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Calendar size={14} /> Program Guide
                  </h3>
                  {epgData.length > 0 && !loadingEpg && (
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                      <Timer size={10} /> Live Updates
                    </span>
                  )}
                </div>
                
                {loadingEpg ? (
                   <div className="p-12 flex flex-col items-center justify-center bg-zinc-950/50 rounded-3xl border border-white/5 text-zinc-500">
                      <Loader2 className="animate-spin mb-3" size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Fetching Latest Guide...</p>
                   </div>
                ) : epgData.length > 0 ? (
                   <div className="space-y-5">
                      {epgData.slice(0, 2).map((prog, idx) => {
                         const isNowPlaying = idx === 0;
                         const progress = getProgress(prog.start_timestamp, prog.end_timestamp);
                         const remaining = getTimeRemaining(prog.end_timestamp);
                         
                         return (
                            <div 
                              key={idx} 
                              className={`p-6 rounded-[2rem] border transition-all ${
                                isNowPlaying 
                                  ? `bg-zinc-800/60 ${getAccentBorder()} shadow-xl shadow-black/20 relative overflow-hidden` 
                                  : 'bg-zinc-950/30 border-white/5 opacity-70'
                              }`}
                            >
                               {isNowPlaying && (
                                 <div className={`absolute top-0 right-0 px-4 py-1.5 ${getAccentBg()} text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl flex items-center gap-1.5`}>
                                   <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                   Live
                                 </div>
                               )}
                               
                               <div className="flex justify-between items-center mb-3">
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${isNowPlaying ? getAccentText() : 'text-zinc-500'}`}>
                                     {isNowPlaying ? 'Now Playing' : 'Up Next'}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-zinc-600" />
                                    <p className="text-[10px] font-mono text-zinc-500">
                                      {prog.start.split(' ')[1]?.slice(0, 5) || '--:--'} - {prog.end.split(' ')[1]?.slice(0, 5) || '--:--'}
                                    </p>
                                  </div>
                               </div>
                               
                               <h4 className={`text-xl font-black uppercase tracking-tight mb-2 ${isNowPlaying ? 'text-white' : 'text-zinc-300'}`}>
                                 {prog.title}
                               </h4>
                               
                               <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-5">
                                 {prog.description || 'No description available for this program.'}
                               </p>
                               
                               {isNowPlaying && (
                                  <div className="space-y-2">
                                     <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Progress</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${getAccentText()}`}>{remaining}</span>
                                     </div>
                                     <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                           className={`h-full ${getAccentBg()} transition-all duration-1000 shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]`} 
                                           style={{ width: `${progress}%` }} 
                                        />
                                     </div>
                                  </div>
                               )}
                            </div>
                         );
                      })}
                   </div>
                ) : (
                   <div className="p-12 bg-zinc-950/50 rounded-3xl border border-white/5 border-dashed text-center">
                      <Activity size={32} className="mx-auto mb-3 text-zinc-700" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">No Guide Data</p>
                      <p className="text-xs text-zinc-500">EPG is not available for this stream at this time.</p>
                   </div>
                )}
             </section>

             <section className="grid grid-cols-2 gap-4">
                <DetailRow icon={<Hash size={16} />} label="Service ID" value={channel.tvgId || "N/A"} />
                <DetailRow icon={<Activity size={16} />} label="Feed Stability" value="100% (High)" />
                <DetailRow icon={<Globe size={16} />} label="Protocol" value={channel.url.startsWith('https') ? 'HTTPS (Secure)' : 'HTTP (Legacy)'} />
                <DetailRow icon={<LinkIcon size={16} />} label="Endpoint" value={channel.url} isMonospace isTruncated />
             </section>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex gap-4">
             <button 
                onClick={() => onPlay(channel)}
                className={`flex-1 ${getAccentBtn()} py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 text-white`}
             >
                <Play fill="currentColor" size={20} className="ml-1" />
                Initialize Playback
             </button>
             <button 
                onClick={onClose}
                className="px-10 bg-zinc-800 hover:bg-zinc-700 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all text-white border border-white/5"
             >
                Close
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isMonospace?: boolean;
  isTruncated?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value, isMonospace, isTruncated }) => (
  <div className="flex items-start gap-3 p-3 bg-zinc-950/30 rounded-2xl border border-white/5">
    <div className="mt-1 text-zinc-500 shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">{label}</p>
      <div className={`text-[11px] font-bold text-zinc-300 ${isMonospace ? 'font-mono' : ''} ${isTruncated ? 'truncate' : 'break-words'}`}>
        {value}
      </div>
    </div>
  </div>
);

export default ChannelDetail;
