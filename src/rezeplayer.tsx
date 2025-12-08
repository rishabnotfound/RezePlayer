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
  enableCast?: boolean;  // Enable/disable chromecast feature (default: true)
  posterUrl?: string;  // Poster image URL to display before video plays
  themeColor?: string;  // Theme color for UI elements (hex value without #, e.g., "e01621")
  thumbsInterval?: number;  // Thumbnail generation interval in milliseconds (default: 10000 = 10s)
}

export interface RezePlayerInstance {
  destroy: () => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  on: (event: 'timeupdate' | 'durationchange', callback: (data: { currentTime: number; duration: number }) => void) => void;
  off: (event: 'timeupdate' | 'durationchange', callback: (data: { currentTime: number; duration: number }) => void) => void;
}

class RezePlayer {
  private container: HTMLElement;
  private root: any;
  private options: RezePlayerOptions;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private unsubscribe: (() => void) | null = null;

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
        enableCast: this.options.enableCast ?? true,
        posterUrl: this.options.posterUrl,
        themeColor: this.options.themeColor,
        thumbsInterval: this.options.thumbsInterval ?? 10000,  // Default 10 seconds
      },
    };

    // Add data-rezeplayer attribute to container for CSS scoping
    this.container.setAttribute('data-rezeplayer', 'true');

    // Apply theme color if provided
    if (this.options.themeColor) {
      const color = this.options.themeColor.startsWith('#')
        ? this.options.themeColor
        : `#${this.options.themeColor}`;

      // Inject theme color CSS
      const styleId = 'rezeplayer-theme-override';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      // Convert hex to RGB for CSS variables
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const rgb = `${r} ${g} ${b}`;

      styleElement.textContent = `
        [data-rezeplayer="true"] {
          --colors-buttons-toggle: ${rgb} !important;
          --colors-progress-filled: ${rgb} !important;
          --colors-video-audio-set: ${rgb} !important;
          --colors-video-context-sliderFilled: ${rgb} !important;
          --colors-video-context-type-accent: ${rgb} !important;
        }
      `;
    }

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

    // Subscribe to store changes for time updates
    this.setupTimeTracking();
  }

  private setupTimeTracking() {
    let lastTime = 0;
    let lastDuration = 0;

    this.unsubscribe = usePlayerStore.subscribe((state) => {
      const currentTime = state.progress.time;
      const duration = state.progress.duration;

      // Emit timeupdate event when time changes
      if (currentTime !== lastTime) {
        lastTime = currentTime;
        this.emit('timeupdate', { currentTime, duration });
      }

      // Emit durationchange event when duration changes
      if (duration !== lastDuration) {
        lastDuration = duration;
        this.emit('durationchange', { currentTime, duration });
      }
    });
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  private detectStreamType(url: string): 'hls' | 'mp4' {
    if (url.includes('.m3u8')) return 'hls';
    return 'mp4';
  }

  public destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.root) {
      this.root.unmount();
    }
    this.eventListeners.clear();
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

  public getCurrentTime(): number {
    const store = usePlayerStore.getState();
    return store.progress.time;
  }

  public getDuration(): number {
    const store = usePlayerStore.getState();
    return store.progress.duration;
  }

  public on(event: 'timeupdate' | 'durationchange', callback: (data: { currentTime: number; duration: number }) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  public off(event: 'timeupdate' | 'durationchange', callback: (data: { currentTime: number; duration: number }) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
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
    getCurrentTime: () => player.getCurrentTime(),
    getDuration: () => player.getDuration(),
    on: (event: 'timeupdate' | 'durationchange', callback: (data: { currentTime: number; duration: number }) => void) => player.on(event, callback),
    off: (event: 'timeupdate' | 'durationchange', callback: (data: { currentTime: number; duration: number }) => void) => player.off(event, callback),
  };
}

// For global usage
if (typeof window !== 'undefined') {
  (window as any).RezePlayer = { make };
}

export default { make };
