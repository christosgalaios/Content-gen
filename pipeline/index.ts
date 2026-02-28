import { log } from "./utils/logger";
import { loadConfig } from "./config";
import { closeDb } from "./db/connection";
import type { PipelineStage, StageResult } from "../types/pipeline";

// Stage imports
import { runIngest } from "./ingest/indexer";
import { runTrends } from "./trends/trend-store";
import { runPlan } from "./brain/planner";
import { runBuild } from "./builder/props-builder";
import { runRender } from "./renderer/batch-renderer";
import { runEventIngest, runEventPlan } from "./brain/event-planner";

interface CliArgs {
  stage: PipelineStage;
  videos: number | null;
  platform: string | null;
  dryRun: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    stage: "all",
    videos: null,
    platform: null,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--stage":
        result.stage = args[++i] as PipelineStage;
        break;
      case "--videos":
        result.videos = parseInt(args[++i], 10);
        break;
      case "--platform":
        result.platform = args[++i];
        break;
      case "--dry-run":
        result.dryRun = true;
        break;
    }
  }

  return result;
}

async function runStage(
  name: PipelineStage,
  fn: () => Promise<StageResult>,
): Promise<StageResult> {
  log.stage(name);
  const start = Date.now();
  try {
    const result = await fn();
    result.durationMs = Date.now() - start;
    if (result.success) {
      log.success(`${name} completed in ${(result.durationMs / 1000).toFixed(1)}s`);
    } else {
      log.error(`${name} failed: ${result.message}`);
    }
    return result;
  } catch (err: any) {
    const durationMs = Date.now() - start;
    log.error(`${name} threw: ${err.message}`);
    return { stage: name, success: false, message: err.message, durationMs };
  }
}

async function main() {
  const args = parseArgs();
  const config = loadConfig();

  // Override config with CLI args
  if (args.videos) config.videosPerRun = args.videos;
  if (args.platform) config.platforms = [args.platform as any];

  const isEventMode =
    args.stage === "events" ||
    args.stage === "event-plan" ||
    args.stage === "events-all";

  console.log(`
╔══════════════════════════════════════════╗
║   SOCIALISE AUTOPILOT CONTENT GENERATOR  ║
║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║   Stage: ${args.stage.padEnd(10)}                      ║
║   Videos: ${(args.videos || config.videosPerRun).toString().padEnd(9)}                     ║
║   Dry run: ${args.dryRun ? "yes" : "no "}                           ║
║   Mode: ${isEventMode ? "event-driven" : "generic     "}                    ║
╚══════════════════════════════════════════╝
`);

  const results: StageResult[] = [];

  const shouldRun = (stage: PipelineStage) =>
    args.stage === "all" || args.stage === stage;

  const shouldRunEvent = (stage: PipelineStage) =>
    args.stage === "events-all" || args.stage === stage;

  try {
    // ═══════════════════════════════════════
    // EVENT-DRIVEN PIPELINE
    // ═══════════════════════════════════════
    if (isEventMode) {
      // Stage E1: Scrape Meetup events
      if (shouldRunEvent("events") || args.stage === "events-all") {
        results.push(
          await runStage("events", () => runEventIngest(config))
        );
        if (
          !results[results.length - 1].success &&
          args.stage === "events"
        ) {
          return;
        }
      }

      // Stage E2: Scrape trends (for matching to events)
      if (args.stage === "events-all") {
        results.push(await runStage("trends", () => runTrends(config)));
      }

      // Stage E3: Generate per-event content plans
      if (
        shouldRunEvent("event-plan") ||
        args.stage === "events-all"
      ) {
        results.push(
          await runStage("event-plan", () =>
            runEventPlan(config, args.dryRun)
          )
        );
        if (args.dryRun) {
          log.info("Dry run — skipping build and render stages");
          return;
        }
      }

      // Stage E4: Build props
      if (args.stage === "events-all" && !args.dryRun) {
        results.push(await runStage("build", () => runBuild(config)));
      }

      // Stage E5: Render
      if (args.stage === "events-all" && !args.dryRun) {
        results.push(await runStage("render", () => runRender(config)));
      }
    }

    // ═══════════════════════════════════════
    // GENERIC PIPELINE (original flow)
    // ═══════════════════════════════════════
    else {
      // Stage 1: Ingest
      if (shouldRun("ingest")) {
        results.push(await runStage("ingest", () => runIngest(config)));
        if (!results[results.length - 1].success && args.stage === "ingest") {
          return;
        }
      }

      // Stage 2: Trends
      if (shouldRun("trends")) {
        results.push(await runStage("trends", () => runTrends(config)));
      }

      // Stage 3: Plan
      if (shouldRun("plan")) {
        results.push(await runStage("plan", () => runPlan(config, args.dryRun)));
        if (args.dryRun) {
          log.info("Dry run — skipping build and render stages");
          return;
        }
      }

      // Stage 4: Build
      if (shouldRun("build") && !args.dryRun) {
        results.push(await runStage("build", () => runBuild(config)));
      }

      // Stage 5: Render
      if (shouldRun("render") && !args.dryRun) {
        results.push(await runStage("render", () => runRender(config)));
      }
    }

    // Summary
    log.divider();
    log.info("Pipeline complete:");
    for (const r of results) {
      const icon = r.success ? "✓" : "✗";
      log.info(`  ${icon} ${r.stage} (${(r.durationMs / 1000).toFixed(1)}s)`);
    }
  } finally {
    closeDb();
  }
}

main().catch((err) => {
  log.error(`Fatal: ${err.message}`);
  closeDb();
  process.exit(1);
});
