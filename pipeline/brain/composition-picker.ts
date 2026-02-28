import type { Platform } from "../../types/plan";

interface CompositionOption {
  id: string;
  platforms: Platform[];
  bestFor: string[];
  /** Higher weight = more likely to be selected when multiple match */
  engagementTier: "high" | "medium" | "standard";
  /** Content categories this composition needs photos for (empty = text-only) */
  needsPhotos: boolean;
}

const ENGAGEMENT_WEIGHTS: Record<string, number> = {
  high: 3,
  medium: 2,
  standard: 1,
};

const COMPOSITIONS: CompositionOption[] = [
  {
    id: "EventPromo",
    platforms: ["tiktok", "instagram-reels", "instagram-stories", "instagram-posts"],
    bestFor: ["event-promotion", "upcoming-event", "announcement"],
    engagementTier: "medium",
    needsPhotos: false,
  },
  {
    id: "Testimonial",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["social-proof", "member-story", "review", "testimonial"],
    engagementTier: "high",
    needsPhotos: false,
  },
  {
    id: "HookReel",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["pov", "narrative", "hook", "story", "progression", "relatable"],
    engagementTier: "high",
    needsPhotos: false,
  },
  {
    id: "TextAnimation",
    platforms: ["tiktok", "instagram-reels"],
    bestFor: ["message", "text-only", "awareness", "values", "brand"],
    engagementTier: "standard",
    needsPhotos: false,
  },
  {
    id: "CountdownEvent",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["urgency", "countdown", "limited-spots", "deadline", "fomo"],
    engagementTier: "high",
    needsPhotos: false,
  },
  {
    id: "StatsShowcase",
    platforms: ["tiktok", "instagram-reels", "instagram-stories", "instagram-posts"],
    bestFor: ["numbers", "stats", "social-proof", "milestones", "growth"],
    engagementTier: "medium",
    needsPhotos: false,
  },
  {
    id: "PhotoMontage",
    platforms: ["instagram-posts"],
    bestFor: ["photo-showcase", "highlights", "recap", "montage"],
    engagementTier: "medium",
    needsPhotos: true,
  },
  {
    id: "POVReveal",
    platforms: ["tiktok", "instagram-reels"],
    bestFor: ["pov", "relatable", "story-arc", "discovery", "journey"],
    engagementTier: "high",
    needsPhotos: true,
  },
  {
    id: "BeforeAfter",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["transformation", "before-after", "contrast", "glow-up"],
    engagementTier: "high",
    needsPhotos: false,
  },
  {
    id: "ListCountdown",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["listicle", "reasons", "tips", "information", "list", "top"],
    engagementTier: "medium",
    needsPhotos: false,
  },
  {
    id: "StoryTime",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["storytime", "caption-driven", "narrative", "personal"],
    engagementTier: "high",
    needsPhotos: false,
  },
  {
    id: "PhotoDump",
    platforms: ["tiktok", "instagram-reels", "instagram-posts"],
    bestFor: ["photo-dump", "highlights", "visual-showcase", "dump"],
    engagementTier: "medium",
    needsPhotos: true,
  },
  {
    id: "TransitionReveal",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["reveal", "surprise", "transition", "hook", "dramatic"],
    engagementTier: "high",
    needsPhotos: false,
  },
  {
    id: "QuizPoll",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["quiz", "poll", "engagement", "comment-bait", "interactive", "question"],
    engagementTier: "high",
    needsPhotos: false,
  },
  {
    id: "MemberMilestone",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["milestone", "celebration", "growth", "community", "achievement"],
    engagementTier: "medium",
    needsPhotos: false,
  },
  {
    id: "WeeklyRecap",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["recap", "weekly", "summary", "highlights", "review"],
    engagementTier: "medium",
    needsPhotos: true,
  },
];

/**
 * Get the composition ID suffix for a platform.
 */
function platformSuffix(platform: Platform): string {
  switch (platform) {
    case "tiktok":
    case "instagram-reels":
      return "TikTok";
    case "instagram-stories":
      return "Story";
    case "instagram-posts":
      return "Insta";
  }
}

/**
 * Get a full composition ID for a platform.
 */
export function getCompositionId(baseName: string, platform: Platform): string {
  return `${baseName}-${platformSuffix(platform)}`;
}

/**
 * Get available compositions for a platform.
 */
export function getAvailableCompositions(platform: Platform): string[] {
  return COMPOSITIONS
    .filter((c) => c.platforms.includes(platform))
    .map((c) => getCompositionId(c.id, platform));
}

/**
 * Score and rank compositions against an intent string.
 * Returns all matches sorted by relevance (best first).
 */
export function rankCompositions(
  intent: string,
  platform: Platform,
  recentlyUsed: string[] = [],
): Array<{ compositionId: string; score: number }> {
  const intentLower = intent.toLowerCase();
  const intentWords = intentLower.split(/[\s,;.!?]+/).filter(Boolean);

  const scored: Array<{ compositionId: string; score: number }> = [];

  for (const comp of COMPOSITIONS) {
    if (!comp.platforms.includes(platform)) continue;

    let score = 0;

    // Keyword matching: count how many bestFor tags match
    const matchCount = comp.bestFor.filter((tag) =>
      intentWords.some((word) => word.includes(tag) || tag.includes(word))
    ).length;
    score += matchCount * 10;

    // Substring matching as a fallback (weaker signal)
    const substringMatches = comp.bestFor.filter((tag) => intentLower.includes(tag)).length;
    score += substringMatches * 5;

    // Engagement tier bonus
    score += ENGAGEMENT_WEIGHTS[comp.engagementTier] || 1;

    // Variety penalty: penalize recently used compositions
    const fullId = getCompositionId(comp.id, platform);
    if (recentlyUsed.includes(fullId)) {
      score -= 15;
    }
    // Also penalize if the base composition was used on any platform
    if (recentlyUsed.some((r) => r.startsWith(comp.id + "-"))) {
      score -= 8;
    }

    if (score > 0) {
      scored.push({ compositionId: fullId, score });
    }
  }

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Suggest a composition based on content intent.
 * Uses scored ranking with variety enforcement.
 */
export function suggestComposition(
  intent: string,
  platform: Platform,
  recentlyUsed: string[] = [],
): string | null {
  const ranked = rankCompositions(intent, platform, recentlyUsed);

  if (ranked.length > 0) {
    return ranked[0].compositionId;
  }

  // Fallback: pick a random high-engagement composition for the platform
  const available = COMPOSITIONS.filter(
    (c) => c.platforms.includes(platform) && c.engagementTier === "high"
  );
  if (available.length > 0) {
    const pick = available[Math.floor(Math.random() * available.length)];
    return getCompositionId(pick.id, platform);
  }

  return getCompositionId("HookReel", platform);
}

/**
 * Pick a diverse set of compositions for a batch.
 * Ensures no two consecutive videos use the same base composition,
 * and balances engagement tiers.
 */
export function pickDiverseBatch(
  count: number,
  platform: Platform,
  recentlyUsed: string[] = [],
): string[] {
  const available = COMPOSITIONS.filter((c) => c.platforms.includes(platform));
  if (available.length === 0) return [];

  const picks: string[] = [];
  const usedInBatch: Set<string> = new Set();

  // Pre-sort: high engagement first, then shuffle within tiers for variety
  const tiered = [...available].sort((a, b) => {
    const diff = ENGAGEMENT_WEIGHTS[b.engagementTier] - ENGAGEMENT_WEIGHTS[a.engagementTier];
    if (diff !== 0) return diff;
    return Math.random() - 0.5;
  });

  for (let i = 0; i < count; i++) {
    // Find the best candidate that wasn't just used
    const lastPick = picks.length > 0 ? picks[picks.length - 1] : null;
    const lastBase = lastPick?.replace(/-(?:TikTok|Insta|Story)$/, "");

    let candidate: CompositionOption | undefined;

    // First pass: prefer compositions not yet used in batch and not same as last
    candidate = tiered.find(
      (c) => !usedInBatch.has(c.id) && c.id !== lastBase
    );

    // Second pass: allow repeats but avoid consecutive same
    if (!candidate) {
      candidate = tiered.find((c) => c.id !== lastBase);
    }

    // Final fallback
    if (!candidate) {
      candidate = tiered[i % tiered.length];
    }

    const fullId = getCompositionId(candidate.id, platform);
    picks.push(fullId);
    usedInBatch.add(candidate.id);
  }

  return picks;
}

/**
 * Check if a composition requires photo assets.
 */
export function compositionNeedsPhotos(compositionId: string): boolean {
  const baseName = compositionId.replace(/-(?:TikTok|Insta|Story)$/, "");
  const comp = COMPOSITIONS.find((c) => c.id === baseName);
  return comp?.needsPhotos ?? false;
}
