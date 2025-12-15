import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getCachedMetadata } from "@/backend/helpers/providerApi";
import { Toggle } from "@/components/buttons/Toggle";
import { Icon, Icons } from "@/components/Icon";
import { useCaptions } from "@/components/player/hooks/useCaptions";
import { Menu } from "@/components/player/internals/ContextMenu";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { usePlayerStore } from "@/stores/player/store";
import { qualityToString } from "@/stores/player/utils/qualities";
import { useSubtitleStore } from "@/stores/subtitles";
import { getPrettyLanguageNameFromLocale } from "@/utils/language";

import { useDownloadLink } from "./Downloads";

export function SettingsMenu({ id }: { id: string }) {
  const downloadUrl = useDownloadLink();
  const { t } = useTranslation();
  const router = useOverlayRouter(id);
  const currentQuality = usePlayerStore((s) => s.currentQuality);
  const currentAudioTrack = usePlayerStore((s) => s.currentAudioTrack);
  const audioTracks = usePlayerStore((s) => s.audioTracks);
  const selectedCaption = usePlayerStore((s) => s.caption.selected);
  const selectedCaptionLanguage = selectedCaption?.language;
  const subtitlesEnabled = useSubtitleStore((s) => s.enabled);
  const currentSourceId = usePlayerStore((s) => s.sourceId);
  const sourceName = useMemo(() => {
    if (!currentSourceId) return "...";
    const source = getCachedMetadata().find(
      (src) => src.id === currentSourceId,
    );
    return source?.name ?? "...";
  }, [currentSourceId]);
  const { toggleLastUsed } = useCaptions();

  const selectedLanguagePretty = selectedCaption
    ? (selectedCaption.name ||
      getPrettyLanguageNameFromLocale(selectedCaptionLanguage) ||
      t("player.menus.subtitles.unknownLanguage"))
    : undefined;

  const source = usePlayerStore((s) => s.source);

  const selectedAudioLanguagePretty = currentAudioTrack
    ? (getPrettyLanguageNameFromLocale(currentAudioTrack.language) ??
      currentAudioTrack.label ??
      t("player.menus.subtitles.unknownLanguage"))
    : "Default";

  const showAudioOption = source !== null;

  const downloadable = source?.type === "file" || source?.type === "hls";

  // Check if watch party is enabled from config
  const config = (window as any).__REZEPLAYER_CONFIG__;
  const enableWatchParty = config?.settings?.enableWatchParty ?? true;
  const enableCast = config?.settings?.enableCast ?? true;
  const themeSettings = config?.settings?.themeSettings ?? true;

  const handleWatchPartyClick = () => {
    if (downloadUrl) {
      const watchPartyUrl = `https://www.watchparty.me/create?video=${encodeURIComponent(
        downloadUrl,
      )}`;
      window.open(watchPartyUrl);
    }
  };

  const handleChromecastClick = () => {
    const castButton = document.querySelector("google-cast-launcher") as HTMLElement;
    if (castButton) {
      castButton.click();
    }
  };
  return (
    <Menu.Card>
      {/* Grid of quick settings boxes */}
      <div className="grid grid-cols-2 gap-2 px-4 pt-4 pb-3">
        {/* Quality Box */}
        <button
          onClick={() => router.navigate("/quality")}
          className="flex flex-col items-center justify-center bg-video-context-hoverColor bg-opacity-30 hover:bg-opacity-80 rounded-lg py-5 px-5 transition-all cursor-pointer min-h-[60px]"
        >
          <span className="text-video-context-type-main text-base font-normal mb-1">
            {t("player.menus.settings.qualityItem")}
          </span>
          <span className="text-video-context-type-secondary text-sm text-white/50">
            {currentQuality ? qualityToString(currentQuality) : "Auto"}
          </span>
        </button>

        {/* Source Box */}
        <button
          onClick={() => router.navigate("/source")}
          className="flex flex-col items-center justify-center bg-video-context-hoverColor bg-opacity-30 hover:bg-opacity-80 rounded-lg py-5 px-5 transition-all cursor-pointer min-h-[60px]"
        >
          <span className="text-video-context-type-main text-base font-normal mb-1">
            {t("player.menus.settings.sourceItem")}
          </span>
          <span className="text-video-context-type-secondary text-sm truncate max-w-full text-white/50">
            {sourceName}
          </span>
        </button>

        {/* Subtitles Box */}
        <button
          onClick={() => router.navigate("/captions")}
          className="flex flex-col items-center justify-center bg-video-context-hoverColor bg-opacity-30 hover:bg-opacity-80 rounded-lg py-5 px-5 transition-all cursor-pointer min-h-[60px]"
        >
          <span className="text-video-context-type-main text-base font-normal mb-1">
            {t("player.menus.settings.subtitleItem")}
          </span>
          <span className="text-video-context-type-secondary text-sm text-white/50">
            {subtitlesEnabled ? (selectedLanguagePretty ?? "On") : "Off"}
          </span>
        </button>

        {/* Audio Box */}
        {showAudioOption && (
          <button
            onClick={() => router.navigate("/audio")}
            className="flex flex-col items-center justify-center bg-video-context-hoverColor bg-opacity-30 hover:bg-opacity-80 rounded-lg py-5 px-5 transition-all cursor-pointer min-h-[60px]"
          >
            <span className="text-video-context-type-main text-base font-normal mb-1">
              {t("player.menus.settings.audioItem")}
            </span>
            <span className="text-video-context-type-secondary text-sm truncate max-w-full text-white/50">
              {selectedAudioLanguagePretty}
            </span>
          </button>
        )}
      </div>

      {/* Additional options */}
      <Menu.Section>
        {enableWatchParty && (
          <Menu.Link
            clickable
            onClick={handleWatchPartyClick}
            rightSide={<Icon className="text-xl" icon={Icons.WATCH_PARTY} />}
            className={downloadable ? "opacity-100" : "opacity-50"}
          >
            {t("Watch Party")}
          </Menu.Link>
        )}
        {enableCast && (
          <Menu.Link
            clickable
            onClick={handleChromecastClick}
            rightSide={<Icon className="text-xl" icon={Icons.CASTING} />}
          >
            {t("Chromecast")}
          </Menu.Link>
        )}
        <Menu.ChevronLink onClick={() => router.navigate("/playback")}>
          {t("player.menus.settings.playbackItem")}
        </Menu.ChevronLink>
        {themeSettings && (
          <Menu.ChevronLink onClick={() => router.navigate("/appearance")}>
            Appearance Settings
          </Menu.ChevronLink>
        )}
      </Menu.Section>
    </Menu.Card>
  );
}
