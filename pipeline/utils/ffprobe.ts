import { execSync } from "child_process";

interface VideoMeta {
  width: number;
  height: number;
  duration: number;
  hasAudio: boolean;
  fps: number;
}

function parseFps(rate: string): number {
  const parts = rate.split("/");
  if (parts.length === 2) {
    const num = parseInt(parts[0], 10);
    const den = parseInt(parts[1], 10);
    return den > 0 ? num / den : 30;
  }
  const parsed = parseFloat(rate);
  return isNaN(parsed) ? 30 : parsed;
}

/**
 * Extract video metadata using ffprobe.
 * Falls back to defaults if ffprobe is not available.
 */
export function getVideoMetadata(filePath: string): VideoMeta {
  try {
    const result = execSync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`,
      { encoding: "utf-8", timeout: 15_000 }
    );

    const data = JSON.parse(result);
    const videoStream = data.streams?.find((s: any) => s.codec_type === "video");
    const audioStream = data.streams?.find((s: any) => s.codec_type === "audio");

    return {
      width: videoStream?.width || 1080,
      height: videoStream?.height || 1920,
      duration: parseFloat(data.format?.duration || "0"),
      hasAudio: !!audioStream,
      fps: videoStream?.r_frame_rate
        ? parseFps(videoStream.r_frame_rate)
        : 30,
    };
  } catch {
    return { width: 1080, height: 1920, duration: 0, hasAudio: false, fps: 30 };
  }
}
