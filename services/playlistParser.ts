
import { Channel } from '../types';

export const parseM3U = (content: string): Channel[] => {
  const channels: Channel[] = [];
  const lines = content.split(/\r?\n/);
  
  let currentInfo: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Regex to capture attributes: key="value" or key=value
      const attrRegex = /([a-zA-Z0-9_-]+)=["']?((?:.(?!["']?\s+(?:\S+)=|[\\"']))*.)["']?/g;
      const attrs: Record<string, string> = {};
      let match;

      while ((match = attrRegex.exec(line)) !== null) {
        attrs[match[1].toLowerCase()] = match[2];
      }

      // Extract channel name (everything after the last comma)
      const commaIndex = line.lastIndexOf(',');
      const name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Unknown Channel';

      currentInfo = {
        name: name || 'Unnamed Channel',
        logo: attrs['tvg-logo'] || attrs['logo'],
        group: attrs['group-title'] || attrs['group'] || 'General',
        tvgId: attrs['tvg-id'] || attrs['id']
      };
    } else if (line.startsWith('http') && currentInfo) {
      channels.push({
        id: crypto.randomUUID(),
        streamId: currentInfo.tvgId,
        name: currentInfo.name,
        url: line,
        logo: currentInfo.logo,
        group: currentInfo.group,
        tvgId: currentInfo.tvgId,
        isFavorite: false
      });
      currentInfo = null;
    }
  }

  return channels;
};