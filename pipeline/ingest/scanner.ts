import * as fs from "fs";
import * as path from "path";
import { log } from "../utils/logger";

const SUPPORTED_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const SUPPORTED_VIDEO_EXTS = new Set([".mp4", ".mov", ".avi", ".mkv"]);

export interface ScannedFile {
  filePath: string;
  fileName: string;
  extension: string;
  mediaType: "photo" | "video";
  fileSize: number;
  modifiedAt: string;
}

/**
 * Recursively scan a folder for media files.
 */
export function scanFolder(folderPath: string): ScannedFile[] {
  if (!fs.existsSync(folderPath)) {
    log.error(`Content folder not found: ${folderPath}`);
    return [];
  }

  const files: ScannedFile[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        let mediaType: "photo" | "video" | null = null;

        if (SUPPORTED_IMAGE_EXTS.has(ext)) mediaType = "photo";
        else if (SUPPORTED_VIDEO_EXTS.has(ext)) mediaType = "video";

        if (mediaType) {
          const stat = fs.statSync(fullPath);
          files.push({
            filePath: fullPath,
            fileName: entry.name,
            extension: ext,
            mediaType,
            fileSize: stat.size,
            modifiedAt: stat.mtime.toISOString(),
          });
        }
      }
    }
  }

  walk(folderPath);
  log.info(`Scanned ${files.length} media files (${files.filter(f => f.mediaType === "photo").length} photos, ${files.filter(f => f.mediaType === "video").length} videos)`);
  return files;
}
