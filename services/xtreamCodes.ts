
import { Channel, EPGProgram } from '../types';

export interface XtreamCredentials {
  url: string;
  username: string;
  password: string;
  proxyUrl?: string; 
}

const safeDecode = (str: string) => {
  try {
    return atob(str);
  } catch (e) {
    return str; // Return original if not base64
  }
};

const directFetch = async (targetUrl: string): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const fetchXtreamData = async (creds: XtreamCredentials): Promise<Channel[]> => {
  let baseUrl = creds.url.trim().replace(/\/$/, '');
  if (!baseUrl.startsWith('http')) {
    baseUrl = 'http://' + baseUrl;
  }

  const authParams = `username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}`;
  
  try {
    const loginUrl = `${baseUrl}/player_api.php?${authParams}`;
    const loginRes = await directFetch(loginUrl);

    if (!loginRes.ok) {
        if (loginRes.status === 401) throw new Error('Login Failed: Check your credentials.');
        if (loginRes.status === 403) throw new Error('Access Blocked (403): Provider may have blocked browser/proxy access.');
        throw new Error(`Login Error: Server responded with status ${loginRes.status}`);
    }

    const loginData = await loginRes.json();

    if (!loginData.user_info || (loginData.user_info.auth === 0 && !loginData.user_info.username)) {
      throw new Error('Login Failed: Invalid response from server.');
    }

    const liveUrl = `${baseUrl}/player_api.php?${authParams}&action=get_live_streams`;
    const liveRes = await directFetch(liveUrl);
    
    if (!liveRes.ok) {
        throw new Error(`Channel Fetch Error: Server responded with status ${liveRes.status}`);
    }

    const liveStreams = await liveRes.json();

    if (!Array.isArray(liveStreams)) {
      throw new Error('Subscription Error: No channels found or invalid response.');
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
    console.error("Xtream Fetch Error:", error);
    throw error;
  }
};

export const fetchChannelEPG = async (creds: XtreamCredentials, streamId: string): Promise<EPGProgram[]> => {
  let baseUrl = creds.url.trim().replace(/\/$/, '');
  if (!baseUrl.startsWith('http')) baseUrl = 'http://' + baseUrl;

  const authParams = `username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}`;
  const epgUrl = `${baseUrl}/player_api.php?${authParams}&action=get_short_epg&stream_id=${streamId}`;

  try {
    const response = await directFetch(epgUrl);
    
    if (!response.ok) {
        throw new Error(`EPG Fetch Error: Server responded with status ${response.status}`);
    }

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
