import "@/assets/css/standalone.css";
import "core-js/stable";

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "@/stores/theme";
import { StandalonePlayer } from "@/StandalonePlayer";
import { usePlayerStore } from "@/stores/player/store";
import { initializeChromecast } from "./setup/chromecast";
import "./setup/i18n";

// Initialize Chromecast once
if (typeof window !== 'undefined') {
  initializeChromecast();
}

export interface RezePlayerServer {
  name: string;
  url: string;
  type?: 'hls' | 'mp4';
}

export interface RezePlayerSubtitle {
  name: string;
  src: string;
  language?: string;
  flagsapi?: string;
  default?: boolean;
}

export interface RezePlayerOptions {
  servers: RezePlayerServer[];  // Multiple servers
  title?: string;
  subtitles?: RezePlayerSubtitle[];
  autoPlay?: boolean;
  volume?: number;
  startTime?: number;
  enableWatchParty?: boolean;  // Enable/disable watch party feature
}

export interface RezePlayerInstance {
  destroy: () => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
}

class RezePlayer {
  private container: HTMLElement;
  private root: any;
  private options: RezePlayerOptions;

  constructor(selector: string | HTMLElement, options: RezePlayerOptions) {
    // Get container element
    if (typeof selector === 'string') {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`RezePlayer: Element not found: ${selector}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = selector;
    }

    this.options = options;
    this.init();
  }

  private init() {
    // Store ALL servers globally so StandalonePlayer can access them
    (window as any).__REZEPLAYER_CONFIG__ = {
      servers: this.options.servers.map(server => ({
        name: server.name,
        url: server.url,
        type: server.type || this.detectStreamType(server.url),
      })),
      meta: {
        title: this.options.title || 'Reze Player',
      },
      subtitles: (this.options.subtitles || []).map((sub, index) => ({
        id: `subtitle-${index}`,
        name: sub.name,
        language: sub.language || 'unknown',
        flagsapi: sub.flagsapi,
        url: sub.src,
        type: (sub.src.toLowerCase().endsWith('.vtt') ? 'vtt' : 'srt') as 'srt' | 'vtt',
        default: sub.default || false,
      })),
      settings: {
        autoPlay: this.options.autoPlay ?? true,
        defaultVolume: this.options.volume ?? 1,
        startTime: this.options.startTime ?? 0,
        enableWatchParty: this.options.enableWatchParty ?? true,
      },
    };

    // Add data-rezeplayer attribute to container for CSS scoping
    this.container.setAttribute('data-rezeplayer', 'true');

    // Create root and render
    this.root = createRoot(this.container);
    this.root.render(
      <StrictMode>
        <HelmetProvider>
          <ThemeProvider applyGlobal>
            <HashRouter>
              <StandalonePlayer />
            </HashRouter>
          </ThemeProvider>
        </HelmetProvider>
      </StrictMode>
    );
  }

  private detectStreamType(url: string): 'hls' | 'mp4' {
    if (url.includes('.m3u8')) return 'hls';
    return 'mp4';
  }

  public destroy() {
    if (this.root) {
      this.root.unmount();
    }
  }

  public play() {
    const store = usePlayerStore.getState();
    store.display?.play();
  }

  public pause() {
    const store = usePlayerStore.getState();
    store.display?.pause();
  }

  public setVolume(volume: number) {
    const store = usePlayerStore.getState();
    store.display?.setVolume(volume);
  }

  public seek(time: number) {
    const store = usePlayerStore.getState();
    store.display?.setTime(time);
  }
}

// Export factory function
export function make(selector: string | HTMLElement, options: RezePlayerOptions): RezePlayerInstance {
  const player = new RezePlayer(selector, options);
  return {
    destroy: () => player.destroy(),
    play: () => player.play(),
    pause: () => player.pause(),
    setVolume: (volume: number) => player.setVolume(volume),
    seek: (time: number) => player.seek(time),
  };
}

// For global usage
if (typeof window !== 'undefined') {
  (window as any).RezePlayer = { make };
}

export default { make };
