import { CaptionListItem } from "@/stores/player/slices/source";

export function convertProviderCaption(captions: any[]): CaptionListItem[] {
  return [];
}

export function convertSubtitlesToSrt(text: string): string {
  // If already SRT format, return as is
  if (!text.trim().startsWith('WEBVTT')) {
    return text;
  }

  // Convert VTT to SRT
  const lines = text.split('\n');
  const srtLines: string[] = [];
  let index = 1;
  let i = 0;

  // Skip WEBVTT header and metadata
  while (i < lines.length && !lines[i].includes('-->')) {
    i++;
  }

  // Process subtitle blocks
  while (i < lines.length) {
    const line = lines[i].trim();

    // Found a timestamp line
    if (line.includes('-->')) {
      // Convert VTT timestamp (00:00:00.000) to SRT timestamp (00:00:00,000)
      const srtTimestamp = line.replace(/\./g, ',');

      srtLines.push(String(index));
      srtLines.push(srtTimestamp);

      // Collect subtitle text until empty line
      i++;
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i]);
        i++;
      }

      srtLines.push(textLines.join('\n'));
      srtLines.push(''); // Empty line between subtitles

      index++;
    }
    i++;
  }

  return srtLines.join('\n');
}

export function parseVttSubtitles(text: string): any[] {
  return [];
}

export function filterDuplicateCaptionCues(cues: any[]): any[] {
  return cues;
}

export function convertSubtitlesToSrtDataurl(text: string): string {
  return "data:text/plain;base64," + btoa(text);
}

export function convertSubtitlesToObjectUrl(text: string): string {
  const blob = new Blob([text], { type: "text/vtt" });
  return URL.createObjectURL(blob);
}

export function sanitize(text: string): string {
  return text;
}

export function makeQueId(index: number, start: number, end: number): string {
  return `${index}-${start}-${end}`;
}

function parseSrtTimestamp(timestamp: string): number {
  // Parse SRT timestamp format: HH:MM:SS,mmm
  const parts = timestamp.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsParts = parts[2].split(',');
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = parseInt(secondsParts[1], 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

export function parseSubtitles(text: string, language?: string): any[] {
  if (!text || !text.trim()) return [];

  const subtitles: any[] = [];
  // Split by double newlines to get individual subtitle blocks
  const blocks = text.split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue; // Need at least: index, timestamp, text

    // First line is the index (we can skip it)
    // Second line is the timestamp
    const timestampMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timestampMatch) continue;

    const start = parseSrtTimestamp(timestampMatch[1]);
    const end = parseSrtTimestamp(timestampMatch[2]);

    // Remaining lines are the subtitle text
    const content = lines.slice(2).join('\n');

    subtitles.push({
      start,
      end,
      content,
    });
  }

  console.log(`Parsed ${subtitles.length} subtitles from SRT`);
  return subtitles;
}

export function captionIsVisible(start: number, end: number, delay: number, videoTime: number): boolean {
  const adjustedStart = start + delay;
  const adjustedEnd = end + delay;
  return videoTime >= adjustedStart && videoTime <= adjustedEnd;
}
