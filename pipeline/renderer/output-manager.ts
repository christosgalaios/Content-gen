import * as fs from "fs";
import * as path from "path";

interface OutputMetadata {
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
  const metaPath = videoPath.replace(/\.mp4$/, ".meta.json");
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
}

/**
 * List all rendered outputs in the output directory.
 */
export function listOutputs(outputDir: string): string[] {
  if (!fs.existsSync(outputDir)) return [];

  const results: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".mp4")) {
        results.push(fullPath);
      }
    }
  }

  walk(outputDir);
  return results;
}
