import React, { useState, useEffect, useMemo } from 'react';
import { Playlist, Channel, EPGProgram } from '../types';
import { Search, Calendar, Clock, Tv, ChevronRight, Play } from 'lucide-react';
import { fetchChannelEPG } from '../services/xtreamCodes';

interface EPGGuideProps {
  playlist: Playlist | null;
  onPlay: (channel: Channel) => void;
  accentColor: string;
  epgShift: number;
}

const EPGGuide: React.FC<EPGGuideProps> = ({ playlist, onPlay, accentColor, epgShift }) => {
  const [search, setSearch] = useState('');
  const [epgData, setEpgData] = useState<Record<string, EPGProgram[]>>({});
  const [loadingChannels, setLoadingChannels] = useState<Set<string>>(new Set());

  const filteredChannels = useMemo(() => {
    if (!playlist) return [];
    return playlist.channels.filter(ch => 
      ch.name.toLowerCase().includes(search.toLowerCase()) || 
      ch.group.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 50); 
  }, [playlist, search]);

  useEffect(() => {
    if (filteredChannels.length > 0 && playlist?.xtreamConfig) {
      const config = playlist.xtreamConfig;
      filteredChannels.forEach(async (ch) => {
        if (!epgData[ch.id] && ch.streamId && !loadingChannels.has(ch.id)) {
          setLoadingChannels(prev => new Set(prev).add(ch.id));
          try {
            const data = await fetchChannelEPG(config, ch.streamId);
            setEpgData(prev => ({ ...prev, [ch.id]: data }));
          } catch (e) {
            console.error('Failed to load EPG for', ch.name);
          } finally {
            setLoadingChannels(prev => {
              const next = new Set(prev);
              next.delete(ch.id);
              return next;
            });
          }
        }
      });
    }
  }, [filteredChannels, playlist?.xtreamConfig]);

  const getAccentText = () => {
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

  const formatEPGTime = (timestamp?: number) => {
    if (!timestamp) return '--:--';
    const date = new Date((timestamp + (epgShift * 3600)) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="p-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl ${getAccentBg()}`}>
            <Calendar size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">TV Guide</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Full Playlist Timeline</p>
          </div>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search channel or group..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800 border-none rounded-xl py-2 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-amber-500 transition-all outline-none" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {filteredChannels.map(channel => {
          const channelEPG = epgData[channel.id] || [];
          const currentProgram = channelEPG[0];
          const nextProgram = channelEPG[1];

          return (
            <div 
              key={channel.id} 
              className="flex gap-2 group hover:scale-[1.01] transition-transform"
            >
              <div className="w-64 bg-zinc-900 rounded-2xl p-3 border border-white/5 shrink-0 flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
                  {channel.logo ? (
                    <img src={channel.logo} className="max-w-full max-h-full object-contain p-1" alt="" />
                  ) : (
                    <Tv size={20} className="text-zinc-700" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] font-black uppercase truncate text-zinc-200">{channel.name}</h4>
                  <p className="text-[9px] font-bold text-zinc-600 truncate uppercase tracking-tighter">{channel.group}</p>
                </div>
                <button 
                  onClick={() => onPlay(channel)}
                  className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-white/5 hover:${getAccentBg()} hover:text-white transition-all`}
                >
                  <Play size={14} fill="currentColor" />
                </button>
              </div>

              <div className="flex-1 flex gap-2">
                {currentProgram ? (
                  <div className={`flex-1 bg-zinc-900/40 rounded-2xl p-3 border ${getAccentText().replace('text-', 'border-')}/20 flex flex-col justify-center relative overflow-hidden`}>
                     <div className={`absolute top-0 left-0 bottom-0 w-1 ${getAccentBg()} opacity-50`} />
                     <div className="flex items-center justify-between mb-1">
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${getAccentText()}`}>Live Now</span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {formatEPGTime(currentProgram.start_timestamp)} - {formatEPGTime(currentProgram.end_timestamp)}
                        </span>
                     </div>
                     <h5 className="text-[10px] font-bold uppercase truncate">{currentProgram.title}</h5>
                  </div>
                ) : (
                  <div className="flex-1 bg-zinc-900/10 rounded-2xl border border-white/5 flex items-center justify-center text-zinc-700 text-[9px] font-bold uppercase tracking-widest">
                    No Guide Data
                  </div>
                )}

                {nextProgram && (
                  <div className="w-1/3 bg-zinc-900/20 rounded-2xl p-3 border border-white/5 flex flex-col justify-center opacity-60">
                     <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Next</span>
                        <span className="text-[9px] font-mono text-zinc-500">{formatEPGTime(nextProgram.start_timestamp)}</span>
                     </div>
                     <h5 className="text-[10px] font-bold uppercase truncate">{nextProgram.title}</h5>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EPGGuide;