import { randomUUID } from "crypto";
import { log } from "../utils/logger";
import type { Trend } from "../../types/trends";

/**
 * Scrape trending hashtags and formats from TikTok Creative Center.
 * Uses Playwright to navigate the public Creative Center pages.
 *
 * Requires: `npx playwright install chromium`
 */
export async function scrapeTikTokTrends(): Promise<Trend[]> {
  const trends: Trend[] = [];
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  let chromium: any;
  try {
    chromium = require("playwright").chromium;
  } catch {
    log.warn("Playwright not installed, skipping TikTok scraping. Run: npx playwright install chromium");
    return [];
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    // Navigate to trending hashtags page
    await page.goto(
      "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en",
      { waitUntil: "networkidle", timeout: 30_000 }
    );

    // Wait for content to load
    await page.waitForTimeout(3000);

    // Extract trending hashtags from the page
    const hashtags = await page.evaluate(() => {
      const items: { name: string; views: string }[] = [];

      // Try multiple selectors since TikTok changes their DOM
      const selectors = [
        '[class*="hashtag"] a',
        '[class*="CardPc"] [class*="title"]',
        'table tbody tr',
      ];

      for (const sel of selectors) {
        const elements = document.querySelectorAll(sel);
        if (elements.length > 0) {
          elements.forEach((el) => {
            const text = (el as HTMLElement).innerText?.trim();
            if (text && text.startsWith("#")) {
              items.push({ name: text, views: "" });
            } else if (text && text.length > 2) {
              items.push({ name: `#${text}`, views: "" });
            }
          });
          break;
        }
      }

      return items.slice(0, 20);
    });

    // Filter for relevant hashtags
    const relevantKeywords = [
      "social", "friends", "bristol", "meetup", "hiking", "group",
      "fun", "events", "community", "new", "adult", "friendship",
      "walk", "pub", "uk", "outdoors", "weekend",
    ];

    for (const tag of hashtags) {
      const isRelevant = relevantKeywords.some((kw) =>
        tag.name.toLowerCase().includes(kw)
      );

      trends.push({
        id: randomUUID(),
        source: "tiktok-creative-center",
        category: "hashtag",
        name: tag.name,
        description: `Trending on TikTok Creative Center`,
        relevanceScore: isRelevant ? 80 : 40,
        popularityScore: 85,
        suggestedFormat: null,
        scrapedAt: now,
        expiresAt: expires,
      });
    }
  } catch (err: any) {
    log.warn(`TikTok scraping error: ${err.message}`);
  } finally {
    await browser.close();
  }

  return trends;
}
