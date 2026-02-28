import { execSync } from "child_process";

interface VideoMeta {
  width: number;
  height: number;
  duration: number;
  hasAudio: boolean;
  fps: number;
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
        ? eval(videoStream.r_frame_rate) // e.g. "30/1"
        : 30,
    };
  } catch {
    return { width: 1080, height: 1920, duration: 0, hasAudio: false, fps: 30 };
  }
}
