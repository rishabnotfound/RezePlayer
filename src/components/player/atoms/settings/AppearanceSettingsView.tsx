import classNames from "classnames";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Menu } from "@/components/player/internals/ContextMenu";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { useAppearanceStore } from "@/stores/appearance";

// Base theme colors (without the first color)
const BASE_THEME_COLORS = [
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#059669" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Pink", value: "#db2777" },
  { name: "Teal", value: "#0d9488" },
  { name: "Gray", value: "#1f2937" },
];

export function AppearanceSettingsView({ id }: { id: string }) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);

  // Get theme color from config prop, fallback to purple
  const configThemeColor = (window as any).__REZEPLAYER_CONFIG__?.settings?.themeColor;
  const defaultThemeColor = configThemeColor
    ? (configThemeColor.startsWith('#') ? configThemeColor : `#${configThemeColor}`)
    : "#8652bb"; // Purple default

  // Create theme colors with the first color based on config
  const THEME_COLORS = useMemo(() => {
    const firstColor = configThemeColor
      ? { name: "Default", value: defaultThemeColor }
      : { name: "Default", value: "#8652bb" };

    return [firstColor, ...BASE_THEME_COLORS];
  }, [configThemeColor, defaultThemeColor]);

  // Get state from store
  const iconSize = useAppearanceStore((s) => s.iconSize);
  const storeThemeColor = useAppearanceStore((s) => s.themeColor);
  const setStoreIconSize = useAppearanceStore((s) => s.setIconSize);
  const setStoreThemeColor = useAppearanceStore((s) => s.setThemeColor);

  // Use store theme color, or default if not set
  const themeColor = storeThemeColor ?? defaultThemeColor;

  const handleIconSizeChange = useCallback((value: number) => {
    const newValue = value;
    setStoreIconSize(newValue);

    // Apply icon size via CSS variable
    const styleId = 'rezeplayer-iconsize-override';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Target only player control buttons (not menu/settings buttons)
    styleElement.textContent = `
      [data-rezeplayer="true"] button.player-control-button span.rezeplayer-icon {
        font-size: ${newValue * 1.5}rem !important;
      }

      [data-rezeplayer="true"] button.player-control-button {
        padding: ${newValue * 0.5}rem !important;
      }

      /* Center mobile controls - scale proportionally to maintain size differences */
      [data-rezeplayer="true"] button.player-control-button span.rezeplayer-icon.text-3xl {
        font-size: ${newValue * 1.875}rem !important;
      }

      [data-rezeplayer="true"] button.player-control-button span.rezeplayer-icon.text-5xl {
        font-size: ${newValue * 3}rem !important;
      }
    `;
  }, [setStoreIconSize]);

  const handleThemeChange = useCallback((color: string) => {
    setStoreThemeColor(color);

    // Convert hex to RGB for CSS variables (same as themeColor prop)
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const rgb = `${r} ${g} ${b}`;

    // Apply theme color using the same method as RezePlayer themeColor prop
    const styleId = 'rezeplayer-theme-override';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      [data-rezeplayer="true"] {
        --colors-buttons-toggle: ${rgb} !important;
        --colors-progress-filled: ${rgb} !important;
        --colors-video-audio-set: ${rgb} !important;
        --colors-video-context-sliderFilled: ${rgb} !important;
        --colors-video-context-type-accent: ${rgb} !important;
      }
    `;
  }, [setStoreThemeColor]);

  // Apply current settings whenever they change
  useEffect(() => {
    handleIconSizeChange(iconSize);
    handleThemeChange(themeColor);
  }, [iconSize, themeColor, handleIconSizeChange, handleThemeChange]);

  return (
    <>
      <Menu.BackLink onClick={() => router.navigate("/")}>
        Appearance
      </Menu.BackLink>
      <Menu.Section>
        <div className="space-y-6 mt-3">
          {/* Icon Size Control */}
          <div>
            <Menu.FieldTitle>Control Icon Size</Menu.FieldTitle>
            <div className="mt-3 space-y-2">
              <div className="relative">
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={iconSize}
                  onChange={(e) => handleIconSizeChange(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${themeColor} 0%, ${themeColor} ${((iconSize - 0.8) / 0.7) * 100}%, rgba(255,255,255,0.2) ${((iconSize - 0.8) / 0.7) * 100}%, rgba(255,255,255,0.2) 100%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-video-context-type-secondary">
                <span>Small</span>
                <span className="text-video-context-type-main font-medium">{iconSize.toFixed(1)}x</span>
                <span>Large</span>
              </div>
            </div>
          </div>

          {/* Theme Colors */}
          <div>
            <Menu.FieldTitle>Theme Color</Menu.FieldTitle>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {THEME_COLORS.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => handleThemeChange(theme.value)}
                  className={classNames(
                    "flex flex-col items-center justify-center p-2 rounded-lg transition-all cursor-pointer",
                    themeColor === theme.value
                      ? "ring-2 ring-white ring-opacity-60"
                      : "hover:bg-video-context-hoverColor hover:bg-opacity-20"
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-full mb-1"
                    style={{ backgroundColor: theme.value }}
                  />
                  <span className="text-xs text-video-context-type-secondary text-white/50">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div>
            <Menu.FieldTitle>Custom Color</Menu.FieldTitle>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-2 border-video-context-hoverColor"
                style={{ colorScheme: 'dark' }}
              />
              <input
                type="text"
                value={themeColor}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-video-context-hoverColor bg-opacity-20 rounded-lg text-video-context-type-main text-sm border border-video-context-hoverColor focus:outline-none focus:ring-1 focus:ring-white focus:ring-opacity-40"
                placeholder="#1f2937"
              />
            </div>
          </div>
        </div>
      </Menu.Section>
    </>
  );
}
