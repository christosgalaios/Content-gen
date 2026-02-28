import * as path from "path";
import type { MediaMetadata } from "../../types/content";
import type { ScannedFile } from "./scanner";
import { getVideoMetadata } from "../utils/ffprobe";

/**
 * Extract metadata for a scanned file.
 * Uses sharp-like dimension detection for images, ffprobe for videos.
 */
export function extractMetadata(file: ScannedFile): MediaMetadata {
  if (file.mediaType === "video") {
    return extractVideoMetadata(file);
  }
  return extractImageMetadata(file);
}

function extractImageMetadata(file: ScannedFile): MediaMetadata {
  // Try to get dimensions via a lightweight read of the file header.
  // For speed, we'll use basic dimension detection without requiring sharp.
  let width = 1080;
  let height = 1920;

  try {
    // Attempt to read JPEG/PNG dimensions from file header
    const dims = readImageDimensions(file.filePath, file.extension);
    if (dims) {
      width = dims.width;
      height = dims.height;
    }
  } catch {
    // Fall back to defaults
  }

  // Parse date from filename patterns like YYYYMMDD_HHMMSS or IMG_YYYYMMDD
  const dateTaken = parseDateFromFilename(file.fileName);

  return {
    width,
    height,
    dateTaken,
    duration: null,
    hasAudio: false,
    fileSize: file.fileSize,
    aspectRatio: width / height,
  };
}

function extractVideoMetadata(file: ScannedFile): MediaMetadata {
  const video = getVideoMetadata(file.filePath);
  const dateTaken = parseDateFromFilename(file.fileName);

  return {
    width: video.width,
    height: video.height,
    dateTaken,
    duration: video.duration,
    hasAudio: video.hasAudio,
    fileSize: file.fileSize,
    aspectRatio: video.width / video.height,
  };
}

/**
 * Parse date from common filename patterns.
 */
function parseDateFromFilename(fileName: string): string | null {
  // Pattern: YYYYMMDD_HHMMSS (e.g., 20230408_154822.jpg)
  const match1 = fileName.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (match1) {
    return `${match1[1]}-${match1[2]}-${match1[3]}T${match1[4]}:${match1[5]}:${match1[6]}`;
  }

  // Pattern: YYYY-MM-DD (e.g., 2026-02-10-162343933.mp4)
  const match2 = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match2) {
    return `${match2[1]}-${match2[2]}-${match2[3]}`;
  }

  // Pattern: IMG_YYYYMMDD (e.g., IMG_20231001_135522.jpg)
  const match3 = fileName.match(/IMG_(\d{4})(\d{2})(\d{2})/);
  if (match3) {
    return `${match3[1]}-${match3[2]}-${match3[3]}`;
  }

  return null;
}

/**
 * Read image dimensions from file header without loading full image.
 */
function readImageDimensions(
  filePath: string,
  ext: string,
): { width: number; height: number } | null {
  const fs = require("fs");
  const buffer = Buffer.alloc(32);
  const fd = fs.openSync(filePath, "r");

  try {
    fs.readSync(fd, buffer, 0, 32, 0);

    // PNG: dimensions at bytes 16-23
    if (ext === ".png" && buffer[0] === 0x89 && buffer[1] === 0x50) {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    }

    // JPEG: need to find SOF marker
    if (ext === ".jpg" || ext === ".jpeg") {
      return readJpegDimensions(filePath);
    }
  } finally {
    fs.closeSync(fd);
  }

  return null;
}

function readJpegDimensions(
  filePath: string,
): { width: number; height: number } | null {
  const fs = require("fs");
  const buf = fs.readFileSync(filePath);
  let offset = 2; // Skip SOI marker

  while (offset < buf.length - 8) {
    if (buf[offset] !== 0xff) break;
    const marker = buf[offset + 1];

    // SOF markers (0xC0-0xC3, 0xC5-0xC7, 0xC9-0xCB, 0xCD-0xCF)
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }

    // Skip to next marker
    const len = buf.readUInt16BE(offset + 2);
    offset += 2 + len;
  }

  return null;
}
