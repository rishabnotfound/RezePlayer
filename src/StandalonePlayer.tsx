import { useEffect, useState, useCallback, useRef } from "react";
import { Player } from "@/components/player";
import { useShouldShowControls } from "@/components/player/hooks/useShouldShowControls";
import { usePlayer } from "@/components/player/hooks/usePlayer";
import { playerStatus } from "@/stores/player/slices/source";
import { usePlayerStore } from "@/stores/player/store";
import { SettingsRouter } from "@/components/player/atoms/Settings";
import { ThumbnailScraper } from "@/components/player/internals/ThumbnailScraper";
import { usePreferencesStore } from "@/stores/preferences";
import { addCachedMetadata } from "@/backend/helpers/providerApi";
import { useSubtitleStore } from "@/stores/subtitles";
import { downloadCaption } from "@/backend/helpers/subs";

export function StandalonePlayer() {
  const { showTargets, showTouchTargets } = useShouldShowControls();
  const setEnableThumbnails = usePreferencesStore((s) => s.setEnableThumbnails);
  const [currentServerIndex, setCurrentServerIndex] = useState<number>(-1);

  // Get enableCast setting from config (default: true)
  const config = (window as any).__REZEPLAYER_CONFIG__;
  const enableCast = config?.settings?.enableCast ?? true;

  // Store timer IDs to prevent memory leaks
  const initTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subtitleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setEnableThumbnails(true);
  }, [setEnableThumbnails]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
      }
      if (subtitleTimerRef.current) {
        clearTimeout(subtitleTimerRef.current);
      }
    };
  }, []);

  const status = usePlayerStore((s) => s.status);
  const isLoading = usePlayerStore((s) => s.mediaPlaying.isLoading);
  const { playMedia, setMeta } = usePlayer();

  const loadServer = useCallback((serverIndex: number) => {
    const config = (window as any).__REZEPLAYER_CONFIG__;
    if (!config || !config.servers || serverIndex >= config.servers.length) return;

    const server = config.servers[serverIndex];

    setMeta({
      type: 'movie',
      title: config.meta.title || 'Video',
      tmdbId: 'standalone-video',
    });

    const source = {
      type: server.type,
      url: server.url,
    };

    const captions = (config.subtitles || []).map((cap: any) => ({
      id: cap.id,
      name: cap.name,
      language: cap.language || 'unknown',
      flagsapi: cap.flagsapi,
      hasCorsRestrictions: false,
      url: cap.url,
      type: cap.type,
      needsProxy: false,
      hls: false,
    }));

    playMedia(
      source as any,
      captions,
      server.name,
      config.settings.startTime || 0
    );

    // Clear any existing timers before creating new ones
    if (initTimerRef.current) {
      clearTimeout(initTimerRef.current);
      initTimerRef.current = null;
    }
    if (subtitleTimerRef.current) {
      clearTimeout(subtitleTimerRef.current);
      subtitleTimerRef.current = null;
    }

    // Apply volume, autoPlay, and default subtitle after a short delay
    initTimerRef.current = setTimeout(() => {
      const store = usePlayerStore.getState();
      const display = store.display;

      if (display) {
        // Set volume
        if (config.settings.defaultVolume !== undefined) {
          display.setVolume(config.settings.defaultVolume);
        }

        // Handle autoPlay
        if (config.settings.autoPlay === false) {
          display.pause();
        } else if (config.settings.autoPlay === true) {
          display.play();
        }
      }

      // Auto-select default subtitle
      const defaultSubtitle = config.subtitles?.find((sub: any) => sub.default);
      console.log('Default subtitle config:', defaultSubtitle);

      if (defaultSubtitle) {
        subtitleTimerRef.current = setTimeout(async () => {
          const captionList = usePlayerStore.getState().captionList;
          console.log('Caption list:', captionList);
          console.log('Looking for subtitle ID:', defaultSubtitle.id);

          const caption = captionList.find((c: any) => c.id === defaultSubtitle.id);
          console.log('Found caption:', caption);

          if (caption) {
            console.log('Auto-selecting default subtitle:', caption.name || caption.language);
            try {
              const srtData = await downloadCaption(caption);
              console.log('Downloaded subtitle data, length:', srtData.length);

              usePlayerStore.getState().setCaption({
                id: caption.id,
                name: caption.name,
                language: caption.language,
                flagsapi: caption.flagsapi,
                url: caption.url,
                srtData,
              });

              if (caption.language) {
                useSubtitleStore.getState().setLanguage(caption.language);
              }
              console.log('Default subtitle loaded successfully');
            } catch (error) {
              console.error('Error loading default subtitle:', error);
            }
          } else {
            console.warn('Caption not found in caption list');
          }
          subtitleTimerRef.current = null;
        }, 1000);
      } else {
        console.log('No default subtitle specified');
      }
      initTimerRef.current = null;
    }, 100);

    setCurrentServerIndex(serverIndex);
  }, [playMedia, setMeta]);

  useEffect(() => {
    const config = (window as any).__REZEPLAYER_CONFIG__;
    if (!config) {
      console.error('RezePlayer: No config found. Did you call RezePlayer.make()?');
      return;
    }

    // Register all servers in metadata cache
    config.servers.forEach((server: any) => {
      addCachedMetadata({
        id: server.name,
        name: server.name,
        type: "source",
        mediaTypes: ["movie", "show"]
      });
    });

    // Load first server by default
    loadServer(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Listen for source changes from Sources menu
  const sourceId = usePlayerStore((s) => s.sourceId);
  useEffect(() => {
    if (!sourceId || currentServerIndex === -1) return;

    const config = (window as any).__REZEPLAYER_CONFIG__;
    if (!config) return;

    const serverIndex = config.servers.findIndex((s: any) => s.name === sourceId);
    if (serverIndex !== -1 && serverIndex !== currentServerIndex) {
      console.log(`Switching to server: ${sourceId}`);
      loadServer(serverIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId]); // Only watch sourceId changes

  return (
    <Player.Container showingControls={showTargets}>
      <Player.BlackOverlay
        show={showTargets && status === playerStatus.PLAYING}
      />
      <Player.SubtitleView controlsShown={showTargets} />

      {status === playerStatus.PLAYING ? (
        <>
          <Player.CenterControls>
            <Player.LoadingSpinner />
          </Player.CenterControls>
        </>
      ) : null}

      <Player.CenterMobileControls
        className="text-white"
        show={showTouchTargets && status === playerStatus.PLAYING}
      >
        <Player.SkipBackward iconSizeClass="text-3xl" />
        <Player.Pause
          iconSizeClass="text-5xl"
          className={isLoading ? "opacity-0" : "opacity-100"}
        />
        <Player.SkipForward iconSizeClass="text-3xl" />
      </Player.CenterMobileControls>

      <Player.TopControls show={showTargets}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <Player.Title />
          </div>
        </div>
      </Player.TopControls>

      <Player.BottomControls show={showTargets}>
        <div className="flex items-center justify-center space-x-3 h-full">
          {status === playerStatus.PLAYING ? (
            <>
              <Player.ProgressBar />
            </>
          ) : null}
        </div>
        <div className="hidden lg:flex justify-between" dir="ltr">
          <Player.LeftSideControls>
            {status === playerStatus.PLAYING ? (
              <>
                <Player.Pause />
                <Player.SkipBackward />
                <Player.SkipForward />
                <Player.Volume />
                <Player.Time />
              </>
            ) : null}
          </Player.LeftSideControls>
          <div className="flex items-center space-x-3">
            {status === playerStatus.PLAYING ? (
              <>
                <Player.Pip />
                <Player.Captions />
                <Player.Settings />
              </>
            ) : null}
            <Player.Fullscreen />
          </div>
        </div>
        <div className="grid grid-cols-[2.5rem,1fr,2.5rem] gap-3 lg:hidden">
          <div />
          <div className="flex justify-center items-center space-x-3">
            {status === playerStatus.PLAYING ? (
              <>
                <Player.Time short />
                <Player.Pip />
                <Player.Settings />
              </>
            ) : null}
          </div>
          <div>
            <Player.Fullscreen />
          </div>
        </div>
      </Player.BottomControls>

      <Player.VolumeChangedPopout />
      <SettingsRouter />
      <ThumbnailScraper />
    </Player.Container>
  );
}
