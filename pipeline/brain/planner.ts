import { randomUUID } from "crypto";
import { getDb } from "../db/connection";
import { askClaude } from "../utils/claude-client";
import { log } from "../utils/logger";
import { getContentLibrary } from "../ingest/indexer";
import { getActiveTrends } from "../trends/trend-store";
import {
  buildPlanningPrompt,
  summarizeContentLibrary,
  summarizeTrends,
} from "./prompts";
import type { PipelineConfig, StageResult } from "../../types/pipeline";
import type { ContentPlan, ContentPlanItem } from "../../types/plan";

/**
 * Run the content brain: generate a content plan using Claude.
 */
export async function runPlan(
  config: PipelineConfig,
  dryRun: boolean = false,
): Promise<StageResult> {
  const db = getDb();

  // Gather inputs
  const content = getContentLibrary();
  if (content.length === 0) {
    return {
      stage: "plan",
      success: false,
      message: "No content in library. Run ingest first.",
      durationMs: 0,
    };
  }

  const trends = getActiveTrends();
  log.info(`Planning with ${content.length} content items and ${trends.length} trends`);

  // Get recent renders to avoid repetition
  const recentRenders = db
    .prepare(
      "SELECT composition_id, props_json FROM render_jobs WHERE status = 'completed' ORDER BY completed_at DESC LIMIT 10"
    )
    .all() as any[];

  const recentSummary = recentRenders.map(
    (r: any) => `  - ${r.composition_id}: ${JSON.parse(r.props_json).hookText || JSON.parse(r.props_json).eventName || "..."}`
  );

  // Build the prompt
  const contentSummary = summarizeContentLibrary(content);
  const trendsSummary = summarizeTrends(trends);

  const prompt = buildPlanningPrompt(
    contentSummary,
    trendsSummary,
    config.videosPerRun,
    config.platforms,
    recentSummary,
  );

  // Call Claude
  log.info("Asking Claude to generate content plan...");
  const response = askClaude({
    prompt,
    jsonMode: true,
    systemPrompt:
      "You are a viral content strategist. Generate content plans as valid JSON. Be creative with hooks and copy.",
  });

  if (!response.parsed) {
    return {
      stage: "plan",
      success: false,
      message: "Claude did not return valid JSON",
      durationMs: 0,
      data: response.text,
    };
  }

  const planData = response.parsed as any;
  const items: ContentPlanItem[] = (planData.items || []).map((item: any) => ({
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
  }));

  const plan: ContentPlan = {
    id: randomUUID(),
    generatedAt: new Date().toISOString(),
    planPeriod: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    items,
    strategy: planData.strategy || "",
  };

  // Log the plan
  log.info(`Content plan generated: ${items.length} videos`);
  log.divider();
  for (const item of items) {
    log.info(`  ${item.compositionId} [${item.platform}]`);
    log.info(`    Hook: ${item.hookStrategy}`);
    log.info(`    Post: ${item.postingTime}`);
    log.info(`    Hashtags: ${item.hashtags.slice(0, 5).join(" ")}`);
  }
  log.divider();
  log.info(`Strategy: ${plan.strategy}`);

  if (dryRun) {
    log.info("Dry run — plan NOT saved to database");
    return {
      stage: "plan",
      success: true,
      message: `Generated plan with ${items.length} videos (dry run)`,
      durationMs: 0,
      data: plan,
    };
  }

  // Save to database
  db.prepare(
    "INSERT INTO content_plans (id, plan_json, generated_at, status) VALUES (?, ?, ?, ?)"
  ).run(plan.id, JSON.stringify(plan), plan.generatedAt, "pending");

  return {
    stage: "plan",
    success: true,
    message: `Generated and saved plan with ${items.length} videos`,
    durationMs: 0,
    data: plan,
  };
}
