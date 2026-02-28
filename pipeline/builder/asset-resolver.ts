import * as fs from "fs";
import * as path from "path";
import { log } from "../utils/logger";
import { getDb } from "../db/connection";

const GENERATED_ASSETS_DIR = path.resolve(
  __dirname,
  "../../public/assets/generated"
);

/**
 * Ensure the generated assets directory exists.
 */
export function ensureAssetsDir(): void {
  if (!fs.existsSync(GENERATED_ASSETS_DIR)) {
    fs.mkdirSync(GENERATED_ASSETS_DIR, { recursive: true });
  }
}

/**
 * Resolve a content item ID to a staticFile()-compatible path.
 * Copies the file to public/assets/generated/ if not already there.
 */
export function resolveAsset(contentItemId: string): string | null {
  const db = getDb();
  // Try exact match first, then prefix match (content plan uses 8-char ID prefixes)
  let row = db
    .prepare("SELECT file_path, file_name FROM content_library WHERE id = ?")
    .get(contentItemId) as any;
  if (!row) {
    row = db
      .prepare("SELECT file_path, file_name FROM content_library WHERE id LIKE ? LIMIT 1")
      .get(`${contentItemId}%`) as any;
  }

  if (!row) {
    log.warn(`Content item not found: ${contentItemId}`);
    return null;
  }

  ensureAssetsDir();

  const destPath = path.join(GENERATED_ASSETS_DIR, row.file_name);

  // Copy if not already present
  if (!fs.existsSync(destPath)) {
    try {
      fs.copyFileSync(row.file_path, destPath);
    } catch (err: any) {
      log.warn(`Failed to copy asset ${row.file_name}: ${err.message}`);
      return null;
    }
  }

  // Return the staticFile path (relative to public/)
  return `assets/generated/${row.file_name}`;
}

/**
 * Resolve multiple content item IDs to asset paths.
 */
export function resolveAssets(contentItemIds: string[]): string[] {
  return contentItemIds
    .map((id) => resolveAsset(id))
    .filter((p): p is string => p !== null);
}

/**
 * Clean up old generated assets (those not referenced by any pending render job).
 */
export function cleanupGeneratedAssets(): void {
  if (!fs.existsSync(GENERATED_ASSETS_DIR)) return;

  const files = fs.readdirSync(GENERATED_ASSETS_DIR);
  if (files.length === 0) return;

  // For now, just log — we'll keep all generated assets
  log.info(`Generated assets directory has ${files.length} files`);
}

/**
 * Increment usage count for content items used in a render.
 */
export function markAssetsUsed(contentItemIds: string[]): void {
  const db = getDb();
  const exactStmt = db.prepare(
    "UPDATE content_library SET usage_count = usage_count + 1, last_used = ? WHERE id = ?"
  );
  const prefixStmt = db.prepare(
    "UPDATE content_library SET usage_count = usage_count + 1, last_used = ? WHERE rowid = (SELECT rowid FROM content_library WHERE id LIKE ? LIMIT 1)"
  );

  const now = new Date().toISOString();
  for (const id of contentItemIds) {
    const changes = exactStmt.run(now, id).changes;
    if (changes === 0) {
      prefixStmt.run(now, `${id}%`);
    }
  }
}
