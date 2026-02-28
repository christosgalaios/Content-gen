import { randomUUID } from "crypto";
import { getDb } from "../db/connection";
import { log } from "../utils/logger";
import { scrapeTikTokTrends } from "./tiktok-creative";
import { getClaudeTrends } from "./claude-trends";
import type { PipelineConfig, StageResult } from "../../types/pipeline";
import type { Trend } from "../../types/trends";

/**
 * Run the trend engine: scrape TikTok Creative Center + Claude web search.
 */
export async function runTrends(config: PipelineConfig): Promise<StageResult> {
  if (!config.trends.enabled) {
    return {
      stage: "trends",
      success: true,
      message: "Trends disabled in config",
      durationMs: 0,
    };
  }

  const db = getDb();

  // Check if we have fresh trend data
  const freshCutoff = new Date(
    Date.now() - config.trends.maxAgeHours * 60 * 60 * 1000
  ).toISOString();

  const freshCount = db
    .prepare("SELECT COUNT(*) as count FROM trend_cache WHERE scraped_at > ?")
    .get(freshCutoff) as any;

  if (freshCount.count > 10) {
    log.info(`${freshCount.count} fresh trends found, skipping scrape`);
    return {
      stage: "trends",
      success: true,
      message: `Using ${freshCount.count} cached trends`,
      durationMs: 0,
    };
  }

  const allTrends: Trend[] = [];

  // 1. Scrape TikTok Creative Center
  log.info("Scraping TikTok Creative Center...");
  try {
    const tiktokTrends = await scrapeTikTokTrends();
    allTrends.push(...tiktokTrends);
    log.success(`Got ${tiktokTrends.length} trends from TikTok`);
  } catch (err: any) {
    log.warn(`TikTok scraping failed: ${err.message}`);
  }

  // 2. Claude web search for niche trends
  log.info("Researching niche trends with Claude...");
  try {
    const claudeTrends = await getClaudeTrends();
    allTrends.push(...claudeTrends);
    log.success(`Got ${claudeTrends.length} trends from Claude research`);
  } catch (err: any) {
    log.warn(`Claude trends failed: ${err.message}`);
  }

  if (allTrends.length === 0) {
    // Use fallback manual trends
    allTrends.push(...getManualTrends());
    log.info(`Using ${allTrends.length} fallback manual trends`);
  }

  // 3. Store in database
  const upsertStmt = db.prepare(`
    INSERT INTO trend_cache (id, source, category, name, description, relevance_score,
      popularity_score, suggested_format, scraped_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      relevance_score = excluded.relevance_score,
      popularity_score = excluded.popularity_score,
      scraped_at = excluded.scraped_at,
      expires_at = excluded.expires_at
  `);

  const insertAll = db.transaction(() => {
    for (const trend of allTrends) {
      upsertStmt.run(
        trend.id,
        trend.source,
        trend.category,
        trend.name,
        trend.description,
        trend.relevanceScore,
        trend.popularityScore,
        trend.suggestedFormat,
        trend.scrapedAt,
        trend.expiresAt,
      );
    }
  });

  insertAll();

  // Clean expired trends
  db.prepare("DELETE FROM trend_cache WHERE expires_at < ?").run(
    new Date().toISOString()
  );

  return {
    stage: "trends",
    success: true,
    message: `Stored ${allTrends.length} trends`,
    durationMs: 0,
  };
}

/**
 * Get active trends from the database.
 */
export function getActiveTrends(): Trend[] {
  const db = getDb();
  const now = new Date().toISOString();
  const rows = db
    .prepare(
      "SELECT * FROM trend_cache WHERE expires_at > ? ORDER BY relevance_score DESC"
    )
    .all(now) as any[];

  return rows.map((row) => ({
    id: row.id,
    source: row.source,
    category: row.category,
    name: row.name,
    description: row.description,
    relevanceScore: row.relevance_score,
    popularityScore: row.popularity_score,
    suggestedFormat: row.suggested_format,
    scrapedAt: row.scraped_at,
    expiresAt: row.expires_at,
  }));
}

/**
 * Fallback trends when scraping fails.
 */
function getManualTrends(): Trend[] {
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: randomUUID(),
      source: "manual",
      category: "hashtag",
      name: "#newtobristol",
      description: "People who recently moved to Bristol looking for social connections",
      relevanceScore: 95,
      popularityScore: 70,
      suggestedFormat: "HookReel-TikTok",
      scrapedAt: now,
      expiresAt: expires,
    },
    {
      id: randomUUID(),
      source: "manual",
      category: "hashtag",
      name: "#makingfriendsasanadult",
      description: "Adult friendship struggles - highly relatable content",
      relevanceScore: 90,
      popularityScore: 85,
      suggestedFormat: "HookReel-TikTok",
      scrapedAt: now,
      expiresAt: expires,
    },
    {
      id: randomUUID(),
      source: "manual",
      category: "format",
      name: "POV story format",
      description: "POV: relatable situation that leads to discovery",
      relevanceScore: 85,
      popularityScore: 90,
      suggestedFormat: "POVReveal-TikTok",
      scrapedAt: now,
      expiresAt: expires,
    },
    {
      id: randomUUID(),
      source: "manual",
      category: "format",
      name: "Before/After reveal",
      description: "Showing transformation from lonely to social",
      relevanceScore: 80,
      popularityScore: 85,
      suggestedFormat: "BeforeAfter-TikTok",
      scrapedAt: now,
      expiresAt: expires,
    },
    {
      id: randomUUID(),
      source: "manual",
      category: "topic",
      name: "Speed friending",
      description: "Speed friending events are trending as an alternative to dating apps",
      relevanceScore: 88,
      popularityScore: 75,
      suggestedFormat: "EventPromo-TikTok",
      scrapedAt: now,
      expiresAt: expires,
    },
    {
      id: randomUUID(),
      source: "manual",
      category: "hashtag",
      name: "#hikingbristol",
      description: "Bristol hiking and walking content",
      relevanceScore: 82,
      popularityScore: 65,
      suggestedFormat: "PhotoMontage-Insta",
      scrapedAt: now,
      expiresAt: expires,
    },
    {
      id: randomUUID(),
      source: "manual",
      category: "format",
      name: "5 reasons listicle",
      description: "Numbered list format - high completion rates",
      relevanceScore: 78,
      popularityScore: 80,
      suggestedFormat: "ListCountdown-TikTok",
      scrapedAt: now,
      expiresAt: expires,
    },
    {
      id: randomUUID(),
      source: "manual",
      category: "hashtag",
      name: "#bristolevents",
      description: "Events happening in Bristol - location discovery",
      relevanceScore: 75,
      popularityScore: 60,
      suggestedFormat: "EventPromo-TikTok",
      scrapedAt: now,
      expiresAt: expires,
    },
  ];
}
