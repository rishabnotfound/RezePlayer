import { useTranslation } from "react-i18next";

import { VideoPlayerButton } from "@/components/player/internals/Button";
import { VideoPlayerTimeFormat } from "@/stores/player/slices/interface";
import { usePlayerStore } from "@/stores/player/store";
import { durationExceedsHour, formatSeconds } from "@/utils/formatSeconds";

export function Time(props: { short?: boolean }) {
  const timeFormat = usePlayerStore((s) => s.interface.timeFormat);
  const setTimeFormat = usePlayerStore((s) => s.setTimeFormat);

  const {
    duration: timeDuration,
    time,
    draggingTime,
  } = usePlayerStore((s) => s.progress);
  const { isSeeking } = usePlayerStore((s) => s.interface);
  const { t } = useTranslation();
  const hasHours = durationExceedsHour(timeDuration);

  function toggleMode() {
    // Don't toggle if in short mode
    if (props.short) return;

    setTimeFormat(
      timeFormat === VideoPlayerTimeFormat.REGULAR
        ? VideoPlayerTimeFormat.REMAINING
        : VideoPlayerTimeFormat.REGULAR,
    );
  }

  const currentTime = Math.min(
    Math.max(isSeeking ? draggingTime : time, 0),
    timeDuration,
  );
  const secondsRemaining = Math.abs(currentTime - timeDuration);

  const timeLeft = formatSeconds(
    secondsRemaining,
    durationExceedsHour(secondsRemaining),
  );
  const timeWatched = formatSeconds(currentTime, hasHours);
  const timeFinished = new Date(Date.now() + secondsRemaining * 1e3);
  const duration = formatSeconds(timeDuration, hasHours);

  // If short mode, always show "xx:yy / xx:yy" format
  if (props.short) {
    return (
      <VideoPlayerButton onClick={() => toggleMode()}>
        <span>
          {timeWatched} / {duration}
        </span>
      </VideoPlayerButton>
    );
  }

  let localizationKey =
    timeFormat === VideoPlayerTimeFormat.REGULAR ? "regular" : "remaining";

  return (
    <VideoPlayerButton onClick={() => toggleMode()}>
      <span>
        {t(`player.time.${localizationKey}`, {
          timeFinished,
          timeWatched,
          timeLeft,
          duration,
          formatParams: {
            timeFinished: { hour: "numeric", minute: "numeric" },
          },
        })}
      </span>
    </VideoPlayerButton>
  );
}
