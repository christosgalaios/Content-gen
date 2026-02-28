import type { ContentItem } from "../../types/content";
import type { Trend, TrendMatch } from "../../types/trends";

/**
 * Match trends to available content in the library.
 */
export function matchTrendsToContent(
  trends: Trend[],
  content: ContentItem[],
): TrendMatch[] {
  const matches: TrendMatch[] = [];

  for (const trend of trends) {
    const matchedContentIds: string[] = [];
    let confidence = 0;

    // Match by category relevance
    const trendName = trend.name.toLowerCase();
    const trendDesc = trend.description.toLowerCase();

    for (const item of content) {
      let score = 0;
      const itemCategories = item.categories.join(" ").toLowerCase();
      const itemTags = item.tags.join(" ").toLowerCase();

      // Check if content matches the trend topic
      if (trendName.includes("hik") || trendDesc.includes("hik")) {
        if (itemCategories.includes("hike") || itemTags.includes("hiking") || itemTags.includes("walking")) {
          score += 3;
        }
      }

      if (trendName.includes("pub") || trendDesc.includes("pub") || trendDesc.includes("drink")) {
        if (itemCategories.includes("pub-social") || itemTags.includes("pub") || itemTags.includes("drinks")) {
          score += 3;
        }
      }

      if (trendName.includes("friend") || trendDesc.includes("friend") || trendDesc.includes("social")) {
        if (itemCategories.includes("group-shot") || (item.peopleCount && item.peopleCount > 3)) {
          score += 2;
        }
      }

      if (trendName.includes("event") || trendDesc.includes("event")) {
        if (itemCategories.includes("activity") || itemCategories.includes("event-setup")) {
          score += 2;
        }
      }

      if (trendName.includes("outdoor") || trendDesc.includes("outdoor")) {
        if (itemTags.includes("outdoor") || itemCategories.includes("scenic")) {
          score += 2;
        }
      }

      // Quality bonus
      if (item.qualityScore > 70) score += 1;

      // Freshness bonus (less used content preferred)
      if (item.usageCount === 0) score += 1;

      if (score >= 2) {
        matchedContentIds.push(item.id);
      }
    }

    // Calculate confidence based on matches
    confidence = Math.min(1, matchedContentIds.length / 5);

    if (matchedContentIds.length > 0 || trend.category === "format") {
      matches.push({
        trend,
        matchedContentIds: matchedContentIds.slice(0, 10), // Top 10
        compositionSuggestion:
          trend.suggestedFormat || suggestComposition(trend),
        confidence,
      });
    }
  }

  // Sort by combined relevance + confidence
  matches.sort(
    (a, b) =>
      b.trend.relevanceScore * b.confidence -
      a.trend.relevanceScore * a.confidence
  );

  return matches;
}

function suggestComposition(trend: Trend): string {
  const name = trend.name.toLowerCase();
  const desc = trend.description.toLowerCase();

  if (name.includes("pov") || desc.includes("pov")) return "POVReveal-TikTok";
  if (desc.includes("before") || desc.includes("after")) return "BeforeAfter-TikTok";
  if (desc.includes("list") || desc.includes("reason")) return "ListCountdown-TikTok";
  if (desc.includes("story") || desc.includes("caption")) return "StoryTime-TikTok";
  if (desc.includes("photo") || desc.includes("dump")) return "PhotoDump-TikTok";
  if (desc.includes("stat") || desc.includes("number")) return "StatsShowcase-TikTok";
  if (name.includes("#")) return "HookReel-TikTok"; // Hashtag trends -> hook format

  return "HookReel-TikTok"; // Default
}
