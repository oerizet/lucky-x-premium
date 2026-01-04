import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Channel } from '../types';
import { Play, Heart, Edit2, Check, X, Search, Info, Link as LinkIcon } from 'lucide-react';

interface ChannelGridProps {
  channels: Channel[];
  onPlay: (channel: Channel) => void;
  onInfo: (channel: Channel) => void;
  onEdit: (channel: Channel, updates: Partial<Channel>) => void;
  onToggleFavorite: (channel: Channel) => void;
  accentColor: 'blue' | 'gold' | 'emerald' | 'rose';
}

const PAGE_SIZE = 60;

const ChannelGrid: React.FC<ChannelGridProps> = ({ channels, onPlay, onInfo, onEdit, onToggleFavorite, accentColor }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempGroup, setTempGroup] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [channels]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < channels.length) {
          setVisibleCount(prev => prev + PAGE_SIZE);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, channels.length]);

  const startEditing = (ch: Channel) => {
    setEditingId(ch.id);
    setTempName(ch.name);
    setTempGroup(ch.group);
    setTempUrl(ch.url);
  };

  const saveEdit = (ch: Channel) => {
    onEdit(ch, { name: tempName, group: tempGroup, url: tempUrl });
    setEditingId(null);
  };

  const getAccentHoverBg = () => {
    switch(accentColor) {
      case 'blue': return 'bg-blue-900/40';
      case 'gold': return 'bg-amber-900/40';
      case 'emerald': return 'bg-emerald-900/40';
      case 'rose': return 'bg-rose-900/40';
      default: return 'bg-blue-900/40';
    }
  };

  const getAccentText = () => {
    switch(accentColor) {
      case 'blue': return 'text-blue-500';
      case 'gold': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'rose': return 'text-rose-500';
      default: return 'text-blue-500';
    }
  };

  const getAccentBtn = () => {
    switch(accentColor) {
      case 'blue': return 'bg-blue-600';
      case 'gold': return 'bg-amber-600';
      case 'emerald': return 'bg-emerald-600';
      case 'rose': return 'bg-rose-600';
      default: return 'bg-blue-600';
    }
  };

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <Search size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-bold uppercase tracking-tight">No Channels Found</p>
        <p className="text-sm font-medium opacity-60 text-center">Update your source or adjust filters</p>
      </div>
    );
  }

  const visibleChannels = channels.slice(0, visibleCount);

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
        {visibleChannels.map((channel) => (
          <div 
            key={channel.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onPlay(channel);
            }}
            className={`group relative bg-zinc-900 rounded-[1.25rem] overflow-hidden border border-white/5 transition-all flex flex-col shadow-xl shadow-black/10`}
          >
            {/* Logo Container */}
            <div className="aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden relative">
              {channel.logo ? (
                <img 
                  src={channel.logo} 
                  alt={channel.name} 
                  className="w-full h-full object-contain p-3 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${channel.id}/200/150`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600 font-black text-xl uppercase tracking-widest">
                  {channel.name.substring(0, 2)}
                </div>
              )}
              
              <div className={`absolute inset-0 ${getAccentHoverBg()} backdrop-blur-sm opacity-0 group-focus:opacity-100 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2`}>
                <button 
                  tabIndex={-1}
                  onClick={() => onPlay(channel)}
                  className={`w-10 h-10 rounded-full bg-white ${getAccentText()} flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl`}
                >
                  <Play fill="currentColor" size={20} className="ml-1" />
                </button>
                <button 
                  tabIndex={-1}
                  onClick={() => onInfo(channel)}
                  className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl border border-white/10"
                >
                  <Info size={18} />
                </button>
              </div>

              <button 
                tabIndex={-1}
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(channel); }}
                className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all ${
                  channel.isFavorite ? 'bg-rose-600 text-white shadow-lg' : 'bg-black/50 text-white/50 hover:text-white'
                }`}
              >
                <Heart size={14} fill={channel.isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="p-3 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-xs font-black truncate text-zinc-100 leading-tight flex-1 uppercase tracking-tight">{channel.name}</h4>
                <button 
                  tabIndex={-1}
                  onClick={() => startEditing(channel)}
                  className={`text-zinc-600 hover:${getAccentText()} opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <Edit2 size={12} />
                </button>
              </div>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest truncate bg-zinc-800/50 px-2 py-0.5 rounded-full w-fit max-w-full">
                {channel.group || 'General'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {visibleCount < channels.length && (
        <div ref={loadMoreRef} className="w-full h-20 flex items-center justify-center mt-10">
          <div className="flex items-center gap-3 text-zinc-500 text-xs font-black uppercase tracking-widest">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
            Loading more channels...
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelGrid;