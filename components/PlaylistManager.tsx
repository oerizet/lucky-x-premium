import React, { useState, useMemo } from 'react';
import { Playlist, Channel } from '../types';
import { 
  PlusCircle, 
  Trash2, 
  List, 
  FileUp, 
  CheckCircle, 
  Database, 
  Edit2, 
  Check, 
  X, 
  Server, 
  ShieldCheck,
  Globe,
  Loader2,
  Settings2,
  AlertTriangle,
  Zap,
  LayoutGrid,
  Search,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { fetchXtreamData } from '../services/xtreamCodes';

interface PlaylistManagerProps {
  playlists: Playlist[];
  onAdd: (name: string, content: string | Channel[], xtreamConfig?: Playlist['xtreamConfig']) => void;
  onUpdate: (id: string, updates: Partial<Playlist>) => void;
  onDelete: (id: string) => void;
  onSelect: (playlist: Playlist) => void;
  activePlaylist: Playlist | null;
}

type AddMode = 'm3u' | 'xtream' | 'custom';

const PlaylistManager: React.FC<PlaylistManagerProps> = ({ playlists, onAdd, onUpdate, onDelete, onSelect, activePlaylist }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('m3u');
  const [playlistName, setPlaylistName] = useState('');
  const [useProxy, setUseProxy] = useState(true);
  
  // M3U State
  const [m3uUrl, setM3uUrl] = useState('');
  const [m3uText, setM3uText] = useState('');
  
  // Xtream State
  const [xtreamUrl, setXtreamUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [proxyUrl, setProxyUrl] = useState('https://corsproxy.io/?');
  
  // Custom List State
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [customSearch, setCustomSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setM3uText(content);
        if (!playlistName) setPlaylistName(file.name.replace(/\.[^/.]+$/, ""));
      };
      reader.readAsText(file);
    }
  };

  const handleFetchUrl = async () => {
    if (!m3uUrl) return;
    setLoading(true);
    setError(null);
    try {
      const targetUrl = useProxy ? `${proxyUrl}${encodeURIComponent(m3uUrl)}` : m3uUrl;
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error('Failed to fetch M3U file');
      const text = await response.text();
      setM3uText(text);
      if (!playlistName) setPlaylistName('Remote Playlist');
    } catch (err) {
      setError("Could not fetch playlist. Try using a proxy in the Xtream tab settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleXtreamLogin = async () => {
    if (!xtreamUrl || !username || !password) return;
    setLoading(true);
    setError(null);
    try {
      const xtreamConfig = { 
        url: xtreamUrl, 
        username, 
        password, 
        proxyUrl: useProxy ? proxyUrl : undefined 
      };
      const channels = await fetchXtreamData(xtreamConfig);
      onAdd(playlistName || 'Xtream IPTV', channels, xtreamConfig);
      setIsAdding(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Xtream server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustom = () => {
    if (!playlistName || selectedChannels.size === 0) return;
    
    const allChannels = playlists.flatMap(p => p.channels);
    const channelsToAdd = allChannels.filter(c => selectedChannels.has(c.id));
    
    onAdd(playlistName, channelsToAdd);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setPlaylistName('');
    setM3uText('');
    setM3uUrl('');
    setXtreamUrl('');
    setUsername('');
    setPassword('');
    setSelectedChannels(new Set());
    setError(null);
  };

  const toggleChannelSelection = (id: string) => {
    const next = new Set(selectedChannels);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedChannels(next);
  };

  const filteredAvailableChannels = useMemo(() => {
    const all = playlists.flatMap(p => p.channels);
    if (!customSearch) return all.slice(0, 500); // Increased limit for custom picks
    return all.filter(c => 
      c.name.toLowerCase().includes(customSearch.toLowerCase()) || 
      c.group.toLowerCase().includes(customSearch.toLowerCase())
    ).slice(0, 500);
  }, [playlists, customSearch]);

  const handleCheckAll = () => {
    const next = new Set(selectedChannels);
    filteredAvailableChannels.forEach(c => next.add(c.id));
    setSelectedChannels(next);
  };

  const handleClearAll = () => {
    const next = new Set(selectedChannels);
    filteredAvailableChannels.forEach(c => next.delete(c.id));
    setSelectedChannels(next);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Manage <span className="text-blue-500">Playlists</span></h2>
          <p className="text-zinc-500">Import from URLs, files, or server APIs</p>
        </div>
        <button 
          tabIndex={0}
          onClick={() => setIsAdding(true)}
          onKeyDown={(e) => e.key === 'Enter' && setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20 active:scale-95 focus:ring-2 focus:ring-blue-400"
        >
          <PlusCircle size={20} />
          Import New
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-900 rounded-3xl p-8 border border-white/5 shadow-2xl mb-10 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4 mb-8 bg-zinc-950 p-1.5 rounded-2xl w-fit">
            {(['m3u', 'xtream', 'custom'] as const).map(mode => (
              <button 
                key={mode}
                tabIndex={0}
                onClick={() => setAddMode(mode)}
                onKeyDown={(e) => e.key === 'Enter' && setAddMode(mode)}
                className={`px-6 py-2 rounded-xl font-bold transition-all capitalize ${addMode === mode ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {mode === 'm3u' ? 'M3U / File' : mode === 'xtream' ? 'Xtream Codes' : 'Custom List'}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Playlist Name</label>
              <input 
                tabIndex={0}
                type="text" 
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder={addMode === 'custom' ? "My Favorite Channels" : "My IPTV Provider"}
                className="w-full bg-zinc-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            {addMode === 'm3u' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-zinc-500 uppercase">Local File</label>
                  <div className="relative group" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.querySelector('input') as any)?.click()}>
                    <input type="file" onChange={handleFileUpload} accept=".m3u,.m3u8" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-2xl p-8 flex flex-col items-center justify-center group-hover:border-blue-500 transition-colors group-focus:border-blue-500">
                      <FileUp size={32} className="text-zinc-600 mb-2" />
                      <p className="text-sm text-zinc-400">Select .m3u file</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-zinc-500 uppercase">Remote URL</label>
                  <div className="flex gap-2">
                    <input tabIndex={0} type="text" value={m3uUrl} onChange={(e) => setM3uUrl(e.target.value)} placeholder="http://domain.com/list.m3u" className="flex-1 bg-zinc-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none" />
                    <button tabIndex={0} onClick={handleFetchUrl} disabled={loading} className="bg-zinc-700 hover:bg-zinc-600 px-4 rounded-xl font-bold disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" size={20} /> : 'Fetch'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {addMode === 'xtream' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Server URL</label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input tabIndex={0} type="text" value={xtreamUrl} onChange={(e) => setXtreamUrl(e.target.value)} placeholder="http://provider.com:8080" className="w-full bg-zinc-800 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Username</label>
                  <input tabIndex={0} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full bg-zinc-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Password</label>
                  <input tabIndex={0} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex items-end">
                  <button tabIndex={0} onClick={handleXtreamLogin} disabled={loading || !xtreamUrl} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all disabled:opacity-30 flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-400">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    {loading ? 'Authenticating...' : 'Connect API'}
                  </button>
                </div>
              </div>
            )}

            {addMode === 'custom' && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                      <label className="block text-xs font-bold text-zinc-500 uppercase">Select Channels ({selectedChannels.size})</label>
                      <div className="flex gap-2">
                         <button 
                            tabIndex={0}
                            onClick={handleCheckAll}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheckAll()}
                            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all focus:ring-1 focus:ring-white/20"
                         >
                            <CheckSquare size={12} /> Check All
                         </button>
                         <button 
                            tabIndex={0}
                            onClick={handleClearAll}
                            onKeyDown={(e) => e.key === 'Enter' && handleClearAll()}
                            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all focus:ring-1 focus:ring-white/20"
                         >
                            <Square size={12} /> Clear All
                         </button>
                      </div>
                   </div>
                   <div className="relative w-full md:w-64">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        tabIndex={0}
                        type="text" 
                        value={customSearch} 
                        onChange={e => setCustomSearch(e.target.value)} 
                        placeholder="Search for channels..." 
                        className="w-full bg-zinc-950 border border-white/5 rounded-lg py-1.5 pl-9 pr-3 text-[10px] outline-none focus:ring-2 focus:ring-blue-500"
                      />
                   </div>
                </div>
                
                <div className="bg-zinc-950 border border-white/5 rounded-2xl h-64 overflow-y-auto p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                   {playlists.length === 0 ? (
                     <div className="col-span-2 h-full flex items-center justify-center text-zinc-600 text-xs font-bold">Import a playlist first to pick channels</div>
                   ) : filteredAvailableChannels.map(channel => (
                     <div 
                        key={channel.id} 
                        tabIndex={0}
                        onClick={() => toggleChannelSelection(channel.id)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleChannelSelection(channel.id)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${selectedChannels.has(channel.id) ? 'bg-blue-600/10 border-blue-600/50' : 'bg-zinc-900/50 border-transparent hover:border-white/5 focus:border-blue-500 focus:bg-blue-600/5'}`}
                     >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedChannels.has(channel.id) ? 'bg-blue-600 border-blue-600' : 'border-zinc-700'}`}>
                           {selectedChannels.has(channel.id) && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div className="w-8 h-8 rounded bg-zinc-800 shrink-0 overflow-hidden">
                           {channel.logo ? <img src={channel.logo} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-600">CH</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className="text-[10px] font-bold truncate">{channel.name}</p>
                           <p className="text-[8px] text-zinc-500 truncate uppercase">{channel.group}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-white/5">
              {addMode === 'm3u' && (
                <button tabIndex={0} onClick={() => { if (playlistName && m3uText) onAdd(playlistName, m3uText); setIsAdding(false); resetForm(); }} onKeyDown={(e) => e.key === 'Enter' && playlistName && m3uText && (onAdd(playlistName, m3uText), setIsAdding(false), resetForm())} disabled={!playlistName || !m3uText} className="flex-1 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-30 transition-all focus:ring-2 focus:ring-blue-400">
                  Confirm Import
                </button>
              )}
              {addMode === 'custom' && (
                <button tabIndex={0} onClick={handleCreateCustom} onKeyDown={(e) => e.key === 'Enter' && playlistName && selectedChannels.size > 0 && handleCreateCustom()} disabled={!playlistName || selectedChannels.size === 0} className="flex-1 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-30 transition-all focus:ring-2 focus:ring-blue-400">
                  Save Custom List
                </button>
              )}
              <button tabIndex={0} onClick={() => { setIsAdding(false); resetForm(); }} onKeyDown={(e) => e.key === 'Enter' && (setIsAdding(false), resetForm())} className="px-8 bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl font-bold transition-all border border-white/5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {playlists.length === 0 ? (
          <div className="bg-zinc-900 rounded-3xl p-16 flex flex-col items-center justify-center text-zinc-600 border border-white/5 border-dashed">
            <Database size={64} className="mb-6 opacity-10" />
            <p className="text-xl font-bold">No Playlists Connected</p>
            <p className="max-w-xs text-center mt-2 opacity-60">Add an M3U file, Xtream login, or create a custom list to start watching.</p>
          </div>
        ) : (
          playlists.map((playlist) => (
            <div 
              key={playlist.id} 
              tabIndex={0}
              onClick={() => onSelect(playlist)} 
              onKeyDown={(e) => e.key === 'Enter' && onSelect(playlist)}
              className={`group flex items-center gap-6 p-6 rounded-3xl border transition-all cursor-pointer ${activePlaylist?.id === playlist.id ? 'bg-blue-600/10 border-blue-600' : 'bg-zinc-900 border-white/5 hover:border-white/10 focus:border-blue-500'}`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${activePlaylist?.id === playlist.id ? 'bg-blue-600 shadow-lg' : 'bg-zinc-800 text-zinc-500'}`}><List size={28} /></div>
              <div className="flex-1 min-w-0">
                {renamingId === playlist.id ? (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input tabIndex={0} type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && (onUpdate(playlist.id, {name: newName}), setRenamingId(null))} autoFocus className="flex-1 bg-zinc-800 border-none rounded-lg py-1.5 px-3 text-sm outline-none" />
                    <button tabIndex={0} onClick={e => { e.stopPropagation(); onUpdate(playlist.id, {name: newName}); setRenamingId(null); }} className="p-1.5 rounded-lg bg-blue-600 text-white"><Check size={16} /></button>
                  </div>
                ) : (
                  <h4 className="text-lg font-bold flex items-center gap-3 truncate">
                    <span className="truncate">{playlist.name}</span>
                    {playlist.xtreamConfig && (
                      <span title="Xtream API Source">
                        <Server size={14} className="text-zinc-500" />
                      </span>
                    )}
                  </h4>
                )}
                <p className="text-sm text-zinc-500 font-medium">{playlist.channels.length} Channels • {new Date(playlist.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                <button tabIndex={0} onClick={(e) => { e.stopPropagation(); setRenamingId(playlist.id); setNewName(playlist.name); }} className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white focus:bg-blue-600 focus:text-white"><Edit2 size={20} /></button>
                <button tabIndex={0} onClick={(e) => { e.stopPropagation(); onDelete(playlist.id); }} className="p-3 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"><Trash2 size={20} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistManager;