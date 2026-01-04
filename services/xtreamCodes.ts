
import { Channel, EPGProgram } from '../types';

export interface XtreamCredentials {
  url: string;
  username: string;
  password: string;
  proxyUrl?: string; 
}

const DEFAULT_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.codetabs.com/v1/proxy?quest='
];

const safeDecode = (str: string) => {
  try {
    return atob(str);
  } catch (e) {
    return str; // Return original if not base64
  }
};

const fetchWithFallback = async (targetUrl: string, userProxy?: string): Promise<Response> => {
  const isTargetInsecure = targetUrl.startsWith('http://');
  const isAppSecure = window.location.protocol === 'https:';
  
  const attempts = [
    { name: 'Direct', proxy: null },
    ...(userProxy ? [{ name: 'Custom Proxy', proxy: userProxy }] : []),
    ...DEFAULT_PROXIES.map((p, i) => ({ name: `Proxy ${i + 1}`, proxy: p }))
  ];

  let errors: string[] = [];

  for (const attempt of attempts) {
    try {
      let finalUrl = targetUrl;
      if (attempt.proxy) {
        finalUrl = attempt.proxy.includes('?') 
          ? `${attempt.proxy}${encodeURIComponent(targetUrl)}` 
          : `${attempt.proxy}${targetUrl}`;
      } else if (isAppSecure && isTargetInsecure) {
        errors.push("Direct: Blocked (Mixed Content)");
        continue;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(finalUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 401) {
        return response;
      }
      
      errors.push(`${attempt.name}: Error ${response.status}`);
    } catch (err: any) {
      errors.push(`${attempt.name}: ${err.message}`);
    }
  }

  throw new Error(`All connection routes failed:\n${errors.join('\n')}`);
};

export const fetchXtreamData = async (creds: XtreamCredentials): Promise<Channel[]> => {
  let baseUrl = creds.url.trim().replace(/\/$/, '');
  if (!baseUrl.startsWith('http')) {
    baseUrl = 'http://' + baseUrl;
  }

  const authParams = `username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}`;
  
  try {
    const loginUrl = `${baseUrl}/player_api.php?${authParams}`;
    const loginRes = await fetchWithFallback(loginUrl, creds.proxyUrl);

    if (loginRes.status === 403) {
      throw new Error('Access Blocked (403): Provider blocked browser/proxy access.');
    }

    const loginText = await loginRes.text();
    const loginData = JSON.parse(loginText);

    if (!loginData.user_info || (loginData.user_info.auth === 0 && !loginData.user_info.username)) {
      throw new Error('Login Failed: Check your credentials.');
    }

    const liveUrl = `${baseUrl}/player_api.php?${authParams}&action=get_live_streams`;
    const liveRes = await fetchWithFallback(liveUrl, creds.proxyUrl);
    const liveStreams = await liveRes.json();

    if (!Array.isArray(liveStreams)) {
      throw new Error('Subscription Error: No channels found.');
    }

    return liveStreams.map((stream: any) => ({
      id: `xtream_${stream.stream_id}`,
      streamId: stream.stream_id.toString(),
      name: stream.name || 'Unknown Channel',
      url: `${baseUrl}/live/${creds.username}/${creds.password}/${stream.stream_id}.ts`,
      logo: stream.stream_icon && stream.stream_icon !== "" ? stream.stream_icon : undefined,
      group: stream.category_name || 'Live TV',
      tvgId: stream.epg_channel_id,
      isFavorite: false
    }));

  } catch (error: any) {
    throw error;
  }
};

export const fetchChannelEPG = async (creds: XtreamCredentials, streamId: string): Promise<EPGProgram[]> => {
  let baseUrl = creds.url.trim().replace(/\/$/, '');
  if (!baseUrl.startsWith('http')) baseUrl = 'http://' + baseUrl;

  const authParams = `username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}`;
  const epgUrl = `${baseUrl}/player_api.php?${authParams}&action=get_short_epg&stream_id=${streamId}`;

  try {
    const response = await fetchWithFallback(epgUrl, creds.proxyUrl);
    const data = await response.json();
    
    if (data && data.epg_listings) {
      return data.epg_listings.map((item: any) => ({
        title: safeDecode(item.title || ''),
        start: item.start,
        end: item.end,
        description: safeDecode(item.description || ''),
        start_timestamp: parseInt(item.start_timestamp),
        end_timestamp: parseInt(item.end_timestamp)
      }));
    }
    return [];
  } catch (err) {
    console.error('EPG Fetch Error:', err);
    return [];
  }
};
