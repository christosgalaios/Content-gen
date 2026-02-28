import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import {
  rankCompositions,
  pickDiverseBatch,
  getAvailableCompositions,
  compositionNeedsPhotos,
} from "../brain/composition-picker";
import type { Platform } from "../../types/plan";

const PORT = 3333;
const STATIC_DIR = path.resolve(__dirname, "public");

/**
 * Lightweight dashboard server — no Express needed.
 * Serves a browser GUI for testing composition picker, batch generation, and viewing pipeline state.
 */
function startServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${PORT}`);

    // --- API routes ---
    if (url.pathname.startsWith("/api/")) {
      res.setHeader("Content-Type", "application/json");

      try {
        const body = await readBody(req);
        const json = body ? JSON.parse(body) : {};
        const result = handleApi(url.pathname, json);
        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (err: any) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // --- Static files ---
    let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const fullPath = path.join(STATIC_DIR, filePath);

    const ext = path.extname(fullPath);
    const mimeTypes: Record<string, string> = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".svg": "image/svg+xml",
    };

    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
      res.end(content);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    }
  });

  server.listen(PORT, () => {
    console.log(`\n  Dashboard running at http://localhost:${PORT}\n`);
  });
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
  });
}

function handleApi(pathname: string, body: any): any {
  switch (pathname) {
    case "/api/compositions": {
      const platform = (body.platform || "tiktok") as Platform;
      const compositions = getAvailableCompositions(platform);
      return {
        platform,
        compositions,
        details: compositions.map((id) => ({
          id,
          needsPhotos: compositionNeedsPhotos(id),
        })),
      };
    }

    case "/api/compositions/all": {
      const platforms: Platform[] = [
        "tiktok",
        "instagram-reels",
        "instagram-stories",
        "instagram-posts",
      ];
      const all: Record<string, string[]> = {};
      for (const p of platforms) {
        all[p] = getAvailableCompositions(p);
      }
      return all;
    }

    case "/api/picker/rank": {
      const { intent, platform = "tiktok", recentlyUsed = [] } = body;
      if (!intent) throw new Error("intent is required");
      return rankCompositions(intent, platform as Platform, recentlyUsed);
    }

    case "/api/picker/suggest": {
      const { intent, platform = "tiktok", recentlyUsed = [] } = body;
      if (!intent) throw new Error("intent is required");
      const ranked = rankCompositions(intent, platform as Platform, recentlyUsed);
      return {
        suggestion: ranked.length > 0 ? ranked[0].compositionId : null,
        allRanked: ranked,
      };
    }

    case "/api/batch": {
      const { count = 5, platform = "tiktok", recentlyUsed = [] } = body;
      return {
        batch: pickDiverseBatch(count, platform as Platform, recentlyUsed),
      };
    }

    case "/api/db/stats": {
      try {
        const { DatabaseSync } = require("node:sqlite");
        const dbPath = path.resolve(__dirname, "../../data/pipeline.db");
        if (!fs.existsSync(dbPath)) {
          return { available: false, message: "No database yet. Run pipeline:ingest first." };
        }
        const db = new DatabaseSync(dbPath, { readOnly: true });
        const content = db.prepare("SELECT COUNT(*) as count FROM content_library").get() as any;
        const trends = db.prepare("SELECT COUNT(*) as count FROM trend_cache").get() as any;
        const plans = db.prepare("SELECT COUNT(*) as count FROM content_plans").get() as any;
        const renders = db.prepare("SELECT COUNT(*) as count FROM render_jobs").get() as any;
        const recentRenders = db
          .prepare(
            "SELECT composition_id, status, completed_at FROM render_jobs ORDER BY completed_at DESC LIMIT 10"
          )
          .all();
        const recentPlans = db
          .prepare(
            "SELECT id, generated_at, status FROM content_plans ORDER BY generated_at DESC LIMIT 5"
          )
          .all();
        db.close();
        return {
          available: true,
          contentItems: content.count,
          activeTrends: trends.count,
          totalPlans: plans.count,
          totalRenders: renders.count,
          recentRenders,
          recentPlans,
        };
      } catch {
        return { available: false, message: "Database not initialized. Run npm run pipeline:ingest first." };
      }
    }

    default:
      throw new Error(`Unknown API route: ${pathname}`);
  }
}

startServer();
