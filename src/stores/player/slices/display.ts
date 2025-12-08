import { DisplayInterface } from "@/components/player/display/displayInterface";
import { playerStatus } from "@/stores/player/slices/source";
import { MakeSlice } from "@/stores/player/slices/types";

export interface DisplaySlice {
  display: DisplayInterface | null;
  setDisplay(display: DisplayInterface | null): void;
  reset(): void;
}

export const createDisplaySlice: MakeSlice<DisplaySlice> = (set, get) => {
  // Store event handlers so they can be removed later
  let eventHandlers: Record<string, any> = {};

  return {
    display: null,
    setDisplay(newDisplay: DisplayInterface | null) {
      const display = get().display;

      // Remove all event listeners from previous display to prevent memory leaks
      if (display) {
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          display.off(event as any, handler);
        });
        eventHandlers = {};
        display.destroy();
      }

      if (!newDisplay) {
        set((s) => {
          s.display = null;
        });
        return;
      }

      // Create named handler functions so they can be removed later
      eventHandlers = {
        pause: () =>
          set((s) => {
            s.mediaPlaying.isPaused = true;
            s.mediaPlaying.isPlaying = false;
          }),
        play: () =>
          set((s) => {
            s.mediaPlaying.hasPlayedOnce = true;
            s.mediaPlaying.isPaused = false;
            s.mediaPlaying.isPlaying = true;
          }),
        fullscreen: (isFullscreen: boolean) =>
          set((s) => {
            s.interface.isFullscreen = isFullscreen;
          }),
        time: (time: number) =>
          set((s) => {
            s.progress.time = time;
          }),
        volumechange: (vol: number) =>
          set((s) => {
            s.mediaPlaying.volume = vol;
          }),
        duration: (duration: number) =>
          set((s) => {
            s.progress.duration = duration;
          }),
        buffered: (buffered: number) =>
          set((s) => {
            s.progress.buffered = buffered;
          }),
        loading: (isLoading: boolean) =>
          set((s) => {
            s.mediaPlaying.isLoading = isLoading;
          }),
        qualities: (qualities: any) => {
          set((s) => {
            s.qualities = qualities;
          });
        },
        changedquality: (quality: any) => {
          set((s) => {
            s.currentQuality = quality;
          });
        },
        audiotracks: (audioTracks: any) => {
          set((s) => {
            s.audioTracks = audioTracks;
          });
        },
        changedaudiotrack: (audioTrack: any) => {
          set((s) => {
            s.currentAudioTrack = audioTrack;
          });
        },
        needstrack: (needsTrack: boolean) => {
          set((s) => {
            s.caption.asTrack = needsTrack;
          });
        },
        canairplay: (canAirplay: boolean) => {
          set((s) => {
            s.interface.canAirplay = canAirplay;
          });
        },
        playbackrate: (rate: number) => {
          set((s) => {
            s.mediaPlaying.playbackRate = rate;
          });
        },
        error: (err: any) => {
          set((s) => {
            s.status = playerStatus.PLAYBACK_ERROR;
            s.interface.error = err;
          });
        },
      };

      // Attach all event handlers
      newDisplay.on("pause", eventHandlers.pause);
      newDisplay.on("play", eventHandlers.play);
      newDisplay.on("fullscreen", eventHandlers.fullscreen);
      newDisplay.on("time", eventHandlers.time);
      newDisplay.on("volumechange", eventHandlers.volumechange);
      newDisplay.on("duration", eventHandlers.duration);
      newDisplay.on("buffered", eventHandlers.buffered);
      newDisplay.on("loading", eventHandlers.loading);
      newDisplay.on("qualities", eventHandlers.qualities);
      newDisplay.on("changedquality", eventHandlers.changedquality);
      newDisplay.on("audiotracks", eventHandlers.audiotracks);
      newDisplay.on("changedaudiotrack", eventHandlers.changedaudiotrack);
      newDisplay.on("needstrack", eventHandlers.needstrack);
      newDisplay.on("canairplay", eventHandlers.canairplay);
      newDisplay.on("playbackrate", eventHandlers.playbackrate);
      newDisplay.on("error", eventHandlers.error);

      set((s) => {
        s.display = newDisplay;
      });
    },
    reset() {
      get().display?.load({
        source: null,
        startAt: 0,
        automaticQuality: false,
        preferredQuality: null,
      });
      set((s) => {
        s.status = playerStatus.IDLE;
        s.meta = null;
        s.thumbnails.images = [];
        s.progress.time = 0;
        s.progress.duration = 0;
      });
    },
  };
};
