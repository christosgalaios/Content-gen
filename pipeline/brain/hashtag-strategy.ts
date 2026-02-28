import type { Trend } from "../../types/trends";

const ALWAYS_ON = [
  "#TheSuperSocializers",
  "#bristolsocial",
  "#meetnewpeoplebristol",
];

const HIGH_PRIORITY = [
  "#hikingbristol",
  "#bristolwalks",
  "#bristolhiking",
  "#socialcirclesbristol",
  "#newtobristol",
  "#speedfriending",
];

const NICHE_REACH = [
  "#makingfriendsasanadult",
  "#adultfriendship",
  "#bristolevents",
  "#thingstodoinbristol",
  "#meetupgroup",
  "#socialanxiety",
  "#introvertfriendly",
];

const LOCATION_ROTATION = [
  "#bristol",
  "#bath",
  "#cardiff",
  "#somerset",
  "#bathuk",
  "#cardiffevents",
  "#westonsupermare",
];

/**
 * Generate optimized hashtag set for a post.
 * Returns 5-8 hashtags: 3 always-on + 2-3 trending/high-priority + 1-2 niche
 */
export function generateHashtags(
  trends: Trend[],
  contentCategory: string,
): string[] {
  const hashtags = new Set<string>();

  // Always-on (3)
  for (const tag of ALWAYS_ON) {
    hashtags.add(tag);
  }

  // Trending hashtags from trend data (2-3)
  const trendingHashtags = trends
    .filter((t) => t.category === "hashtag" && t.relevanceScore > 60)
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 3);

  for (const t of trendingHashtags) {
    if (hashtags.size < 6) {
      hashtags.add(t.name.startsWith("#") ? t.name : `#${t.name}`);
    }
  }

  // Category-specific high-priority
  if (contentCategory.includes("hike") || contentCategory.includes("walk")) {
    hashtags.add("#hikingbristol");
    hashtags.add("#bristolwalks");
  } else if (contentCategory.includes("pub") || contentCategory.includes("social")) {
    hashtags.add("#bristolnightlife");
    hashtags.add("#bristolpubs");
  } else if (contentCategory.includes("speed") || contentCategory.includes("friend")) {
    hashtags.add("#speedfriending");
    hashtags.add("#makingfriendsasanadult");
  }

  // Fill remaining with niche/location rotation
  const pool = [...NICHE_REACH, ...LOCATION_ROTATION];
  let poolIdx = Math.floor(Math.random() * pool.length);
  while (hashtags.size < 8) {
    hashtags.add(pool[poolIdx % pool.length]);
    poolIdx++;
  }

  return Array.from(hashtags).slice(0, 8);
}
