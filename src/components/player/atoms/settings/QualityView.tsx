import Hls from "hls.js";
import { t } from "i18next";
import { useCallback, useMemo } from "react";
import { Trans } from "react-i18next";

import { Toggle } from "@/components/buttons/Toggle";
import { Menu } from "@/components/player/internals/ContextMenu";
import { SelectableLink } from "@/components/player/internals/ContextMenu/Links";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { usePlayerStore } from "@/stores/player/store";
import {
  SourceQuality,
  allQualities,
  qualityToString,
} from "@/stores/player/utils/qualities";
import { useQualityStore } from "@/stores/quality";
import { canPlayHlsNatively } from "@/utils/detectFeatures";

const alwaysVisibleQualities: Record<SourceQuality, boolean> = {
  unknown: false,
  "144": false,
  "240": false,
  "360": false,
  "480": false,
  "540": false,
  "720": false,
  "1080": false,
  "1440": false,
  "4k": false,
};

function useIsIosHls() {
  const sourceType = usePlayerStore((s) => s.source?.type);
  const result = useMemo(() => {
    const videoEl = document.createElement("video");
    if (sourceType !== "hls") return false;
    if (Hls.isSupported()) return false;
    if (!canPlayHlsNatively(videoEl)) return false;
    return true;
  }, [sourceType]);
  return result;
}

export function QualityView({ id }: { id: string }) {
  const router = useOverlayRouter(id);
  const isIosHls = useIsIosHls();
  const availableQualities = usePlayerStore((s) => s.qualities);
  const currentQuality = usePlayerStore((s) => s.currentQuality);
  const sourceType = usePlayerStore((s) => s.source?.type);
  const switchQuality = usePlayerStore((s) => s.switchQuality);
  const enableAutomaticQuality = usePlayerStore(
    (s) => s.enableAutomaticQuality,
  );
  const setAutomaticQuality = useQualityStore((s) => s.setAutomaticQuality);
  const setLastChosenQuality = useQualityStore((s) => s.setLastChosenQuality);
  const autoQuality = useQualityStore((s) => s.quality.automaticQuality);

  const change = useCallback(
    (q: SourceQuality) => {
      setLastChosenQuality(q);
      setAutomaticQuality(false);
      switchQuality(q);
      router.close();
    },
    [router, switchQuality, setLastChosenQuality, setAutomaticQuality],
  );

  const changeAutomatic = useCallback(() => {
    const newValue = !autoQuality;
    setAutomaticQuality(newValue);
    if (newValue) enableAutomaticQuality();
  }, [setAutomaticQuality, autoQuality, enableAutomaticQuality]);

  const visibleQualities = allQualities.filter((quality) => {
    if (alwaysVisibleQualities[quality]) return true;
    if (availableQualities.includes(quality)) return true;
    return false;
  });

  // For MP4, hide quality selection since there's only one quality
  const isMp4 = sourceType === "mp4";

  // Check if current quality is "Auto" (null or unknown)
  const isAutoQuality = !currentQuality || currentQuality === "unknown";

  return (
    <>
      <Menu.BackLink onClick={() => router.navigate("/")}>
        {t("player.menus.quality.title")}
      </Menu.BackLink>
      <Menu.Section className="flex flex-col pb-4">
        {/* Show Auto/Default option when no specific quality is set or for MP4 */}
        {(isAutoQuality || isMp4) && (
          <SelectableLink
            key="auto"
            selected={isAutoQuality}
            disabled={isMp4}
            onClick={isMp4 ? undefined : changeAutomatic}
          >
            {qualityToString(null, sourceType)}
          </SelectableLink>
        )}
        {visibleQualities.map((v) => (
          <SelectableLink
            key={v}
            selected={v === currentQuality}
            onClick={
              availableQualities.includes(v) && !isMp4 ? () => change(v) : undefined
            }
            disabled={!availableQualities.includes(v) || isMp4}
          >
            {qualityToString(v, sourceType)}
          </SelectableLink>
        ))}
        {!isMp4 && (
          <>
            <Menu.Divider />
            <Menu.Link
              rightSide={<Toggle onClick={changeAutomatic} enabled={autoQuality} />}
            >
              {t("player.menus.quality.automaticLabel")}
            </Menu.Link>
          </>
        )}
        <Menu.SmallText>
          <Trans
            i18nKey={
              isIosHls
                ? "player.menus.quality.iosNoQuality"
                : "player.menus.quality.hint"
            }
          >
            <Menu.Anchor onClick={() => router.navigate("/source")}>
              text
            </Menu.Anchor>
          </Trans>
        </Menu.SmallText>
      </Menu.Section>
    </>
  );
}
