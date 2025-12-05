/**
 * Internal server configuration for standalone player
 * This provides sample data for testing and development
 */

export interface PlayerConfig {
  stream: {
    url: string;
    name: string;
    type: 'hls' | 'mp4';
    captions?: Array<{
      id: string;
      language: string;
      label: string;
      url: string;
      type: 'srt' | 'vtt';
    }>;
  };
  meta: {
    title: string;
    description?: string;
  };
  settings: {
    defaultVolume: number;
    autoPlay: boolean;
    startTime: number;
  };
}

/**
 * Server definition - only name and stream URL
 */
interface Server {
  name: string;
  stream_url: string;
}

/**
 * List of test servers
 * Add or modify servers here - each server only needs a name and stream URL
 */
export const servers: Server[] = [
  {
    name: "Comet",
    stream_url: "https://artplayer.org/assets/sample/video.mp4"
  },
  {
    name: "Star",
    stream_url: "https://content.jwplatform.com/manifests/yp34SRmf.m3u8"
  },
  {
    name: "Galaxy",
    stream_url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    name: "Nova",
    stream_url: "https://files.vidstack.io/sprite-fight/720p.mp4"
  }
];

/**
 * Common captions that apply to all servers
 */
const commonCaptions = [
  {
    id: 'jp',
    language: 'ja',
    label: 'Japanese',
    url: 'https://artplayer.org/assets/sample/subtitle.jp.srt',
    type: 'srt' as const,
  },
  {
    id: 'cn',
    language: 'zh',
    label: 'Chinese',
    url: 'https://artplayer.org/assets/sample/subtitle.cn.srt',
    type: 'srt' as const,
  },
];

/**
 * Detect stream type from URL
 */
function detectStreamType(url: string): 'hls' | 'mp4' {
  if (url.includes('.m3u8')) return 'hls';
  return 'mp4';
}

/**
 * Convert a server definition to full player config
 */
function serverToConfig(server: Server): PlayerConfig {
  return {
    stream: {
      url: server.stream_url,
      name: server.name,
      type: detectStreamType(server.stream_url),
      captions: commonCaptions,
    },
    meta: {
      title: 'Evelyn Player',
      description: `Playing from ${server.name}`,
    },
    settings: {
      defaultVolume: 1,
      autoPlay: true,
      startTime: 0,
    },
  };
}

/**
 * Get the default player configuration
 * Change the index to test different servers (0 = first server, 1 = second, etc.)
 */
export function getDefaultConfig(): PlayerConfig {
  const serverIndex = 0; // Change this to select different server
  return serverToConfig(servers[serverIndex]);
}

/**
 * Get config for a specific server index
 */
export function getConfigForServer(index: number): PlayerConfig {
  if (index < 0 || index >= servers.length) {
    throw new Error('Server index out of range');
  }
  return serverToConfig(servers[index]);
}

/**
 * Load configuration from environment or use default
 */
export function loadPlayerConfig(): PlayerConfig {
  // Check if external config is provided via window object
  if (typeof window !== 'undefined' && window.__PLAYER_CONFIG__) {
    return window.__PLAYER_CONFIG__;
  }

  // Use default internal config
  return getDefaultConfig();
}

// Make window type available
declare global {
  interface Window {
    __PLAYER_CONFIG__?: PlayerConfig;
  }
}
