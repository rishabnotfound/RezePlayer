import { MakeSlice } from "@/stores/player/slices/types";
import { addCachedMetadata } from "@/backend/helpers/providerApi";

export const playerStatus = {
  IDLE: "idle",
  PLAYING: "playing",
  PAUSED: "paused",
  SCRAPING: "scraping",
  SCRAPE_NOT_FOUND: "scrapeNotFound",
  PLAYBACK_ERROR: "playbackError",
} as const;

export type PlayerStatus = (typeof playerStatus)[keyof typeof playerStatus];

export interface PlayerMeta {
  type: "movie" | "show";
  title: string;
  tmdbId: string;
  releaseYear?: number;
  episode?: {
    number: number;
    tmdbId: string;
    title: string;
  };
  season?: {
    number: number;
    tmdbId: string;
    title: string;
  };
}

export interface CaptionListItem {
  id: string;
  name?: string;
  language: string;
  flagsapi?: string;
  hasCorsRestrictions: boolean;
  url: string;
  type: "srt" | "vtt";
}

export interface SourceSlice {
  status: PlayerStatus;
  meta: PlayerMeta | null;
  source: { type: string; url: string } | null;
  sourceId: string | null;
  currentQuality: string | null;
  currentAudioTrack: { language: string; label?: string } | null;
  qualities: any[];
  audioTracks: any[];
  caption: {
    selected: CaptionListItem | null;
    asTrack: boolean;
  };
  captionList: CaptionListItem[];
  interface: {
    shouldStartFromBeginning: boolean;
  };
  setStatus(status: PlayerStatus): void;
  setMeta(meta: PlayerMeta, status?: PlayerStatus): void;
  setSource(source: any, captions: CaptionListItem[], startAt?: number): void;
  setCaption(caption: CaptionListItem | null): void;
  setSourceId(id: string | null): void;
  setShouldStartFromBeginning(shouldStart: boolean): void;
  redisplaySource(time: number): void;
  switchQuality(quality: string): void;
  enableAutomaticQuality(): void;
  reset(): void;
}

export function metaToScrapeMedia(meta: PlayerMeta | null): any {
  if (!meta) return null;
  return {
    type: meta.type,
    title: meta.title,
    releaseYear: meta.releaseYear,
  };
}

export const createSourceSlice: MakeSlice<SourceSlice> = (set, get) => ({
  status: playerStatus.IDLE,
  meta: null,
  source: null,
  sourceId: null,
  currentQuality: null,
  currentAudioTrack: null,
  qualities: [],
  audioTracks: [],
  caption: {
    selected: null,
    asTrack: false,
  },
  captionList: [],
  interface: {
    shouldStartFromBeginning: false,
  },
  setStatus(status) {
    set((state) => {
      state.status = status;
    });
  },
  setMeta(meta, status) {
    set((state) => {
      state.meta = meta;
      if (status) state.status = status;
    });
  },
  setSource(source, captions, startAt = 0) {
    set((state) => {
      state.source = source;
      state.captionList = captions;
    });
    const display = get().display;
    if (display && source) {
      display.load({
        source,
        startAt,
        automaticQuality: false,
        preferredQuality: null,
      });
    }
  },
  setCaption(caption) {
    set((state) => {
      state.caption.selected = caption;
    });
  },
  setSourceId(id) {
    set((state) => {
      state.sourceId = id;
    });
    if (id) {
      addCachedMetadata({
        id,
        name: id,
        type: "source",
        mediaTypes: ["movie", "show"]
      });
    }
  },
  setShouldStartFromBeginning(shouldStart) {
    set((state) => {
      state.interface.shouldStartFromBeginning = shouldStart;
    });
  },
  redisplaySource(time) {
    // No-op for standalone player
  },
  switchQuality(quality) {
    const display = get().display;
    if (display) {
      display.changeQuality(false, quality);
    }
  },
  enableAutomaticQuality() {
    const display = get().display;
    if (display) {
      display.changeQuality(true, null);
    }
  },
  reset() {
    set((state) => {
      state.status = playerStatus.IDLE;
      state.meta = null;
      state.source = null;
      state.sourceId = null;
      state.caption.selected = null;
      state.captionList = [];
    });
  },
});
