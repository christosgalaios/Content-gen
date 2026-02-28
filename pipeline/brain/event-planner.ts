import { randomUUID } from "crypto";
import { getDb } from "../db/connection";
import { askClaude } from "../utils/claude-client";
import { log } from "../utils/logger";
import { getContentLibrary } from "../ingest/indexer";
import { getActiveTrends } from "../trends/trend-store";
import { scrapeMeetupEvents } from "../trends/meetup-scraper";
import {
  getRelevantTrends,
  getRecommendedCompositions,
  daysUntilEvent,
  getPromotableEvents,
} from "../trends/event-matcher";
import {
  buildEventPrompt,
  summarizeContentLibrary,
} from "./prompts";
import { compositionNeedsPhotos } from "./composition-picker";
import type { PipelineConfig, StageResult } from "../../types/pipeline";
import type { ContentPlan, ContentPlanItem } from "../../types/plan";
import type { MeetupEvent } from "../../types/event";

/**
 * Scrape Meetup events and store them in the database.
 */
export async function runEventIngest(
  _config: PipelineConfig
): Promise<StageResult> {
  const startTime = Date.now();
  const db = getDb();

  log.info("Scraping upcoming Meetup events...");
  const events = await scrapeMeetupEvents();

  if (events.length === 0) {
    return {
      stage: "trends",
      success: false,
      message: "No events scraped from Meetup",
      durationMs: Date.now() - startTime,
    };
  }

  // Upsert events into database
  const upsertStmt = db.prepare(`
    INSERT INTO events (meetup_id, title, description, date_time, end_time, location,
      city, event_type, capacity, attendees, image_url, meetup_url, scraped_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(meetup_id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      attendees = excluded.attendees,
      capacity = excluded.capacity,
      scraped_at = excluded.scraped_at
  `);

  const insertAll = db.transaction(() => {
    for (const event of events) {
      upsertStmt.run(
        event.meetupId,
        event.title,
        event.description,
        event.dateTime,
        event.endTime,
        event.location,
        event.city,
        event.eventType,
        event.capacity,
        event.attendees,
        event.imageUrl,
        event.meetupUrl,
        event.scrapedAt,
      );
    }
  });

  insertAll();

  // Log upcoming events
  const promotable = getPromotableEvents(events, 21);
  log.info(`${events.length} total events scraped, ${promotable.length} promotable (next 21 days):`);
  for (const event of promotable.slice(0, 10)) {
    const days = daysUntilEvent(event);
    log.info(
      `  ${event.title} — ${event.city || "?"} — ${days}d away — ${event.attendees} going — ${event.eventType}`
    );
  }

  return {
    stage: "trends",
    success: true,
    message: `Scraped ${events.length} events, ${promotable.length} promotable`,
    durationMs: Date.now() - startTime,
    data: events,
  };
}

/**
 * Load events from the database.
 */
export function getStoredEvents(): MeetupEvent[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM events ORDER BY date_time ASC")
    .all() as any[];

  return rows.map((row) => ({
    meetupId: row.meetup_id,
    title: row.title,
    description: row.description,
    dateTime: row.date_time,
    endTime: row.end_time,
    location: row.location,
    city: row.city,
    eventType: row.event_type,
    capacity: row.capacity,
    attendees: row.attendees,
    imageUrl: row.image_url,
    meetupUrl: row.meetup_url,
    scrapedAt: row.scraped_at,
  }));
}

/**
 * Run event-driven content planning.
 * For each upcoming event, generate a targeted promotional batch.
 */
export async function runEventPlan(
  config: PipelineConfig,
  dryRun: boolean = false,
): Promise<StageResult> {
  const startTime = Date.now();
  const db = getDb();

  // Load events from DB
  const allEvents = getStoredEvents();
  const promotable = getPromotableEvents(allEvents, 21);

  if (promotable.length === 0) {
    return {
      stage: "plan",
      success: false,
      message: "No upcoming events to promote. Run event ingestion first.",
      durationMs: Date.now() - startTime,
    };
  }

  // Load content library and trends
  const content = getContentLibrary();
  const allTrends = getActiveTrends();
  const contentSummary = content.length > 0
    ? summarizeContentLibrary(content)
    : "No content library available. Generate text-only compositions.";

  // Get recent renders to avoid repetition
  const recentRenders = db
    .prepare(
      "SELECT composition_id, props_json FROM render_jobs WHERE status = 'completed' ORDER BY completed_at DESC LIMIT 20"
    )
    .all() as any[];

  const recentSummary = recentRenders.slice(0, 10).map((r: any) => {
    const props = JSON.parse(r.props_json);
    const label =
      props.hookText || props.eventName || props.title || props.question || "...";
    return `  - ${r.composition_id}: "${label}"`;
  });

  // Check which events already have plans
  const existingPlans = db
    .prepare("SELECT event_meetup_id FROM event_plans WHERE status != 'expired'")
    .all() as any[];
  const plannedEventIds = new Set(
    existingPlans.map((p: any) => p.event_meetup_id)
  );

  // Filter to events without plans
  const unplannedEvents = promotable.filter(
    (e) => !plannedEventIds.has(e.meetupId)
  );

  if (unplannedEvents.length === 0) {
    log.info("All promotable events already have content plans");
    return {
      stage: "plan",
      success: true,
      message: `All ${promotable.length} promotable events already have plans`,
      durationMs: Date.now() - startTime,
    };
  }

  log.info(
    `Planning content for ${unplannedEvents.length} events (${promotable.length - unplannedEvents.length} already planned)`
  );

  const allPlans: ContentPlan[] = [];

  for (const event of unplannedEvents) {
    const days = daysUntilEvent(event);
    log.divider();
    log.info(
      `Planning for: ${event.title} (${days}d away, ${event.city}, ${event.eventType})`
    );

    // Get relevant trends for this event type
    const relevantTrends = getRelevantTrends(event.eventType, allTrends);
    const recommendedCompositions = getRecommendedCompositions(event.eventType);

    log.info(
      `  ${relevantTrends.length} relevant trends, ${recommendedCompositions.length} recommended compositions`
    );

    // Determine how many videos to generate based on days until event
    const videosForEvent = days <= 1 ? 2 : days <= 3 ? 3 : days <= 7 ? 4 : 5;

    // Build event-specific prompt
    const prompt = buildEventPrompt(
      event,
      days,
      relevantTrends,
      recommendedCompositions,
      contentSummary,
      videosForEvent,
      config.platforms,
      recentSummary,
    );

    // Call Claude
    log.info(`  Asking Claude to plan ${videosForEvent} videos...`);
    const response = askClaude({
      prompt,
      jsonMode: true,
      systemPrompt:
        "You are a viral social media content strategist specialising in short-form video for event promotion. " +
        "Generate content plans as valid JSON. " +
        "Every video must promote the specific event with scroll-stopping hooks. " +
        "Write hooks that are specific to this event — never generic. " +
        "Every video must have a clear emotional arc: hook → tension/value → CTA. " +
        "Prioritise content that drives RSVPs, comments, and shares.",
    });

    if (!response.parsed) {
      log.warn(
        `  Failed to get plan for "${event.title}": Claude did not return valid JSON`
      );
      continue;
    }

    const planData = response.parsed as any;
    const items: ContentPlanItem[] = (planData.items || []).map(
      (item: any) => ({
        id: item.id || randomUUID(),
        compositionId: item.compositionId,
        platform: item.platform,
        props: item.props || {},
        mediaAssets: item.mediaAssets || [],
        caption: item.caption || "",
        hashtags: item.hashtags || [],
        postingTime: item.postingTime || new Date().toISOString(),
        hookStrategy: item.hookStrategy || "",
        trendRefs: item.trendRefs || [],
        estimatedRetention: item.estimatedRetention || 70,
        priority: item.priority || 5,
      })
    );

    // Validate photo dependencies
    for (const item of items) {
      if (
        compositionNeedsPhotos(item.compositionId) &&
        item.mediaAssets.length === 0
      ) {
        log.warn(
          `  ${item.compositionId} needs photos but has no mediaAssets`
        );
      }
    }

    const plan: ContentPlan = {
      id: randomUUID(),
      generatedAt: new Date().toISOString(),
      planPeriod: {
        start: new Date().toISOString(),
        end: event.dateTime,
      },
      items,
      strategy: planData.strategy || "",
    };

    // Log the plan
    log.info(`  Plan generated: ${items.length} videos`);
    for (const item of items) {
      log.info(
        `    ${item.compositionId} [${item.platform}] — priority:${item.priority}`
      );
      log.info(`      Hook: ${item.hookStrategy}`);
      log.info(`      Post: ${item.postingTime}`);
    }
    log.info(`  Strategy: ${plan.strategy}`);

    if (!dryRun) {
      // Save plan to database
      db.prepare(
        "INSERT INTO content_plans (id, plan_json, generated_at, status) VALUES (?, ?, ?, ?)"
      ).run(plan.id, JSON.stringify(plan), plan.generatedAt, "pending");

      // Link plan to event
      db.prepare(
        "INSERT INTO event_plans (id, event_meetup_id, plan_id, status, created_at) VALUES (?, ?, ?, ?, ?)"
      ).run(
        randomUUID(),
        event.meetupId,
        plan.id,
        "pending",
        new Date().toISOString()
      );
    }

    allPlans.push(plan);

    // Add recently-used compositions from this plan to avoid repetition in next event
    for (const item of items) {
      recentSummary.push(
        `  - ${item.compositionId}: "${item.props.hookText || item.props.eventName || "..."}"`
      );
    }
  }

  const totalVideos = allPlans.reduce((sum, p) => sum + p.items.length, 0);

  if (dryRun) {
    log.info(
      `Dry run — ${allPlans.length} event plans with ${totalVideos} total videos NOT saved`
    );
  }

  return {
    stage: "plan",
    success: true,
    message: `Generated ${allPlans.length} event plans with ${totalVideos} total videos${dryRun ? " (dry run)" : ""}`,
    durationMs: Date.now() - startTime,
    data: allPlans,
  };
}
