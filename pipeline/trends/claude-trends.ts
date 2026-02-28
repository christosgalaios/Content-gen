import { randomUUID } from "crypto";
import { askClaude } from "../utils/claude-client";
import { log } from "../utils/logger";
import type { Trend } from "../../types/trends";

/**
 * Use Claude with web search to research current niche trends.
 */
export async function getClaudeTrends(): Promise<Trend[]> {
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const prompt = `Search the web for CURRENT trending TikTok and Instagram Reels content formats and topics relevant to these niches:

1. Social meetup groups in the UK (especially Bristol, Bath, Cardiff)
2. Making friends as an adult
3. Things to do in Bristol
4. Speed friending and social events
5. Hiking and outdoor activities in Bristol/Somerset

For each trend you find, return a JSON array with objects:
{
  "category": "hashtag" | "format" | "topic",
  "name": "...",
  "description": "...",
  "relevanceScore": 0-100,
  "popularityScore": 0-100,
  "suggestedFormat": null
}

Focus on what's trending RIGHT NOW (this week). Include specific hashtags, content formats (POV, storytime, before/after, etc.), and topics that are getting high engagement.

Return 10-15 trends. Respond with ONLY valid JSON array.`;

  try {
    const response = askClaude({ prompt, jsonMode: true });

    if (response.parsed && Array.isArray(response.parsed)) {
      return (response.parsed as any[]).map((t) => ({
        id: randomUUID(),
        source: "claude-web-search" as const,
        category: t.category || "topic",
        name: t.name || "",
        description: t.description || "",
        relevanceScore: t.relevanceScore || 50,
        popularityScore: t.popularityScore || 50,
        suggestedFormat: t.suggestedFormat || null,
        scrapedAt: now,
        expiresAt: expires,
      }));
    }
  } catch (err: any) {
    log.warn(`Claude trend research failed: ${err.message}`);
  }

  return [];
}
