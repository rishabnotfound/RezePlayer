import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { convert } from "subsrt-ts";

import { subtitleTypeList } from "@/backend/helpers/subs";
import { useCaptions } from "@/components/player/hooks/useCaptions";
import { Menu } from "@/components/player/internals/ContextMenu";
import { SelectableLink } from "@/components/player/internals/ContextMenu/Links";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { usePlayerStore } from "@/stores/player/store";
import { useSubtitleStore } from "@/stores/subtitles";

export function CaptionOption(props: {
  flagUrl?: string;
  children: React.ReactNode;
  selected?: boolean;
  loading?: boolean;
  onClick?: () => void;
  error?: React.ReactNode;
}) {
  return (
    <SelectableLink
      selected={props.selected}
      loading={props.loading}
      error={props.error}
      onClick={props.onClick}
    >
      <span
        data-active-link={props.selected ? true : undefined}
        className="flex items-center"
      >
        {props.flagUrl && (
          <span className="mr-3 inline-flex">
            <img
              src={props.flagUrl}
              alt="flag"
              className="w-8 h-6 object-cover rounded"
            />
          </span>
        )}
        <span>{props.children}</span>
      </span>
    </SelectableLink>
  );
}

export function CustomCaptionOption() {
  const { t } = useTranslation();
  const lang = usePlayerStore((s) => s.caption.selected?.language);
  const setCaption = usePlayerStore((s) => s.setCaption);
  const setCustomSubs = useSubtitleStore((s) => s.setCustomSubs);
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <CaptionOption
      selected={lang === "custom"}
      onClick={() => fileInput.current?.click()}
    >
      {t("player.menus.subtitles.customChoice")}
      <input
        className="hidden"
        ref={fileInput}
        accept={subtitleTypeList.join(",")}
        type="file"
        onChange={(e) => {
          if (!e.target.files) return;
          const reader = new FileReader();
          reader.addEventListener("load", (event) => {
            if (!event.target || typeof event.target.result !== "string")
              return;
            const converted = convert(event.target.result, "srt");
            setCaption({
              language: "custom",
              srtData: converted,
              id: "custom-caption",
            });
            setCustomSubs();
          });
          reader.readAsText(e.target.files[0], "utf-8");
        }}
      />
    </CaptionOption>
  );
}

export function CaptionsView({
  id,
  backLink,
}: {
  id: string;
  backLink?: boolean;
}) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);
  const selectedCaptionId = usePlayerStore((s) => s.caption.selected?.id);
  const { disable, selectCaptionById } = useCaptions();
  const captionList = usePlayerStore((s) => s.captionList);
  const [currentlyDownloading, setCurrentlyDownloading] = useState<string | null>(null);

  return (
    <>
      <div>
        {backLink ? (
          <Menu.BackLink
            onClick={() => router.navigate("/")}
            rightSide={
              <button
                type="button"
                onClick={() => router.navigate("/captions/settings")}
                className="-mr-2 -my-1 px-2 p-[0.4em] rounded tabbable hover:bg-video-context-light hover:bg-opacity-10"
              >
                {t("player.menus.subtitles.customizeLabel")}
              </button>
            }
          >
            {t("player.menus.subtitles.title")}
          </Menu.BackLink>
        ) : (
          <Menu.Title
            rightSide={
              <button
                type="button"
                onClick={() => router.navigate("/captions/settingsOverlay")}
                className="-mr-2 -my-1 px-2 p-[0.4em] rounded tabbable hover:bg-video-context-light hover:bg-opacity-10"
              >
                {t("player.menus.subtitles.customizeLabel")}
              </button>
            }
          >
            {t("player.menus.subtitles.title")}
          </Menu.Title>
        )}
      </div>
      <Menu.ScrollToActiveSection className="!pt-1 mt-2 pb-3">
          <CaptionOption
            onClick={() => disable()}
            selected={!selectedCaptionId}
          >
            {t("player.menus.subtitles.offChoice")}
          </CaptionOption>

          {/* Show available captions directly */}
          {captionList.map((caption) => (
            <CaptionOption
              key={caption.id}
              flagUrl={caption.flagsapi}
              selected={caption.id === selectedCaptionId}
              loading={caption.id === currentlyDownloading}
              onClick={async () => {
                console.log("Selecting caption:", caption);
                setCurrentlyDownloading(caption.id);
                try {
                  await selectCaptionById(caption.id);
                  console.log("Caption selected successfully");
                } catch (error) {
                  console.error("Failed to select caption:", error);
                }
                setCurrentlyDownloading(null);
              }}
            >
              {caption.name || caption.language}
            </CaptionOption>
          ))}
      </Menu.ScrollToActiveSection>
    </>
  );
}

export default CaptionsView;
