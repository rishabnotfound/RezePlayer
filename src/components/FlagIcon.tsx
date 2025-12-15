import classNames from "classnames";

import { getCountryCodeForLocale } from "@/utils/language";
import "flag-icons/css/flag-icons.min.css";

export interface FlagIconProps {
  country?: string;
  langCode?: string;
}

export function FlagIcon(props: FlagIconProps) {
  let countryCode: string | null = props.country ?? null;
  if (props.langCode) countryCode = getCountryCodeForLocale(props.langCode);

  if (props.langCode === "tok")
    return (
      <div className="w-8 h-6 rounded bg-[#c8e1ed] flex justify-center items-center">
        <img src="/flags/tokiPona.svg" className="w-7 h-5" />
      </div>
    );

  if (props.langCode === "pirate")
    return (
      <div className="w-8 h-6 rounded bg-[#2E3439] flex justify-center items-center">
        <img src="/flags/skull.svg" className="w-4 h-4" />
      </div>
    );

  if (props.langCode === "cat")
    return (
      <div className="w-8 h-6 rounded bg-[#505050] flex justify-center items-center">
        <img src="/flags/cat.png" className="w-4 h-4" />
      </div>
    );

  if (props.langCode === "uwu")
    return (
      <div className="w-8 h-6 rounded bg-[#222] flex justify-center items-center">
        <img src="/flags/uwu.png" className="w-6 h-6" />
      </div>
    );

  if (props.langCode === "minion")
    return (
      <div className="w-8 h-6 rounded bg-[#ffff1a] flex justify-center items-center">
        <div className="w-4 h-4 border-2 border-gray-500 rounded-full bg-white flex justify-center items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-900 relative">
            <div className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full transform -translate-x-1/3 -translate-y-1/3" />
          </div>
        </div>
      </div>
    );

  // Galicia - Not a country (Is a region of Spain) so have to add the flag manually
  if (props.langCode === "gl-ES")
    return (
      <div className="w-8 h-6 rounded bg-[#2E3439] flex justify-center items-center">
        <img src="/flags/galicia.svg" className="rounded" />
      </div>
    );

  let backgroundClass = "bg-video-context-flagBg";
  if (countryCode === "np") backgroundClass = "bg-white";

  // If no country code found, show audio icon
  if (!countryCode) {
    return (
      <div className="w-8 h-6 rounded bg-video-context-flagBg flex justify-center items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 text-white"
        >
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
          <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
        </svg>
      </div>
    );
  }

  return (
    <span
      className={classNames(
        "!w-8 min-w-8 h-6 rounded overflow-hidden bg-cover bg-center block fi",
        backgroundClass,
        countryCode ? `fi-${countryCode}` : undefined,
      )}
    />
  );
}
