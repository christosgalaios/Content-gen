import { randomUUID } from "crypto";
import { getDb } from "../db/connection";
import { log } from "../utils/logger";
import { resolveAssets, markAssetsUsed } from "./asset-resolver";
import { validateProps } from "./schema-validator";
import type { PipelineConfig, StageResult } from "../../types/pipeline";
import type { ContentPlan, ContentPlanItem } from "../../types/plan";

interface BuildResult {
  planItem: ContentPlanItem;
  resolvedProps: Record<string, unknown>;
  valid: boolean;
}

/**
 * Run the build stage: validate props and resolve assets.
 */
export async function runBuild(config: PipelineConfig): Promise<StageResult> {
  const db = getDb();

  // Get the latest pending plan
  const planRow = db
    .prepare(
      "SELECT * FROM content_plans WHERE status = 'pending' ORDER BY generated_at DESC LIMIT 1"
    )
    .get() as any;

  if (!planRow) {
    return {
      stage: "build",
      success: false,
      message: "No pending content plan found. Run plan stage first.",
      durationMs: 0,
    };
  }

  const plan: ContentPlan = JSON.parse(planRow.plan_json);
  log.info(`Building props for plan: ${plan.items.length} items`);

  const results: BuildResult[] = [];
  let validCount = 0;

  for (let i = 0; i < plan.items.length; i++) {
    const item = plan.items[i];
    log.progress(i + 1, plan.items.length, `Building: ${item.compositionId}`);

    // Resolve media assets
    const resolvedAssetPaths = resolveAssets(item.mediaAssets);

    // Merge resolved asset paths into props
    const resolvedProps = { ...item.props };

    // Auto-inject background images if the composition supports it
    if (resolvedAssetPaths.length > 0) {
      if (!resolvedProps.backgroundImage) {
        resolvedProps.backgroundImage = resolvedAssetPaths[0];
      }
      if ("images" in resolvedProps && !Array.isArray(resolvedProps.images)) {
        resolvedProps.images = resolvedAssetPaths;
      }
      if ("photos" in resolvedProps && !Array.isArray(resolvedProps.photos)) {
        resolvedProps.photos = resolvedAssetPaths;
      }
    }

    // Validate
    const validation = validateProps(item.compositionId, resolvedProps);

    results.push({
      planItem: item,
      resolvedProps,
      valid: validation.valid,
    });

    if (validation.valid) {
      validCount++;

      // Create render job
      db.prepare(`
        INSERT INTO render_jobs (id, plan_id, plan_item_id, composition_id, platform, props_json, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `).run(
        randomUUID(),
        plan.id,
        item.id,
        item.compositionId,
        item.platform,
        JSON.stringify(resolvedProps),
      );

      // Mark assets as used
      markAssetsUsed(item.mediaAssets);
    } else {
      log.warn(`Skipping ${item.compositionId}: validation failed`);
    }
  }

  // Update plan status
  db.prepare("UPDATE content_plans SET status = 'rendering' WHERE id = ?").run(
    plan.id
  );

  return {
    stage: "build",
    success: validCount > 0,
    message: `Built ${validCount}/${plan.items.length} items (${plan.items.length - validCount} skipped)`,
    durationMs: 0,
  };
}
