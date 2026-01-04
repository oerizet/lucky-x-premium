import React, { useRef, useState, useEffect } from 'react';
import { Channel } from '../types';
import { X, Play, Pause, Volume2, Maximize, MonitorPlay, Tv, AlertTriangle } from 'lucide-react';

declare global {
  interface Window {
    Hls: any;
  }
}

interface PlayerProps {
  channel: Channel;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  playerEngine: 'internal' | 'vlc';
  bufferSize?: number;
}

const Player: React.FC<PlayerProps> = ({ channel, onClose, onNext, onPrev, playerEngine, bufferSize = 2 }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const controlsTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handleRemoteKeys = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'MediaPlayPause':
          togglePlay();
          e.preventDefault();
          break;
        case 'MediaStop':
        case 'Backspace':
        case 'Escape':
          onClose();
          e.preventDefault();
          break;
        case 'ArrowUp':
          setVolume(prev => Math.min(1, prev + 0.1));
          handleMouseMove();
          break;
        case 'ArrowDown':
          setVolume(prev => Math.max(0, prev - 0.1));
          handleMouseMove();
          break;
      }
    };

    window.addEventListener('keydown', handleRemoteKeys);
    return () => window.removeEventListener('keydown', handleRemoteKeys);
  }, [isPlaying, volume]);

  useEffect(() => {
    if (playerEngine !== 'internal' || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = channel.url;
    setError(null);
    setIsBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const initHls = () => {
      const Hls = (window as any).Hls;
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          liveSyncDurationCount: 3,
          maxBufferLength: bufferSize, // Target buffer in seconds
          maxMaxBufferLength: Math.max(bufferSize * 1.5, 30), // Max cap to allow growth
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
        });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => setIsPlaying(false));
          setIsBuffering(false);
        });

        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setError("There was an unexpected error. Finish what you were doing.");
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => video.play());
      } else {
        video.src = streamUrl;
      }
    };

    const timer = setTimeout(initHls, 200);
    return () => {
      clearTimeout(timer);
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [channel.url, playerEngine, bufferSize]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return "--:--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
      handleMouseMove();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) window.clearTimeout(controlsTimeout.current);
    controlsTimeout.current = window.setTimeout(() => {
      if (isPlaying && playerEngine === 'internal' && !error) setShowControls(false);
    }, 4000);
  };

  if (playerEngine === 'vlc') {
    return (
      <div className="relative w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px]" />
        <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
          <div className="w-24 h-24 bg-amber-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-8">
             <MonitorPlay size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-white">External Player</h2>
          <div className="bg-zinc-900/80 border border-white/5 p-6 rounded-[2.5rem] w-full mb-10 backdrop-blur-xl">
             <p className="text-lg font-black truncate text-white uppercase mb-4">{channel.name}</p>
             <p className="text-xs text-zinc-500 mb-4">Passing stream to VLC Media Engine for high-performance decoding.</p>
             <div className="bg-black/40 p-4 rounded-xl font-mono text-[10px] text-zinc-500 break-all text-left">
                {channel.url}
             </div>
          </div>
          <div className="flex flex-col w-full gap-4">
            <button tabIndex={0} autoFocus onClick={() => window.location.href = `vlc://${channel.url}`} className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform">
              Launch VLC Player
            </button>
            <button tabIndex={0} onClick={onClose} className="w-full bg-zinc-900 text-zinc-500 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] border border-white/5">
              Cancel & Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLive = duration === Infinity || duration === 0;

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      <video 
        ref={videoRef}
        className="w-full h-full object-contain relative z-10"
        onPlay={() => { setIsPlaying(true); setIsBuffering(false); }}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
      />

      {isBuffering && !error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
           <div className="w-16 h-16 border-4 border-white/10 border-t-amber-600 rounded-full animate-spin mb-4" />
           <p className="text-white font-black uppercase tracking-widest text-[10px]">Connecting to Stream...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
           <div className="bg-zinc-900/80 border border-amber-500/20 p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl glass">
              <AlertTriangle size={64} className="text-amber-500 mb-8 mx-auto" />
              <h3 className="text-2xl font-black uppercase mb-4 tracking-tight text-white">Stream Interrupted</h3>
              <p className="text-zinc-200 font-bold mb-10 leading-relaxed text-lg">
                There was an unexpected error.<br/>
                <span className="text-amber-500 font-black">Finish what you were doing.</span>
              </p>
              <div className="flex flex-col gap-4">
                 <button tabIndex={0} autoFocus onClick={() => window.location.reload()} className="bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg active:scale-95 transition-all">Reconnect Stream</button>
                 <button tabIndex={0} onClick={onClose} className="bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5">Exit to Dashboard</button>
              </div>
           </div>
        </div>
      )}

      <div className={`absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-4 bg-black/40 p-2 pr-6 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="w-12 h-12 bg-white p-2 rounded-xl flex items-center justify-center shrink-0">
            {channel.logo ? <img src={channel.logo} className="max-w-full max-h-full object-contain" alt="" /> : <Tv size={24} className="text-zinc-800" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black uppercase truncate max-w-xs text-white">{channel.name}</h2>
            <p className="text-amber-500 font-bold text-[9px] uppercase tracking-widest">{channel.group}</p>
          </div>
        </div>
        <button tabIndex={0} onClick={onClose} className="p-3 rounded-full bg-black/40 hover:bg-rose-600 text-white transition-all border border-white/10">
          <X size={24} />
        </button>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 z-20 px-10 pb-10 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <button tabIndex={0} onClick={togglePlay} className="p-4 rounded-full bg-white text-black hover:scale-110 transition-transform shadow-xl">
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
              <div className="flex flex-col">
                <p className="text-white font-black text-lg tabular-nums">{formatTime(currentTime)}</p>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{isLive ? 'Live Stream' : formatTime(duration)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/40 px-4 py-3 rounded-xl border border-white/10">
                <Volume2 size={18} className="text-zinc-500" />
                <input 
                  tabIndex={0}
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                  }}
                  className="w-24 accent-amber-500"
                />
              </div>
              <button tabIndex={0} onClick={() => videoRef.current?.requestFullscreen()} className="p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 transition-colors">
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;