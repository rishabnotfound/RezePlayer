import fscreen from "fscreen";
import Hls, { Level } from "hls.js";

import {
  RULE_IDS,
  isExtensionActiveCached,
  setDomainRule,
} from "@/backend/extension/messaging";
import {
  DisplayInterface,
  DisplayInterfaceEvents,
} from "@/components/player/display/displayInterface";
import { handleBuffered } from "@/components/player/utils/handleBuffered";
import { getMediaErrorDetails } from "@/components/player/utils/mediaErrorDetails";
import { useLanguageStore } from "@/stores/language";
import {
  LoadableSource,
  SourceQuality,
  getPreferredQuality,
} from "@/stores/player/utils/qualities";
import { processCdnLink } from "@/utils/cdn";
import {
  canChangeVolume,
  canFullscreen,
  canFullscreenAnyElement,
  canPictureInPicture,
  canPlayHlsNatively,
  canWebkitFullscreen,
  canWebkitPictureInPicture,
} from "@/utils/detectFeatures";
import { makeEmitter } from "@/utils/events";

const levelConversionMap: Record<number, SourceQuality> = {
  144: "144",
  180: "144",
  240: "240",
  270: "240",
  360: "360",
  406: "360",
  480: "480",
  540: "540",
  720: "720",
  1080: "1080",
  1440: "1440",
  2160: "4k",
};

function hlsLevelToQuality(level?: Level): SourceQuality | null {
  const height = level?.height ?? 0;
  if (levelConversionMap[height]) return levelConversionMap[height];
  const heights = Object.keys(levelConversionMap).map(Number).sort((a, b) => a - b);
  for (const h of heights) {
    if (height <= h) return levelConversionMap[h];
  }
  return levelConversionMap[heights[heights.length - 1]] ?? null;
}

function qualityToHlsLevel(quality: SourceQuality): number | null {
  const found = Object.entries(levelConversionMap).find(
    (entry) => entry[1] === quality,
  );
  return found ? +found[0] : null;
}

function hlsLevelsToQualities(levels: Level[]): SourceQuality[] {
  return levels
    .map((v) => hlsLevelToQuality(v))
    .filter((v): v is SourceQuality => !!v);
}

export function makeVideoElementDisplayInterface(): DisplayInterface {
  const { emit, on, off } = makeEmitter<DisplayInterfaceEvents>();
  let source: LoadableSource | null = null;
  let hls: Hls | null = null;
  let videoElement: HTMLVideoElement | null = null;
  let containerElement: HTMLElement | null = null;
  let isFullscreen = false;
  let isPausedBeforeSeeking = false;
  let isSeeking = false;
  let startAt = 0;
  let automaticQuality = false;
  let preferenceQuality: SourceQuality | null = null;
  let lastVolume = 1;

  const languagePromises = new Map<
    string,
    (value: void | PromiseLike<void>) => void
  >();

  function reportLevels() {
    if (!hls) return;
    const levels = hls.levels;
    const convertedLevels = levels
      .map((v) => hlsLevelToQuality(v))
      .filter((v): v is SourceQuality => !!v);
    emit("qualities", convertedLevels);
  }

  function reportAudioTracks() {
    if (!hls) return;
    const currentLanguage = useLanguageStore.getState().language;
    const audioTracks = hls.audioTracks;
    const languageTrack = audioTracks.find((v) => v.lang === currentLanguage);
    if (languageTrack) {
      hls.audioTrack = audioTracks.indexOf(languageTrack);
    }
    const currentTrack = audioTracks?.[hls.audioTrack ?? 0];
    if (!currentTrack) return;
    emit("changedaudiotrack", {
      id: currentTrack.id.toString(),
      label: currentTrack.name,
      language: currentTrack.lang ?? "unknown",
    });
    emit(
      "audiotracks",
      hls.audioTracks.map((v) => ({
        id: v.id.toString(),
        label: v.name,
        language: v.lang ?? "unknown",
      })),
    );
  }

  function setupQualityForHls() {
    if (videoElement && canPlayHlsNatively(videoElement)) {
      return; // nothing to change
    }

    if (!hls) return;

    if (!automaticQuality) {
      const qualities = hlsLevelsToQualities(hls.levels);
      const availableQuality = getPreferredQuality(qualities, {
        lastChosenQuality: preferenceQuality,
        automaticQuality,
      });

      if (availableQuality) {
        const targetHeight = qualityToHlsLevel(availableQuality);

        // Find the closest matching level instead of exact match
        let levelIndex = hls.levels.findIndex(
          (v) => v.height === targetHeight,
        );

        // If exact match not found, find the level that corresponds to this quality
        if (levelIndex === -1) {
          levelIndex = hls.levels.findIndex((level) => {
            const levelQuality = hlsLevelToQuality(level);
            return levelQuality === availableQuality;
          });
        }

        if (levelIndex !== -1) {
          // Set the level manually (this disables auto level selection)
          hls.currentLevel = levelIndex;
          hls.loadLevel = levelIndex;
        }
      }
    } else {
      hls.currentLevel = -1;
      hls.loadLevel = -1;
    }
    const quality = hlsLevelToQuality(hls.levels[hls.currentLevel >= 0 ? hls.currentLevel : hls.loadLevel]);
    emit("changedquality", quality);
  }

  function setupSource(vid: HTMLVideoElement, src: LoadableSource) {
    hls = null;
    if (src.type === "hls") {
      if (canPlayHlsNatively(vid)) {
        vid.src = processCdnLink(src.url);
        vid.currentTime = startAt;
        return;
      }

      if (!Hls.isSupported()) throw new Error("HLS not supported");
      if (!hls) {
        hls = new Hls({
          maxBufferSize: 500 * 1000 * 1000, // 500 mb of buffering, should load more fragments at once
          fragLoadPolicy: {
            default: {
              maxLoadTimeMs: 30 * 1000, // allow it load extra long, fragments are slow if requested for the first time on an origin
              maxTimeToFirstByteMs: 30 * 1000,
              errorRetry: {
                maxNumRetry: 2,
                retryDelayMs: 1000,
                maxRetryDelayMs: 8000,
              },
              timeoutRetry: {
                maxNumRetry: 3,
                maxRetryDelayMs: 0,
                retryDelayMs: 0,
              },
            },
          },
          renderTextTracksNatively: false,
        });

        // Store HLS event handlers so they can be removed
        const hlsHandlers = {
          onError: (event: any, data: any) => {
            console.error("HLS error", data);
            if (data.fatal && src?.url === data.frag?.baseurl) {
              emit("error", {
                message: data.error.message,
                stackTrace: data.error.stack,
                errorName: data.error.name,
                type: "hls",
              });
            }
          },
          onManifestLoaded: () => {
            if (!hls) return;
            reportLevels();
            setupQualityForHls();
            reportAudioTracks();
          },
          onLevelLoaded: async (_: any, data: any) => {
            if (!isExtensionActiveCached()) return;
            const chunkUrlsDomains = data.details.fragments.map(
              (v: any) => new URL(v.url).hostname,
            );
            const chunkUrls = [...new Set(chunkUrlsDomains)];

            await setDomainRule({
              ruleId: RULE_IDS.SET_DOMAINS_HLS,
              targetDomains: chunkUrls,
              requestHeaders: {
                ...src.preferredHeaders,
                ...src.headers,
              },
            });
          },
          onAudioTrackLoaded: async (_: any, data: any) => {
            if (!isExtensionActiveCached()) return;
            const chunkUrlsDomains = data.details.fragments.map(
              (v: any) => new URL(v.url).hostname,
            );
            const chunkUrls = [...new Set(chunkUrlsDomains)];

            await setDomainRule({
              ruleId: RULE_IDS.SET_DOMAINS_HLS_AUDIO,
              targetDomains: chunkUrls,
              requestHeaders: {
                ...src.preferredHeaders,
                ...src.headers,
              },
            });
          },
          onLevelSwitched: () => {
            if (!hls) return;
            const quality = hlsLevelToQuality(hls.levels[hls.currentLevel]);
            emit("changedquality", quality);
          },
          onSubtitleTrackLoaded: () => {
            for (const [lang, resolve] of languagePromises) {
              const track = hls?.subtitleTracks.find((t) => t.lang === lang);
              if (track) {
                resolve();
                languagePromises.delete(lang);
                break;
              }
            }
          },
        };

        hls.on(Hls.Events.ERROR, hlsHandlers.onError);
        hls.on(Hls.Events.MANIFEST_LOADED, hlsHandlers.onManifestLoaded);
        hls.on(Hls.Events.LEVEL_LOADED, hlsHandlers.onLevelLoaded);
        hls.on(Hls.Events.AUDIO_TRACK_LOADED, hlsHandlers.onAudioTrackLoaded);
        hls.on(Hls.Events.LEVEL_SWITCHED, hlsHandlers.onLevelSwitched);
        hls.on(Hls.Events.SUBTITLE_TRACK_LOADED, hlsHandlers.onSubtitleTrackLoaded);
      }

      hls.attachMedia(vid);
      hls.loadSource(processCdnLink(src.url));
      vid.currentTime = startAt;
      return;
    }

    vid.src = processCdnLink(src.url);
    vid.currentTime = startAt;
  }

  // Store video element event handlers so they can be removed
  const videoHandlers = {
    onPlay: () => {
      emit("play", undefined);
      emit("loading", false);
    },
    onError: () => {
      const err = videoElement?.error ?? null;
      const errorDetails = getMediaErrorDetails(err);
      emit("error", {
        errorName: errorDetails.name,
        key: errorDetails.key,
        type: "htmlvideo",
      });
    },
    onPlaying: () => emit("play", undefined),
    onPause: () => emit("pause", undefined),
    onCanPlay: () => emit("loading", false),
    onWaiting: () => emit("loading", true),
    onVolumeChange: () =>
      emit(
        "volumechange",
        videoElement?.muted ? 0 : (videoElement?.volume ?? 0),
      ),
    onTimeUpdate: () => emit("time", videoElement?.currentTime ?? 0),
    onLoadedMetadata: () => {
      if (source?.type === "mp4") {
        emit("qualities", ["unknown"]);
        emit("changedquality", "unknown");
      } else if (
        source?.type === "hls" &&
        videoElement &&
        canPlayHlsNatively(videoElement)
      ) {
        emit("qualities", ["unknown"]);
        emit("changedquality", "unknown");
      }
      emit("duration", videoElement?.duration ?? 0);
    },
    onProgress: () => {
      if (videoElement)
        emit(
          "buffered",
          handleBuffered(videoElement.currentTime, videoElement.buffered),
        );
    },
    onWebkitEndFullscreen: () => {
      isFullscreen = false;
      emit("fullscreen", isFullscreen);
      if (!isFullscreen) emit("needstrack", false);
    },
    onWebkitPlaybackTargetAvailabilityChanged: (e: any) => {
      if (e.availability === "available") {
        emit("canairplay", true);
      }
    },
    onRateChange: () => {
      if (videoElement) emit("playbackrate", videoElement.playbackRate);
    },
  };

  function removeVideoElementListeners() {
    if (!videoElement) return;
    videoElement.removeEventListener("play", videoHandlers.onPlay);
    videoElement.removeEventListener("error", videoHandlers.onError);
    videoElement.removeEventListener("playing", videoHandlers.onPlaying);
    videoElement.removeEventListener("pause", videoHandlers.onPause);
    videoElement.removeEventListener("canplay", videoHandlers.onCanPlay);
    videoElement.removeEventListener("waiting", videoHandlers.onWaiting);
    videoElement.removeEventListener("volumechange", videoHandlers.onVolumeChange);
    videoElement.removeEventListener("timeupdate", videoHandlers.onTimeUpdate);
    videoElement.removeEventListener("loadedmetadata", videoHandlers.onLoadedMetadata);
    videoElement.removeEventListener("progress", videoHandlers.onProgress);
    videoElement.removeEventListener("webkitendfullscreen", videoHandlers.onWebkitEndFullscreen);
    videoElement.removeEventListener("webkitplaybacktargetavailabilitychanged", videoHandlers.onWebkitPlaybackTargetAvailabilityChanged);
    videoElement.removeEventListener("ratechange", videoHandlers.onRateChange);
  }

  function setSource() {
    if (!videoElement || !source) return;
    setupSource(videoElement, source);

    // Remove existing listeners before adding new ones
    removeVideoElementListeners();

    // Add event listeners
    videoElement.addEventListener("play", videoHandlers.onPlay);
    videoElement.addEventListener("error", videoHandlers.onError);
    videoElement.addEventListener("playing", videoHandlers.onPlaying);
    videoElement.addEventListener("pause", videoHandlers.onPause);
    videoElement.addEventListener("canplay", videoHandlers.onCanPlay);
    videoElement.addEventListener("waiting", videoHandlers.onWaiting);
    videoElement.addEventListener("volumechange", videoHandlers.onVolumeChange);
    videoElement.addEventListener("timeupdate", videoHandlers.onTimeUpdate);
    videoElement.addEventListener("loadedmetadata", videoHandlers.onLoadedMetadata);
    videoElement.addEventListener("progress", videoHandlers.onProgress);
    videoElement.addEventListener("webkitendfullscreen", videoHandlers.onWebkitEndFullscreen);
    videoElement.addEventListener("webkitplaybacktargetavailabilitychanged", videoHandlers.onWebkitPlaybackTargetAvailabilityChanged);
    videoElement.addEventListener("ratechange", videoHandlers.onRateChange);
  }

  function unloadSource() {
    // Remove all video element event listeners to prevent memory leaks
    removeVideoElementListeners();

    if (videoElement) {
      videoElement.removeAttribute("src");
      videoElement.load();
    }
    if (hls) {
      // Remove all HLS event listeners before destroying
      hls.off(Hls.Events.ERROR);
      hls.off(Hls.Events.MANIFEST_LOADED);
      hls.off(Hls.Events.LEVEL_LOADED);
      hls.off(Hls.Events.AUDIO_TRACK_LOADED);
      hls.off(Hls.Events.LEVEL_SWITCHED);
      hls.off(Hls.Events.SUBTITLE_TRACK_LOADED);

      hls.destroy();
      hls = null;
    }
  }

  function destroyVideoElement() {
    unloadSource();
    if (videoElement) {
      videoElement = null;
    }
  }

  function fullscreenChange() {
    isFullscreen =
      !!document.fullscreenElement || // other browsers
      !!(document as any).webkitFullscreenElement; // safari
    emit("fullscreen", isFullscreen);
    if (!isFullscreen) emit("needstrack", false);
  }
  fscreen.addEventListener("fullscreenchange", fullscreenChange);

  return {
    on,
    off,
    getType() {
      return "web";
    },
    destroy: () => {
      destroyVideoElement();
      fscreen.removeEventListener("fullscreenchange", fullscreenChange);
    },
    load(ops) {
      if (!ops.source) unloadSource();
      automaticQuality = ops.automaticQuality;
      preferenceQuality = ops.preferredQuality;
      source = ops.source;
      emit("loading", true);
      startAt = ops.startAt;
      setSource();
    },
    changeQuality(newAutomaticQuality, newPreferredQuality) {
      if (source?.type !== "hls") return;
      automaticQuality = newAutomaticQuality;
      preferenceQuality = newPreferredQuality;
      setupQualityForHls();
    },

    processVideoElement(video) {
      destroyVideoElement();
      videoElement = video;
      setSource();
      this.setVolume(lastVolume);
    },
    processContainerElement(container) {
      containerElement = container;
    },
    setMeta() {},
    setCaption() {},

    pause() {
      videoElement?.pause();
    },
    play() {
      videoElement?.play();
    },
    setSeeking(active) {
      if (active === isSeeking) return;
      isSeeking = active;

      // if it was playing when starting to seek, play again
      if (!active) {
        if (!isPausedBeforeSeeking) this.play();
        return;
      }

      isPausedBeforeSeeking = videoElement?.paused ?? true;
      this.pause();
    },
    setTime(t) {
      if (!videoElement) return;
      // clamp time between 0 and max duration
      let time = Math.min(t, videoElement.duration);
      time = Math.max(0, time);

      if (Number.isNaN(time)) return;
      emit("time", time);
      videoElement.currentTime = time;
    },
    async setVolume(v) {
      // clamp time between 0 and 1
      let volume = Math.min(v, 1);
      volume = Math.max(0, volume);

      // actually set
      lastVolume = v;
      if (!videoElement) return;
      videoElement.muted = volume === 0; // Muted attribute is always supported

      // update state
      const isChangeable = await canChangeVolume();
      if (isChangeable) {
        videoElement.volume = volume;
      } else {
        // For browsers where it can't be changed
        emit("volumechange", volume === 0 ? 0 : 1);
      }
    },
    toggleFullscreen() {
      if (isFullscreen) {
        isFullscreen = false;
        emit("fullscreen", isFullscreen);
        emit("needstrack", false);
        if (!fscreen.fullscreenElement) return;
        fscreen.exitFullscreen();
        return;
      }

      // enter fullscreen
      isFullscreen = true;
      emit("fullscreen", isFullscreen);
      if (!canFullscreen() || fscreen.fullscreenElement) return;
      if (canFullscreenAnyElement()) {
        if (containerElement) fscreen.requestFullscreen(containerElement);
        return;
      }
      if (canWebkitFullscreen()) {
        if (videoElement) {
          emit("needstrack", true);
          (videoElement as any).webkitEnterFullscreen();
        }
      }
    },
    togglePictureInPicture() {
      if (!videoElement) return;
      if (canWebkitPictureInPicture()) {
        const webkitPlayer = videoElement as any;
        webkitPlayer.webkitSetPresentationMode(
          webkitPlayer.webkitPresentationMode === "picture-in-picture"
            ? "inline"
            : "picture-in-picture",
        );
      }
      if (canPictureInPicture()) {
        if (videoElement !== document.pictureInPictureElement) {
          videoElement.requestPictureInPicture();
        } else {
          document.exitPictureInPicture();
        }
      }
    },
    startAirplay() {
      const videoPlayer = videoElement as any;
      if (videoPlayer && videoPlayer.webkitShowPlaybackTargetPicker) {
        videoPlayer.webkitShowPlaybackTargetPicker();
      }
    },
    setPlaybackRate(rate) {
      if (videoElement) videoElement.playbackRate = rate;
    },
    getCaptionList() {
      return (
        hls?.subtitleTracks.map((track) => {
          return {
            id: track.id.toString(),
            language: track.lang ?? "unknown",
            url: track.url,
            needsProxy: false,
            hls: true,
          };
        }) ?? []
      );
    },
    getSubtitleTracks() {
      return hls?.subtitleTracks ?? [];
    },
    async setSubtitlePreference(lang) {
      // default subtitles are already loaded by hls.js
      const track = hls?.subtitleTracks.find((t) => t.lang === lang);
      if (track?.details !== undefined) return Promise.resolve();

      // need to wait a moment before hls loads the subtitles
      const promise = new Promise<void>((resolve, reject) => {
        languagePromises.set(lang, resolve);

        // reject after some time, if hls.js fails to load the subtitles
        // for any reason
        setTimeout(() => {
          reject();
          languagePromises.delete(lang);
        }, 5000);
      });
      hls?.setSubtitleOption({ lang });
      return promise;
    },
    changeAudioTrack(track) {
      if (!hls) return;
      const audioTrack = hls?.audioTracks.find(
        (t) => t.id.toString() === track.id,
      );
      if (!audioTrack) return;
      hls.audioTrack = hls.audioTracks.indexOf(audioTrack);
      emit("changedaudiotrack", {
        id: audioTrack.id.toString(),
        label: audioTrack.name,
        language: audioTrack.lang ?? "unknown",
      });
    },
  };
}
