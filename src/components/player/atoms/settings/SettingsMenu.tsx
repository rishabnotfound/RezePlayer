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

  const selectedAudioLanguagePretty = currentAudioTrack
    ? (getPrettyLanguageNameFromLocale(currentAudioTrack.language) ??
      currentAudioTrack.label ??
      t("player.menus.subtitles.unknownLanguage"))
    : undefined;

  const source = usePlayerStore((s) => s.source);

  const downloadable = source?.type === "file" || source?.type === "hls";

  // Check if watch party is enabled from config
  const config = (window as any).__REZEPLAYER_CONFIG__;
  const enableWatchParty = config?.settings?.enableWatchParty ?? true;
  const enableCast = config?.settings?.enableCast ?? true;

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
      <Menu.SectionTitle>
        {t("player.menus.settings.videoSection")}
      </Menu.SectionTitle>
      <Menu.Section>
        <Menu.ChevronLink
          onClick={() => router.navigate("/quality")}
          rightText={currentQuality ? qualityToString(currentQuality) : ""}
        >
          {t("player.menus.settings.qualityItem")}
        </Menu.ChevronLink>
        {currentAudioTrack && (
          <Menu.ChevronLink
            onClick={() => router.navigate("/audio")}
            rightText={selectedAudioLanguagePretty ?? undefined}
          >
            {t("player.menus.settings.audioItem")}
          </Menu.ChevronLink>
        )}

        <Menu.ChevronLink
          onClick={() => router.navigate("/source")}
          rightText={sourceName}
        >
          {t("player.menus.settings.sourceItem")}
        </Menu.ChevronLink>
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
      </Menu.Section>

      <Menu.SectionTitle>
        {t("player.menus.settings.experienceSection")}
      </Menu.SectionTitle>
      <Menu.Section>
        <Menu.Link
          rightSide={
            <Toggle
              enabled={subtitlesEnabled}
              onClick={() => toggleLastUsed().catch(() => {})}
            />
          }
        >
          {t("player.menus.settings.enableSubtitles")}
        </Menu.Link>
        <Menu.ChevronLink
          onClick={() => router.navigate("/captions")}
          rightText={selectedLanguagePretty ?? undefined}
        >
          {t("player.menus.settings.subtitleItem")}
        </Menu.ChevronLink>
        <Menu.ChevronLink onClick={() => router.navigate("/playback")}>
          {t("player.menus.settings.playbackItem")}
        </Menu.ChevronLink>
      </Menu.Section>
    </Menu.Card>
  );
}
