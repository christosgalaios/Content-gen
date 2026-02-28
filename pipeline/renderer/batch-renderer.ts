import * as path from "path";
import * as fs from "fs";
import { getDb } from "../db/connection";
import { log } from "../utils/logger";
import { writeOutputMetadata } from "./output-manager";
import type { PipelineConfig, StageResult } from "../../types/pipeline";

/**
 * Run the batch renderer: renders all pending render jobs using Remotion.
 */
export async function runRender(config: PipelineConfig): Promise<StageResult> {
  const db = getDb();

  // Get pending render jobs
  const jobs = db
    .prepare("SELECT * FROM render_jobs WHERE status = 'pending' ORDER BY rowid")
    .all() as any[];

  if (jobs.length === 0) {
    return {
      stage: "render",
      success: true,
      message: "No pending render jobs",
      durationMs: 0,
    };
  }

  log.info(`Rendering ${jobs.length} videos...`);

  // Dynamic imports for Remotion (ESM modules)
  let bundle: any, selectComposition: any, renderMedia: any;
  try {
    const bundler = await import("@remotion/bundler");
    const renderer = await import("@remotion/renderer");
    bundle = bundler.bundle;
    selectComposition = renderer.selectComposition;
    renderMedia = renderer.renderMedia;
  } catch (err: any) {
    return {
      stage: "render",
      success: false,
      message: `Failed to load Remotion renderer: ${err.message}. Run: npm install @remotion/bundler @remotion/renderer`,
      durationMs: 0,
    };
  }

  // Bundle once for all renders
  log.info("Bundling Remotion project...");
  const entryPoint = path.resolve(__dirname, "../../src/index.ts");
  let bundleLocation: string;
  try {
    bundleLocation = await bundle({
      entryPoint,
      onProgress: (progress: number) => {
        if (progress % 25 === 0) log.progress(progress, 100, "Bundling");
      },
    });
    log.success("Bundle complete");
  } catch (err: any) {
    return {
      stage: "render",
      success: false,
      message: `Bundle failed: ${err.message}`,
      durationMs: 0,
    };
  }

  // Create output directory
  const dateDir = new Date().toISOString().slice(0, 10);
  const outBase = path.resolve(config.outputFolder, dateDir);

  let rendered = 0;
  let failed = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const props = JSON.parse(job.props_json);

    log.progress(i + 1, jobs.length, `Rendering: ${job.composition_id}`);

    // Mark as rendering
    db.prepare("UPDATE render_jobs SET status = 'rendering', started_at = ? WHERE id = ?")
      .run(new Date().toISOString(), job.id);

    try {
      // Select composition
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: job.composition_id,
        inputProps: props,
      });

      // Create platform-specific output directory
      const platformDir = path.join(outBase, job.platform);
      if (!fs.existsSync(platformDir)) {
        fs.mkdirSync(platformDir, { recursive: true });
      }

      // Generate output filename
      const slug = job.composition_id.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const num = String(i + 1).padStart(3, "0");
      const outputPath = path.join(platformDir, `${num}-${slug}.mp4`);

      // Render
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: config.render.codec as any,
        outputLocation: outputPath,
        inputProps: props,
        crf: config.render.crf,
        concurrency: config.render.concurrency,
      });

      // Write metadata file
      const planRow = db
        .prepare("SELECT plan_json FROM content_plans WHERE id = ?")
        .get(job.plan_id) as any;
      const plan = JSON.parse(planRow.plan_json);
      const planItem = plan.items.find((item: any) => item.id === job.plan_item_id);

      if (planItem) {
        writeOutputMetadata(outputPath, {
          compositionId: job.composition_id,
          platform: job.platform,
          caption: planItem.caption || "",
          hashtags: planItem.hashtags || [],
          postingTime: planItem.postingTime || "",
          hookStrategy: planItem.hookStrategy || "",
          renderedAt: new Date().toISOString(),
        });
      }

      // Mark as completed
      db.prepare(
        "UPDATE render_jobs SET status = 'completed', output_path = ?, completed_at = ? WHERE id = ?"
      ).run(outputPath, new Date().toISOString(), job.id);

      rendered++;
      log.success(`Rendered: ${outputPath}`);
    } catch (err: any) {
      failed++;
      db.prepare(
        "UPDATE render_jobs SET status = 'failed', error_message = ?, completed_at = ? WHERE id = ?"
      ).run(err.message, new Date().toISOString(), job.id);
      log.error(`Failed to render ${job.composition_id}: ${err.message}`);
    }
  }

  // Mark plan as completed
  if (rendered > 0) {
    const planId = jobs[0].plan_id;
    db.prepare("UPDATE content_plans SET status = 'completed' WHERE id = ?").run(planId);
  }

  return {
    stage: "render",
    success: rendered > 0,
    message: `Rendered ${rendered}/${jobs.length} videos (${failed} failed)`,
    durationMs: 0,
  };
}
