import { randomUUID } from "crypto";
import { getDb } from "../db/connection";
import { log } from "../utils/logger";
import { scanFolder } from "./scanner";
import { extractMetadata } from "./metadata";
import { tagImages } from "./tagger";
import type { PipelineConfig } from "../../types/pipeline";
import type { StageResult } from "../../types/pipeline";
import type { ContentItem } from "../../types/content";

/**
 * Run the content ingestion pipeline.
 * Scans folder, extracts metadata, tags with Claude vision, stores in SQLite.
 */
export async function runIngest(config: PipelineConfig): Promise<StageResult> {
  const db = getDb();

  // 1. Scan folder
  log.info(`Scanning: ${config.contentFolder}`);
  const files = scanFolder(config.contentFolder);
  if (files.length === 0) {
    return {
      stage: "ingest",
      success: false,
      message: "No media files found in content folder",
      durationMs: 0,
    };
  }

  // 2. Check which files are new or changed
  const existingRows = db.prepare(
    "SELECT file_path, file_modified_at FROM content_library"
  ).all() as any[];
  const existing = new Map<string, string>();
  for (const row of existingRows) {
    existing.set(row.file_path, row.file_modified_at);
  }

  const newFiles = files.filter((f) => {
    const prev = existing.get(f.filePath);
    return !prev || prev !== f.modifiedAt;
  });

  if (newFiles.length === 0) {
    log.info("All files already indexed, nothing new to process");
    return {
      stage: "ingest",
      success: true,
      message: `${files.length} files already indexed`,
      durationMs: 0,
    };
  }

  log.info(`${newFiles.length} new/changed files to process (${existing.size} already indexed)`);

  // 3. Extract metadata for all new files
  log.info("Extracting metadata...");
  const metadataMap = new Map<string, ReturnType<typeof extractMetadata>>();
  for (let i = 0; i < newFiles.length; i++) {
    log.progress(i + 1, newFiles.length, `Metadata: ${newFiles[i].fileName}`);
    metadataMap.set(newFiles[i].filePath, extractMetadata(newFiles[i]));
  }

  // 4. Tag images with Claude vision (photos only)
  const photoFiles = newFiles.filter((f) => f.mediaType === "photo");
  log.info(`Tagging ${photoFiles.length} photos with Claude vision...`);

  let tagResults = new Map<string, any>();
  if (photoFiles.length > 0) {
    tagResults = await tagImages(photoFiles.map((f) => f.filePath));
  }

  // 5. Upsert into SQLite
  log.info("Writing to database...");
  const upsertStmt = db.prepare(`
    INSERT INTO content_library (
      id, file_path, file_name, media_type, metadata_json,
      categories_json, tags_json, people_count, quality_score,
      description, usage_count, last_used, indexed_at, file_modified_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?
    ) ON CONFLICT(file_path) DO UPDATE SET
      metadata_json = excluded.metadata_json,
      categories_json = excluded.categories_json,
      tags_json = excluded.tags_json,
      people_count = excluded.people_count,
      quality_score = excluded.quality_score,
      description = excluded.description,
      indexed_at = excluded.indexed_at,
      file_modified_at = excluded.file_modified_at
  `);

  const insertMany = db.transaction(() => {
    for (const file of newFiles) {
      const metadata = metadataMap.get(file.filePath)!;
      const tags = tagResults.get(file.filePath) || {
        categories: [file.mediaType === "video" ? "candid" : "candid"],
        tags: [],
        peopleCount: null,
        qualityScore: 50,
        description: "",
      };

      upsertStmt.run(
        randomUUID(),
        file.filePath,
        file.fileName,
        file.mediaType,
        JSON.stringify(metadata),
        JSON.stringify(tags.categories),
        JSON.stringify(tags.tags),
        tags.peopleCount,
        tags.qualityScore,
        tags.description,
        new Date().toISOString(),
        file.modifiedAt,
      );
    }
  });

  insertMany();

  const totalCount = db
    .prepare("SELECT COUNT(*) as count FROM content_library")
    .get() as any;

  return {
    stage: "ingest",
    success: true,
    message: `Indexed ${newFiles.length} new files (${totalCount.count} total in library)`,
    durationMs: 0,
  };
}

/**
 * Get all content items from the database.
 */
export function getContentLibrary(): ContentItem[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM content_library ORDER BY quality_score DESC").all() as any[];

  return rows.map((row) => ({
    id: row.id,
    filePath: row.file_path,
    fileName: row.file_name,
    mediaType: row.media_type,
    metadata: JSON.parse(row.metadata_json),
    categories: JSON.parse(row.categories_json),
    tags: JSON.parse(row.tags_json),
    peopleCount: row.people_count,
    qualityScore: row.quality_score,
    description: row.description,
    usageCount: row.usage_count,
    lastUsed: row.last_used,
    indexedAt: row.indexed_at,
    fileModifiedAt: row.file_modified_at,
  }));
}

/**
 * Get content items by category.
 */
export function getContentByCategory(category: string): ContentItem[] {
  return getContentLibrary().filter((item) =>
    item.categories.includes(category as any)
  );
}

/**
 * Get top-quality content items.
 */
export function getTopContent(limit: number = 20): ContentItem[] {
  return getContentLibrary().slice(0, limit);
}
