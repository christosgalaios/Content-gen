import type { ContentItem } from "../../types/content";
import type { Trend } from "../../types/trends";

/**
 * Generate a content library summary for Claude.
 */
export function summarizeContentLibrary(items: ContentItem[]): string {
  const categories: Record<string, number> = {};
  const totalPhotos = items.filter((i) => i.mediaType === "photo").length;
  const totalVideos = items.filter((i) => i.mediaType === "video").length;
  const avgQuality =
    items.reduce((sum, i) => sum + i.qualityScore, 0) / items.length;

  for (const item of items) {
    for (const cat of item.categories) {
      categories[cat] = (categories[cat] || 0) + 1;
    }
  }

  const topItems = items
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 20)
    .map(
      (i) =>
        `  - [${i.id.slice(0, 8)}] ${i.fileName} (${i.categories.join(", ")}) quality:${i.qualityScore} people:${i.peopleCount || "?"} used:${i.usageCount}x`
    )
    .join("\n");

  return `CONTENT LIBRARY: ${items.length} files (${totalPhotos} photos, ${totalVideos} videos)
Average quality: ${avgQuality.toFixed(0)}/100

Categories:
${Object.entries(categories)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, count]) => `  ${cat}: ${count}`)
  .join("\n")}

Top 20 items by quality:
${topItems}`;
}

/**
 * Generate a trends summary for Claude.
 */
export function summarizeTrends(trends: Trend[]): string {
  if (trends.length === 0) return "No trending data available.";

  return `CURRENT TRENDS (${trends.length} total):
${trends
  .slice(0, 15)
  .map(
    (t) =>
      `  - [${t.category}] ${t.name}: ${t.description} (relevance:${t.relevanceScore}, popularity:${t.popularityScore})`
  )
  .join("\n")}`;
}

/**
 * The main content planning prompt.
 */
export function buildPlanningPrompt(
  contentSummary: string,
  trendsSummary: string,
  videosCount: number,
  platforms: string[],
  recentRenders: string[],
): string {
  return `You are the content strategist for The Super Socializers — Bristol, Bath, Cardiff & Somerset's friendliest social community. 2,900+ Meetup members, 4.8/5 rating.

BRAND VOICE: Fun, energetic, warm, inclusive, slightly cheeky. Think: your most outgoing friend inviting you to something brilliant.

KEY MESSAGES (weave into EVERY piece of content):
1. 90% come alone — that's totally normal
2. Strictly platonic, zero pressure, zero drama
3. Something for everyone: hikes, drinks, games, festivals, speed friending
4. Bristol's friendliest social community (nearly 3,000 members)

${contentSummary}

${trendsSummary}

AVAILABLE COMPOSITIONS (use these IDs exactly):
TikTok/Reels (1080x1920):
- EventPromo-TikTok: event name, date, time, location, type. Best for upcoming events.
- Testimonial-TikTok: quote + name. Best for social proof.
- HookReel-TikTok: hookText + bodyLines[] + ctaText. Best for POV/narrative hooks.
- TextAnimation-TikTok: lines[] with colors. Best for punchy text-only messages.
- CountdownEvent-TikTok: event name, daysLeft, highlights[]. Best for urgency.
- StatsShowcase-TikTok: stats[] (value, suffix, label) + headline. Best for social proof numbers.
- POVReveal-TikTok: hookText + stages[] (captions) + photos. POV story format.
- BeforeAfter-TikTok: beforeText + afterText + photo. Transformation reveal.
- ListCountdown-TikTok: title + items[] (numbered list). "5 reasons..." format.
- StoryTime-TikTok: storyText + backgroundImage. Animated caption format.
- PhotoDump-TikTok: photos[] + title. Trending grid format.
- TransitionReveal-TikTok: hookText + revealText + photo. Mask reveal style.
- QuizPoll-TikTok: question + options[] + revealIndex. Engagement/comment-bait quiz format.
- MemberMilestone-TikTok: milestone number + celebration text. Shareworthy milestone content.
- WeeklyRecap-TikTok: weekLabel + events[] (name, attendees, photo). Weekly summary format.

Instagram Posts (1080x1080):
- EventPromo-Insta, PhotoMontage-Insta, StatsShowcase-Insta, PhotoDump-Insta

Instagram Stories (1080x1920):
- EventPromo-Story, Testimonial-Story, CountdownEvent-Story, StatsShowcase-Story, MemberMilestone-Story, WeeklyRecap-Story

${recentRenders.length > 0 ? `RECENT RENDERS (avoid repetition):\n${recentRenders.join("\n")}` : "No recent renders."}

ALGORITHM OPTIMIZATION RULES:
- Hook in first 2 seconds (text/visual that stops the scroll)
- Target 70%+ completion rate (keep videos under 15s)
- End with clear CTA
- 3-5 hashtags per post (mix always-on + trending + niche)
- Best posting times: Tue-Thu 2-5PM UK time
- Vary content types to avoid fatigue

Generate a content plan with EXACTLY ${videosCount} videos for platforms: ${platforms.join(", ")}.

For each video, provide:
{
  "id": "uuid",
  "compositionId": "exact composition ID from list above",
  "platform": "${platforms[0]}",
  "props": { /* exact props matching the composition's schema */ },
  "mediaAssets": ["content-item-id-first-8-chars"],
  "caption": "Instagram/TikTok caption text",
  "hashtags": ["#tag1", "#tag2"],
  "postingTime": "2026-03-01T17:00:00Z",
  "hookStrategy": "description of the hook approach",
  "trendRefs": [],
  "estimatedRetention": 75,
  "priority": 8
}

IMPORTANT for props:
- EventPromo: { eventName, eventDate, eventTime, eventLocation, eventType, memberCount: "2,900+" }
- Testimonial: { quote, name, memberSince? }
- HookReel: { hookText, bodyLines: string[], ctaText }
- TextAnimation: { lines: string[], backgroundColor: "#1A1A2E", textColor: "#FFFFFF", accentColor: "#FF6B35" }
- CountdownEvent: { eventName, daysLeft: number, spotsLeft?: number, eventType, highlights: string[] }
- StatsShowcase: { stats: [{value: number, suffix: string, label: string}], headline, ctaText }
- POVReveal: { hookText, stages: string[], ctaText, photos: string[] }
- BeforeAfter: { beforeText, afterText, revealText, backgroundImage? }
- ListCountdown: { title, items: string[], ctaText }
- StoryTime: { storyText, backgroundImage? }
- PhotoDump: { title, photos: string[], ctaText }
- TransitionReveal: { hookText, revealText, backgroundImage? }
- QuizPoll: { question, options: string[], revealIndex: number, revealLabel?, ctaText? }
- MemberMilestone: { milestone: number, suffix?, preText?, celebrationText?, thankYouText? }
- WeeklyRecap: { weekLabel, events: [{name, photo?, attendees?}], totalAttendees?, ctaText? }

Return ONLY a valid JSON object:
{
  "items": [ ... ],
  "strategy": "brief overall strategy description"
}`;
}
