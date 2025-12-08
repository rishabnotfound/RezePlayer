import { useCallback, useEffect, useRef, useState } from "react";

import { Icons } from "@/components/Icon";
import { VideoPlayerButton } from "@/components/player/internals/Button";
import { usePlayerStore } from "@/stores/player/store";

export interface ChromecastProps {
  className?: string;
}

export function Chromecast(props: ChromecastProps) {
  const isCasting = usePlayerStore((s) => s.interface.isCasting);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <VideoPlayerButton
      ref={ref}
      className={[
        props.className ?? "",
        "google-cast-button",
        isCasting ? "casting" : "",
      ].join(" ")}
      icon={Icons.CASTING}
      onClick={(el) => {
        const castButton = el.querySelector("google-cast-launcher");
        if (castButton) (castButton as HTMLDivElement).click();
      }}
    />
  );
}
