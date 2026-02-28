import * as fs from "fs";
import * as path from "path";
import { log } from "../utils/logger";

export interface OutputMetadata {
  compositionId: string;
  platform: string;
  caption: string;
  hashtags: string[];
  postingTime: string;
  hookStrategy: string;
  renderedAt: string;
}

/**
 * Write a .meta.json file alongside a rendered video.
 */
export function writeOutputMetadata(
  videoPath: string,
  metadata: OutputMetadata,
): void {
  const metaPath = videoPath.replace(/\.(mp4|webm|mkv)$/, ".meta.json");
  try {
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  } catch (err: any) {
    log.warn(`Failed to write metadata for ${videoPath}: ${err.message}`);
  }
}

/**
 * List all rendered outputs in the output directory.
 */
export function listOutputs(outputDir: string): string[] {
  if (!fs.existsSync(outputDir)) return [];

  const results: string[] = [];

  function walk(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.name.endsWith(".mp4")) {
          results.push(fullPath);
        }
      }
    } catch (err: any) {
      log.warn(`Failed to read directory ${dir}: ${err.message}`);
    }
  }

  walk(outputDir);
  return results.sort();
}
