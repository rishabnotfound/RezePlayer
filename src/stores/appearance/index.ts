import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface AppearanceStore {
  iconSize: number;
  themeColor: string | null;
  setIconSize(size: number): void;
  setThemeColor(color: string): void;
}

export const useAppearanceStore = create(
  immer<AppearanceStore>((set) => ({
    iconSize: 1.0,
    themeColor: null,
    setIconSize(size: number) {
      set((s) => {
        s.iconSize = size;
      });
    },
    setThemeColor(color: string) {
      set((s) => {
        s.themeColor = color;
      });
    },
  })),
);
