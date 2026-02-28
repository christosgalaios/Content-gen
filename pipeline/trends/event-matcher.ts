import type { Trend } from "../../types/trends";
import type { EventType, MeetupEvent } from "../../types/event";

/** Keywords that indicate a trend is relevant to an event type. */
const EVENT_TREND_KEYWORDS: Record<EventType, string[]> = {
  hiking: ["hik", "walk", "outdoor", "nature", "trail", "adventure", "explore", "fitness"],
  walk: ["walk", "outdoor", "nature", "explore", "night", "wildlife", "adventure"],
  "pub-social": ["pub", "drink", "social", "bar", "cocktail", "night out", "friend", "chat"],
  "speed-friending": ["friend", "social", "network", "meet", "connect", "date", "icebreaker"],
  comedy: ["comedy", "laugh", "stand-up", "funny", "entertainment", "night out"],
  festival: ["festival", "music", "outdoor", "party", "celebration", "dance"],
  "coffee-social": ["coffee", "chat", "social", "daytime", "relax", "friend", "meet"],
  games: ["game", "quiz", "fun", "competition", "bowling", "board game", "team", "detective"],
  activity: ["activity", "fun", "group", "social", "event", "adventure"],
  mixed: ["social", "friend", "meet", "community", "event", "group"],
  other: ["social", "friend", "community"],
};

/** Recommended composition types per event type (in priority order). */
const EVENT_COMPOSITIONS: Record<EventType, string[]> = {
  hiking: [
    "CountdownEvent",
    "POVReveal",
    "BeforeAfter",
    "ListCountdown",
    "HookReel",
    "Testimonial",
  ],
  walk: [
    "CountdownEvent",
    "POVReveal",
    "HookReel",
    "ListCountdown",
    "StoryTime",
    "EventPromo",
  ],
  "pub-social": [
    "CountdownEvent",
    "QuizPoll",
    "Testimonial",
    "HookReel",
    "EventPromo",
    "StoryTime",
  ],
  "speed-friending": [
    "CountdownEvent",
    "QuizPoll",
    "HookReel",
    "BeforeAfter",
    "Testimonial",
    "StatsShowcase",
  ],
  comedy: [
    "CountdownEvent",
    "HookReel",
    "QuizPoll",
    "EventPromo",
    "StoryTime",
    "TransitionReveal",
  ],
  festival: [
    "CountdownEvent",
    "HookReel",
    "TransitionReveal",
    "EventPromo",
    "POVReveal",
    "PhotoDump",
  ],
  "coffee-social": [
    "CountdownEvent",
    "Testimonial",
    "HookReel",
    "EventPromo",
    "StoryTime",
    "QuizPoll",
  ],
  games: [
    "CountdownEvent",
    "QuizPoll",
    "HookReel",
    "ListCountdown",
    "EventPromo",
    "TransitionReveal",
  ],
  activity: [
    "CountdownEvent",
    "HookReel",
    "BeforeAfter",
    "EventPromo",
    "Testimonial",
    "ListCountdown",
  ],
  mixed: [
    "CountdownEvent",
    "HookReel",
    "Testimonial",
    "QuizPoll",
    "EventPromo",
    "StoryTime",
  ],
  other: [
    "CountdownEvent",
    "EventPromo",
    "HookReel",
    "Testimonial",
    "StoryTime",
    "QuizPoll",
  ],
};

/**
 * Filter trends to only those relevant to a given event type.
 * Returns trends sorted by relevance score.
 */
export function getRelevantTrends(
  eventType: EventType,
  trends: Trend[]
): Trend[] {
  const keywords = EVENT_TREND_KEYWORDS[eventType] || EVENT_TREND_KEYWORDS.other;

  const scored = trends.map((trend) => {
    const trendText =
      `${trend.name} ${trend.description}`.toLowerCase();
    let matchScore = 0;

    for (const kw of keywords) {
      if (trendText.includes(kw)) matchScore++;
    }

    // Format trends (POV, before/after, etc.) are always somewhat relevant
    if (trend.category === "format") matchScore += 0.5;

    return { trend, matchScore };
  });

  return scored
    .filter((s) => s.matchScore > 0)
    .sort(
      (a, b) =>
        b.matchScore * b.trend.relevanceScore -
        a.matchScore * a.trend.relevanceScore
    )
    .map((s) => s.trend);
}

/**
 * Get recommended composition types for an event.
 */
export function getRecommendedCompositions(eventType: EventType): string[] {
  return EVENT_COMPOSITIONS[eventType] || EVENT_COMPOSITIONS.other;
}

/**
 * Calculate days until an event from today.
 */
export function daysUntilEvent(event: MeetupEvent): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.dateTime);
  eventDate.setHours(0, 0, 0, 0);
  return Math.ceil(
    (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Filter events to those within the promotion window (next N days).
 */
export function getPromotableEvents(
  events: MeetupEvent[],
  maxDaysAhead: number = 21
): MeetupEvent[] {
  return events.filter((e) => {
    const days = daysUntilEvent(e);
    return days >= 0 && days <= maxDaysAhead;
  });
}
