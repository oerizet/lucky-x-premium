import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  Shield, 
  Monitor, 
  Palette, 
  Power, 
  Layers, 
  Timer, 
  Activity,
  Zap,
  Globe,
  Lock,
  Cpu,
  RotateCcw,
  User
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  onSimulateError: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings, onSimulateError }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'player' | 'automation' | 'epg' | 'security'>('general');

  const getAccentClass = () => {
    switch(settings.accentColor) {
      case 'blue': return 'text-blue-500';
      case 'gold': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'rose': return 'text-rose-500';
      default: return 'text-amber-500';
    }
  };

  const getAccentSliderClass = () => {
    switch(settings.accentColor) {
      case 'blue': return 'accent-blue-500';
      case 'gold': return 'accent-amber-500';
      case 'emerald': return 'accent-emerald-500';
      case 'rose': return 'accent-rose-500';
      default: return 'accent-amber-500';
    }
  };

  const getAccentBtn = (active: boolean) => {
    if (!active) return 'text-zinc-500 hover:text-white';
    switch(settings.accentColor) {
      case 'blue': return 'bg-blue-600 text-white shadow-lg';
      case 'gold': return 'bg-amber-600 text-white shadow-lg';
      case 'emerald': return 'bg-emerald-600 text-white shadow-lg';
      case 'rose': return 'bg-rose-600 text-white shadow-lg';
      default: return 'bg-amber-600 text-white shadow-lg';
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950/50">
      <div className="p-8 pb-4">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">System <span className={getAccentClass()}>Settings</span></h2>
        
        <div className="flex flex-wrap gap-2 mb-8 bg-zinc-900/50 p-2 rounded-2xl w-fit border border-white/5">
           {[
             { id: 'general', label: 'General', icon: <Layers size={16} /> },
             { id: 'player', label: 'Player', icon: <Monitor size={16} /> },
             { id: 'automation', label: 'Automation', icon: <Cpu size={16} /> },
             { id: 'epg', label: 'EPG Guide', icon: <Timer size={16} /> },
             { id: 'security', label: 'Parental', icon: <Shield size={16} /> }
           ].map(tab => (
             <button 
                key={tab.id}
                tabIndex={0}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${getAccentBtn(activeTab === tab.id)}`}
             >
                {tab.icon} {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-12">
        <div className="max-w-5xl space-y-6">
          
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
               <Section title="Interface Options" icon={<Palette className="text-blue-500" />}>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Accent Color</label>
                        <div className="flex gap-2">
                           {(['blue', 'gold', 'emerald', 'rose'] as const).map(color => (
                              <button 
                                key={color}
                                onClick={() => setSettings({...settings, accentColor: color})}
                                className={`w-10 h-10 rounded-xl border-2 transition-all ${settings.accentColor === color ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                                style={{ backgroundColor: color === 'gold' ? '#f59e0b' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#f43f5e' }}
                              />
                           ))}
                        </div>
                     </div>
                     <SettingToggle label="Time Format (24h)" enabled={settings.timeFormat === '24h'} onToggle={() => setSettings({...settings, timeFormat: settings.timeFormat === '24h' ? '12h' : '24h'})} accent={settings.accentColor} />
                     <SettingToggle label="Show EPG on Change" description="Display mini-guide when switching channels" enabled={settings.showEpgOnChannelChange} onToggle={() => setSettings({...settings, showEpgOnChannelChange: !settings.showEpgOnChannelChange})} accent={settings.accentColor} />
                  </div>
               </Section>

               <Section title="Network Configuration" icon={<Globe className="text-emerald-500" />}>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Custom User Agent</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input 
                            tabIndex={0}
                            type="text" 
                            value={settings.userAgent}
                            onChange={(e) => setSettings({...settings, userAgent: e.target.value})}
                            className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="IPTVSmarters/1.0.3"
                          />
                        </div>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase">Used to bypass provider user-agent restrictions.</p>
                     </div>
                     <InfoLine label="App Version" value="v2.9.0 Premium" />
                     <InfoLine label="MAC Address" value="00:1A:2B:3C:4D:5E" />
                     <button onClick={onSimulateError} className="w-full mt-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/20 transition-all">
                        Test System Error Overlay
                     </button>
                  </div>
               </Section>
            </div>
          )}

          {activeTab === 'player' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
               <Section title="Default Player" icon={<Activity className="text-emerald-500" />}>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Live TV Player</label>
                        <div className="flex gap-2">
                           <EngineButton active={settings.playerLive === 'internal'} onClick={() => setSettings({...settings, playerLive: 'internal'})} label="Internal" accent={settings.accentColor} />
                           <EngineButton active={settings.playerLive === 'vlc'} onClick={() => setSettings({...settings, playerLive: 'vlc'})} label="VLC Player" accent={settings.accentColor} />
                        </div>
                     </div>
                     <SettingToggle label="Hardware Acceleration" description="Use GPU for decoding (Recommended)" enabled={settings.enableHardwareAcceleration} onToggle={() => setSettings({...settings, enableHardwareAcceleration: !settings.enableHardwareAcceleration})} accent={settings.accentColor} />
                  </div>
               </Section>
               <Section title="Streaming Buffer" icon={<Zap className="text-rose-500" />}>
                  <div className="space-y-6">
                    <div className="space-y-3 p-4 bg-zinc-950 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Buffer Length</label>
                          <span className={`text-xs font-black px-3 py-1 rounded-lg bg-zinc-900 border border-white/5 ${getAccentClass()}`}>
                            {settings.bufferSize} Seconds
                          </span>
                        </div>
                        <input 
                          tabIndex={0} 
                          type="range" 
                          min="0" 
                          max="30" 
                          step="1" 
                          value={settings.bufferSize} 
                          onChange={(e) => setSettings({...settings, bufferSize: parseInt(e.target.value)})} 
                          className={`w-full h-2 rounded-lg cursor-pointer appearance-none bg-zinc-800 ${getAccentSliderClass()}`} 
                        />
                        <div className="flex justify-between text-[8px] font-black uppercase text-zinc-600 tracking-widest px-1">
                          <span>Insta-Play</span>
                          <span>Stable Load</span>
                        </div>
                        <p className="text-[8px] text-zinc-500 font-bold uppercase leading-relaxed mt-2 opacity-60">
                          Higher buffer values prevent freezing on unstable connections but increase the channel switch delay.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Stream Format</label>
                        <div className="flex gap-2">
                           <EngineButton active={settings.streamFormat === 'ts'} onClick={() => setSettings({...settings, streamFormat: 'ts'})} label="MPEG-TS" accent={settings.accentColor} />
                           <EngineButton active={settings.streamFormat === 'hls'} onClick={() => setSettings({...settings, streamFormat: 'hls'})} label="HLS (m3u8)" accent={settings.accentColor} />
                        </div>
                    </div>
                  </div>
               </Section>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <Section title="App Startup" icon={<Power className="text-amber-500" />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <SettingToggle label="Auto Start on Boot" description="Launch when device powers on" enabled={settings.autoStartOnBoot} onToggle={() => setSettings({...settings, autoStartOnBoot: !settings.autoStartOnBoot})} accent={settings.accentColor} />
                     <SettingToggle label="Play Last Channel" description="Continue watching on launch" enabled={settings.bootLastChannel} onToggle={() => setSettings({...settings, bootLastChannel: !settings.bootLastChannel})} accent={settings.accentColor} />
                  </div>
               </Section>
               <Section title="Maintenance" icon={<RotateCcw className="text-blue-500" />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <SettingToggle label="Auto-Update EPG" description="Refresh guide every 24 hours" enabled={settings.autoUpdateEPG} onToggle={() => setSettings({...settings, autoUpdateEPG: !settings.autoUpdateEPG})} accent={settings.accentColor} />
                     <SettingToggle label="Auto-Refresh Playlists" description="Update list metadata on launch" enabled={settings.autoRefreshPlaylist} onToggle={() => setSettings({...settings, autoRefreshPlaylist: !settings.autoRefreshPlaylist})} accent={settings.accentColor} />
                     <SettingToggle label="Clear Cache on Exit" description="Wipe temporary stream data" enabled={settings.clearCacheOnExit} onToggle={() => setSettings({...settings, clearCacheOnExit: !settings.clearCacheOnExit})} accent={settings.accentColor} />
                  </div>
               </Section>
            </div>
          )}

          {activeTab === 'epg' && (
             <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4">
                <Section title="EPG Guide Settings" icon={<Timer className="text-amber-500" />}>
                   <div className="space-y-8">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Time Offset (EPG Shift)</label>
                            <span className={`text-sm font-black ${getAccentClass()}`}>{settings.epgShift > 0 ? `+${settings.epgShift}` : settings.epgShift} Hours</span>
                         </div>
                         <input tabIndex={0} type="range" min="-12" max="12" step="1" value={settings.epgShift} onChange={(e) => setSettings({...settings, epgShift: parseInt(e.target.value)})} className={`w-full ${getAccentSliderClass()}`} />
                         <p className="text-[8px] text-zinc-600 font-bold uppercase text-center">Adjust if the guide time doesn't match your local time.</p>
                      </div>
                   </div>
                </Section>
             </div>
          )}

          {activeTab === 'security' && (
             <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4">
                <Section title="Parental Control Center" icon={<Lock className="text-rose-500" />}>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-5 bg-zinc-950 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-zinc-900 rounded-xl"><Shield className="text-zinc-500" size={20} /></div>
                           <div>
                              <p className="text-xs font-black uppercase text-white">System PIN Lock</p>
                              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Active PIN: {settings.parentalPin}</p>
                           </div>
                        </div>
                        <button className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Change PIN</button>
                      </div>
                      <SettingToggle 
                        label="Hide Adult Content" 
                        description="Hide XXX categories from all screens" 
                        enabled={!settings.showAdult} 
                        onToggle={() => setSettings({...settings, showAdult: !settings.showAdult})} 
                        accent={settings.accentColor} 
                      />
                   </div>
                </Section>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-zinc-900/50 rounded-3xl p-8 border border-white/5 shadow-2xl glass">
    <div className="flex items-center gap-3 mb-8">
       <div className="p-2 bg-zinc-950 rounded-xl shadow-inner border border-white/5">{icon}</div>
       <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const SettingToggle = ({ label, description, enabled, onToggle, accent }: { label: string, description?: string, enabled: boolean, onToggle: () => void, accent: string }) => {
   const getBg = () => {
      if (!enabled) return 'bg-zinc-800';
      switch(accent) {
         case 'blue': return 'bg-blue-600';
         case 'gold': return 'bg-amber-600';
         case 'emerald': return 'bg-emerald-600';
         case 'rose': return 'bg-rose-600';
         default: return 'bg-amber-600';
      }
   };

   return (
      <div className="flex items-center justify-between group">
         <div className="min-w-0 pr-4">
            <p className="text-xs font-black uppercase text-zinc-200">{label}</p>
            {description && <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter truncate">{description}</p>}
         </div>
         <button 
           tabIndex={0}
           onClick={onToggle} 
           className={`w-12 h-6 rounded-full relative transition-all shadow-inner shrink-0 ${getBg()}`}
         >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${enabled ? 'right-1' : 'left-1'}`} />
         </button>
      </div>
   );
};

const EngineButton = ({ active, onClick, label, accent }: { active: boolean, onClick: () => void, label: string, accent: string }) => {
   const getStyle = () => {
      if (!active) return 'bg-zinc-900 text-zinc-600 border-white/5 hover:text-white hover:border-white/10';
      switch(accent) {
         case 'blue': return 'bg-blue-600 text-white shadow-lg border-blue-400';
         case 'gold': return 'bg-amber-600 text-white shadow-lg border-amber-400';
         case 'emerald': return 'bg-emerald-600 text-white shadow-lg border-emerald-400';
         case 'rose': return 'bg-rose-600 text-white shadow-lg border-rose-400';
         default: return 'bg-amber-600 text-white';
      }
   };
   return (
      <button 
        tabIndex={0}
        onClick={onClick} 
        className={`flex-1 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 ${getStyle()}`}
      >
         {label}
      </button>
   );
};

const InfoLine = ({ label, value }: { label: string, value: string }) => (
   <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{label}</span>
      <span className="text-[10px] font-bold text-zinc-300 uppercase">{value}</span>
   </div>
);

export default SettingsView;