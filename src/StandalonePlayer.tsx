import { useEffect, useState, useCallback } from "react";
import { Player } from "@/components/player";
import { useShouldShowControls } from "@/components/player/hooks/useShouldShowControls";
import { usePlayer } from "@/components/player/hooks/usePlayer";
import { playerStatus } from "@/stores/player/slices/source";
import { usePlayerStore } from "@/stores/player/store";
import { SettingsRouter } from "@/components/player/atoms/Settings";
import { ThumbnailScraper } from "@/components/player/internals/ThumbnailScraper";
import { usePreferencesStore } from "@/stores/preferences";
import { getConfigForServer, servers } from "@/server";
import { addCachedMetadata } from "@/backend/helpers/providerApi";
import { findWorkingServer } from "@/utils/serverManager";

export function StandalonePlayer() {
  const { showTargets, showTouchTargets } = useShouldShowControls();
  const setEnableThumbnails = usePreferencesStore((s) => s.setEnableThumbnails);
  const [currentServerIndex, setCurrentServerIndex] = useState<number>(-1);

  useEffect(() => {
    setEnableThumbnails(true);
  }, [setEnableThumbnails]);

  const status = usePlayerStore((s) => s.status);
  const isLoading = usePlayerStore((s) => s.mediaPlaying.isLoading);
  const { playMedia, setMeta, reset } = usePlayer();

  const loadServer = useCallback(async (serverIndex: number) => {
    try {
      const config = getConfigForServer(serverIndex);

      setMeta({
        type: 'movie',
        title: config.meta.title,
        tmdbId: 'standalone-video',
      });

      const source = {
        type: config.stream.type,
        url: config.stream.url,
      };

      const captions = config.stream.captions?.map(cap => ({
        id: cap.id,
        language: cap.language,
        hasCorsRestrictions: false,
        url: cap.url,
        type: cap.type,
      })) || [];

      playMedia(
        source as any,
        captions,
        config.stream.name,
        config.settings.startTime
      );

      setCurrentServerIndex(serverIndex);
    } catch (error) {
      console.error(`Failed to load server ${serverIndex}:`, error);
      throw error;
    }
  }, [playMedia, setMeta]);

  useEffect(() => {
    // Register all servers in the metadata cache so they appear in Sources menu
    servers.forEach((server) => {
      addCachedMetadata({
        id: server.name,
        name: server.name,
        type: "source",
        mediaTypes: ["movie", "show"]
      });
    });

    // Load the first server by default
    loadServer(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Listen for source changes from the Sources menu
  const sourceId = usePlayerStore((s) => s.sourceId);
  useEffect(() => {
    if (!sourceId || currentServerIndex === -1) return;

    const serverIndex = servers.findIndex(s => s.name === sourceId);
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
          <div className="flex justify-center space-x-3">
            {status === playerStatus.PLAYING ? (
              <>
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
