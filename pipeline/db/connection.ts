import { DatabaseSync } from "node:sqlite";
import * as path from "path";
import * as fs from "fs";

const DB_PATH = path.resolve(__dirname, "../../data/pipeline.db");

/**
 * Thin wrapper around node:sqlite's DatabaseSync to provide
 * better-sqlite3-compatible pragma() and transaction() methods.
 */
export class PipelineDb {
  constructor(public raw: DatabaseSync) {}

  prepare(sql: string) {
    return this.raw.prepare(sql);
  }

  exec(sql: string) {
    this.raw.exec(sql);
  }

  close() {
    this.raw.close();
  }

  pragma(str: string) {
    this.raw.exec(`PRAGMA ${str}`);
  }

  transaction<T>(fn: () => T): () => T {
    return () => {
      this.raw.exec("BEGIN");
      try {
        const result = fn();
        this.raw.exec("COMMIT");
        return result;
      } catch (err) {
        this.raw.exec("ROLLBACK");
        throw err;
      }
    };
  }
}

let db: PipelineDb | null = null;

export function getDb(): PipelineDb {
  if (db) return db;

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const raw = new DatabaseSync(DB_PATH);
  db = new PipelineDb(raw);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Run schema
  const schemaPath = path.resolve(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
