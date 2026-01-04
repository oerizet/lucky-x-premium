import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Tv, 
  Film, 
  PlaySquare, 
  Settings, 
  Heart, 
  List, 
  Search,
  LayoutGrid,
  X,
  Lock,
  Grid3X3,
  Calendar,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ViewMode, Channel, Playlist, AppSettings } from './types';
import Dashboard from './components/Dashboard';
import ChannelGrid from './components/ChannelGrid';
import SettingsView from './components/SettingsView';
import PlaylistManager from './components/PlaylistManager';
import Player from './components/Player';
import ChannelDetail from './components/ChannelDetail';
import EPGGuide from './components/EPGGuide';
import MultiView from './components/MultiView';
import { parseM3U } from './services/playlistParser';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [infoChannel, setInfoChannel] = useState<Channel | null>(null);
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [pendingView, setPendingView] = useState<ViewMode | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    autoPlay: true,
    theme: 'premium',
    streamQuality: 'auto',
    playerLive: 'internal',
    playerMovies: 'internal',
    playerSeries: 'internal',
    isPremium: true,
    accentColor: 'gold',
    bufferSize: 2,
    epgRefreshRate: 6,
    epgShift: 0,
    showAdult: false,
    parentalPin: '0000',
    timeFormat: '24h',
    enableHardwareAcceleration: true,
    autoUpdateEPG: true,
    autoStartOnBoot: false,
    bootLastChannel: false,
    streamFormat: 'ts',
    multiViewEnabled: false,
    clearCacheOnExit: false,
    language: 'English',
    playerSelection: 'use_default',
    showEpgOnChannelChange: true,
    userAgent: 'IPTVSmarters/1.0.3',
    autoRefreshPlaylist: true
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error(e.error);
      setGlobalError("There was an unexpected error. Finish what you were doing.");
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (globalError) {
        setGlobalError(null);
        window.history.pushState({ state: 'luckyx-app' }, '', window.location.href);
      } else if (activeChannel) {
        setActiveChannel(null);
        window.history.pushState({ state: 'luckyx-app' }, '', window.location.href);
      } else if (infoChannel) {
        setInfoChannel(null);
        window.history.pushState({ state: 'luckyx-app' }, '', window.location.href);
      } else if (isPinLocked) {
        setIsPinLocked(false);
        setPinInput('');
        setPendingView(null);
        window.history.pushState({ state: 'luckyx-app' }, '', window.location.href);
      } else if (activeView !== ViewMode.DASHBOARD) {
        setActiveView(ViewMode.DASHBOARD);
        window.history.pushState({ state: 'luckyx-app' }, '', window.location.href);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Escape' || e.keyCode === 27 || e.keyCode === 4) {
        if (globalError || activeChannel || infoChannel || isPinLocked || activeView !== ViewMode.DASHBOARD) {
          e.preventDefault();
          window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
        }
      }
    };

    if (window.history.state?.state !== 'luckyx-app') {
      window.history.replaceState({ state: 'luckyx-app' }, '', window.location.href);
    }
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeChannel, infoChannel, isPinLocked, activeView, globalError]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const savedPlaylists = localStorage.getItem('xtream_playlists');
    if (savedPlaylists) {
      const parsed = JSON.parse(savedPlaylists);
      setPlaylists(parsed);
      if (parsed.length > 0) {
        const lastId = localStorage.getItem('last_playlist_id');
        const found = parsed.find((p: any) => p.id === lastId);
        setActivePlaylist(found || parsed[0]);
      }
    }
    const savedSettings = localStorage.getItem('xtream_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsedSettings }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('xtream_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    if (activePlaylist) {
      localStorage.setItem('last_playlist_id', activePlaylist.id);
    }
  }, [activePlaylist]);

  useEffect(() => {
    localStorage.setItem('xtream_settings', JSON.stringify(settings));
    const root = document.documentElement;
    const colors: Record<string, string> = { blue: '#3b82f6', gold: '#f59e0b', emerald: '#10b981', rose: '#f43f5e' };
    root.style.setProperty('--accent-primary', colors[settings.accentColor] || colors.gold);
  }, [settings]);

  const handleViewChange = (view: ViewMode) => {
    if (!settings.showAdult && (view === ViewMode.PLAYLIST_EDITOR || view === ViewMode.SETTINGS || view === ViewMode.MULTI_VIEW)) {
      setPendingView(view);
      setIsPinLocked(true);
    } else {
      setActiveView(view);
    }
  };

  const verifyPin = () => {
    if (pinInput === settings.parentalPin) {
      if (pendingView) setActiveView(pendingView);
      setIsPinLocked(false);
      setPinInput('');
      setPendingView(null);
    } else {
      setPinInput('');
    }
  };

  const handleAddPlaylist = useCallback((name: string, content: string | Channel[], xtreamConfig?: Playlist['xtreamConfig']) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      channels: typeof content === 'string' ? parseM3U(content) : content,
      createdAt: Date.now(),
      xtreamConfig
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    if (!activePlaylist) setActivePlaylist(newPlaylist);
  }, [activePlaylist]);

  const toggleFavorite = useCallback((channel: Channel) => {
    if (!activePlaylist) return;
    setPlaylists(prev => prev.map(pl => pl.id === activePlaylist.id ? { ...pl, channels: pl.channels.map(ch => ch.id === channel.id ? { ...ch, isFavorite: !ch.isFavorite } : ch) } : pl));
    if (activePlaylist) setActivePlaylist(prev => prev ? { ...prev, channels: prev.channels.map(ch => ch.id === channel.id ? { ...ch, isFavorite: !ch.isFavorite } : ch) } : null);
    
    setInfoChannel(prev => (prev && prev.id === channel.id) ? { ...prev, isFavorite: !prev.isFavorite } : prev);
  }, [activePlaylist]);

  const filteredChannels = useMemo(() => {
    if (!activePlaylist) return [];
    const search = debouncedSearch.toLowerCase();
    return activePlaylist.channels.filter(ch => 
      (ch.name.toLowerCase().includes(search) || ch.group.toLowerCase().includes(search)) &&
      (settings.showAdult || (!ch.group.toLowerCase().includes('adult') && !ch.group.toLowerCase().includes('xxx')))
    );
  }, [activePlaylist, debouncedSearch, settings.showAdult]);

  const favorites = useMemo(() => {
    if (!activePlaylist) return [];
    return activePlaylist.channels.filter(ch => ch.isFavorite);
  }, [activePlaylist]);

  const renderContent = () => {
    switch (activeView) {
      case ViewMode.DASHBOARD:
        return <Dashboard 
          setView={handleViewChange} 
          playlistCount={playlists.length} 
          activePlaylistName={activePlaylist?.name} 
          isPremium={settings.isPremium} 
          accentColor={settings.accentColor}
          onRefresh={() => console.log('Dashboard Refreshed')}
        />;
      case ViewMode.LIVE_TV:
      case ViewMode.VOD:
      case ViewMode.SERIES:
      case ViewMode.FAVORITES: {
        const currentChannels = activeView === ViewMode.FAVORITES ? favorites : filteredChannels;
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveView(ViewMode.DASHBOARD)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                <h2 className="text-xl font-bold capitalize">{activeView.replace('_', ' ')}</h2>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input type="text" placeholder="Search channels..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full bg-zinc-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-${settings.accentColor === 'gold' ? 'amber' : settings.accentColor}-500 transition-all outline-none`} />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <ChannelGrid channels={currentChannels} onPlay={setActiveChannel} onInfo={setInfoChannel} onEdit={() => {}} onToggleFavorite={toggleFavorite} accentColor={settings.accentColor} />
            </div>
          </div>
        );
      }
      case ViewMode.SETTINGS:
        return <SettingsView settings={settings} setSettings={setSettings} onSimulateError={() => setGlobalError('There was an unexpected error. Finish what you were doing.')} />;
      case ViewMode.PLAYLIST_EDITOR:
        return <PlaylistManager playlists={playlists} onAdd={handleAddPlaylist} onUpdate={(id, u) => setPlaylists(p => p.map(pl => pl.id === id ? {...pl, ...u} : pl))} onDelete={(id) => setPlaylists(p => p.filter(pl => pl.id !== id))} onSelect={setActivePlaylist} activePlaylist={activePlaylist} />;
      case ViewMode.EPG_GUIDE:
        return <EPGGuide playlist={activePlaylist} onPlay={setActiveChannel} accentColor={settings.accentColor} epgShift={settings.epgShift} />;
      case ViewMode.MULTI_VIEW:
        return <MultiView playlist={activePlaylist} accentColor={settings.accentColor} settings={settings} />;
      default: return null;
    }
  };

  return (
    <div className={`flex h-full w-full overflow-hidden bg-zinc-950 text-white select-none rounded-[2rem] shadow-2xl border border-white/5`}>
      <nav className="w-20 lg:w-64 bg-zinc-900 flex flex-col items-center lg:items-start py-8 gap-2 border-r border-white/5 shadow-2xl z-50">
        <div className="px-6 mb-10 w-full hidden lg:block">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shadow-lg bg-${settings.accentColor === 'gold' ? 'amber' : settings.accentColor}-600`}>
              <Tv size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase">LUCKY <span className={settings.accentColor === 'gold' ? 'text-amber-500' : ''}>X</span></h1>
          </div>
        </div>
        
        <div className="w-full flex flex-col gap-1 px-3">
          {[
            { view: ViewMode.DASHBOARD, icon: <LayoutGrid size={22} />, label: "Home" },
            { view: ViewMode.LIVE_TV, icon: <Tv size={22} />, label: "Live TV" },
            { view: ViewMode.VOD, icon: <Film size={22} />, label: "Movies" },
            { view: ViewMode.EPG_GUIDE, icon: <Calendar size={22} />, label: "TV Guide" },
            { view: ViewMode.FAVORITES, icon: <Heart size={22} />, label: "Favorites" },
            { view: ViewMode.MULTI_VIEW, icon: <Grid3X3 size={22} />, label: "Multi-View" },
            { view: ViewMode.PLAYLIST_EDITOR, icon: <List size={22} />, label: "Playlists" },
            { view: ViewMode.SETTINGS, icon: <Settings size={22} />, label: "Settings" }
          ].map(item => (
            <button 
              key={item.view}
              tabIndex={0}
              onClick={() => handleViewChange(item.view)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeView === item.view ? 'bg-white/10 text-white shadow-inner' : 'text-zinc-400 hover:bg-white/5'}`}
            >
              {item.icon}
              <span className="font-medium hidden lg:block text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {renderContent()}

        {globalError && (
          <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
            <div className="bg-zinc-900/80 border border-amber-500/30 p-12 rounded-[3.5rem] w-full max-w-lg text-center shadow-[0_0_50px_rgba(245,158,11,0.1)] glass animate-in zoom-in-95 duration-300">
               <div className="w-24 h-24 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                  <AlertTriangle className="text-amber-500" size={54} />
               </div>
               <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter leading-tight">System Notification</h2>
               <p className="text-zinc-200 text-lg font-bold mb-12 leading-relaxed">
                 {globalError.split('.')[0]}.<br/>
                 <span className="text-amber-500 font-black">{globalError.split('.')[1]}</span>
               </p>
               <div className="flex flex-col gap-4">
                  <button 
                    tabIndex={0} 
                    autoFocus
                    onClick={() => {setGlobalError(null); setActiveView(ViewMode.DASHBOARD);}} 
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-amber-900/40 active:scale-95 transition-all"
                  >
                    Finish & Return
                  </button>
                  <button 
                    tabIndex={0} 
                    onClick={() => window.location.reload()} 
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} /> Full Reload
                  </button>
               </div>
            </div>
          </div>
        )}

        {isPinLocked && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
            <div className="bg-zinc-900/80 border border-white/10 p-10 rounded-[3rem] w-full max-w-sm text-center shadow-2xl glass">
              <div className="w-20 h-20 bg-amber-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <Lock className="text-amber-500" size={36} />
              </div>
              <h2 className="text-2xl font-black uppercase mb-2 tracking-tight">Parental Lock</h2>
              <p className="text-zinc-500 text-xs mb-8 uppercase tracking-widest font-bold">Protected Section</p>
              <div className="flex justify-center gap-5 mb-10">
                 {[0,1,2,3].map(i => (
                    <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${pinInput.length > i ? 'bg-amber-500 border-amber-500 scale-125 shadow-[0_0_10px_#f59e0b]' : 'border-zinc-700'}`} />
                 ))}
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                 {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button key={n} tabIndex={0} onClick={() => pinInput.length < 4 && setPinInput(p => p + n)} className="h-14 bg-zinc-800/50 hover:bg-zinc-700 rounded-2xl font-bold text-xl active:scale-90 transition-all border border-white/5 shadow-sm">{n}</button>
                 ))}
                 <button tabIndex={0} onClick={() => setPinInput('')} className="h-14 bg-zinc-800/50 hover:bg-rose-900/30 rounded-2xl font-black text-[10px] uppercase tracking-widest text-zinc-500">Del</button>
                 <button tabIndex={0} onClick={pinInput.length < 4 ? () => setPinInput(p => p + '0') : undefined} className="h-14 bg-zinc-800/50 hover:bg-zinc-700 rounded-2xl font-bold text-xl active:scale-90 transition-all border border-white/5">0</button>
                 <button tabIndex={0} onClick={verifyPin} className="h-14 bg-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-900/40">Enter</button>
              </div>
              <button tabIndex={0} onClick={() => {setIsPinLocked(false); setPendingView(null); setPinInput('');}} className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Return to Safety</button>
            </div>
          </div>
        )}

        {infoChannel && (
          <div className="fixed inset-0 z-[110]">
             <ChannelDetail 
               channel={infoChannel} 
               xtreamConfig={activePlaylist?.xtreamConfig} 
               onClose={() => setInfoChannel(null)} 
               onPlay={(ch) => { setInfoChannel(null); setActiveChannel(ch); }} 
               onToggleFavorite={() => toggleFavorite(infoChannel)} 
               accentColor={settings.accentColor} 
             />
          </div>
        )}

        {activeChannel && (
          <div className="fixed inset-0 z-[100] bg-black">
            <Player channel={activeChannel} onClose={() => setActiveChannel(null)} onNext={() => {}} onPrev={() => {}} playerEngine={activeView === ViewMode.LIVE_TV ? settings.playerLive : settings.playerMovies} bufferSize={settings.bufferSize} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;