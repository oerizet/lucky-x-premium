import React, { useState, useMemo } from 'react';
import { Playlist, Channel, AppSettings } from '../types';
import { Grid3X3, Plus, X, Tv } from 'lucide-react';
import Player from './Player';

interface MultiViewProps {
  playlist: Playlist | null;
  accentColor: string;
  settings: AppSettings;
}

const MultiView: React.FC<MultiViewProps> = ({ playlist, accentColor, settings }) => {
  const [slots, setSlots] = useState<(Channel | null)[]>([null, null, null, null]);
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filteredChannels = useMemo(() => {
    if (!playlist?.channels) return [];
    return playlist.channels.filter(ch => 
      ch.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 50);
  }, [playlist, search]);

  const handleSelectChannel = (channel: Channel) => {
    if (selectingSlot !== null) {
      const newSlots = [...slots];
      newSlots[selectingSlot] = channel;
      setSlots(newSlots);
      setSelectingSlot(null);
      setSearch('');
    }
  };

  const removeSlot = (idx: number) => {
    const newSlots = [...slots];
    newSlots[idx] = null;
    setSlots(newSlots);
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="p-4 bg-zinc-900 border-b border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Grid3X3 className="text-zinc-500" size={20} />
            <h2 className="text-sm font-black uppercase tracking-widest">Multi-Screen Matrix</h2>
         </div>
         <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Click a slot to assign a channel</p>
      </div>

      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-zinc-950">
        {slots.map((slot, idx) => (
          <div key={idx} className="relative bg-zinc-900/50 flex items-center justify-center group overflow-hidden border border-white/5">
            {slot ? (
              <div className="w-full h-full relative">
                 <Player 
                   channel={slot} 
                   onClose={() => removeSlot(idx)} 
                   onNext={() => {}} 
                   onPrev={() => {}} 
                   playerEngine={settings.playerLive} 
                   bufferSize={1} 
                 />
                 <div className="absolute top-2 left-2 z-[120] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => removeSlot(idx)} className="p-1.5 bg-rose-600 rounded-lg text-white shadow-lg"><X size={14} /></button>
                 </div>
              </div>
            ) : (
              <button 
                onClick={() => setSelectingSlot(idx)}
                className="flex flex-col items-center gap-3 text-zinc-700 hover:text-zinc-400 transition-colors"
              >
                <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-current flex items-center justify-center">
                  <Plus size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Stream</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {selectingSlot !== null && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl p-10 flex items-center justify-center">
           <div className="w-full max-w-2xl bg-zinc-900 rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight">Select Channel for Slot {selectingSlot + 1}</h3>
                <button onClick={() => setSelectingSlot(null)} className="p-2 bg-white/5 rounded-xl"><X size={20} /></button>
              </div>
              <div className="p-6 bg-zinc-950">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Quick search..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm font-bold outline-none" 
                />
              </div>
              <div className="flex-1 overflow-auto p-4 grid grid-cols-2 gap-2">
                {filteredChannels.map(ch => (
                  <button 
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch)}
                    className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                       {ch.logo ? <img src={ch.logo} className="w-full h-full object-contain" alt="" /> : <Tv size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase truncate">{ch.name}</p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase truncate">{ch.group}</p>
                    </div>
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MultiView;