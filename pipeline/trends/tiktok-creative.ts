import { randomUUID } from "crypto";
import * as path from "path";
import * as fs from "fs";
import { log } from "../utils/logger";
import type { Trend } from "../../types/trends";

const COOKIES_PATH = path.resolve(__dirname, "../../data/tiktok-cookies.json");

/**
 * Scrape account analytics and trend data from TikTok Studio.
 * Requires an authenticated TikTok session (cookies saved in data/tiktok-cookies.json).
 *
 * To set up: run `npm run pipeline:tiktok-login` to log in and save cookies,
 * or manually export cookies from a logged-in browser session.
 *
 * Falls back to TikTok Creative Center (public, no auth) if Studio login fails.
 */
export async function scrapeTikTokTrends(): Promise<Trend[]> {
  let chromium: any;
  try {
    chromium = require("playwright").chromium;
  } catch {
    log.warn("Playwright not installed, skipping TikTok scraping. Run: npx playwright install chromium");
    return [];
  }

  // Try TikTok Studio first (authenticated), fall back to Creative Center
  const hasCookies = fs.existsSync(COOKIES_PATH);

  if (hasCookies) {
    log.info("TikTok cookies found — scraping TikTok Studio...");
    try {
      const studioTrends = await scrapeTikTokStudio(chromium);
      if (studioTrends.length > 0) return studioTrends;
      log.warn("TikTok Studio returned no data, falling back to Creative Center");
    } catch (err: any) {
      log.warn(`TikTok Studio failed: ${err.message}, falling back to Creative Center`);
    }
  } else {
    log.info("No TikTok cookies found — using Creative Center (public). Run 'npm run pipeline:tiktok-login' to enable TikTok Studio.");
  }

  return scrapeCreativeCenter(chromium);
}

/**
 * Scrape TikTok Studio for account analytics and trending insights.
 * Extracts: video performance, content suggestions, and account-level insights.
 */
async function scrapeTikTokStudio(chromium: any): Promise<Trend[]> {
  const trends: Trend[] = [];
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext();

    // Load saved cookies
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf-8"));
    await context.addCookies(cookies);

    const page = await context.newPage();

    // Navigate to TikTok Studio analytics
    await page.goto("https://www.tiktok.com/tiktokstudio/analytics/overview", {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    await page.waitForTimeout(3000);

    // Check if we're authenticated
    const isLoggedIn = await page.evaluate(() => {
      return !document.querySelector('[class*="login"]') &&
        !window.location.href.includes("/login");
    });

    if (!isLoggedIn) {
      log.warn("TikTok Studio session expired — cookies need refresh");
      await browser.close();
      return [];
    }

    // Extract account analytics overview
    const accountData = await page.evaluate(() => {
      const data: {
        videoViews?: number;
        profileViews?: number;
        likes?: number;
        comments?: number;
        shares?: number;
        followers?: number;
      } = {};

      // Try to extract key metrics from the analytics overview
      const metricElements = document.querySelectorAll(
        '[class*="metric"], [class*="data-card"], [class*="stat"], [class*="overview"]'
      );
      for (const el of metricElements) {
        const text = (el as HTMLElement).innerText?.toLowerCase() || "";
        const numberMatch = text.match(/([\d,]+)/);
        const value = numberMatch
          ? parseInt(numberMatch[1].replace(/,/g, ""), 10)
          : null;

        if (value !== null) {
          if (text.includes("video view")) data.videoViews = value;
          if (text.includes("profile view")) data.profileViews = value;
          if (text.includes("like")) data.likes = value;
          if (text.includes("comment")) data.comments = value;
          if (text.includes("share")) data.shares = value;
          if (text.includes("follower")) data.followers = value;
        }
      }

      return data;
    });

    log.info(`TikTok Studio analytics: ${JSON.stringify(accountData)}`);

    // Navigate to content performance page
    await page.goto("https://www.tiktok.com/tiktokstudio/analytics/content", {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    await page.waitForTimeout(3000);

    // Extract top-performing video data
    const topVideos = await page.evaluate(() => {
      const videos: Array<{
        title: string;
        views: number;
        likes: number;
        comments: number;
        shares: number;
      }> = [];

      // Try to extract video performance rows
      const rows = document.querySelectorAll(
        '[class*="video-row"], [class*="content-row"], table tbody tr, [class*="post-item"]'
      );

      for (const row of rows) {
        const cells = row.querySelectorAll("td, [class*='cell'], [class*='col']");
        if (cells.length >= 3) {
          const title = (cells[0] as HTMLElement)?.innerText?.trim() || "";
          const nums = Array.from(cells)
            .map((c) => {
              const match = (c as HTMLElement).innerText?.match(/([\d,.]+[KMB]?)/);
              if (!match) return 0;
              let val = match[1].replace(/,/g, "");
              if (val.endsWith("K")) return parseFloat(val) * 1000;
              if (val.endsWith("M")) return parseFloat(val) * 1_000_000;
              if (val.endsWith("B")) return parseFloat(val) * 1_000_000_000;
              return parseFloat(val) || 0;
            });

          if (title) {
            videos.push({
              title,
              views: nums[1] || 0,
              likes: nums[2] || 0,
              comments: nums[3] || 0,
              shares: nums[4] || 0,
            });
          }
        }
      }

      return videos.slice(0, 10);
    });

    // Convert account insights into trend-like data
    if (accountData.videoViews || accountData.followers) {
      trends.push({
        id: randomUUID(),
        source: "tiktok-creative-center", // Using existing source type for compatibility
        category: "topic",
        name: "Account Performance Insights",
        description: `TikTok Studio: ${accountData.videoViews || 0} video views, ${accountData.followers || 0} followers, ${accountData.likes || 0} likes, ${accountData.comments || 0} comments, ${accountData.shares || 0} shares (last 28 days)`,
        relevanceScore: 95,
        popularityScore: 50,
        suggestedFormat: null,
        scrapedAt: now,
        expiresAt: expires,
      });
    }

    // Extract content performance patterns
    type VideoPerf = { title: string; views: number; likes: number; comments: number; shares: number };
    if (topVideos.length > 0) {
      // Identify top performing content types from video titles
      const highEngagement = topVideos.filter(
        (v: VideoPerf) => v.comments > 5 || v.shares > 3
      );
      if (highEngagement.length > 0) {
        const topTitles = highEngagement
          .slice(0, 3)
          .map((v: VideoPerf) => v.title.slice(0, 50))
          .join("; ");
        trends.push({
          id: randomUUID(),
          source: "tiktok-creative-center",
          category: "format",
          name: "High-engagement content pattern",
          description: `Our top performing videos: ${topTitles}. Build similar hooks and formats.`,
          relevanceScore: 90,
          popularityScore: 80,
          suggestedFormat: null,
          scrapedAt: now,
          expiresAt: expires,
        });
      }

      // Find videos with high view counts for trend identification
      const viral = topVideos.filter((v: VideoPerf) => v.views > 500);
      if (viral.length > 0) {
        trends.push({
          id: randomUUID(),
          source: "tiktok-creative-center",
          category: "format",
          name: "Viral content from our account",
          description: `${viral.length} videos with 500+ views. Replicate successful formats and hooks.`,
          relevanceScore: 88,
          popularityScore: 75,
          suggestedFormat: null,
          scrapedAt: now,
          expiresAt: expires,
        });
      }
    }

    // Navigate to Inspiration/Trending (if available in Studio)
    try {
      await page.goto("https://www.tiktok.com/tiktokstudio/inspiration", {
        waitUntil: "networkidle",
        timeout: 15_000,
      });
      await page.waitForTimeout(2000);

      const inspirationTrends = await page.evaluate(() => {
        const items: Array<{ name: string; description: string }> = [];
        const cards = document.querySelectorAll(
          '[class*="trend"], [class*="inspiration"], [class*="suggest"], [class*="card"]'
        );

        for (const card of cards) {
          const title = card.querySelector("h3, h4, [class*='title']")?.textContent?.trim() || "";
          const desc = card.querySelector("p, [class*='desc']")?.textContent?.trim() || "";
          if (title && title.length > 3) {
            items.push({ name: title, description: desc });
          }
        }

        return items.slice(0, 10);
      });

      for (const item of inspirationTrends) {
        const relevantKeywords = [
          "social", "friends", "bristol", "meetup", "hiking", "group",
          "fun", "events", "community", "new", "adult", "friendship",
        ];
        const text = `${item.name} ${item.description}`.toLowerCase();
        const isRelevant = relevantKeywords.some((kw) => text.includes(kw));

        trends.push({
          id: randomUUID(),
          source: "tiktok-creative-center",
          category: "topic",
          name: item.name,
          description: item.description || `Trending on TikTok Studio`,
          relevanceScore: isRelevant ? 82 : 45,
          popularityScore: 80,
          suggestedFormat: null,
          scrapedAt: now,
          expiresAt: expires,
        });
      }
    } catch {
      log.info("TikTok Studio inspiration page not available");
    }
  } finally {
    await browser.close();
  }

  return trends;
}

/**
 * Fallback: scrape trending hashtags from TikTok Creative Center (public, no auth).
 */
async function scrapeCreativeCenter(chromium: any): Promise<Trend[]> {
  const trends: Trend[] = [];
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    await page.goto(
      "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en",
      { waitUntil: "networkidle", timeout: 30_000 }
    );

    await page.waitForTimeout(3000);

    const hashtags = await page.evaluate(() => {
      const items: { name: string; views: string }[] = [];

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
    log.warn(`TikTok Creative Center scraping error: ${err.message}`);
  } finally {
    await browser.close();
  }

  return trends;
}

/**
 * Interactive TikTok login flow — launches a visible browser for the user
 * to log in, then saves cookies for future automated scraping.
 */
export async function saveTikTokSession(): Promise<void> {
  let chromium: any;
  try {
    chromium = require("playwright").chromium;
  } catch {
    log.error("Playwright not installed. Run: npx playwright install chromium");
    return;
  }

  log.info("Opening TikTok Studio login...");
  log.info("Please log in to your TikTok account in the browser window.");
  log.info("The window will close automatically once logged in.");

  const browser = await chromium.launch({ headless: false }); // Visible for login
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.tiktok.com/tiktokstudio", {
    waitUntil: "networkidle",
    timeout: 60_000,
  });

  // Wait for the user to log in (check for studio content to appear)
  log.info("Waiting for login (up to 5 minutes)...");
  try {
    await page.waitForURL("**/tiktokstudio/**", { timeout: 300_000 });
    await page.waitForTimeout(3000);

    // Save cookies
    const cookies = await context.cookies();
    const dataDir = path.dirname(COOKIES_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));

    log.success(`TikTok cookies saved to ${COOKIES_PATH}`);
  } catch {
    log.error("Login timed out. Please try again.");
  } finally {
    await browser.close();
  }
}
