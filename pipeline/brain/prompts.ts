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

  // Show top items with usage count so Claude can avoid overusing assets
  const topItems = items
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 20)
    .map(
      (i) =>
        `  - [${i.id.slice(0, 8)}] ${i.fileName} (${i.categories.join(", ")}) quality:${i.qualityScore} people:${i.peopleCount || "?"} used:${i.usageCount}x`
    )
    .join("\n");

  // Show least-used assets so Claude can rotate them in
  const leastUsed = items
    .filter((i) => i.qualityScore >= 50)
    .sort((a, b) => a.usageCount - b.usageCount || b.qualityScore - a.qualityScore)
    .slice(0, 10)
    .map(
      (i) =>
        `  - [${i.id.slice(0, 8)}] ${i.fileName} (${i.categories.join(", ")}) quality:${i.qualityScore} used:${i.usageCount}x`
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
${topItems}

Least-used items (prefer these to rotate assets):
${leastUsed}`;
}

/**
 * Generate a trends summary for Claude.
 */
export function summarizeTrends(trends: Trend[]): string {
  if (trends.length === 0) return "No trending data available. Use evergreen content strategies.";

  const byCategory: Record<string, Trend[]> = {};
  for (const t of trends) {
    (byCategory[t.category] ??= []).push(t);
  }

  const sections = Object.entries(byCategory)
    .map(
      ([cat, items]) =>
        `  ${cat.toUpperCase()}:\n${items
          .slice(0, 5)
          .map(
            (t) =>
              `    - ${t.name}: ${t.description} (relevance:${t.relevanceScore}, popularity:${t.popularityScore})`
          )
          .join("\n")}`
    )
    .join("\n\n");

  return `CURRENT TRENDS (${trends.length} total):
${sections}

Use trends with relevance >= 60 to inform content angles. Don't force-fit low-relevance trends.`;
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
- First person plural ("we", "us") — never "the group"
- Address reader as "you"
- Short sentences, punchy openers
- Emojis: max 3-4 per post. Never in first line on TikTok.

KEY MESSAGES (weave at least one into EVERY piece of content):
1. 90% come alone — that's totally normal
2. Strictly platonic, zero pressure, zero drama
3. Something for everyone: hikes, drinks, games, festivals, speed friending
4. Bristol's friendliest social community (nearly 3,000 members)

${contentSummary}

${trendsSummary}

AVAILABLE COMPOSITIONS (use these IDs exactly):
TikTok/Reels (1080x1920, 9:16 vertical):
- EventPromo-TikTok: event name, date, time, location, type. Best for upcoming events.
- Testimonial-TikTok: quote + name. Best for social proof.
- HookReel-TikTok: hookText + bodyLines[] + ctaText. Best for POV/narrative hooks. HIGH ENGAGEMENT.
- TextAnimation-TikTok: lines[] with colors. Best for punchy text-only messages.
- CountdownEvent-TikTok: event name, daysLeft, highlights[]. Best for urgency/FOMO.
- StatsShowcase-TikTok: stats[] (value, suffix, label) + headline. Best for social proof numbers.
- POVReveal-TikTok: hookText + stages[] (captions) + photos. POV story format. HIGH ENGAGEMENT.
- BeforeAfter-TikTok: beforeText + afterText + photo. Transformation reveal. HIGH ENGAGEMENT.
- ListCountdown-TikTok: title + items[] (numbered list). "5 reasons..." format.
- StoryTime-TikTok: storyText + backgroundImage. Animated caption format. HIGH ENGAGEMENT.
- PhotoDump-TikTok: photos[] + title. Trending grid format.
- TransitionReveal-TikTok: hookText + revealText + photo. Mask reveal style. HIGH ENGAGEMENT.
- QuizPoll-TikTok: question + options[] + revealIndex. Comment-bait quiz. HIGH ENGAGEMENT.
- MemberMilestone-TikTok: milestone number + celebration text. Shareworthy milestone content.
- WeeklyRecap-TikTok: weekLabel + events[] (name, attendees, photo). Weekly summary format.

Instagram Posts (1080x1080, 1:1 square):
- EventPromo-Insta, PhotoMontage-Insta, StatsShowcase-Insta, PhotoDump-Insta

Instagram Stories (1080x1920, 9:16 vertical):
- EventPromo-Story, Testimonial-Story, CountdownEvent-Story, StatsShowcase-Story, MemberMilestone-Story, WeeklyRecap-Story, HookReel-Story, BeforeAfter-Story, ListCountdown-Story, QuizPoll-Story, StoryTime-Story, TransitionReveal-Story

${recentRenders.length > 0 ? `RECENT RENDERS (avoid repetition — do NOT reuse these compositions or similar hooks):\n${recentRenders.join("\n")}` : "No recent renders — full creative freedom."}

CONTENT STRATEGY RULES:
1. VARIETY: Never use the same base composition more than once in a batch. If you need ${videosCount} videos, use ${videosCount} different compositions.
2. HOOK QUALITY: The first 2 seconds determine if someone watches. Every hook must be specific, surprising, or relatable. Avoid generic hooks like "Check this out" or "You need to see this".
3. CONTENT MIX: Aim for this ratio across a batch:
   - 40% engagement-drivers (HookReel, QuizPoll, BeforeAfter, TransitionReveal, POVReveal)
   - 30% social-proof/community (Testimonial, StatsShowcase, MemberMilestone, StoryTime)
   - 30% event-promotion/recaps (EventPromo, CountdownEvent, WeeklyRecap, PhotoDump)
4. CTA VARIETY: Rotate between these CTAs — don't repeat the same one:
   - "Come alone. Leave with friends."
   - "Join 2,900+ members on Meetup"
   - "Link in bio"
   - "Your next adventure starts here"
   - "Comment below!"
   - "Tag someone who needs this"
5. HASHTAG STRATEGY: Each post should have 5-8 hashtags:
   - Always include: #TheSuperSocializers #bristolsocial #meetnewpeoplebristol
   - Add 2-3 from: #hikingbristol #bristolwalks #newtobristol #socialcirclesbristol
   - Add 1-2 niche: #makingfriendsasanadult #adultfriendship #speedfriending #thingstodoinbristol
   - Rotate location tags: #bath #cardiff #weston
6. POSTING CADENCE: Space posts 6-12 hours apart. Best times: Tue-Thu 2-5PM UK, weekends 10AM-12PM UK.
7. ASSET ROTATION: Prefer least-used content items. Never use the same photo in two videos.
8. TREND INTEGRATION: If a trend has relevance >= 70, build one video around it. Otherwise use evergreen angles.

Generate a content plan with EXACTLY ${videosCount} videos for platforms: ${platforms.join(", ")}.

For each video, provide:
{
  "id": "uuid",
  "compositionId": "exact composition ID from list above",
  "platform": "${platforms[0]}",
  "props": { /* exact props matching the composition's schema */ },
  "mediaAssets": ["content-item-id-first-8-chars"],
  "caption": "Instagram/TikTok caption text (2-3 lines, brand voice, with line breaks)",
  "hashtags": ["#tag1", "#tag2"],
  "postingTime": "2026-03-01T17:00:00Z",
  "hookStrategy": "specific description of why this hook stops the scroll",
  "trendRefs": [],
  "estimatedRetention": 75,
  "priority": 8
}

PROP SCHEMAS (must match exactly):
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
  "strategy": "2-3 sentence description of the strategic approach and why these compositions were chosen"
}`;
}
