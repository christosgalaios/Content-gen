import { log } from "../utils/logger";

/**
 * Generate TikTok-style captions for a video using Whisper.cpp.
 * Requires @remotion/install-whisper-cpp (install separately when needed).
 *
 * This is a Phase 7 feature — currently a stub.
 */
export async function generateCaptions(
  videoPath: string,
  whisperModel: string = "medium.en",
): Promise<{ words: { text: string; start: number; end: number }[] } | null> {
  try {
    // Dynamic import for optional dependency
    let installWhisperCpp: any, downloadWhisperModel: any, transcribe: any;
    try {
      const mod = await import("@remotion/install-whisper-cpp" as string);
      installWhisperCpp = mod.installWhisperCpp;
      downloadWhisperModel = mod.downloadWhisperModel;
      transcribe = mod.transcribe;
    } catch {
      log.warn("Caption generation requires @remotion/install-whisper-cpp. Skipping.");
      return null;
    }

    log.info("Setting up Whisper.cpp...");

    // Install whisper.cpp if needed
    const whisperPath = await installWhisperCpp({ version: "1.5.5" });

    // Download model if needed
    await downloadWhisperModel({ model: whisperModel, folder: whisperPath });

    // Extract audio from video (requires ffmpeg)
    const { execSync } = require("child_process");
    const audioPath = videoPath.replace(/\.mp4$/, ".wav");
    execSync(
      `ffmpeg -i "${videoPath}" -ar 16000 -ac 1 -y "${audioPath}"`,
      { timeout: 30_000 }
    );

    // Transcribe
    const result = await transcribe({
      inputPath: audioPath,
      whisperPath,
      model: whisperModel,
      tokenLevelTimestamps: true,
    });

    // Clean up temp audio
    const fs = require("fs");
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }

    return result as any;
  } catch (err: any) {
    log.warn(`Caption generation failed: ${err.message}`);
    return null;
  }
}
