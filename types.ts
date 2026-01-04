export interface EPGProgram {
  title: string;
  start: string;
  end: string;
  description?: string;
  start_timestamp?: number;
  end_timestamp?: number;
}

export interface Channel {
  id: string;
  streamId?: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  tvgId?: string;
  isFavorite?: boolean;
  epg?: EPGProgram[];
  category_id?: string;
}

export interface Playlist {
  id: string;
  name: string;
  channels: Channel[];
  createdAt: number;
  xtreamConfig?: {
    url: string;
    username: string;
    password: string;
    proxyUrl?: string;
  };
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  LIVE_TV = 'LIVE_TV',
  VOD = 'VOD',
  SERIES = 'SERIES',
  FAVORITES = 'FAVORITES',
  SETTINGS = 'SETTINGS',
  PLAYLIST_EDITOR = 'PLAYLIST_EDITOR',
  EPG_GUIDE = 'EPG_GUIDE',
  MULTI_VIEW = 'MULTI_VIEW'
}

export interface AppSettings {
  autoPlay: boolean;
  theme: 'dark' | 'glass' | 'premium';
  streamQuality: 'auto' | 'fhd' | 'hd' | 'sd';
  lastPlaylistId?: string;
  playerLive: 'internal' | 'vlc';
  playerMovies: 'internal' | 'vlc';
  playerSeries: 'internal' | 'vlc';
  isPremium: boolean;
  accentColor: 'blue' | 'gold' | 'emerald' | 'rose';
  bufferSize: number;
  epgRefreshRate: number;
  epgShift: number; // -12 to +12
  showAdult: boolean;
  parentalPin: string;
  timeFormat: '12h' | '24h';
  enableHardwareAcceleration: boolean;
  autoUpdateEPG: boolean;
  autoStartOnBoot: boolean;
  bootLastChannel: boolean;
  streamFormat: 'ts' | 'hls';
  multiViewEnabled: boolean;
  clearCacheOnExit: boolean;
  language: string;
  playerSelection: 'always_ask' | 'use_default';
  showEpgOnChannelChange: boolean;
  userAgent: string;
  autoRefreshPlaylist: boolean;
}