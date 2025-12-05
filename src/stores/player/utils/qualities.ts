export interface LoadableSource {
  type: "hls" | "mp4";
  url: string;
  quality?: {
    id: string;
    label: string;
  };
}

export type SourceQuality = "unknown" | "144" | "240" | "360" | "480" | "540" | "720" | "1080" | "1440" | "4k";

export const allQualities: SourceQuality[] = ["144", "240", "360", "480", "540", "720", "1080", "1440", "4k"];

export function selectQuality(source: any, options?: any): any {
  if (!source) return null;
  return { stream: source };
}

export function qualityToString(quality: SourceQuality | null, sourceType?: string): string {
  if (!quality || quality === "unknown") {
    // For MP4, show "Default" instead of "Auto"
    return sourceType === "mp4" ? "Default" : "Auto";
  }
  if (quality === "4k") return "4K";
  if (quality === "1440") return "1440p (2K)";
  return quality + "p";
}

export function getPreferredQuality(
  qualities: SourceQuality[],
  options: { lastChosenQuality: SourceQuality | null; automaticQuality: boolean }
): SourceQuality | null {
  if (!options.lastChosenQuality) return null;
  if (qualities.includes(options.lastChosenQuality)) {
    return options.lastChosenQuality;
  }
  return null;
}
