import type { Platform } from "../../types/plan";

interface CompositionOption {
  id: string;
  platforms: Platform[];
  bestFor: string[];
}

const COMPOSITIONS: CompositionOption[] = [
  {
    id: "EventPromo",
    platforms: ["tiktok", "instagram-reels", "instagram-stories", "instagram-posts"],
    bestFor: ["event-promotion", "upcoming-event", "announcement"],
  },
  {
    id: "Testimonial",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["social-proof", "member-story", "review"],
  },
  {
    id: "HookReel",
    platforms: ["tiktok", "instagram-reels"],
    bestFor: ["pov", "narrative", "hook", "story", "progression"],
  },
  {
    id: "TextAnimation",
    platforms: ["tiktok", "instagram-reels"],
    bestFor: ["message", "text-only", "awareness", "values"],
  },
  {
    id: "CountdownEvent",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["urgency", "countdown", "limited-spots", "deadline"],
  },
  {
    id: "StatsShowcase",
    platforms: ["tiktok", "instagram-reels", "instagram-posts"],
    bestFor: ["numbers", "stats", "social-proof", "milestones"],
  },
  {
    id: "PhotoMontage",
    platforms: ["instagram-posts"],
    bestFor: ["photo-showcase", "highlights", "recap"],
  },
  {
    id: "POVReveal",
    platforms: ["tiktok", "instagram-reels"],
    bestFor: ["pov", "relatable", "story-arc", "discovery"],
  },
  {
    id: "BeforeAfter",
    platforms: ["tiktok", "instagram-reels"],
    bestFor: ["transformation", "before-after", "contrast"],
  },
  {
    id: "ListCountdown",
    platforms: ["tiktok", "instagram-reels"],
    bestFor: ["listicle", "reasons", "tips", "information"],
  },
  {
    id: "StoryTime",
    platforms: ["tiktok", "instagram-reels"],
    bestFor: ["storytime", "caption-driven", "narrative"],
  },
  {
    id: "PhotoDump",
    platforms: ["tiktok", "instagram-reels", "instagram-posts"],
    bestFor: ["photo-dump", "highlights", "visual-showcase"],
  },
  {
    id: "TransitionReveal",
    platforms: ["tiktok", "instagram-reels"],
    bestFor: ["reveal", "surprise", "transition", "hook"],
  },
  {
    id: "QuizPoll",
    platforms: ["tiktok", "instagram-reels"],
    bestFor: ["quiz", "poll", "engagement", "comment-bait", "interactive"],
  },
  {
    id: "MemberMilestone",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["milestone", "celebration", "growth", "community", "achievement"],
  },
  {
    id: "WeeklyRecap",
    platforms: ["tiktok", "instagram-reels", "instagram-stories"],
    bestFor: ["recap", "weekly", "summary", "highlights", "review"],
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
 * Suggest a composition based on content intent.
 */
export function suggestComposition(
  intent: string,
  platform: Platform,
): string | null {
  const intentLower = intent.toLowerCase();

  for (const comp of COMPOSITIONS) {
    if (!comp.platforms.includes(platform)) continue;
    if (comp.bestFor.some((b) => intentLower.includes(b))) {
      return getCompositionId(comp.id, platform);
    }
  }

  // Default fallback
  return getCompositionId("HookReel", platform);
}
